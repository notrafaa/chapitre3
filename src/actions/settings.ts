"use server";

// ===========================================================================
//  Server Actions admin : réglages du site (liens sociaux, textes, email).
// ===========================================================================

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SETTINGS_KEYS } from "@/lib/constants";
import type { ActionResult, Json } from "@/types";

const urlOrEmpty = z.string().trim().url().optional().or(z.literal(""));

const socialSchema = z.object({
  tiktok: urlOrEmpty,
  instagram: urlOrEmpty,
  discord: urlOrEmpty,
  x: urlOrEmpty,
  youtube: urlOrEmpty,
  email: z.string().trim().email().optional().or(z.literal("")),
});

async function upsertSetting(key: string, value: Json): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) {
    console.error("upsertSetting:", error.message);
    return false;
  }
  return true;
}

export async function updateSocialLinksAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }

  const parsed = socialSchema.safeParse({
    tiktok: formData.get("tiktok") ?? "",
    instagram: formData.get("instagram") ?? "",
    discord: formData.get("discord") ?? "",
    x: formData.get("x") ?? "",
    youtube: formData.get("youtube") ?? "",
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    return { success: false, message: "Vérifiez les liens (URLs valides requises)." };
  }

  const ok = await upsertSetting(SETTINGS_KEYS.socialLinks, parsed.data as Json);
  await upsertSetting(SETTINGS_KEYS.contactEmail, parsed.data.email || "");

  if (!ok) return { success: false, message: "Erreur lors de la sauvegarde." };

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/a-propos");
  revalidatePath("/projets");
  revalidatePath("/admin/settings");
  return { success: true, message: "Réglages enregistrés." };
}

export async function updateHomeHeroAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }

  const title = (formData.get("title") as string)?.trim() ?? "";
  const paragraph = (formData.get("paragraph") as string)?.trim() ?? "";

  const ok = await upsertSetting(SETTINGS_KEYS.homeHero, { title, paragraph });
  if (!ok) return { success: false, message: "Erreur lors de la sauvegarde." };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true, message: "Textes enregistrés." };
}

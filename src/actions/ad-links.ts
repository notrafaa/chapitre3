"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { adLinkSchema, flattenFieldErrors } from "@/lib/validations";
import type { ActionResult } from "@/types";

function fail(message: string, fieldErrors?: Record<string, string[]>): ActionResult {
  return { success: false, message, fieldErrors };
}

export async function createAdLinkAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return fail("Accès non autorisé.");
  }

  const parsed = adLinkSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    destination_url: formData.get("destination_url") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return fail("Veuillez corriger les champs en surbrillance.", flattenFieldErrors(parsed.error));
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("ad_links").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    destination_url: parsed.data.destination_url,
    description: parsed.data.description || null,
  });

  if (error) {
    if (error.code === "23505") {
      return fail("Ce slug est déjà utilisé.", { slug: ["Choisissez un autre slug."] });
    }
    console.error("createAdLinkAction:", error.message);
    return fail("Erreur lors de la création du lien.");
  }

  revalidatePath("/admin/ad-links");
  return { success: true, message: "Lien publicitaire créé." };
}

export async function toggleAdLinkAction(id: string, active: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return fail("Accès non autorisé.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("ad_links").update({ active }).eq("id", id);
  if (error) {
    console.error("toggleAdLinkAction:", error.message);
    return fail("Erreur lors de la mise à jour du lien.");
  }

  revalidatePath("/admin/ad-links");
  return { success: true, message: active ? "Lien activé." : "Lien désactivé." };
}

export async function deleteAdLinkAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return fail("Accès non autorisé.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("ad_links").delete().eq("id", id);
  if (error) {
    console.error("deleteAdLinkAction:", error.message);
    return fail("Erreur lors de la suppression du lien.");
  }

  revalidatePath("/admin/ad-links");
  return { success: true, message: "Lien supprimé." };
}

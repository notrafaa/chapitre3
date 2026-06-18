// ===========================================================================
//  Lecture des réglages du site (liens sociaux, textes principaux).
//  Client anon SANS cookies → compatible ISR / génération statique.
// ===========================================================================

import "server-only";
import { createAnonClient } from "@/lib/supabase/anon";
import { SETTINGS_KEYS } from "@/lib/constants";
import type { SiteSetting, SocialLinks } from "@/types";

const DEFAULT_SOCIAL: SocialLinks = {};

/** Récupère un réglage par clé. */
export async function getSetting(key: string): Promise<SiteSetting | null> {
  const supabase = createAnonClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", key)
      .maybeSingle();
    return data ?? null;
  } catch (e) {
    console.error("getSetting:", e);
    return null;
  }
}

/** Liens sociaux configurables. */
export async function getSocialLinks(): Promise<SocialLinks> {
  const setting = await getSetting(SETTINGS_KEYS.socialLinks);
  if (!setting || typeof setting.value !== "object" || setting.value === null) {
    return DEFAULT_SOCIAL;
  }
  return { ...DEFAULT_SOCIAL, ...(setting.value as SocialLinks) };
}

/** Adresse email de contact professionnelle. */
export async function getContactEmail(): Promise<string | null> {
  const setting = await getSetting(SETTINGS_KEYS.contactEmail);
  if (setting && typeof setting.value === "string") return setting.value || null;
  const social = await getSocialLinks();
  return social.email ?? null;
}

/** Tous les réglages (admin). */
export async function getAllSettings(): Promise<SiteSetting[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("site_settings").select("*").order("key");
    return data ?? [];
  } catch (e) {
    console.error("getAllSettings:", e);
    return [];
  }
}

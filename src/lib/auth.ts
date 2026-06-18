// ===========================================================================
//  Vérification d'identité et d'autorisation côté serveur.
//  La garde middleware protège l'accès aux routes /admin, mais chaque action
//  sensible revérifie l'autorisation côté serveur (défense en profondeur).
// ===========================================================================

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/** Renvoie l'utilisateur connecté, ou null. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Indique si l'utilisateur connecté est un administrateur autorisé. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}

/**
 * Garde pour les Server Components admin : redirige si l'accès est refusé.
 * Renvoie l'utilisateur autorisé.
 */
export async function requireAdmin(): Promise<User> {
  // Configuration Supabase absente : on renvoie vers la connexion plutôt
  // que de provoquer une erreur serveur.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/admin/login?error=config");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) redirect("/admin/login?error=unauthorized");

  return user;
}

/**
 * Garde pour les Server Actions : lève une erreur si l'accès est refusé.
 * À appeler en tête de toute action de mutation admin.
 */
export async function assertAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non authentifié.");

  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) throw new Error("Accès non autorisé.");

  return user;
}

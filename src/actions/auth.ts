"use server";

// ===========================================================================
//  Server Actions d'authentification admin (Supabase Auth).
// ===========================================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, flattenFieldErrors } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Identifiants invalides.",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { success: false, message: "Email ou mot de passe incorrect." };
  }

  // Vérification d'autorisation : l'utilisateur doit être un admin.
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Ce compte n'est pas autorisé à accéder à l'administration.",
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

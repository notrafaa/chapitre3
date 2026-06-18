"use server";

// ===========================================================================
//  Server Actions admin : mise à jour du statut des données entrantes
//  (idées proposées, messages de contact) + suppression.
// ===========================================================================

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ActionResult,
  ContactStatus,
  SubmissionStatus,
} from "@/types";

export async function updateSubmissionStatusAction(
  id: string,
  status: SubmissionStatus,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("project_submissions")
    .update({ status })
    .eq("id", id);
  if (error) return { success: false, message: "Erreur." };
  revalidatePath("/admin/submissions");
  return { success: true, message: "Statut mis à jour." };
}

export async function deleteSubmissionAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("project_submissions").delete().eq("id", id);
  if (error) return { success: false, message: "Erreur." };
  revalidatePath("/admin/submissions");
  return { success: true, message: "Idée supprimée." };
}

export async function updateContactStatusAction(
  id: string,
  status: ContactStatus,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", id);
  if (error) return { success: false, message: "Erreur." };
  revalidatePath("/admin/messages");
  return { success: true, message: "Statut mis à jour." };
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { success: false, message: "Erreur." };
  revalidatePath("/admin/messages");
  return { success: true, message: "Message supprimé." };
}

export async function deleteSubscriberAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("launch_subscribers").delete().eq("id", id);
  if (error) return { success: false, message: "Erreur." };
  revalidatePath("/admin/subscribers");
  return { success: true, message: "Inscription supprimée." };
}

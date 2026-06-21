"use server";

// ===========================================================================
//  Server Actions publiques : soumission d'idée, inscription lancement, contact.
//  Validation zod + honeypot + rate-limit. Insertions soumises à la RLS.
// ===========================================================================

import { createAnonClient } from "@/lib/supabase/anon";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { verifyCaptcha } from "@/lib/captcha";
import { notifyContactDiscord } from "@/lib/notify";
import {
  contactSchema,
  ideaSubmissionSchema,
  launchNotificationSchema,
  flattenFieldErrors,
} from "@/lib/validations";
import type { ActionResult } from "@/types";

function fail(message: string, fieldErrors?: Record<string, string[]>): ActionResult {
  return { success: false, message, fieldErrors };
}

// --------------------------------------------------------------------------
//  Soumettre une idée de projet
// --------------------------------------------------------------------------
export async function submitIdeaAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = ideaSubmissionSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    contact_method: formData.get("contact_method") ?? "",
    project_name: formData.get("project_name") ?? "",
    idea: formData.get("idea") ?? "",
    help_type: formData.get("help_type") ?? "",
    consent: formData.get("consent") ?? false,
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return fail("Veuillez corriger les champs en surbrillance.", flattenFieldErrors(parsed.error));
  }

  const key = await getClientKey("idea");
  if (!rateLimit(key, 3, 60_000)) {
    return fail("Trop de tentatives. Réessayez dans une minute.");
  }

  const supabase = createAnonClient();
  if (!supabase) return fail("Service indisponible. Réessayez plus tard.");
  const { error } = await supabase.from("project_submissions").insert({
    name: parsed.data.name || null,
    email: parsed.data.email,
    contact_method: parsed.data.contact_method || null,
    project_name: parsed.data.project_name || null,
    idea: parsed.data.idea,
    help_type: parsed.data.help_type || null,
    consent: true,
  });

  if (error) {
    console.error("submitIdeaAction:", error.message);
    return fail("Une erreur est survenue. Merci de réessayer.");
  }

  return {
    success: true,
    message: "Votre idée est arrivée. Nous reviendrons vers vous bientôt.",
  };
}

// --------------------------------------------------------------------------
//  S'inscrire au lancement d'un projet
// --------------------------------------------------------------------------
export async function subscribeLaunchAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = launchNotificationSchema.safeParse({
    project_id: formData.get("project_id") ?? "",
    email: formData.get("email") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return fail("Adresse email invalide.", flattenFieldErrors(parsed.error));
  }

  const key = await getClientKey("launch");
  if (!rateLimit(key, 5, 60_000)) {
    return fail("Trop de tentatives. Réessayez dans une minute.");
  }

  const supabase = createAnonClient();
  if (!supabase) return fail("Service indisponible. Réessayez plus tard.");
  const { error } = await supabase.from("launch_subscribers").insert({
    project_id: parsed.data.project_id,
    email: parsed.data.email,
  });

  if (error) {
    // Code 23505 = violation de contrainte unique (déjà inscrit).
    if (error.code === "23505") {
      return {
        success: true,
        message: "Vous êtes déjà inscrit. Nous vous préviendrons au lancement.",
      };
    }
    console.error("subscribeLaunchAction:", error.message);
    return fail("Une erreur est survenue. Merci de réessayer.");
  }

  return {
    success: true,
    message: "C'est noté. Vous serez prévenu dès le lancement.",
  };
}

// --------------------------------------------------------------------------
//  Envoyer un message de contact
// --------------------------------------------------------------------------
export async function submitContactAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return fail("Veuillez corriger les champs en surbrillance.", flattenFieldErrors(parsed.error));
  }

  // CAPTCHA optionnel (ignoré si non configuré).
  const captchaOk = await verifyCaptcha(
    String(formData.get("captcha_token") ?? ""),
  );
  if (!captchaOk) {
    return fail("Vérification anti-robot échouée. Merci de réessayer.");
  }

  // Cooldown anti-spam : 1 envoi / 10 s par visiteur (vérifié côté serveur).
  const key = await getClientKey("contact");
  if (!rateLimit(key, 1, 10_000)) {
    return fail("Merci de patienter quelques secondes avant de renvoyer un message.");
  }

  const supabase = createAnonClient();
  if (!supabase) return fail("Service indisponible. Réessayez plus tard.");
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error("submitContactAction:", error.message);
    return fail("Une erreur est survenue. Merci de réessayer.");
  }

  // Notification Discord (best-effort, ignorée si non configurée).
  await notifyContactDiscord({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  return {
    success: true,
    message: "Message envoyé. Merci, nous vous répondrons rapidement.",
  };
}

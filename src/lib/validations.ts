// ===========================================================================
//  Chapitre 3 — Schémas de validation (zod)
//  Utilisés côté client (feedback) ET côté serveur (sécurité).
// ===========================================================================

import { z } from "zod";
import { HELP_TYPES } from "@/lib/constants";

const email = z
  .string()
  .trim()
  .min(1, "L'adresse email est requise.")
  .email("Adresse email invalide.")
  .max(254);

/** Champ honeypot anti-spam : doit rester vide. */
const honeypot = z
  .string()
  .max(0, "Spam détecté.")
  .optional()
  .or(z.literal(""));

// --------------------------------------------------------------------------
//  Soumission d'idée (Écrivez la suite)
// --------------------------------------------------------------------------
export const ideaSubmissionSchema = z.object({
  name: z.string().trim().max(120).optional().or(z.literal("")),
  email,
  contact_method: z.string().trim().max(200).optional().or(z.literal("")),
  project_name: z.string().trim().max(160).optional().or(z.literal("")),
  idea: z
    .string()
    .trim()
    .min(10, "Décrivez votre idée en quelques mots (10 caractères min.).")
    .max(4000),
  help_type: z
    .enum(HELP_TYPES)
    .or(z.literal(""))
    .optional(),
  consent: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .refine((v) => v === "on" || v === "true" || v === true, {
      message: "Vous devez accepter d'être recontacté.",
    }),
  website: honeypot, // honeypot
});

export type IdeaSubmissionInput = z.infer<typeof ideaSubmissionSchema>;

// --------------------------------------------------------------------------
//  Inscription au lancement d'un projet
// --------------------------------------------------------------------------
export const launchNotificationSchema = z.object({
  project_id: z.string().uuid("Projet invalide."),
  email,
  website: honeypot,
});

export type LaunchNotificationInput = z.infer<typeof launchNotificationSchema>;

// --------------------------------------------------------------------------
//  Message de contact
// --------------------------------------------------------------------------
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Votre nom est requis.").max(120),
  email,
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Votre message est un peu court.")
    .max(5000),
  website: honeypot,
});

export type ContactInput = z.infer<typeof contactSchema>;

// --------------------------------------------------------------------------
//  Liens publicitaires personnalisés
// --------------------------------------------------------------------------
export const adLinkSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Le slug est requis.")
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug invalide (minuscules, chiffres et tirets uniquement).",
    ),
  destination_url: z
    .string()
    .trim()
    .min(1, "La destination est requise.")
    .max(500)
    .regex(/^(https?:\/\/|\/)/, "La destination doit commencer par http(s):// ou /."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export type AdLinkInput = z.infer<typeof adLinkSchema>;

// --------------------------------------------------------------------------
//  Connexion admin
// --------------------------------------------------------------------------
export const loginSchema = z.object({
  email,
  password: z.string().min(6, "Mot de passe trop court."),
});

export type LoginInput = z.infer<typeof loginSchema>;

// --------------------------------------------------------------------------
//  Projet (édition admin)
// --------------------------------------------------------------------------
const optionalUrl = z
  .string()
  .trim()
  .url("URL invalide (doit commencer par http(s)://).")
  .optional()
  .or(z.literal(""));

const optionalText = z.string().trim().optional().or(z.literal(""));

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Le slug est requis.")
    .max(160)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug invalide (minuscules, chiffres et tirets uniquement).",
    ),
  project_number: z.coerce.number().int().min(0).max(9999),
  short_description: optionalText,
  long_description: optionalText,
  story: optionalText,
  objectives: z.array(z.string().trim().min(1)).default([]),
  features: z.array(z.string().trim().min(1)).default([]),
  category: z.string().trim().max(120).optional().or(z.literal("")),
  status: z.enum(["idea", "building", "published", "paused", "archived"]),
  visibility: z.enum(["public", "teaser", "private"]),
  current_stage: z
    .enum(["concept", "identity", "construction", "test", "publication"])
    .nullable()
    .optional(),
  external_url: optionalUrl,
  logo_url: optionalUrl,
  cover_url: optionalUrl,
  launch_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.")
    .optional()
    .or(z.literal("")),
  featured: z.boolean().default(false),
  display_order: z.coerce.number().int().min(0).max(99999).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

/** Convertit le résultat d'un FlattenedError zod en map champ → messages. */
export function flattenFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

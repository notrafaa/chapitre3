// ===========================================================================
//  Chapitre 3 — Fonctions utilitaires
// ===========================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Project } from "@/types";

/** Fusionne des classes Tailwind sans conflit. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL canonique du site (sans slash final). */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/** Domaine racine pour les sous-domaines de projets. */
export function getRootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || "chapitre3.fr";
}

/**
 * Génère l'URL d'accès à un projet.
 *  - si `external_url` est défini, on l'utilise tel quel ;
 *  - sinon on dérive https://[slug].chapitre3.fr.
 */
export function getProjectExternalUrl(project: Pick<Project, "external_url" | "slug">): string {
  if (project.external_url && project.external_url.trim().length > 0) {
    return project.external_url.trim();
  }
  return `https://${project.slug}.${getRootDomain()}`;
}

/** Lien interne vers la fiche détaillée d'un projet. */
export function getProjectInternalUrl(slug: string): string {
  return `/projets/${slug}`;
}

/** Numéro de projet formaté sur 3 chiffres (ex. 001). */
export function formatProjectNumber(n: number): string {
  return String(n).padStart(3, "0");
}

/** Transforme un texte libre en slug compatible URL. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // supprime les diacritiques
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Date FR longue (ex. « 14 février 2026 »). */
export function formatDateFr(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Date + heure FR compactes (pour l'admin). */
export function formatDateTimeFr(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Tronque un texte proprement. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

/** Petite pause utilitaire. */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

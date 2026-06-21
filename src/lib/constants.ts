// ===========================================================================
//  Chapitre 3 — Constantes partagées (labels FR, navigation, étapes…)
// ===========================================================================

import type {
  ProjectStage,
  ProjectStatus,
  ProjectVisibility,
} from "@/types";

export const SITE_NAME = "Chapitre 3";
export const SITE_TAGLINE = "Une maison créative.";
export const SITE_DESCRIPTION =
  "Chapitre 3 est un studio indépendant qui imagine, construit et lance des projets numériques, des expériences et des univers.";

/** Navigation principale (header). */
export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/projets", label: "Projets" },
  { href: "/#studio", label: "Le studio" },
  { href: "/#ecrire-la-suite", label: "Écrire la suite" },
  { href: "/contact", label: "Contact" },
] as const;

/** Libellés FR des statuts de projet. */
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: "Idée",
  building: "En construction",
  published: "Publié",
  paused: "En pause",
  archived: "Archivé",
};

export const VISIBILITY_LABELS: Record<ProjectVisibility, string> = {
  public: "Public",
  teaser: "Teaser",
  private: "Confidentiel",
};

/** Étapes éditoriales, dans l'ordre, pour la barre de progression. */
export const STAGE_ORDER: ProjectStage[] = [
  "concept",
  "identity",
  "construction",
  "test",
  "publication",
];

export const STAGE_LABELS: Record<ProjectStage, string> = {
  concept: "Concept",
  identity: "Identité",
  construction: "Construction",
  test: "Test",
  publication: "Publication",
};

/** Types d'aide proposés dans le formulaire de soumission d'idée. */
export const HELP_TYPES = [
  "Conception / idée",
  "Design / identité",
  "Développement",
  "Lancement / audience",
  "Investissement / partenariat",
  "Autre",
] as const;

/** Clés des réglages stockés dans site_settings. */
export const SETTINGS_KEYS = {
  socialLinks: "social_links",
  homeHero: "home_hero",
  contactEmail: "contact_email",
} as const;

/** Bucket Supabase Storage pour les médias. */
export const STORAGE_BUCKET = "media";

/** Délai minimal anti-spam entre deux soumissions (ms). */
export const SUBMISSION_COOLDOWN_MS = 15_000;

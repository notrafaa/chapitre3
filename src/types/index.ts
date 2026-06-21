// ===========================================================================
//  Chapitre 3 — Types de domaine
//  Alias pratiques + structures applicatives dérivées de la base de données.
// ===========================================================================

import type { Database } from "./database";

export type {
  Database,
  ProjectStatus,
  ProjectVisibility,
  ProjectStage,
  SubmissionStatus,
  ContactStatus,
  MediaType,
  Json,
} from "./database";

type Tables = Database["public"]["Tables"];

export type Project = Tables["projects"]["Row"];
export type ProjectInsert = Tables["projects"]["Insert"];
export type ProjectUpdate = Tables["projects"]["Update"];

export type ProjectMedia = Tables["project_media"]["Row"];
export type ProjectMediaInsert = Tables["project_media"]["Insert"];

export type ProjectMember = Tables["project_members"]["Row"];
export type ProjectMemberInsert = Tables["project_members"]["Insert"];

export type LaunchSubscriber = Tables["launch_subscribers"]["Row"];
export type ProjectSubmission = Tables["project_submissions"]["Row"];
export type ContactMessage = Tables["contact_messages"]["Row"];
export type AdminUser = Tables["admin_users"]["Row"];
export type SiteSetting = Tables["site_settings"]["Row"];
export type AdLink = Tables["ad_links"]["Row"];
export type AdLinkVisit = Tables["ad_link_visits"]["Row"];

/** Projet enrichi de sa galerie de médias et de son équipe. */
export interface ProjectWithMedia extends Project {
  media: ProjectMedia[];
  members: ProjectMember[];
}

/** Liens sociaux configurables (stockés dans site_settings.key = 'social_links'). */
export interface SocialLinks {
  tiktok?: string;
  instagram?: string;
  discord?: string;
  x?: string;
  youtube?: string;
  email?: string;
}

/** Résultat standard d'une Server Action de formulaire. */
export interface ActionResult {
  success: boolean;
  message: string;
  /** Erreurs de validation par champ (clé = nom du champ). */
  fieldErrors?: Record<string, string[]>;
}

export const ACTION_IDLE: ActionResult = { success: false, message: "" };

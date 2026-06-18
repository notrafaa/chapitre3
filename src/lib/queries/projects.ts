// ===========================================================================
//  Requêtes de lecture des projets (Server Components).
//  Lectures publiques : client anon SANS cookies (compatible ISR / statique).
//  S'appuient sur la RLS : seuls les projets public/teaser remontent côté
//  visiteur. Pour l'admin, on passe par le client admin (service_role).
// ===========================================================================

import "server-only";
import { createAnonClient } from "@/lib/supabase/anon";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Project, ProjectMedia, ProjectWithMedia } from "@/types";

/** Tous les projets visibles publiquement, triés par ordre d'affichage. */
export async function getPublicProjects(): Promise<Project[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("project_number", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getPublicProjects:", e);
    return [];
  }
}

/** Projets mis en avant sur l'accueil (featured + publiquement visibles). */
export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .order("display_order", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getFeaturedProjects:", e);
    return [];
  }
}

/** Fiche détaillée d'un projet par slug (avec sa galerie). */
export async function getProjectBySlug(
  slug: string,
): Promise<ProjectWithMedia | null> {
  const supabase = createAnonClient();
  if (!supabase) return null;
  try {
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !project) return null;

    const { data: media } = await supabase
      .from("project_media")
      .select("*")
      .eq("project_id", project.id)
      .order("display_order", { ascending: true });

    return { ...project, media: (media as ProjectMedia[]) ?? [] };
  } catch (e) {
    console.error("getProjectBySlug:", e);
    return null;
  }
}

/** Slugs visibles publiquement (pour le sitemap). */
export async function getPublicProjectSlugs(): Promise<
  Pick<Project, "slug" | "updated_at">[]
> {
  const supabase = createAnonClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("slug, updated_at");
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getPublicProjectSlugs:", e);
    return [];
  }
}

/**
 * Emplacements « confidentiels » (visibilité privée) destinés à l'affichage
 * public générique. On ne lit QUE des champs non sensibles côté serveur ;
 * aucune donnée privée n'est jamais envoyée au navigateur.
 */
export async function getConfidentialPlaceholders(): Promise<
  { id: string; project_number: number }[]
> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, project_number")
      .eq("visibility", "private")
      .in("status", ["idea", "building"])
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getConfidentialPlaceholders:", e);
    return [];
  }
}

// --------------------------------------------------------------------------
//  Lecture admin (service_role) — contourne la RLS après vérification d'accès.
// --------------------------------------------------------------------------

/** Tous les projets, y compris privés (admin uniquement). */
export async function getAllProjectsAdmin(): Promise<Project[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true })
    .order("project_number", { ascending: true });

  if (error) {
    console.error("getAllProjectsAdmin:", error.message);
    return [];
  }
  return data ?? [];
}

/** Fiche complète d'un projet (admin), même privé, avec galerie. */
export async function getProjectByIdAdmin(
  id: string,
): Promise<ProjectWithMedia | null> {
  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!project) return null;

  const { data: media } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", id)
    .order("display_order", { ascending: true });

  return { ...project, media: (media as ProjectMedia[]) ?? [] };
}

/** Aperçu admin d'un projet par slug (même non publié). */
export async function getProjectBySlugAdmin(
  slug: string,
): Promise<ProjectWithMedia | null> {
  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!project) return null;

  const { data: media } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", project.id)
    .order("display_order", { ascending: true });

  return { ...project, media: (media as ProjectMedia[]) ?? [] };
}

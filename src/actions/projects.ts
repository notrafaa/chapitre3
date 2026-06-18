"use server";

// ===========================================================================
//  Server Actions admin : gestion des projets et de leurs médias.
//  Chaque action revérifie l'autorisation côté serveur via assertAdmin().
// ===========================================================================

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { projectSchema, flattenFieldErrors } from "@/lib/validations";
import { STORAGE_BUCKET } from "@/lib/constants";
import type { ActionResult, ProjectInsert } from "@/types";

const mediaItemSchema = z.object({
  media_url: z.string().url(),
  media_type: z.enum(["image", "video"]).default("image"),
  alt_text: z.string().optional().nullable(),
  display_order: z.number().int().default(0),
});

/** Découpe un textarea en lignes nettoyées (objectifs / fonctionnalités). */
function linesToArray(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length ? t : null;
}

function revalidateAll(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projets");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  if (slug) revalidatePath(`/projets/${slug}`);
}

// --------------------------------------------------------------------------
//  Créer / mettre à jour un projet
// --------------------------------------------------------------------------
export async function saveProjectAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }

  const id = (formData.get("id") as string) || null;

  const parsed = projectSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    project_number: formData.get("project_number") ?? 0,
    short_description: formData.get("short_description") ?? "",
    long_description: formData.get("long_description") ?? "",
    story: formData.get("story") ?? "",
    objectives: linesToArray(formData.get("objectives")),
    features: linesToArray(formData.get("features")),
    category: formData.get("category") ?? "",
    status: formData.get("status") ?? "idea",
    visibility: formData.get("visibility") ?? "public",
    current_stage: (formData.get("current_stage") as string) || null,
    external_url: formData.get("external_url") ?? "",
    logo_url: formData.get("logo_url") ?? "",
    cover_url: formData.get("cover_url") ?? "",
    launch_date: formData.get("launch_date") ?? "",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    display_order: formData.get("display_order") ?? 0,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Veuillez corriger les champs en surbrillance.",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const d = parsed.data;
  const values: ProjectInsert = {
    name: d.name,
    slug: d.slug,
    project_number: d.project_number,
    short_description: d.short_description || null,
    long_description: d.long_description || null,
    story: d.story || null,
    objectives: d.objectives,
    features: d.features,
    category: d.category || null,
    status: d.status,
    visibility: d.visibility,
    current_stage: d.current_stage ?? null,
    external_url: d.external_url || null,
    logo_url: d.logo_url || null,
    cover_url: d.cover_url || null,
    launch_date: d.launch_date || null,
    featured: d.featured,
    display_order: d.display_order,
  };

  const supabase = createAdminClient();
  let projectId = id;

  if (id) {
    const { error } = await supabase.from("projects").update(values).eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "Ce slug est déjà utilisé." };
      }
      console.error("saveProjectAction(update):", error.message);
      return { success: false, message: "Erreur lors de la sauvegarde." };
    }
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert(values)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "Ce slug est déjà utilisé." };
      }
      console.error("saveProjectAction(insert):", error.message);
      return { success: false, message: "Erreur lors de la création." };
    }
    projectId = data.id;
  }

  // Synchronisation des médias (remplacement complet de la galerie).
  const mediaRaw = formData.get("media_json");
  if (projectId && typeof mediaRaw === "string" && mediaRaw.length) {
    try {
      const items = z.array(mediaItemSchema).parse(JSON.parse(mediaRaw));
      await supabase.from("project_media").delete().eq("project_id", projectId);
      if (items.length) {
        await supabase.from("project_media").insert(
          items.map((m, i) => ({
            project_id: projectId!,
            media_url: m.media_url,
            media_type: m.media_type,
            alt_text: m.alt_text || null,
            display_order: m.display_order ?? i,
          })),
        );
      }
    } catch (e) {
      console.error("saveProjectAction(media):", e);
    }
  }

  revalidateAll(d.slug);

  return {
    success: true,
    message: id ? "Projet mis à jour." : "Projet créé.",
  };
}

// --------------------------------------------------------------------------
//  Supprimer un projet (+ ses médias dans Storage)
// --------------------------------------------------------------------------
export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }

  const supabase = createAdminClient();

  // Récupère les chemins de stockage liés pour nettoyage best-effort.
  const { data: media } = await supabase
    .from("project_media")
    .select("media_url")
    .eq("project_id", id);

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("deleteProjectAction:", error.message);
    return { success: false, message: "Erreur lors de la suppression." };
  }

  // Nettoyage du Storage (les chemins sont stockés en URL publiques).
  const paths = (media ?? [])
    .map((m) => extractStoragePath(m.media_url))
    .filter((p): p is string => Boolean(p));
  if (paths.length) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }

  revalidateAll();
  return { success: true, message: "Projet supprimé." };
}

// --------------------------------------------------------------------------
//  Réordonner les projets (drag & drop)
// --------------------------------------------------------------------------
export async function reorderProjectsAction(
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }

  const supabase = createAdminClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("projects").update({ display_order: index + 1 }).eq("id", id),
    ),
  );

  revalidateAll();
  return { success: true, message: "Ordre mis à jour." };
}

// --------------------------------------------------------------------------
//  Mettre en avant / retirer de l'accueil
// --------------------------------------------------------------------------
export async function toggleFeaturedAction(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("projects")
    .update({ featured })
    .eq("id", id);

  if (error) return { success: false, message: "Erreur." };
  revalidateAll();
  return { success: true, message: featured ? "Mis en avant." : "Retiré de l'accueil." };
}

// --------------------------------------------------------------------------
//  Publier / dépublier
// --------------------------------------------------------------------------
export async function togglePublishAction(
  id: string,
  publish: boolean,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { success: false, message: "Accès non autorisé." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("projects")
    .update({
      status: publish ? "published" : "paused",
      visibility: publish ? "public" : "private",
    })
    .eq("id", id);

  if (error) return { success: false, message: "Erreur." };
  revalidateAll();
  return {
    success: true,
    message: publish ? "Projet publié." : "Projet dépublié.",
  };
}

/** Extrait le chemin interne d'une URL publique Supabase Storage. */
function extractStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

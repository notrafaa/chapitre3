// ===========================================================================
//  Sitemap dynamique — pages statiques + fiches projets publiques.
// ===========================================================================

import type { MetadataRoute } from "next";
import { getPublicProjectSlugs } from "@/lib/queries/projects";
import { getSiteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projets`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getPublicProjectSlugs();
    projectRoutes = slugs.map((s) => ({
      url: `${base}/projets/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // En l'absence de connexion Supabase, on renvoie au moins les routes statiques.
  }

  return [...staticRoutes, ...projectRoutes];
}

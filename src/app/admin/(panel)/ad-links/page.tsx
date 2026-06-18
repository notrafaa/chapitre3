// ===========================================================================
//  /admin/ad-links — liens publicitaires personnalisés + stats pays.
// ===========================================================================

import type { Metadata } from "next";
import { AdLinksManager, type AdLinkWithStats } from "@/components/admin/AdLinksManager";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Liens publicitaires",
};

async function getAdLinks(): Promise<AdLinkWithStats[]> {
  const supabase = createAdminClient();
  const [{ data: links, error: linksError }, { data: visits, error: visitsError }] =
    await Promise.all([
      supabase.from("ad_links").select("*").order("created_at", { ascending: false }),
      supabase
        .from("ad_link_visits")
        .select("ad_link_id, country_code, created_at")
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

  if (linksError) {
    console.error("getAdLinks links:", linksError.message);
  }
  if (visitsError) {
    console.error("getAdLinks visits:", visitsError.message);
  }

  const visitsByLink = new Map<
    string,
    {
      total: number;
      lastVisitAt: string | null;
      countries: Map<string, number>;
    }
  >();

  for (const visit of visits ?? []) {
    const stats =
      visitsByLink.get(visit.ad_link_id) ??
      {
        total: 0,
        lastVisitAt: null,
        countries: new Map<string, number>(),
      };
    const key = visit.country_code ?? "unknown";
    stats.total += 1;
    stats.lastVisitAt ??= visit.created_at;
    stats.countries.set(key, (stats.countries.get(key) ?? 0) + 1);
    visitsByLink.set(visit.ad_link_id, stats);
  }

  return (links ?? []).map((link) => {
    const stats = visitsByLink.get(link.id);
    return {
      ...link,
      totalVisits: stats?.total ?? 0,
      lastVisitAt: stats?.lastVisitAt ?? null,
      countries: Array.from(stats?.countries.entries() ?? [])
        .map(([countryCode, count]) => ({
          countryCode: countryCode === "unknown" ? null : countryCode,
          count,
        }))
        .sort((a, b) => b.count - a.count),
    };
  });
}

export default async function AdLinksPage() {
  const links = await getAdLinks();

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-paper">
          Liens publicitaires
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-400">
          Créez des liens courts pour vos campagnes et voyez quels pays arrivent
          sur le site via chaque lien.
        </p>
      </div>

      <AdLinksManager links={links} siteUrl={getSiteUrl()} />
    </div>
  );
}

// ===========================================================================
//  /admin/subscribers — inscriptions aux lancements.
// ===========================================================================

import {
  SubscriberList,
  type SubscriberRow,
} from "@/components/admin/SubscriberList";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("launch_subscribers")
    .select("id, email, created_at, projects(name)")
    .order("created_at", { ascending: false });

  const rows: SubscriberRow[] = (data ?? []).map((r) => {
    const project = r.projects as { name?: string } | { name?: string }[] | null;
    const projectName = Array.isArray(project)
      ? project[0]?.name
      : project?.name;
    return {
      id: r.id,
      email: r.email,
      created_at: r.created_at,
      projectName: projectName ?? "Projet supprimé",
    };
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold text-paper">
        Inscriptions au lancement
      </h1>
      <p className="mb-8 text-sm text-ink-400">
        Les visiteurs qui souhaitent être prévenus.
      </p>
      <SubscriberList initial={rows} />
    </div>
  );
}

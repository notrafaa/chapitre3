// ===========================================================================
//  /admin/submissions — idées proposées.
// ===========================================================================

import { SubmissionList } from "@/components/admin/SubmissionList";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("project_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold text-paper">
        Idées proposées
      </h1>
      <p className="mb-8 text-sm text-ink-400">
        Les idées envoyées via « Écrivez la suite ».
      </p>
      <SubmissionList initial={data ?? []} />
    </div>
  );
}

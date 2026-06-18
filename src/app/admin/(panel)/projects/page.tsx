// ===========================================================================
//  /admin/projects — liste et gestion des projets.
// ===========================================================================

import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminProjectList } from "@/components/admin/AdminProjectList";
import { getAllProjectsAdmin } from "@/lib/queries/projects";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-paper">Projets</h1>
          <p className="mt-1 text-sm text-ink-400">
            Glissez-déposez pour réorganiser l’ordre d’affichage.
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary">
          <Plus size={16} /> Nouveau projet
        </Link>
      </div>

      <AdminProjectList initial={projects} />
    </div>
  );
}

// ===========================================================================
//  /admin/projects/[id] — édition d'un projet existant.
// ===========================================================================

import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { getProjectByIdAdmin } from "@/lib/queries/projects";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectByIdAdmin(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold text-paper">
        {project.name}
      </h1>
      <ProjectEditor project={project} />
    </div>
  );
}

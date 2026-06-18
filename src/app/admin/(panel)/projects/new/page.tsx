// ===========================================================================
//  /admin/projects/new — création d'un projet.
// ===========================================================================

import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold text-paper">
        Nouveau projet
      </h1>
      <ProjectEditor />
    </div>
  );
}

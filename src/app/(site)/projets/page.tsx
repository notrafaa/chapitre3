// ===========================================================================
//  /projets — le sommaire central de tous les projets.
// ===========================================================================

import type { Metadata } from "next";
import { ProjectCard, ConfidentialCard } from "@/components/ProjectCard";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { Reveal } from "@/components/animation/Reveal";
import {
  getPublicProjects,
  getConfidentialPlaceholders,
} from "@/lib/queries/projects";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Les projets",
  description:
    "Certains chapitres sont terminés. D'autres sont encore en train de s'écrire. Découvrez les projets de Chapitre 3.",
};

export default async function ProjectsPage() {
  const [projects, confidential] = await Promise.all([
    getPublicProjects(),
    getConfidentialPlaceholders(),
  ]);

  const published = projects
    .filter((p) => p.status === "published")
    .map((p) => <ProjectCard key={p.id} project={p} />);

  const building = projects
    .filter((p) => p.status === "building" && p.visibility !== "private")
    .map((p) => <ProjectCard key={p.id} project={p} />);

  const ideas = [
    ...projects
      .filter((p) => p.status === "idea")
      .map((p) => <ProjectCard key={p.id} project={p} />),
    ...confidential.map((c) => (
      <ConfidentialCard key={c.id} number={c.project_number} />
    )),
  ];

  return (
    <div className="container-editorial pb-28 pt-32 sm:pt-40">
      <header className="mb-16 max-w-3xl">
        <Reveal>
          <span className="chapter-tag mb-5">
            <span className="font-mono">Sommaire</span>
            <span className="hairline w-12 flex-none" />
            <span>Tous les chapitres</span>
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-6xl font-bold leading-none tracking-tightest text-paper sm:text-8xl">
            Les projets
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 font-serif text-2xl italic leading-relaxed text-ink-200">
            « Certains chapitres sont terminés. D’autres sont encore en train de
            s’écrire. »
          </p>
        </Reveal>
      </header>

      <ProjectsExplorer
        published={published}
        building={building}
        ideas={ideas}
      />
    </div>
  );
}

"use client";

// ===========================================================================
//  ProjectsExplorer — orchestre les filtres et les trois grandes sections :
//   Chapitre I — Publiés · Chapitre II — En construction · Chapitre III — Idées.
//  Les cartes sont rendues côté serveur et passées en props (ReactNode).
// ===========================================================================

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProjectFilters, type ProjectFilter } from "@/components/ProjectFilters";

interface Section {
  key: Exclude<ProjectFilter, "all">;
  chapter: string;
  title: string;
  subtitle: string;
  nodes: ReactNode[];
}

export function ProjectsExplorer({
  published,
  building,
  ideas,
}: {
  published: ReactNode[];
  building: ReactNode[];
  ideas: ReactNode[];
}) {
  const [filter, setFilter] = useState<ProjectFilter>("all");

  const counts: Record<ProjectFilter, number> = {
    all: published.length + building.length + ideas.length,
    published: published.length,
    building: building.length,
    idea: ideas.length,
  };

  const sections: Section[] = useMemo(
    () => [
      {
        key: "published",
        chapter: "Chapitre I",
        title: "Les projets publiés",
        subtitle: "Disponibles, vivants, utilisés.",
        nodes: published,
      },
      {
        key: "building",
        chapter: "Chapitre II",
        title: "Les projets en construction",
        subtitle: "En train de prendre forme.",
        nodes: building,
      },
      {
        key: "idea",
        chapter: "Chapitre III",
        title: "Les prochains chapitres",
        subtitle: "Des idées qui demandent à exister.",
        nodes: ideas,
      },
    ],
    [published, building, ideas],
  );

  const visible = sections.filter(
    (s) => (filter === "all" || filter === s.key) && s.nodes.length > 0,
  );

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-6 mb-12 border-y border-ink-800/50 bg-ink-950/80 px-6 py-4 backdrop-blur sm:top-20">
        <ProjectFilters value={filter} onChange={setFilter} counts={counts} />
      </div>

      <div className="space-y-24">
        <AnimatePresence mode="wait">
          {visible.map((section) => (
            <motion.section
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              aria-labelledby={`section-${section.key}`}
            >
              <div className="mb-8 flex flex-col gap-1">
                <span className="chapter-tag">
                  <span className="font-mono">{section.chapter}</span>
                  <span className="hairline w-10 flex-none" />
                  <span>{section.title}</span>
                </span>
                <p
                  id={`section-${section.key}`}
                  className="font-serif text-xl italic text-ink-300"
                >
                  {section.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.nodes}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <p className="py-20 text-center font-serif text-xl italic text-ink-400">
            Aucun projet dans cette catégorie pour l’instant.
          </p>
        )}
      </div>
    </div>
  );
}

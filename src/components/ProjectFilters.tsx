"use client";

// ===========================================================================
//  ProjectFilters — filtres : Tous · Publiés · En construction · Idées.
// ===========================================================================

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ProjectFilter = "all" | "published" | "building" | "idea";

const FILTERS: { value: ProjectFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "published", label: "Publiés" },
  { value: "building", label: "En construction" },
  { value: "idea", label: "Idées" },
];

export function ProjectFilters({
  value,
  onChange,
  counts,
}: {
  value: ProjectFilter;
  onChange: (value: ProjectFilter) => void;
  counts: Record<ProjectFilter, number>;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="tablist"
      aria-label="Filtrer les projets"
    >
      {FILTERS.map((f) => {
        const active = value === f.value;
        return (
          <button
            key={f.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.value)}
            className={cn(
              "relative rounded-full border px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors duration-300",
              active
                ? "border-paper/60 text-paper"
                : "border-ink-700/60 text-ink-400 hover:border-ink-500 hover:text-paper",
            )}
          >
            {active && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 -z-10 rounded-full bg-paper/5"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {f.label}
            <span className="ml-2 font-mono text-[0.65rem] text-ink-500">
              {counts[f.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

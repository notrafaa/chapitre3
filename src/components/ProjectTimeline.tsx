// ===========================================================================
//  ProjectTimeline — barre de progression éditoriale (Concept → Publication).
//  Pas de faux pourcentage : on met simplement en valeur l'étape atteinte.
// ===========================================================================

import { STAGE_ORDER, STAGE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProjectStage } from "@/types";

export function ProjectTimeline({
  currentStage,
  compact = false,
  className,
}: {
  currentStage: ProjectStage | null;
  compact?: boolean;
  className?: string;
}) {
  const currentIndex = currentStage ? STAGE_ORDER.indexOf(currentStage) : -1;

  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-center justify-between gap-1">
        {STAGE_ORDER.map((stage, i) => {
          const reached = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <li key={stage} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-px flex-1",
                    i === 0 ? "opacity-0" : reached ? "bg-paper/70" : "bg-ink-700/60",
                  )}
                />
                <span
                  className={cn(
                    "h-2 w-2 flex-none rounded-full transition-colors",
                    active
                      ? "bg-paper ring-4 ring-paper/15"
                      : reached
                        ? "bg-paper/70"
                        : "bg-ink-600",
                  )}
                />
                <span
                  className={cn(
                    "h-px flex-1",
                    i === STAGE_ORDER.length - 1
                      ? "opacity-0"
                      : i < currentIndex
                        ? "bg-paper/70"
                        : "bg-ink-700/60",
                  )}
                />
              </div>
              {!compact && (
                <span
                  className={cn(
                    "text-center text-[0.6rem] uppercase tracking-[0.12em] sm:text-xs",
                    active ? "text-paper" : reached ? "text-ink-300" : "text-ink-500",
                  )}
                >
                  {STAGE_LABELS[stage]}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

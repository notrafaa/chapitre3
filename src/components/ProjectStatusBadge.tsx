// ===========================================================================
//  ProjectStatusBadge — pastille de statut éditorial.
// ===========================================================================

import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const STYLES: Record<ProjectStatus, string> = {
  published: "border-emerald-400/40 text-emerald-300 bg-emerald-400/5",
  building: "border-chrome/40 text-chrome bg-chrome/5",
  idea: "border-ink-500/50 text-ink-300 bg-ink-500/5",
  paused: "border-amber-400/30 text-amber-200/80 bg-amber-400/5",
  archived: "border-ink-700/50 text-ink-500 bg-ink-800/20",
};

/** Libellé spécial pour les projets publiés (badge « Disponible »). */
export function ProjectStatusBadge({
  status,
  availableLabel = false,
  className,
}: {
  status: ProjectStatus;
  availableLabel?: boolean;
  className?: string;
}) {
  const label =
    availableLabel && status === "published" ? "Disponible" : STATUS_LABELS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em]",
        STYLES[status],
        className,
      )}
    >
      {status === "published" && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
      )}
      {label}
    </span>
  );
}

// ===========================================================================
//  ProjectTeam — « Équipe du projet » affichée sur la page d'un projet.
// ===========================================================================

import Image from "next/image";
import { Users, ArrowUpRight } from "lucide-react";
import type { ProjectMember } from "@/types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProjectTeam({ members }: { members: ProjectMember[] }) {
  if (!members.length) return null;

  return (
    <section>
      <h2 className="label flex items-center gap-2">
        <Users size={14} /> Équipe du projet
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {members.map((m) => {
          const card = (
            <div className="flex h-full items-center gap-4 rounded-xl border border-ink-800/70 bg-ink-900/30 p-4 transition-colors duration-300 group-hover:border-ink-600/70">
              <div className="relative flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-full border border-ink-700/60 bg-ink-800 text-sm font-semibold text-ink-200">
                {m.avatar_url ? (
                  <Image
                    src={m.avatar_url}
                    alt={m.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  initials(m.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate font-medium text-paper">
                  {m.name}
                  {m.link && (
                    <ArrowUpRight
                      size={13}
                      className="flex-none text-ink-500 transition-colors group-hover:text-paper"
                    />
                  )}
                </p>
                {m.role && (
                  <p className="truncate text-xs uppercase tracking-[0.12em] text-ink-400">
                    {m.role}
                  </p>
                )}
                {m.description && (
                  <p className="mt-1 truncate text-sm text-ink-400">
                    {m.description}
                  </p>
                )}
              </div>
            </div>
          );

          return (
            <li key={m.id} className="group">
              {m.link ? (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  {card}
                </a>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ===========================================================================
//  ProjectCard — carte projet. L'animation au survol évoque une couverture
//  qui se soulève. Le rendu s'adapte au statut/visibilité.
// ===========================================================================

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { LaunchNotificationForm } from "@/components/LaunchNotificationForm";
import {
  formatProjectNumber,
  formatDateFr,
  getProjectExternalUrl,
  getProjectInternalUrl,
  cn,
} from "@/lib/utils";
import { STAGE_LABELS } from "@/lib/constants";
import type { Project } from "@/types";

/** Placeholder générique pour un projet confidentiel (visibilité privée). */
export function ConfidentialCard({ number }: { number: number }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-ink-800/70 bg-ink-900/40 p-7">
      <div className="absolute right-5 top-5 text-ink-600">
        <Lock size={18} />
      </div>
      <span className="font-mono text-xs text-ink-500">
        {formatProjectNumber(number)}
      </span>
      <h3 className="mt-6 font-display text-2xl font-semibold text-ink-200">
        Projet confidentiel
      </h3>
      <p className="mt-3 font-serif text-base italic text-ink-400">
        Quelque chose se prépare en silence.
      </p>
      <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-ink-700/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-ink-400">
        Révélation prochaine
      </span>
    </article>
  );
}

export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const isPublished = project.status === "published";
  const isBuilding = project.status === "building";
  const isTeaser = project.visibility === "teaser";
  const isIdea = project.status === "idea";

  const cover = project.cover_url || project.logo_url;
  const launch = formatDateFr(project.launch_date);

  // ---- Teaser / idée à dévoiler ----
  if (isTeaser) {
    return (
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl border border-ink-800/70 bg-ink-900/40 p-7 transition-colors duration-500 hover:border-ink-600/70",
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink-500">
            {formatProjectNumber(project.project_number)}
          </span>
          <ProjectStatusBadge status={project.status} />
        </div>
        <h3 className="mt-6 font-display text-2xl font-semibold text-paper">
          {project.name}
        </h3>
        {project.short_description && (
          <p className="mt-3 font-serif text-base italic text-ink-300">
            {project.short_description}
          </p>
        )}
        <div className="mt-8 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-700/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-ink-400">
            Révélation prochaine
          </span>
          <Link
            href={getProjectInternalUrl(project.slug)}
            className="btn-ghost"
          >
            Découvrir →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-ink-800/70 bg-ink-900/30 transition-all duration-500 ease-book hover:-translate-y-1 hover:border-ink-600/70 hover:shadow-2xl hover:shadow-black/40",
        className,
      )}
    >
      {/* Couverture qui se soulève */}
      <Link
        href={getProjectInternalUrl(project.slug)}
        className="relative block aspect-[16/10] overflow-hidden bg-ink-900"
        aria-label={`Découvrir ${project.name}`}
      >
        {cover ? (
          <Image
            src={cover}
            alt={`Visuel du projet ${project.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-book group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950">
            <span className="giant-number text-[8rem]">
              {formatProjectNumber(project.project_number)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <ProjectStatusBadge status={project.status} availableLabel />
        </div>
        {project.logo_url && (
          <div className="absolute bottom-4 left-4 h-10 w-10 overflow-hidden rounded-md bg-ink-950/60 p-1 backdrop-blur">
            <Image
              src={project.logo_url}
              alt={`Logo ${project.name}`}
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span className="font-mono">{formatProjectNumber(project.project_number)}</span>
          {project.category && (
            <span className="uppercase tracking-[0.15em]">{project.category}</span>
          )}
        </div>

        <h3 className="mt-3 font-display text-2xl font-semibold text-paper">
          <Link href={getProjectInternalUrl(project.slug)} className="hover:underline">
            {project.name}
          </Link>
        </h3>

        {project.short_description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-300">
            {project.short_description}
          </p>
        )}

        {/* Étape pour les projets en construction */}
        {isBuilding && (
          <div className="mt-6 space-y-3">
            {project.current_stage && (
              <p className="text-xs uppercase tracking-[0.15em] text-ink-400">
                Étape : <span className="text-paper">{STAGE_LABELS[project.current_stage]}</span>
              </p>
            )}
            <ProjectTimeline currentStage={project.current_stage} compact />
          </div>
        )}

        <div className="mt-auto pt-6">
          {isPublished && (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={getProjectExternalUrl(project)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Accéder au projet
                <ArrowUpRight size={16} />
              </a>
              <Link href={getProjectInternalUrl(project.slug)} className="btn-ghost">
                Découvrir →
              </Link>
            </div>
          )}

          {isBuilding && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-ink-400">
                Être prévenu du lancement
              </p>
              <LaunchNotificationForm projectId={project.id} compact />
            </div>
          )}

          {isIdea && !isTeaser && (
            <Link href={getProjectInternalUrl(project.slug)} className="btn-ghost">
              Découvrir →
            </Link>
          )}
        </div>

        {isPublished && launch && (
          <p className="mt-4 text-xs text-ink-500">Lancé le {launch}</p>
        )}
      </div>
    </article>
  );
}

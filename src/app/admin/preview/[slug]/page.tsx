// ===========================================================================
//  /admin/preview/[slug] — aperçu d'un projet avant publication.
//  Accessible aux admins uniquement ; lit même les projets non publiés.
// ===========================================================================

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getProjectBySlugAdmin } from "@/lib/queries/projects";
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ProjectMediaGallery } from "@/components/ProjectMediaGallery";
import {
  formatProjectNumber,
  formatDateFr,
  getProjectExternalUrl,
} from "@/lib/utils";
import { STAGE_LABELS, VISIBILITY_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const project = await getProjectBySlugAdmin(slug);
  if (!project) notFound();

  const launch = formatDateFr(project.launch_date);

  return (
    <div className="min-h-screen bg-ink-950 pb-24">
      {/* Bandeau aperçu */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/30 bg-amber-400/10 px-5 py-3 backdrop-blur">
        <span className="text-sm font-medium text-amber-200">
          Mode aperçu — visibilité : {VISIBILITY_LABELS[project.visibility]} · statut :{" "}
          {project.status}
        </span>
        <Link
          href={`/admin/projects/${project.id}`}
          className="inline-flex items-center gap-2 text-sm text-amber-100 hover:text-white"
        >
          <ArrowLeft size={15} /> Retour à l’édition
        </Link>
      </div>

      <article className="mx-auto max-w-4xl px-5 pt-12 sm:px-8">
        <div className="flex items-start gap-5">
          {project.logo_url && (
            <div className="h-16 w-16 flex-none overflow-hidden rounded-lg border border-ink-800/70 bg-ink-900 p-2">
              <Image
                src={project.logo_url}
                alt={`Logo ${project.name}`}
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div>
            <span className="font-mono text-sm text-ink-500">
              {formatProjectNumber(project.project_number)}
            </span>
            <h1 className="mt-1 font-display text-5xl font-bold tracking-tightest text-paper">
              {project.name}
            </h1>
            <div className="mt-3">
              <ProjectStatusBadge status={project.status} availableLabel />
            </div>
          </div>
        </div>

        {project.short_description && (
          <p className="mt-8 font-serif text-2xl italic text-ink-200">
            {project.short_description}
          </p>
        )}

        {project.status === "published" && (
          <a
            href={getProjectExternalUrl(project)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8"
          >
            Ouvrir {project.name} <ArrowUpRight size={16} />
          </a>
        )}

        {project.cover_url && (
          <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-2xl border border-ink-800/70">
            <Image
              src={project.cover_url}
              alt={`Couverture ${project.name}`}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {project.status === "building" && (
          <div className="mt-12 rounded-2xl border border-ink-800/70 bg-ink-900/30 p-6">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-300">
              Avancement {project.current_stage && `· ${STAGE_LABELS[project.current_stage]}`}
            </p>
            <ProjectTimeline currentStage={project.current_stage} />
          </div>
        )}

        {project.long_description && (
          <section className="mt-12">
            <h2 className="label">À propos</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-ink-200">
              {project.long_description}
            </p>
          </section>
        )}

        {project.story && (
          <section className="mt-10">
            <h2 className="label">L’histoire</h2>
            <p className="whitespace-pre-line font-serif text-lg italic text-ink-200">
              {project.story}
            </p>
          </section>
        )}

        {(project.objectives.length > 0 || project.features.length > 0) && (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {project.objectives.length > 0 && (
              <section>
                <h2 className="label">Objectifs</h2>
                <ul className="space-y-2 text-ink-200">
                  {project.objectives.map((o, i) => (
                    <li key={i}>— {o}</li>
                  ))}
                </ul>
              </section>
            )}
            {project.features.length > 0 && (
              <section>
                <h2 className="label">Fonctionnalités</h2>
                <ul className="space-y-2 text-ink-200">
                  {project.features.map((f, i) => (
                    <li key={i}>— {f}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {project.media.length > 0 && (
          <section className="mt-10">
            <h2 className="label">Galerie</h2>
            <ProjectMediaGallery media={project.media} />
          </section>
        )}

        {launch && (
          <p className="mt-10 text-sm text-ink-500">Lancement : {launch}</p>
        )}
      </article>
    </div>
  );
}

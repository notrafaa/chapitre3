// ===========================================================================
//  /projets/[slug] — fiche détaillée d'un projet (SEO + Open Graph dynamiques).
// ===========================================================================

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowLeft, Target, Sparkles } from "lucide-react";
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ProjectMediaGallery } from "@/components/ProjectMediaGallery";
import { ProjectTeam } from "@/components/ProjectTeam";
import { LaunchNotificationForm } from "@/components/LaunchNotificationForm";
import { Reveal } from "@/components/animation/Reveal";
import {
  getProjectBySlug,
  getPublicProjectSlugs,
} from "@/lib/queries/projects";
import {
  formatProjectNumber,
  formatDateFr,
  getProjectExternalUrl,
} from "@/lib/utils";
import { STAGE_LABELS } from "@/lib/constants";

export const revalidate = 120;

export async function generateStaticParams() {
  const slugs = await getPublicProjectSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Projet introuvable" };

  const ogImage = project.cover_url || project.logo_url;
  return {
    title: project.name,
    description: project.short_description || undefined,
    openGraph: {
      title: `${project.name} — Chapitre 3`,
      description: project.short_description || undefined,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} — Chapitre 3`,
      description: project.short_description || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const isPublished = project.status === "published";
  const isBuilding = project.status === "building";
  const isTeaser = project.visibility === "teaser";
  const launch = formatDateFr(project.launch_date);
  const externalUrl = getProjectExternalUrl(project);

  return (
    <article className="pb-28 pt-28 sm:pt-36">
      {/* En-tête */}
      <header className="container-editorial">
        <Link
          href="/projets"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-400 transition-colors hover:text-paper"
        >
          <ArrowLeft size={14} /> Le sommaire
        </Link>

        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
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
              <h1 className="mt-1 font-display text-5xl font-bold leading-none tracking-tightest text-paper sm:text-7xl">
                {project.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProjectStatusBadge status={project.status} availableLabel />
            {project.category && (
              <span className="text-xs uppercase tracking-[0.15em] text-ink-400">
                {project.category}
              </span>
            )}
          </div>
        </div>

        {project.short_description && (
          <p className="mt-8 max-w-3xl font-serif text-2xl italic leading-relaxed text-ink-200">
            {project.short_description}
          </p>
        )}

        {/* Appel à l'action principal */}
        <div className="mt-10">
          {isPublished && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-base"
            >
              Ouvrir {project.name}
              <ArrowUpRight size={18} />
            </a>
          )}
          {isTeaser && !isPublished && (
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-700/60 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink-300">
              Révélation prochaine
            </span>
          )}
        </div>
      </header>

      {/* Couverture */}
      {project.cover_url && (
        <div className="container-editorial mt-14">
          <Reveal>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-ink-800/70">
              <Image
                src={project.cover_url}
                alt={`Couverture de ${project.name}`}
                fill
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
        </div>
      )}

      {/* Étape pour les projets en construction */}
      {isBuilding && (
        <section className="container-editorial mt-16">
          <Reveal>
            <div className="rounded-2xl border border-ink-800/70 bg-ink-900/30 p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-[0.2em] text-ink-300">
                  Avancement éditorial
                </h2>
                {project.current_stage && (
                  <span className="text-sm text-paper">
                    Étape&nbsp;: {STAGE_LABELS[project.current_stage]}
                  </span>
                )}
              </div>
              <ProjectTimeline currentStage={project.current_stage} />
              <div className="mt-8 border-t border-ink-800/60 pt-6">
                <p className="mb-3 text-sm text-ink-300">
                  Soyez prévenu dès que ce chapitre s’ouvre.
                </p>
                <LaunchNotificationForm projectId={project.id} />
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Corps */}
      <div className="container-editorial mt-16 grid grid-cols-1 gap-14 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {project.long_description && (
            <Reveal>
              <section>
                <h2 className="label">À propos</h2>
                <p className="whitespace-pre-line text-lg leading-relaxed text-ink-200">
                  {project.long_description}
                </p>
              </section>
            </Reveal>
          )}

          {project.story && (
            <Reveal>
              <section>
                <h2 className="label">L’histoire du projet</h2>
                <p className="whitespace-pre-line font-serif text-lg italic leading-relaxed text-ink-200">
                  {project.story}
                </p>
              </section>
            </Reveal>
          )}

          {project.media.length > 0 && (
            <Reveal>
              <section>
                <h2 className="label">Galerie</h2>
                <ProjectMediaGallery media={project.media} />
              </section>
            </Reveal>
          )}

          {project.members.length > 0 && (
            <Reveal>
              <ProjectTeam members={project.members} />
            </Reveal>
          )}
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-10">
          {project.objectives.length > 0 && (
            <Reveal>
              <section>
                <h2 className="label flex items-center gap-2">
                  <Target size={14} /> Objectifs
                </h2>
                <ul className="space-y-3">
                  {project.objectives.map((o, i) => (
                    <li key={i} className="flex gap-3 text-ink-200">
                      <span className="font-mono text-xs text-ink-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {project.features.length > 0 && (
            <Reveal>
              <section>
                <h2 className="label flex items-center gap-2">
                  <Sparkles size={14} /> Fonctionnalités
                </h2>
                <ul className="space-y-2">
                  {project.features.map((f, i) => (
                    <li
                      key={i}
                      className="border-b border-ink-800/60 pb-2 text-ink-200"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          <Reveal>
            <section className="rounded-xl border border-ink-800/70 bg-ink-900/30 p-6 text-sm">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-ink-400">Statut</dt>
                  <dd className="text-paper">
                    <ProjectStatusBadge status={project.status} />
                  </dd>
                </div>
                {launch && (
                  <div className="flex justify-between">
                    <dt className="text-ink-400">Lancement</dt>
                    <dd className="text-paper">{launch}</dd>
                  </div>
                )}
                {project.current_stage && (
                  <div className="flex justify-between">
                    <dt className="text-ink-400">Étape</dt>
                    <dd className="text-paper">
                      {STAGE_LABELS[project.current_stage]}
                    </dd>
                  </div>
                )}
              </dl>
              {isPublished && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-6 w-full"
                >
                  Ouvrir {project.name}
                  <ArrowUpRight size={15} />
                </a>
              )}
            </section>
          </Reveal>
        </aside>
      </div>
    </article>
  );
}

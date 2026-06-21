// ===========================================================================
//  Page d'accueil — hero, vitrine de projets, démarche du studio, contact.
//  Plus de découpage « Chapitre 1/2/3 » : de vraies sections.
// ===========================================================================

import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { ChapterSection } from "@/components/ChapterSection";
import { WhyChapters } from "@/components/WhyChapters";
import { ProjectCard } from "@/components/ProjectCard";
import { IdeaSubmissionForm } from "@/components/IdeaSubmissionForm";
import { Reveal } from "@/components/animation/Reveal";
import { getShowcaseProjects } from "@/lib/queries/projects";
import { getSetting, getSocialLinks } from "@/lib/queries/settings";
import { SETTINGS_KEYS, SITE_DESCRIPTION } from "@/lib/constants";

export const revalidate = 120;

export default async function HomePage() {
  const [projects, heroSetting, social] = await Promise.all([
    getShowcaseProjects(6),
    getSetting(SETTINGS_KEYS.homeHero),
    getSocialLinks(),
  ]);

  const hero =
    heroSetting?.value && typeof heroSetting.value === "object"
      ? (heroSetting.value as { title?: string; paragraph?: string })
      : {};

  return (
    <>
      <HeroSection
        title={hero.title || ""}
        paragraph={hero.paragraph || SITE_DESCRIPTION}
        discordUrl={social.discord}
      />

      {/* ---- Vitrine de projets (1re section après le hero) ---- */}
      <ChapterSection
        id="projets"
        kicker="Projets"
        title="En avant"
        ghost="↗"
      >
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tightest text-paper sm:text-5xl md:text-6xl">
              Les projets du moment.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/projets" className="btn-ghost whitespace-nowrap">
              Voir tous les projets →
            </Link>
          </Reveal>
        </div>

        {projects.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={Math.min(i, 3) * 0.08}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="mt-12 rounded-2xl border border-dashed border-ink-700/60 p-12 text-center sm:p-16">
              <p className="font-display text-2xl font-semibold text-paper">
                Aucun projet public pour le moment.
              </p>
              <p className="mt-3 font-serif text-lg italic text-ink-300">
                Les prochains chapitres apparaîtront ici.
              </p>
            </div>
          </Reveal>
        )}
      </ChapterSection>

      {/* ---- Démarche du studio (interactif) ---- */}
      <ChapterSection
        id="studio"
        kicker="Le studio"
        title="Notre démarche"
        ghost="3"
        align="right"
      >
        <WhyChapters />

        <Reveal delay={0.1}>
          <p className="mt-12 max-w-2xl font-serif text-xl italic leading-relaxed text-ink-200 sm:text-2xl">
            « Chapitre 3 représente le passage entre ce que l’on imagine et ce
            que le monde peut enfin découvrir. »
          </p>
        </Reveal>
      </ChapterSection>

      {/* ---- Écrivez la suite ---- */}
      <section
        id="ecrire-la-suite"
        className="relative scroll-mt-24 overflow-hidden border-t border-ink-800/60 py-20 sm:py-32 lg:py-36"
      >
        <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.03]" />
        <div className="container-editorial relative z-10">
          <IdeaSubmissionForm />
        </div>
      </section>
    </>
  );
}

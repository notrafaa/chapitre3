// ===========================================================================
//  Page d'accueil — un livre de chapitres, sobre et interactif.
//  Chaque idée n'est présentée qu'une seule fois (pas de répétition).
// ===========================================================================

import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { ChapterSection } from "@/components/ChapterSection";
import { VisionWords } from "@/components/VisionWords";
import { WhyChapters } from "@/components/WhyChapters";
import { ProjectCard } from "@/components/ProjectCard";
import { IdeaSubmissionForm } from "@/components/IdeaSubmissionForm";
import { Reveal } from "@/components/animation/Reveal";
import { getFeaturedProjects } from "@/lib/queries/projects";
import { getSetting, getSocialLinks } from "@/lib/queries/settings";
import { SETTINGS_KEYS, SITE_DESCRIPTION } from "@/lib/constants";

export const revalidate = 120;

export default async function HomePage() {
  const [featured, heroSetting, social] = await Promise.all([
    getFeaturedProjects(3),
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

      {/* ---- Chapitre 01 — Notre vision ---- */}
      <ChapterSection id="vision" number="01" title="Notre vision" ghost="01">
        <Reveal>
          <h2 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tightest text-paper sm:text-5xl md:text-6xl">
            Trois gestes, une même obsession&nbsp;:
            <span className="headline-gradient"> créer ce qui reste.</span>
          </h2>
        </Reveal>

        <div className="mt-12">
          <VisionWords />
        </div>

        <Reveal delay={0.1}>
          <blockquote className="mt-16 max-w-3xl border-l border-ink-600/60 pl-6 font-serif text-2xl italic leading-relaxed text-ink-100 sm:text-3xl">
            « Nous ne voulons pas simplement créer des sites. Nous voulons créer
            des choses que les gens retiennent, utilisent et partagent. »
          </blockquote>
        </Reveal>
      </ChapterSection>

      {/* ---- Chapitre 02 — Nos projets ---- */}
      <ChapterSection number="02" title="Nos projets" ghost="02" align="right">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tightest text-paper sm:text-5xl md:text-6xl">
              Quelques chapitres
              <br className="hidden sm:block" /> déjà ouverts.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/projets" className="btn-ghost whitespace-nowrap">
              Voir tous les projets →
            </Link>
          </Reveal>
        </div>

        {featured.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.08}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="mt-12 rounded-2xl border border-dashed border-ink-700/60 p-12 text-center">
              <p className="font-serif text-xl italic text-ink-300">
                Les premiers projets seront bientôt dévoilés.
              </p>
            </div>
          </Reveal>
        )}
      </ChapterSection>

      {/* ---- Chapitre 03 — Pourquoi Chapitre 3 ? (interactif) ---- */}
      <ChapterSection number="03" title="Pourquoi Chapitre 3 ?" ghost="3" align="right">
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
        className="relative scroll-mt-24 overflow-hidden border-t border-ink-800/60 py-24 sm:py-32 lg:py-36"
      >
        <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.03]" />
        <div className="container-editorial relative z-10">
          <IdeaSubmissionForm />
        </div>
      </section>
    </>
  );
}

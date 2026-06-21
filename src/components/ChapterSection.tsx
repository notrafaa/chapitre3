"use client";

// ===========================================================================
//  ChapterSection — section éditoriale « Chapitre 0X — Titre » avec un
//  chiffre géant en arrière-plan.
// ===========================================================================

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/animation/Reveal";

interface ChapterSectionProps {
  /** Petit intitulé de section (remplace l'ancien « Chapitre N »). */
  kicker?: string;
  number?: string;
  title: string;
  id?: string;
  children: ReactNode;
  className?: string;
  /** Caractère géant affiché en filigrane. */
  ghost?: string;
  align?: "left" | "right";
}

export function ChapterSection({
  kicker,
  number,
  title,
  id,
  children,
  className,
  ghost,
  align = "left",
}: ChapterSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 78%", "end 24%"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 54]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [0.95, 0.62, 0.28]);
  const ghostBlur = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    reduce ? ["blur(0px)", "blur(0px)", "blur(0px)"] : ["blur(0px)", "blur(2px)", "blur(8px)"],
  );
  const washOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [0.18, 0.42, 0.22]);
  const accentScale = useTransform(scrollYProgress, [0, 0.55], [0.15, 1]);

  return (
    <section
      ref={ref}
      id={id}
      className={cn("chapter-section relative overflow-hidden py-20 sm:py-28 lg:py-32", className)}
    >
      <motion.div
        aria-hidden
        style={{ opacity: washOpacity }}
        className="pointer-events-none absolute inset-0 chapter-wash"
      />
      <div aria-hidden className="paper-texture pointer-events-none absolute inset-0 opacity-[0.018]" />
      <motion.div
        aria-hidden
        style={{ scaleX: accentScale }}
        className={cn(
          "pointer-events-none absolute top-0 h-px w-full origin-left chapter-accent-line",
          align === "right" && "origin-right",
        )}
      />

      {ghost && (
        <motion.span
          aria-hidden
          style={{ y: ghostY, opacity: ghostOpacity, filter: ghostBlur }}
          className={cn(
            "giant-number absolute top-5 text-[clamp(6rem,15vw,13rem)] leading-none sm:top-20",
            align === "right" ? "right-6 sm:right-[8vw]" : "left-3 sm:left-[4vw]",
          )}
        >
          {ghost}
        </motion.span>
      )}

      <div className="container-editorial relative z-10">
        <Reveal>
          <div className="chapter-tag mb-6">
            <span className="font-mono">{kicker ?? `Chapitre ${number ?? ""}`}</span>
            <span className="hairline w-12 flex-none" />
            <span>{title}</span>
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

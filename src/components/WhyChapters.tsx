"use client";

// ===========================================================================
//  WhyChapters — « Pourquoi Chapitre 3 ? » en onglets verticaux + grand texte.
//  Présentation volontairement différente de la grille « Notre vision ».
//  Défile automatiquement, réagit au survol / clic / clavier.
// ===========================================================================

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "L’idée",
    text: "Le premier chapitre, c’est l’idée — une intuition, une direction, l’envie de créer quelque chose qui compte.",
  },
  {
    n: "02",
    title: "La création",
    text: "Le deuxième, c’est la création — on dessine, on construit, on affine, jusqu’au moindre détail.",
  },
  {
    n: "03",
    title: "Le réel",
    text: "Le troisième, c’est le moment où elle devient réelle — le projet sort du carnet et rencontre le monde.",
  },
];

const INTERVAL = 4000;

export function WhyChapters() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(
      () => setActive((a) => (a + 1) % STEPS.length),
      INTERVAL,
    );
    return () => clearInterval(t);
  }, [reduce, paused]);

  const current = STEPS[active];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="grid gap-10 md:grid-cols-[15rem_1fr] md:gap-16"
    >
      {/* Onglets verticaux */}
      <div className="flex flex-col" role="tablist" aria-label="Les trois chapitres">
        {STEPS.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.n}
              role="tab"
              aria-selected={isActive}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "group relative flex items-center gap-4 border-l-2 py-4 pl-5 text-left transition-all duration-500 ease-book md:py-5",
                isActive ? "border-paper" : "border-ink-800 hover:border-ink-600",
              )}
            >
              <span
                className={cn(
                  "font-mono text-xs transition-colors duration-500",
                  isActive ? "text-paper" : "text-ink-500",
                )}
              >
                {s.n}
              </span>
              <span
                className={cn(
                  "font-display text-xl font-semibold transition-colors duration-500 sm:text-2xl",
                  isActive
                    ? "text-paper"
                    : "text-ink-500 group-hover:text-ink-200",
                )}
              >
                {s.title}
              </span>

              {/* progression de l'auto-défilement sur l'onglet actif */}
              {isActive && !reduce && !paused && (
                <motion.span
                  key={active}
                  aria-hidden
                  className="absolute -left-0.5 top-0 w-0.5 bg-paper"
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Grand texte du chapitre actif */}
      <div className="relative flex min-h-[14rem] items-center md:min-h-[18rem]">
        <span
          aria-hidden
          className="giant-number pointer-events-none absolute -top-6 right-0 text-[10rem] leading-none sm:text-[14rem]"
        >
          {current.n}
        </span>
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -14 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-2xl font-display text-3xl font-bold leading-[1.1] tracking-tightest text-paper sm:text-4xl md:text-5xl"
          >
            {current.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

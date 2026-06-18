"use client";

// ===========================================================================
//  HeroSection — hero d'accueil très visuel avec parallaxe discrète.
// ===========================================================================

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowDown } from "lucide-react";

interface HeroSectionProps {
  title: string;
  paragraph: string;
  discordUrl?: string;
}

function DiscordMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M19.54 5.23a16.9 16.9 0 0 0-4.12-1.27.07.07 0 0 0-.07.03 11.8 11.8 0 0 0-.51 1.05 15.6 15.6 0 0 0-4.68 0 10.7 10.7 0 0 0-.52-1.05.08.08 0 0 0-.07-.03c-1.42.25-2.8.68-4.12 1.27a.06.06 0 0 0-.03.02C2.8 9.17 2.08 13 2.43 16.78c0 .02.02.05.04.06a17 17 0 0 0 5.06 2.56.08.08 0 0 0 .08-.03c.39-.53.73-1.09 1.03-1.68a.08.08 0 0 0-.04-.1 11.2 11.2 0 0 1-1.58-.75.08.08 0 0 1 0-.13l.31-.24a.07.07 0 0 1 .08-.01 12.1 12.1 0 0 0 10.18 0 .07.07 0 0 1 .08.01l.31.24a.08.08 0 0 1-.01.13c-.5.3-1.03.55-1.58.75a.08.08 0 0 0-.04.1c.3.59.65 1.15 1.03 1.68a.08.08 0 0 0 .08.03 17 17 0 0 0 5.07-2.56.08.08 0 0 0 .03-.06c.42-4.38-.7-8.18-2.95-11.53a.06.06 0 0 0-.04-.03ZM8.68 14.48c-.99 0-1.8-.91-1.8-2.03 0-1.12.8-2.03 1.8-2.03 1 0 1.81.92 1.8 2.03 0 1.12-.8 2.03-1.8 2.03Zm6.65 0c-.99 0-1.8-.91-1.8-2.03 0-1.12.8-2.03 1.8-2.03 1 0 1.81.92 1.8 2.03 0 1.12-.8 2.03-1.8 2.03Z" />
    </svg>
  );
}

export function HeroSection({ title, paragraph, discordUrl }: HeroSectionProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yGhost = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Titre en lignes (fourni par les réglages, ou valeur par défaut).
  const lines = title.includes("\n")
    ? title.split("\n")
    : ["NOUS CRÉONS", "CE QUI MÉRITE", "D’EXISTER."];

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24"
    >
      {/* Repère éditorial 3, plus contenu et placé hors du bloc titre. */}
      <motion.span
        aria-hidden
        style={{ y: yGhost }}
        className="giant-number pointer-events-none absolute right-4 top-[18svh] text-[44vw] leading-none sm:right-[6vw] sm:top-1/2 sm:-translate-y-1/2 sm:text-[30vw] lg:text-[24rem]"
      >
        3
      </motion.span>

      <motion.div style={{ opacity }} className="container-editorial relative z-10">
        <h1 className="font-display font-bold uppercase leading-[0.92] tracking-tightest">
          {lines.map((line, i) => (
            <motion.span
              key={i}
              className="hero-headline-gradient relative block text-[14vw] sm:text-7xl md:text-8xl lg:text-9xl"
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {i === 0 && (
                <Image
                  src="/brand/logo2.png"
                  alt=""
                  width={571}
                  height={431}
                  priority
                  aria-hidden
                  className="pointer-events-none absolute left-[60%] -top-8 z-10 w-16 -rotate-6 select-none object-contain brightness-125 drop-shadow-[0_18px_18px_rgba(0,0,0,0.72)] sm:left-[52%] sm:-top-12 sm:w-28 md:left-[53%] md:-top-14 md:w-36 lg:left-[63.5%] lg:-top-16 lg:w-44"
                />
              )}
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mt-8 max-w-xl font-serif text-lg italic leading-relaxed text-ink-200 sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          « {paragraph} »
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/projets" className="btn-primary w-full sm:w-auto">
            Découvrir nos projets
            <ArrowRight size={16} />
          </Link>
          <a href="#ecrire-la-suite" className="btn-secondary w-full sm:w-auto">
            Ouvrir le prochain chapitre
            <ArrowDown size={16} />
          </a>
          {discordUrl && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5865F2] px-7 py-3.5 text-sm font-medium uppercase tracking-wider text-white shadow-lg shadow-[#5865F2]/20 transition-all duration-500 ease-book hover:bg-[#4752C4] hover:tracking-widest sm:w-auto"
            >
              <DiscordMark className="h-5 w-5" />
              Rejoindre le Discord
            </a>
          )}
        </motion.div>
      </motion.div>

      {/* Indice de défilement */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-500"
        animate={reduce ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ArrowDown size={20} />
      </motion.div>
    </section>
  );
}

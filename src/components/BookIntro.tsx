"use client";

// ===========================================================================
//  BookIntro — introduction plein écran.
//
//  Déroulé épuré :
//   1. Écran noir.
//   2. Le logo complet « chapitre 3 » se révèle (fondu + netteté + léger zoom).
//   3. Fondu doux vers l'accueil.
//
//  Affichée une fois par appareil (localStorage). Rejouable via le menu.
//  Démarre la musique d'ambiance (autoplay géré par SoundProvider).
// ===========================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/components/providers/SoundProvider";

const STORAGE_KEY = "c3_intro_seen";
export const PLAY_INTRO_EVENT = "c3:play-intro";

type Phase = "black" | "show" | "done";

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.7, 0, 0.84, 0] as const;

export function BookIntro() {
  const reduce = useReducedMotion();
  const sound = useSound();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("black");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const finish = useCallback(() => {
    clearTimers();
    setPhase("done");
    sound.duck(true); // la musique s'estompe après l'intro
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 1000);
    timers.current.push(t);
  }, [sound]);

  const runSequence = useCallback(() => {
    clearTimers();
    document.body.style.overflow = "hidden";
    sound.ensureStart();

    const schedule = (fn: () => void, ms: number) =>
      timers.current.push(setTimeout(fn, ms));

    setPhase("black");
    schedule(() => setPhase("show"), reduce ? 150 : 350);
    schedule(finish, reduce ? 1900 : 3600);
  }, [reduce, finish, sound]);

  const play = useCallback(() => {
    setVisible(true);
    runSequence();
  }, [runSequence]);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }
    if (!seen) play();

    const handler = () => play();
    window.addEventListener(PLAY_INTRO_EVENT, handler);
    return () => {
      window.removeEventListener(PLAY_INTRO_EVENT, handler);
      clearTimers();
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const show = phase === "show";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="book-intro"
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-ink-950"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "done" ? 0 : 1 }}
          exit={{ opacity: 0, filter: "blur(10px)", scale: 1.04 }}
          transition={{ duration: 1, ease: EASE_IN }}
          role="dialog"
          aria-label="Introduction Chapitre 3"
        >
          <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.04]" />

          {/* Logo complet « chapitre 3 » */}
          <motion.div
            className="relative z-10 flex w-full justify-center px-8"
            initial={{ opacity: 0, scale: 1.08, filter: "blur(14px)", y: 12 }}
            animate={
              show
                ? { opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }
                : { opacity: 0, scale: 1.08, filter: "blur(14px)", y: 12 }
            }
            transition={{ duration: 1.5, ease: EASE }}
          >
            <Image
              src="/brand/logo_complet.png"
              alt="Chapitre 3"
              width={1672}
              height={550}
              priority
              className="brand-complet h-auto w-[78vw] max-w-[680px] select-none object-contain"
            />
          </motion.div>

          {/* Bouton passer */}
          <button
            onClick={finish}
            className="group absolute bottom-7 right-6 z-20 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-400 transition-colors duration-300 hover:text-paper sm:bottom-8 sm:right-10"
          >
            Passer l’introduction
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

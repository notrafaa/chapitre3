"use client";

// ===========================================================================
//  SoundProvider — musique d'ambiance.
//   - AUCUN son par défaut : rien ne se lance sans action de l'utilisateur ;
//   - l'utilisateur active/désactive via un bouton clair ;
//   - volume bas, adapté mobile / desktop ;
//   - la préférence est sauvegardée ; un visiteur ayant activé le son
//     le retrouve actif (repris au 1er geste si l'autoplay est bloqué).
// ===========================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "c3-sound";
const AUDIO_SRC = "/audio/ambient.mp3";

/** Volume de base, plus bas sur mobile (écran tactile) que sur desktop. */
function baseVolumes() {
  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches;
  return coarse ? { full: 0.1, duck: 0.05 } : { full: 0.2, duck: 0.08 };
}

interface SoundContextValue {
  enabled: boolean;
  started: boolean;
  toggle: () => void;
  ensureStart: () => void;
  duck: (on: boolean) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      enabled: false,
      started: false,
      toggle: () => {},
      ensureStart: () => {},
      duck: () => {},
    };
  }
  return ctx;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Désactivé par défaut : aucun son sans consentement explicite.
  const [enabled, setEnabled] = useState(false);
  const [prefReady, setPrefReady] = useState(false);
  const [started, setStarted] = useState(false);
  const ducked = useRef(false);

  // Préférence sauvegardée (activé uniquement si l'utilisateur l'a choisi).
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "on") setEnabled(true);
    } catch {
      /* ignore */
    }
    setPrefReady(true);
  }, []);

  const targetVolume = useCallback(() => {
    const { full, duck } = baseVolumes();
    return ducked.current ? duck : full;
  }, []);

  /** Fondu progressif du volume vers la cible. */
  const fadeTo = useCallback((target: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    fadeRef.current = setInterval(() => {
      if (!audio) return;
      const diff = target - audio.volume;
      if (Math.abs(diff) < 0.015) {
        audio.volume = Math.max(0, Math.min(1, target));
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        return;
      }
      audio.volume = Math.max(0, Math.min(1, audio.volume + diff * 0.12));
    }, 40);
  }, []);

  const playNow = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    audio.volume = 0;
    const p = audio.play();
    if (p) {
      p.then(() => {
        setStarted(true);
        fadeTo(targetVolume());
      }).catch(() => {
        // Autoplay bloqué : reprise au premier geste (utilisateur déjà consentant).
      });
    }
  }, [fadeTo, targetVolume]);

  // Reprise pour un visiteur ayant DÉJÀ activé le son (préférence sauvegardée).
  useEffect(() => {
    if (!prefReady || !enabled) return;
    const audio = audioRef.current;
    if (audio && audio.paused) playNow();
    const onInteract = () => {
      const a = audioRef.current;
      if (a && a.paused) playNow();
    };
    const opts = { once: true } as AddEventListenerOptions;
    window.addEventListener("pointerdown", onInteract, opts);
    window.addEventListener("keydown", onInteract, opts);
    window.addEventListener("touchstart", onInteract, opts);
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, [prefReady, enabled, playNow]);

  useEffect(() => {
    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  // ensureStart ne démarre RIEN si le son n'est pas activé : pas d'autoplay.
  const ensureStart = useCallback(() => {
    if (!enabled) return;
    const audio = audioRef.current;
    if (audio && audio.paused) playNow();
  }, [enabled, playNow]);

  const duck = useCallback(
    (on: boolean) => {
      ducked.current = on;
      if (enabled) fadeTo(targetVolume());
    },
    [enabled, fadeTo, targetVolume],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      const audio = audioRef.current;
      if (audio) {
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
          pauseTimerRef.current = null;
        }
        if (next) {
          playNow();
        } else {
          fadeTo(0);
          pauseTimerRef.current = setTimeout(() => {
            audio.pause();
            setStarted(false);
            pauseTimerRef.current = null;
          }, 450);
        }
      }
      return next;
    });
  }, [playNow, fadeTo]);

  return (
    <SoundContext.Provider value={{ enabled, started, toggle, ensureStart, duck }}>
      {children}
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" aria-hidden />
    </SoundContext.Provider>
  );
}

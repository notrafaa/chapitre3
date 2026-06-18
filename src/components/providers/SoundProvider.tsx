"use client";

// ===========================================================================
//  SoundProvider — musique d'ambiance.
//   - tente de démarrer à l'arrivée sur le site, avec ou sans introduction ;
//   - reprend au 1er geste utilisateur si l'autoplay est bloqué ;
//   - s'estompe (duck) après l'intro pour rester discrète ;
//   - se coupe / réactive très facilement ; la préférence est sauvegardée.
//
//  ⚠️ Déposez votre piste dans public/audio/ambient.mp3
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
const VOL_FULL = 0.24;
const VOL_DUCK = 0.08;

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
  const [enabled, setEnabled] = useState(true);
  const [prefReady, setPrefReady] = useState(false);
  const [started, setStarted] = useState(false);
  const targetVol = useRef(VOL_FULL);
  const activeVol = useRef(VOL_FULL);

  // Préférence sauvegardée (par défaut : activé).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "off") setEnabled(false);
    } catch {
      /* ignore */
    }
    setPrefReady(true);
  }, []);

  /** Fondu progressif du volume vers la cible. */
  const fadeTo = useCallback((target: number) => {
    targetVol.current = target;
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    fadeRef.current = setInterval(() => {
      if (!audio) return;
      const diff = targetVol.current - audio.volume;
      if (Math.abs(diff) < 0.02) {
        audio.volume = Math.max(0, Math.min(1, targetVol.current));
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
        fadeTo(activeVol.current);
      }).catch(() => {
        // Autoplay bloqué : on réessaiera au premier geste utilisateur.
      });
    }
  }, [fadeTo]);

  useEffect(() => {
    if (!prefReady || !enabled) return;
    const audio = audioRef.current;
    if (audio && audio.paused) playNow();
  }, [prefReady, enabled, playNow]);

  // Reprise automatique au premier geste si l'autoplay a été bloqué.
  useEffect(() => {
    if (!prefReady || !enabled) return;
    const onInteract = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) playNow();
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

  const ensureStart = useCallback(() => {
    if (!enabled) return;
    const audio = audioRef.current;
    if (audio && audio.paused) playNow();
  }, [enabled, playNow]);

  const duck = useCallback(
    (on: boolean) => {
      activeVol.current = on ? VOL_DUCK : VOL_FULL;
      if (enabled) fadeTo(activeVol.current);
    },
    [enabled, fadeTo],
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
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" aria-hidden />
    </SoundContext.Provider>
  );
}

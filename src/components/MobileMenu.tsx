"use client";

// ===========================================================================
//  MobileMenu — menu plein écran qui s'ouvre « comme une page ».
// ===========================================================================

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, RotateCcw, ArrowRight } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { Logo } from "@/components/Logo";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onReplayIntro: () => void;
}

export function MobileMenu({ open, onClose, onReplayIntro }: MobileMenuProps) {
  // Verrouille le scroll de l'arrière-plan + fermeture sur Échap.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-ink-950 md:hidden"
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          aria-modal="true"
          role="dialog"
        >
          <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.04]" />

          <div className="container-editorial flex h-16 items-center justify-between">
            <button onClick={onClose} aria-label="Fermer le menu" className="text-paper">
              <X size={24} />
            </button>
            <Logo href={null} height={24} priority />
          </div>

          <nav className="container-editorial flex flex-1 flex-col justify-center">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="group flex items-center justify-between border-b border-ink-800/60 py-5"
                >
                  <span className="font-display text-4xl font-semibold text-paper transition-transform duration-300 group-hover:translate-x-2">
                    {link.label}
                  </span>
                  <ArrowRight
                    size={20}
                    className="text-ink-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-paper group-hover:opacity-100"
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="container-editorial flex flex-col gap-5 pb-10 pt-6">
            <div className="flex items-center gap-6">
              <ThemeToggle withLabel />
              <SoundToggle withLabel />
            </div>
            <button
              onClick={onReplayIntro}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-300 transition-colors hover:text-paper"
            >
              <RotateCcw size={14} />
              Rejouer l’introduction
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

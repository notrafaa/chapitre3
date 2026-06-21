"use client";

// ===========================================================================
//  MobileMenu — panneau plein écran, au-dessus de tout (z-[100]).
//  Croix toujours visible et cliquable, gros boutons, scroll verrouillé.
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
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-ink-950 md:hidden"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          aria-modal="true"
          role="dialog"
        >
          <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.04]" />

          {/* Barre haute : logo + croix (gros bouton toujours cliquable) */}
          <div className="relative z-10 flex h-16 items-center justify-between px-5">
            <Logo href={null} height={26} />
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-paper transition-colors hover:bg-paper/10"
            >
              <X size={26} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="relative z-10 flex flex-1 flex-col justify-center gap-1 px-5">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="group flex items-center justify-between border-b border-ink-800/60 py-5 active:bg-paper/5"
                >
                  <span className="font-display text-3xl font-semibold text-paper transition-transform duration-300 group-hover:translate-x-1">
                    {link.label}
                  </span>
                  <ArrowRight size={22} className="text-ink-500" />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Bas : réglages */}
          <div className="relative z-10 flex flex-col gap-5 px-5 pb-10 pt-6">
            <div className="flex items-center gap-3">
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

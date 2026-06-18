"use client";

// ===========================================================================
//  Header fixe et discret. Devient légèrement opaque au scroll.
//  Navigation desktop inline + menu plein écran sur mobile.
// ===========================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, RotateCcw } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/MobileMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SoundToggle } from "@/components/SoundToggle";
import { NAV_LINKS } from "@/lib/constants";
import { PLAY_INTRO_EVENT } from "@/components/BookIntro";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const replayIntro = () => {
    setMenuOpen(false);
    window.dispatchEvent(new Event(PLAY_INTRO_EVENT));
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-all duration-500 ease-book",
          scrolled
            ? "border-b border-ink-700/50 bg-ink-950/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        {/* Conteneur centré : le contenu reste vers le milieu (pas collé aux bords). */}
        <div className="container-editorial flex h-16 items-center justify-between sm:h-20">
          <Logo height={44} priority />

          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => {
              const target = link.href.split("#")[0] || "/";
              const active =
                target === "/"
                  ? pathname === "/" && !link.href.includes("#")
                  : pathname.startsWith(target);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xs uppercase tracking-[0.18em] transition-colors duration-300",
                    active ? "text-paper" : "text-ink-300 hover:text-paper",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <span className="mx-1 h-4 w-px bg-ink-700/60" aria-hidden />
            <ThemeToggle />
            <SoundToggle />
            <button
              onClick={replayIntro}
              title="Rejouer l'introduction"
              aria-label="Rejouer l'introduction"
              className="text-ink-400 transition-colors duration-300 hover:text-paper"
            >
              <RotateCcw size={16} />
            </button>
          </nav>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2 text-paper md:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            <span className="text-xs uppercase tracking-[0.2em]">Menu</span>
            <Menu size={20} />
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onReplayIntro={replayIntro}
      />
    </>
  );
}

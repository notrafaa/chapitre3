// ===========================================================================
//  404 — une page arrachée du livre.
// ===========================================================================

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-center">
      <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.04]" />

      <span
        aria-hidden
        className="giant-number absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[55vw] leading-none sm:text-[40vw]"
      >
        404
      </span>

      <div className="relative z-10">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500">
          Chapitre manquant
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tightest text-paper sm:text-6xl">
          Cette page n’a pas
          <br />
          encore été écrite.
        </h1>
        <p className="mx-auto mt-6 max-w-md font-serif text-lg italic text-ink-300">
          La page que vous cherchez n’existe pas, ou son chapitre reste à venir.
        </p>
        <Link href="/" className="btn-primary mt-10">
          ← Revenir au sommaire
        </Link>
      </div>
    </main>
  );
}

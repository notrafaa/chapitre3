"use client";

// ===========================================================================
//  Page d'erreur globale personnalisée.
// ===========================================================================

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-center">
      <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.04]" />
      <span
        aria-hidden
        className="giant-number absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[45vw] leading-none"
      >
        !
      </span>
      <div className="relative z-10">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500">
          Une rature
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tightest text-paper sm:text-6xl">
          Quelque chose s’est
          <br />
          mal écrit.
        </h1>
        <p className="mx-auto mt-6 max-w-md font-serif text-lg italic text-ink-300">
          Une erreur inattendue est survenue. Vous pouvez réessayer ou revenir au
          sommaire.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary">
            Réessayer
          </button>
          <Link href="/" className="btn-secondary">
            Revenir au sommaire
          </Link>
        </div>
      </div>
    </main>
  );
}

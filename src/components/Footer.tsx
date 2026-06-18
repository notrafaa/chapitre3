// ===========================================================================
//  Footer — la dernière page du livre.
// ===========================================================================

import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import type { SocialLinks } from "@/types";

const SOCIAL_ORDER: { key: keyof SocialLinks; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "x", label: "X" },
  { key: "youtube", label: "YouTube" },
  { key: "discord", label: "Discord" },
];

export function Footer({ social }: { social: SocialLinks }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-ink-800/60 bg-ink-950">
      <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.03]" />

      <div className="container-editorial relative py-20 sm:py-28">
        <p className="font-display text-5xl font-bold leading-[0.95] tracking-tightest text-paper sm:text-7xl md:text-8xl">
          CE N’EST QUE
          <br />
          <span className="text-outline">LE DÉBUT.</span>
        </p>

        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-ink-800/60 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="label">Navigation</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-300 transition-colors hover:text-paper"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="label">Réseaux</h3>
            <ul className="space-y-2">
              {SOCIAL_ORDER.map(({ key, label }) =>
                social[key] ? (
                  <li key={key}>
                    <a
                      href={social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink-300 transition-colors hover:text-paper"
                    >
                      {label} ↗
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </div>

          <div>
            <h3 className="label">Contact</h3>
            {social.email && (
              <a
                href={`mailto:${social.email}`}
                className="text-sm text-ink-300 transition-colors hover:text-paper"
              >
                {social.email}
              </a>
            )}
          </div>

          <div className="lg:text-right">
            <h3 className="label lg:text-right">Chapitre 3</h3>
            <p className="font-serif text-base italic text-ink-300">
              La maison créative qui imagine, construit et publie.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ink-800/60 pt-8 text-xs text-ink-500 sm:flex-row sm:items-center">
          <p>© {year} Chapitre 3 — La suite est en cours d’écriture.</p>
          <Link href="/admin" className="transition-colors hover:text-ink-300">
            Administration
          </Link>
        </div>
      </div>
    </footer>
  );
}

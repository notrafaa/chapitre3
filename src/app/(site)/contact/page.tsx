// ===========================================================================
//  /contact — formulaire fonctionnel + liens sociaux configurables.
// ===========================================================================

import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/animation/Reveal";
import { getSocialLinks, getContactEmail } from "@/lib/queries/settings";
import type { SocialLinks } from "@/types";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrivez à Chapitre 3. Un projet, une idée, une collaboration ?",
};

const SOCIAL_ORDER: { key: keyof SocialLinks; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "x", label: "X" },
  { key: "youtube", label: "YouTube" },
  { key: "discord", label: "Discord" },
];

export default async function ContactPage() {
  const [social, email] = await Promise.all([
    getSocialLinks(),
    getContactEmail(),
  ]);

  return (
    <div className="container-editorial grid grid-cols-1 gap-16 pb-28 pt-32 sm:pt-40 lg:grid-cols-2">
      <div>
        <Reveal>
          <span className="chapter-tag mb-6">
            <span className="font-mono">Contact</span>
            <span className="hairline w-12 flex-none" />
            <span>Écrivons-nous</span>
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-5xl font-bold leading-none tracking-tightest text-paper sm:text-7xl">
            Une idée&nbsp;?
            <br />
            <span className="text-outline">Parlons-en.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-md font-serif text-xl italic leading-relaxed text-ink-200">
            Un projet, une collaboration, une simple envie d’échanger&nbsp;?
            Cette page est faite pour vous.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 space-y-6">
            {email && (
              <div>
                <h2 className="label">Email</h2>
                <a
                  href={`mailto:${email}`}
                  className="text-lg text-paper transition-colors hover:text-chrome"
                >
                  {email}
                </a>
              </div>
            )}

            <div>
              <h2 className="label">Réseaux</h2>
              <ul className="flex flex-wrap gap-3">
                {SOCIAL_ORDER.map(({ key, label }) =>
                  social[key] ? (
                    <li key={key}>
                      <a
                        href={social[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink-700/60 px-4 py-2 text-sm text-ink-300 transition-colors hover:border-paper hover:text-paper"
                      >
                        {label} ↗
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="rounded-2xl border border-ink-800/70 bg-ink-900/30 p-6 sm:p-8">
          <ContactForm />
        </div>
      </Reveal>
    </div>
  );
}

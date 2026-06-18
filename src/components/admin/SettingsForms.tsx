"use client";

// ===========================================================================
//  SettingsForms — réglages du site : liens sociaux + textes d'accueil.
// ===========================================================================

import { useActionState, useEffect } from "react";
import { Save } from "lucide-react";
import {
  updateSocialLinksAction,
  updateHomeHeroAction,
} from "@/actions/settings";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";
import { ACTION_IDLE, type SocialLinks } from "@/types";

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@…" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/…" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@…" },
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/…" },
  { key: "email", label: "Email professionnel", placeholder: "contact@chapitre3.fr" },
];

export function SettingsForms({
  social,
  hero,
}: {
  social: SocialLinks;
  hero: { title?: string; paragraph?: string };
}) {
  const { toast } = useToast();
  const [socialState, socialAction] = useActionState(updateSocialLinksAction, ACTION_IDLE);
  const [heroState, heroAction] = useActionState(updateHomeHeroAction, ACTION_IDLE);

  useEffect(() => {
    if (socialState.message) toast(socialState.message, socialState.success ? "success" : "error");
  }, [socialState, toast]);
  useEffect(() => {
    if (heroState.message) toast(heroState.message, heroState.success ? "success" : "error");
  }, [heroState, toast]);

  return (
    <div className="space-y-8">
      {/* Liens sociaux */}
      <form
        action={socialAction}
        className="rounded-2xl border border-ink-800/70 bg-ink-900/30 p-6"
      >
        <h2 className="mb-5 font-display text-lg font-semibold text-paper">
          Liens sociaux & contact
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SOCIAL_FIELDS.map((f) => (
            <div key={f.key}>
              <label htmlFor={`s-${f.key}`} className="label">
                {f.label}
              </label>
              <input
                id={`s-${f.key}`}
                name={f.key}
                defaultValue={social[f.key] ?? ""}
                placeholder={f.placeholder}
                className="field"
              />
            </div>
          ))}
        </div>
        <div className="mt-5">
          <SubmitButton pendingLabel="Sauvegarde…">
            <Save size={15} /> Enregistrer les liens
          </SubmitButton>
        </div>
      </form>

      {/* Textes d'accueil */}
      <form
        action={heroAction}
        className="rounded-2xl border border-ink-800/70 bg-ink-900/30 p-6"
      >
        <h2 className="mb-5 font-display text-lg font-semibold text-paper">
          Hero d’accueil
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="hero-title" className="label">
              Titre
            </label>
            <input
              id="hero-title"
              name="title"
              defaultValue={hero.title ?? ""}
              className="field"
              placeholder="NOUS CRÉONS CE QUI MÉRITE D'EXISTER."
            />
          </div>
          <div>
            <label htmlFor="hero-paragraph" className="label">
              Paragraphe
            </label>
            <textarea
              id="hero-paragraph"
              name="paragraph"
              defaultValue={hero.paragraph ?? ""}
              rows={3}
              className="field resize-none"
            />
          </div>
        </div>
        <div className="mt-5">
          <SubmitButton pendingLabel="Sauvegarde…">
            <Save size={15} /> Enregistrer les textes
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

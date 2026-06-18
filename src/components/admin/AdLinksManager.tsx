"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { Check, Copy, ExternalLink, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import {
  createAdLinkAction,
  deleteAdLinkAction,
  toggleAdLinkAction,
} from "@/actions/ad-links";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";
import { ACTION_IDLE, type AdLink } from "@/types";

type CountryStat = {
  countryCode: string | null;
  count: number;
};

export type AdLinkWithStats = AdLink & {
  totalVisits: number;
  countries: CountryStat[];
  lastVisitAt: string | null;
};

function countryName(code: string | null) {
  if (!code) return "Inconnu";
  try {
    const names = new Intl.DisplayNames(["fr"], { type: "region" });
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Aucune visite";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdLinksManager({
  links,
  siteUrl,
}: {
  links: AdLinkWithStats[];
  siteUrl: string;
}) {
  const [state, formAction] = useActionState(createAdLinkAction, ACTION_IDLE);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) toast(state.message, state.success ? "success" : "error");
  }, [state, toast]);

  const origin = useMemo(() => siteUrl.replace(/\/$/, ""), [siteUrl]);

  const runLinkAction = (id: string, action: () => Promise<{ success: boolean; message: string }>) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await action();
      toast(res.message, res.success ? "success" : "error");
      setPendingId(null);
    });
  };

  const copyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast("Impossible de copier le lien.", "error");
    }
  };

  return (
    <div className="space-y-8">
      <form
        action={formAction}
        className="rounded-2xl border border-ink-800/70 bg-ink-900/30 p-6"
      >
        <h2 className="font-display text-xl font-semibold text-paper">
          Créer un lien personnalisé
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="ad-name" className="label">
              Nom de campagne
            </label>
            <input
              id="ad-name"
              name="name"
              className="field"
              placeholder="TikTok lancement, Discord bio..."
            />
            {state.fieldErrors?.name && (
              <p className="mt-1 text-xs text-red-400">{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="ad-slug" className="label">
              Slug du lien
            </label>
            <input id="ad-slug" name="slug" className="field" placeholder="tiktok-lancement" />
            {state.fieldErrors?.slug && (
              <p className="mt-1 text-xs text-red-400">{state.fieldErrors.slug[0]}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="ad-destination" className="label">
              Destination
            </label>
            <input
              id="ad-destination"
              name="destination_url"
              className="field"
              placeholder="/ ou https://..."
              defaultValue="/"
            />
            {state.fieldErrors?.destination_url && (
              <p className="mt-1 text-xs text-red-400">
                {state.fieldErrors.destination_url[0]}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="ad-description" className="label">
              Note <span className="text-ink-500">(facultatif)</span>
            </label>
            <textarea
              id="ad-description"
              name="description"
              rows={3}
              className="field resize-none"
              placeholder="Où ce lien sera posté, objectif de la campagne..."
            />
          </div>
        </div>
        <div className="mt-5">
          <SubmitButton pendingLabel="Création...">Créer le lien</SubmitButton>
        </div>
      </form>

      <div className="space-y-4">
        {links.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-700/60 p-10 text-center text-ink-400">
            Aucun lien publicitaire pour l’instant.
          </p>
        ) : (
          links.map((link) => {
            const url = `${origin}/r/${link.slug}`;
            const actionDisabled = isPending && pendingId === link.id;

            return (
              <article
                key={link.id}
                className="rounded-2xl border border-ink-800/70 bg-ink-900/30 p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-xl font-semibold text-paper">
                        {link.name}
                      </h3>
                      <span className="rounded-full border border-ink-700/60 px-2.5 py-1 text-xs text-ink-300">
                        {link.active ? "Actif" : "Désactivé"}
                      </span>
                    </div>
                    <p className="mt-2 break-all font-mono text-sm text-ink-300">{url}</p>
                    {link.description && (
                      <p className="mt-2 text-sm text-ink-400">{link.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyLink(link.id, url)}
                      className="inline-flex items-center gap-2 rounded-lg border border-ink-700/60 px-3 py-2 text-sm text-ink-300 transition-colors hover:border-paper/60 hover:text-paper"
                    >
                      {copiedId === link.id ? <Check size={15} /> : <Copy size={15} />}
                      {copiedId === link.id ? "Copié" : "Copier"}
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-lg border border-ink-700/60 px-3 py-2 text-sm text-ink-300 transition-colors hover:border-paper/60 hover:text-paper"
                    >
                      <ExternalLink size={15} /> Ouvrir
                    </a>
                    <button
                      type="button"
                      disabled={actionDisabled}
                      onClick={() =>
                        runLinkAction(link.id, () => toggleAdLinkAction(link.id, !link.active))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-ink-700/60 px-3 py-2 text-sm text-ink-300 transition-colors hover:border-paper/60 hover:text-paper disabled:opacity-50"
                    >
                      {link.active ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                      {link.active ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      type="button"
                      disabled={actionDisabled}
                      onClick={() => runLinkAction(link.id, () => deleteAdLinkAction(link.id))}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 transition-colors hover:border-red-400 hover:text-red-200 disabled:opacity-50"
                    >
                      <Trash2 size={15} /> Supprimer
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-ink-800/60 pt-5 sm:grid-cols-3">
                  <div>
                    <p className="label mb-1">Visites</p>
                    <p className="font-display text-3xl font-bold text-paper">
                      {link.totalVisits}
                    </p>
                  </div>
                  <div>
                    <p className="label mb-1">Dernière visite</p>
                    <p className="text-sm text-ink-300">{formatDate(link.lastVisitAt)}</p>
                  </div>
                  <div>
                    <p className="label mb-1">Pays</p>
                    {link.countries.length === 0 ? (
                      <p className="text-sm text-ink-500">Aucune donnée</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {link.countries.slice(0, 6).map((country) => (
                          <span
                            key={country.countryCode ?? "unknown"}
                            className="rounded-full bg-paper/5 px-2.5 py-1 text-xs text-ink-300"
                          >
                            {countryName(country.countryCode)} · {country.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

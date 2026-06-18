"use client";

// ===========================================================================
//  ProjectEditor — création / édition complète d'un projet.
// ===========================================================================

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Wand2, Eye, ArrowLeft } from "lucide-react";
import { saveProjectAction } from "@/actions/projects";
import { SingleImageUploader, MediaUploader } from "@/components/admin/MediaUploader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";
import { slugify } from "@/lib/utils";
import {
  STATUS_LABELS,
  VISIBILITY_LABELS,
  STAGE_LABELS,
  STAGE_ORDER,
} from "@/lib/constants";
import { ACTION_IDLE, type ProjectWithMedia } from "@/types";

const STATUSES = Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[];
const VISIBILITIES = Object.keys(VISIBILITY_LABELS) as (keyof typeof VISIBILITY_LABELS)[];

export function ProjectEditor({ project }: { project?: ProjectWithMedia }) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(saveProjectAction, ACTION_IDLE);

  const [name, setName] = useState(project?.name ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");

  useEffect(() => {
    if (state.success) {
      toast(state.message, "success");
      router.push("/admin/projects");
      router.refresh();
    } else if (state.message && !state.fieldErrors) {
      toast(state.message, "error");
    }
  }, [state, toast, router]);

  const err = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-10">
      {project?.id && <input type="hidden" name="id" value={project.id} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-paper"
        >
          <ArrowLeft size={15} /> Retour aux projets
        </Link>
        <div className="flex items-center gap-3">
          {project?.slug && (
            <Link
              href={`/admin/preview/${project.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-ink-700/60 px-4 py-2 text-sm text-paper transition-colors hover:border-paper/60"
            >
              <Eye size={15} /> Prévisualiser
            </Link>
          )}
          <SubmitButton pendingLabel="Sauvegarde…">
            <Save size={15} /> Enregistrer
          </SubmitButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Informations">
            <Field label="Nom" error={err("name")}>
              <input
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!project?.id && (!slug || slug === slugify(name)))
                    setSlug(slugify(e.target.value));
                }}
                required
                className="field"
                placeholder="Nom du projet"
              />
            </Field>

            <Field label="Slug" error={err("slug")} hint="Utilisé dans l'URL : /projets/[slug]">
              <div className="flex gap-2">
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="field"
                  placeholder="mon-projet"
                />
                <button
                  type="button"
                  onClick={() => setSlug(slugify(name))}
                  className="inline-flex flex-none items-center gap-1.5 rounded-lg border border-ink-700/60 px-3 text-sm text-ink-300 hover:text-paper"
                  title="Générer depuis le nom"
                >
                  <Wand2 size={14} />
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Numéro" error={err("project_number")}>
                <input
                  name="project_number"
                  type="number"
                  min={0}
                  defaultValue={project?.project_number ?? 0}
                  className="field"
                />
              </Field>
              <Field label="Catégorie">
                <input
                  name="category"
                  defaultValue={project?.category ?? ""}
                  className="field"
                  placeholder="Productivité, Média…"
                />
              </Field>
            </div>

            <Field label="Description courte">
              <textarea
                name="short_description"
                defaultValue={project?.short_description ?? ""}
                rows={2}
                className="field resize-none"
                placeholder="Une phrase qui résume le projet."
              />
            </Field>

            <Field label="Description longue">
              <textarea
                name="long_description"
                defaultValue={project?.long_description ?? ""}
                rows={5}
                className="field resize-none"
              />
            </Field>

            <Field label="Histoire du projet">
              <textarea
                name="story"
                defaultValue={project?.story ?? ""}
                rows={4}
                className="field resize-none"
                placeholder="Le récit derrière le projet."
              />
            </Field>
          </Section>

          <Section title="Objectifs & fonctionnalités">
            <Field label="Objectifs" hint="Un objectif par ligne">
              <textarea
                name="objectives"
                defaultValue={project?.objectives.join("\n") ?? ""}
                rows={4}
                className="field resize-none font-mono text-sm"
                placeholder={"Rendre X simple\nZéro friction"}
              />
            </Field>
            <Field label="Fonctionnalités" hint="Une fonctionnalité par ligne">
              <textarea
                name="features"
                defaultValue={project?.features.join("\n") ?? ""}
                rows={4}
                className="field resize-none font-mono text-sm"
              />
            </Field>
          </Section>

          <Section title="Médias">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SingleImageUploader name="logo_url" defaultValue={project?.logo_url ?? ""} folder="logos" label="Logo" />
              <SingleImageUploader name="cover_url" defaultValue={project?.cover_url ?? ""} folder="covers" label="Couverture" />
            </div>
            <div className="mt-6">
              <span className="label">Galerie (images & vidéos courtes)</span>
              <MediaUploader initial={project?.media ?? []} />
            </div>
          </Section>
        </div>

        {/* Colonne latérale — publication */}
        <div className="space-y-6">
          <Section title="Publication">
            <Field label="Statut">
              <select name="status" defaultValue={project?.status ?? "idea"} className="field">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Visibilité" hint="public · teaser · confidentiel">
              <select name="visibility" defaultValue={project?.visibility ?? "public"} className="field">
                {VISIBILITIES.map((v) => (
                  <option key={v} value={v}>
                    {VISIBILITY_LABELS[v]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Étape actuelle">
              <select name="current_stage" defaultValue={project?.current_stage ?? ""} className="field">
                <option value="">—</option>
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="URL externe / sous-domaine" error={err("external_url")} hint="Sinon https://[slug].chapitre3.fr">
              <input
                name="external_url"
                defaultValue={project?.external_url ?? ""}
                className="field"
                placeholder="https://synk.chapitre3.fr"
              />
            </Field>

            <Field label="Date de lancement" error={err("launch_date")}>
              <input
                name="launch_date"
                type="date"
                defaultValue={project?.launch_date ?? ""}
                className="field"
              />
            </Field>

            <Field label="Ordre d'affichage">
              <input
                name="display_order"
                type="number"
                min={0}
                defaultValue={project?.display_order ?? 0}
                className="field"
              />
            </Field>

            <label className="flex items-center gap-3 pt-2 text-sm text-ink-200">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={project?.featured ?? false}
                className="h-4 w-4 accent-paper"
              />
              Mettre en avant sur l’accueil
            </label>
          </Section>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-800/70 bg-ink-900/30 p-6">
      <h2 className="mb-5 font-display text-lg font-semibold text-paper">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

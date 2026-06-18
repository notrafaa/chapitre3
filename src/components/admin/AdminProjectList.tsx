"use client";

// ===========================================================================
//  AdminProjectList — liste des projets : réorganisation, mise en avant,
//  publication, suppression.
// ===========================================================================

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  GripVertical,
  Star,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { useToast } from "@/components/ui/Toaster";
import {
  reorderProjectsAction,
  toggleFeaturedAction,
  togglePublishAction,
  deleteProjectAction,
} from "@/actions/projects";
import { VISIBILITY_LABELS } from "@/lib/constants";
import { formatProjectNumber, cn } from "@/lib/utils";
import type { Project } from "@/types";

export function AdminProjectList({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial);
  const [, startTransition] = useTransition();
  const dragIndex = useRef<number | null>(null);
  const { toast } = useToast();

  const persistOrder = (list: Project[]) => {
    startTransition(async () => {
      const res = await reorderProjectsAction(list.map((p) => p.id));
      if (!res.success) toast(res.message, "error");
    });
  };

  const onDrop = (index: number) => {
    if (dragIndex.current === null || dragIndex.current === index) return;
    const next = [...projects];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    setProjects(next);
    dragIndex.current = null;
    persistOrder(next);
  };

  const onFeature = (p: Project) => {
    setProjects((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)),
    );
    startTransition(async () => {
      const res = await toggleFeaturedAction(p.id, !p.featured);
      if (!res.success) toast(res.message, "error");
    });
  };

  const onPublish = (p: Project) => {
    const publish = p.status !== "published";
    startTransition(async () => {
      const res = await togglePublishAction(p.id, publish);
      if (res.success) {
        setProjects((prev) =>
          prev.map((x) =>
            x.id === p.id
              ? {
                  ...x,
                  status: publish ? "published" : "paused",
                  visibility: publish ? "public" : "private",
                }
              : x,
          ),
        );
        toast(res.message, "success");
      } else {
        toast(res.message, "error");
      }
    });
  };

  const onDelete = async (p: Project) => {
    const res = await deleteProjectAction(p.id);
    if (res.success) {
      setProjects((prev) => prev.filter((x) => x.id !== p.id));
      toast(res.message, "success");
    } else {
      toast(res.message, "error");
    }
  };

  if (!projects.length) {
    return (
      <p className="rounded-xl border border-dashed border-ink-700/60 p-10 text-center text-ink-400">
        Aucun projet pour l’instant. Créez le premier chapitre.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {projects.map((p, i) => (
        <li
          key={p.id}
          draggable
          onDragStart={() => (dragIndex.current = i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(i)}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-800/70 bg-ink-900/30 p-3 sm:flex-nowrap"
        >
          <GripVertical size={16} className="flex-none cursor-grab text-ink-600" />
          <span className="w-10 flex-none font-mono text-xs text-ink-500">
            {formatProjectNumber(p.project_number)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-paper">{p.name}</p>
            <p className="truncate text-xs text-ink-500">
              /{p.slug} · {VISIBILITY_LABELS[p.visibility]}
            </p>
          </div>

          <ProjectStatusBadge status={p.status} className="flex-none" />

          <div className="flex flex-none items-center gap-1">
            <button
              onClick={() => onFeature(p)}
              title={p.featured ? "Retirer de l'accueil" : "Mettre en avant"}
              className={cn(
                "rounded-lg p-2 transition-colors",
                p.featured ? "text-amber-300" : "text-ink-500 hover:text-paper",
              )}
            >
              <Star size={16} fill={p.featured ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => onPublish(p)}
              title={p.status === "published" ? "Dépublier" : "Publier"}
              className="rounded-lg p-2 text-ink-500 transition-colors hover:text-paper"
            >
              {p.status === "published" ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            <Link
              href={`/admin/projects/${p.id}`}
              title="Modifier"
              className="rounded-lg p-2 text-ink-500 transition-colors hover:text-paper"
            >
              <Pencil size={16} />
            </Link>

            <DeleteConfirmationDialog
              title={`Supprimer « ${p.name} » ?`}
              description="Le projet et ses médias seront définitivement supprimés."
              onConfirm={() => onDelete(p)}
              trigger={
                <button
                  title="Supprimer"
                  className="rounded-lg p-2 text-ink-500 transition-colors hover:text-red-300"
                >
                  <Trash2 size={16} />
                </button>
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

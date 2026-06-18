"use client";

// ===========================================================================
//  SubmissionList — idées proposées par les visiteurs.
// ===========================================================================

import { useState, useTransition } from "react";
import { Trash2, Mail } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { useToast } from "@/components/ui/Toaster";
import {
  updateSubmissionStatusAction,
  deleteSubmissionAction,
} from "@/actions/admin-data";
import { formatDateTimeFr } from "@/lib/utils";
import type { ProjectSubmission, SubmissionStatus } from "@/types";

const STATUS: { value: SubmissionStatus; label: string }[] = [
  { value: "new", label: "Nouvelle" },
  { value: "reviewing", label: "En cours" },
  { value: "contacted", label: "Contacté" },
  { value: "archived", label: "Archivée" },
];

export function SubmissionList({ initial }: { initial: ProjectSubmission[] }) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const setStatus = (id: string, status: SubmissionStatus) => {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
    startTransition(async () => {
      const res = await updateSubmissionStatusAction(id, status);
      if (!res.success) toast(res.message, "error");
    });
  };

  const remove = async (id: string) => {
    const res = await deleteSubmissionAction(id);
    if (res.success) {
      setItems((p) => p.filter((x) => x.id !== id));
      toast(res.message, "success");
    } else toast(res.message, "error");
  };

  if (!items.length) {
    return <Empty>Aucune idée proposée pour l’instant.</Empty>;
  }

  return (
    <div className="space-y-4">
      {items.map((s) => (
        <article
          key={s.id}
          className="rounded-2xl border border-ink-800/70 bg-ink-900/30 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-paper">
                {s.project_name || "Idée sans titre"}
              </h3>
              <p className="text-xs text-ink-500">{formatDateTimeFr(s.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={s.status}
                onChange={(e) => setStatus(s.id, e.target.value as SubmissionStatus)}
                className="rounded-lg border border-ink-700/60 bg-ink-950 px-2 py-1.5 text-xs text-paper"
              >
                {STATUS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <DeleteConfirmationDialog
                title="Supprimer cette idée ?"
                onConfirm={() => remove(s.id)}
                trigger={
                  <button className="rounded-lg p-2 text-ink-500 hover:text-red-300">
                    <Trash2 size={15} />
                  </button>
                }
              />
            </div>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm text-ink-200">{s.idea}</p>

          <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-ink-800/60 pt-3 text-xs text-ink-400 sm:grid-cols-4">
            <Detail label="Nom">{s.name || "—"}</Detail>
            <Detail label="Email">
              <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 text-ink-200 hover:text-paper">
                <Mail size={11} /> {s.email}
              </a>
            </Detail>
            <Detail label="Contact">{s.contact_method || "—"}</Detail>
            <Detail label="Aide">{s.help_type || "—"}</Detail>
          </dl>
        </article>
      ))}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="uppercase tracking-[0.12em] text-ink-600">{label}</dt>
      <dd className="mt-0.5 truncate text-ink-200">{children}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-ink-700/60 p-10 text-center text-ink-400">
      {children}
    </p>
  );
}

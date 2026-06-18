"use client";

// ===========================================================================
//  MessageList — messages de contact.
// ===========================================================================

import { useState, useTransition } from "react";
import { Trash2, Mail } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { useToast } from "@/components/ui/Toaster";
import {
  updateContactStatusAction,
  deleteContactAction,
} from "@/actions/admin-data";
import { formatDateTimeFr, cn } from "@/lib/utils";
import type { ContactMessage, ContactStatus } from "@/types";

const STATUS: { value: ContactStatus; label: string }[] = [
  { value: "new", label: "Nouveau" },
  { value: "read", label: "Lu" },
  { value: "replied", label: "Répondu" },
  { value: "archived", label: "Archivé" },
];

export function MessageList({ initial }: { initial: ContactMessage[] }) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const setStatus = (id: string, status: ContactStatus) => {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
    startTransition(async () => {
      const res = await updateContactStatusAction(id, status);
      if (!res.success) toast(res.message, "error");
    });
  };

  const remove = async (id: string) => {
    const res = await deleteContactAction(id);
    if (res.success) {
      setItems((p) => p.filter((x) => x.id !== id));
      toast(res.message, "success");
    } else toast(res.message, "error");
  };

  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed border-ink-700/60 p-10 text-center text-ink-400">
        Aucun message pour l’instant.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((m) => (
        <article
          key={m.id}
          className={cn(
            "rounded-2xl border bg-ink-900/30 p-5",
            m.status === "new" ? "border-paper/30" : "border-ink-800/70",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-paper">
                {m.subject || "Sans objet"}
              </h3>
              <p className="text-xs text-ink-500">
                {m.name} · {formatDateTimeFr(m.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={m.status}
                onChange={(e) => setStatus(m.id, e.target.value as ContactStatus)}
                className="rounded-lg border border-ink-700/60 bg-ink-950 px-2 py-1.5 text-xs text-paper"
              >
                {STATUS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <DeleteConfirmationDialog
                title="Supprimer ce message ?"
                onConfirm={() => remove(m.id)}
                trigger={
                  <button className="rounded-lg p-2 text-ink-500 hover:text-red-300">
                    <Trash2 size={15} />
                  </button>
                }
              />
            </div>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm text-ink-200">{m.message}</p>

          <a
            href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Votre message")}`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-300 hover:text-paper"
          >
            <Mail size={12} /> Répondre à {m.email}
          </a>
        </article>
      ))}
    </div>
  );
}

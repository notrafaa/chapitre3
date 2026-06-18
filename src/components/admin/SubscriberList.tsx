"use client";

// ===========================================================================
//  SubscriberList — inscriptions aux lancements (reliées à un projet).
// ===========================================================================

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { useToast } from "@/components/ui/Toaster";
import { deleteSubscriberAction } from "@/actions/admin-data";
import { formatDateTimeFr } from "@/lib/utils";

export interface SubscriberRow {
  id: string;
  email: string;
  created_at: string;
  projectName: string;
}

export function SubscriberList({ initial }: { initial: SubscriberRow[] }) {
  const [items, setItems] = useState(initial);
  const { toast } = useToast();

  const remove = async (id: string) => {
    const res = await deleteSubscriberAction(id);
    if (res.success) {
      setItems((p) => p.filter((x) => x.id !== id));
      toast(res.message, "success");
    } else toast(res.message, "error");
  };

  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed border-ink-700/60 p-10 text-center text-ink-400">
        Aucune inscription pour l’instant.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-800/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-800/70 bg-ink-900/50 text-left text-xs uppercase tracking-[0.12em] text-ink-400">
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Projet</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-b border-ink-800/50 last:border-0">
              <td className="px-4 py-3 text-ink-100">
                <a href={`mailto:${s.email}`} className="hover:text-paper">
                  {s.email}
                </a>
              </td>
              <td className="px-4 py-3 text-ink-300">{s.projectName}</td>
              <td className="hidden px-4 py-3 text-ink-500 sm:table-cell">
                {formatDateTimeFr(s.created_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <DeleteConfirmationDialog
                  title="Supprimer cette inscription ?"
                  onConfirm={() => remove(s.id)}
                  trigger={
                    <button className="rounded-lg p-1.5 text-ink-500 hover:text-red-300">
                      <Trash2 size={15} />
                    </button>
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

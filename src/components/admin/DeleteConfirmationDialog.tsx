"use client";

// ===========================================================================
//  DeleteConfirmationDialog — confirmation avant suppression.
// ===========================================================================

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

export function DeleteConfirmationDialog({
  trigger,
  title = "Confirmer la suppression",
  description = "Cette action est irréversible.",
  confirmLabel = "Supprimer",
  onConfirm,
}: {
  trigger: ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-950/80 p-6 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pending && setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-ink-700/70 bg-ink-900 p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3 text-red-300">
                <AlertTriangle size={22} />
                <h2 className="font-display text-xl font-semibold text-paper">{title}</h2>
              </div>
              <p className="text-sm text-ink-300">{description}</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="rounded-lg px-4 py-2 text-sm text-ink-300 transition-colors hover:text-paper"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                >
                  {pending && <Loader2 size={15} className="animate-spin" />}
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

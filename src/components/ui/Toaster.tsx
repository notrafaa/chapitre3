"use client";

// ===========================================================================
//  Notifications élégantes (toasts) — contexte + rendu animé.
// ===========================================================================

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback silencieux hors provider (ne casse jamais le rendu).
    return { toast: () => {} };
  }
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-ink-600/70 bg-ink-900/95 px-4 py-3 shadow-2xl backdrop-blur"
              role="status"
            >
              <span
                className={
                  t.type === "success"
                    ? "mt-0.5 text-emerald-400"
                    : t.type === "error"
                      ? "mt-0.5 text-red-400"
                      : "mt-0.5 text-chrome"
                }
              >
                {t.type === "success" ? (
                  <Check size={18} />
                ) : t.type === "error" ? (
                  <AlertTriangle size={18} />
                ) : (
                  <Check size={18} />
                )}
              </span>
              <p className="flex-1 text-sm leading-snug text-paper">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="text-ink-400 transition-colors hover:text-paper"
                aria-label="Fermer la notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

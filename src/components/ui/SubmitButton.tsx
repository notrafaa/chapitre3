"use client";

// ===========================================================================
//  Bouton de soumission avec état « en cours » (useFormStatus).
// ===========================================================================

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SubmitButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  pendingLabel?: string;
}

export function SubmitButton({
  children,
  className,
  variant = "primary",
  pendingLabel = "Envoi…",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        variant === "primary" ? "btn-primary" : "btn-secondary",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

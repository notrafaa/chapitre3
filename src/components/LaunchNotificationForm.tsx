"use client";

// ===========================================================================
//  LaunchNotificationForm — « Être prévenu du lancement ».
// ===========================================================================

import { useActionState, useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { subscribeLaunchAction } from "@/actions/public";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";
import { ACTION_IDLE } from "@/types";
import { cn } from "@/lib/utils";

export function LaunchNotificationForm({
  projectId,
  compact = false,
}: {
  projectId: string;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(subscribeLaunchAction, ACTION_IDLE);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      setDone(true);
      toast(state.message, "success");
    } else if (state.message) {
      toast(state.message, "error");
    }
  }, [state, toast]);

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-300">
        <Check size={16} /> {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={cn("w-full", compact ? "" : "max-w-md")}>
      <input type="hidden" name="project_id" value={projectId} />
      {/* honeypot anti-spam */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`launch-email-${projectId}`}>
          Votre adresse email
        </label>
        <input
          id={`launch-email-${projectId}`}
          type="email"
          name="email"
          required
          placeholder="votre@email.fr"
          className="field flex-1"
        />
        <SubmitButton variant="secondary" pendingLabel="…">
          <Bell size={15} />
          Être prévenu
        </SubmitButton>
      </div>
      {state.fieldErrors?.email && (
        <p className="mt-2 text-xs text-red-400">{state.fieldErrors.email[0]}</p>
      )}
    </form>
  );
}

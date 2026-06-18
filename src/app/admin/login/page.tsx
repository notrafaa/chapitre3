"use client";

// ===========================================================================
//  /admin/login — connexion administrateur (Supabase Auth).
// ===========================================================================

import { useActionState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { useToast } from "@/components/ui/Toaster";
import { useFormStatus } from "react-dom";
import { ACTION_IDLE } from "@/types";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
      Se connecter
    </button>
  );
}

function LoginForm() {
  const [state, formAction] = useActionState(loginAction, ACTION_IDLE);
  const params = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (params.get("error") === "unauthorized") {
      toast("Accès non autorisé à l'administration.", "error");
    }
  }, [params, toast]);

  useEffect(() => {
    if (state.message && !state.success) toast(state.message, "error");
  }, [state, toast]);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" required className="field" autoComplete="email" />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="label">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="field"
          autoComplete="current-password"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      <SubmitBtn />
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-950 px-6">
      <div className="paper-texture pointer-events-none absolute inset-0 opacity-[0.04]" />
      <span aria-hidden className="giant-number absolute right-[-5vw] top-1/2 -translate-y-1/2 text-[40vw]">
        3
      </span>
      <div className="relative z-10 flex w-full flex-col items-center">
        <span className="font-display text-2xl font-bold tracking-tightest text-paper">
          Chapitre 3
        </span>
        <p className="mb-10 mt-1 text-xs uppercase tracking-[0.3em] text-ink-500">
          Administration
        </p>
        <Suspense fallback={<Loader2 className="animate-spin text-ink-400" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

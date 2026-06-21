"use client";

// ===========================================================================
//  ContactForm — connecté à Supabase, avec :
//   - CAPTCHA Turnstile optionnel (activé si la clé publique existe) ;
//   - cooldown anti-spam de 10 s (client + serveur) ;
//   - bouton désactivé tant que le formulaire n'est pas prêt.
// ===========================================================================

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { Send, Check, Loader2 } from "lucide-react";
import { submitContactAction } from "@/actions/public";
import { Turnstile } from "@/components/Turnstile";
import { useToast } from "@/components/ui/Toaster";
import { ACTION_IDLE } from "@/types";
import { cn } from "@/lib/utils";

const COOLDOWN_S = 10;
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, ACTION_IDLE);
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [token, setToken] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const captchaRequired = Boolean(SITE_KEY);
  const onToken = useCallback((t: string) => setToken(t), []);

  const updateValue =
    (field: keyof typeof values) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  useEffect(() => {
    if (state.success) {
      toast(state.message, "success");
    } else if (state.message && !state.fieldErrors) {
      toast(state.message, "error");
    }
  }, [state, toast]);

  // Décompte du cooldown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-8 text-center">
        <Check className="mx-auto mb-4 text-emerald-300" size={32} />
        <p className="font-display text-2xl text-paper">Message envoyé</p>
        <p className="mt-2 text-ink-300">{state.message}</p>
      </div>
    );
  }

  const fieldsValid =
    values.name.trim().length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim()) &&
    values.message.trim().length >= 10;

  const ready = fieldsValid && (!captchaRequired || token.length > 0) && cooldown <= 0;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => setCooldown(COOLDOWN_S)}
      className="space-y-5"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <input type="hidden" name="captcha_token" value={token} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">
            Nom
          </label>
          <input
            id="contact-name"
            name="name"
            required
            className="field"
            placeholder="Votre nom"
            value={values.name}
            onChange={updateValue("name")}
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.name[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="label">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className="field"
            placeholder="votre@email.fr"
            value={values.email}
            onChange={updateValue("email")}
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-red-400">{state.fieldErrors.email[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="label">
          Sujet <span className="text-ink-500">(facultatif)</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          className="field"
          placeholder="L'objet de votre message"
          value={values.subject}
          onChange={updateValue("subject")}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="label">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="field resize-none"
          placeholder="Dites-nous tout…"
          value={values.message}
          onChange={updateValue("message")}
        />
        {state.fieldErrors?.message && (
          <p className="mt-1 text-xs text-red-400">{state.fieldErrors.message[0]}</p>
        )}
      </div>

      {captchaRequired && SITE_KEY && (
        <Turnstile siteKey={SITE_KEY} onToken={onToken} />
      )}

      <ContactSubmit ready={ready} cooldown={cooldown} />
    </form>
  );
}

function ContactSubmit({
  ready,
  cooldown,
}: {
  ready: boolean;
  cooldown: number;
}) {
  const { pending } = useFormStatus();
  const disabled = pending || !ready;

  return (
    <div>
      <button
        type="submit"
        disabled={disabled}
        aria-busy={pending}
        className={cn(
          "btn-primary",
          disabled && "cursor-not-allowed opacity-50 hover:tracking-wider",
        )}
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Envoi…
          </>
        ) : cooldown > 0 ? (
          <>Patientez {cooldown}s</>
        ) : (
          <>
            Envoyer le message
            <Send size={15} />
          </>
        )}
      </button>
    </div>
  );
}

"use client";

// ===========================================================================
//  ContactForm — formulaire de contact connecté à Supabase.
// ===========================================================================

import { useActionState, useEffect, useRef, useState } from "react";
import { Send, Check } from "lucide-react";
import { submitContactAction } from "@/actions/public";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";
import { ACTION_IDLE } from "@/types";

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, ACTION_IDLE);
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const updateValue =
    (field: keyof typeof values) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  useEffect(() => {
    if (state.success) {
      toast(state.message, "success");
      setValues({ name: "", email: "", subject: "", message: "" });
      formRef.current?.reset();
    } else if (state.message && !state.fieldErrors) {
      toast(state.message, "error");
    }
  }, [state, toast]);

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-8 text-center">
        <Check className="mx-auto mb-4 text-emerald-300" size={32} />
        <p className="font-display text-2xl text-paper">Message envoyé</p>
        <p className="mt-2 text-ink-300">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

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

      <SubmitButton>
        Envoyer le message
        <Send size={15} />
      </SubmitButton>
    </form>
  );
}

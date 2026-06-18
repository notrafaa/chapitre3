"use client";

// ===========================================================================
//  IdeaSubmissionForm — section interactive « Écrivez la suite ».
//   1. Un champ « Je voudrais créer… ».
//   2. Dès la saisie : « L'idée existe maintenant… » + bouton.
//   3. Le bouton déploie le formulaire complet (enregistré dans Supabase).
// ===========================================================================

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { submitIdeaAction } from "@/actions/public";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useToast } from "@/components/ui/Toaster";
import { HELP_TYPES } from "@/lib/constants";
import { ACTION_IDLE } from "@/types";

export function IdeaSubmissionForm() {
  const [idea, setIdea] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [state, formAction] = useActionState(submitIdeaAction, ACTION_IDLE);
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const hasIdea = idea.trim().length > 0;

  useEffect(() => {
    if (state.success) {
      toast(state.message, "success");
    } else if (state.message && !state.fieldErrors) {
      toast(state.message, "error");
    }
  }, [state, toast]);

  const openForm = () => {
    setExpanded(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      80,
    );
  };

  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-10 text-center"
      >
        <Check className="mx-auto mb-4 text-emerald-300" size={36} />
        <p className="font-display text-3xl text-paper">Votre idée est en route.</p>
        <p className="mt-3 font-serif text-lg italic text-ink-200">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Étape 1 — le curseur clignotant + saisie */}
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold leading-tight text-paper sm:text-6xl">
          Et si le prochain chapitre
          <br />
          était le vôtre&nbsp;?
        </h2>
      </div>

      <div className="mt-12 border-b border-ink-700/60 pb-2">
        <div className="flex items-start gap-2">
          <span className="mt-2 select-none font-mono text-ink-500">›</span>
          <div className="relative flex-1">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={1}
              placeholder="Je voudrais créer…"
              aria-label="Décrivez votre idée"
              className="w-full resize-none bg-transparent font-serif text-2xl italic text-paper placeholder:text-ink-500 focus:outline-none sm:text-3xl"
              style={{ minHeight: "3rem" }}
            />
          </div>
        </div>
      </div>

      {/* Étape 2 — message + bouton */}
      <AnimatePresence>
        {hasIdea && !expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col items-center gap-6 text-center"
          >
            <p className="flex items-center gap-2 font-serif text-lg italic text-ink-200">
              <Sparkles size={16} className="text-chrome" />
              L’idée existe maintenant. Il ne reste plus qu’à la construire.
            </p>
            <button onClick={openForm} className="btn-primary">
              Proposer ce projet
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Étape 3 — formulaire complet */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <form action={formAction} className="mt-12 space-y-5 rounded-2xl border border-ink-800/70 bg-ink-900/30 p-6 sm:p-8">
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
                  <label htmlFor="idea-name" className="label">
                    Nom ou pseudo <span className="text-ink-500">(facultatif)</span>
                  </label>
                  <input id="idea-name" name="name" className="field" placeholder="Comment vous appeler" />
                </div>
                <div>
                  <label htmlFor="idea-email" className="label">
                    Email
                  </label>
                  <input
                    id="idea-email"
                    name="email"
                    type="email"
                    required
                    className="field"
                    placeholder="votre@email.fr"
                  />
                  {state.fieldErrors?.email && (
                    <p className="mt-1 text-xs text-red-400">{state.fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="idea-contact" className="label">
                    Autre moyen de contact <span className="text-ink-500">(facultatif)</span>
                  </label>
                  <input
                    id="idea-contact"
                    name="contact_method"
                    className="field"
                    placeholder="Discord, téléphone…"
                  />
                </div>
                <div>
                  <label htmlFor="idea-project" className="label">
                    Nom du projet <span className="text-ink-500">(facultatif)</span>
                  </label>
                  <input
                    id="idea-project"
                    name="project_name"
                    className="field"
                    placeholder="Le nom de votre idée"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="idea-text" className="label">
                  Votre idée
                </label>
                <textarea
                  id="idea-text"
                  name="idea"
                  required
                  rows={4}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="field resize-none"
                  placeholder="Décrivez ce que vous aimeriez créer…"
                />
                {state.fieldErrors?.idea && (
                  <p className="mt-1 text-xs text-red-400">{state.fieldErrors.idea[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="idea-help" className="label">
                  Type d’aide recherché
                </label>
                <select id="idea-help" name="help_type" className="field" defaultValue="">
                  <option value="" disabled>
                    Sélectionnez…
                  </option>
                  {HELP_TYPES.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-3 text-sm text-ink-300">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-1 h-4 w-4 flex-none accent-paper"
                />
                <span>
                  J’accepte d’être recontacté(e) par Chapitre 3 au sujet de cette idée.
                </span>
              </label>
              {state.fieldErrors?.consent && (
                <p className="text-xs text-red-400">{state.fieldErrors.consent[0]}</p>
              )}

              <SubmitButton pendingLabel="Envoi de l’idée…">
                Envoyer mon idée
                <ArrowRight size={16} />
              </SubmitButton>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

// ===========================================================================
//  Turnstile — widget CAPTCHA Cloudflare (rendu explicite).
//  N'est affiché que si une clé publique est fournie.
// ===========================================================================

import { useEffect, useRef } from "react";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: Record<string, unknown>,
  ) => string;
  remove: (id: string) => void;
  reset: (id?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const render = () => {
      if (!window.turnstile || !containerRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "auto",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      if (
        !document.querySelector(
          'script[src^="https://challenges.cloudflare.com/turnstile"]',
        )
      ) {
        const s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
      interval = setInterval(() => {
        if (window.turnstile) {
          if (interval) clearInterval(interval);
          interval = null;
          render();
        }
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* ignore */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  return <div ref={containerRef} className="min-h-[65px]" />;
}

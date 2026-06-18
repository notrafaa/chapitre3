// ===========================================================================
//  Anti-spam simple : limitation de débit en mémoire + délai entre envois.
//  Note : en environnement serverless multi-instances, ce garde-fou est
//  best-effort. Il se combine au honeypot et à la validation serveur.
// ===========================================================================

import "server-only";
import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

/** Identifie l'appelant via les en-têtes de proxy (Vercel) ou l'IP. */
export async function getClientKey(scope: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}

/**
 * Autorise au plus `limit` actions par fenêtre de `windowMs` millisecondes.
 * Renvoie true si l'action est autorisée, false si la limite est atteinte.
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

// Nettoyage périodique léger pour éviter la fuite mémoire.
if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { __c3_rl_cleanup?: boolean };
  if (!g.__c3_rl_cleanup) {
    g.__c3_rl_cleanup = true;
    setInterval(() => {
      const now = Date.now();
      for (const [k, v] of store.entries()) {
        if (now > v.resetAt) store.delete(k);
      }
    }, 5 * 60_000).unref?.();
  }
}

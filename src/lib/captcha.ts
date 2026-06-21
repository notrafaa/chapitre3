// ===========================================================================
//  Vérification CAPTCHA (Cloudflare Turnstile) — OPTIONNELLE.
//  Si TURNSTILE_SECRET_KEY n'est pas configuré, la vérification est ignorée
//  (le formulaire fonctionne sans CAPTCHA). Dès que la clé existe, elle s'active.
// ===========================================================================

import "server-only";

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** True si le CAPTCHA est configuré côté serveur. */
export function captchaConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Valide un token Turnstile.
 *  - pas de clé secrète → toujours true (CAPTCHA désactivé) ;
 *  - clé présente mais token manquant/invalide → false.
 */
export async function verifyCaptcha(
  token: string,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // non configuré → ne bloque pas
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (e) {
    console.error("verifyCaptcha:", e);
    return false;
  }
}

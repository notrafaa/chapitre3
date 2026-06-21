// ===========================================================================
//  Notifications Discord (webhook) — OPTIONNELLES.
//  Si CONTACT_DISCORD_WEBHOOK_URL n'est pas configuré, on ne fait rien.
//  Aucune erreur n'est propagée à l'utilisateur : le message reste enregistré
//  dans l'admin quoi qu'il arrive.
// ===========================================================================

import "server-only";

interface ContactPayload {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}

/** Envoie une demande de contact dans Discord via webhook (best-effort). */
export async function notifyContactDiscord(p: ContactPayload): Promise<void> {
  const url = process.env.CONTACT_DISCORD_WEBHOOK_URL;
  if (!url) return;

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || undefined;

  const fields = [
    { name: "Nom", value: trunc(p.name, 256), inline: true },
    { name: "Email", value: trunc(p.email, 256), inline: true },
    { name: "Sujet", value: trunc(p.subject || "—", 256) },
    { name: "Message", value: trunc(p.message, 1024) },
  ];

  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "Chapitre 3",
        embeds: [
          {
            title: "Nouvelle demande de contact",
            url: site ? `${site}/admin/messages` : undefined,
            color: 0xe9eaee,
            fields,
            footer: { text: "chapitre3.fr" },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (e) {
    console.error("notifyContactDiscord:", e);
  }
}

function trunc(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + "…";
}

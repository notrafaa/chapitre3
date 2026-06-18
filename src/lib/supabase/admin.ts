// ===========================================================================
//  Client Supabase — privilégié (service_role)
//  ⚠️  À N'UTILISER QUE CÔTÉ SERVEUR. Ne jamais importer dans un Client Component.
//  Contourne la RLS : réservé aux opérations admin et insertions contrôlées
//  (anti-spam serveur, lecture des données privées après vérification d'identité).
// ===========================================================================

import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

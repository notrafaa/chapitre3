// ===========================================================================
//  Client Supabase anonyme SANS cookies — pour les lectures publiques.
//  Avantages :
//   - n'accède pas aux cookies → permet la génération statique / l'ISR ;
//   - applique la RLS au rôle `anon` (lecture des projets public/teaser).
// ===========================================================================

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let cached: SupabaseClient<Database> | null = null;

/** Renvoie un client anon partagé, ou null si la configuration est absente. */
export function createAnonClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!cached) {
    cached = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

// ===========================================================================
//  Client Supabase — navigateur (Client Components)
//  Utilise l'ANON key (publique). Sécurisé par la RLS.
// ===========================================================================

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

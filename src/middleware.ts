// ===========================================================================
//  Middleware Next.js — rafraîchit la session Supabase et protège /admin.
// ===========================================================================

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf :
     *  - _next/static, _next/image
     *  - favicon, fichiers d'icônes
     *  - assets statiques courants
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|brand|grain.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};

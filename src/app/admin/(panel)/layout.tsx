// ===========================================================================
//  Layout de l'espace admin (protégé). Vérifie l'autorisation côté serveur.
// ===========================================================================

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

// L'espace admin est toujours rendu à la demande (jamais prérendu).
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 lg:flex-row">
      <AdminSidebar email={user.email} />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}

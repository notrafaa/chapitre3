"use client";

// ===========================================================================
//  AdminSidebar — navigation de l'espace d'administration.
// ===========================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Lightbulb,
  Bell,
  Mail,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projets", icon: FolderKanban },
  { href: "/admin/submissions", label: "Idées proposées", icon: Lightbulb },
  { href: "/admin/subscribers", label: "Inscriptions", icon: Bell },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/ad-links", label: "Publicité", icon: Megaphone },
  { href: "/admin/settings", label: "Réglages", icon: Settings },
];

export function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-paper/10 text-paper"
                : "text-ink-300 hover:bg-paper/5 hover:text-paper",
            )}
          >
            <Icon size={17} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Barre mobile */}
      <div className="flex items-center justify-between border-b border-ink-800/60 px-4 py-3 lg:hidden">
        <span className="font-display text-lg font-bold text-paper">Chapitre 3 · Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/80 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-800/60 bg-ink-900/95 p-4 backdrop-blur transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/admin" className="font-display text-xl font-bold text-paper">
            Chapitre 3
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {nav}

        <div className="mt-4 space-y-3 border-t border-ink-800/60 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 text-xs text-ink-400 transition-colors hover:text-paper"
          >
            <ExternalLink size={13} /> Voir le site
          </Link>
          {email && (
            <p className="truncate px-3 text-xs text-ink-500" title={email}>
              {email}
            </p>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={17} /> Déconnexion
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

// ===========================================================================
//  /admin — tableau de bord.
// ===========================================================================

import Link from "next/link";
import {
  FolderKanban,
  Lightbulb,
  Bell,
  Mail,
  Megaphone,
  ArrowRight,
  Plus,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

async function getStats() {
  const supabase = createAdminClient();
  const [
    projects,
    published,
    submissions,
    subscribers,
    messages,
    newMessages,
    newSubmissions,
    adLinks,
    adVisits,
  ] =
    await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("project_submissions").select("id", { count: "exact", head: true }),
      supabase.from("launch_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("project_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase.from("ad_links").select("id", { count: "exact", head: true }),
      supabase.from("ad_link_visits").select("id", { count: "exact", head: true }),
    ]);

  return {
    projects: projects.count ?? 0,
    published: published.count ?? 0,
    submissions: submissions.count ?? 0,
    newSubmissions: newSubmissions.count ?? 0,
    subscribers: subscribers.count ?? 0,
    messages: messages.count ?? 0,
    newMessages: newMessages.count ?? 0,
    adLinks: adLinks.count ?? 0,
    adVisits: adVisits.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      href: "/admin/projects",
      label: "Projets",
      value: stats.projects,
      sub: `${stats.published} publié(s)`,
      icon: FolderKanban,
    },
    {
      href: "/admin/submissions",
      label: "Idées proposées",
      value: stats.submissions,
      sub: `${stats.newSubmissions} nouvelle(s)`,
      icon: Lightbulb,
    },
    {
      href: "/admin/subscribers",
      label: "Inscriptions",
      value: stats.subscribers,
      sub: "au lancement",
      icon: Bell,
    },
    {
      href: "/admin/messages",
      label: "Messages",
      value: stats.messages,
      sub: `${stats.newMessages} non lu(s)`,
      icon: Mail,
    },
    {
      href: "/admin/ad-links",
      label: "Publicité",
      value: stats.adLinks,
      sub: `${stats.adVisits} visite(s) trackée(s)`,
      icon: Megaphone,
    },
  ];

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-paper">Tableau de bord</h1>
          <p className="mt-1 text-sm text-ink-400">
            Vue d’ensemble de Chapitre 3.
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary">
          <Plus size={16} /> Nouveau projet
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-ink-800/70 bg-ink-900/30 p-6 transition-colors hover:border-ink-600/70"
            >
              <div className="flex items-center justify-between text-ink-400">
                <Icon size={20} />
                <ArrowRight
                  size={16}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <p className="mt-6 font-display text-4xl font-bold text-paper">{c.value}</p>
              <p className="mt-1 text-sm text-ink-300">{c.label}</p>
              <p className="text-xs text-ink-500">{c.sub}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

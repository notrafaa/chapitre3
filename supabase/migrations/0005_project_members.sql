-- ===========================================================================
--  Chapitre 3 — Membres / équipe par projet
--  Migration 0005 : table project_members + RLS.
-- ===========================================================================

create table if not exists public.project_members (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  name          text not null,
  role          text,
  avatar_url    text,
  link          text,
  description   text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists project_members_project_idx
  on public.project_members (project_id);
create index if not exists project_members_order_idx
  on public.project_members (project_id, display_order);

alter table public.project_members enable row level security;

-- Lecture publique si le projet parent est visible (public / teaser).
drop policy if exists "project_members_public_read" on public.project_members;
create policy "project_members_public_read"
  on public.project_members for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_members.project_id
        and p.visibility in ('public', 'teaser')
    )
  );

-- Gestion réservée aux administrateurs.
drop policy if exists "project_members_admin_all" on public.project_members;
create policy "project_members_admin_all"
  on public.project_members for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================================================
--  Chapitre 3 — Row Level Security
--  Migration 0002 : activation de la RLS et politiques d'accès.
--
--  Principe :
--   - Les visiteurs (anon) ne peuvent LIRE que les projets `public` ou `teaser`.
--   - Les visiteurs peuvent CRÉER une inscription, une idée ou un message.
--   - Seuls les administrateurs (présents dans admin_users) modifient le contenu
--     et consultent les données privées (inscriptions, idées, messages).
-- ===========================================================================

-- --------------------------------------------------------------------------
--  Activation de la RLS sur toutes les tables
-- --------------------------------------------------------------------------
alter table public.projects            enable row level security;
alter table public.project_media       enable row level security;
alter table public.launch_subscribers  enable row level security;
alter table public.project_submissions enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.admin_users         enable row level security;
alter table public.site_settings       enable row level security;

-- --------------------------------------------------------------------------
--  projects
-- --------------------------------------------------------------------------
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects for select
  to anon, authenticated
  using (visibility in ('public', 'teaser'));

drop policy if exists "projects_admin_all" on public.projects;
create policy "projects_admin_all"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
--  project_media (lisible si le projet parent est visible publiquement)
-- --------------------------------------------------------------------------
drop policy if exists "project_media_public_read" on public.project_media;
create policy "project_media_public_read"
  on public.project_media for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_media.project_id
        and p.visibility in ('public', 'teaser')
    )
  );

drop policy if exists "project_media_admin_all" on public.project_media;
create policy "project_media_admin_all"
  on public.project_media for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
--  launch_subscribers : insertion publique, lecture réservée aux admins
-- --------------------------------------------------------------------------
drop policy if exists "launch_subscribers_public_insert" on public.launch_subscribers;
create policy "launch_subscribers_public_insert"
  on public.launch_subscribers for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = launch_subscribers.project_id
        and p.visibility in ('public', 'teaser')
    )
  );

drop policy if exists "launch_subscribers_admin_all" on public.launch_subscribers;
create policy "launch_subscribers_admin_all"
  on public.launch_subscribers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
--  project_submissions : insertion publique, lecture réservée aux admins
-- --------------------------------------------------------------------------
drop policy if exists "project_submissions_public_insert" on public.project_submissions;
create policy "project_submissions_public_insert"
  on public.project_submissions for insert
  to anon, authenticated
  with check (true);

drop policy if exists "project_submissions_admin_all" on public.project_submissions;
create policy "project_submissions_admin_all"
  on public.project_submissions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
--  contact_messages : insertion publique, lecture réservée aux admins
-- --------------------------------------------------------------------------
drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_messages_admin_all" on public.contact_messages;
create policy "contact_messages_admin_all"
  on public.contact_messages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
--  admin_users : lecture/écriture réservée aux admins
--  (is_admin() étant SECURITY DEFINER, il fonctionne malgré la RLS)
-- --------------------------------------------------------------------------
drop policy if exists "admin_users_admin_all" on public.admin_users;
create policy "admin_users_admin_all"
  on public.admin_users for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------------------
--  site_settings : lecture publique (liens sociaux, textes), écriture admin
-- --------------------------------------------------------------------------
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

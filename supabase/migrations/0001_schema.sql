-- ===========================================================================
--  Chapitre 3 — Schéma de base de données
--  Migration 0001 : extensions, types énumérés, tables, index, contraintes.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
--  Types énumérés (valeurs autorisées)
-- --------------------------------------------------------------------------
do $$ begin
  create type project_status as enum ('idea', 'building', 'published', 'paused', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_visibility as enum ('public', 'teaser', 'private');
exception when duplicate_object then null; end $$;

-- Étapes éditoriales : Concept, Identité, Construction, Test, Publication
do $$ begin
  create type project_stage as enum ('concept', 'identity', 'construction', 'test', 'publication');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('new', 'reviewing', 'contacted', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_status as enum ('new', 'read', 'replied', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_type as enum ('image', 'video');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------------------
--  Fonction utilitaire : maj automatique de updated_at
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --------------------------------------------------------------------------
--  Table : projects
-- --------------------------------------------------------------------------
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  project_number    integer not null default 0,
  short_description text,
  long_description  text,
  story             text,
  objectives        text[] not null default '{}',
  features          text[] not null default '{}',
  category          text,
  status            project_status not null default 'idea',
  visibility        project_visibility not null default 'public',
  current_stage     project_stage,
  external_url      text,
  logo_url          text,
  cover_url         text,
  launch_date       date,
  featured          boolean not null default false,
  display_order     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint projects_external_url_format check (
    external_url is null or external_url ~* '^https?://'
  )
);

create index if not exists projects_status_idx        on public.projects (status);
create index if not exists projects_visibility_idx    on public.projects (visibility);
create index if not exists projects_featured_idx      on public.projects (featured) where featured = true;
create index if not exists projects_display_order_idx on public.projects (display_order);
create index if not exists projects_slug_idx          on public.projects (slug);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
--  Table : project_media
-- --------------------------------------------------------------------------
create table if not exists public.project_media (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  media_url     text not null,
  media_type    media_type not null default 'image',
  alt_text      text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists project_media_project_idx on public.project_media (project_id);
create index if not exists project_media_order_idx   on public.project_media (project_id, display_order);

-- --------------------------------------------------------------------------
--  Table : launch_subscribers (inscriptions au lancement)
-- --------------------------------------------------------------------------
create table if not exists public.launch_subscribers (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now(),
  constraint launch_subscribers_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint launch_subscribers_unique unique (project_id, email)
);

create index if not exists launch_subscribers_project_idx on public.launch_subscribers (project_id);

-- --------------------------------------------------------------------------
--  Table : project_submissions (idées proposées par les visiteurs)
-- --------------------------------------------------------------------------
create table if not exists public.project_submissions (
  id             uuid primary key default gen_random_uuid(),
  name           text,
  email          text not null,
  contact_method text,
  project_name   text,
  idea           text not null,
  help_type      text,
  consent        boolean not null default false,
  status         submission_status not null default 'new',
  created_at     timestamptz not null default now(),
  constraint project_submissions_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index if not exists project_submissions_status_idx  on public.project_submissions (status);
create index if not exists project_submissions_created_idx on public.project_submissions (created_at desc);

-- --------------------------------------------------------------------------
--  Table : contact_messages
-- --------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  status     contact_status not null default 'new',
  created_at timestamptz not null default now(),
  constraint contact_messages_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index if not exists contact_messages_status_idx  on public.contact_messages (status);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

-- --------------------------------------------------------------------------
--  Table : admin_users
-- --------------------------------------------------------------------------
create table if not exists public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  role       text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists admin_users_user_idx on public.admin_users (user_id);

-- --------------------------------------------------------------------------
--  Table : site_settings (textes principaux, liens sociaux…)
-- --------------------------------------------------------------------------
create table if not exists public.site_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
--  Fonction : is_admin() — vérifie l'appartenance à admin_users
--  SECURITY DEFINER pour contourner la RLS de admin_users dans les policies.
-- --------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

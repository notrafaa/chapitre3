-- ===========================================================================
--  Chapitre 3 — Liens publicitaires et statistiques de provenance
-- ===========================================================================

create table if not exists public.ad_links (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  destination_url text not null,
  description     text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint ad_links_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint ad_links_destination_url_format check (
    destination_url ~* '^(https?://|/)'
  )
);

create index if not exists ad_links_slug_idx on public.ad_links (slug);
create index if not exists ad_links_active_idx on public.ad_links (active) where active = true;

drop trigger if exists ad_links_set_updated_at on public.ad_links;
create trigger ad_links_set_updated_at
  before update on public.ad_links
  for each row execute function public.set_updated_at();

create table if not exists public.ad_link_visits (
  id            uuid primary key default gen_random_uuid(),
  ad_link_id    uuid not null references public.ad_links (id) on delete cascade,
  country_code  text,
  referer       text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

create index if not exists ad_link_visits_link_created_idx
  on public.ad_link_visits (ad_link_id, created_at desc);

create index if not exists ad_link_visits_country_idx
  on public.ad_link_visits (country_code);

alter table public.ad_links enable row level security;
alter table public.ad_link_visits enable row level security;

drop policy if exists "ad_links_admin_all" on public.ad_links;
create policy "ad_links_admin_all"
  on public.ad_links for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "ad_link_visits_admin_all" on public.ad_link_visits;
create policy "ad_link_visits_admin_all"
  on public.ad_link_visits for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

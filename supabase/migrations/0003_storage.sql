-- ===========================================================================
--  Chapitre 3 — Supabase Storage
--  Migration 0003 : bucket public `media` + politiques d'accès.
--
--  Le bucket stocke logos, couvertures, images et vidéos courtes.
--  Lecture publique, écriture/suppression réservées aux administrateurs.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  20971520, -- 20 Mo
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

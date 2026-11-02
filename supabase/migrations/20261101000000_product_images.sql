-- MotorMart product images
--
-- A public Supabase Storage bucket for product photos. Anyone can view the
-- photos (they are shown in the shop); only admins can upload, replace or
-- delete them. Files are limited to 5 MB JPEG, PNG or WebP images.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can view product image files" on storage.objects;
create policy "Admins can view product image files"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Admins can replace product images" on storage.objects;
create policy "Admins can replace product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

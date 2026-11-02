-- MotorMart: back to a single store.
--
-- Undoes 20261101010000_shops.sql and 20261101020000_shop_owner_name.sql.
-- Products stay; only MotorMart admins (owner and staff) manage them again.
-- Shop tables, shop accounts' access and shop policies are removed.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- 1. Product photos: remove the per-shop folder policies ---------------------

drop policy if exists "Shops can view their image files" on storage.objects;
drop policy if exists "Shops can upload their images" on storage.objects;
drop policy if exists "Shops can replace their images" on storage.objects;
drop policy if exists "Shops can delete their images" on storage.objects;

-- 2. Products: remove shop policies and the shop link ------------------------

drop policy if exists "Shops can view their products" on public.products;
drop policy if exists "Shops can add their products" on public.products;
drop policy if exists "Shops can edit their products" on public.products;
drop policy if exists "Shops can delete their products" on public.products;

-- The public policy referred to shops; put back the original version.
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products for select to anon, authenticated
  using (is_active = true);

alter table public.products drop constraint if exists products_shop_part_number_key;
drop index if exists public.products_shop_id_idx;
alter table public.products drop column if exists shop_id;

-- 3. Shops, shop accounts and their helpers ----------------------------------

drop table if exists public.shop_members;
drop table if exists public.shops;

drop function if exists public.my_shop_id();
drop function if exists public.is_owner();

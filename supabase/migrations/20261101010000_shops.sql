-- MotorMart multi-shop marketplace
--
-- Every product now belongs to a shop. Shop accounts can only see and change
-- their own shop's products and photos. MotorMart admins (owner and staff)
-- can still manage everything; only the owner creates shops and accounts.
-- Existing products are moved into a test shop.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- 1. Shops and shop accounts -------------------------------------------------

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  phone text check (phone is null or char_length(phone) <= 30),
  city text check (city is null or char_length(city) <= 60),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.shops enable row level security;

-- One shop per account; a shop can have several accounts.
create table if not exists public.shop_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  shop_id uuid not null references public.shops (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.shop_members enable row level security;

-- 2. Helpers -------------------------------------------------------------------

create or replace function public.my_shop_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select shop_id from public.shop_members where user_id = (select auth.uid());
$$;

revoke execute on function public.my_shop_id() from public, anon;
grant execute on function public.my_shop_id() to authenticated;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where user_id = (select auth.uid()) and role = 'owner'
  );
$$;

revoke execute on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

-- 3. Who can see shops and memberships ---------------------------------------

drop policy if exists "Public can view active shops" on public.shops;
create policy "Public can view active shops"
  on public.shops for select to anon, authenticated
  using (is_active);

drop policy if exists "Shop members can view their shop" on public.shops;
create policy "Shop members can view their shop"
  on public.shops for select to authenticated
  using (id = (select public.my_shop_id()));

drop policy if exists "Admins can view all shops" on public.shops;
create policy "Admins can view all shops"
  on public.shops for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Owner can add shops" on public.shops;
create policy "Owner can add shops"
  on public.shops for insert to authenticated
  with check ((select public.is_owner()));

drop policy if exists "Owner can edit shops" on public.shops;
create policy "Owner can edit shops"
  on public.shops for update to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

drop policy if exists "Users can see their own shop membership" on public.shop_members;
create policy "Users can see their own shop membership"
  on public.shop_members for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Admins can view shop members" on public.shop_members;
create policy "Admins can view shop members"
  on public.shop_members for select to authenticated
  using ((select public.is_admin()));

-- 4. Products belong to a shop -------------------------------------------------

alter table public.products
  add column if not exists shop_id uuid references public.shops (id) on delete restrict;

-- Move existing products into a test shop (only the first time this runs).
do $$
declare
  test_shop_id uuid;
begin
  if exists (select 1 from public.products where shop_id is null) then
    insert into public.shops (name) values ('محل تجريبي')
    returning id into test_shop_id;

    update public.products set shop_id = test_shop_id where shop_id is null;
  end if;
end;
$$;

alter table public.products alter column shop_id set not null;

create index if not exists products_shop_id_idx on public.products (shop_id);

-- Part numbers only need to be unique within a shop.
alter table public.products drop constraint if exists products_part_number_key;
alter table public.products drop constraint if exists products_shop_part_number_key;
alter table public.products
  add constraint products_shop_part_number_key unique (shop_id, part_number);

-- 5. Product access ------------------------------------------------------------

-- The public shop only shows active products from active shops.
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products for select to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.shops s where s.id = shop_id and s.is_active
    )
  );

drop policy if exists "Shops can view their products" on public.products;
create policy "Shops can view their products"
  on public.products for select to authenticated
  using (shop_id = (select public.my_shop_id()));

drop policy if exists "Shops can add their products" on public.products;
create policy "Shops can add their products"
  on public.products for insert to authenticated
  with check (shop_id = (select public.my_shop_id()));

drop policy if exists "Shops can edit their products" on public.products;
create policy "Shops can edit their products"
  on public.products for update to authenticated
  using (shop_id = (select public.my_shop_id()))
  with check (shop_id = (select public.my_shop_id()));

drop policy if exists "Shops can delete their products" on public.products;
create policy "Shops can delete their products"
  on public.products for delete to authenticated
  using (shop_id = (select public.my_shop_id()));

-- 6. Product photos: each shop uses its own folder, shops/<shop id>/ ----------

drop policy if exists "Shops can view their image files" on storage.objects;
create policy "Shops can view their image files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'shops'
    and (storage.foldername(name))[2] = (select public.my_shop_id())::text
  );

drop policy if exists "Shops can upload their images" on storage.objects;
create policy "Shops can upload their images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'shops'
    and (storage.foldername(name))[2] = (select public.my_shop_id())::text
  );

drop policy if exists "Shops can replace their images" on storage.objects;
create policy "Shops can replace their images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'shops'
    and (storage.foldername(name))[2] = (select public.my_shop_id())::text
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'shops'
    and (storage.foldername(name))[2] = (select public.my_shop_id())::text
  );

drop policy if exists "Shops can delete their images" on storage.objects;
create policy "Shops can delete their images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'shops'
    and (storage.foldername(name))[2] = (select public.my_shop_id())::text
  );

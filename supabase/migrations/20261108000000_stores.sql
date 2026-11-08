-- MotorMart: which store (supplier) each product comes from. Admin only.
--
-- Stores are managed on the admin Catalog page. Unlike brands and
-- categories, visitors can't read them: only admins can see or change stores.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 100),
  -- Phone, location or any note about the store.
  details text check (details is null or char_length(details) <= 200),
  created_at timestamptz not null default now()
);

alter table public.stores enable row level security;

drop policy if exists "Admins can view stores" on public.stores;
create policy "Admins can view stores"
  on public.stores for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can add stores" on public.stores;
create policy "Admins can add stores"
  on public.stores for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit stores" on public.stores;
create policy "Admins can edit stores"
  on public.stores for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete stores" on public.stores;
create policy "Admins can delete stores"
  on public.stores for delete to authenticated
  using ((select public.is_admin()));

-- Each product can name its store. Existing products start with none.
alter table public.products
  add column if not exists store_id uuid references public.stores (id) on delete restrict;

create index if not exists products_store_id_idx on public.products (store_id);

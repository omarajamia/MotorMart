-- MotorMart admin access
--
-- Adds an `admins` list and Row Level Security policies that let signed-in
-- admins view, add, edit and delete every product (including hidden ones).
-- The existing "Public can view active products" policy is left unchanged,
-- so the public storefront keeps working exactly as before.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- 1. Admin list -------------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Signed-in users may only see their own row (used to check "am I an admin?").
-- Nobody can add or remove admins through the API; that is done in the
-- SQL Editor by the project owner.
drop policy if exists "Users can see their own admin row" on public.admins;
create policy "Users can see their own admin row"
  on public.admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- 2. Helper: is the current user an admin? -----------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3. Admin policies on products ----------------------------------------------

drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
  on public.products
  for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products"
  on public.products
  for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products"
  on public.products
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using ((select public.is_admin()));

-- 4. Make yourself (and staff) admins ----------------------------------------
--
-- First create the user in Authentication -> Users -> Add user
-- (email + password, "Auto Confirm User" ticked). Then run, once per person:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'person@example.com';

-- MotorMart: where a part is made (صناعة), e.g. Korean OEM, Japanese, Chinese.
--
-- The same part can be sold in several origins. Each origin is its own
-- product row (own photos, price, stock, cost and store); rows of the same
-- part share a variant_group so the product page can switch between them.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.origins (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 60),
  name_ar text check (name_ar is null or char_length(name_ar) <= 60),
  created_at timestamptz not null default now()
);

alter table public.origins enable row level security;

-- Like brands and categories: everyone can read, only admins can change.
drop policy if exists "Public can view origins" on public.origins;
create policy "Public can view origins"
  on public.origins for select to anon, authenticated
  using (true);

drop policy if exists "Admins can add origins" on public.origins;
create policy "Admins can add origins"
  on public.origins for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit origins" on public.origins;
create policy "Admins can edit origins"
  on public.origins for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete origins" on public.origins;
create policy "Admins can delete origins"
  on public.origins for delete to authenticated
  using ((select public.is_admin()));

-- Products store the origin's English name, like brand and category.
alter table public.products
  add column if not exists origin text
    check (origin is null or char_length(origin) <= 60),
  add column if not exists variant_group uuid;

create index if not exists products_variant_group_idx
  on public.products (variant_group);

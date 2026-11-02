-- MotorMart: admin-managed lists of brands, car models and categories.
--
-- Products keep their brand, car_model and category text; the admin form
-- picks them from these lists, and the shop takes Arabic names from here.
-- The lists start filled from the products that already exist.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- 1. Tables ------------------------------------------------------------------

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 60),
  name_ar text check (name_ar is null or char_length(name_ar) <= 60),
  created_at timestamptz not null default now()
);

create table if not exists public.car_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 100),
  name_ar text check (name_ar is null or char_length(name_ar) <= 100),
  created_at timestamptz not null default now(),
  unique (brand_id, name)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 100),
  name_ar text check (name_ar is null or char_length(name_ar) <= 100),
  created_at timestamptz not null default now()
);

alter table public.brands enable row level security;
alter table public.car_models enable row level security;
alter table public.categories enable row level security;

-- 2. Everyone can read the lists; only admins can change them -----------------

do $$
declare
  t text;
begin
  foreach t in array array['brands', 'car_models', 'categories'] loop
    execute format('drop policy if exists "Public can view %1$s" on public.%1$I', t);
    execute format(
      'create policy "Public can view %1$s" on public.%1$I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "Admins can add %1$s" on public.%1$I', t);
    execute format(
      'create policy "Admins can add %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()))', t);

    execute format('drop policy if exists "Admins can edit %1$s" on public.%1$I', t);
    execute format(
      'create policy "Admins can edit %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);

    execute format('drop policy if exists "Admins can delete %1$s" on public.%1$I', t);
    execute format(
      'create policy "Admins can delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end;
$$;

-- 3. Fill the lists from the existing products -------------------------------

insert into public.brands (name, name_ar)
values ('Kia', 'كيا'), ('Hyundai', 'هيونداي'), ('Nissan', 'نيسان')
on conflict (name) do nothing;

insert into public.brands (name)
select distinct brand from public.products
on conflict (name) do nothing;

insert into public.car_models (brand_id, name)
select distinct b.id, p.car_model
from public.products p
join public.brands b on b.name = p.brand
on conflict (brand_id, name) do nothing;

insert into public.categories (name, name_ar)
select category, max(category_ar)
from public.products
where category is not null
group by category
on conflict (name) do nothing;

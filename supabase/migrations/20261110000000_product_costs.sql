-- MotorMart: what each product costs us (purchase price). Admin only.
--
-- Kept in its own table, not on products, because product rows are readable
-- by visitors; this table can only be read or changed by admins.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.product_costs (
  product_id uuid primary key references public.products (id) on delete cascade,
  cost_price numeric(10, 2) not null check (cost_price >= 0),
  updated_at timestamptz not null default now()
);

alter table public.product_costs enable row level security;

drop policy if exists "Admins can view product costs" on public.product_costs;
create policy "Admins can view product costs"
  on public.product_costs for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can add product costs" on public.product_costs;
create policy "Admins can add product costs"
  on public.product_costs for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit product costs" on public.product_costs;
create policy "Admins can edit product costs"
  on public.product_costs for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete product costs" on public.product_costs;
create policy "Admins can delete product costs"
  on public.product_costs for delete to authenticated
  using ((select public.is_admin()));

-- MotorMart: extra part numbers per product.
--
-- `part_number` stays the main number. `alt_part_numbers` holds any other
-- numbers the same part is sold under (OEM, other brands, cross references),
-- so customers can find the product by any of them.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

alter table public.products
  add column if not exists alt_part_numbers text[] not null default '{}'
  check (cardinality(alt_part_numbers) <= 20);

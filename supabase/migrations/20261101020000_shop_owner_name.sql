-- MotorMart: record the shop owner's name.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

alter table public.shops
  add column if not exists owner_name text
  check (owner_name is null or char_length(owner_name) <= 100);

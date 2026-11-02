-- MotorMart admin roles
--
-- Every admin is either the "owner" or "staff". Both can manage products;
-- only the owner can create staff accounts. New accounts are staff by default.
-- Roles can only be changed here in the SQL Editor, never from the app.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

alter table public.admins
  add column if not exists role text not null default 'staff'
  check (role in ('owner', 'staff'));

-- Then make yourself the owner (replace the email with yours):
--
--   update public.admins
--   set role = 'owner'
--   where user_id = (select id from auth.users where email = 'you@example.com');

-- MotorMart: Arabic versions of product text.
--
-- The shop shows these to visitors browsing in Arabic. They're optional:
-- when one is empty the English text is shown instead.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

alter table public.products
  add column if not exists name_ar text
    check (name_ar is null or char_length(name_ar) <= 200),
  add column if not exists category_ar text
    check (category_ar is null or char_length(category_ar) <= 100),
  add column if not exists description_ar text
    check (description_ar is null or char_length(description_ar) <= 2000);

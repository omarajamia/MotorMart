-- MotorMart: more than one photo per product.
--
-- image_url stays the main photo (shown on product cards). extra_image_urls
-- holds up to 8 more photos, shown on the product page.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

alter table public.products
  add column if not exists extra_image_urls text[] not null default '{}'
  check (cardinality(extra_image_urls) <= 8);

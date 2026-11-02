# MotorMart — Instructions for Claude

## Project Overview
MotorMart (shown to visitors as "السوق الاردني لقطع السيارات" / "Jordan Auto Parts
Market") is a web application for browsing and searching car spare parts.
The initial supported car brands are Kia, Nissan, and Hyundai.
It is a single store: only MotorMart admins (owner and staff) add and edit products.
The project is being developed by the owner and should remain easy to maintain.

## Technology Stack
- Next.js with App Router
- React and TypeScript
- Tailwind CSS
- Supabase hosted database and API
- @supabase/supabase-js
- @supabase/ssr

## Project Structure
- src/app/page.tsx: main storefront page (Arabic by default, with an English switch)
- src/app/admin/: admin area (English): login, products, add/edit product, staff
- src/proxy.ts: keeps the session fresh and protects /admin
- src/components/: storefront components; src/components/admin/: admin components
- src/lib/: Supabase clients, admin checks, product validation, photos, i18n text
- src/lib/i18n.ts: storefront Arabic/English text and the store name (SITE_NAME)
- src/lib/contact.ts: WhatsApp contact number and messages
- supabase/migrations/: SQL that has been run on the database, in order
- package.json: scripts and dependencies
- .env.local: local environment variables; never commit this file

Inspect the actual repository before assuming these paths or implementations are complete.

## Database
The Supabase public.products table is intended to contain:
- id
- name
- part_number
- brand
- car_model
- year_from
- year_to
- category
- description
- price
- stock_quantity
- image_url
- is_active
- created_at
- alt_part_numbers (text[]: other numbers the part is sold under)
- name_ar, category_ar, description_ar (optional Arabic text for the storefront)

Other database objects (see supabase/migrations/):
- public.admins (user_id, role 'owner' | 'staff') and the public.is_admin() function
- Storage bucket product-images (public read; admins upload)
- Admin names are stored in the Supabase Auth user's metadata (full_name)

The initial supported brands are Kia, Nissan, and Hyundai.
Products should only be publicly visible when is_active is true, according to the existing database policy.
Admins can view and change all products through row-level security policies.

Do not assume this schema or its policies are different from the actual database without checking with the project owner.

## Environment and Security
- Use .env.local for local environment variables.
- Never print, expose, commit, or copy secret values into source code or documentation.
- Do not put Supabase secret/service-role keys in client-side code.
  SUPABASE_SERVICE_ROLE_KEY is read only in src/lib/supabase-admin.ts (server
  only) and only used after confirming the caller is the owner.
- NEXT_PUBLIC_ variables are exposed to the browser; only use them for values intended to be public.
- Preserve Row Level Security (RLS). Do not disable it to work around errors.
- Never include .env.local in a Git commit.

## Working Rules
1. Inspect the current code before editing.
2. Explain the planned changes before making substantial changes.
3. Keep changes focused on the task; avoid unnecessary rewrites.
4. Preserve existing user work.
5. Do not add paid services or unnecessary infrastructure without approval.
6. Do not introduce Docker unless explicitly requested or genuinely necessary.
7. Run the relevant checks after changes and report their results accurately.
8. Do not commit or push changes unless the user explicitly asks.
9. Do not invent database columns, environment variables, or project features; verify them in the repository.
10. Prefer clear, maintainable TypeScript and validate user input.

## Current Status
Done: storefront with search and filters (Arabic/English), WhatsApp contact for
missing parts, admin area with owner/staff roles, staff accounts (create, edit,
delete), product add/edit/delete with photos (camera or file), other part
numbers, and Arabic product text.

Tried and reverted: a multi-shop marketplace (see the shop migrations and the
remove_shops migration). Do not bring it back without the owner asking.

Not done yet: deployment, customer accounts, cart/orders.

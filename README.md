# السوق الاردني لقطع السيارات – Jordan Auto Parts Market

A bilingual (Arabic/English) web store for car spare parts (project codename: MotorMart).
It currently supports **Kia**, **Hyundai** and **Nissan**; more brands can be added by an admin.

Live site: https://motor-mart-one.vercel.app (admin: `/admin/login`)

## Features

**Shop (customers)**
- Arabic by default (right-to-left) with an English switch, remembered per visitor.
- Search by name, part number, other part numbers, brand, car model or category, in either
  language; filter by brand, model, category and stock. Prices are in JOD.
- A page for every product (photo, price, stock, part numbers, years, description) with an
  "Order on WhatsApp" button that names the part.
- A WhatsApp bar and button for customers who can't find a part.

**Admin (`/admin`, English)**
- Owner and staff accounts; only the owner creates, edits and deletes staff.
- Products: add, edit, delete, show/hide, quick price/stock edits; photos from the camera or a
  file (large photos are shrunk before upload); Arabic name/description; other part numbers.
- Catalog: brands, car models and categories with Arabic names, used by the product form and
  the shop filters.
- Works on phones (stacked product cards, wrapping top bar).

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with TypeScript and React
- Tailwind CSS
- [Supabase](https://supabase.com): Postgres database, Auth (admin logins), Storage (photos)
- [Vercel](https://vercel.com) hosting

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root (values from Supabase → Project Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

   - The two `NEXT_PUBLIC_` values are public and safe in the browser.
   - `SUPABASE_SERVICE_ROLE_KEY` is **secret**. It is only read on the server
     (`src/lib/supabase-admin.ts`) to manage admin accounts. Never give it a `NEXT_PUBLIC_`
     prefix or use it in client code.
   - `.env.local` is ignored by Git and must never be committed.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | What it does                 |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Run the production build     |
| `npm run lint`  | Check the code with ESLint   |

## Project structure

- `src/app/page.tsx` – shop home page; `src/app/products/[id]/` – product page
- `src/app/admin/` – admin area: login, products, catalog, staff
- `src/components/` – shop components; `src/components/admin/` – admin components
- `src/lib/i18n.ts` – Arabic/English shop text and the store name
- `src/lib/contact.ts` – WhatsApp number and messages
- `src/lib/catalog.ts` – brands, car models and categories
- `src/proxy.ts` – keeps admin sessions fresh and protects `/admin`
- `supabase/migrations/` – SQL already run on the database, in order

## Database

Row Level Security is on for every table. Visitors can read active products and the catalog
lists; only admins (listed in `public.admins`) can change anything. See
`supabase/migrations/` for the tables, policies and the `product-images` storage bucket.
New SQL is run by hand in the Supabase SQL Editor and then added to that folder.

## Deployment

Vercel deploys the `main` branch automatically. Work happens on a branch, is merged into
`main` through a pull request, and is live about a minute later.

- The three variables above are set in Vercel (Production).
- Pull request previews fail unless the same variables are also enabled for **Preview**; this
  does not affect the live site.
- Some networks block `*.vercel.app`; a custom domain avoids that.

## Troubleshooting

- **"We couldn't load products right now"** – check the server log for the full error.
  Free Supabase projects are **paused after a period of inactivity**; restore the project in
  the Supabase dashboard, then reload after a minute or two.
- **"NEXT_PUBLIC_SUPABASE_URL is missing"** – `.env.local` (or the Vercel variables) is missing
  a value.
- **Forgot an admin password** – the owner can set a new one on the Staff page; if the owner is
  locked out, set it in the Supabase SQL Editor (`auth.users`, `extensions.crypt`).

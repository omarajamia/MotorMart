# MotorMart

MotorMart is a web store for car spare parts. It currently supports **Kia**, **Hyundai** and **Nissan**.

Customers can browse active products and filter them by search text, brand, car model, category and stock. Prices are shown in JOD.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with TypeScript
- React
- Tailwind CSS
- [Supabase](https://supabase.com) (hosted Postgres database and API)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root with your Supabase project's settings
   (Supabase dashboard → Project Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

   Use the **publishable** (anon) key only. Never put the secret / service-role key in this file
   or in client code. `.env.local` is ignored by Git and must never be committed.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | What it does                       |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the development server       |
| `npm run build` | Build the app for production       |
| `npm run start` | Run the production build           |
| `npm run lint`  | Check the code with ESLint         |

## Project structure

- `src/app/page.tsx` – storefront page (loads active products from Supabase)
- `src/components/ProductSearch.tsx` – search, filters and product grid
- `src/lib/supabase.ts` – Supabase client
- `src/lib/types.ts` – shared TypeScript types

## Database

Products are stored in the Supabase `public.products` table. Row Level Security is enabled, and
only products with `is_active = true` are publicly visible.

Product images are expected to be stored in Supabase Storage (public bucket URLs).

## Troubleshooting

- **"We couldn't load products right now"** – check the server log for the full error.
  Free Supabase projects are **paused after a period of inactivity**; open the Supabase
  dashboard and restore the project, then reload after a minute or two.
- **"NEXT_PUBLIC_SUPABASE_URL is missing"** – `.env.local` is missing or a value is empty.

# MotorMart — Instructions for Claude

## Project Overview
MotorMart is a web application for browsing and searching car spare parts.
The initial supported car brands are Kia, Nissan, and Hyundai.
The project is being developed by the owner and should remain easy to maintain.

## Technology Stack
- Next.js with App Router
- React and TypeScript
- Tailwind CSS
- Supabase hosted database and API
- @supabase/supabase-js
- @supabase/ssr

## Project Structure
- src/app/page.tsx: main storefront page
- src/components/: reusable UI components
- src/lib/: shared utilities and Supabase client
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

The initial supported brands are Kia, Nissan, and Hyundai.
Products should only be publicly visible when is_active is true, according to the existing database policy.

Do not assume this schema or its policies are different from the actual database without checking with the project owner.

## Environment and Security
- Use .env.local for local environment variables.
- Never print, expose, commit, or copy secret values into source code or documentation.
- Do not put Supabase secret/service-role keys in client-side code.
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

## Current Handoff Task
First inspect the repository and report:
- The current application structure and implemented features.
- How the Supabase client is configured, without revealing environment values.
- Any errors or incomplete functionality found.
- A prioritized plan for the next development steps.

Do not modify files during this initial inspection. Report findings and wait for approval before implementing changes.

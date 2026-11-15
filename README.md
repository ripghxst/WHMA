# WHMA Horse Registry

Horse registry for the Wild Horse & Mustang Association (RedM). Members register horses, the board reviews them, and approved horses are listed publicly with a 2-generation pedigree.

## Stack

- Next.js 16 (App Router, `proxy.ts`), TypeScript, Tailwind CSS v4
- Supabase: Postgres, Auth, Storage, Row Level Security

## Getting started

```bash
cp .env.example .env.local   # fill in the Supabase URL + publishable key
npm install
npm run dev                  # http://localhost:3000
```

| Script                 | What it does           |
| ---------------------- | ---------------------- |
| `npm run dev`          | Dev server             |
| `npm run build`        | Production build       |
| `npm run lint`         | ESLint                 |
| `npm run format`       | Prettier (write)       |
| `npm run format:check` | Prettier (check only)  |
| `npm run typecheck`    | Route types + TS check |

## Structure

```
app/(public)/      registry, horse profiles, member pages
app/(member)/      dashboard, horse registration (signed-in)
app/admin/         review queue and management (admins)
components/        shared UI
lib/supabase/      browser, server and proxy Supabase clients
lib/types/         generated database types
supabase/migrations/  versioned SQL schema (apply in order)
supabase/templates/   auth email templates (paste into Supabase)
```

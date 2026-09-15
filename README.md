# Testing-Grounds

Piattaforma gratuita per beta testing e playtesting di giochi indie e software.

## Stack

- Next.js 15 (App Router) + Tailwind CSS + Lucide
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Hosting previsto: Vercel

## Avvio

1. Installa Node.js 20+
2. Copia `.env.example` in `.env.local` e inserisci le chiavi Supabase
3. Esegui la migrazione `supabase/migrations/00001_init.sql` nel SQL Editor
4. `npm install` e `npm run dev`

Auth prevista: Email + Discord + Google (provider da attivare in Supabase).

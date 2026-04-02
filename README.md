# NeverBuilt

A pixel-ish “virtual world” where people bury product ideas they don’t want to build anymore, and others can explore + take inspiration.

## Setup

1) Create a Supabase project.

2) Create `.env.local`:

```bash
cp .env.example .env.local
```

Fill:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)

3) Create the table + policies in Supabase SQL editor:

```sql
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null,
  x_handle text,
  x_avatar_url text,
  name text not null,
  idea text not null,
  details text,
  world_x double precision not null,
  world_y double precision not null
);

alter table public.projects enable row level security;

create policy "projects are readable by everyone"
on public.projects for select
to anon, authenticated
using (true);

create policy "users can insert their own projects"
on public.projects for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can delete their own projects"
on public.projects for delete
to authenticated
using (auth.uid() = user_id);
```

4) Enable X (Twitter) OAuth in Supabase:
- **Authentication → Providers → Twitter**
- Set your callback URL to `http://localhost:3000/auth/callback` for local dev

5) Run it:

```bash
npm run dev
```

Open `http://localhost:3000`.

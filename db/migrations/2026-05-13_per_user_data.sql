-- Per-user data isolation: patients & visits worden voortaan gescoped aan auth.users.
-- Run dit script in Supabase Dashboard → SQL Editor → New query → Run.
--
-- Volgorde:
--   1. user_id kolom toevoegen aan beide tabellen (default = huidige auth user)
--   2. Bestaande data backfillen of opruimen (kies optie A of B hieronder)
--   3. Index aanmaken voor snelle per-user lookups
--   4. Row Level Security inschakelen
--   5. Policies: elke user ziet/bewerkt alleen zijn eigen rijen
--
-- Na deze migratie: iedere ingelogde user heeft een volledig eigen patiënten- en visit-lijst.

-- 1. Kolom toevoegen
alter table public.patients
  add column if not exists user_id uuid default auth.uid()
    references auth.users(id) on delete cascade;

alter table public.visits
  add column if not exists user_id uuid default auth.uid()
    references auth.users(id) on delete cascade;

-- 2. Bestaande rijen behandelen — KIES EEN OPTIE en haal de comment-streepjes weg.
--
--    Optie A: alle bestaande patiënten + visits toewijzen aan één user.
--    Vervang '<your-user-uuid>' door het UUID uit Authentication → Users → (jouw account).
--
-- update public.patients set user_id = '<your-user-uuid>' where user_id is null;
-- update public.visits   set user_id = '<your-user-uuid>' where user_id is null;
--
--    Optie B: schone lei — alle oude rijen weggooien.
--
-- delete from public.visits   where user_id is null;
-- delete from public.patients where user_id is null;

-- 3. Index voor performante per-user filters
create index if not exists patients_user_id_idx on public.patients(user_id);
create index if not exists visits_user_id_idx   on public.visits(user_id);

-- 4. Row Level Security inschakelen
alter table public.patients enable row level security;
alter table public.visits   enable row level security;

-- 5. Policies: alleen eigen rijen
drop policy if exists "patients are self-owned" on public.patients;
create policy "patients are self-owned" on public.patients
  for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "visits are self-owned" on public.visits;
create policy "visits are self-owned" on public.visits
  for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

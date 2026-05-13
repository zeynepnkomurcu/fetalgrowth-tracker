-- Shared patients via TC + user_patients junction
--
-- Verving van het per-user model uit 2026-05-13_per_user_data.sql.
-- Nieuwe regels:
--   - 1 patient-rij per TC (UNIQUE op tc waar tc niet leeg)
--   - user_patients junction (welke artsen mogen welke patient zien)
--   - Iedereen die gelinkt is aan een patient ziet ALLE visits van die patient
--   - "Eerste invoer wint" voor name/surname/LMP — bij dubbel-TC wordt alleen gelinkt
--
-- Run dit script in Supabase → SQL Editor → New query → Run.

-- =====================================================
-- 1. Oude policies + user_id kolommen weghalen
-- =====================================================

drop policy if exists "patients are self-owned" on public.patients;
drop policy if exists "visits are self-owned"   on public.visits;

alter table public.patients drop column if exists user_id;
alter table public.visits   drop column if exists user_id;

-- =====================================================
-- 2. UNIQUE op TC (alleen wanneer ingevuld, dummies met lege TC mogen meerdere keren)
-- =====================================================

create unique index if not exists patients_tc_unique
  on public.patients (tc)
  where tc is not null and tc <> '';

-- =====================================================
-- 3. user_patients junction tabel
-- =====================================================

create table if not exists public.user_patients (
  user_id    uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  added_at   timestamptz default now(),
  primary key (user_id, patient_id)
);

create index if not exists user_patients_user_idx    on public.user_patients (user_id);
create index if not exists user_patients_patient_idx on public.user_patients (patient_id);

alter table public.user_patients enable row level security;

drop policy if exists "user_patients own links" on public.user_patients;
create policy "user_patients own links" on public.user_patients
  for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- 4. Policies op patients en visits via junction
-- =====================================================

-- patients: zichtbaar als je gelinkt bent. Insert door iedere authenticated user
-- (de RPC hieronder regelt het écht; deze policy is voor directe inserts).

drop policy if exists "patients visible to linked users" on public.patients;
create policy "patients visible to linked users" on public.patients
  for select
  using (exists (
    select 1 from public.user_patients up
    where up.patient_id = patients.id
      and up.user_id = auth.uid()
  ));

drop policy if exists "patients update by linked users" on public.patients;
create policy "patients update by linked users" on public.patients
  for update
  using (exists (
    select 1 from public.user_patients up
    where up.patient_id = patients.id
      and up.user_id = auth.uid()
  ));

drop policy if exists "patients insert authenticated" on public.patients;
create policy "patients insert authenticated" on public.patients
  for insert
  with check (auth.uid() is not null);

-- visits: alle gelinkte gebruikers mogen lezen/schrijven/verwijderen.

drop policy if exists "visits accessible via patient link" on public.visits;
create policy "visits accessible via patient link" on public.visits
  for all
  using (exists (
    select 1 from public.user_patients up
    where up.patient_id = visits.patient_id
      and up.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.user_patients up
    where up.patient_id = visits.patient_id
      and up.user_id = auth.uid()
  ));

-- =====================================================
-- 5. RPC: link_or_create_patient
--    Atomair: zoek bestaande patient op TC → link → return id
--           anders: insert patient + link → return id
--    SECURITY DEFINER zodat de TC-lookup ook werkt voor patients
--    die je nog niet "kan zien" via RLS.
-- =====================================================

create or replace function public.link_or_create_patient(
  p_name            text,
  p_surname         text,
  p_tc              text,
  p_lmp             date,
  p_protocol_number text,
  p_research_id     text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid;
  v_user_id    uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Bestaande patient zoeken op TC (alleen bij niet-lege TC)
  if p_tc is not null and p_tc <> '' then
    select id into v_patient_id
    from public.patients
    where tc = p_tc
    limit 1;
  end if;

  -- 2. Niet gevonden? Aanmaken.
  if v_patient_id is null then
    insert into public.patients
      (id, name, surname, tc, lmp, protocol_number, research_id)
    values
      (gen_random_uuid(), p_name, p_surname, p_tc, p_lmp, p_protocol_number, p_research_id)
    returning id into v_patient_id;
  end if;

  -- 3. Link aanmaken (idempotent — als al gelinkt, geen-op)
  insert into public.user_patients (user_id, patient_id)
  values (v_user_id, v_patient_id)
  on conflict (user_id, patient_id) do nothing;

  return v_patient_id;
end;
$$;

grant execute on function public.link_or_create_patient(text, text, text, date, text, text) to authenticated;

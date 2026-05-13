-- User profiles + approval gate
--
-- Iedere auth.user krijgt een profiles-rij. Toegang tot patiënt-data
-- vereist `approved = true`. Goedkeuring gebeurt door een admin via SQL Editor.
--
-- Stappen die deze migratie doet:
--   1. profiles tabel + RLS
--   2. trigger: auto-aanmaken profile bij signup
--   3. backfill: profiles voor bestaande users
--   4. is_approved() helper function
--   5. RLS policies op patients/visits/user_patients uitbreiden met approval-check
--   6. link_or_create_patient RPC: weigeren als niet approved
--   7. Bootstrap admin: zet eerste admin handmatig op approved+is_admin
--
-- NA HET RUNNEN moet je in Supabase Dashboard ook nog:
--   Authentication → Providers → Email → "Confirm email" AANZETTEN
-- zodat nieuwe users hun mail moeten verifiëren voordat ze kunnen inloggen.

-- =====================================================
-- 1. profiles tabel
-- =====================================================

create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  approved    boolean not null default false,
  is_admin    boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles self read"   on public.profiles;
drop policy if exists "profiles admin read"  on public.profiles;
drop policy if exists "profiles self update" on public.profiles;

create policy "profiles self read" on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "profiles self update" on public.profiles
  for update
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- 2. Trigger: auto-create profile bij signup
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- 3. Backfill profiles voor bestaande users
-- =====================================================

insert into public.profiles (user_id, email)
select id, email from auth.users
on conflict (user_id) do nothing;

-- =====================================================
-- 4. is_approved() helper function
-- =====================================================

create or replace function public.is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select approved from public.profiles where user_id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_approved() to authenticated;

-- =====================================================
-- 5. RLS policies uitbreiden met approval-check
-- =====================================================

-- patients
drop policy if exists "patients visible to linked users" on public.patients;
create policy "patients visible to linked users" on public.patients
  for select
  using (
    public.is_approved()
    and exists (
      select 1 from public.user_patients up
      where up.patient_id = patients.id
        and up.user_id = auth.uid()
    )
  );

drop policy if exists "patients update by linked users" on public.patients;
create policy "patients update by linked users" on public.patients
  for update
  using (
    public.is_approved()
    and exists (
      select 1 from public.user_patients up
      where up.patient_id = patients.id
        and up.user_id = auth.uid()
    )
  );

drop policy if exists "patients insert authenticated" on public.patients;
create policy "patients insert authenticated" on public.patients
  for insert
  with check (public.is_approved());

-- visits
drop policy if exists "visits accessible via patient link" on public.visits;
create policy "visits accessible via patient link" on public.visits
  for all
  using (
    public.is_approved()
    and exists (
      select 1 from public.user_patients up
      where up.patient_id = visits.patient_id
        and up.user_id = auth.uid()
    )
  )
  with check (
    public.is_approved()
    and exists (
      select 1 from public.user_patients up
      where up.patient_id = visits.patient_id
        and up.user_id = auth.uid()
    )
  );

-- user_patients
drop policy if exists "user_patients own links" on public.user_patients;
create policy "user_patients own links" on public.user_patients
  for all
  using      (public.is_approved() and auth.uid() = user_id)
  with check (public.is_approved() and auth.uid() = user_id);

-- =====================================================
-- 6. RPC: defense in depth — weigeren als niet approved
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

  if not public.is_approved() then
    raise exception 'Account not approved yet. Please contact an administrator.';
  end if;

  if p_tc is not null and p_tc <> '' then
    select id into v_patient_id
    from public.patients
    where tc = p_tc
    limit 1;
  end if;

  if v_patient_id is null then
    insert into public.patients
      (id, name, surname, tc, lmp, protocol_number, research_id)
    values
      (gen_random_uuid(), p_name, p_surname, p_tc, p_lmp, p_protocol_number, p_research_id)
    returning id into v_patient_id;
  end if;

  insert into public.user_patients (user_id, patient_id)
  values (v_user_id, v_patient_id)
  on conflict (user_id, patient_id) do nothing;

  return v_patient_id;
end;
$$;

grant execute on function public.link_or_create_patient(text, text, text, date, text, text) to authenticated;

-- =====================================================
-- 7. Bootstrap: Zeynep is de enige admin. Emre is approved (gebruiker)
--    maar geen admin. Approvals worden door Zeynep gedaan.
-- =====================================================

-- Zeynep: approved + admin
update public.profiles
set approved    = true,
    is_admin    = true,
    approved_at = now()
where email = 'zeynepnkomurcu@gmail.com';

-- Emre: approved (mag de app gebruiken) maar GEEN admin-rechten
update public.profiles
set approved    = true,
    is_admin    = false,
    approved_at = now()
where email = 'emrekomurcu@outlook.be';

-- =====================================================
-- HOE EEN NIEUWE USER GOEDKEUREN (in de toekomst):
--
--   update public.profiles
--   set approved = true, approved_at = now(), approved_by = auth.uid()
--   where email = '<nieuwe_user_email>';
--
-- HOE PENDING USERS BEKIJKEN:
--
--   select email, full_name, created_at from public.profiles where approved = false;
-- =====================================================

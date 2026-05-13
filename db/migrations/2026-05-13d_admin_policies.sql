-- Admin policies: laat is_admin=true gebruikers alle profiles lezen + updaten
--
-- Run na 2026-05-13c. Voegt is_admin() helper + 2 extra policies op profiles toe
-- zodat de in-app admin pagina pending users kan zien en goedkeuren.

-- =====================================================
-- 1. is_admin() helper (SECURITY DEFINER om recursie in RLS-policies te vermijden)
-- =====================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where user_id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- =====================================================
-- 2. Admin kan alle profiles zien (voor pending-list)
-- =====================================================

drop policy if exists "profiles admin read all" on public.profiles;
create policy "profiles admin read all" on public.profiles
  for select
  using (public.is_admin());

-- =====================================================
-- 3. Admin kan andere profiles updaten (om approve te zetten)
-- =====================================================

drop policy if exists "profiles admin update all" on public.profiles;
create policy "profiles admin update all" on public.profiles
  for update
  using      (public.is_admin())
  with check (public.is_admin());

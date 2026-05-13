-- Admin-only RPC: delete_user
--
-- Verwijdert een auth.users rij. Cascade verwijdert automatisch:
--   - public.profiles (FK on delete cascade)
--   - public.user_patients (FK on delete cascade)
-- Patiënten zelf en hun visits blijven bestaan (linken alleen los).
--
-- Alleen aanroepbaar door is_admin() = true, en kan niet jezelf verwijderen.

create or replace function public.delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized: admin only';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Cannot delete your own account from here';
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;

grant execute on function public.delete_user(uuid) to authenticated;

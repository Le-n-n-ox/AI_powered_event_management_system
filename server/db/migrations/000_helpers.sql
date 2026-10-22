-- 000_helpers.sql
-- Shared helpers used by the RLS policies and RPCs that follow.

-- A tiny helper so policies and RPCs can ask "is this user an admin?".
-- SECURITY DEFINER keeps it readable even when the caller cannot read profiles.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin' and coalesce(suspended, false) = false
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated, anon;

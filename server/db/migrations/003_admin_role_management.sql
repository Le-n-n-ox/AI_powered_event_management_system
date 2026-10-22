-- 003_admin_role_management.sql
-- Lets an admin promote / demote a user, and gives the admin dashboard a
-- single-call view of platform analytics.

-- ---------------------------------------------------------------------------
-- Change a user's role
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role    text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor  uuid := auth.uid();
  v_actor_role text;
  v_old    text;
  v_row    public.profiles;
begin
  if not public.is_admin(v_actor) then
    raise exception 'Admin only' using errcode = '42501';
  end if;

  if p_role not in ('admin', 'organizer', 'attendee', 'floor_manager') then
    raise exception 'Unknown role: %', p_role using errcode = '22023';
  end if;

  if p_user_id = v_actor and p_role <> 'admin' then
    raise exception 'You cannot remove your own admin role' using errcode = '42501';
  end if;

  select role into v_actor_role from public.profiles where id = v_actor;
  if v_actor_role is null then
    raise exception 'No profile for caller' using errcode = '42501';
  end if;

  select role into v_old from public.profiles where id = p_user_id;
  if v_old is null then
    raise exception 'No profile for that user' using errcode = 'P0002';
  end if;

  update public.profiles
     set role = p_role
   where id = p_user_id
  returning * into v_row;

  insert into public.admin_audit_log (action, target_type, detail, actor_id)
  values (
    'role_changed',
    'profile',
    format('%s -> %s (user %s)', v_old, p_role, p_user_id),
    v_actor
  );

  return v_row;
end;
$$;

grant execute on function public.admin_set_user_role(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Platform analytics for the admin dashboard
-- ---------------------------------------------------------------------------
create or replace function public.admin_platform_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_result jsonb;
begin
  if not public.is_admin(v_actor) then
    raise exception 'Admin only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'totals', jsonb_build_object(
      'users',            (select count(*) from public.profiles),
      'organizers',       (select count(*) from public.profiles where role = 'organizer'),
      'attendees',        (select count(*) from public.profiles where role = 'attendee'),
      'suspended',        (select count(*) from public.profiles where coalesce(suspended, false)),
      'events',           (select count(*) from public.events),
      'upcoming_events',  (select count(*) from public.events where status = 'upcoming'),
      'registrations',    (select count(*) from public.attendees),
      'paid_transactions',(select count(*) from public.transactions where status = 'paid')
    ),
    'revenue', jsonb_build_object(
      'gross', coalesce((
         select sum(t.amount) from public.transactions t where t.status = 'paid'
       ), 0),
      'refunded', coalesce((
         select sum(t.amount) from public.transactions t where t.status = 'refunded'
       ), 0)
    ),
    'registrations_by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'count', d.count) order by d.day)
      from (
        select to_char(date_trunc('day', a.registered_at), 'YYYY-MM-DD') as day,
               count(*)::int as count
          from public.attendees a
         group by 1
         order by 1
      ) d
    ), '[]'::jsonb),
    'top_organizers', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', o.id,
               'name', coalesce(o.name, 'Unknown organiser'),
               'events', o.events,
               'registrations', o.registrations
             ) order by o.registrations desc)
      from (
        select p.id,
               p.full_name as name,
               count(distinct e.id)::int as events,
               count(a.id)::int as registrations
          from public.profiles p
          join public.events e on e.organizer_id = p.id
          left join public.attendees a on a.event_id = e.id
         where p.role = 'organizer'
         group by p.id, p.full_name
         order by registrations desc
         limit 6
      ) o
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.admin_platform_analytics() to authenticated;

-- 004_audit_triggers.sql
-- Records meaningful moderation actions in admin_audit_log so the admin's
-- audit trail covers event and attendee changes, not just account actions.

create or replace function public.audit_event_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.status is distinct from old.status or
    new.name is distinct from old.name or
    new.is_paid is distinct from old.is_paid or
    new.ticket_price is distinct from old.ticket_price
  ) then
    insert into public.admin_audit_log (action, target_type, detail, actor_id)
    values (
      'event_updated',
      'event',
      format(
        '%s: name %s -> %s, status %s -> %s, paid %s -> %s, price %s -> %s',
        coalesce(old.name, new.name),
        coalesce(old.name, '-'), coalesce(new.name, '-'),
        coalesce(old.status::text, '-'), coalesce(new.status::text, '-'),
        coalesce(old.is_paid::text, '-'), coalesce(new.is_paid::text, '-'),
        coalesce(old.ticket_price::text, '-'), coalesce(new.ticket_price::text, '-')
      ),
      auth.uid()
    );
  elsif tg_op = 'DELETE' then
    insert into public.admin_audit_log (action, target_type, detail, actor_id)
    values ('event_deleted', 'event', coalesce(old.name, old.id::text), auth.uid());
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists events_audit on public.events;
create trigger events_audit
  after update or delete on public.events
  for each row
  execute function public.audit_event_changes();

create or replace function public.audit_attendee_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.status is distinct from old.status or
    new.payment_status is distinct from old.payment_status
  ) then
    insert into public.admin_audit_log (action, target_type, detail, actor_id)
    values (
      'attendee_updated',
      'attendee',
      format(
        '%s: status %s -> %s, payment %s -> %s',
        coalesce(old.full_name, old.id::text),
        coalesce(old.status::text, '-'), coalesce(new.status::text, '-'),
        coalesce(old.payment_status::text, '-'), coalesce(new.payment_status::text, '-')
      ),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists attendees_audit on public.attendees;
create trigger attendees_audit
  after update on public.attendees
  for each row
  execute function public.audit_attendee_changes();

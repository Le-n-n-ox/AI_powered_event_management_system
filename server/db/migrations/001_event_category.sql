-- 001_event_category.sql
-- Adds a "niche" / category field to events so attendees can filter by topic.
--
-- The client treats this column as optional: every read falls back to `select *`
-- and every write retries without it if the column is missing, so the app keeps
-- working before this migration is applied.

alter table public.events
  add column if not exists category text;

comment on column public.events.category is
  'Niche / topic of the event, e.g. "Technology", "Health", "Music". Used for filtering.';

-- Organizers filter their own event lists by category, so index it.
create index if not exists events_category_idx
  on public.events (category)
  where category is not null;

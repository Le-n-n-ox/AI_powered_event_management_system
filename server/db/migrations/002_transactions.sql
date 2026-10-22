-- 002_transactions.sql
-- A real payment ledger for paid events.
--
-- Until this is applied, the Transactions screen falls back to deriving revenue
-- from attendees.payment_status joined against events.ticket_price.

create table if not exists public.transactions (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references public.events (id) on delete cascade,
  attendee_id        uuid references public.attendees (id) on delete set null,
  organizer_id       uuid not null references auth.users (id) on delete cascade,

  amount             numeric(12, 2) not null default 0,
  currency           text not null default 'KES',

  status             text not null default 'pending'
                       check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  method             text not null default 'mpesa'
                       check (method in ('mpesa', 'cash', 'bank', 'card', 'other')),

  -- Provider identifiers (M-Pesa Daraja: CheckoutRequestID, then the receipt)
  provider           text not null default 'mpesa',
  provider_reference text,
  receipt_number     text,

  payer_name         text,
  phone_number       text,

  paid_at            timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.transactions is
  'Payment ledger for paid events. One row per payment attempt.';

create index if not exists transactions_event_idx
  on public.transactions (event_id, created_at desc);

create index if not exists transactions_organizer_idx
  on public.transactions (organizer_id, created_at desc);

create index if not exists transactions_attendee_idx
  on public.transactions (attendee_id)
  where attendee_id is not null;

-- Keep updated_at honest.
create or replace function public.touch_transaction_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transactions_touch_updated_at on public.transactions;

create trigger transactions_touch_updated_at
  before update on public.transactions
  for each row
  execute function public.touch_transaction_updated_at();

-- Row level security -------------------------------------------------
alter table public.transactions enable row level security;

-- Organizers read their own ledger; admins read everything.
drop policy if exists "organizers read own transactions" on public.transactions;
create policy "organizers read own transactions"
  on public.transactions
  for select
  to authenticated
  using (organizer_id = auth.uid() or public.is_admin(auth.uid()));

-- Organizers can reconcile their own ledger (mark paid / refunded / cancel).
drop policy if exists "organizers update own transactions" on public.transactions;
create policy "organizers update own transactions"
  on public.transactions
  for update
  to authenticated
  using (organizer_id = auth.uid() or public.is_admin(auth.uid()))
  with check (organizer_id = auth.uid() or public.is_admin(auth.uid()));

-- Inserts happen server-side with the service role key (M-Pesa callbacks),
-- but allow an organizer to open a manual ledger entry too.
drop policy if exists "organizers insert own transactions" on public.transactions;
create policy "organizers insert own transactions"
  on public.transactions
  for insert
  to authenticated
  with check (organizer_id = auth.uid() or public.is_admin(auth.uid()));

-- public.is_admin() is defined in 000_helpers.sql and is used by the policies above.

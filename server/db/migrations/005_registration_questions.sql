-- 005_registration_questions.sql
-- Lets the organizer shape the registration form, and choose where the money goes.
--
--   events.registration_questions  jsonb  the questions the attendee is asked
--   events.mpesa_accno             text   the paybill / accno the ticket money is credited to
--   attendees.custom_answers      jsonb  the attendee's answers to custom questions
--   transactions.paybill          text   the accno a payment was actually credited to
--
-- The client treats every one of these as optional: writes retry without the
-- column when it is missing, and reads fall back to `select *`. The app keeps
-- working before this migration is applied.

-- ---------------------------------------------------------------------------
-- The questions the organizer configured
-- ---------------------------------------------------------------------------
-- Shape of one entry:
--   {
--     "id":         "dietary_notes",   -- stable key; matches an attendees column when it is one
--     "label":      "Dietary needs",
--     "type":       "short_text" | "long_text" | "number" | "email" | "phone" | "select" | "checkbox",
--     "required":   true,
--     "options":    ["Vegetarian", "Vegan"],   -- select only
--     "placeholder":"e.g. ..."
--   }
--
-- An empty array means "ask nothing extra" — the attendee form shows only the
-- terms checkbox.
--
alter table public.events
  add column if not exists registration_questions jsonb;

comment on column public.events.registration_questions is
  'The questions the organizer asks on the registration form. Null = the default set.';

-- ---------------------------------------------------------------------------
-- Where the ticket money is credited
-- ---------------------------------------------------------------------------
-- The paybill number (accno) the organizer provides. When it is set, the STK
-- push credits this number instead of the platform's default shortcode.
--
alter table public.events
  add column if not exists mpesa_accno text;

comment on column public.events.mpesa_accno is
  'Organizer-provided M-Pesa paybill / accno that ticket payments are credited to.';

-- ---------------------------------------------------------------------------
-- The attendee's answers to custom questions
-- ---------------------------------------------------------------------------
-- Keyed by the question id, so re-ordering or re-labelling the organizer's
-- questions never loses an answer.
--
alter table public.attendees
  add column if not exists custom_answers jsonb;

comment on column public.attendees.custom_answers is
  'Answers to the custom registration questions, keyed by question id.';

-- ---------------------------------------------------------------------------
-- The accno a payment was credited to
-- ---------------------------------------------------------------------------
-- Snapshot of events.mpesa_accno at the moment the push went out, so the
-- ledger keeps the truth even if the organizer later changes their paybill.
--
alter table public.transactions
  add column if not exists paybill text;

comment on column public.transactions.paybill is
  'The M-Pesa paybill / accno the payment was credited to.';

-- ---------------------------------------------------------------------------
-- The token an attendee polls their payment status with
-- ---------------------------------------------------------------------------
-- The attendee is not necessarily signed in, so the push hands back a secret
-- that only they hold. It is needed to read the status of that one payment.
--
alter table public.transactions
  add column if not exists payment_token text;

comment on column public.transactions.payment_token is
  'Secret handed to the attendee so they can poll this one payment''s status.';

-- ---------------------------------------------------------------------------
-- Index for the "questions asked" lookup
-- ---------------------------------------------------------------------------
-- GIN so a question can be looked up by content ("which events ask for a
-- dietary requirement?"), rather than scanning every event's jsonb.
create index if not exists events_registration_questions_idx
  on public.events using gin (registration_questions jsonb_path_ops);

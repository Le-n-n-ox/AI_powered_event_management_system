-- 006_paystack_method.sql
-- Allow Paystack checkout attempts in the transaction ledger.
-- The original method constraint predates the Paystack Inline integration.

alter table public.transactions
  drop constraint if exists transactions_method_check;

alter table public.transactions
  add constraint transactions_method_check
  check (method in ('mpesa', 'paystack', 'cash', 'bank', 'card', 'other'));

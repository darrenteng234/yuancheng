-- Canonical V1 · 08 · Refund workflow (provider-direct model). Yuancheng RECORDS,
-- provider returns the money. Additive columns + widened status.
alter table refunds add column if not exists currency     text not null default 'MYR';
alter table refunds add column if not exists requested_at timestamptz not null default now();
alter table refunds add column if not exists confirmed_at timestamptz;
alter table refunds add column if not exists confirmed_by uuid;
alter table refunds add column if not exists notes        text;
alter table refunds drop constraint if exists refunds_status_check;
alter table refunds add constraint refunds_status_check
  check (status in ('pending','succeeded','failed','requested','approved','provider_refunding','confirmed','rejected'));
alter table refunds alter column status set default 'requested';

-- Canonical V1 · 05 · Order snapshots + request fields + widened state machine + events.
alter table platform_orders add column if not exists service_id       uuid references services(id);
alter table platform_orders add column if not exists package_id       uuid references skus(id);
alter table platform_orders add column if not exists place_id         uuid references temples(id);
alter table platform_orders add column if not exists customer_request text;
alter table platform_orders add column if not exists additional_note  text;
alter table platform_orders add column if not exists customer_photo   text;          -- private storage path
alter table platform_orders add column if not exists service_snapshot          jsonb;
alter table platform_orders add column if not exists package_snapshot          jsonb;
alter table platform_orders add column if not exists place_snapshot            jsonb;
alter table platform_orders add column if not exists evidence_policy_snapshot  jsonb;
alter table platform_orders add column if not exists payment_instruction_snapshot jsonb;

-- Widen the status CHECK to add manual-payment + refund states (keeps all existing).
alter table platform_orders drop constraint if exists platform_orders_status_check;
alter table platform_orders add constraint platform_orders_status_check
  check (status in (
    'draft','pending_payment','payment_failed','payment_proof_submitted','paid',
    'accepted','in_progress','evidence_submitted','under_review','completed',
    'cancelled','refunded','disputed','refund_requested','refund_confirmed'
  ));

-- Append-only audit trail.
create table if not exists order_events (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references platform_orders(id) on delete cascade,
  actor_user_id uuid,
  actor_role    text,
  event_type    text not null,
  from_status   text,
  to_status     text,
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now()
);
create index if not exists idx_order_events_order on order_events(order_id, created_at);

-- Canonical V1 · 04 · MANUAL provider-direct payment (Stage 1). Stripe stays a
-- dormant future adapter — not the Stage-1 path.
create table if not exists provider_payment_methods (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references providers(id) on delete cascade,
  type          text not null check (type in ('bank_transfer','duitnow_qr','other')),
  country       text,
  currency      text default 'MYR',
  display_name  text not null,
  bank_name     text,
  account_name  text,
  account_number text,
  qr_asset      text,          -- private storage path to QR image
  instructions  text,
  active        boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_ppm_provider on provider_payment_methods(provider_id);

-- Snapshot of the instructions shown to the customer at order time (immutable).
create table if not exists order_payment_instructions (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references platform_orders(id) on delete cascade,
  payment_method_type text,
  display_name  text,
  bank_name     text,
  account_name  text,
  account_number text,
  instructions  text,
  qr_reference  text,          -- private storage path snapshot
  created_at    timestamptz not null default now(),
  unique (order_id)
);

-- Customer-uploaded proof of direct payment. upload != paid; provider verifies.
create table if not exists payment_proofs (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references platform_orders(id) on delete cascade,
  uploaded_by   uuid,
  storage_path  text not null,           -- PRIVATE bucket path (payment-proofs/…)
  file_type     text,
  status        text not null default 'submitted' check (status in ('submitted','accepted','rejected')),
  rejection_reason text,
  verified_by   uuid,
  verified_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_payment_proofs_order on payment_proofs(order_id);

-- Generic processor abstraction on the existing payments table (no Stripe leak).
alter table payments add column if not exists processor           text not null default 'manual';
alter table payments add column if not exists processor_reference  text;
alter table payments add column if not exists platform_fee_rate    numeric(6,4) not null default 0;

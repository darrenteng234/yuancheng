-- ============================================================================
-- Yuancheng Platform migration — provider-centric domain (V1 foundation)
-- Run on the NEW Supabase project AFTER supabase-schema.sql (base) if you keep
-- the temple tables, or standalone for a fresh platform DB.
-- Mirrors src/types/platform.ts. Idempotent-ish: uses IF NOT EXISTS.
-- ============================================================================

-- ── Plans (limits are DATA — never hard-coded in app) ───────────────────────
create table if not exists plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  tier          text not null check (tier in ('free','paid')),
  sku_limit         integer,           -- null = unlimited  (ENFORCED)
  storefront_limit  integer,           --                    (ENFORCED)
  staff_limit       integer,           -- config only
  order_limit       integer,           -- config only
  storage_limit_mb  integer,           -- config only
  analytics_level   text not null default 'none'  check (analytics_level in ('none','basic','advanced')),
  automation_level  text not null default 'none'  check (automation_level in ('none','basic','advanced')),
  features      text[] not null default '{}',
  monthly_price numeric(12,2),         -- null = pricing undecided
  currency      text default 'MYR',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Providers ───────────────────────────────────────────────────────────────
create table if not exists providers (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  kind             text not null default 'other'
                     check (kind in ('temple','organization','service_operator','religious_service','community_org','other')),
  status           text not null default 'pending'
                     check (status in ('pending','approved','suspended','rejected')),
  fulfillment_mode text not null default 'platform' check (fulfillment_mode in ('platform','provider')),
  owner_user_id    uuid not null,
  contact_email    text,
  contact_phone    text,
  default_locale   text default 'en',
  temple_id        uuid,               -- optional link to a temple record
  plan_id          uuid references plans(id),
  approved_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_providers_owner on providers(owner_user_id);

create table if not exists provider_members (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  user_id     uuid not null,
  role        text not null default 'staff' check (role in ('owner','staff')),
  created_at  timestamptz not null default now(),
  unique (provider_id, user_id)
);

-- A provider may operate services connected to MANY temples/orgs (not a parent-of).
create table if not exists provider_temples (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  temple_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (provider_id, temple_id)
);

-- ── Subscriptions ───────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id           uuid primary key default gen_random_uuid(),
  provider_id  uuid not null references providers(id) on delete cascade,
  plan_id      uuid not null references plans(id),
  status       text not null default 'active' check (status in ('active','past_due','canceled','trialing')),
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Storefronts ─────────────────────────────────────────────────────────────
create table if not exists storefronts (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  slug        text not null unique,
  name        text not null,
  description text,
  status      text not null default 'draft' check (status in ('draft','published','paused')),
  locale      text default 'en',
  branding    jsonb default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Products & SKUs ─────────────────────────────────────────────────────────
create table if not exists platform_products (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references providers(id) on delete cascade,
  storefront_id uuid not null references storefronts(id) on delete cascade,
  name          text not null,
  description   text,
  type          text not null default 'service' check (type in ('physical','service','donation')),
  photos        text[] default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists skus (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references platform_products(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  name        text not null,
  price       numeric(12,2) not null default 0,
  currency    text not null default 'MYR',
  -- Only 'published' counts against plan.sku_limit (enforced in app + this view)
  status      text not null default 'draft' check (status in ('draft','inactive','archived','published')),
  evidence_required text[] default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_skus_provider on skus(provider_id);
-- Count of active published SKUs per provider (used for limit checks)
create or replace view provider_active_sku_counts as
  select provider_id, count(*)::int as active_skus
  from skus where status = 'published' group by provider_id;

-- ── Customers (auth-bindable; guests leave user_id null) ────────────────────
create table if not exists platform_customers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,                       -- null for guest
  name       text,
  email      text,
  phone      text,
  preferred_language text default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Orders (new lifecycle; unpaid can never be fulfilled) ───────────────────
create table if not exists platform_orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique,
  provider_id   uuid not null references providers(id),
  storefront_id uuid not null references storefronts(id),
  customer_id   uuid references platform_customers(id),
  fulfiller_id  uuid,                     -- platform runner or provider staff
  status        text not null default 'draft'
                  check (status in ('draft','pending_payment','payment_failed','paid',
                                    'accepted','in_progress','evidence_submitted','under_review',
                                    'completed','cancelled','refunded','disputed')),
  currency      text not null default 'MYR',
  subtotal      numeric(12,2) not null default 0,
  total         numeric(12,2) not null default 0,
  customer_name  text,
  customer_email text,
  customer_phone text,
  special_instructions text,
  access_token  text,                     -- secure guest order tracking
  accepted_at   timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_orders_provider on platform_orders(provider_id);
create index if not exists idx_orders_customer on platform_orders(customer_id);
create index if not exists idx_orders_fulfiller on platform_orders(fulfiller_id);

create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references platform_orders(id) on delete cascade,
  sku_id     uuid references skus(id),
  sku_name   text not null,              -- snapshot
  unit_price numeric(12,2) not null,
  quantity   integer not null default 1,
  line_total numeric(12,2) not null
);

create table if not exists order_evidence (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references platform_orders(id) on delete cascade,
  type       text not null check (type in ('photo','video','receipt','document')),
  url        text not null,
  label      text,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

-- ── Payments / payouts / refunds (platform_fee configurable, default 0) ─────
create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references platform_orders(id),
  provider_id   uuid not null references providers(id),
  currency      text not null default 'MYR',
  gross_amount     numeric(12,2) not null default 0,
  payment_fee      numeric(12,2) not null default 0,
  platform_fee     numeric(12,2) not null default 0,   -- 0 = no commission (V1)
  provider_amount  numeric(12,2) not null default 0,
  refund_amount    numeric(12,2) not null default 0,
  net_amount       numeric(12,2) not null default 0,
  payout_amount    numeric(12,2) not null default 0,
  status        text not null default 'requires_payment'
                  check (status in ('requires_payment','processing','succeeded','failed','refunded')),
  payout_status text not null default 'pending' check (payout_status in ('pending','scheduled','paid','failed')),
  stripe_payment_intent_id text unique,   -- one payment row per intent (idempotent webhook, race-safe)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_payments_order on payments(order_id);

create table if not exists payouts (
  id           uuid primary key default gen_random_uuid(),
  provider_id  uuid not null references providers(id),
  period_start timestamptz,
  period_end   timestamptz,
  amount       numeric(12,2) not null default 0,
  currency     text not null default 'MYR',
  status       text not null default 'pending' check (status in ('pending','scheduled','paid','failed')),
  paid_at      timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists refunds (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references platform_orders(id),
  payment_id uuid references payments(id),
  amount     numeric(12,2) not null,
  reason     text,
  status     text not null default 'pending' check (status in ('pending','succeeded','failed')),
  created_at timestamptz not null default now()
);

-- ── Seed plans (the ONLY place the free-tier limit "3" is set) ──────────────
insert into plans (name, tier, sku_limit, storefront_limit, staff_limit, order_limit,
                   storage_limit_mb, analytics_level, automation_level, features, monthly_price, currency)
values
  ('Free', 'free', 3,    1, 0, null, 100,  'none',  'none', '{}',
     0, 'MYR'),
  ('Pro',  'paid', null, 3, 5, null, 5000, 'basic', 'none',
     '{multiple_storefronts,staff_accounts,analytics,custom_branding}',
     null, 'MYR')   -- price intentionally undecided
on conflict do nothing;

-- RLS: all of these tables are accessed via the service-role API. Enable RLS and
-- add NO anon policy (deny by default); see rls-policies.sql for the pattern.

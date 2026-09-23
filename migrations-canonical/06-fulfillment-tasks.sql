-- Canonical V1 · 06 · Fulfillment tasks (provider/staff/runner/external). One order = one task in V1.
create table if not exists fulfillment_tasks (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references platform_orders(id) on delete cascade,
  provider_id   uuid not null references providers(id) on delete cascade,
  assignment_type text not null default 'provider' check (assignment_type in ('provider','staff','runner','external')),
  assigned_user_id uuid,
  external_fulfiller_name text,
  status        text not null default 'pending' check (status in ('pending','started','completed','cancelled')),
  started_at    timestamptz,
  completed_at  timestamptz,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (order_id)
);
create index if not exists idx_fulfillment_tasks_provider on fulfillment_tasks(provider_id);
create index if not exists idx_fulfillment_tasks_assignee on fulfillment_tasks(assigned_user_id);

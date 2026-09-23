-- Canonical V1 · 07 · Entitlement foundation. Capability-based, not plan string checks.
create table if not exists plan_entitlements (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references plans(id) on delete cascade,
  key        text not null,          -- service_limit, package_limit, product_limit, location_limit,
                                      -- staff_limit, runner_enabled, evidence_enabled, analytics_level, custom_branding
  limit_int  integer,                -- null = unlimited (for *_limit keys)
  enabled    boolean not null default true,   -- for boolean keys
  value_text text,                   -- for level keys (e.g. analytics_level)
  created_at timestamptz not null default now(),
  unique (plan_id, key)
);

-- Provider-specific grants / overrides (promotions, manual grants, expiry).
create table if not exists provider_entitlements (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  key         text not null,
  limit_int   integer,
  enabled     boolean not null default true,
  value_text  text,
  expires_at  timestamptz,           -- null = permanent; expiry never auto-unpublishes
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (provider_id, key)
);
create index if not exists idx_provider_entitlements_provider on provider_entitlements(provider_id);

-- Seed plan entitlements aligned with existing plans (Free = 3 services; Pro = unlimited).
insert into plan_entitlements (plan_id, key, limit_int, enabled, value_text)
select p.id, v.key, v.limit_int, v.enabled, v.value_text
from plans p
join (values
  ('free','service_limit', 3,    true,  null),
  ('free','package_limit', null, true,  null),
  ('free','product_limit', null, true,  null),
  ('free','location_limit',1,    true,  null),
  ('free','staff_limit',   0,    true,  null),
  ('free','runner_enabled',null, false, null),
  ('free','evidence_enabled',null, true, null),
  ('free','analytics_level',null, true, 'none'),
  ('free','custom_branding',null, false, null),
  ('paid','service_limit', null, true,  null),
  ('paid','location_limit',null, true,  null),
  ('paid','staff_limit',   5,    true,  null),
  ('paid','runner_enabled',null, true,  null),
  ('paid','evidence_enabled',null, true, null),
  ('paid','analytics_level',null, true, 'basic'),
  ('paid','custom_branding',null, true, null)
) as v(tier, key, limit_int, enabled, value_text) on v.tier = p.tier
on conflict (plan_id, key) do nothing;

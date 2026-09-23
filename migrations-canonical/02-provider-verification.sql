-- Canonical V1 · 02 · Structured provider verification (replaces single verified=true).
create table if not exists provider_verifications (
  id             uuid primary key default gen_random_uuid(),
  provider_id    uuid not null references providers(id) on delete cascade,
  verification_type text not null check (verification_type in ('identity','business','physical_location')),
  status         text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  reference      text,        -- document/reference pointer (private storage path)
  notes          text,
  verified_by    uuid,        -- superadmin user id
  verified_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (provider_id, verification_type)
);
create index if not exists idx_provider_verifications_provider on provider_verifications(provider_id);

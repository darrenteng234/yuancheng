-- Canonical V1 · 03 · Service listing + packages. Packages reuse `skus` (no new
-- SKU/variant complexity). A service = one provider offering in one place/context.
create table if not exists services (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references providers(id) on delete cascade,
  storefront_id uuid references storefronts(id) on delete cascade,
  place_id      uuid references temples(id),        -- nullable: future non-place services
  name          text not null,
  slug          text not null,
  description   text,
  request_guidance text,
  status        text not null default 'draft' check (status in ('draft','published','paused','archived')),
  customer_photo_required boolean not null default false,
  customer_photo_optional boolean not null default true,
  evidence_type       text not null default 'photo' check (evidence_type in ('none','photo','photo_and_video')),
  evidence_visibility text not null default 'automatic' check (evidence_visibility in ('automatic','approval_required')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (provider_id, slug)
);
create index if not exists idx_services_provider on services(provider_id);
create index if not exists idx_services_place on services(place_id);

-- Packages are priced tiers under a service. Reuse skus; link + tier + inclusions.
alter table skus add column if not exists service_id uuid references services(id) on delete cascade;
alter table skus add column if not exists tier       text check (tier in ('basic','standard','premium','custom'));
alter table skus add column if not exists includes   text[] default '{}';
create index if not exists idx_skus_service on skus(service_id);

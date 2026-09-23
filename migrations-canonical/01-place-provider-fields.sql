-- Canonical V1 · 01 · Place (reuse temples) + provider fields. ADDITIVE ONLY.
-- temples IS the canonical Place table (app/UI term = "Place"). No second table.
alter table temples add column if not exists slug            text;
alter table temples add column if not exists place_type      text;      -- e.g. temple, shrine, community
alter table temples add column if not exists google_place_id text;      -- trust/location signal, NOT identity
alter table temples add column if not exists description     text;
create unique index if not exists idx_temples_slug on temples(slug) where slug is not null;

-- Providers: business identity + location (independent from fulfilment place).
alter table providers add column if not exists slug             text;
alter table providers add column if not exists description      text;
alter table providers add column if not exists country          text;
alter table providers add column if not exists city             text;
alter table providers add column if not exists address          text;
alter table providers add column if not exists storefront_status text not null default 'draft'
                                               check (storefront_status in ('draft','published','paused'));
create unique index if not exists idx_providers_slug on providers(slug) where slug is not null;

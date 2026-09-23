-- Canonical V1 · 09 · RLS on all new tables — deny-by-default (service-role only).
alter table provider_verifications      enable row level security;
alter table services                    enable row level security;
alter table provider_payment_methods    enable row level security;
alter table order_payment_instructions  enable row level security;
alter table payment_proofs              enable row level security;
alter table order_events                enable row level security;
alter table fulfillment_tasks           enable row level security;
alter table plan_entitlements           enable row level security;
alter table provider_entitlements       enable row level security;

-- No anon/authenticated policies: the browser key gets nothing. All access is via
-- the service-role API, which bypasses RLS. (Same model as the rest of the schema.)
do $$
declare r record;
begin
  for r in select tablename, policyname from pg_policies where schemaname='public'
    and tablename in ('provider_verifications','services','provider_payment_methods',
      'order_payment_instructions','payment_proofs','order_events','fulfillment_tasks',
      'plan_entitlements','provider_entitlements')
  loop execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename); end loop;
end $$;

-- ============================================================================
-- Platform RLS — run AFTER migration-platform.sql
-- ----------------------------------------------------------------------------
-- Same model as rls-policies.sql: the app reads/writes exclusively through the
-- service-role API (which BYPASSES RLS). The public anon key is used only for
-- Supabase Auth. So: enable RLS everywhere and grant the anon role NOTHING —
-- deny by default. Public storefront/plan data is served via the service-role
-- API, not direct anon reads, so no anon SELECT policy is required.
-- ============================================================================

alter table plans               enable row level security;
alter table providers           enable row level security;
alter table provider_members    enable row level security;
alter table provider_temples    enable row level security;
alter table subscriptions       enable row level security;
alter table storefronts         enable row level security;
alter table platform_products   enable row level security;
alter table skus                enable row level security;
alter table platform_customers  enable row level security;
alter table platform_orders     enable row level security;
alter table order_items         enable row level security;
alter table order_evidence      enable row level security;
alter table payments            enable row level security;
alter table payouts             enable row level security;
alter table refunds             enable row level security;

-- Drop any prior policies on these tables (idempotent re-run).
do $$
declare r record;
begin
  for r in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('plans','providers','provider_members','provider_temples','subscriptions',
                        'storefronts','platform_products','skus','platform_customers','platform_orders',
                        'order_items','order_evidence','payments','payouts','refunds')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- No anon/authenticated policies are created: every table is closed to the
-- browser key. The service-role API is the only accessor, and it bypasses RLS.
--
-- If you later let providers/customers read their own rows via the anon key
-- directly (not through the API), add scoped policies, e.g.:
--   create policy own_orders on platform_orders for select
--     using ( customer_id in (select id from platform_customers where user_id = auth.uid())
--             or provider_id in (select provider_id from provider_members where user_id = auth.uid()) );

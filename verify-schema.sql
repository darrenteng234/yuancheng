-- ============================================================================
-- Post-migration verification. Run in the NEW Supabase SQL Editor AFTER applying
-- every migration. Confirms the LIVE database actually contains the objects —
-- do not trust the migration files alone. Every row should report PASS.
-- ============================================================================

-- 1) All expected tables exist (temple base + platform + admins)
with expected(t) as (values
  ('temples'),('products'),('packages'),('package_products'),('runners'),
  ('runner_temples'),('customers'),('orders'),('runner_receipts'),
  ('runner_payments'),('disputes'),('temple_requests'),('notifications'),
  ('settings'),('admins'),
  ('plans'),('providers'),('provider_members'),('provider_temples'),
  ('subscriptions'),('storefronts'),('platform_products'),('skus'),
  ('platform_customers'),('platform_orders'),('order_items'),('order_evidence'),
  ('payments'),('payouts'),('refunds'))
select 'TABLES' as check,
       case when count(*) = 0 then 'PASS — all present'
            else 'FAIL — missing: ' || string_agg(t, ', ') end as result
from expected e
where not exists (
  select 1 from information_schema.tables
  where table_schema = 'public' and table_name = e.t
);

-- 2) UNIQUE constraint/index on payments.stripe_payment_intent_id (webhook race guard)
select 'UNIQUE payments.stripe_payment_intent_id' as check,
       case when count(*) > 0 then 'PASS' else 'FAIL — constraint missing' end as result
from pg_indexes
where schemaname = 'public' and tablename = 'payments'
  and indexdef ilike '%unique%' and indexdef ilike '%stripe_payment_intent_id%';

-- 3) order_evidence.type CHECK allows the app types (photo/video/receipt/document)
select 'order_evidence.type CHECK' as check,
       case when pg_get_constraintdef(c.oid) ilike '%video%'
             and pg_get_constraintdef(c.oid) ilike '%document%'
            then 'PASS — video+document allowed'
            else 'FAIL — ' || pg_get_constraintdef(c.oid) end as result
from pg_constraint c
join pg_class t on t.oid = c.conrelid
where t.relname = 'order_evidence' and c.contype = 'c'
  and pg_get_constraintdef(c.oid) ilike '%type%';

-- 4) RLS enabled on every business table (anon must be denied by default)
select 'RLS ENABLED' as check,
       case when count(*) = 0 then 'PASS — RLS on all'
            else 'FAIL — RLS OFF: ' || string_agg(relname, ', ') end as result
from pg_class
where relnamespace = 'public'::regnamespace
  and relkind = 'r'
  and relname in ('providers','storefronts','skus','platform_orders','payments',
                  'order_evidence','admins','platform_customers','refunds','payouts')
  and relrowsecurity = false;

-- 5) No anon/authenticated policy exposes business tables (deny-by-default intact)
select 'NO anon write/read policy on sensitive tables' as check,
       case when count(*) = 0 then 'PASS'
            else 'FAIL — unexpected policies: ' || string_agg(tablename || '.' || policyname, ', ') end as result
from pg_policies
where schemaname = 'public'
  and tablename in ('platform_orders','payments','providers','skus','order_evidence','admins');

-- 6) Storage bucket 'believer' exists with video mimes + 50MB cap
select 'STORAGE bucket believer' as check,
       case when file_size_limit >= 52428800
             and 'video/mp4' = any(allowed_mime_types)
            then 'PASS — 50MB + video allowed'
            else 'FAIL — cap=' || coalesce(file_size_limit::text,'?') end as result
from storage.buckets where id = 'believer';

-- 7) Seed plans present (Free sku_limit=3, Pro unlimited)
select 'PLANS seeded' as check,
       case when count(*) filter (where tier='free'  and sku_limit = 3)    = 1
             and count(*) filter (where tier='paid'  and sku_limit is null) = 1
            then 'PASS — Free(3) + Pro(unlimited)'
            else 'FAIL — plans not seeded correctly' end as result
from plans;

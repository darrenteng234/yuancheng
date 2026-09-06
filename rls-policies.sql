-- ============================================================================
-- Yuan Cheng / Believer — Row Level Security policies (run AFTER schema)
-- ============================================================================
-- SECURITY MODEL
--   * The application performs ALL reads and writes server-side through Next.js
--     API routes using the Supabase SERVICE ROLE key, which BYPASSES RLS.
--   * The public ANON key (shipped to the browser via NEXT_PUBLIC_*) is used
--     ONLY for Supabase Auth (login/logout). It must NOT be able to read or
--     write business data directly.
--   * Therefore: expose ONLY the public catalog for anonymous SELECT, and DENY
--     the anon role everything else. Missing policy == deny by default under RLS.
--
-- This script is idempotent: re-running it drops and recreates every policy.
-- ============================================================================

-- 1) Enable RLS on all tables ------------------------------------------------
ALTER TABLE temples            ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE runners            ENABLE ROW LEVEL SECURITY;
ALTER TABLE runner_temples     ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE runner_receipts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE runner_payments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE temple_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings           ENABLE ROW LEVEL SECURITY;
-- If you use an "admins" table, keep RLS on and add NO anon policy (deny all):
ALTER TABLE IF EXISTS admins   ENABLE ROW LEVEL SECURITY;

-- 2) Drop any previous permissive policies (from earlier versions) -----------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 3) PUBLIC CATALOG — anonymous SELECT only ---------------------------------
--    These are safe to expose read-only (they are shown on the public site).
CREATE POLICY "public_read" ON temples          FOR SELECT USING (true);
CREATE POLICY "public_read" ON products         FOR SELECT USING (true);
CREATE POLICY "public_read" ON packages         FOR SELECT USING (true);
CREATE POLICY "public_read" ON package_products FOR SELECT USING (true);
CREATE POLICY "public_read" ON settings         FOR SELECT USING (true);

-- 4) EVERYTHING ELSE — no anon policy => default DENY ------------------------
--    orders, customers, runners, runner_temples, runner_receipts,
--    runner_payments, disputes, temple_requests, notifications, admins:
--    NO policy is created for the anon/authenticated (browser) roles, so the
--    anon key cannot read or write them. The server keeps working because the
--    service role bypasses RLS entirely.
--
--    Writes to the catalog tables are likewise denied to anon (no INSERT/UPDATE/
--    DELETE policy) — the admin panel writes them via the service-role API.
--
-- NOTE: If you later add customer/runner logins that read their own rows via the
--       anon key directly (not through the API), add scoped policies such as:
--         CREATE POLICY "own_orders" ON orders FOR SELECT
--           USING (customer_id = auth.uid());
--       Until then, keep these tables closed to anon.

-- Admin authentication migration
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add user_id column to runners table if it doesn't exist
ALTER TABLE runners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS on admins. NO anon policy: the admins table must be readable ONLY
-- via the service-role API (which bypasses RLS). A permissive USING(true) policy
-- would let anyone holding the public anon key enumerate admin user ids.
-- (CREATE POLICY has no IF NOT EXISTS in Postgres — drop then create.)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read admins" ON admins;
-- Intentionally no SELECT/INSERT/UPDATE/DELETE policy → deny-by-default to anon.

-- Believer V1 — Supabase Database Schema
-- Run this in your NEW Supabase project SQL Editor
-- No hardcoded UUIDs — uses gen_random_uuid() throughout

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TEMPLES
CREATE TABLE temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Thailand',
  city TEXT NOT NULL DEFAULT 'Bangkok',
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','researching','sop_drafted','runner_ready','active','paused')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','verified')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'physical' CHECK (type IN ('physical','service','donation')),
  cost_to_runner DECIMAL(10,2) NOT NULL DEFAULT 0,
  evidence_required TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PACKAGES
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','paused','archived')),
  evidence_sop JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PACKAGE PRODUCTS (many-to-many)
CREATE TABLE package_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(package_id, product_id)
);

-- RUNNERS
CREATE TABLE runners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','platinum')),
  quality_score INTEGER NOT NULL DEFAULT 50 CHECK (quality_score >= 0 AND quality_score <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','probation','suspended','banned')),
  return_rate DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RUNNER TEMPLES
CREATE TABLE runner_temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id UUID NOT NULL REFERENCES runners(id) ON DELETE CASCADE,
  temple_id UUID NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  UNIQUE(runner_id, temple_id)
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  segment TEXT DEFAULT 'one_time' CHECK (segment IN ('one_time','repeat','vip','vow_fulfiller','custom_vow','disputed')),
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  temple_id UUID NOT NULL REFERENCES temples(id),
  package_id UUID REFERENCES packages(id),
  runner_id UUID REFERENCES runners(id),
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','unassigned','in_progress','in_review','completed','disputed','refunded','cancelled')),
  customer_name TEXT,
  customer_phone TEXT,
  special_instructions TEXT,
  evidence_submitted JSONB DEFAULT '[]',
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RUNNER RECEIPTS
CREATE TABLE runner_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  runner_id UUID NOT NULL REFERENCES runners(id),
  product_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  transport_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','received','verified','rejected')),
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RUNNER PAYMENTS
CREATE TABLE runner_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id UUID NOT NULL REFERENCES runners(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_reimbursable DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','partial')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DISPUTES
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID REFERENCES customers(id),
  reason TEXT NOT NULL,
  customer_claim TEXT,
  runner_response TEXT,
  resolution TEXT CHECK (resolution IN ('full_refund','partial_refund','redo','rejected','pending')),
  refund_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','escalated')),
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TEMPLE REQUESTS
CREATE TABLE temple_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Thailand',
  city TEXT,
  requested_by TEXT,
  request_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','researching','approved','rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('warning','error','info','success')),
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_runner ON orders(runner_id);
CREATE INDEX idx_orders_temple ON orders(temple_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_receipts_order ON runner_receipts(order_id);
CREATE INDEX idx_receipts_runner ON runner_receipts(runner_id);
CREATE INDEX idx_receipts_status ON runner_receipts(status);
CREATE INDEX idx_disputes_order ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_packages_temple ON packages(temple_id);
CREATE INDEX idx_products_temple ON products(temple_id);
CREATE INDEX idx_runners_status ON runners(status);
CREATE INDEX idx_customers_segment ON customers(segment);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format('CREATE TRIGGER trigger_update_%s
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END;
$$;

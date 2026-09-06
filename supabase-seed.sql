-- Believer V1 — Seed Data v2
-- Run this AFTER supabase-schema.sql

DO $$
DECLARE
  erawan UUID;
  pkg_basic UUID; pkg_premium UUID; pkg_grand UUID; pkg_vow UUID;
  prd_jasmine UUID; prd_incense UUID; prd_marigold UUID; prd_candle UUID;
  prd_fruit_s UUID; prd_fruit_g UUID; prd_elephant UUID; prd_gold UUID;
  prd_amulet UUID; prd_dance UUID; prd_music UUID; prd_donation UUID;
  v_cust UUID; v_temple UUID; v_pkg UUID; v_runner UUID; v_order UUID;
BEGIN
  -- Clear existing data
  DELETE FROM settings;
  DELETE FROM notifications;
  DELETE FROM disputes;
  DELETE FROM runner_receipts;
  DELETE FROM orders;
  DELETE FROM package_products;
  DELETE FROM packages;
  DELETE FROM products;
  DELETE FROM runner_temples;
  DELETE FROM runners;
  DELETE FROM customers;
  DELETE FROM temple_requests;
  DELETE FROM temples;

  -- TEMPLES
  INSERT INTO temples (name, country, city, status, verification_status) VALUES
    ('Erawan Shrine', 'Thailand', 'Bangkok', 'active', 'verified'),
    ('Wat Pho', 'Thailand', 'Bangkok', 'researching', 'unverified'),
    ('Wat Arun', 'Thailand', 'Bangkok', 'pending', 'unverified'),
    ('Kek Lok Si', 'Malaysia', 'Penang', 'pending', 'unverified')
  RETURNING id INTO erawan;

  -- Take the first temple id (Erawan)
  SELECT id INTO erawan FROM temples WHERE name = 'Erawan Shrine' LIMIT 1;

  -- PRODUCTS
  INSERT INTO products (temple_id, name, type, cost_to_runner) VALUES
    (erawan, 'Jasmine Garland', 'physical', 5.00),
    (erawan, 'Incense Set', 'physical', 4.00),
    (erawan, 'Marigold Garland', 'physical', 4.00),
    (erawan, 'Candle Set', 'physical', 4.00),
    (erawan, 'Fruit Offering (Small)', 'physical', 8.00),
    (erawan, 'Fruit Offering (Grand)', 'physical', 15.00),
    (erawan, 'Wooden Elephant', 'physical', 12.00),
    (erawan, 'Gold Leaf', 'physical', 8.00),
    (erawan, 'Blessed Amulet', 'physical', 18.00),
    (erawan, 'Thai Dance (5 min)', 'service', 76.00),
    (erawan, 'Music Dedication', 'service', 40.00),
    (erawan, 'Temple Donation', 'donation', 0.00);

  SELECT id INTO prd_jasmine FROM products WHERE name = 'Jasmine Garland' LIMIT 1;
  SELECT id INTO prd_incense FROM products WHERE name = 'Incense Set' LIMIT 1;
  SELECT id INTO prd_marigold FROM products WHERE name = 'Marigold Garland' LIMIT 1;
  SELECT id INTO prd_candle FROM products WHERE name = 'Candle Set' LIMIT 1;
  SELECT id INTO prd_fruit_s FROM products WHERE name = 'Fruit Offering (Small)' LIMIT 1;
  SELECT id INTO prd_fruit_g FROM products WHERE name = 'Fruit Offering (Grand)' LIMIT 1;
  SELECT id INTO prd_elephant FROM products WHERE name = 'Wooden Elephant' LIMIT 1;
  SELECT id INTO prd_gold FROM products WHERE name = 'Gold Leaf' LIMIT 1;
  SELECT id INTO prd_amulet FROM products WHERE name = 'Blessed Amulet' LIMIT 1;
  SELECT id INTO prd_dance FROM products WHERE name = 'Thai Dance (5 min)' LIMIT 1;
  SELECT id INTO prd_music FROM products WHERE name = 'Music Dedication' LIMIT 1;
  SELECT id INTO prd_donation FROM products WHERE name = 'Temple Donation' LIMIT 1;

  -- PACKAGES
  INSERT INTO packages (temple_id, name, description, selling_price, status) VALUES
    (erawan, 'Business Wish — Basic', '5 products', 88.00, 'active'),
    (erawan, 'Business Wish — Premium', '6 products', 188.00, 'active'),
    (erawan, 'Business Wish — Grand', '8 products', 388.00, 'active'),
    (erawan, 'Vow — Small', 'Simple vow fulfillment', 108.00, 'active');

  SELECT id INTO pkg_basic FROM packages WHERE name = 'Business Wish — Basic' LIMIT 1;
  SELECT id INTO pkg_premium FROM packages WHERE name = 'Business Wish — Premium' LIMIT 1;
  SELECT id INTO pkg_grand FROM packages WHERE name = 'Business Wish — Grand' LIMIT 1;
  SELECT id INTO pkg_vow FROM packages WHERE name = 'Vow — Small' LIMIT 1;

  -- PACKAGE PRODUCTS
  INSERT INTO package_products (package_id, product_id, quantity) VALUES
    (pkg_basic, prd_jasmine, 3),
    (pkg_basic, prd_incense, 1),
    (pkg_basic, prd_marigold, 3),
    (pkg_basic, prd_candle, 1);

  INSERT INTO package_products (package_id, product_id, quantity) VALUES
    (pkg_premium, prd_jasmine, 3),
    (pkg_premium, prd_incense, 1),
    (pkg_premium, prd_marigold, 3),
    (pkg_premium, prd_candle, 1),
    (pkg_premium, prd_dance, 1),
    (pkg_premium, prd_amulet, 1);

  INSERT INTO package_products (package_id, product_id, quantity) VALUES
    (pkg_grand, prd_jasmine, 3),
    (pkg_grand, prd_incense, 1),
    (pkg_grand, prd_marigold, 3),
    (pkg_grand, prd_candle, 1),
    (pkg_grand, prd_dance, 1),
    (pkg_grand, prd_amulet, 1),
    (pkg_grand, prd_fruit_g, 1),
    (pkg_grand, prd_elephant, 1),
    (pkg_grand, prd_gold, 1);

  INSERT INTO package_products (package_id, product_id, quantity) VALUES
    (pkg_vow, prd_jasmine, 2),
    (pkg_vow, prd_incense, 1),
    (pkg_vow, prd_candle, 1);

  -- RUNNERS
  INSERT INTO runners (name, tier, quality_score, status, return_rate) VALUES
    ('Somchai R.', 'gold', 82, 'active', 8.00),
    ('Pranee S.', 'bronze', 65, 'probation', 33.00),
    ('Wichai K.', 'bronze', 35, 'suspended', 60.00);

  -- RUNNER TEMPLES
  INSERT INTO runner_temples (runner_id, temple_id)
  SELECT r.id, t.id FROM runners r, temples t WHERE t.name = 'Erawan Shrine';

  -- CUSTOMERS
  INSERT INTO customers (name, email, segment, total_orders, total_spent) VALUES
    ('Darren', 'darren@email.com', 'vip', 3, 624.00),
    ('Mei Ling', 'meiling@email.com', 'vow_fulfiller', 1, 228.00),
    ('Ah Hock', 'ahhock@email.com', 'one_time', 1, 68.00),
    ('Raj', 'raj@email.com', 'disputed', 1, 228.00);

  SELECT id INTO v_temple FROM temples WHERE name = 'Erawan Shrine' LIMIT 1;

  -- ORDERS
  SELECT id INTO v_cust FROM customers WHERE name = 'Mei Ling' LIMIT 1;
  SELECT id INTO v_pkg FROM packages WHERE name = 'Business Wish — Premium' LIMIT 1;
  SELECT id INTO v_runner FROM runners WHERE name = 'Somchai R.' LIMIT 1;
  INSERT INTO orders (order_number, customer_id, temple_id, package_id, runner_id, selling_price, status, customer_name)
  VALUES ('1004', v_cust, v_temple, v_pkg, v_runner, 228.00, 'in_progress', 'Mei Ling');

  SELECT id INTO v_cust FROM customers WHERE name = 'Darren' LIMIT 1;
  SELECT id INTO v_pkg FROM packages WHERE name = 'Business Wish — Grand' LIMIT 1;
  INSERT INTO orders (order_number, customer_id, temple_id, package_id, runner_id, selling_price, status, customer_name)
  VALUES ('1003', v_cust, v_temple, v_pkg, NULL, 388.00, 'unassigned', 'Darren');

  SELECT id INTO v_cust FROM customers WHERE name = 'Ah Hock' LIMIT 1;
  SELECT id INTO v_pkg FROM packages WHERE name = 'Business Wish — Basic' LIMIT 1;
  INSERT INTO orders (order_number, customer_id, temple_id, package_id, runner_id, selling_price, status, customer_name)
  VALUES ('1002', v_cust, v_temple, v_pkg, v_runner, 68.00, 'in_review', 'Ah Hock');

  SELECT id INTO v_cust FROM customers WHERE name = 'Darren' LIMIT 1;
  INSERT INTO orders (order_number, customer_id, temple_id, package_id, runner_id, selling_price, status, customer_name)
  VALUES ('1001', v_cust, v_temple, v_pkg, v_runner, 168.00, 'completed', 'Darren');

  SELECT id INTO v_cust FROM customers WHERE name = 'Raj' LIMIT 1;
  SELECT id INTO v_pkg FROM packages WHERE name = 'Vow — Small' LIMIT 1;
  INSERT INTO orders (order_number, customer_id, temple_id, package_id, runner_id, selling_price, status, customer_name)
  VALUES ('0999', v_cust, v_temple, v_pkg, v_runner, 228.00, 'disputed', 'Raj');

  SELECT id INTO v_cust FROM customers WHERE name = 'Darren' LIMIT 1;
  SELECT id INTO v_pkg FROM packages WHERE name = 'Business Wish — Basic' LIMIT 1;
  SELECT id INTO v_runner FROM runners WHERE name = 'Pranee S.' LIMIT 1;
  INSERT INTO orders (order_number, customer_id, temple_id, package_id, runner_id, selling_price, status, customer_name)
  VALUES ('1000', v_cust, v_temple, v_pkg, v_runner, 88.00, 'completed', 'Darren');

  SELECT id INTO v_cust FROM customers WHERE name = 'Ah Hock' LIMIT 1;
  SELECT id INTO v_runner FROM runners WHERE name = 'Somchai R.' LIMIT 1;
  INSERT INTO orders (order_number, customer_id, temple_id, package_id, runner_id, selling_price, status, customer_name)
  VALUES ('0998', v_cust, v_temple, v_pkg, v_runner, 68.00, 'in_review', 'Ah Hock');

  -- RUNNER RECEIPTS
  SELECT id INTO v_order FROM orders WHERE order_number = '1002' LIMIT 1;
  SELECT id INTO v_runner FROM runners WHERE name = 'Somchai R.' LIMIT 1;
  INSERT INTO runner_receipts (order_id, runner_id, product_cost, transport_cost, status, submitted_at)
  VALUES (v_order, v_runner, 35.00, 12.00, 'received', NOW() - INTERVAL '2 hours');

  SELECT id INTO v_order FROM orders WHERE order_number = '0999' LIMIT 1;
  INSERT INTO runner_receipts (order_id, runner_id, product_cost, transport_cost, status, submitted_at)
  VALUES (v_order, v_runner, 45.00, 10.00, 'received', NOW() - INTERVAL '1 day');

  SELECT id INTO v_order FROM orders WHERE order_number = '1000' LIMIT 1;
  SELECT id INTO v_runner FROM runners WHERE name = 'Pranee S.' LIMIT 1;
  INSERT INTO runner_receipts (order_id, runner_id, product_cost, transport_cost, status, submitted_at)
  VALUES (v_order, v_runner, 45.00, 10.00, 'received', NOW() - INTERVAL '2 days');

  SELECT id INTO v_order FROM orders WHERE order_number = '0998' LIMIT 1;
  SELECT id INTO v_runner FROM runners WHERE name = 'Somchai R.' LIMIT 1;
  INSERT INTO runner_receipts (order_id, runner_id, product_cost, transport_cost, status)
  VALUES (v_order, v_runner, 35.00, 12.00, 'pending');

  -- DISPUTE
  SELECT id INTO v_order FROM orders WHERE order_number = '0999' LIMIT 1;
  SELECT id INTO v_cust FROM customers WHERE name = 'Raj' LIMIT 1;
  INSERT INTO disputes (order_id, customer_id, reason, customer_claim, runner_response, status)
  VALUES (v_order, v_cust, 'Evidence quality is poor',
    'Photos are blurry. Cannot see my name on the OVC. Video only shows 2 faces, not all 4.',
    'Photos were taken in low light. OVC was displayed. Video shows all 4 faces.',
    'open');

  -- TEMPLE REQUESTS
  INSERT INTO temple_requests (temple_name, country, city, requested_by, request_count, status) VALUES
    ('Wat Pho', 'Thailand', 'Bangkok', 'Darren', 1, 'researching'),
    ('Wat Arun', 'Thailand', 'Bangkok', 'Mei Ling', 1, 'pending'),
    ('Kek Lok Si', 'Malaysia', 'Penang', 'Ah Hock', 3, 'pending');

  -- NOTIFICATIONS
  INSERT INTO notifications (type, message, link) VALUES
    ('warning', 'Runner shortage at Erawan Shrine. Only 1 active runner.', '/admin/temples'),
    ('warning', '3 orders waiting for evidence review.', '/admin/orders'),
    ('error', 'Dispute filed - Order #0999 (Raj)', '/admin/orders'),
    ('info', 'Thai Dance cost +19%. Pricing updated.', '/admin/economics'),
    ('success', 'New temple request: Kek Lok Si (Malaysia)', '/admin/temples');

  -- SETTINGS
  INSERT INTO settings (key, value) VALUES
    ('legal', '{"platform_description": "We facilitate temple-related services and offerings.", "refund_policy": "Full refund if service not completed.", "legal_entity": "Not registered"}'),
    ('notifications', '{"customer_order_placed": true, "admin_new_order": true, "admin_new_dispute": true}'),
    ('runner_config', '{"default_fee": 20.00, "response_timeout_hours": 4, "min_runners_per_temple": 2, "probation_orders": 3, "payout_schedule": "weekly"}'),
    ('multi_country', '{"countries": [{"code": "TH", "currency": "THB", "status": "active"}, {"code": "MY", "currency": "MYR", "status": "not_started"}]}');

  RAISE NOTICE 'Seed data loaded successfully';
END $$;

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jizagahrnywfohhwcpoh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemFnYWhybnl3Zm9oaHdjcG9oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg4MzA1OCwiZXhwIjoyMDk2NDU5MDU4fQ.oQOj_Num_K1VG4wxqmsLShFDeQgu_tWK3lF2sLIdVwI'
);

async function seed() {
  console.log('Starting seed...\n');

  // 1. TEMPLES
  const { data: temples } = await supabase.from('temples').insert([
    { name: 'Erawan Shrine', country: 'Thailand', city: 'Bangkok', status: 'active', verification_status: 'verified' },
    { name: 'Wat Pho', country: 'Thailand', city: 'Bangkok', status: 'researching', verification_status: 'unverified' },
    { name: 'Wat Arun', country: 'Thailand', city: 'Bangkok', status: 'pending', verification_status: 'unverified' },
    { name: 'Kek Lok Si', country: 'Malaysia', city: 'Penang', status: 'pending', verification_status: 'unverified' },
  ]).select();
  console.log('Temples:', temples?.length || 0);
  const erawan = temples?.find(t => t.name === 'Erawan Shrine')?.id;

  // 2. PRODUCTS
  const { data: products } = await supabase.from('products').insert([
    { temple_id: erawan, name: 'Jasmine Garland', type: 'physical', cost_to_runner: 5.00 },
    { temple_id: erawan, name: 'Incense Set', type: 'physical', cost_to_runner: 4.00 },
    { temple_id: erawan, name: 'Marigold Garland', type: 'physical', cost_to_runner: 4.00 },
    { temple_id: erawan, name: 'Candle Set', type: 'physical', cost_to_runner: 4.00 },
    { temple_id: erawan, name: 'Fruit Offering (Small)', type: 'physical', cost_to_runner: 8.00 },
    { temple_id: erawan, name: 'Fruit Offering (Grand)', type: 'physical', cost_to_runner: 15.00 },
    { temple_id: erawan, name: 'Wooden Elephant', type: 'physical', cost_to_runner: 12.00 },
    { temple_id: erawan, name: 'Gold Leaf', type: 'physical', cost_to_runner: 8.00 },
    { temple_id: erawan, name: 'Blessed Amulet', type: 'physical', cost_to_runner: 18.00 },
    { temple_id: erawan, name: 'Thai Dance (5 min)', type: 'service', cost_to_runner: 76.00 },
    { temple_id: erawan, name: 'Music Dedication', type: 'service', cost_to_runner: 40.00 },
    { temple_id: erawan, name: 'Temple Donation', type: 'donation', cost_to_runner: 0.00 },
  ]).select();
  console.log('Products:', products?.length || 0);

  // 3. PACKAGES
  const { data: packages } = await supabase.from('packages').insert([
    { temple_id: erawan, name: 'Business Wish — Basic', description: '5 products', selling_price: 88.00, status: 'active' },
    { temple_id: erawan, name: 'Business Wish — Premium', description: '6 products', selling_price: 188.00, status: 'active' },
    { temple_id: erawan, name: 'Business Wish — Grand', description: '8 products', selling_price: 388.00, status: 'active' },
    { temple_id: erawan, name: 'Vow — Small', description: 'Simple vow fulfillment', selling_price: 108.00, status: 'active' },
  ]).select();
  console.log('Packages:', packages?.length || 0);

  const pkgBasic = packages?.find(p => p.name === 'Business Wish — Basic')?.id;
  const pkgPremium = packages?.find(p => p.name === 'Business Wish — Premium')?.id;
  const pkgGrand = packages?.find(p => p.name === 'Business Wish — Grand')?.id;
  const pkgVow = packages?.find(p => p.name === 'Vow — Small')?.id;

  const getProduct = (name) => products?.find(p => p.name === name)?.id;
  const pj = getProduct('Jasmine Garland');
  const pi = getProduct('Incense Set');
  const pm = getProduct('Marigold Garland');
  const pc = getProduct('Candle Set');
  const pfg = getProduct('Fruit Offering (Grand)');
  const pe = getProduct('Wooden Elephant');
  const pg = getProduct('Gold Leaf');
  const pa = getProduct('Blessed Amulet');
  const pd = getProduct('Thai Dance (5 min)');

  // 4. PACKAGE PRODUCTS
  await supabase.from('package_products').insert([
    { package_id: pkgBasic, product_id: pj, quantity: 3 },
    { package_id: pkgBasic, product_id: pi, quantity: 1 },
    { package_id: pkgBasic, product_id: pm, quantity: 3 },
    { package_id: pkgBasic, product_id: pc, quantity: 1 },
    { package_id: pkgPremium, product_id: pj, quantity: 3 },
    { package_id: pkgPremium, product_id: pi, quantity: 1 },
    { package_id: pkgPremium, product_id: pm, quantity: 3 },
    { package_id: pkgPremium, product_id: pc, quantity: 1 },
    { package_id: pkgPremium, product_id: pd, quantity: 1 },
    { package_id: pkgPremium, product_id: pa, quantity: 1 },
    { package_id: pkgGrand, product_id: pj, quantity: 3 },
    { package_id: pkgGrand, product_id: pi, quantity: 1 },
    { package_id: pkgGrand, product_id: pm, quantity: 3 },
    { package_id: pkgGrand, product_id: pc, quantity: 1 },
    { package_id: pkgGrand, product_id: pd, quantity: 1 },
    { package_id: pkgGrand, product_id: pa, quantity: 1 },
    { package_id: pkgGrand, product_id: pfg, quantity: 1 },
    { package_id: pkgGrand, product_id: pe, quantity: 1 },
    { package_id: pkgGrand, product_id: pg, quantity: 1 },
    { package_id: pkgVow, product_id: pj, quantity: 2 },
    { package_id: pkgVow, product_id: pi, quantity: 1 },
    { package_id: pkgVow, product_id: pc, quantity: 1 },
  ]);
  console.log('Package products: 22');

  // 5. RUNNERS
  const { data: runners } = await supabase.from('runners').insert([
    { name: 'Somchai R.', tier: 'gold', quality_score: 82, status: 'active', return_rate: 8.00 },
    { name: 'Pranee S.', tier: 'bronze', quality_score: 65, status: 'probation', return_rate: 33.00 },
    { name: 'Wichai K.', tier: 'bronze', quality_score: 35, status: 'suspended', return_rate: 60.00 },
  ]).select();
  console.log('Runners:', runners?.length || 0);

  // 6. RUNNER TEMPLES
  await supabase.from('runner_temples').insert(
    runners.map(r => ({ runner_id: r.id, temple_id: erawan }))
  );
  console.log('Runner temples:', runners?.length || 0);

  // 7. CUSTOMERS
  const { data: customers } = await supabase.from('customers').insert([
    { name: 'Darren', email: 'darren@email.com', segment: 'vip', total_orders: 3, total_spent: 624.00 },
    { name: 'Mei Ling', email: 'meiling@email.com', segment: 'vow_fulfiller', total_orders: 1, total_spent: 228.00 },
    { name: 'Ah Hock', email: 'ahhock@email.com', segment: 'one_time', total_orders: 1, total_spent: 68.00 },
    { name: 'Raj', email: 'raj@email.com', segment: 'disputed', total_orders: 1, total_spent: 228.00 },
  ]).select();
  console.log('Customers:', customers?.length || 0);

  const somchai = runners?.find(r => r.name === 'Somchai R.')?.id;
  const pranee = runners?.find(r => r.name === 'Pranee S.')?.id;
  const darren = customers?.find(c => c.name === 'Darren')?.id;
  const meiling = customers?.find(c => c.name === 'Mei Ling')?.id;
  const ahhock = customers?.find(c => c.name === 'Ah Hock')?.id;
  const raj = customers?.find(c => c.name === 'Raj')?.id;

  // 8. ORDERS
  const { data: orders } = await supabase.from('orders').insert([
    { order_number: '1004', customer_id: meiling, temple_id: erawan, package_id: pkgPremium, runner_id: somchai, selling_price: 228.00, status: 'in_progress', customer_name: 'Mei Ling' },
    { order_number: '1003', customer_id: darren, temple_id: erawan, package_id: pkgGrand, runner_id: null, selling_price: 388.00, status: 'unassigned', customer_name: 'Darren' },
    { order_number: '1002', customer_id: ahhock, temple_id: erawan, package_id: pkgBasic, runner_id: somchai, selling_price: 68.00, status: 'in_review', customer_name: 'Ah Hock' },
    { order_number: '1001', customer_id: darren, temple_id: erawan, package_id: pkgBasic, runner_id: somchai, selling_price: 168.00, status: 'completed', customer_name: 'Darren' },
    { order_number: '0999', customer_id: raj, temple_id: erawan, package_id: pkgVow, runner_id: somchai, selling_price: 228.00, status: 'disputed', customer_name: 'Raj' },
    { order_number: '1000', customer_id: darren, temple_id: erawan, package_id: pkgBasic, runner_id: pranee, selling_price: 88.00, status: 'completed', customer_name: 'Darren' },
    { order_number: '0998', customer_id: ahhock, temple_id: erawan, package_id: pkgBasic, runner_id: somchai, selling_price: 68.00, status: 'in_review', customer_name: 'Ah Hock' },
  ]).select();
  console.log('Orders:', orders?.length || 0);

  // 9. RUNNER RECEIPTS
  const o1002 = orders?.find(o => o.order_number === '1002')?.id;
  const o0999 = orders?.find(o => o.order_number === '0999')?.id;
  const o1000 = orders?.find(o => o.order_number === '1000')?.id;
  const o0998 = orders?.find(o => o.order_number === '0998')?.id;

  await supabase.from('runner_receipts').insert([
    { order_id: o1002, runner_id: somchai, product_cost: 35.00, transport_cost: 12.00, status: 'received', submitted_at: new Date(Date.now() - 2*3600000).toISOString() },
    { order_id: o0999, runner_id: somchai, product_cost: 45.00, transport_cost: 10.00, status: 'received', submitted_at: new Date(Date.now() - 86400000).toISOString() },
    { order_id: o1000, runner_id: pranee, product_cost: 45.00, transport_cost: 10.00, status: 'received', submitted_at: new Date(Date.now() - 2*86400000).toISOString() },
    { order_id: o0998, runner_id: somchai, product_cost: 35.00, transport_cost: 12.00, status: 'pending' },
  ]);
  console.log('Runner receipts: 4');

  // 10. DISPUTE
  await supabase.from('disputes').insert({
    order_id: o0999, customer_id: raj, reason: 'Evidence quality is poor',
    customer_claim: 'Photos are blurry. Cannot see my name on the OVC.',
    runner_response: 'Photos were taken in low light. OVC was displayed.',
    status: 'open'
  });
  console.log('Disputes: 1');

  // 11. TEMPLE REQUESTS
  await supabase.from('temple_requests').insert([
    { temple_name: 'Wat Pho', country: 'Thailand', city: 'Bangkok', requested_by: 'Darren', request_count: 1, status: 'researching' },
    { temple_name: 'Wat Arun', country: 'Thailand', city: 'Bangkok', requested_by: 'Mei Ling', request_count: 1, status: 'pending' },
    { temple_name: 'Kek Lok Si', country: 'Malaysia', city: 'Penang', requested_by: 'Ah Hock', request_count: 3, status: 'pending' },
  ]);
  console.log('Temple requests: 3');

  // 12. NOTIFICATIONS
  await supabase.from('notifications').insert([
    { type: 'warning', message: 'Runner shortage at Erawan Shrine. Only 1 active runner.', link: '/admin/temples' },
    { type: 'warning', message: '3 orders waiting for evidence review.', link: '/admin/orders' },
    { type: 'error', message: 'Dispute filed - Order #0999 (Raj)', link: '/admin/orders' },
    { type: 'info', message: 'Thai Dance cost +19%. Pricing updated.', link: '/admin/economics' },
    { type: 'success', message: 'New temple request: Kek Lok Si (Malaysia)', link: '/admin/temples' },
  ]);
  console.log('Notifications: 5');

  // 13. SETTINGS
  await supabase.from('settings').insert([
    { key: 'legal', value: { platform_description: 'We facilitate temple-related services and offerings.', refund_policy: 'Full refund if service not completed.', legal_entity: 'Not registered' } },
    { key: 'notifications', value: { customer_order_placed: true, admin_new_order: true, admin_new_dispute: true } },
    { key: 'runner_config', value: { default_fee: 20.00, response_timeout_hours: 4, min_runners_per_temple: 2, probation_orders: 3, payout_schedule: 'weekly' } },
    { key: 'multi_country', value: { countries: [{ code: 'TH', currency: 'THB', status: 'active' }, { code: 'MY', currency: 'MYR', status: 'not_started' }] } },
  ]);
  console.log('Settings: 4');

  console.log('\nSeed complete!');
}

seed().catch(e => console.error('Error:', e.message));

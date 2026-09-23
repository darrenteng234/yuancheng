/**
 * Beta demo seeder — INSERT-only, idempotent, fictional "Investor Demo" data.
 * Never drops/resets; safe to re-run. Run: npx tsx scripts/seed-demo.ts
 *
 * Creates: 4 auth accounts, place (temple), approved provider, published
 * storefront, services + physical product (real SKUs), customer, runner,
 * demo orders A (paid, ready to accept) & B (completed w/ evidence).
 *
 * Passwords are generated securely and printed ONCE. Not committed.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { paymentFieldsFromGross } from '../src/lib/domain/payment';
import type { Currency } from '../src/types/platform';

const env: Record<string, string> = {};
for (const line of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2];
}
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !SVC) { console.error('Missing Supabase env'); process.exit(1); }
const H = { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json' };

async function rest(path: string, init?: RequestInit) {
  const r = await fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init?.headers || {}) } });
  const txt = await r.text(); let body: unknown; try { body = txt ? JSON.parse(txt) : null; } catch { body = txt; }
  if (!r.ok) throw new Error(`${r.status} ${path}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body as never;
}
const first = <T,>(a: T[]): T | undefined => (Array.isArray(a) ? a[0] : undefined);

/** Insert if a row matching `filter` (PostgREST query) doesn't exist; return the row. */
async function ensure<T = Record<string, unknown>>(table: string, filter: string, insert: Record<string, unknown>): Promise<T> {
  const found = first(await rest(`${table}?${filter}&limit=1`) as T[]);
  if (found) return found;
  const created = await rest(table, { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(insert) });
  return first(created as T[]) as T;
}

const genPassword = () => crypto.randomBytes(12).toString('base64url').slice(0, 16) + 'A9!';
const token = () => crypto.randomBytes(24).toString('base64url');

interface AuthUser { id: string; email: string; }
const newAccounts: { email: string; password: string }[] = [];

async function ensureAuthUser(email: string): Promise<AuthUser> {
  // Look up by email (admin API), else create with a generated password.
  const r = await fetch(`${URL_}/auth/v1/admin/users?per_page=200`, { headers: H });
  const list = (await r.json()) as { users?: AuthUser[] } | AuthUser[];
  const users = (Array.isArray(list) ? list : list.users) || [];
  const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing;
  const password = genPassword();
  const c = await fetch(`${URL_}/auth/v1/admin/users`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!c.ok) throw new Error(`create user ${email}: ${c.status} ${await c.text()}`);
  const created = (await c.json()) as AuthUser;
  newAccounts.push({ email, password });
  return created;
}

async function main() {
  console.log('Seeding beta demo data…\n');

  // 1) Accounts
  const customer = await ensureAuthUser('sales.customer@yuancheng.demo');
  const providerU = await ensureAuthUser('sales.provider@yuancheng.demo');
  const adminU = await ensureAuthUser('sales.admin@yuancheng.demo');
  const runnerU = await ensureAuthUser('sales.runner@yuancheng.demo');

  // admin row for admin account
  await ensure('admins', `user_id=eq.${adminU.id}`, { user_id: adminU.id, role: 'admin' });

  // 2) Plan (Free)
  const freePlan = first(await rest('plans?tier=eq.free&limit=1') as { id: string }[]);
  if (!freePlan) throw new Error('Free plan not found — run migrations first');

  // 3) Place (temple)
  const place = await ensure<{ id: string }>('temples', `name=eq.Golden%20Lotus%20Temple`, {
    name: 'Golden Lotus Temple', country: 'Malaysia', city: 'Kuala Lumpur',
    status: 'active', verification_status: 'verified', notes: 'Investor Demo Place',
  });

  // 4) Provider (approved, owned by provider account)
  const provider = await ensure<{ id: string }>('providers', `owner_user_id=eq.${providerU.id}`, {
    name: 'Golden Lotus Services', kind: 'religious_service', status: 'approved',
    fulfillment_mode: 'provider', owner_user_id: providerU.id,
    contact_email: 'sales.provider@yuancheng.demo', default_locale: 'en',
    temple_id: place.id, plan_id: freePlan.id, approved_at: new Date().toISOString(),
  });
  await ensure('provider_members', `provider_id=eq.${provider.id}&user_id=eq.${providerU.id}`,
    { provider_id: provider.id, user_id: providerU.id, role: 'owner' });
  await ensure('provider_temples', `provider_id=eq.${provider.id}&temple_id=eq.${place.id}`,
    { provider_id: provider.id, temple_id: place.id });

  // 5) Storefront (published)
  const storefront = await ensure<{ id: string }>('storefronts', `slug=eq.golden-lotus-services`, {
    provider_id: provider.id, slug: 'golden-lotus-services', name: 'Golden Lotus Services',
    description: 'Offerings, ceremonies and remembrance services at Golden Lotus Temple.',
    status: 'published', locale: 'en',
  });

  // 6) Products + SKUs (published)
  const svcProduct = await ensure<{ id: string }>('platform_products',
    `storefront_id=eq.${storefront.id}&name=eq.Temple%20Services`,
    { provider_id: provider.id, storefront_id: storefront.id, name: 'Temple Services', type: 'service' });
  const physProduct = await ensure<{ id: string }>('platform_products',
    `storefront_id=eq.${storefront.id}&name=eq.Religious%20Products`,
    { provider_id: provider.id, storefront_id: storefront.id, name: 'Religious Products', type: 'physical' });

  const skuOffering = await ensure<{ id: string; price: number }>('skus',
    `provider_id=eq.${provider.id}&name=eq.Temple%20Offering%20Service`,
    { product_id: svcProduct.id, provider_id: provider.id, name: 'Temple Offering Service', price: 88, currency: 'MYR', status: 'published', evidence_required: ['photo', 'video'] });
  await ensure('skus', `provider_id=eq.${provider.id}&name=eq.Blessing%20Service`,
    { product_id: svcProduct.id, provider_id: provider.id, name: 'Blessing Service', price: 120, currency: 'MYR', status: 'published', evidence_required: ['photo'] });
  await ensure('skus', `provider_id=eq.${provider.id}&name=eq.Ancestral%20Remembrance`,
    { product_id: svcProduct.id, provider_id: provider.id, name: 'Ancestral Remembrance', price: 168, currency: 'MYR', status: 'published', evidence_required: ['photo', 'video'] });
  await ensure('skus', `provider_id=eq.${provider.id}&name=eq.Blessing%20Set`,
    { product_id: physProduct.id, provider_id: provider.id, name: 'Blessing Set', price: 68, currency: 'MYR', status: 'published', evidence_required: [] });

  // 7) Customer + runner
  const customerRow = await ensure<{ id: string }>('platform_customers', `user_id=eq.${customer.id}`,
    { user_id: customer.id, name: 'Demo Customer', email: 'sales.customer@yuancheng.demo', preferred_language: 'en' });
  await ensure('runners', `user_id=eq.${runnerU.id}`,
    { name: 'Demo Runner', email: 'sales.runner@yuancheng.demo', status: 'active', tier: 'bronze', quality_score: 60, user_id: runnerU.id });

  // 8) Demo orders
  const cur: Currency = 'MYR';
  async function makeOrder(orderNumber: string, status: string, extra: Record<string, unknown>) {
    const existing = first(await rest(`platform_orders?order_number=eq.${orderNumber}&limit=1`) as { id: string }[]);
    if (existing) return existing;
    const created = first(await rest('platform_orders', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        order_number: orderNumber, provider_id: provider.id, storefront_id: storefront.id,
        customer_id: customerRow.id, status, currency: cur, subtotal: 88, total: 88,
        customer_name: 'Demo Customer', customer_email: 'sales.customer@yuancheng.demo',
        access_token: token(), ...extra,
      }),
    }) as { id: string }[]) as { id: string };
    await rest('order_items', { method: 'POST', body: JSON.stringify({
      order_id: created.id, sku_id: skuOffering.id, sku_name: 'Temple Offering Service', unit_price: 88, quantity: 1, line_total: 88 }) });
    const money = paymentFieldsFromGross(88, cur);
    await rest('payments', { method: 'POST', body: JSON.stringify({
      order_id: created.id, provider_id: provider.id, ...money,
      status: 'succeeded', payout_status: 'pending',
      stripe_payment_intent_id: `pi_demo_${orderNumber}` }) });
    return created;
  }

  // Order A — paid, ready for provider to accept
  await makeOrder('YC-90001', 'paid', {});

  // Order B — completed, with evidence
  const now = new Date().toISOString();
  const orderB = await makeOrder('YC-90002', 'completed', {
    fulfiller_id: providerU.id, accepted_at: now, completed_at: now });
  const hasEvidence = first(await rest(`order_evidence?order_id=eq.${orderB.id}&limit=1`) as unknown[]);
  if (!hasEvidence) {
    await rest('order_evidence', { method: 'POST', body: JSON.stringify([
      { order_id: orderB.id, type: 'photo', url: 'https://picsum.photos/seed/yuancheng1/800/600', label: 'Offering placed', uploaded_by: providerU.id },
      { order_id: orderB.id, type: 'photo', url: 'https://picsum.photos/seed/yuancheng2/800/600', label: 'At the altar', uploaded_by: providerU.id },
      { order_id: orderB.id, type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', label: 'Ceremony clip', uploaded_by: providerU.id },
    ]) });
  }

  console.log('✓ Place, provider, storefront, 4 SKUs, customer, runner seeded');
  console.log('✓ Orders YC-90001 (paid) and YC-90002 (completed + evidence) seeded\n');

  if (newAccounts.length) {
    console.log('=== NEW DEMO ACCOUNT PASSWORDS (shown once — store securely, not committed) ===');
    for (const a of newAccounts) console.log(`  ${a.email}   ${a.password}`);
    console.log('==============================================================================');
  } else {
    console.log('(All demo accounts already existed — no new passwords generated.)');
  }
}

main().catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1); });

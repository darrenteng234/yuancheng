/**
 * Beta demo RESET — deletes ONLY the fictional Investor Demo records seeded by
 * seed-demo.ts, then you can re-run the seeder for a clean loop. Run:
 *   npx tsx scripts/reset-demo.ts
 *
 * SAFETY: never drops schema, never truncates, never touches non-demo rows.
 * It deletes strictly by demo identifiers (demo emails, the demo storefront
 * slug, order numbers YC-9000x). Auth accounts are left intact by default;
 * pass --accounts to also remove the 4 demo auth users.
 */
import fs from 'node:fs';

const env: Record<string, string> = {};
for (const line of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2];
}
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !SVC) { console.error('Missing Supabase env'); process.exit(1); }
const H = { apikey: SVC, Authorization: `Bearer ${SVC}`, 'Content-Type': 'application/json' };
const alsoAccounts = process.argv.includes('--accounts');

async function rest(path: string, init?: RequestInit) {
  const r = await fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init?.headers || {}) } });
  const txt = await r.text(); let body: unknown; try { body = txt ? JSON.parse(txt) : null; } catch { body = txt; }
  if (!r.ok) throw new Error(`${r.status} ${path}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body as never;
}
const ids = (rows: { id: string }[]) => rows.map((r) => r.id);
const inList = (v: string[]) => `(${v.join(',')})`;

async function main() {
  console.log('Resetting demo data (demo-only, non-destructive)…\n');

  // Resolve the demo provider by its storefront slug (unique demo marker).
  const sf = (await rest('storefronts?slug=eq.golden-lotus-services&select=id,provider_id') as { id: string; provider_id: string }[]);
  if (sf.length) {
    const providerId = sf[0].provider_id;
    const orders = (await rest(`platform_orders?provider_id=eq.${providerId}&select=id`) as { id: string }[]);
    if (orders.length) {
      const oid = inList(ids(orders));
      await rest(`order_evidence?order_id=in.${oid}`, { method: 'DELETE' });
      await rest(`order_items?order_id=in.${oid}`, { method: 'DELETE' });
      await rest(`payments?order_id=in.${oid}`, { method: 'DELETE' });
      await rest(`platform_orders?id=in.${oid}`, { method: 'DELETE' });
      console.log(`  removed ${orders.length} demo orders (+ items/payments/evidence)`);
    }
    await rest(`skus?provider_id=eq.${providerId}`, { method: 'DELETE' });
    await rest(`platform_products?provider_id=eq.${providerId}`, { method: 'DELETE' });
    await rest(`storefronts?provider_id=eq.${providerId}`, { method: 'DELETE' });
    await rest(`provider_temples?provider_id=eq.${providerId}`, { method: 'DELETE' });
    await rest(`provider_members?provider_id=eq.${providerId}`, { method: 'DELETE' });
    await rest(`providers?id=eq.${providerId}`, { method: 'DELETE' });
    console.log('  removed demo provider, storefront, products, SKUs');
  }

  await rest(`platform_customers?email=eq.sales.customer@yuancheng.demo`, { method: 'DELETE' });
  await rest(`runners?email=eq.sales.runner@yuancheng.demo`, { method: 'DELETE' });
  await rest(`temples?name=eq.Golden%20Lotus%20Temple&notes=eq.Investor%20Demo%20Place`, { method: 'DELETE' });
  console.log('  removed demo customer, runner, place');

  if (alsoAccounts) {
    const r = await fetch(`${URL_}/auth/v1/admin/users?per_page=200`, { headers: H });
    const list = (await r.json()) as { users?: { id: string; email: string }[] };
    const demo = (list.users || []).filter((u) => u.email?.endsWith('@yuancheng.demo'));
    for (const u of demo) {
      await rest(`admins?user_id=eq.${u.id}`, { method: 'DELETE' });
      await fetch(`${URL_}/auth/v1/admin/users/${u.id}`, { method: 'DELETE', headers: H });
    }
    console.log(`  removed ${demo.length} demo auth accounts (--accounts)`);
  } else {
    console.log('  (auth accounts kept — pass --accounts to remove them too)');
  }
  console.log('\nDone. Re-run: npx tsx scripts/seed-demo.ts');
}

main().catch((e) => { console.error('RESET FAILED:', e.message); process.exit(1); });

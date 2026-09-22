/* Domain business-rule smoke test. Run: npx tsx scripts/domain-smoke.ts */
import { canPublishSku, DEFAULT_FREE_PLAN, countActiveSkus } from '../src/lib/domain/plan';
import { checkTransition, canBeFulfilled } from '../src/lib/domain/order';
import { computeAllocation } from '../src/lib/domain/payment';

let pass = 0, fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) { pass++; console.log('  ✓', name); }
  else { fail++; console.log('  ✗ FAIL:', name); }
}

console.log('PLAN / SKU LIMIT (free = 3, configurable)');
ok('publish allowed at 0/3', canPublishSku(DEFAULT_FREE_PLAN, 0).allowed);
ok('publish allowed at 2/3', canPublishSku(DEFAULT_FREE_PLAN, 2).allowed);
ok('publish BLOCKED at 3/3', !canPublishSku(DEFAULT_FREE_PLAN, 3).allowed);
ok('unlimited plan never blocks', canPublishSku({ name: 'Pro', sku_limit: null }, 999).allowed);
ok('only published SKUs counted',
  countActiveSkus([{ status: 'published' }, { status: 'draft' }, { status: 'archived' }, { status: 'published' }]) === 2);

console.log('ORDER LIFECYCLE (unpaid can never be fulfilled)');
ok('fulfiller CANNOT accept a pending_payment order',
  !checkTransition('pending_payment', 'accepted', 'fulfiller').ok);
ok('fulfiller CANNOT act on payment_failed', !canBeFulfilled('payment_failed'));
ok('paid order IS fulfillable', canBeFulfilled('paid'));
ok('admin can move paid → accepted', checkTransition('paid', 'accepted', 'admin').ok);
ok('illegal skip paid → completed blocked', !checkTransition('paid', 'completed', 'admin').ok);
ok('customer cannot self-complete', !checkTransition('under_review', 'completed', 'customer').ok);
ok('fulfiller can progress accepted → in_progress', checkTransition('accepted', 'in_progress', 'fulfiller').ok);

console.log('PAYMENT ALLOCATION (platform_fee default 0; invariant holds)');
const a = computeAllocation(388, 'MYR');
ok('gross preserved', a.gross_amount === 388);
ok('platform_fee defaults to 0 (no commission yet)', a.platform_fee === 0);
ok('invariant: provider = gross - payment_fee - platform_fee - refund',
  Math.abs(a.provider_amount - (a.gross_amount - a.payment_fee - a.platform_fee - a.refund_amount)) < 0.001);
const b = computeAllocation(388, 'MYR', 0, { platform: { percent: 0.1, fixed: 0 } });
ok('configurable 10% platform fee applies', Math.abs(b.platform_fee - 38.8) < 0.001);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

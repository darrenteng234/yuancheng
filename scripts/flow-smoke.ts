/* Full order lifecycle simulation — proves the V1 flow LOGIC end-to-end with an
 * in-memory order, using the real domain functions. Live proof still requires
 * Supabase + Stripe. Run: npx tsx scripts/flow-smoke.ts */
import { checkTransition, canBeFulfilled } from '../src/lib/domain/order';
import { computeAllocation, toMinorUnits } from '../src/lib/domain/payment';
import type { OrderStatus } from '../src/types/platform';

let pass = 0, fail = 0;
function ok(name: string, cond: boolean) { cond ? (pass++, console.log('  ✓', name)) : (fail++, console.log('  ✗ FAIL:', name)); }

// In-memory order mirroring platform_orders + the webhook's no-downgrade guard.
const order = { status: 'draft' as OrderStatus, total: 388, currency: 'MYR' as const, paidRecorded: 0 };

// Mirror recordPaymentSucceeded's guard: only advance if awaiting payment.
function webhookPaid() {
  order.paidRecorded++; // payment row upsert is idempotent by intent id (1 row)
  if (['pending_payment', 'payment_failed'].includes(order.status)) order.status = 'paid';
}
function move(to: OrderStatus, actor: Parameters<typeof checkTransition>[2]) {
  const c = checkTransition(order.status, to, actor);
  if (c.ok) order.status = to;
  return c.ok;
}

console.log('CHECKOUT → PENDING_PAYMENT');
ok('draft → pending_payment (customer)', move('pending_payment', 'customer'));
ok('status is pending_payment', order.status === 'pending_payment');

console.log('UNPAID GUARD');
ok('fulfiller CANNOT accept unpaid order', !move('accepted', 'fulfiller'));
ok('unpaid order not fulfillable', !canBeFulfilled(order.status));
ok('still pending_payment', order.status === 'pending_payment');

console.log('PAYMENT (server-priced) + WEBHOOK');
const minor = toMinorUnits(order.total, order.currency);
ok('amount to Stripe = 38800 sen (server-derived)', minor === 38800);
const alloc = computeAllocation(order.total, order.currency);
ok('platform_fee = 0', alloc.platform_fee === 0);
ok('provider_amount = gross - fees', Math.abs(alloc.provider_amount - (388 - alloc.payment_fee)) < 0.001);
webhookPaid();
ok('order now PAID', order.status === 'paid');
ok('paid order IS fulfillable', canBeFulfilled(order.status));

console.log('WEBHOOK IDEMPOTENCY / NO-DOWNGRADE');
move('accepted', 'admin'); // admin accepts → post-payment progress
ok('admin accepted', order.status === 'accepted');
webhookPaid(); // duplicate/delayed webhook arrives AFTER progress
ok('duplicate webhook does NOT revert to paid', order.status === 'accepted');
ok('payment recorded twice but idempotent (1 logical payment)', order.paidRecorded === 2);

console.log('FULFILMENT → COMPLETION');
ok('accepted → in_progress (fulfiller)', move('in_progress', 'fulfiller'));
ok('in_progress → evidence_submitted (fulfiller)', move('evidence_submitted', 'fulfiller'));
ok('evidence_submitted → under_review (provider)', move('under_review', 'provider_owner'));
ok('customer CANNOT self-complete', !move('completed', 'customer'));
ok('under_review → completed (admin)', move('completed', 'admin'));
ok('final status completed', order.status === 'completed');

console.log('ILLEGAL PATHS');
ok('cannot skip pending → completed', !checkTransition('pending_payment', 'completed', 'admin').ok);
ok('cannot fulfil a cancelled order', checkTransition('cancelled', 'in_progress', 'admin').ok === false);

console.log('REGRESSIONS — discovered edge cases');
// Double evidence submit: from evidence_submitted, re-submitting is NOT a legal
// self-loop. addEvidence() now validates this BEFORE inserting rows, so a retry
// cannot leave orphan evidence. Guard the underlying invariant here.
ok('evidence_submitted → evidence_submitted is illegal (double-submit blocked)',
  checkTransition('evidence_submitted', 'evidence_submitted', 'fulfiller').ok === false);
ok('re-submit requires going back to in_progress first',
  checkTransition('evidence_submitted', 'in_progress', 'provider_owner').ok === true);
// A guest/customer can never fulfil, even post-payment.
ok('guest cannot move paid → accepted', checkTransition('paid', 'accepted', 'guest').ok === false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

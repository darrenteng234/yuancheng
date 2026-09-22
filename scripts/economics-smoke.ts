/* Deterministic financial tests for the canonical economics engine.
 * Run: npx tsx scripts/economics-smoke.ts */
import { computeEconomics, isUnavailable } from '../src/lib/domain/economics';
import { computeAllocation } from '../src/lib/domain/payment';
import type { Payment, Order } from '../src/types/platform';

let pass = 0, fail = 0;
function ok(name: string, cond: boolean) { cond ? (pass++, console.log('  ✓', name)) : (fail++, console.log('  ✗ FAIL:', name)); }

function payment(over: Partial<Payment>): Payment {
  return {
    id: over.id ?? 'p', order_id: over.order_id ?? 'o', provider_id: 'prov', currency: 'MYR',
    gross_amount: 0, payment_fee: 0, platform_fee: 0, provider_amount: 0, refund_amount: 0,
    net_amount: 0, payout_amount: 0, status: 'succeeded', payout_status: 'pending',
    created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z', ...over,
  };
}
function order(over: Partial<Order>): Order {
  return {
    id: over.id ?? 'o', order_number: 'YC-1', provider_id: 'prov', storefront_id: 'sf',
    status: over.status ?? 'paid', currency: 'MYR', subtotal: 0, total: over.total ?? 0,
    created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z', ...over,
  };
}

console.log('ALLOCATION — fixed example (gross 100, fee 3, platform 0)');
// Force a clean gateway fee of exactly 3.00 (3% + 0 fixed) for a round assertion.
const a = computeAllocation(100, 'MYR', 0, { gateway: { percent: 0.03, fixed: 0 } });
ok('gross = 100.00', a.gross_amount === 100);
ok('payment_fee = 3.00', a.payment_fee === 3);
ok('platform_fee = 0.00', a.platform_fee === 0);
ok('refund = 0.00', a.refund_amount === 0);
ok('provider_amount = 97.00', a.provider_amount === 97);
ok('net_amount = 97.00', a.net_amount === 97);
ok('payout_amount = 0.00 (not yet paid)', a.payout_amount === 0);

console.log('ALLOCATION — refund + partial refund');
const r = computeAllocation(100, 'MYR', 100, { gateway: { percent: 0.03, fixed: 0 } });
ok('full refund → provider 0 - fee', r.provider_amount === -3 || r.provider_amount === 0 - 3);
const pr = computeAllocation(100, 'MYR', 40, { gateway: { percent: 0.03, fixed: 0 } });
ok('partial refund 40 → provider 57', pr.provider_amount === 57);

console.log('ALLOCATION — configurable platform fee 10%');
const pf = computeAllocation(100, 'MYR', 0, { gateway: { percent: 0.03, fixed: 0 }, platform: { percent: 0.1, fixed: 0 } });
ok('platform_fee = 10.00', pf.platform_fee === 10);
ok('provider_amount = 87.00', pf.provider_amount === 87);

console.log('ROUNDING');
const rd = computeAllocation(99.99, 'MYR', 0, { gateway: { percent: 0.03, fixed: 0 } });
ok('fee rounds to 2dp (3.00)', rd.payment_fee === 3);

console.log('ENGINE — money from payments, counts from orders');
const payments: Payment[] = [
  payment({ id: 'p1', order_id: 'o1', gross_amount: 100, payment_fee: 3, provider_amount: 97, net_amount: 97 }),
  payment({ id: 'p2', order_id: 'o2', gross_amount: 200, payment_fee: 6, provider_amount: 194, net_amount: 194, created_at: '2026-09-02T00:00:00Z' }),
  payment({ id: 'p3', order_id: 'o3', gross_amount: 999, status: 'failed' }), // must be ignored
];
const orders: Order[] = [
  order({ id: 'o1', status: 'completed', total: 100 }),
  order({ id: 'o2', status: 'paid', total: 200 }),
  order({ id: 'o3', status: 'pending_payment', total: 999 }),
  order({ id: 'o4', status: 'cancelled', total: 50 }),
  order({ id: 'o5', status: 'refunded', total: 70 }),
];
const rep = computeEconomics({ payments, orders });
ok('grossSales = 300 (failed payment excluded)', rep.grossSales === 300);
ok('paymentFees = 9', rep.paymentFees === 9);
ok('platformFees = 0 (REAL zero, not unimplemented)', rep.platformFees === 0);
ok('providerAmount = 291', rep.providerAmount === 291);
ok('paidOrders = 2 (paid+completed)', rep.paidOrders === 2);
ok('completedOrders = 1', rep.completedOrders === 1);
ok('cancelledOrders = 1', rep.cancelledOrders === 1);
ok('refundedOrders = 1', rep.refundedOrders === 1);
ok('averageOrderValue = 150', rep.averageOrderValue === 150);
ok('grossSalesByDate splits by day', rep.grossSalesByDate['2026-09-01'] === 100 && rep.grossSalesByDate['2026-09-02'] === 200);

console.log('UNAVAILABLE — never faked as 0');
ok('COGS unavailable when not configured', isUnavailable(rep.costOfGoods));
ok('fulfilmentCost unavailable when not configured', isUnavailable(rep.fulfillmentCost));
ok('grossMargin unavailable (needs costs)', isUnavailable(rep.grossMargin));
ok('netContribution unavailable (needs costs)', isUnavailable(rep.netContribution));
ok('subscriptionRevenue unavailable (price undecided)', isUnavailable(rep.subscriptionRevenue));

console.log('UNAVAILABLE — partial cost map still unavailable (no silent undercount)');
const rep2 = computeEconomics({ payments, orders, cogsByOrderId: { o1: 20 } }); // missing o2
ok('COGS unavailable when a paid order lacks a cost', isUnavailable(rep2.costOfGoods));

console.log('AVAILABLE — full cost inputs compute margin correctly');
const rep3 = computeEconomics({
  payments: [payment({ id: 'p1', order_id: 'o1', gross_amount: 100, payment_fee: 3, provider_amount: 97, net_amount: 97 })],
  orders: [order({ id: 'o1', status: 'completed', total: 100 })],
  cogsByOrderId: { o1: 20 }, fulfillmentCostByOrderId: { o1: 10 },
});
// contribution = 100 - 3(fee) - 0(platform) - 20(cogs) - 10(fulfil) - 0(refund) = 67
ok('netContribution = 67', rep3.netContribution === 67);
ok('grossMargin = 67%', rep3.grossMargin === 67);

console.log('EMPTY — zero orders is real zero, not error');
const rep0 = computeEconomics({ payments: [], orders: [] });
ok('grossSales = 0 (real)', rep0.grossSales === 0);
ok('averageOrderValue unavailable (no paid orders)', isUnavailable(rep0.averageOrderValue));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

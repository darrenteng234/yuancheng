/**
 * ============================================================================
 * Canonical platform economics engine — the ONE source of truth for money math.
 * ============================================================================
 * Money figures are derived from PAYMENT records (which already carry the full
 * allocation from lib/domain/payment.ts). Counts/averages come from ORDERS.
 *
 * CRITICAL RULE: `0` means an actual zero. A value we cannot compute yet because
 * a required input is missing is returned as { unavailable, reason, missingInput }
 * — never faked as 0. The admin UI must render "unavailable", not "RM0.00".
 *
 * Admin dashboards MUST consume this engine — no duplicated formulas in pages.
 * ============================================================================
 */
import type { Payment, Order } from '@/types/platform';

export type Unavailable = { unavailable: true; reason: string; missingInput: string };
export type Metric = number | Unavailable;

export function isUnavailable(m: Metric): m is Unavailable {
  return typeof m === 'object' && m !== null && 'unavailable' in m;
}

function round2(n: number): number { return Math.round((n + Number.EPSILON) * 100) / 100; }
const succeeded = (p: Payment) => p.status === 'succeeded';

export interface EconomicsInput {
  payments: Payment[];
  orders: Order[];
  /** Optional cost inputs — when absent, dependent metrics are `unavailable`. */
  cogsByOrderId?: Record<string, number>;         // cost of goods/services per order
  fulfillmentCostByOrderId?: Record<string, number>; // runner/provider fulfilment cost per order
  /** Subscription MRR, if plan pricing is decided. Absent ⇒ unavailable. */
  subscriptionMrr?: number | null;
}

export interface EconomicsReport {
  // Money (from succeeded payments) — all real numbers
  grossSales: number;        // Σ gross_amount
  paymentFees: number;       // Σ payment_fee (gateway)
  platformFees: number;      // Σ platform_fee (Yuancheng commission; 0 by config = real 0)
  refunds: number;           // Σ refund_amount
  providerAmount: number;    // Σ provider_amount (owed to providers)
  payoutAmount: number;      // Σ payout_amount (actually paid out)
  platformNetRevenue: number;// what the platform keeps = platformFees (real 0 today)

  // Cost-dependent — may be unavailable
  costOfGoods: Metric;
  fulfillmentCost: Metric;
  grossMargin: Metric;       // (grossSales - paymentFees - cogs - fulfilment) / grossSales * 100
  netContribution: Metric;   // grossSales - paymentFees - platformFees? see note; needs costs

  // Subscriptions
  subscriptionRevenue: Metric;

  // Counts (from orders)
  totalOrders: number;
  paidOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  disputedOrders: number;

  // Averages
  averageOrderValue: Metric; // grossSales / paidOrders (unavailable if no paid orders)

  // Totals by date (YYYY-MM-DD → gross sales)
  grossSalesByDate: Record<string, number>;
}

export function computeEconomics(input: EconomicsInput): EconomicsReport {
  const sp = input.payments.filter(succeeded);

  const sum = (f: (p: Payment) => number) => round2(sp.reduce((s, p) => s + (Number(f(p)) || 0), 0));
  const grossSales = sum((p) => p.gross_amount);
  const paymentFees = sum((p) => p.payment_fee);
  const platformFees = sum((p) => p.platform_fee);
  const refunds = sum((p) => p.refund_amount);
  const providerAmount = sum((p) => p.provider_amount);
  const payoutAmount = sum((p) => p.payout_amount);

  // Order counts
  const orders = input.orders;
  const count = (pred: (o: Order) => boolean) => orders.filter(pred).length;
  const paidStatuses = ['paid', 'accepted', 'in_progress', 'evidence_submitted', 'under_review', 'completed'];
  const paidOrders = count((o) => paidStatuses.includes(o.status));

  // COGS / fulfilment — only if the input maps are supplied AND cover paid orders.
  const cogs = costMetric(input.cogsByOrderId, orders, paidStatuses, 'cost of goods/services', 'cogsByOrderId');
  const fulfilment = costMetric(input.fulfillmentCostByOrderId, orders, paidStatuses, 'fulfilment cost', 'fulfillmentCostByOrderId');

  // Gross margin needs BOTH cost inputs to be truthful.
  let grossMargin: Metric;
  let netContribution: Metric;
  if (isUnavailable(cogs) || isUnavailable(fulfilment)) {
    const missing = [isUnavailable(cogs) ? 'COGS' : null, isUnavailable(fulfilment) ? 'fulfilment cost' : null].filter(Boolean).join(' + ');
    grossMargin = { unavailable: true, reason: `Requires ${missing}; not configured yet`, missingInput: missing };
    netContribution = { unavailable: true, reason: `Requires ${missing}; not configured yet`, missingInput: missing };
  } else {
    const contribution = round2(grossSales - paymentFees - platformFees - cogs - fulfilment - refunds);
    netContribution = contribution;
    grossMargin = grossSales > 0 ? round2((contribution / grossSales) * 100) : { unavailable: true, reason: 'No sales yet', missingInput: 'grossSales>0' };
  }

  const subscriptionRevenue: Metric = input.subscriptionMrr == null
    ? { unavailable: true, reason: 'Subscription pricing not decided', missingInput: 'plan.monthly_price' }
    : round2(input.subscriptionMrr);

  const averageOrderValue: Metric = paidOrders > 0 ? round2(grossSales / paidOrders)
    : { unavailable: true, reason: 'No paid orders', missingInput: 'paidOrders>0' };

  const grossSalesByDate: Record<string, number> = {};
  for (const p of sp) {
    const day = (p.created_at || '').slice(0, 10);
    if (!day) continue;
    grossSalesByDate[day] = round2((grossSalesByDate[day] ?? 0) + (Number(p.gross_amount) || 0));
  }

  return {
    grossSales, paymentFees, platformFees, refunds, providerAmount, payoutAmount,
    platformNetRevenue: platformFees,
    costOfGoods: cogs, fulfillmentCost: fulfilment, grossMargin, netContribution,
    subscriptionRevenue,
    totalOrders: orders.length,
    paidOrders,
    completedOrders: count((o) => o.status === 'completed'),
    cancelledOrders: count((o) => o.status === 'cancelled'),
    refundedOrders: count((o) => o.status === 'refunded'),
    disputedOrders: count((o) => o.status === 'disputed'),
    averageOrderValue,
    grossSalesByDate,
  };
}

// Returns total cost across paid orders, or Unavailable when the map is missing
// or does not cover every paid order (so we never silently undercount as 0).
function costMetric(
  map: Record<string, number> | undefined, orders: Order[], paidStatuses: string[],
  label: string, missingInput: string,
): Metric {
  if (!map) return { unavailable: true, reason: `${label} not configured`, missingInput };
  const paid = orders.filter((o) => paidStatuses.includes(o.status));
  const missing = paid.filter((o) => map[o.id] === undefined);
  if (missing.length > 0) {
    return { unavailable: true, reason: `${label} missing for ${missing.length} paid order(s)`, missingInput };
  }
  return round2(paid.reduce((s, o) => s + (map[o.id] || 0), 0));
}

/**
 * Believer Calculation Engine
 *
 * Core business logic for all financial calculations.
 * Every function is pure and testable.
 *
 * Business Model:
 * - Selling Price = what customer pays (set by admin)
 * - Runner Cost = actual receipt amounts (what runner spent)
 * - Platform Cost = product costs + gateway fees + refund reserve
 * - Profit = Selling Price - Platform Cost
 * - Runner Payment = actual receipt amounts (reimbursed)
 *
 * Key invariant: Profit = Selling Price - (product_costs + gateway + refund_reserve)
 * Runner payment is separate — runner gets reimbursed their actual costs.
 */

export const GATEWAY_RATE = 0.025; // 2.5%
export const REFUND_RESERVE_RATE = 0.03; // 3%

export interface ProductCost {
  id: string;
  name: string;
  costToRunner: number;
  quantity: number;
}

export interface PackageCalculation {
  productCost: number;
  transportCost: number;
  gatewayFee: number;
  refundReserve: number;
  totalCost: number;
  sellingPrice: number;
  profit: number;
  marginPercent: number;
}

export interface RunnerPaymentCalculation {
  runnerId: string;
  runnerName: string;
  totalOrders: number;
  totalReceipts: number;
  totalReimbursable: number;
  avgCostPerOrder: number;
  paymentDue: number;
}

export interface EconomicsSummary {
  totalRevenue: number;
  totalRunnerCosts: number;
  totalGatewayFees: number;
  totalRefundReserves: number;
  grossProfit: number;
  blendedMargin: number;
  runnerPaymentDue: number;
  breakEvenOrders: number;
}

/**
 * Calculate package costs and margins
 */
export function calculatePackage(
  sellingPrice: number,
  products: ProductCost[],
  transportCost: number = 0
): PackageCalculation {
  const productCost = products.reduce((sum, p) => sum + p.costToRunner * p.quantity, 0);
  const gatewayFee = sellingPrice * GATEWAY_RATE;
  const refundReserve = sellingPrice * REFUND_RESERVE_RATE;
  const totalCost = productCost + transportCost + gatewayFee + refundReserve;
  const profit = sellingPrice - totalCost;
  const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  return {
    productCost,
    transportCost,
    gatewayFee,
    refundReserve,
    totalCost,
    sellingPrice,
    profit,
    marginPercent,
  };
}

/**
 * Calculate runner payment summary
 */
export function calculateRunnerPayment(
  runnerId: string,
  runnerName: string,
  orders: { receiptProductCost: number; receiptTransportCost: number; receiptOtherCost: number }[]
): RunnerPaymentCalculation {
  const totalOrders = orders.length;
  const totalReceipts = orders.reduce(
    (sum, o) => sum + o.receiptProductCost + o.receiptTransportCost + (o.receiptOtherCost || 0),
    0
  );
  const totalReimbursable = totalReceipts;
  const avgCostPerOrder = totalOrders > 0 ? totalReceipts / totalOrders : 0;

  return {
    runnerId,
    runnerName,
    totalOrders,
    totalReceipts,
    totalReimbursable,
    avgCostPerOrder,
    paymentDue: totalReimbursable,
  };
}

/**
 * Calculate overall economics summary
 */
export function calculateEconomics(
  orders: {
    sellingPrice: number;
    receiptProductCost: number;
    receiptTransportCost: number;
    receiptOtherCost?: number;
    status: string;
  }[]
): EconomicsSummary {
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'in_review');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.sellingPrice, 0);
  const totalRunnerCosts = completedOrders.reduce(
    (sum, o) => sum + o.receiptProductCost + o.receiptTransportCost + (o.receiptOtherCost || 0),
    0
  );
  const totalGatewayFees = totalRevenue * GATEWAY_RATE;
  const totalRefundReserves = totalRevenue * REFUND_RESERVE_RATE;
  const grossProfit = totalRevenue - totalRunnerCosts - totalGatewayFees - totalRefundReserves;
  const blendedMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Runner payment due = sum of all verified receipts
  const runnerPaymentDue = totalRunnerCosts;

  // Break-even = fixed costs / avg profit per order
  // TODO: Replace 0 with actual fixed costs when available
  const avgProfitPerOrder = completedOrders.length > 0 ? grossProfit / completedOrders.length : 0;
  const FIXED_COSTS = 0; // Monthly fixed costs (hosting, salaries, etc.)
  const breakEvenOrders = avgProfitPerOrder > 0 ? Math.ceil(FIXED_COSTS / avgProfitPerOrder) : 0;

  return {
    totalRevenue,
    totalRunnerCosts,
    totalGatewayFees,
    totalRefundReserves,
    grossProfit,
    blendedMargin,
    runnerPaymentDue,
    breakEvenOrders,
  };
}

/**
 * Calculate profit by runner
 */
export function calculateProfitByRunner(
  runnerId: string,
  runnerName: string,
  orders: {
    sellingPrice: number;
    receiptProductCost: number;
    receiptTransportCost: number;
    receiptOtherCost?: number;
    status: string;
  }[]
): { orders: number; reimbursable: number; sellingPriceTotal: number; profit: number } {
  const runnerOrders = orders; // Already filtered by runner
  const reimbursable = runnerOrders.reduce(
    (sum, o) => sum + o.receiptProductCost + o.receiptTransportCost + (o.receiptOtherCost || 0),
    0
  );
  const sellingPriceTotal = runnerOrders.reduce((sum, o) => sum + o.sellingPrice, 0);
  const gatewayFees = sellingPriceTotal * GATEWAY_RATE;
  const refundReserves = sellingPriceTotal * REFUND_RESERVE_RATE;
  const profit = sellingPriceTotal - reimbursable - gatewayFees - refundReserves;

  return {
    orders: runnerOrders.length,
    reimbursable,
    sellingPriceTotal,
    profit,
  };
}

/**
 * Format currency
 */
export function formatRM(amount: number): string {
  return 'RM' + amount.toFixed(2);
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

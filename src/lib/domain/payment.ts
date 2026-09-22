/**
 * Payment money-math. Computes the full breakdown for one customer payment.
 * The platform fee is CONFIGURABLE and defaults to zero — no commission is
 * active yet. Enabling one later = pass a non-zero FeeConfig, no rewrite.
 *
 * Invariant:
 *   provider_amount = gross - payment_fee - platform_fee - refunded
 *   net_amount      = provider_amount   (alias kept explicit for reporting)
 */
import type { Currency, Payment } from '@/types/platform';

/** Gateway (Stripe) fee model — Malaysia domestic card defaults; override per gateway. */
export interface GatewayFeeConfig {
  percent: number; // e.g. 0.03 = 3%
  fixed: number;   // flat fee in major units (e.g. RM1.00)
}

/** Platform (Yuancheng) commission model. Defaults to ZERO — not activated. */
export interface PlatformFeeConfig {
  percent: number; // 0 = no commission (V1 default)
  fixed: number;
}

export const DEFAULT_GATEWAY_FEE: GatewayFeeConfig = { percent: 0.03, fixed: 1.0 };
export const DEFAULT_PLATFORM_FEE: PlatformFeeConfig = { percent: 0, fixed: 0 }; // ← no commission yet

export interface FeeConfig {
  gateway?: GatewayFeeConfig;
  platform?: PlatformFeeConfig;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface Allocation {
  gross_amount: number;
  payment_fee: number;
  platform_fee: number;
  provider_amount: number;
  refund_amount: number;
  net_amount: number;
  payout_amount: number;
  currency: Currency;
}

/**
 * Compute the allocation for a gross amount.
 * @param gross    amount the customer paid, in major units (e.g. 388.00)
 * @param currency ISO-ish currency code
 * @param refunded amount already refunded (default 0)
 * @param cfg      fee configuration; omitted parts fall back to defaults
 */
export function computeAllocation(
  gross: number,
  currency: Currency,
  refunded = 0,
  cfg: FeeConfig = {}
): Allocation {
  const gw = cfg.gateway ?? DEFAULT_GATEWAY_FEE;
  const pf = cfg.platform ?? DEFAULT_PLATFORM_FEE;

  const payment_fee = round2(gross * gw.percent + gw.fixed);
  const platform_fee = round2(gross * pf.percent + pf.fixed);
  const refund_amount = round2(refunded);
  const provider_amount = round2(gross - payment_fee - platform_fee - refund_amount);

  return {
    gross_amount: round2(gross),
    payment_fee,
    platform_fee,
    provider_amount,
    refund_amount,
    net_amount: provider_amount,
    payout_amount: 0,
    currency,
  };
}

/** Build a Payment record's money fields from a gross amount. */
export function paymentFieldsFromGross(
  gross: number,
  currency: Currency,
  cfg?: FeeConfig
): Pick<Payment,
  'gross_amount' | 'payment_fee' | 'platform_fee' | 'provider_amount' | 'refund_amount' | 'net_amount' | 'payout_amount' | 'currency'> {
  const a = computeAllocation(gross, currency, 0, cfg);
  return {
    gross_amount: a.gross_amount,
    payment_fee: a.payment_fee,
    platform_fee: a.platform_fee,
    provider_amount: a.provider_amount,
    refund_amount: a.refund_amount,
    net_amount: a.net_amount,
    payout_amount: a.payout_amount,
    currency: a.currency,
  };
}

/** Smallest-currency-unit conversion for Stripe (sen/cents). Zero-decimal currencies excluded. */
const ZERO_DECIMAL: Currency[] = ['VND'];
export function toMinorUnits(amount: number, currency: Currency): number {
  return ZERO_DECIMAL.includes(currency) ? Math.round(amount) : Math.round(amount * 100);
}

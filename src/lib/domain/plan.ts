/**
 * Plan limits & feature gating. Limits are DATA on the Plan — never hard-coded.
 * The free-plan hypothesis (3 published SKUs) lives only in DEFAULT_FREE_PLAN
 * below and can change to 5 / 10 / unlimited by editing the plan row.
 */
import type { Plan, PlanFeature, Sku, SkuStatus } from '@/types/platform';

/** Seed defaults — real plans live in the DB `plans` table. */
export const DEFAULT_FREE_PLAN: Omit<Plan, 'id' | 'created_at' | 'updated_at'> = {
  name: 'Free',
  tier: 'free',
  sku_limit: 3,            // ← the only place "3" is defined
  storefront_limit: 1,     // ← the only place "1" is defined
  staff_limit: 0,
  order_limit: null,
  storage_limit_mb: 100,
  analytics_level: 'none',
  automation_level: 'none',
  features: [],
  monthly_price: 0,
  currency: 'MYR',
};

export const DEFAULT_PAID_PLAN: Omit<Plan, 'id' | 'created_at' | 'updated_at'> = {
  name: 'Pro',
  tier: 'paid',
  sku_limit: null,         // unlimited
  storefront_limit: 3,
  staff_limit: 5,
  order_limit: null,
  storage_limit_mb: 5000,
  analytics_level: 'basic',
  automation_level: 'none',
  features: ['multiple_storefronts', 'staff_accounts', 'analytics', 'custom_branding'],
  monthly_price: null,     // pricing intentionally undecided
  currency: 'MYR',
};

/** Only these SKU states count toward a plan's published-SKU limit. */
export const COUNTS_TOWARD_LIMIT: SkuStatus[] = ['published'];

export function isCountedSku(status: SkuStatus): boolean {
  return COUNTS_TOWARD_LIMIT.includes(status);
}

export function countActiveSkus(skus: Pick<Sku, 'status'>[]): number {
  return skus.filter((s) => isCountedSku(s.status)).length;
}

export interface LimitCheck {
  allowed: boolean;
  limit: number | null;   // null = unlimited
  used: number;
  remaining: number | null;
  reason?: string;
}

/**
 * Can this provider publish one more SKU under `plan`?
 * `currentPublishedCount` is the number of already-published SKUs.
 */
export function canPublishSku(plan: Pick<Plan, 'sku_limit' | 'name'>, currentPublishedCount: number): LimitCheck {
  const limit = plan.sku_limit;
  if (limit === null) {
    return { allowed: true, limit: null, used: currentPublishedCount, remaining: null };
  }
  const remaining = Math.max(0, limit - currentPublishedCount);
  const allowed = currentPublishedCount < limit;
  return {
    allowed,
    limit,
    used: currentPublishedCount,
    remaining,
    reason: allowed ? undefined : `Plan "${plan.name}" allows ${limit} active SKUs. Upgrade to publish more.`,
  };
}

/** Generic numeric limit check (storefronts, staff, …). null limit = unlimited. */
export function checkLimit(limit: number | null, used: number, label: string): LimitCheck {
  if (limit === null) return { allowed: true, limit: null, used, remaining: null };
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;
  return { allowed, limit, used, remaining, reason: allowed ? undefined : `${label} limit reached (${limit}).` };
}

export function hasFeature(plan: Pick<Plan, 'features'>, feature: PlanFeature): boolean {
  return plan.features.includes(feature);
}

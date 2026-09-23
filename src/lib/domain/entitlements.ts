/**
 * Capability-based entitlements. NEVER `if (plan === 'pro')` anywhere. Resolve a
 * capability map from the plan's entitlements + the provider's own grants
 * (overrides), then ask capability questions. Expired provider grants are
 * ignored. Expiry NEVER auto-unpublishes existing items — it only blocks NEW
 * ones and flags the provider over-limit.
 */
import type { PlanEntitlement, ProviderEntitlement, EntitlementKey } from '@/types/platform';

export interface Capability { limit_int: number | null; enabled: boolean; value_text: string | null; }
export type CapabilityMap = Partial<Record<EntitlementKey, Capability>>;

export function resolveEntitlements(
  plan: PlanEntitlement[],
  provider: ProviderEntitlement[],
  now: Date = new Date()
): CapabilityMap {
  const map: CapabilityMap = {};
  for (const e of plan) {
    map[e.key] = { limit_int: e.limit_int ?? null, enabled: e.enabled, value_text: e.value_text ?? null };
  }
  for (const e of provider) {
    if (e.expires_at && new Date(e.expires_at) < now) continue; // expired grant ignored
    map[e.key] = { limit_int: e.limit_int ?? null, enabled: e.enabled, value_text: e.value_text ?? null };
  }
  return map;
}

/** null limit = unlimited. */
export function getLimit(map: CapabilityMap, key: EntitlementKey): number | null {
  const c = map[key];
  return c ? c.limit_int ?? null : 0;
}
export function isEnabled(map: CapabilityMap, key: EntitlementKey): boolean {
  return map[key]?.enabled ?? false;
}

export interface LimitCheck { allowed: boolean; limit: number | null; used: number; remaining: number | null; overLimit: boolean; }

/** Can one more item be created under `key`? Also reports over-limit (e.g. after a promo expires). */
export function checkCapacity(map: CapabilityMap, key: EntitlementKey, currentActive: number): LimitCheck {
  const limit = getLimit(map, key);
  if (limit === null) return { allowed: true, limit: null, used: currentActive, remaining: null, overLimit: false };
  return {
    allowed: currentActive < limit,
    limit,
    used: currentActive,
    remaining: Math.max(0, limit - currentActive),
    overLimit: currentActive > limit,
  };
}

export const canCreateService = (m: CapabilityMap, activeServices: number) => checkCapacity(m, 'service_limit', activeServices).allowed;
export const canCreateProduct = (m: CapabilityMap, activeProducts: number) => checkCapacity(m, 'product_limit', activeProducts).allowed;
export const canAddStaff = (m: CapabilityMap, currentStaff: number) => checkCapacity(m, 'staff_limit', currentStaff).allowed;
export const canUseRunner = (m: CapabilityMap) => isEnabled(m, 'runner_enabled');
export const canUseEvidence = (m: CapabilityMap) => isEnabled(m, 'evidence_enabled');

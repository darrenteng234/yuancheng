/**
 * Canonical authorization roles + safe mapping. We DO NOT rename existing role
 * records; instead `admin` and `fulfiller` are treated as deprecated aliases of
 * the canonical `superadmin` and `provider_runner`. Everything normalizes here.
 *
 *   superadmin      — Yuancheng company administrator (distinct from provider_owner)
 *   provider_owner  — owner of a provider business
 *   provider_staff  — provider team member
 *   provider_runner — provider fulfilment worker (formerly `fulfiller`)
 *   customer        — buyer
 *   guest           — unauthenticated buyer (per-order token)
 */
import type { Role } from '@/types/platform';

export type CanonicalRole =
  | 'superadmin' | 'provider_owner' | 'provider_staff' | 'provider_runner' | 'customer' | 'guest';

const ALIAS: Record<string, CanonicalRole> = {
  admin: 'superadmin',
  superadmin: 'superadmin',
  fulfiller: 'provider_runner',
  provider_runner: 'provider_runner',
  provider_owner: 'provider_owner',
  provider_staff: 'provider_staff',
  customer: 'customer',
  guest: 'guest',
};

export function normalizeRole(role: Role | string): CanonicalRole {
  return ALIAS[role] ?? 'guest';
}

/** True when two role names mean the same thing after alias normalization. */
export function roleEquals(a: Role | string, b: Role | string): boolean {
  return normalizeRole(a) === normalizeRole(b);
}

export const isSuperadmin = (r: Role | string) => normalizeRole(r) === 'superadmin';
export const isProviderRole = (r: Role | string) =>
  ['provider_owner', 'provider_staff', 'provider_runner'].includes(normalizeRole(r));
export const isProviderManager = (r: Role | string) =>
  ['provider_owner', 'provider_staff'].includes(normalizeRole(r));
export const isProviderOwner = (r: Role | string) => normalizeRole(r) === 'provider_owner';
export const isCustomerRole = (r: Role | string) => normalizeRole(r) === 'customer';

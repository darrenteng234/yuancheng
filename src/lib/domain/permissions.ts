/**
 * Central authorization predicates. All access is scoped server-side:
 *   customer  → only their own orders
 *   provider  → only their provider's data
 *   fulfiller → only orders assigned to them
 *   admin     → everything
 * Guest order access is via a per-order access_token, never a broad list.
 *
 * These are PURE predicates. API routes resolve the actor (see lib/auth) and
 * call these; the DB query must ALSO be scoped (defense in depth) — never rely
 * on filtering after fetching everything.
 */
import type { Role } from '@/types/platform';

export interface Actor {
  role: Role;
  userId?: string;
  providerId?: string;   // for provider_owner / provider_staff
  fulfillerId?: string;  // for fulfiller
  customerId?: string;   // for customer
}

interface OrderScope {
  provider_id: string;
  customer_id?: string;
  fulfiller_id?: string;
  access_token?: string;
}

export function isAdmin(a: Actor): boolean {
  return a.role === 'admin';
}

/** Can this actor read a specific order? */
export function canViewOrder(a: Actor, order: OrderScope, providedToken?: string): boolean {
  if (a.role === 'admin') return true;
  if ((a.role === 'provider_owner' || a.role === 'provider_staff') && a.providerId === order.provider_id) return true;
  if (a.role === 'fulfiller' && a.fulfillerId && order.fulfiller_id === a.fulfillerId) return true;
  if (a.role === 'customer' && a.customerId && order.customer_id === a.customerId) return true;
  // Guest: only with the correct per-order token.
  if (order.access_token && providedToken && order.access_token === providedToken) return true;
  return false;
}

/** Can this actor mutate/act on an order (assign, progress, review)? */
export function canActOnOrder(a: Actor, order: OrderScope): boolean {
  if (a.role === 'admin') return true;
  if ((a.role === 'provider_owner' || a.role === 'provider_staff') && a.providerId === order.provider_id) return true;
  if (a.role === 'fulfiller' && a.fulfillerId && order.fulfiller_id === a.fulfillerId) return true;
  return false;
}

/** Can this actor manage a provider's resources (products, SKUs, storefronts)? */
export function canManageProvider(a: Actor, providerId: string): boolean {
  if (a.role === 'admin') return true;
  return (a.role === 'provider_owner' || a.role === 'provider_staff') && a.providerId === providerId;
}

/** Owner-only actions (billing, staff, delete). */
export function canAdministerProvider(a: Actor, providerId: string): boolean {
  if (a.role === 'admin') return true;
  return a.role === 'provider_owner' && a.providerId === providerId;
}

/**
 * Returns the DB filter an order-list query MUST apply for this actor, or
 * `null` for admin (no scoping). Callers pass this into the query — this is how
 * we replace "download all + filter in the browser".
 */
export function orderListScope(a: Actor): { column: string; value: string } | null {
  switch (a.role) {
    case 'admin': return null;
    case 'provider_owner':
    case 'provider_staff': return { column: 'provider_id', value: a.providerId ?? '__none__' };
    case 'fulfiller': return { column: 'fulfiller_id', value: a.fulfillerId ?? '__none__' };
    case 'customer': return { column: 'customer_id', value: a.customerId ?? '__none__' };
    default: return { column: 'id', value: '__none__' }; // guest: no list access
  }
}

/**
 * Order lifecycle state machine. Single source of truth for which transitions
 * are legal and who may perform them. Enforced server-side in order API routes.
 *
 * Hard rule: an order that has not reached PAID can NEVER be fulfilled. Runners
 * and providers can only act from ACCEPTED onward (post-payment).
 */
import type { OrderStatus, Role } from '@/types/platform';

/** Statuses at/after which fulfillment work may happen. */
export const FULFILLMENT_STATUSES: OrderStatus[] = [
  'accepted', 'in_progress', 'evidence_submitted', 'under_review',
];

/** Pre-payment statuses — no fulfiller may touch these. */
export const PRE_PAYMENT_STATUSES: OrderStatus[] = ['draft', 'pending_payment', 'payment_failed'];

export const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled', 'refunded'];

/** Legal transitions: from → allowed next states. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending_payment', 'cancelled'],
  pending_payment: ['paid', 'payment_failed', 'cancelled'],
  payment_failed: ['pending_payment', 'cancelled'],
  paid: ['accepted', 'cancelled', 'refunded'],
  accepted: ['in_progress', 'cancelled', 'refunded'],
  in_progress: ['evidence_submitted', 'disputed', 'cancelled'],
  evidence_submitted: ['under_review', 'in_progress'],
  under_review: ['completed', 'in_progress', 'disputed'],
  completed: ['disputed', 'refunded'],
  disputed: ['refunded', 'completed'],
  cancelled: [],
  refunded: [],
};

/** Who is allowed to move an order INTO a given status. */
const TRANSITION_ACTORS: Record<OrderStatus, Role[]> = {
  draft: ['customer', 'guest'],
  pending_payment: ['customer', 'guest'],
  paid: [],                    // system-only (Stripe webhook)
  payment_failed: [],          // system-only
  accepted: ['admin', 'provider_owner', 'provider_staff', 'fulfiller'],
  in_progress: ['admin', 'provider_owner', 'provider_staff', 'fulfiller'],
  evidence_submitted: ['admin', 'provider_owner', 'provider_staff', 'fulfiller'],
  under_review: ['admin', 'provider_owner', 'provider_staff'],
  completed: ['admin', 'provider_owner'],
  cancelled: ['admin', 'customer', 'guest'],
  refunded: ['admin'],
  disputed: ['admin', 'customer', 'guest'],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function isFulfillmentStatus(status: OrderStatus): boolean {
  return FULFILLMENT_STATUSES.includes(status);
}

/** A fulfiller/provider may act on an order only once it is past payment. */
export function canBeFulfilled(status: OrderStatus): boolean {
  return FULFILLMENT_STATUSES.includes(status) || status === 'paid';
}

export interface TransitionCheck {
  ok: boolean;
  reason?: string;
}

/**
 * Full guard: is this actor allowed to move this order from → to?
 * Returns a reason on failure for a clean 4xx message.
 */
export function checkTransition(from: OrderStatus, to: OrderStatus, actor: Role): TransitionCheck {
  if (!canTransition(from, to)) {
    return { ok: false, reason: `Illegal transition: ${from} → ${to}` };
  }
  const actors = TRANSITION_ACTORS[to] ?? [];
  if (!actors.includes(actor)) {
    return { ok: false, reason: `Role "${actor}" cannot move an order to "${to}"` };
  }
  // Belt-and-braces: fulfillment actors may never touch a pre-payment order.
  if ((actor === 'fulfiller' || actor === 'provider_staff') && PRE_PAYMENT_STATUSES.includes(from)) {
    return { ok: false, reason: 'Unpaid orders cannot be fulfilled' };
  }
  return { ok: true };
}

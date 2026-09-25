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
export const PRE_PAYMENT_STATUSES: OrderStatus[] = ['draft', 'pending_payment', 'payment_failed', 'payment_proof_submitted'];

export const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled', 'refunded'];

/** Legal transitions: from → allowed next states. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending_payment', 'cancelled'],
  // Manual (Stage 1): customer uploads proof → provider verifies → paid.
  pending_payment: ['payment_proof_submitted', 'paid', 'payment_failed', 'cancelled'],
  payment_proof_submitted: ['paid', 'pending_payment', 'payment_failed', 'cancelled'],
  payment_failed: ['pending_payment', 'payment_proof_submitted', 'cancelled'],
  paid: ['accepted', 'cancelled', 'refund_requested', 'refunded'],
  accepted: ['in_progress', 'cancelled', 'refund_requested', 'refunded'],
  in_progress: ['evidence_submitted', 'disputed', 'cancelled', 'refund_requested'],
  evidence_submitted: ['under_review', 'in_progress', 'completed'],
  under_review: ['completed', 'in_progress', 'disputed'],
  completed: ['disputed', 'refund_requested', 'refunded'],
  disputed: ['refunded', 'refund_requested', 'completed'],
  refund_requested: ['refund_confirmed', 'cancelled', 'disputed'],
  refund_confirmed: [],
  cancelled: [],
  refunded: [],
};

/** Who is allowed to move an order INTO a given status. */
// Canonical roles + deprecated aliases both listed so old and new callers work
// (superadmin≡admin, provider_runner≡fulfiller). See lib/domain/roles.
const TRANSITION_ACTORS: Record<OrderStatus, Role[]> = {
  draft: ['customer', 'guest'],
  pending_payment: ['customer', 'guest'],
  // Customer uploads proof of a direct payment.
  payment_proof_submitted: ['customer', 'guest'],
  // Stage 1: PROVIDER verifies the proof → paid. (Legacy Stripe webhook also sets paid, bypassing this map.)
  paid: ['superadmin', 'admin', 'provider_owner', 'provider_staff'],
  payment_failed: ['superadmin', 'admin', 'provider_owner', 'provider_staff'],
  accepted: ['superadmin', 'admin', 'provider_owner', 'provider_staff', 'provider_runner', 'fulfiller'],
  in_progress: ['superadmin', 'admin', 'provider_owner', 'provider_staff', 'provider_runner', 'fulfiller'],
  evidence_submitted: ['superadmin', 'admin', 'provider_owner', 'provider_staff', 'provider_runner', 'fulfiller'],
  under_review: ['superadmin', 'admin', 'provider_owner', 'provider_staff'],
  completed: ['superadmin', 'admin', 'provider_owner'],
  cancelled: ['superadmin', 'admin', 'customer', 'guest'],
  refunded: ['superadmin', 'admin'],
  // Provider-direct model (§20): a provider who cannot fulfil starts the refund.
  refund_requested: ['superadmin', 'admin', 'provider_owner', 'provider_staff', 'customer', 'guest'],
  refund_confirmed: ['superadmin', 'admin', 'provider_owner'],
  disputed: ['superadmin', 'admin', 'customer', 'guest'],
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
  if ((actor === 'fulfiller' || actor === 'provider_runner' || actor === 'provider_staff') && PRE_PAYMENT_STATUSES.includes(from)) {
    return { ok: false, reason: 'Unpaid orders cannot be fulfilled' };
  }
  return { ok: true };
}

/**
 * The ONE main next action (plus at most one danger action) for a status+role.
 * Replaces the banned "button per legal transition" pattern: callers render the
 * first as the primary button and any danger action as a secondary. Every entry
 * is filtered through checkTransition, so a button is never shown for an illegal
 * or unauthorized move.
 */
export type ActionKind = 'primary' | 'danger';
export interface OrderAction { to: OrderStatus; label: string; kind: ActionKind; }

const NEXT: Partial<Record<OrderStatus, OrderAction[]>> = {
  pending_payment:         [{ to: 'payment_proof_submitted', label: 'Upload payment proof', kind: 'primary' }],
  payment_proof_submitted: [{ to: 'paid', label: 'Verify payment', kind: 'primary' }, { to: 'payment_failed', label: 'Reject receipt', kind: 'danger' }],
  paid:                    [{ to: 'accepted', label: 'Accept order', kind: 'primary' }, { to: 'refund_requested', label: "Can't fulfil this order", kind: 'danger' }],
  accepted:                [{ to: 'in_progress', label: 'Start fulfilment', kind: 'primary' }, { to: 'refund_requested', label: "Can't fulfil this order", kind: 'danger' }],
  in_progress:             [{ to: 'evidence_submitted', label: 'Submit evidence', kind: 'primary' }, { to: 'refund_requested', label: "Can't fulfil this order", kind: 'danger' }],
  evidence_submitted:      [{ to: 'completed', label: 'Complete order', kind: 'primary' }],
  under_review:            [{ to: 'completed', label: 'Complete order', kind: 'primary' }],
  refund_requested:        [{ to: 'refund_confirmed', label: 'Mark refund as sent', kind: 'primary' }],
};

/** Legal, authorized next actions for this actor — primary first, danger last. */
export function orderActions(status: OrderStatus, role: Role): OrderAction[] {
  return (NEXT[status] ?? []).filter((a) => checkTransition(status, a.to, role).ok);
}
export function primaryAction(status: OrderStatus, role: Role): OrderAction | null {
  return orderActions(status, role).find((a) => a.kind === 'primary') ?? null;
}

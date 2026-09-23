/**
 * Append-only order audit events. Every meaningful order action writes one row
 * to `order_events` (never overwrites). Gives customer/provider/admin history
 * and investor-demo visibility independent of mutable status fields.
 */
import type { OrderStatus, Role } from '@/types/platform';

export const ORDER_EVENT_TYPES = [
  'ORDER_CREATED',
  'PAYMENT_INSTRUCTIONS_SHOWN',
  'PAYMENT_PROOF_SUBMITTED',
  'PAYMENT_PROOF_REJECTED',
  'PAYMENT_VERIFIED',
  'ORDER_ACCEPTED',
  'FULFILLMENT_STARTED',
  'EVIDENCE_SUBMITTED',
  'ORDER_COMPLETED',
  'ORDER_CANCELLED',
  'REFUND_REQUESTED',
  'REFUND_CONFIRMED',
  'ORDER_DISPUTED',
] as const;
export type OrderEventType = (typeof ORDER_EVENT_TYPES)[number];

export interface OrderEventInput {
  order_id: string;
  actor_user_id?: string | null;
  actor_role?: Role | null;
  event_type: OrderEventType;
  from_status?: OrderStatus | null;
  to_status?: OrderStatus | null;
  metadata?: Record<string, unknown>;
}

/** Build a ready-to-insert order_events row. */
export function orderEvent(input: OrderEventInput): OrderEventInput & { created_at: string } {
  return {
    ...input,
    actor_user_id: input.actor_user_id ?? null,
    actor_role: input.actor_role ?? null,
    from_status: input.from_status ?? null,
    to_status: input.to_status ?? null,
    metadata: input.metadata ?? {},
    created_at: new Date().toISOString(),
  };
}

/** Map a status transition to its canonical event type (best-effort). */
export function eventForTransition(to: OrderStatus): OrderEventType | null {
  switch (to) {
    case 'payment_proof_submitted': return 'PAYMENT_PROOF_SUBMITTED';
    case 'paid': return 'PAYMENT_VERIFIED';
    case 'accepted': return 'ORDER_ACCEPTED';
    case 'in_progress': return 'FULFILLMENT_STARTED';
    case 'evidence_submitted': return 'EVIDENCE_SUBMITTED';
    case 'completed': return 'ORDER_COMPLETED';
    case 'cancelled': return 'ORDER_CANCELLED';
    case 'refund_requested': return 'REFUND_REQUESTED';
    case 'refund_confirmed': return 'REFUND_CONFIRMED';
    case 'disputed': return 'ORDER_DISPUTED';
    default: return null;
  }
}

/**
 * Stage 1 MANUAL payment flow (provider-direct). Yuancheng does not process,
 * hold, or refund money. Flow:
 *   pending_payment → (customer uploads proof) → payment_proof_submitted
 *                   → (provider verifies) accepted → PAID
 *                   → (provider rejects)   rejected → payment_failed
 *                     (customer then re-uploads a new proof)
 *
 * Rule: uploading a proof NEVER marks an order paid. Only provider verification
 * of an accepted proof advances the order to paid.
 */
import type { OrderStatus, PaymentProofStatus } from '@/types/platform';

/** A customer may submit/replace a proof only before the order is paid. */
export function canSubmitProof(orderStatus: OrderStatus): boolean {
  return orderStatus === 'pending_payment'
    || orderStatus === 'payment_failed'
    || orderStatus === 'payment_proof_submitted';
}

/** Where a proof decision moves the ORDER. accepted → paid; rejected → payment_failed
 *  (a provider can legally set payment_failed; the customer then re-uploads). */
export function orderStatusAfterProofDecision(decision: Extract<PaymentProofStatus, 'accepted' | 'rejected'>): OrderStatus {
  return decision === 'accepted' ? 'paid' : 'payment_failed';
}

/** Only a provider manager/superadmin verifies; customers never self-verify. */
export function isVerifiableBy(role: string): boolean {
  return ['superadmin', 'admin', 'provider_owner', 'provider_staff'].includes(role);
}

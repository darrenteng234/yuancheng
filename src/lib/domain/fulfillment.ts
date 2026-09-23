/**
 * Fulfillment task rules. One order = one task in V1. A task can be handled by
 * the provider directly, provider staff, a provider runner, or an external
 * fulfiller (named). The provider is always accountable.
 */
import type { FulfillmentAssignmentType, FulfillmentTaskStatus } from '@/types/platform';

const TASK_TRANSITIONS: Record<FulfillmentTaskStatus, FulfillmentTaskStatus[]> = {
  pending: ['started', 'cancelled'],
  started: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function canTaskTransition(from: FulfillmentTaskStatus, to: FulfillmentTaskStatus): boolean {
  return TASK_TRANSITIONS[from]?.includes(to) ?? false;
}

/** An assignment needs an assignee only for staff/runner; external needs a name. */
export function validateAssignment(
  type: FulfillmentAssignmentType,
  opts: { assigned_user_id?: string; external_fulfiller_name?: string }
): { ok: boolean; reason?: string } {
  if ((type === 'staff' || type === 'runner') && !opts.assigned_user_id) {
    return { ok: false, reason: `${type} assignment requires assigned_user_id` };
  }
  if (type === 'external' && !opts.external_fulfiller_name) {
    return { ok: false, reason: 'external assignment requires external_fulfiller_name' };
  }
  return { ok: true };
}

import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { getOrderScoped, transitionOrder, assignFulfiller, listEvidence } from '@/lib/repos/orders';
import { canActOnOrder } from '@/lib/domain/permissions';
import { errorResponse, ok } from '@/lib/api-helpers';
import { NotFoundError, ForbiddenError } from '@/lib/repos/db';
import type { OrderStatus } from '@/types/platform';

export const dynamic = 'force-dynamic';

// GET — scoped read. Guests must pass ?token=<access_token>.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await getActor();
    const token = req.nextUrl.searchParams.get('token') ?? undefined;
    const order = await getOrderScoped(id, actor, token);
    if (!order) return errorResponse(new NotFoundError('Order'));
    const evidence = await listEvidence(id);
    return ok({ ...order, evidence });
  } catch (err) { return errorResponse(err); }
}

// PATCH — guarded status transition (state machine + role). Payment transitions
// (→paid) are system-only via the webhook, not this endpoint.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await getActor();
    const body = await req.json();
    // Ownership: reuse scoped read to authorize before mutating.
    const existing = await getOrderScoped(id, actor);
    if (!existing) return errorResponse(new NotFoundError('Order'));

    // Fulfiller assignment (admin/provider): a separate action from status.
    if (body.fulfiller_id !== undefined) {
      if (!canActOnOrder(actor, existing)) return errorResponse(new ForbiddenError());
      return ok(await assignFulfiller(id, body.fulfiller_id));
    }

    if (!body.status) return errorResponse(new Error('status or fulfiller_id is required'));
    const extra: Record<string, unknown> = {};
    if (body.review_notes !== undefined) extra.review_notes = body.review_notes;
    const order = await transitionOrder(id, body.status as OrderStatus, actor.role, extra);
    return ok(order);
  } catch (err) { return errorResponse(err); }
}

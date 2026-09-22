import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { getOrderScoped, addEvidence } from '@/lib/repos/orders';
import { canActOnOrder } from '@/lib/domain/permissions';
import { errorResponse, ok } from '@/lib/api-helpers';
import { NotFoundError, ForbiddenError } from '@/lib/repos/db';

export const dynamic = 'force-dynamic';

// POST — fulfiller/provider submits evidence → order moves to evidence_submitted.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await getActor();
    const order = await getOrderScoped(id, actor);
    if (!order) return errorResponse(new NotFoundError('Order'));
    if (!canActOnOrder(actor, order)) return errorResponse(new ForbiddenError());
    const body = await req.json();
    const updated = await addEvidence(id, actor.role, body.items ?? [], actor.userId);
    return ok(updated);
  } catch (err) { return errorResponse(err); }
}

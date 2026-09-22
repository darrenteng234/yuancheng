import { NextRequest } from 'next/server';
import { requireProvider, FORBIDDEN } from '@/lib/auth';
import { setSkuStatus } from '@/lib/repos/catalog';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// PATCH — publish/unpublish/archive. Publish enforces plan limit + provider approval.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await requireProvider();
    if (!actor?.providerId) return FORBIDDEN();
    const body = await req.json();
    if (!body.status) return errorResponse(new Error('status is required'));
    return ok(await setSkuStatus(actor.providerId, id, body.status));
  } catch (err) { return errorResponse(err); }
}

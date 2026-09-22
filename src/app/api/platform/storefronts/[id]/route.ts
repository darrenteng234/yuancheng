import { NextRequest } from 'next/server';
import { requireProvider, FORBIDDEN } from '@/lib/auth';
import { updateStorefront, setStorefrontStatus } from '@/lib/repos/catalog';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// PATCH — update fields, or change status (publish requires approved provider).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await requireProvider();
    if (!actor?.providerId) return FORBIDDEN();
    const body = await req.json();
    if (body.status !== undefined) {
      return ok(await setStorefrontStatus(actor.providerId, id, body.status));
    }
    return ok(await updateStorefront(actor.providerId, id, body));
  } catch (err) { return errorResponse(err); }
}

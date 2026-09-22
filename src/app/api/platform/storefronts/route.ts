import { NextRequest } from 'next/server';
import { requireProvider, FORBIDDEN } from '@/lib/auth';
import { listStorefronts, createStorefront } from '@/lib/repos/catalog';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const actor = await requireProvider();
    if (!actor?.providerId) return FORBIDDEN();
    return ok(await listStorefronts(actor.providerId));
  } catch (err) { return errorResponse(err); }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireProvider();
    if (!actor?.providerId) return FORBIDDEN();
    const body = await req.json();
    return ok(await createStorefront(actor.providerId, body), 201);
  } catch (err) { return errorResponse(err); }
}

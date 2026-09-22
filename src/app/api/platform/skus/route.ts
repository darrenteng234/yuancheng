import { NextRequest } from 'next/server';
import { requireProvider, FORBIDDEN } from '@/lib/auth';
import { listSkus, createSku } from '@/lib/repos/catalog';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const actor = await requireProvider();
    if (!actor?.providerId) return FORBIDDEN();
    const productId = req.nextUrl.searchParams.get('product') ?? undefined;
    return ok(await listSkus(actor.providerId, productId));
  } catch (err) { return errorResponse(err); }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireProvider();
    if (!actor?.providerId) return FORBIDDEN();
    const body = await req.json();
    return ok(await createSku(actor.providerId, body), 201);
  } catch (err) { return errorResponse(err); }
}

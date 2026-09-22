import { NextRequest } from 'next/server';
import { requireProvider, FORBIDDEN } from '@/lib/auth';
import { listProducts, createProduct } from '@/lib/repos/catalog';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const actor = await requireProvider();
    if (!actor?.providerId) return FORBIDDEN();
    const storefrontId = req.nextUrl.searchParams.get('storefront') ?? undefined;
    return ok(await listProducts(actor.providerId, storefrontId));
  } catch (err) { return errorResponse(err); }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireProvider();
    if (!actor?.providerId) return FORBIDDEN();
    const body = await req.json();
    return ok(await createProduct(actor.providerId, body), 201);
  } catch (err) { return errorResponse(err); }
}

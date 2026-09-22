import { NextRequest } from 'next/server';
import { getActor, FORBIDDEN } from '@/lib/auth';
import { listDisputes, resolveDispute } from '@/lib/repos/admin';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const actor = await getActor();
    if (actor.role !== 'admin') return FORBIDDEN();
    const status = req.nextUrl.searchParams.get('status') ?? undefined;
    return ok(await listDisputes(status));
  } catch (err) { return errorResponse(err); }
}

export async function PATCH(req: NextRequest) {
  try {
    const actor = await getActor();
    if (actor.role !== 'admin') return FORBIDDEN();
    const body = await req.json();
    if (!body.id) return errorResponse(new Error('id is required'));
    return ok(await resolveDispute(body.id, body));
  } catch (err) { return errorResponse(err); }
}

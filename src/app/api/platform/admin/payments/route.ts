import { getActor, FORBIDDEN } from '@/lib/auth';
import { listPayments } from '@/lib/repos/admin';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const actor = await getActor();
    if (actor.role !== 'admin') return FORBIDDEN();
    return ok(await listPayments());
  } catch (err) { return errorResponse(err); }
}

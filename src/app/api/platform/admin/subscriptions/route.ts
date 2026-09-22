import { getActor, FORBIDDEN } from '@/lib/auth';
import { listSubscriptions } from '@/lib/repos/admin';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const actor = await getActor();
    if (actor.role !== 'admin') return FORBIDDEN();
    return ok(await listSubscriptions());
  } catch (err) { return errorResponse(err); }
}

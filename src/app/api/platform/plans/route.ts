import { listPlans } from '@/lib/repos/plans';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/platform/plans — public plan catalogue (limits + features; prices may be null).
export async function GET() {
  try {
    return ok(await listPlans());
  } catch (err) { return errorResponse(err); }
}

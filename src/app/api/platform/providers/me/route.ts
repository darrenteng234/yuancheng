import { getActor, UNAUTHORIZED } from '@/lib/auth';
import { getProviderForUser, getSubscription } from '@/lib/repos/providers';
import { skuLimitStatus } from '@/lib/repos/catalog';
import { getPlan } from '@/lib/repos/plans';
import { errorResponse, ok } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/platform/providers/me — current user's provider + plan + limit status.
export async function GET() {
  try {
    const actor = await getActor();
    if (!actor.userId) return UNAUTHORIZED();
    const provider = await getProviderForUser(actor.userId);
    if (!provider) return ok({ provider: null });
    const subscription = await getSubscription(provider.id);
    const plan = subscription ? await getPlan(subscription.plan_id) : null;
    const skuLimit = await skuLimitStatus(provider.id);
    return ok({ provider, subscription, plan, skuLimit });
  } catch (err) { return errorResponse(err); }
}

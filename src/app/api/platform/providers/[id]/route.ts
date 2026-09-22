import { NextRequest } from 'next/server';
import { getActor, FORBIDDEN } from '@/lib/auth';
import { getProvider, setProviderStatus, updateProviderProfile } from '@/lib/repos/providers';
import { canManageProvider, isAdmin } from '@/lib/domain/permissions';
import { errorResponse, ok } from '@/lib/api-helpers';
import type { ProviderStatus } from '@/types/platform';

export const dynamic = 'force-dynamic';

// GET — admin (any) or the owning provider.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await getActor();
    if (!canManageProvider(actor, id)) return FORBIDDEN();
    const provider = await getProvider(id);
    if (!provider) return errorResponse(new (await import('@/lib/repos/db')).NotFoundError('Provider'));
    return ok(provider);
  } catch (err) { return errorResponse(err); }
}

// PATCH — admin changes lifecycle status; owner edits profile fields.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await getActor();
    const body = await req.json();

    // Lifecycle status change is admin-only.
    if (body.status !== undefined) {
      if (!isAdmin(actor)) return FORBIDDEN();
      return ok(await setProviderStatus(id, body.status as ProviderStatus));
    }
    // Profile edit: admin or owning provider.
    if (!canManageProvider(actor, id)) return FORBIDDEN();
    return ok(await updateProviderProfile(id, body));
  } catch (err) { return errorResponse(err); }
}

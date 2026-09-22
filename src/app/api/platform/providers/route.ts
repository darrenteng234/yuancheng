import { NextRequest } from 'next/server';
import { getActor, FORBIDDEN, UNAUTHORIZED } from '@/lib/auth';
import { listProviders, applyAsProvider } from '@/lib/repos/providers';
import { errorResponse, ok } from '@/lib/api-helpers';
import type { ProviderStatus } from '@/types/platform';

export const dynamic = 'force-dynamic';

// GET /api/platform/providers — admin lists provider applications/accounts.
export async function GET(req: NextRequest) {
  try {
    const actor = await getActor();
    if (actor.role !== 'admin') return FORBIDDEN();
    const status = req.nextUrl.searchParams.get('status') as ProviderStatus | null;
    return ok(await listProviders(status ?? undefined));
  } catch (err) { return errorResponse(err); }
}

// POST /api/platform/providers — an authenticated user applies to become a provider.
export async function POST(req: NextRequest) {
  try {
    const actor = await getActor();
    if (!actor.userId) return UNAUTHORIZED();
    const body = await req.json();
    if (!body.name) return errorResponse(new Error('name is required'));
    const provider = await applyAsProvider({
      userId: actor.userId, name: body.name, kind: body.kind,
      contact_email: body.contact_email, contact_phone: body.contact_phone,
    });
    return ok(provider, 201);
  } catch (err) { return errorResponse(err); }
}

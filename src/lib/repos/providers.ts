import { db, NotFoundError } from './db';
import type { Provider, ProviderStatus, Subscription } from '@/types/platform';
import { getFreePlan } from './plans';

export async function listProviders(status?: ProviderStatus): Promise<Provider[]> {
  let q = db().from('providers').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Provider[];
}

export async function getProvider(id: string): Promise<Provider | null> {
  const { data, error } = await db().from('providers').select('*').eq('id', id).single();
  if (error) return null;
  return data as Provider;
}

export async function getProviderForUser(userId: string): Promise<Provider | null> {
  const { data: member } = await db().from('provider_members').select('provider_id').eq('user_id', userId).single();
  if (!member) return null;
  return getProvider(member.provider_id);
}

/**
 * Provider self-service application. Creates provider (status APPLIED/pending),
 * the owner membership, and a free-plan subscription. Idempotent per user:
 * a user who already owns a provider gets it back.
 */
export async function applyAsProvider(input: {
  userId: string; name: string; kind?: Provider['kind']; contact_email?: string; contact_phone?: string;
}): Promise<Provider> {
  const existing = await getProviderForUser(input.userId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const { data: provider, error } = await db().from('providers').insert({
    name: input.name,
    kind: input.kind ?? 'other',
    status: 'pending',                 // APPLIED / UNDER_REVIEW
    fulfillment_mode: 'platform',
    owner_user_id: input.userId,
    contact_email: input.contact_email,
    contact_phone: input.contact_phone,
    created_at: now, updated_at: now,
  }).select('*').single();
  if (error) throw new Error(error.message);

  await db().from('provider_members').insert({
    provider_id: provider.id, user_id: input.userId, role: 'owner', created_at: now,
  });

  const free = await getFreePlan();
  if (free) {
    await db().from('subscriptions').insert({
      provider_id: provider.id, plan_id: free.id, status: 'active', created_at: now, updated_at: now,
    });
  }
  return provider as Provider;
}

const VALID_STATUS: ProviderStatus[] = ['pending', 'approved', 'suspended', 'rejected'];

/** Admin-only: change provider lifecycle status. */
export async function setProviderStatus(id: string, status: ProviderStatus): Promise<Provider> {
  if (!VALID_STATUS.includes(status)) throw new Error(`Invalid status: ${status}`);
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'approved') patch.approved_at = new Date().toISOString();
  const { data, error } = await db().from('providers').update(patch).eq('id', id).select('*').single();
  if (error) throw new NotFoundError('Provider');
  return data as Provider;
}

export async function updateProviderProfile(id: string, patch: Partial<Provider>): Promise<Provider> {
  const allowed = ['name', 'kind', 'contact_email', 'contact_phone', 'default_locale', 'fulfillment_mode'] as const;
  const clean: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of allowed) if (patch[k] !== undefined) clean[k] = patch[k];
  const { data, error } = await db().from('providers').update(clean).eq('id', id).select('*').single();
  if (error) throw new NotFoundError('Provider');
  return data as Provider;
}

export async function getSubscription(providerId: string): Promise<Subscription | null> {
  const { data } = await db().from('subscriptions').select('*').eq('provider_id', providerId)
    .order('created_at', { ascending: false }).limit(1).single();
  return (data as Subscription) ?? null;
}

/** True only for a provider allowed to publish publicly. */
export function canPublishPublicly(provider: Pick<Provider, 'status'>): boolean {
  return provider.status === 'approved';
}

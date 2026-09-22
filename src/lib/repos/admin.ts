import { db } from './db';
import type { Payment, Subscription, PlatformDispute } from '@/types/platform';

/** Admin read views. All callers must verify admin role in the route. */

export async function listPayments(limit = 100): Promise<Payment[]> {
  const { data, error } = await db().from('payments').select('*')
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Payment[];
}

export async function listSubscriptions(limit = 100): Promise<(Subscription & { provider_name?: string })[]> {
  const { data, error } = await db().from('subscriptions')
    .select('*, providers(name), plans(name)').order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as (Subscription & { provider_name?: string })[];
}

export async function listDisputes(status?: string): Promise<PlatformDispute[]> {
  let q = db().from('disputes').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as PlatformDispute[];
}

export async function resolveDispute(id: string, patch: { status?: string; resolution?: string; refund_amount?: number; admin_notes?: string }): Promise<PlatformDispute> {
  const clean: Record<string, unknown> = {};
  for (const k of ['status', 'resolution', 'refund_amount', 'admin_notes'] as const) {
    if (patch[k] !== undefined) clean[k] = patch[k];
  }
  if (patch.status === 'resolved') clean.resolved_at = new Date().toISOString();
  const { data, error } = await db().from('disputes').update(clean).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data as PlatformDispute;
}

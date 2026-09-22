import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from './supabase';

export async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabaseAdmin!.from('admins').select('role').eq('user_id', session.user.id).single();
  if (!data) return null;
  return { session, role: data.role };
}

export async function requireRunner() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabaseAdmin!.from('runners').select('id, status').eq('user_id', session.user.id).single();
  if (!data || data.status === 'suspended') return null;
  return { session, runner: data };
}

export type Staff =
  | { kind: 'admin'; role: string; userId: string }
  | { kind: 'runner'; runnerId: string; status: string; userId: string };

// Authenticated admin OR runner. Used for endpoints both roles legitimately hit
// (order status updates, evidence uploads, receipts). Callers must still enforce
// resource ownership for runners where relevant.
export async function requireStaff(): Promise<Staff | null> {
  const session = await getSession();
  if (!session) return null;
  const { data: admin } = await supabaseAdmin!.from('admins').select('role').eq('user_id', session.user.id).single();
  if (admin) return { kind: 'admin', role: admin.role, userId: session.user.id };
  const { data: runner } = await supabaseAdmin!.from('runners').select('id, status').eq('user_id', session.user.id).single();
  if (runner && runner.status !== 'suspended') {
    return { kind: 'runner', runnerId: runner.id, status: runner.status, userId: session.user.id };
  }
  return null;
}

export const FORBIDDEN = () => NextResponse.json({ error: 'Forbidden' }, { status: 403 });
export const UNAUTHORIZED = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// ── Platform actor resolution (provider-centric model) ──────────────────────
import type { Actor } from './domain/permissions';

/**
 * Resolve the current request's Actor for the platform authorization model.
 * Precedence: admin → provider member → fulfiller(runner) → guest.
 * Customer accounts are guest-first in V1, so a bare authenticated user with no
 * platform role resolves to 'customer' with their user id (own-order scope).
 */
export async function getActor(): Promise<Actor> {
  const session = await getSession();
  if (!session) return { role: 'guest' };
  const uid = session.user.id;
  if (!supabaseAdmin) return { role: 'guest' };

  const { data: admin } = await supabaseAdmin.from('admins').select('role').eq('user_id', uid).single();
  if (admin) return { role: 'admin', userId: uid };

  const { data: member } = await supabaseAdmin
    .from('provider_members').select('provider_id, role').eq('user_id', uid).single();
  if (member) {
    return {
      role: member.role === 'owner' ? 'provider_owner' : 'provider_staff',
      userId: uid,
      providerId: member.provider_id,
    };
  }

  const { data: runner } = await supabaseAdmin
    .from('runners').select('id, status').eq('user_id', uid).single();
  if (runner && runner.status !== 'suspended') {
    return { role: 'fulfiller', userId: uid, fulfillerId: runner.id };
  }

  // Authenticated but no staff role → treat as a customer scoped to own orders.
  const { data: customer } = await supabaseAdmin
    .from('platform_customers').select('id').eq('user_id', uid).single();
  return { role: 'customer', userId: uid, customerId: customer?.id };
}

/** Require an approved provider member; returns actor or null. */
export async function requireProvider(): Promise<Actor | null> {
  const actor = await getActor();
  if (actor.role !== 'provider_owner' && actor.role !== 'provider_staff') return null;
  return actor;
}

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

/**
 * Server-side data layer — uses the Supabase service role key directly.
 * For use in Server Components only (no fetch() calls).
 *
 * FALLBACK POLICY (production safety):
 *  - Mock/demo data is ONLY served in development, or when ALLOW_MOCK_FALLBACK=true.
 *  - In production the mock fallback is OFF by default: a misconfigured or broken
 *    database surfaces as a real error instead of silently showing demo content.
 *  - A successful query that returns zero rows is returned AS-IS (empty), never
 *    replaced with mock data — empty is a valid, truthful state.
 */

import { supabaseAdmin } from './supabase';
import type {
  Temple, Product, Package, Runner, Customer, Order,
  RunnerReceipt, Dispute, TempleRequest, Notification, PackageProduct
} from '@/types';
import {
  mockTemples, mockPackages, mockOrders, mockRunners, mockCustomers
} from './fallback-data';

// Mock fallback is allowed only outside production, or when explicitly opted in.
const ALLOW_FALLBACK =
  process.env.NODE_ENV !== 'production' ||
  process.env.ALLOW_MOCK_FALLBACK === 'true';

function notConfigured(): never {
  throw new Error(
    '[server-data] Supabase service role is not configured. Set SUPABASE_SERVICE_ROLE_KEY ' +
    '(and disable ALLOW_MOCK_FALLBACK is not required in production).'
  );
}

// ── TEMPLES ──
export async function getTemples(): Promise<Temple[]> {
  if (!supabaseAdmin) {
    if (ALLOW_FALLBACK) return mockTemples;
    notConfigured();
  }
  const { data, error } = await supabaseAdmin.from('temples').select('*').order('name');
  if (error) {
    console.error('[server-data] getTemples failed:', error.message);
    if (ALLOW_FALLBACK) return mockTemples;
    throw new Error('Failed to load temples');
  }
  return data ?? [];
}

export async function getTemple(id: string): Promise<Temple | null> {
  if (!supabaseAdmin) {
    if (ALLOW_FALLBACK) return mockTemples.find(t => t.id === id) || null;
    notConfigured();
  }
  const { data, error } = await supabaseAdmin.from('temples').select('*').eq('id', id).single();
  if (error) {
    // PGRST116 = no rows found → a genuine "not found", not a failure.
    if (error.code === 'PGRST116') return null;
    console.error('[server-data] getTemple failed:', error.message);
    if (ALLOW_FALLBACK) return mockTemples.find(t => t.id === id) || null;
    throw new Error('Failed to load temple');
  }
  return data ?? null;
}

// ── PACKAGES ──
export async function getPackages(templeId?: string): Promise<Package[]> {
  if (!supabaseAdmin) {
    if (ALLOW_FALLBACK) return templeId ? mockPackages.filter(p => p.temple_id === templeId) : mockPackages;
    notConfigured();
  }
  let query = supabaseAdmin.from('packages').select('*').order('selling_price');
  if (templeId) query = query.eq('temple_id', templeId);
  const { data, error } = await query;
  if (error) {
    console.error('[server-data] getPackages failed:', error.message);
    if (ALLOW_FALLBACK) return templeId ? mockPackages.filter(p => p.temple_id === templeId) : mockPackages;
    throw new Error('Failed to load packages');
  }
  return data ?? [];
}

// ── ORDERS ──
export async function getOrders(): Promise<Order[]> {
  if (!supabaseAdmin) {
    if (ALLOW_FALLBACK) return mockOrders;
    notConfigured();
  }
  const { data, error } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('[server-data] getOrders failed:', error.message);
    if (ALLOW_FALLBACK) return mockOrders;
    throw new Error('Failed to load orders');
  }
  return data ?? [];
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!supabaseAdmin) {
    if (ALLOW_FALLBACK) return mockOrders.find(o => o.id === id) || null;
    notConfigured();
  }
  const { data, error } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[server-data] getOrder failed:', error.message);
    if (ALLOW_FALLBACK) return mockOrders.find(o => o.id === id) || null;
    throw new Error('Failed to load order');
  }
  return data ?? null;
}

// ── RUNNERS ──
export async function getRunners(): Promise<Runner[]> {
  if (!supabaseAdmin) {
    if (ALLOW_FALLBACK) return mockRunners;
    notConfigured();
  }
  const { data, error } = await supabaseAdmin.from('runners').select('*').order('name');
  if (error) {
    console.error('[server-data] getRunners failed:', error.message);
    if (ALLOW_FALLBACK) return mockRunners;
    throw new Error('Failed to load runners');
  }
  return data ?? [];
}

// ── CUSTOMERS ──
export async function getCustomers(): Promise<Customer[]> {
  if (!supabaseAdmin) {
    if (ALLOW_FALLBACK) return mockCustomers;
    notConfigured();
  }
  const { data, error } = await supabaseAdmin.from('customers').select('*').order('name');
  if (error) {
    console.error('[server-data] getCustomers failed:', error.message);
    if (ALLOW_FALLBACK) return mockCustomers;
    throw new Error('Failed to load customers');
  }
  return data ?? [];
}

// ── DASHBOARD STATS ──
export async function getDashboardStats() {
  const [orders, temples, runners, customers] = await Promise.all([
    getOrders(), getTemples(), getRunners(), getCustomers(),
  ]);
  const activeTemples = temples.filter(t => t.status === 'active').length;
  const activeRunners = runners.filter(r => r.status === 'active').length;
  const pendingReviews = orders.filter(o => o.status === 'in_review').length;
  const unassignedOrders = orders.filter(o => o.status === 'unassigned' || o.status === 'paid').length;
  const disputedOrders = orders.filter(o => o.status === 'disputed').length;
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'in_review');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.selling_price) || 0), 0);
  return {
    totalOrders: orders.length, totalRevenue, activeTemples, activeRunners,
    pendingReviews, unassignedOrders, disputedOrders, totalCustomers: customers.length,
  };
}

// Re-export unused types to preserve the module's public type surface.
export type { RunnerReceipt, Dispute, TempleRequest, Notification, PackageProduct };

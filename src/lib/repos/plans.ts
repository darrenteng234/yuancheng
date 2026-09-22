import { db } from './db';
import type { Plan } from '@/types/platform';

export async function listPlans(): Promise<Plan[]> {
  const { data, error } = await db().from('plans').select('*').order('monthly_price', { nullsFirst: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Plan[];
}

export async function getPlan(id: string): Promise<Plan | null> {
  const { data, error } = await db().from('plans').select('*').eq('id', id).single();
  if (error) return null;
  return data as Plan;
}

export async function getFreePlan(): Promise<Plan | null> {
  const { data, error } = await db().from('plans').select('*').eq('tier', 'free').limit(1).single();
  if (error) return null;
  return data as Plan;
}

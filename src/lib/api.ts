/**
 * Runner client — the only surviving piece of the legacy temple-era API client.
 * All other legacy endpoints (temples/products/packages/receipts/disputes/…)
 * were archived with the temple-admin model; this file now holds just the two
 * calls the runner profile page still uses. Both hit /api/runners/[id], which
 * enforces ownership + a field allowlist server-side.
 */
import type { Runner } from '@/types';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function getRunner(id: string): Promise<Runner | null> {
  return apiFetch<Runner>(`/api/runners/${id}`);
}

export async function updateRunner(id: string, updates: Partial<Runner>): Promise<Runner> {
  return apiFetch<Runner>(`/api/runners/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}

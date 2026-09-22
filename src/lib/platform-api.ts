/** Client fetch layer for the platform API. All calls hit server routes that
 *  enforce auth + scoping; the browser never queries the DB directly. */
import type {
  Provider, Storefront, PlatformProduct, Sku, Order, Plan, Subscription,
} from '@/types/platform';
import type { LimitCheck } from '@/lib/domain/plan';

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body as T;
}

const P = '/api/platform';

// Providers
export const applyProvider = (b: { name: string; kind?: string; contact_email?: string; contact_phone?: string }) =>
  req<Provider>(`${P}/providers`, { method: 'POST', body: JSON.stringify(b) });
export const getMyProvider = () =>
  req<{ provider: Provider | null; subscription?: Subscription; plan?: Plan; skuLimit?: LimitCheck }>(`${P}/providers/me`);
export const listProviders = (status?: string) =>
  req<Provider[]>(`${P}/providers${status ? `?status=${status}` : ''}`);
export const getProvider = (id: string) => req<Provider>(`${P}/providers/${id}`);
export const setProviderStatus = (id: string, status: string) =>
  req<Provider>(`${P}/providers/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const updateProviderProfile = (id: string, patch: Partial<Provider>) =>
  req<Provider>(`${P}/providers/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });

// Storefronts
export const listStorefronts = () => req<Storefront[]>(`${P}/storefronts`);
export const createStorefront = (b: Partial<Storefront>) =>
  req<Storefront>(`${P}/storefronts`, { method: 'POST', body: JSON.stringify(b) });
export const setStorefrontStatus = (id: string, status: string) =>
  req<Storefront>(`${P}/storefronts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const updateStorefront = (id: string, patch: Partial<Storefront>) =>
  req<Storefront>(`${P}/storefronts/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });

// Products & SKUs
export const listProducts = (storefront?: string) =>
  req<PlatformProduct[]>(`${P}/products${storefront ? `?storefront=${storefront}` : ''}`);
export const createProduct = (b: Partial<PlatformProduct>) =>
  req<PlatformProduct>(`${P}/products`, { method: 'POST', body: JSON.stringify(b) });
export const listSkus = (product?: string) =>
  req<Sku[]>(`${P}/skus${product ? `?product=${product}` : ''}`);
export const createSku = (b: Partial<Sku>) =>
  req<Sku>(`${P}/skus`, { method: 'POST', body: JSON.stringify(b) });
export const setSkuStatus = (id: string, status: string) =>
  req<Sku>(`${P}/skus/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

// Orders
export const listOrders = (status?: string) =>
  req<Order[]>(`${P}/orders${status ? `?status=${status}` : ''}`);
export const getOrder = (id: string, token?: string) =>
  req<Order>(`${P}/orders/${id}${token ? `?token=${encodeURIComponent(token)}` : ''}`);
export const createOrder = (b: unknown) =>
  req<{ id: string; order_number: string; total: number; currency: string; access_token: string; status: string }>(
    `${P}/orders`, { method: 'POST', body: JSON.stringify(b) });
export const transitionOrder = (id: string, status: string, extra?: Record<string, unknown>) =>
  req<Order>(`${P}/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status, ...extra }) });
export const assignFulfiller = (id: string, fulfiller_id: string) =>
  req<Order>(`${P}/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ fulfiller_id }) });

export const submitEvidence = (id: string, items: { type: string; url: string; label?: string }[]) =>
  req<Order>(`${P}/orders/${id}/evidence`, { method: 'POST', body: JSON.stringify({ items }) });

// Plans
export const listPlans = () => req<Plan[]>(`${P}/plans`);

// Admin read views
export const adminListPayments = () => req<import('@/types/platform').Payment[]>(`${P}/admin/payments`);
export const adminListSubscriptions = () => req<import('@/types/platform').Subscription[]>(`${P}/admin/subscriptions`);
export const adminListDisputes = (status?: string) =>
  req<import('@/types/platform').PlatformDispute[]>(`${P}/admin/disputes${status ? `?status=${status}` : ''}`);

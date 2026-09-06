/**
 * Believer API Client
 *
 * All functions use fetch() to call server-side API routes
 * which use the service role key (bypasses RLS).
 * GET functions also try direct Supabase anon client for reads (faster),
 * but fall back to API routes if RRLS blocks.
 */

const API = '/api';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

import type {
  Temple, Product, Package, Runner, Customer, Order,
  RunnerReceipt, Dispute, TempleRequest, Notification, PackageProduct
} from '@/types';

// ── TEMPLES ──
export async function getTemples(): Promise<Temple[]> {
  return apiFetch<Temple[]>(`${API}/temples`);
}
export async function getTemple(id: string): Promise<Temple | null> {
  return apiFetch<Temple>(`${API}/temples/${id}`);
}
export async function createTemple(temple: Partial<Temple>): Promise<Temple> {
  return apiFetch<Temple>(`${API}/temples`, { method: 'POST', body: JSON.stringify(temple) });
}
export async function updateTemple(id: string, updates: Partial<Temple>): Promise<Temple> {
  return apiFetch<Temple>(`${API}/temples/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}
export async function deleteTemple(id: string): Promise<void> {
  await apiFetch(`${API}/temples?id=${id}`, { method: 'DELETE' });
}

// ── PRODUCTS ──
export async function getProducts(templeId?: string): Promise<Product[]> {
  const url = templeId ? `${API}/products?temple=${templeId}` : `${API}/products`;
  return apiFetch<Product[]>(url);
}
export async function createProduct(product: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(`${API}/products`, { method: 'POST', body: JSON.stringify(product) });
}
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(`${API}/products/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}
export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`${API}/products/${id}`, { method: 'DELETE' });
}

// ── PACKAGES ──
export async function getPackages(templeId?: string): Promise<Package[]> {
  const url = templeId ? `${API}/packages?temple=${templeId}` : `${API}/packages`;
  return apiFetch<Package[]>(url);
}
export async function getPackageWithProducts(packageId: string): Promise<Package & { package_products: (PackageProduct & { product: Product })[] }> {
  return apiFetch(`${API}/packages/${packageId}`);
}
export async function createPackage(pkg: Partial<Package>, productIds: { product_id: string; quantity: number }[]): Promise<Package> {
  return apiFetch<Package>(`${API}/packages`, { method: 'POST', body: JSON.stringify({ ...pkg, product_ids: productIds }) });
}
export async function updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
  return apiFetch<Package>(`${API}/packages/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}
export async function deletePackage(id: string): Promise<void> {
  await apiFetch(`${API}/packages/${id}`, { method: 'DELETE' });
}

// ── RUNNERS ──
export async function getRunners(): Promise<Runner[]> {
  return apiFetch<Runner[]>(`${API}/runners`);
}
export async function getRunner(id: string): Promise<Runner | null> {
  return apiFetch<Runner>(`${API}/runners/${id}`);
}
export async function createRunner(runner: Partial<Runner>): Promise<Runner> {
  return apiFetch<Runner>(`${API}/runners`, { method: 'POST', body: JSON.stringify(runner) });
}
export async function updateRunner(id: string, updates: Partial<Runner>): Promise<Runner> {
  return apiFetch<Runner>(`${API}/runners/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}
export async function deleteRunner(id: string): Promise<void> {
  await apiFetch(`${API}/runners/${id}`, { method: 'DELETE' });
}

// ── CUSTOMERS ──
export async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>(`${API}/customers`);
}
export async function getCustomer(id: string): Promise<Customer | null> {
  return apiFetch<Customer>(`${API}/customers/${id}`);
}
export async function createCustomer(customer: Partial<Customer>): Promise<Customer> {
  return apiFetch<Customer>(`${API}/customers`, { method: 'POST', body: JSON.stringify(customer) });
}
export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  return apiFetch<Customer>(`${API}/customers/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}

// ── ORDERS ──
export async function getOrders(runnerId?: string): Promise<Order[]> {
  const url = runnerId ? `${API}/orders?runner=${runnerId}` : `${API}/orders`;
  const res = await apiFetch<{ orders: Order[] } | Order[]>(url);
  // Handle both wrapped { orders: [] } and plain [] responses
  if (Array.isArray(res)) return res;
  return (res as { orders: Order[] }).orders || [];
}
export async function getOrder(id: string): Promise<Order | null> {
  return apiFetch<Order>(`${API}/orders/${id}`);
}
export async function getOrdersByStatus(status: string): Promise<Order[]> {
  return apiFetch<Order[]>(`${API}/orders?status=${status}`);
}
export async function createOrder(order: Partial<Order>): Promise<Order> {
  return apiFetch<Order>(`${API}/orders`, { method: 'POST', body: JSON.stringify(order) });
}
export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  return apiFetch<Order>(`${API}/orders/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}
export async function assignRunner(orderId: string, runnerId: string): Promise<Order> {
  return updateOrder(orderId, { runner_id: runnerId, status: 'in_progress' });
}

// ── RECEIPTS ──
export async function getReceipts(runnerId?: string): Promise<RunnerReceipt[]> {
  const url = runnerId ? `${API}/receipts?runner=${runnerId}` : `${API}/receipts`;
  const res = await apiFetch<{ receipts: RunnerReceipt[] } | RunnerReceipt[]>(url);
  // Handle both wrapped { receipts: [] } and plain [] responses
  if (Array.isArray(res)) return res;
  return (res as { receipts: RunnerReceipt[] }).receipts || [];
}
export async function createReceipt(receipt: Partial<RunnerReceipt>): Promise<RunnerReceipt> {
  return apiFetch<RunnerReceipt>(`${API}/receipts`, { method: 'POST', body: JSON.stringify(receipt) });
}
export async function updateReceipt(id: string, updates: Partial<RunnerReceipt>): Promise<RunnerReceipt> {
  return apiFetch<RunnerReceipt>(`${API}/receipts/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}

// ── DISPUTES ──
export async function getDisputes(): Promise<Dispute[]> {
  return apiFetch<Dispute[]>(`${API}/disputes`);
}
export async function createDispute(dispute: Partial<Dispute>): Promise<Dispute> {
  return apiFetch<Dispute>(`${API}/disputes`, { method: 'POST', body: JSON.stringify(dispute) });
}
export async function updateDispute(id: string, updates: Partial<Dispute>): Promise<Dispute> {
  return apiFetch<Dispute>(`${API}/disputes/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}

// ── TEMPLE REQUESTS ──
export async function getTempleRequests(): Promise<TempleRequest[]> {
  return apiFetch<TempleRequest[]>(`${API}/temple-requests`);
}
export async function createTempleRequest(request: Partial<TempleRequest>): Promise<TempleRequest> {
  return apiFetch<TempleRequest>(`${API}/temple-requests`, { method: 'POST', body: JSON.stringify(request) });
}
export async function updateTempleRequest(id: string, updates: Partial<TempleRequest>): Promise<TempleRequest> {
  return apiFetch<TempleRequest>(`${API}/temple-requests/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
}

// ── NOTIFICATIONS ──
export async function getNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>(`${API}/notifications`);
}
export async function createNotification(notification: Partial<Notification>): Promise<Notification> {
  return apiFetch<Notification>(`${API}/notifications`, { method: 'POST', body: JSON.stringify(notification) });
}
export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`${API}/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ is_read: true }) });
}

// ── SETTINGS ──
export async function getSetting(key: string): Promise<unknown> {
  return apiFetch(`${API}/settings?key=${key}`);
}
export async function updateSetting(key: string, value: unknown): Promise<void> {
  await apiFetch(`${API}/settings`, { method: 'POST', body: JSON.stringify({ key, value }) });
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
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.selling_price, 0);
  return {
    totalOrders: orders.length, totalRevenue, activeTemples, activeRunners,
    pendingReviews, unassignedOrders, disputedOrders, totalCustomers: customers.length,
  };
}

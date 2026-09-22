import { db, NotFoundError, LimitError, ForbiddenError } from './db';
import type { Storefront, PlatformProduct, Sku } from '@/types/platform';
import { getProvider, getSubscription, canPublishPublicly } from './providers';
import { getPlan } from './plans';
import { DEFAULT_FREE_PLAN, canPublishSku, checkLimit } from '@/lib/domain/plan';

// Resolve the effective plan limits for a provider (falls back to free defaults).
async function planLimitsFor(providerId: string) {
  const sub = await getSubscription(providerId);
  const plan = sub ? await getPlan(sub.plan_id) : null;
  return {
    sku_limit: plan ? plan.sku_limit : DEFAULT_FREE_PLAN.sku_limit,
    storefront_limit: plan ? plan.storefront_limit : DEFAULT_FREE_PLAN.storefront_limit,
    planName: plan?.name ?? DEFAULT_FREE_PLAN.name,
  };
}

// ── Storefronts ─────────────────────────────────────────────────────────────
export async function listStorefronts(providerId: string): Promise<Storefront[]> {
  const { data, error } = await db().from('storefronts').select('*')
    .eq('provider_id', providerId).order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as Storefront[];
}

export async function getPublishedStorefrontBySlug(slug: string): Promise<Storefront | null> {
  const { data } = await db().from('storefronts').select('*')
    .eq('slug', slug).eq('status', 'published').single();
  return (data as Storefront) ?? null;
}

export async function createStorefront(providerId: string, input: Partial<Storefront>): Promise<Storefront> {
  const limits = await planLimitsFor(providerId);
  const existing = await listStorefronts(providerId);
  const check = checkLimit(limits.storefront_limit, existing.length, 'Storefront');
  if (!check.allowed) throw new LimitError(check.reason ?? 'Storefront limit reached');
  if (!input.slug || !input.name) throw new Error('slug and name are required');

  const now = new Date().toISOString();
  const { data, error } = await db().from('storefronts').insert({
    provider_id: providerId, slug: input.slug, name: input.name,
    description: input.description ?? null, status: 'draft',
    locale: input.locale ?? 'en', branding: input.branding ?? {},
    created_at: now, updated_at: now,
  }).select('*').single();
  if (error) throw new Error(error.message);
  return data as Storefront;
}

export async function updateStorefront(providerId: string, id: string, patch: Partial<Storefront>): Promise<Storefront> {
  await assertOwnsStorefront(providerId, id);
  const allowed = ['name', 'description', 'locale', 'branding'] as const;
  const clean: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of allowed) if (patch[k] !== undefined) clean[k] = patch[k];
  const { data, error } = await db().from('storefronts').update(clean).eq('id', id).select('*').single();
  if (error) throw new NotFoundError('Storefront');
  return data as Storefront;
}

/** Publish a storefront — only an APPROVED provider may go public. */
export async function setStorefrontStatus(providerId: string, id: string, status: Storefront['status']): Promise<Storefront> {
  await assertOwnsStorefront(providerId, id);
  if (status === 'published') {
    const provider = await getProvider(providerId);
    if (!provider || !canPublishPublicly(provider)) {
      throw new ForbiddenError('Provider must be approved before publishing publicly');
    }
  }
  const { data, error } = await db().from('storefronts')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) throw new NotFoundError('Storefront');
  return data as Storefront;
}

async function assertOwnsStorefront(providerId: string, id: string) {
  const { data } = await db().from('storefronts').select('provider_id').eq('id', id).single();
  if (!data) throw new NotFoundError('Storefront');
  if (data.provider_id !== providerId) throw new ForbiddenError();
}

// ── Products ────────────────────────────────────────────────────────────────
export async function listProducts(providerId: string, storefrontId?: string): Promise<PlatformProduct[]> {
  let q = db().from('platform_products').select('*').eq('provider_id', providerId);
  if (storefrontId) q = q.eq('storefront_id', storefrontId);
  const { data, error } = await q.order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as PlatformProduct[];
}

export async function createProduct(providerId: string, input: Partial<PlatformProduct>): Promise<PlatformProduct> {
  if (!input.storefront_id || !input.name) throw new Error('storefront_id and name are required');
  await assertOwnsStorefront(providerId, input.storefront_id);
  const now = new Date().toISOString();
  const { data, error } = await db().from('platform_products').insert({
    provider_id: providerId, storefront_id: input.storefront_id, name: input.name,
    description: input.description ?? null, type: input.type ?? 'service',
    photos: input.photos ?? [], created_at: now, updated_at: now,
  }).select('*').single();
  if (error) throw new Error(error.message);
  return data as PlatformProduct;
}

// ── SKUs (the plan-limited object) ──────────────────────────────────────────
export async function countPublishedSkus(providerId: string): Promise<number> {
  const { count, error } = await db().from('skus')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', providerId).eq('status', 'published');
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function listSkus(providerId: string, productId?: string): Promise<Sku[]> {
  let q = db().from('skus').select('*').eq('provider_id', providerId);
  if (productId) q = q.eq('product_id', productId);
  const { data, error } = await q.order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as Sku[];
}

export async function createSku(providerId: string, input: Partial<Sku>): Promise<Sku> {
  if (!input.product_id || !input.name) throw new Error('product_id and name are required');
  // SKUs are created as draft — they do not count until published.
  const now = new Date().toISOString();
  const { data, error } = await db().from('skus').insert({
    product_id: input.product_id, provider_id: providerId, name: input.name,
    price: input.price ?? 0, currency: input.currency ?? 'MYR', status: 'draft',
    evidence_required: input.evidence_required ?? [], created_at: now, updated_at: now,
  }).select('*').single();
  if (error) throw new Error(error.message);
  return data as Sku;
}

/**
 * Change a SKU's status. Publishing enforces the plan's active-SKU limit AND
 * requires the provider to be approved. Returns the updated SKU.
 */
export async function setSkuStatus(providerId: string, skuId: string, status: Sku['status']): Promise<Sku> {
  const { data: sku } = await db().from('skus').select('*').eq('id', skuId).single();
  if (!sku) throw new NotFoundError('SKU');
  if (sku.provider_id !== providerId) throw new ForbiddenError();

  if (status === 'published' && sku.status !== 'published') {
    const provider = await getProvider(providerId);
    if (!provider || !canPublishPublicly(provider)) {
      throw new ForbiddenError('Provider must be approved before publishing SKUs');
    }
    const limits = await planLimitsFor(providerId);
    const current = await countPublishedSkus(providerId);
    const check = canPublishSku({ name: limits.planName, sku_limit: limits.sku_limit }, current);
    if (!check.allowed) throw new LimitError(check.reason ?? 'Active SKU limit reached');
  }

  const { data, error } = await db().from('skus')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', skuId).select('*').single();
  if (error) throw new Error(error.message);
  return data as Sku;
}

/** Public storefront view: only PUBLISHED storefront + products that have published SKUs. */
export async function getPublicStorefrontData(slug: string): Promise<
  { storefront: Storefront; products: (PlatformProduct & { skus: Sku[] })[] } | null
> {
  const storefront = await getPublishedStorefrontBySlug(slug);
  if (!storefront) return null;
  const { data: products } = await db().from('platform_products').select('*')
    .eq('storefront_id', storefront.id).order('created_at');
  const { data: skus } = await db().from('skus').select('*')
    .eq('provider_id', storefront.provider_id).eq('status', 'published');
  const byProduct = new Map<string, Sku[]>();
  for (const s of (skus ?? []) as Sku[]) {
    const arr = byProduct.get(s.product_id) ?? [];
    arr.push(s); byProduct.set(s.product_id, arr);
  }
  const withSkus = ((products ?? []) as PlatformProduct[])
    .map((p) => ({ ...p, skus: byProduct.get(p.id) ?? [] }))
    .filter((p) => p.skus.length > 0); // hide products with nothing buyable
  return { storefront, products: withSkus };
}

export async function skuLimitStatus(providerId: string) {
  const limits = await planLimitsFor(providerId);
  const used = await countPublishedSkus(providerId);
  return canPublishSku({ name: limits.planName, sku_limit: limits.sku_limit }, used);
}

import { db, NotFoundError, ForbiddenError } from './db';
import type { Order, OrderItem, OrderStatus, Payment, Currency, Role } from '@/types/platform';
import type { Actor } from '@/lib/domain/permissions';
import { orderListScope, canViewOrder } from '@/lib/domain/permissions';
import { checkTransition } from '@/lib/domain/order';
import { paymentFieldsFromGross } from '@/lib/domain/payment';
import crypto from 'crypto';

async function nextOrderNumber(): Promise<string> {
  const { data } = await db().from('platform_orders').select('order_number')
    .ilike('order_number', 'YC-%').order('order_number', { ascending: false }).limit(1);
  let n = 1;
  const last = data?.[0]?.order_number as string | undefined;
  const m = last?.match(/^YC-(\d+)$/);
  if (m) n = parseInt(m[1], 10) + 1;
  return `YC-${String(n).padStart(5, '0')}`;
}

/**
 * Create an order from SKU selections. Prices are read from the DB SKUs on the
 * server — the client cannot set the amount. Order starts as pending_payment.
 */
export async function createOrder(input: {
  storefrontId: string;
  items: { sku_id: string; quantity: number }[];
  customer_name?: string; customer_email?: string; customer_phone?: string;
  special_instructions?: string;
}): Promise<Order> {
  if (!input.items?.length) throw new Error('At least one item is required');

  const { data: storefront } = await db().from('storefronts')
    .select('id, provider_id, status').eq('id', input.storefrontId).single();
  if (!storefront) throw new NotFoundError('Storefront');
  if (storefront.status !== 'published') throw new ForbiddenError('Storefront is not published');

  // A suspended/unapproved provider cannot take new orders even if a storefront
  // was left published. Existing orders are unaffected.
  const { data: provider } = await db().from('providers')
    .select('status').eq('id', storefront.provider_id).single();
  if (!provider) throw new NotFoundError('Provider');
  if (provider.status !== 'approved') throw new ForbiddenError('This provider is not currently accepting orders');

  // Load the referenced SKUs and price server-side. Only published SKUs are buyable.
  const skuIds = input.items.map((i) => i.sku_id);
  const { data: skus } = await db().from('skus').select('*').in('id', skuIds);
  if (!skus || skus.length !== skuIds.length) throw new Error('One or more SKUs not found');

  let currency: Currency = 'MYR';
  let subtotal = 0;
  const lineItems: Omit<OrderItem, 'id' | 'order_id'>[] = [];
  for (const item of input.items) {
    const sku = skus.find((s) => s.id === item.sku_id);
    if (!sku) throw new Error(`SKU not found: ${item.sku_id}`);
    if (sku.status !== 'published') throw new ForbiddenError(`SKU not available: ${sku.name}`);
    if (sku.provider_id !== storefront.provider_id) throw new Error('SKU/storefront provider mismatch');
    const qty = Math.max(1, Math.floor(item.quantity || 1));
    const line = Number(sku.price) * qty;
    currency = sku.currency as Currency;
    subtotal += line;
    lineItems.push({ sku_id: sku.id, sku_name: sku.name, unit_price: Number(sku.price), quantity: qty, line_total: line });
  }

  const now = new Date().toISOString();
  const order_number = await nextOrderNumber();
  const access_token = crypto.randomBytes(24).toString('base64url');

  const { data: order, error } = await db().from('platform_orders').insert({
    order_number, provider_id: storefront.provider_id, storefront_id: storefront.id,
    status: 'pending_payment', currency, subtotal, total: subtotal,
    customer_name: input.customer_name, customer_email: input.customer_email,
    customer_phone: input.customer_phone, special_instructions: input.special_instructions,
    access_token, created_at: now, updated_at: now,
  }).select('*').single();
  if (error) throw new Error(error.message);

  await db().from('order_items').insert(lineItems.map((li) => ({ ...li, order_id: order.id })));
  return order as Order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data } = await db().from('platform_orders').select('*').eq('id', id).single();
  if (!data) return null;
  const { data: items } = await db().from('order_items').select('*').eq('order_id', id);
  return { ...(data as Order), items: (items ?? []) as OrderItem[] };
}

/** Evidence for an order (photos/videos/receipts). */
export async function listEvidence(orderId: string) {
  const { data } = await db().from('order_evidence').select('*').eq('order_id', orderId).order('created_at');
  return data ?? [];
}

/**
 * Submit evidence and move the order to evidence_submitted. Ownership + the
 * fulfillment guard are enforced by the caller (route) via checkTransition.
 */
const EVIDENCE_TYPES = ['photo', 'video', 'receipt', 'document'] as const;

export async function addEvidence(orderId: string, actorRole: Role, items: { type: string; url: string; label?: string }[], uploadedBy?: string): Promise<Order> {
  if (!items?.length) throw new Error('At least one evidence item is required');
  for (const e of items) {
    if (!e.url) throw new Error('Each evidence item requires a url');
    if (!EVIDENCE_TYPES.includes(e.type as (typeof EVIDENCE_TYPES)[number])) throw new Error(`Invalid evidence type: ${e.type}`);
  }
  // Validate the transition BEFORE writing evidence — so a retry (or double
  // submit) from a non-in_progress state fails cleanly without inserting
  // orphan evidence rows.
  const { data: current } = await db().from('platform_orders').select('status').eq('id', orderId).single();
  if (!current) throw new NotFoundError('Order');
  const check = checkTransition(current.status as OrderStatus, 'evidence_submitted', actorRole);
  if (!check.ok) throw new ForbiddenError(check.reason);

  const now = new Date().toISOString();
  await db().from('order_evidence').insert(items.map((e) => ({
    order_id: orderId, type: e.type, url: e.url, label: e.label ?? null, uploaded_by: uploadedBy ?? null, created_at: now,
  })));
  return transitionOrder(orderId, 'evidence_submitted', actorRole);
}

/** Ownership-scoped fetch. Guests must supply the correct access token. */
export async function getOrderScoped(id: string, actor: Actor, token?: string): Promise<Order | null> {
  const order = await getOrder(id);
  if (!order) return null;
  if (!canViewOrder(actor, order, token)) throw new ForbiddenError();
  return order;
}

/** Scoped list — NEVER returns other actors' data (replaces client-side filtering). */
export async function listOrdersScoped(actor: Actor, opts: { status?: OrderStatus; limit?: number } = {}): Promise<Order[]> {
  const scope = orderListScope(actor);
  if (scope && scope.value === '__none__') return [];
  let q = db().from('platform_orders').select('*').order('created_at', { ascending: false })
    .limit(Math.min(opts.limit ?? 50, 100));
  if (scope) q = q.eq(scope.column, scope.value);
  if (opts.status) q = q.eq('status', opts.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

/** Guarded status transition (state machine + role). */
export async function transitionOrder(id: string, to: OrderStatus, actorRole: Role, extra: Record<string, unknown> = {}): Promise<Order> {
  const { data: current } = await db().from('platform_orders').select('status').eq('id', id).single();
  if (!current) throw new NotFoundError('Order');
  const check = checkTransition(current.status as OrderStatus, to, actorRole);
  if (!check.ok) throw new ForbiddenError(check.reason);
  const patch: Record<string, unknown> = { status: to, updated_at: new Date().toISOString(), ...extra };
  if (to === 'accepted') patch.accepted_at = new Date().toISOString();
  if (to === 'completed') patch.completed_at = new Date().toISOString();
  // Compare-and-swap on the status we validated against: if another actor moved
  // the order in the meantime, no row matches and we report a conflict rather
  // than silently overwriting their change.
  const { data, error } = await db().from('platform_orders').update(patch)
    .eq('id', id).eq('status', current.status).select('*');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new ForbiddenError('Order was modified concurrently — reload and retry');
  return data[0] as Order;
}

/** Assign (or reassign) a fulfiller to an order. Admin/provider only (checked in route). */
export async function assignFulfiller(id: string, fulfillerId: string): Promise<Order> {
  const { data, error } = await db().from('platform_orders')
    .update({ fulfiller_id: fulfillerId, updated_at: new Date().toISOString() })
    .eq('id', id).select('*').single();
  if (error) throw new NotFoundError('Order');
  return data as Order;
}

/**
 * Record a payment for an order and mark it paid (idempotent, no-downgrade).
 * Called by the Stripe webhook. Computes the full allocation server-side.
 */
export async function recordPaymentSucceeded(orderId: string, stripePaymentIntentId: string): Promise<Payment | null> {
  const { data: order } = await db().from('platform_orders')
    .select('id, provider_id, total, currency, status').eq('id', orderId).single();
  if (!order) throw new NotFoundError('Order');

  const money = paymentFieldsFromGross(Number(order.total), order.currency as Currency);
  const now = new Date().toISOString();

  // Upsert-ish: one payment per intent.
  const { data: existing } = await db().from('payments')
    .select('id').eq('stripe_payment_intent_id', stripePaymentIntentId).single();

  let payment: Payment;
  if (existing) {
    const { data } = await db().from('payments').update({ status: 'succeeded', updated_at: now })
      .eq('id', existing.id).select('*').single();
    payment = data as Payment;
  } else {
    const { data, error } = await db().from('payments').insert({
      order_id: orderId, provider_id: order.provider_id, ...money,
      status: 'succeeded', payout_status: 'pending',
      stripe_payment_intent_id: stripePaymentIntentId, created_at: now, updated_at: now,
    }).select('*').single();
    if (error) {
      // Concurrent webhook delivery won the insert race (unique violation on
      // stripe_payment_intent_id). Fall back to the row it created.
      const { data: raced } = await db().from('payments')
        .select('*').eq('stripe_payment_intent_id', stripePaymentIntentId).single();
      if (!raced) throw new Error(error.message);
      payment = raced as Payment;
    } else {
      payment = data as Payment;
    }
  }

  // No-downgrade: only advance an order still awaiting payment.
  await db().from('platform_orders').update({ status: 'paid', updated_at: now })
    .eq('id', orderId).in('status', ['pending_payment', 'payment_failed']);
  return payment;
}

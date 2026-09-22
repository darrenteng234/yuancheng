import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { getOrder } from '@/lib/repos/orders';
import { toMinorUnits } from '@/lib/domain/payment';
import { errorResponse, ok } from '@/lib/api-helpers';
import type { Currency } from '@/types/platform';

export const dynamic = 'force-dynamic';

let stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe = new Stripe(key);
  return stripe;
}

// POST { orderId } — create a Stripe PaymentIntent priced from the ORDER on the
// server (never a client amount). TEST MODE. Metadata carries order_id + kind.
export async function POST(req: NextRequest) {
  try {
    const client = getStripe();
    if (!client) return errorResponse(new Error('Stripe is not configured'));
    const { orderId } = await req.json();
    if (!orderId) return errorResponse(new Error('orderId is required'));

    const order = await getOrder(orderId);
    if (!order) return errorResponse(new (await import('@/lib/repos/db')).NotFoundError('Order'));
    if (!['pending_payment', 'payment_failed'].includes(order.status)) {
      return ok({ error: `Order not payable in status: ${order.status}` }, 409);
    }

    const amount = toMinorUnits(Number(order.total), order.currency as Currency);
    if (amount <= 0) return errorResponse(new Error('Order total is invalid'));

    const intent = await client.paymentIntents.create({
      amount,
      currency: (order.currency as string).toLowerCase(),
      receipt_email: order.customer_email || undefined,
      metadata: { order_id: order.id, kind: 'platform' },
      automatic_payment_methods: { enabled: true },
    });
    return ok({ clientSecret: intent.client_secret });
  } catch (err) { return errorResponse(err); }
}

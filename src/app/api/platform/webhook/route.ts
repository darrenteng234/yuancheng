import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { recordPaymentSucceeded } from '@/lib/repos/orders';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// POST — Stripe webhook for PLATFORM orders. Verifies signature, then records the
// payment + allocation and advances the order to paid (idempotent, no-downgrade).
export async function POST(request: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[platform webhook] Stripe not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') || '';
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[platform webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.metadata?.kind === 'platform' && pi.metadata?.order_id) {
        await recordPaymentSucceeded(pi.metadata.order_id, pi.id);
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.warn(`[platform webhook] payment failed for order ${pi.metadata?.order_id}`);
    }
  } catch (err) {
    console.error('[platform webhook] handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

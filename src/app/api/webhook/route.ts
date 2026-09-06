// Run: pnpm add stripe

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null as any;

export async function POST(request: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] Stripe not configured (missing secret key or webhook secret)");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Read order id from PaymentIntent metadata. The intent is created with
  // metadata.order_id, so read that (fall back to legacy orderId just in case).
  function orderIdOf(pi: Stripe.PaymentIntent): string | undefined {
    return pi.metadata?.order_id || pi.metadata?.orderId;
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = orderIdOf(pi);
      if (orderId && supabaseAdmin) {
        // Idempotent + no-downgrade: only advance an order that is still awaiting
        // payment. A duplicate or delayed webhook must not revert an order that an
        // admin/runner has already progressed (in_progress, in_review, completed…).
        const { data, error } = await supabaseAdmin
          .from("orders")
          .update({ status: "paid", payment_intent_id: pi.id })
          .eq("id", orderId)
          .in("status", ["unassigned", "paid"])
          .select("id");
        if (error) {
          console.error(`[webhook] Failed to mark order ${orderId} paid:`, error.message);
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }
        if (data && data.length > 0) {
          console.log(`[webhook] Order ${orderId} marked as paid`);
        } else {
          console.log(`[webhook] Order ${orderId} already progressed; no status change`);
        }
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.warn(`[webhook] Payment failed for order ${orderIdOf(pi)}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

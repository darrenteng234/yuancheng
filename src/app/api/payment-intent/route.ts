// Run: pnpm add stripe

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Stripe is lazily initialized to avoid crash when key is missing
let stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe = new Stripe(key);
  return stripe;
}

// ── POST /api/payment-intent — Create a Stripe PaymentIntent ──
export async function POST(request: NextRequest) {
  try {
    const stripeClient = getStripe();
    if (!stripeClient) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }
    const body = await request.json();
    const { orderId, customerEmail } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required." },
        { status: 400 }
      );
    }

    // Verify the order exists
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id, status, selling_price")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: `Order not found: ${orderId}` },
        { status: 404 }
      );
    }

    // Do not create a payment for an order that is already paid or further along.
    if (order.status && !["unassigned", "paid"].includes(order.status)) {
      return NextResponse.json(
        { error: `Order is not payable in status: ${order.status}` },
        { status: 409 }
      );
    }

    // SECURITY: derive the charge amount from the order on the server. Never trust
    // a client-supplied amount — otherwise a customer could pay an arbitrary price.
    const sellingPrice = Number(order.selling_price);
    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      return NextResponse.json(
        { error: "Order has an invalid price and cannot be charged." },
        { status: 400 }
      );
    }
    const amount = Math.round(sellingPrice * 100); // RM → sen
    const currency = "myr";

    // Create the PaymentIntent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency,
      receipt_email: customerEmail || undefined,
      metadata: {
        order_id: orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store the payment_intent_id in the orders table
    // NOTE: Run this SQL to add the column if it doesn't exist:
    // ALTER TABLE orders ADD COLUMN payment_intent_id TEXT;
    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({ payment_intent_id: paymentIntent.id })
      .eq("id", orderId);

    if (updateErr) {
      console.error("Failed to store payment_intent_id:", updateErr);
      // Non-fatal: still return the client secret
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("POST /api/payment-intent error:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

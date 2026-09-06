import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendDisputeNotification, sendOrderStatusUpdate } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── POST /api/orders/[id]/dispute — Create or update a dispute ──
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    const { reason, customer_claim } = body;
    // Admin-only fields: only honored when the caller is an authenticated admin.
    // A public (customer) caller cannot self-resolve a dispute or set a refund.
    const isAdmin = !!(await requireAdmin());
    const resolution = isAdmin ? body.resolution : undefined;
    const refund_amount = isAdmin ? body.refund_amount : undefined;
    const admin_notes = isAdmin ? body.admin_notes : undefined;
    const status = isAdmin ? body.status : undefined;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { error: "Missing required field: reason" },
        { status: 400 }
      );
    }

    // Verify order exists
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, status, customer_id")
      .eq("id", id)
      .single();

    if (orderError) {
      if (orderError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to verify order" },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    // Check if a dispute already exists for this order
    const { data: existingDispute } = await supabaseAdmin
      .from("disputes")
      .select("*")
      .eq("order_id", id)
      .single();

    let dispute;

    if (existingDispute) {
      // Update existing dispute
      const updateData: Record<string, unknown> = {
        reason: reason.trim(),
        updated_at: now,
      };
      if (customer_claim !== undefined) updateData.customer_claim = customer_claim;
      if (resolution !== undefined) updateData.resolution = resolution;
      if (refund_amount !== undefined) updateData.refund_amount = refund_amount;
      if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
      if (status !== undefined) {
        const validStatuses = ["open", "resolved", "escalated"];
        if (!validStatuses.includes(status)) {
          return NextResponse.json(
            { error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}` },
            { status: 400 }
          );
        }
        updateData.status = status;
        if (status === "resolved") {
          updateData.resolved_at = now;
        }
      }

      const { data, error } = await supabaseAdmin
        .from("disputes")
        .update(updateData)
        .eq("id", existingDispute.id)
        .select()
        .single();

      if (error) {
        console.error("PATCH dispute error:", error);
        return NextResponse.json(
          { error: "Failed to update dispute", details: error.message },
          { status: 500 }
        );
      }
      dispute = data;
    } else {
      // Create new dispute
      const validResolutions = ["full_refund", "partial_refund", "redo", "rejected", "pending", null];
      if (resolution !== undefined && !validResolutions.includes(resolution)) {
        return NextResponse.json(
          { error: `Invalid resolution. Must be one of: ${validResolutions.filter(Boolean).join(", ")}` },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("disputes")
        .insert({
          order_id: id,
          customer_id: order.customer_id || null,
          reason: reason.trim(),
          customer_claim: customer_claim || null,
          resolution: resolution || "pending",
          refund_amount: refund_amount ?? 0,
          status: status || "open",
          admin_notes: admin_notes || null,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error("POST dispute error:", error);
        return NextResponse.json(
          { error: "Failed to create dispute", details: error.message },
          { status: 500 }
        );
      }
      dispute = data;

      // Update order status to disputed
      await supabaseAdmin
        .from("orders")
        .update({ status: "disputed", updated_at: now })
        .eq("id", id);
    }

    // Send dispute notification email (non-blocking)
    // Fetch order number and customer email for the notification
    const { data: orderDetails } = await supabaseAdmin
      .from("orders")
      .select("order_number, customers(email)")
      .eq("id", id)
      .single();

    const customerEmail = (orderDetails as unknown as { customers?: { email?: string } })?.customers?.email;
    const orderNumber = (orderDetails as unknown as { order_number?: string })?.order_number || id;

    if (customerEmail) {
      void sendDisputeNotification({
        to: customerEmail,
        orderNumber,
        reason: reason.trim(),
        lang: body.lang || "en",
      });
      // Also send status update for 'disputed' status (non-blocking)
      const { data: orderForStatus } = await supabaseAdmin
        .from("orders")
        .select("temples(name), customers(preferred_language)")
        .eq("id", id)
        .single();
      sendOrderStatusUpdate({
        to: customerEmail,
        orderNumber,
        status: "disputed",
        templeName: ((orderForStatus as unknown as { temples?: { name?: string } })?.temples?.name) || "Unknown Temple",
        lang: (((orderForStatus as unknown as { customers?: { preferred_language?: string } })?.customers?.preferred_language) === "cn" ? "cn" : "en"),
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      dispute,
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    console.error("POST /api/orders/[id]/dispute unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

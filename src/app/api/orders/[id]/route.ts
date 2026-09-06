import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderStatusUpdate, sendRunnerAssignmentEmail } from "@/lib/email";
import { requireAdmin, requireStaff, FORBIDDEN } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── GET /api/orders/[id] — Get a single order ──
export async function GET(
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

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, customers(*), temples(*), packages(*), runners(*)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      console.error("GET /api/orders/[id] error:", error);
      return NextResponse.json(
        { error: "Failed to fetch order", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/orders/[id] unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── PATCH /api/orders/[id] — Update order status, assign runner, etc. ──
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await requireStaff();
    if (!staff) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Prevent updating id or created_at
    delete body.id;
    delete body.created_at;

    // Runners may only modify orders assigned to them, and only a safe subset of
    // fields (status progression + evidence/receipt). Admins have full control.
    if (staff.kind === "runner") {
      const { data: own } = await supabaseAdmin
        .from("orders").select("runner_id").eq("id", id).single();
      if (!own || own.runner_id !== staff.runnerId) return FORBIDDEN();
      const runnerAllowed = ["status", "evidence_submitted", "review_notes", "receipt_amount", "receipt_url"];
      for (const key of Object.keys(body)) {
        if (!runnerAllowed.includes(key)) return FORBIDDEN();
      }
      if (body.status && !["in_progress", "in_review"].includes(body.status)) {
        return FORBIDDEN();
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = [
        "paid", "unassigned", "in_progress", "in_review",
        "completed", "disputed", "refunded", "cancelled",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status: ${body.status}. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validate runner_id if provided
    if (body.runner_id) {
      const { data: runner } = await supabaseAdmin
        .from("runners")
        .select("id")
        .eq("id", body.runner_id)
        .single();
      if (!runner) {
        return NextResponse.json(
          { error: `Runner not found: ${body.runner_id}` },
          { status: 400 }
        );
      }
    }

    // Auto-set timestamps based on status transitions
    const now = new Date().toISOString();
    const updates = { ...body, updated_at: now };

    if (body.status === "completed" && !body.completed_at) {
      updates.completed_at = now;
    }
    if (body.status === "in_review" && !body.reviewed_at) {
      updates.reviewed_at = now;
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select("*, customers(*), temples(*), packages(*), runners(*)")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      console.error("PATCH /api/orders/[id] error:", error);
      return NextResponse.json(
        { error: "Failed to update order", details: error.message },
        { status: 500 }
      );
    }

    // Send status update email when status changed (non-blocking)
    if (body.status) {
      const patchCustomerEmail = (data?.customers as unknown as { email?: string } | null)?.email;
      if (patchCustomerEmail) {
        sendOrderStatusUpdate({
          to: patchCustomerEmail,
          orderNumber: data.order_number,
          status: body.status,
          templeName: (data.temples as unknown as { name?: string } | null)?.name || "Unknown Temple",
          lang: (((data?.customers as unknown as { preferred_language?: string } | null)?.preferred_language) === "cn" ? "cn" : "en"),
        }).catch(console.error);
      }
    }

    // Send runner assignment email when runner_id is set (non-blocking)
    if (body.runner_id) {
      const runnerEmail = (data?.runners as unknown as { email?: string } | null)?.email;
      const patchCustomerEmail2 = (data?.customers as unknown as { email?: string } | null)?.email;
      if (runnerEmail) {
        sendRunnerAssignmentEmail({
          to: runnerEmail,
          orderNumber: data.order_number,
          templeName: (data.temples as unknown as { name?: string } | null)?.name || "Unknown Temple",
          packageName: (data.packages as unknown as { name?: string } | null)?.name || "Standard",
          customerName: (data?.customers as unknown as { name?: string } | null)?.name || patchCustomerEmail2 || "Customer",
          specialInstructions: (data as unknown as { special_instructions?: string })?.special_instructions || "",
          orderId: data.id,
          lang: (((data?.runners as unknown as { preferred_language?: string } | null)?.preferred_language) === "cn" ? "cn" : "en"),
        }).catch(console.error);
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    console.error("PATCH /api/orders/[id] unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/orders/[id] — Delete an order ──
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE /api/orders/[id] error:", error);
      return NextResponse.json(
        { error: "Failed to delete order", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/orders/[id] unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


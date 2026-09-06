import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireStaff, FORBIDDEN } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── GET /api/receipts — List runner receipts ──
export async function GET(request: NextRequest) {
  try {
    if (!(await requireStaff())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const runnerId = searchParams.get("runner_id");
    const orderId = searchParams.get("order_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabaseAdmin
      .from("runner_receipts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (runnerId) {
      query = query.eq("runner_id", runnerId);
    }
    if (orderId) {
      query = query.eq("order_id", orderId);
    }
    if (status) {
      const validStatuses = ["pending", "received", "verified", "rejected"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("GET /api/receipts error:", error);
      return NextResponse.json(
        { error: "Failed to fetch receipts", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      receipts: data || [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET /api/receipts unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST /api/receipts — Create a new runner receipt ──
export async function POST(request: NextRequest) {
  try {
    if (!(await requireStaff())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const required = ["order_id", "runner_id"] as const;
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify order exists
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("id", body.order_id)
      .single();
    if (!order) {
      return NextResponse.json(
        { error: `Order not found: ${body.order_id}` },
        { status: 400 }
      );
    }

    // Verify runner exists
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

    // Validate status if provided
    if (body.status) {
      const validStatuses = ["pending", "received", "verified", "rejected"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status: ${body.status}. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    const insertData = {
      order_id: body.order_id,
      runner_id: body.runner_id,
      product_cost: body.product_cost ?? 0,
      transport_cost: body.transport_cost ?? 0,
      other_cost: body.other_cost ?? 0,
      receipt_url: body.receipt_url || null,
      status: body.status || "pending",
      notes: body.notes || null,
      submitted_at: body.submitted_at || now,
      created_at: now,
    };

    const { data, error } = await supabaseAdmin
      .from("runner_receipts")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("POST /api/receipts error:", error);
      return NextResponse.json(
        { error: "Failed to create receipt", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    console.error("POST /api/receipts unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

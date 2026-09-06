import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "@/lib/email";

export const dynamic = "force-dynamic";

// ── GET /api/orders — List orders with optional filters ──
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const runner = searchParams.get("runner");
    const rawSearch = searchParams.get("search");
    const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Sanitize search: strip characters that could be used for SQL injection via .or()
    const search = rawSearch
      ? rawSearch.replace(/[%_'"\\]/g, "").trim()
      : null;

    // Upper bound validation on limit
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    let query = supabaseAdmin
      .from("orders")
      .select("*, customers(*), temples(*), packages(*), runners(*)", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      if (status === "unassigned") {
        query = query.in("status", ["unassigned", "paid"]);
      } else {
        query = query.eq("status", status);
      }
    }

    if (runner) {
      query = query.eq("runner_id", runner);
    }

    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,customer_name.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("GET /api/orders error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: data || [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET /api/orders unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST /api/orders — Create a new order ──
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const required = ["temple_id", "selling_price"] as const;
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate sequential order number if not provided
    if (!body.order_number) {
      const { data: existingOrders } = await supabaseAdmin
        .from("orders")
        .select("order_number")
        .ilike("order_number", "ORD-%")
        .order("order_number", { ascending: false })
        .limit(1);

      let nextNumber = 1;
      if (existingOrders && existingOrders.length > 0) {
        const lastOrderNumber = existingOrders[0].order_number;
        const match = lastOrderNumber?.match(/^ORD-(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      body.order_number = `ORD-${String(nextNumber).padStart(5, "0")}`;
    }

    // Default status
    if (!body.status) {
      body.status = "unassigned";
    }

    // Validate status is valid
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

    // Validate selling_price is positive
    if (typeof body.selling_price !== "number" || body.selling_price < 0) {
      return NextResponse.json(
        { error: "selling_price must be a non-negative number" },
        { status: 400 }
      );
    }

    // If customer_id provided, verify it exists
    if (body.customer_id) {
      const { data: customer } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("id", body.customer_id)
        .single();
      if (!customer) {
        return NextResponse.json(
          { error: `Customer not found: ${body.customer_id}` },
          { status: 400 }
        );
      }
    }

    // Verify temple exists
    const { data: temple } = await supabaseAdmin
      .from("temples")
      .select("id")
      .eq("id", body.temple_id)
      .single();
    if (!temple) {
      return NextResponse.json(
        { error: `Temple not found: ${body.temple_id}` },
        { status: 400 }
      );
    }

    // Verify package exists if provided, and derive the price from the package
    // on the server. SECURITY: never trust a client-supplied selling_price for a
    // packaged order — otherwise a customer could create a RM1 order and pay RM1.
    if (body.package_id) {
      const { data: pkg } = await supabaseAdmin
        .from("packages")
        .select("id, selling_price")
        .eq("id", body.package_id)
        .single();
      if (!pkg) {
        return NextResponse.json(
          { error: `Package not found: ${body.package_id}` },
          { status: 400 }
        );
      }
      if (pkg.selling_price != null) {
        body.selling_price = Number(pkg.selling_price);
      }
    }

    const now = new Date().toISOString();
    const insertData = {
      ...body,
      evidence_submitted: body.evidence_submitted ?? [],
      updated_at: now,
      created_at: now,
    };

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert(insertData)
      .select("*, customers(*), temples(*), packages(*), runners(*)")
      .single();

    if (error) {
      console.error("POST /api/orders error:", error);
      return NextResponse.json(
        { error: "Failed to create order", details: error.message },
        { status: 500 }
      );
    }

    // Send confirmation email (non-blocking)
    const customerEmail = (data?.customers as unknown as { email?: string } | null)?.email;
    if (customerEmail) {
      const customerLang = (((data?.customers as unknown as { preferred_language?: string } | null)?.preferred_language) === "cn" ? "cn" : "en");
      void sendOrderConfirmation({
        to: customerEmail,
        orderNumber: data.order_number,
        templeName: (data.temples as unknown as { name?: string } | null)?.name || "Unknown Temple",
        packageName: (data.packages as unknown as { name?: string } | null)?.name || "Standard",
        amount: data.selling_price,
        orderId: data.id,
        lang: customerLang,
      });
      // Also send initial status update (non-blocking)
      sendOrderStatusUpdate({
        to: customerEmail,
        orderNumber: data.order_number,
        status: data.status || "unassigned",
        templeName: (data.temples as unknown as { name?: string } | null)?.name || "Unknown Temple",
        lang: customerLang,
      }).catch(console.error);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    console.error("POST /api/orders unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const temple = searchParams.get("temple");
    let query = supabaseAdmin.from("packages").select("*, package_products(*, products(*))").order("name");
    if (temple) query = query.eq("temple_id", temple);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/packages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const body = await req.json();
    const { id, created_at, updated_at, product_ids, ...pkg } = body;
    const { data, error } = await supabaseAdmin.from("packages").insert(pkg).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (product_ids?.length) {
      const rows = product_ids.map((p: { product_id: string; quantity: number }) => ({
        package_id: data.id, product_id: p.product_id, quantity: p.quantity,
      }));
      await supabaseAdmin.from("package_products").insert(rows);
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/packages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const body = await req.json();
    const { id, created_at, updated_at, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("packages").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/packages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/packages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

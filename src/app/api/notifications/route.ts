import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin, requireStaff, FORBIDDEN } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    if (!(await requireStaff())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const { data, error } = await supabaseAdmin.from("notifications").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/notifications error:", err);
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
    // Strip protected fields
    const { id, created_at, updated_at, ...safeBody } = body;
    const { data, error } = await supabaseAdmin.from("notifications").insert(safeBody).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/notifications error:", err);
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
    // Strip id and protected fields from updates
    const { id, created_at, updated_at, ...updates } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("notifications").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

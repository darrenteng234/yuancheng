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
    const key = searchParams.get("key");
    if (key) {
      const { data, error } = await supabaseAdmin.from("settings").select("value").eq("key", key).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data?.value);
    }
    const { data, error } = await supabaseAdmin.from("settings").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/settings error:", err);
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
    const { key, value } = body;
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });
    const { error } = await supabaseAdmin.from("settings").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

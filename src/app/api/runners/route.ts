import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    if (!(await requireAdmin())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const { data, error } = await supabaseAdmin.from("runners").select("*").order("name");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/runners error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const body = await req.json();
    // SECURITY: public registration. Only self-descriptive fields are accepted —
    // status/tier/quality_score are set by the server, so a registrant cannot
    // self-approve as an active/platinum runner (mass-assignment prevention).
    const safeBody: Record<string, unknown> = {
      name: typeof body.name === "string" ? body.name : null,
      phone: typeof body.phone === "string" ? body.phone : null,
      email: typeof body.email === "string" ? body.email : null,
      user_id: typeof body.user_id === "string" ? body.user_id : null,
      status: "probation",   // server-forced
      tier: "bronze",        // server-forced
      quality_score: 50,     // server-forced baseline
      return_rate: 0,
    };
    if (!safeBody.name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    const { data, error } = await supabaseAdmin.from("runners").insert(safeBody).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Create notification for admins about new runner registration
    const runnerName = safeBody.name || 'Unknown';
    const runnerEmail = safeBody.email || 'no email';
    void supabaseAdmin.from("notifications").insert({
      type: 'info',
      message: `New runner registration: ${runnerName} (${runnerEmail})`,
      link: '/admin/dashboard',
      is_read: false,
    }).then(() => {}, (err: Error) => console.error("Failed to create notification:", err));

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/runners error:", err);
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
    const { data, error } = await supabaseAdmin.from("runners").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/runners error:", err);
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
    const { error } = await supabaseAdmin.from("runners").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/runners error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

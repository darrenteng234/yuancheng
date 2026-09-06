import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendRunnerApprovalEmail } from "@/lib/email";
import { requireStaff, FORBIDDEN } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireStaff();
    if (!staff) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const { id } = await params;
    // Runners may only read their own record; admins read any.
    if (staff.kind === "runner" && staff.runnerId !== id) return FORBIDDEN();
    const { data, error } = await supabaseAdmin.from("runners").select("*").eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/runners/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await requireStaff();
    if (!staff) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }
    const { id } = await params;
    // Runners may only edit their own profile, and only safe fields (no self-promotion).
    if (staff.kind === "runner" && staff.runnerId !== id) return FORBIDDEN();
    const body = await req.json();
    // Strip protected fields
    const { id: _id, created_at, updated_at, ...updates } = body;

    // Validate allowed fields — runners get a restricted subset; admins get the full set.
    const allowedFields = staff.kind === "admin"
      ? ['status', 'tier', 'quality_score', 'name', 'phone', 'email', 'return_rate', 'notes']
      : ['name', 'phone', 'email'];
    const sanitizedUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    // Fetch current runner to detect status changes
    const { data: currentRunner } = await supabaseAdmin.from("runners").select("status, email, name").eq("id", id).single();

    const { data, error } = await supabaseAdmin.from("runners").update(sanitizedUpdates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // If status changed from 'probation' to 'active', send congratulatory email
    if (
      currentRunner &&
      currentRunner.status === 'probation' &&
      sanitizedUpdates.status === 'active' &&
      currentRunner.email
    ) {
      void sendRunnerApprovalEmail({
        to: currentRunner.email,
        runnerName: currentRunner.name,
        lang: 'en',
      }).catch((err) => console.error("[email] Failed to send runner approval email:", err));

      // Also send Chinese version
      void sendRunnerApprovalEmail({
        to: currentRunner.email,
        runnerName: currentRunner.name,
        lang: 'cn',
      }).catch((err) => console.error("[email] Failed to send runner approval email (cn):", err));
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/runners/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

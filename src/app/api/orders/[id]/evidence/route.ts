import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderStatusUpdate } from "@/lib/email";
import { requireStaff, FORBIDDEN } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── POST /api/orders/[id]/evidence — Submit evidence and set status to in_review ──
export async function POST(
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

    // Runners may only submit evidence for orders assigned to them.
    if (staff.kind === "runner") {
      const { data: own } = await supabaseAdmin
        .from("orders").select("runner_id").eq("id", id).single();
      if (!own || own.runner_id !== staff.runnerId) return FORBIDDEN();
    }

    const body = await request.json();

    // Validate evidence data
    const { photos, video_urls, notes } = body;

    if (!photos && !video_urls) {
      return NextResponse.json(
        { error: "At least one photo or video URL must be provided" },
        { status: 400 }
      );
    }

    // Build evidence array
    const evidenceItems: unknown[] = [];

    if (photos && Array.isArray(photos)) {
      photos.forEach((photo: string, idx: number) => {
        if (typeof photo === "string" && photo.trim()) {
          evidenceItems.push({
            type: "photo",
            url: photo.trim(),
            index: idx + 1,
            uploaded_at: new Date().toISOString(),
          });
        }
      });
    }

    if (video_urls && Array.isArray(video_urls)) {
      video_urls.forEach((video: string, idx: number) => {
        if (typeof video === "string" && video.trim()) {
          evidenceItems.push({
            type: "video",
            url: video.trim(),
            index: idx + 1,
            uploaded_at: new Date().toISOString(),
          });
        }
      });
    }

    if (evidenceItems.length === 0) {
      return NextResponse.json(
        { error: "No valid evidence URLs provided" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Update order: append evidence, set status to in_review
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        evidence_submitted: evidenceItems,
        status: "in_review",
        review_notes: notes || null,
        reviewed_at: now,
        updated_at: now,
      })
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
      console.error("POST /api/orders/[id]/evidence error:", error);
      return NextResponse.json(
        { error: "Failed to submit evidence", details: error.message },
        { status: 500 }
      );
    }

    // Send status update email for in_review (non-blocking)
    const evidenceCustomerEmail = (data?.customers as unknown as { email?: string } | null)?.email;
    if (evidenceCustomerEmail) {
      sendOrderStatusUpdate({
        to: evidenceCustomerEmail,
        orderNumber: data.order_number,
        status: "in_review",
        templeName: (data.temples as unknown as { name?: string } | null)?.name || "Unknown Temple",
        lang: (((data?.customers as unknown as { preferred_language?: string } | null)?.preferred_language) === "cn" ? "cn" : "en"),
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      order: data,
      evidence_count: evidenceItems.length,
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    console.error("POST /api/orders/[id]/evidence unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

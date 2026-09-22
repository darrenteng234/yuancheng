import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireStaff, FORBIDDEN } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/upload — Upload image to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    if (!(await requireStaff())) return FORBIDDEN();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Sanitize folder: prevent path traversal
    const folder = rawFolder.replace(/\.\.[\\/]/g, "").replace(/[\\/]/g, "-").trim() || "general";

    // Validate file type. Images and video are both valid evidence.
    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const isImage = imageTypes.includes(file.type);
    const isVideo = videoTypes.includes(file.type);
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, WebP, MP4, WebM, or MOV." }, { status: 400 });
    }

    // Per-type size cap: images 5MB, video 50MB.
    const maxBytes = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      const mb = maxBytes / (1024 * 1024);
      return NextResponse.json({ error: `File too large. Max ${mb}MB.` }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${folder}/${timestamp}-${random}.${ext}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from("believer")
      .upload(filename, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed", details: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("believer")
      .getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl }, { status: 201 });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

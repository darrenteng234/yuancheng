import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { sendOrderConfirmation, sendOrderStatusUpdate, sendDisputeNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return FORBIDDEN();
    const body = await request.json();
    const { to, template, data, lang } = body as { to: string; template: string; data: Record<string, unknown>; lang?: "en" | "cn" };

    if (!to || !template) {
      return NextResponse.json({ error: "Missing required fields: to, template" }, { status: 400 });
    }

    const l = lang || "en";

    switch (template) {
      case "order_confirmation":
        await sendOrderConfirmation({
          to,
          orderNumber: (data.orderNumber as string) || "",
          templeName: (data.templeName as string) || "",
          packageName: (data.packageName as string) || "",
          amount: Number(data.amount) || 0,
          orderId: (data.orderId as string) || "",
          lang: l,
        });
        break;
      case "order_status_update":
        await sendOrderStatusUpdate({
          to,
          orderNumber: (data.orderNumber as string) || "",
          status: (data.status as string) || "",
          templeName: (data.templeName as string) || "",
          lang: l,
        });
        break;
      case "dispute_notification":
        await sendDisputeNotification({
          to,
          orderNumber: (data.orderNumber as string) || "",
          reason: (data.reason as string) || "",
          lang: l,
        });
        break;
      default:
        return NextResponse.json({ error: `Invalid template: ${template}` }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.error("POST /api/send-email unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale, OrderStatus } from "@/types/platform";
import { getOrder, getService, getProvider, getPlace, getPackage, money, DEMO_PAYMENT_METHOD } from "@/lib/demo/catalog";
import { OrderStatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { Timeline, EvidenceGallery, PaymentMethodCard, type TimelineStep } from "@/components/order/OrderParts";

// Build the customer timeline from the order status (manual-payment aware).
function buildTimeline(status: string, zh: boolean): TimelineStep[] {
  const order = ["payment_proof_submitted", "paid", "accepted", "in_progress", "evidence_submitted", "completed"];
  const labels: Record<string, string> = zh
    ? { payment_proof_submitted: "付款审核中", paid: "已付款", accepted: "已接单", in_progress: "进行中", evidence_submitted: "已提交凭证", completed: "已完成" }
    : { payment_proof_submitted: "Payment under review", paid: "Paid", accepted: "Accepted", in_progress: "In progress", evidence_submitted: "Evidence submitted", completed: "Completed" };
  const idx = order.indexOf(status === "completed" ? "completed" : status);
  const currentIdx = idx === -1 ? 0 : idx;
  return order.map((k, i) => ({
    label: labels[k],
    state: i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming",
  }));
}

export default async function OrderDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const order = getOrder(id);
  if (!order) notFound();
  const service = getService(order.serviceSlug);
  const provider = getProvider(order.providerSlug);
  const place = service ? getPlace(service.placeSlug) : undefined;
  const pkg = getPackage(order.packageId);
  const isCompleted = order.status === "completed";
  const awaitingVerify = order.status === "payment_proof_submitted";

  return (
    <div className="container section" style={{ maxWidth: 920 }}>
      <Link href={`/${l}/orders`} className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}>
        <ArrowLeft size={15} /> {zh ? "所有订单" : "All orders"}
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
        <div>
          <div className="order-row-num" style={{ marginBottom: 4 }}>{order.order_number}</div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 600 }}>{service?.name}</h1>
          <div className="text-muted" style={{ marginTop: 4 }}>{provider?.name}{place ? ` · ${place.name}` : ""}</div>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} locale={l} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-8)", alignItems: "start" }} className="order-detail-grid">
        {/* Left: details */}
        <div>
          <div className="checkout-step">
            <h2>{zh ? "订单详情" : "Order details"}</h2>
            <dl className="pay-method-grid">
              <div><dt>{zh ? "套餐" : "Package"}</dt><dd>{pkg?.name}</dd></div>
              <div><dt>{zh ? "金额" : "Amount"}</dt><dd>{money(order.amount, order.currency)}</dd></div>
              <div><dt>{zh ? "下单日期" : "Created"}</dt><dd>{formatDate(order.created_at)}</dd></div>
              <div><dt>{zh ? "代办" : "Fulfilment"}</dt><dd>{zh ? "服务商代办" : "Provider"}</dd></div>
            </dl>
            <div style={{ marginTop: "var(--space-4)" }}>
              <dt style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{zh ? "您的请求" : "Your request"}</dt>
              <p style={{ marginTop: 6, color: "var(--color-text-secondary)" }}>{order.customer_request}</p>
            </div>
          </div>

          {/* Manual payment */}
          <div className="checkout-step">
            <h2>{zh ? "付款" : "Payment"}</h2>
            <PaymentMethodCard method={DEMO_PAYMENT_METHOD} locale={l} />
            {awaitingVerify ? (
              <div className="banner-review" style={{ marginTop: "var(--space-4)" }}>
                {zh ? "付款凭证已提交，等待服务商核实。上传收据不代表已核实付款。"
                    : "Payment proof submitted — awaiting provider verification. Uploading a receipt does not mean payment is verified."}
              </div>
            ) : null}
          </div>

          {/* Evidence */}
          <div className="checkout-step">
            <h2>{zh ? "完成凭证" : "Completion evidence"}</h2>
            <EvidenceGallery items={order.evidence} locale={l} />
          </div>
        </div>

        {/* Right: timeline */}
        <aside className="checkout-summary">
          <h3 style={{ fontWeight: 600, marginBottom: "var(--space-5)" }}>{zh ? "进度" : "Progress"}</h3>
          <Timeline steps={buildTimeline(order.status, zh)} />
          {isCompleted ? (
            <div style={{ marginTop: "var(--space-5)", padding: "var(--space-4)", background: "var(--color-success-bg)", color: "var(--color-success)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 500 }}>
              {zh ? "此订单已完成，凭证已备妥。" : "This order is complete and evidence is available."}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

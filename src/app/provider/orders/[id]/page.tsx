"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Receipt, Upload, ShieldCheck, UserCog } from "lucide-react";
import type { OrderStatus } from "@/types/platform";
import { orderActions } from "@/lib/domain/order";
import { statusLabel, statusTone } from "@/lib/status";
import { getOrder, getService, getPackage, getPlace, money, DEMO_PAYMENT_METHOD } from "@/lib/demo/catalog";
import { Timeline, EvidenceGallery, PaymentMethodCard, type TimelineStep } from "@/components/order/OrderParts";
import { NotFoundState } from "@/components/ui";

const ROLE = "provider_owner" as const;

function timeline(status: OrderStatus): TimelineStep[] {
  const seq: OrderStatus[] = ["payment_proof_submitted", "paid", "accepted", "in_progress", "evidence_submitted", "completed"];
  const labels: Record<string, string> = {
    payment_proof_submitted: "Payment proof submitted", paid: "Payment verified", accepted: "Accepted",
    in_progress: "Fulfilment started", evidence_submitted: "Evidence submitted", completed: "Completed",
  };
  let idx = seq.indexOf(status);
  if (status === "payment_failed" || status === "pending_payment") idx = -1;
  if (status === "refund_requested" || status === "refund_confirmed" || status === "cancelled") idx = 1;
  return seq.map((k, i) => ({ label: labels[k], state: i < idx ? "done" : i === idx ? "current" : "upcoming" }));
}

export default function ProviderOrderDetail() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const base = getOrder(id);
  const [status, setStatus] = React.useState<OrderStatus>(base?.status ?? "paid");
  const [evidence, setEvidence] = React.useState(base?.evidence ?? []);
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState("");

  if (!base) return <div className="container section"><NotFoundState title="Order not found" href="/provider/orders" cta="Back to orders" /></div>;

  const service = getService(base.serviceSlug);
  const pkg = getPackage(base.packageId);
  const place = service ? getPlace(service.placeSlug) : undefined;
  const actions = orderActions(status, ROLE);

  function act(to: OrderStatus) {
    if (to === "payment_failed") { setRejecting(true); return; }
    if (to === "evidence_submitted" && evidence.length === 0) {
      // simulate evidence capture for the demo
      setEvidence([{ type: "photo", url: "https://picsum.photos/seed/prov1/800/600", label: "Fulfilment photo" }]);
    }
    setStatus(to);
  }

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "var(--space-6)" }}>
      <Link href="/provider/orders" className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}>
        <ArrowLeft size={15} /> Orders
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
        <div>
          <div className="order-row-num">{base.order_number}</div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{service?.name}</h1>
          <div className="text-muted">{base.customer_name} · {money(base.amount, base.currency)}</div>
        </div>
        <span className={`sbadge sbadge--${statusTone(status)}`}>{statusLabel(status)}</span>
      </div>

      <div className="order-detail-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        <div>
          {/* Customer request */}
          <div className="checkout-step">
            <h2>Customer request</h2>
            <p style={{ color: "var(--color-text-secondary)" }}>{base.customer_request}</p>
          </div>

          {/* Package */}
          <div className="checkout-step">
            <h2>Package</h2>
            <dl className="pay-method-grid">
              <div><dt>Package</dt><dd>{pkg?.name}</dd></div>
              <div><dt>Amount</dt><dd>{money(base.amount, base.currency)}</dd></div>
              {place ? <div><dt>Place</dt><dd>{place.name}</dd></div> : null}
              <div><dt>Fulfilment</dt><dd>Provider</dd></div>
            </dl>
          </div>

          {/* Payment */}
          <div className="checkout-step">
            <h2><Receipt size={18} /> Payment</h2>
            {status === "payment_proof_submitted" ? (
              <>
                <div className="banner-review" style={{ marginBottom: "var(--space-4)" }}>
                  Payment proof submitted — awaiting your verification. A receipt upload does not mean payment is verified.
                </div>
                <div className="proof-receipt"><Upload size={16} /> receipt-{base.order_number}.jpg · uploaded {base.created_at}</div>
                {rejecting ? (
                  <div style={{ marginTop: "var(--space-4)" }}>
                    <label className="form-label">Rejection reason</label>
                    <textarea className="form-input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. amount does not match" />
                    <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
                      <button className="btn btn-sm btn-danger" disabled={!reason.trim()} onClick={() => { setStatus("payment_failed"); setRejecting(false); }}>Confirm reject</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setRejecting(false)}>Cancel</button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : status === "payment_failed" ? (
              <div className="banner-review" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>Proof rejected. The customer can upload a new receipt.</div>
            ) : (
              <div className="sbadge sbadge--success" style={{ marginBottom: "var(--space-4)" }}><ShieldCheck size={14} /> Payment verified</div>
            )}
            <div style={{ marginTop: "var(--space-4)" }}><PaymentMethodCard method={DEMO_PAYMENT_METHOD} /></div>
          </div>

          {/* Fulfillment */}
          <div className="checkout-step">
            <h2><UserCog size={18} /> Fulfilment</h2>
            <dl className="pay-method-grid">
              <div><dt>Assignment</dt><dd>Provider</dd></div>
              <div><dt>Evidence required</dt><dd>{pkg?.evidence === "photo_video" ? "Photo + video" : pkg?.evidence === "photo" ? "Photo" : "None"}</dd></div>
            </dl>
          </div>

          {/* Evidence */}
          <div className="checkout-step">
            <h2>Completion evidence</h2>
            <EvidenceGallery items={evidence} />
          </div>
        </div>

        {/* Right: actions + timeline */}
        <aside className="checkout-summary">
          <h3 style={{ fontWeight: 600, marginBottom: "var(--space-4)" }}>Next action</h3>
          {actions.length === 0 ? (
            <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>No further action — this order is {statusLabel(status).toLowerCase()}.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {actions.map((a) => (
                <button key={a.to} className={`btn btn-full ${a.kind === "danger" ? "btn-secondary" : "btn-primary"}`} onClick={() => act(a.to)}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ marginTop: "var(--space-6)" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "var(--space-4)" }}>Progress</h3>
            <Timeline steps={timeline(status)} />
          </div>
          <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-5)" }}>Demo: actions update this screen only (not persisted).</p>
        </aside>
      </div>
    </div>
  );
}

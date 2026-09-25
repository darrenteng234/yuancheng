"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Receipt, ShieldCheck, UserCog, X, ZoomIn } from "lucide-react";
import type { OrderStatus } from "@/types/platform";
import { orderActions } from "@/lib/domain/order";
import { statusLabel, statusTone } from "@/lib/status";
import { formatMoney, formatDateTime } from "@/lib/format";
import { getOrder, getService, getPackage, getPlace, DEMO_PAYMENT_METHOD } from "@/lib/demo/catalog";
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
  const done = status === "completed" ? seq.length : idx;
  return seq.map((k, i) => ({ label: labels[k], state: i < done ? "done" : i === idx ? "current" : "upcoming" }));
}

export default function ProviderOrderDetail() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const base = getOrder(id);
  const [status, setStatus] = React.useState<OrderStatus>(base?.status ?? "paid");
  const [evidence, setEvidence] = React.useState(base?.evidence ?? []);
  const [dialog, setDialog] = React.useState<null | "cantfulfil" | "reject">(null);
  const [reason, setReason] = React.useState("");
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [zoom, setZoom] = React.useState(false);
  const keepBtn = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => { if (dialog) keepBtn.current?.focus(); }, [dialog]);
  React.useEffect(() => {
    if (!receiptOpen && !dialog) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setReceiptOpen(false); setDialog(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [receiptOpen, dialog]);

  if (!base) return <div style={{ padding: "var(--space-6)" }}><NotFoundState title="Order not found" href="/provider/orders" cta="Back to orders" /></div>;

  const service = getService(base.serviceSlug);
  const pkg = getPackage(base.packageId);
  const place = service ? getPlace(service.placeSlug) : undefined;
  const actions = orderActions(status, ROLE);
  const primary = actions.find((a) => a.kind === "primary") ?? null;
  const danger = actions.find((a) => a.kind === "danger") ?? null;
  const money = formatMoney(base.amount, base.currency);

  function runPrimary(to: OrderStatus) {
    if (to === "evidence_submitted" && evidence.length === 0) {
      setEvidence([{ type: "photo", url: "https://picsum.photos/seed/prov1/800/600", label: "Fulfilment photo" }]);
    }
    setStatus(to);
  }
  function confirmDialog(to: OrderStatus) {
    if (!reason.trim()) return;
    setStatus(to); setDialog(null); setReason("");
  }

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 940, margin: "0 auto", paddingBottom: "96px" }}>
      <Link href="/provider/orders" className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}>
        <ArrowLeft size={15} /> Orders
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
        <div>
          <div className="order-row-num">{base.order_number}</div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{service?.name}</h1>
          <div className="text-muted">{base.customer_name} · {money}</div>
        </div>
        <span className={`sbadge sbadge--${statusTone(status)}`}>{statusLabel(status)}</span>
      </div>

      <div className="order-detail-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        <div>
          <div className="checkout-step">
            <h2>Customer request</h2>
            <p style={{ color: "var(--color-text-secondary)" }}>{base.customer_request}</p>
          </div>

          <div className="checkout-step">
            <h2>Package</h2>
            <dl className="pay-method-grid">
              <div><dt>Package</dt><dd>{pkg?.name}</dd></div>
              <div><dt>Amount</dt><dd>{money}</dd></div>
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
                <div className="receipt-row">
                  <button className="receipt-thumb" onClick={() => setReceiptOpen(true)} aria-label="Open receipt">
                    <img src="/demo/receipt-ord-a.svg" alt="Payment receipt thumbnail" />
                    <span className="receipt-thumb-zoom"><ZoomIn size={16} /></span>
                  </button>
                  <dl className="pay-method-grid" style={{ flex: 1 }}>
                    <div><dt>Amount due</dt><dd>{money}</dd></div>
                    <div><dt>Uploaded</dt><dd>{formatDateTime(base.created_at + "T10:32:00")}</dd></div>
                    <div><dt>Method</dt><dd>{DEMO_PAYMENT_METHOD.bank_name}</dd></div>
                    <div><dt>Reference</dt><dd>{base.order_number}</dd></div>
                  </dl>
                </div>
                <p className="text-muted" style={{ fontSize: "var(--text-sm)", marginTop: "var(--space-3)" }}>
                  Check in your bank app: amount {money}, reference {base.order_number}.
                </p>
              </>
            ) : status === "payment_failed" ? (
              <div className="banner-review" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>Receipt rejected. The customer can upload a new receipt.</div>
            ) : (
              <div className="sbadge sbadge--success" style={{ marginBottom: "var(--space-4)" }}><ShieldCheck size={14} /> Payment verified</div>
            )}
            <div style={{ marginTop: "var(--space-4)" }}><PaymentMethodCard method={DEMO_PAYMENT_METHOD} /></div>
          </div>

          <div className="checkout-step">
            <h2><UserCog size={18} /> Fulfilment</h2>
            <dl className="pay-method-grid">
              <div><dt>Assignment</dt><dd>Provider</dd></div>
              <div><dt>Evidence required</dt><dd>{pkg?.evidence === "photo_video" ? "Photo + video" : pkg?.evidence === "photo" ? "Photo" : "None"}</dd></div>
            </dl>
          </div>

          <div className="checkout-step">
            <h2>Completion evidence</h2>
            <EvidenceGallery items={evidence} />
          </div>
        </div>

        {/* Right: actions + timeline */}
        <aside className="checkout-summary">
          <h3 style={{ fontWeight: 600, marginBottom: "var(--space-4)" }}>Next action</h3>
          {!primary && !danger ? (
            <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>No further action — this order is {statusLabel(status).toLowerCase()}.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {primary ? <button className="btn btn-primary btn-full action-inline-primary" onClick={() => runPrimary(primary.to)}>{primary.label}</button> : null}
              {danger ? <button className="btn btn-secondary btn-full" onClick={() => setDialog(danger.to === "payment_failed" ? "reject" : "cantfulfil")}>{danger.label}</button> : null}
            </div>
          )}
          <div style={{ marginTop: "var(--space-6)" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "var(--space-4)" }}>Progress</h3>
            <Timeline steps={timeline(status)} />
          </div>
          <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-5)" }}>Demo: actions update this screen only (not persisted).</p>
        </aside>
      </div>

      {/* Sticky primary action (mobile only) */}
      {primary ? (
        <div className="order-actionbar">
          <button className="btn btn-primary btn-full" onClick={() => runPrimary(primary.to)}>{primary.label}</button>
        </div>
      ) : null}

      {/* Receipt full-screen viewer */}
      {receiptOpen ? (
        <div className="receipt-overlay" onClick={() => { setReceiptOpen(false); setZoom(false); }}>
          <div className="receipt-overlay-inner" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-overlay-bar">
              <span>Payment receipt</span>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setZoom((z) => !z)}><ZoomIn size={15} /> {zoom ? "1×" : "2×"}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setReceiptOpen(false); setZoom(false); }} aria-label="Close"><X size={15} /></button>
              </div>
            </div>
            <div className="receipt-overlay-scroll">
              <img src="/demo/receipt-ord-a.svg" alt="Payment receipt" style={{ width: zoom ? "200%" : "100%", maxWidth: zoom ? "none" : "480px" }} />
            </div>
            <p className="receipt-overlay-note">Check in your bank app: amount {money}, reference {base.order_number}.</p>
          </div>
        </div>
      ) : null}

      {/* Confirm dialogs */}
      {dialog ? (
        <div className="dialog-overlay" onClick={() => setDialog(null)}>
          <div className="dialog-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            {dialog === "cantfulfil" ? (
              <>
                <h3>Can’t fulfil this order?</h3>
                <p>The order will move to <strong>Refund requested</strong>. You will refund the customer {money} directly. Yuancheng does not hold or transfer money.</p>
              </>
            ) : (
              <>
                <h3>Reject receipt?</h3>
                <p>The customer will be asked to upload a new receipt.</p>
              </>
            )}
            <label className="form-label" style={{ marginTop: "var(--space-4)" }}>Reason</label>
            <textarea className="form-input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
              <button ref={keepBtn} className="btn btn-secondary btn-sm" onClick={() => { setDialog(null); setReason(""); }}>
                {dialog === "cantfulfil" ? "Keep order" : "Cancel"}
              </button>
              <button className="btn btn-danger btn-sm" disabled={!reason.trim()} onClick={() => confirmDialog(dialog === "cantfulfil" ? "refund_requested" : "payment_failed")}>
                {dialog === "cantfulfil" ? "Yes, start refund" : "Reject receipt"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

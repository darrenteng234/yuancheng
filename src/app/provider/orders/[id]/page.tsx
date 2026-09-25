"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Receipt, ShieldCheck, UserCog, X, ZoomIn } from "lucide-react";
import type { OrderStatus } from "@/types/platform";
import { orderActions, type OrderAction } from "@/lib/domain/order";
import { statusLabel, statusTone } from "@/lib/status";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import { getOrder, getService, getPackage, getPlace, DEMO_PAYMENT_METHOD } from "@/lib/demo/catalog";
import { Timeline, EvidenceGallery, PaymentMethodCard, type TimelineStep } from "@/components/order/OrderParts";
import { NotFoundState } from "@/components/ui";
import { useProviderT } from "@/components/layout/ProviderShell";
import { usePortalTitle } from "@/components/layout/PortalShell";
import { fill, type ProviderDict } from "@/lib/i18n/provider";
import { verifyDeadlineLabel, isOverdue, waLink, refundMessage } from "@/lib/demo/contact";

const ROLE = "provider_owner" as const;

function timeline(status: OrderStatus, s: ProviderDict["od"]["steps"]): TimelineStep[] {
  const seq: OrderStatus[] = ["payment_proof_submitted", "paid", "accepted", "in_progress", "evidence_submitted", "completed"];
  const labels: Record<string, string> = {
    payment_proof_submitted: s.proofSubmitted, paid: s.paymentVerified, accepted: s.accepted,
    in_progress: s.fulfilmentStarted, evidence_submitted: s.evidenceSubmitted, completed: s.completed,
  };
  let idx = seq.indexOf(status);
  if (status === "payment_failed" || status === "pending_payment") idx = -1;
  if (status === "refund_requested" || status === "refund_confirmed" || status === "cancelled") idx = 1;
  const done = status === "completed" ? seq.length : idx;
  return seq.map((k, i) => ({ label: labels[k], state: i < done ? "done" : i === idx ? "current" : "upcoming" }));
}

export default function ProviderOrderDetail() {
  const params = useParams();
  const { lang, t } = useProviderT();
  const setPortalTitle = usePortalTitle();
  const od = t.od;
  const A = (a: OrderAction) => od.actions[a.labelKey as keyof typeof od.actions] ?? a.label;
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

  React.useEffect(() => {
    setPortalTitle(base ? `${lang === "zh" ? "订单" : "Order"} ${base.order_number}` : null);
    return () => setPortalTitle(null);
  }, [base, lang, setPortalTitle]);

  if (!base) return <div style={{ padding: "var(--space-6)" }}><NotFoundState title={od.dlg.cancel} href="/provider/orders" cta={od.back} /></div>;

  const service = getService(base.serviceSlug);
  const pkg = getPackage(base.packageId);
  const place = service ? getPlace(service.placeSlug) : undefined;
  const actions = orderActions(status, ROLE);
  const primary = actions.find((a) => a.kind === "primary") ?? null;
  const danger = actions.find((a) => a.kind === "danger") ?? null;
  const money = formatMoney(base.amount, base.currency);
  const evLabel = pkg?.evidence === "photo_video" ? od.photoVideo : pkg?.evidence === "photo" ? od.photo : od.none;
  const uploadedISO = `${base.created_at}T10:32:00+08:00`;
  const overdue = isOverdue(uploadedISO);
  const deadlineLabel = verifyDeadlineLabel(uploadedISO, lang);

  function runPrimary(to: OrderStatus) {
    if (to === "evidence_submitted" && evidence.length === 0) {
      setEvidence([{ type: "photo", url: "https://picsum.photos/seed/prov1/800/600", label: "Fulfilment photo" }]);
    }
    setStatus(to);
  }
  function openDanger() { if (danger) setDialog(danger.to === "payment_failed" ? "reject" : "cantfulfil"); }
  function confirmDialog(to: OrderStatus) { if (!reason.trim()) return; setStatus(to); setDialog(null); setReason(""); }

  const PrimaryBtn = () => primary ? (
    <button className="btn btn-primary btn-full action-inline-primary" onClick={() => runPrimary(primary.to)}>{A(primary)}</button>
  ) : null;
  const DangerText = () => danger ? (
    <button className="btn-textlink-danger" onClick={openDanger}>{A(danger)}</button>
  ) : null;

  const paymentReviewCard = (
    <section className="checkout-step decision-card" key="paymentReview">
      <h2><Receipt size={18} /> {od.paymentReview}</h2>
      <div className="banner-review" style={{ marginBottom: "var(--space-4)" }}>{od.uploadWarn}</div>
      <div className="receipt-row">
        <button className="receipt-thumb" onClick={() => setReceiptOpen(true)} aria-label={od.paymentReceipt}>
          <img src="/demo/receipt-ord-a.svg" alt={od.paymentReceipt} />
          <span className="receipt-thumb-zoom"><ZoomIn size={16} /></span>
        </button>
        <dl className="pay-method-grid" style={{ flex: 1 }}>
          <div><dt>{od.amountDue}</dt><dd>{money}</dd></div>
          <div><dt>{od.reference}</dt><dd>{base.order_number}</dd></div>
          <div><dt>{od.uploaded}</dt><dd>{formatDateTime(base.created_at + "T10:32:00", lang)}</dd></div>
          <div><dt>{od.method}</dt><dd>{DEMO_PAYMENT_METHOD.bank_name}</dd></div>
        </dl>
      </div>
      <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: "var(--space-3) 0 var(--space-3)" }}>
        {fill(od.checkBank, { amount: money, ref: base.order_number })}
      </p>
      <div style={{ marginBottom: "var(--space-4)" }}>
        {overdue
          ? <span className="sbadge sbadge--warning">{od.overdue}</span>
          : <span className="text-muted" style={{ fontSize: "var(--text-sm)" }}>{fill(od.verifyBy, { deadline: deadlineLabel })}</span>}
      </div>
      <PrimaryBtn />
      <div style={{ marginTop: "var(--space-3)", textAlign: "center" }}><DangerText /></div>
    </section>
  );

  const nextActionCard = (
    <section className="checkout-step decision-card" key="nextAction">
      <h2>{od.nextAction}</h2>
      <PrimaryBtn />
      {danger ? <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border)", textAlign: "center" }}><DangerText /></div> : null}
    </section>
  );

  const evidenceActionCard = (
    <section className="checkout-step decision-card" key="evidenceAction">
      <h2>{od.submitEvidenceTitle}</h2>
      <p className="text-muted" style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>{fill(od.requiredLine, { ev: evLabel })}</p>
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setEvidence((e) => [...e, { type: "photo", url: "https://picsum.photos/seed/prov" + e.length + "/800/600", label: "Photo" }])}>{od.addPhoto}</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setEvidence((e) => [...e, { type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", label: "Video" }])}>{od.addVideo}</button>
      </div>
      {evidence.length ? <div style={{ marginBottom: "var(--space-4)" }}><EvidenceGallery items={evidence} locale={lang} disclaimer={false} /></div> : null}
      <PrimaryBtn />
      {danger ? <div style={{ marginTop: "var(--space-3)", textAlign: "center" }}><DangerText /></div> : null}
    </section>
  );

  const statusSummaryCard = (
    <section className="checkout-step decision-card" key="statusSummary">
      <h2>{statusLabel(status, lang)}</h2>
      {primary ? <PrimaryBtn /> : <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>{od.noFurther}</p>}
    </section>
  );

  const refundCard = (
    <section className="checkout-step decision-card" key="refund">
      <h2>{statusLabel(status, lang)}</h2>
      <p className="text-muted" style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>{od.refundInstruction}</p>
      {base.customer_phone ? (
        <a className="btn btn-primary btn-full" href={waLink(base.customer_phone, refundMessage(base.order_number, money, lang))} target="_blank" rel="noreferrer" style={{ marginBottom: "var(--space-3)" }}>
          {fill(od.waCustomer, { name: base.customer_name })}
        </a>
      ) : null}
      <PrimaryBtn />
      <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>{od.refundFooter}</p>
    </section>
  );
  const requestBlock = <section className="checkout-step" key="request"><h2>{od.customerRequest}</h2><p style={{ color: "var(--color-text-secondary)" }}>{base.customer_request}</p></section>;
  const packageBlock = (
    <section className="checkout-step" key="package"><h2>{od.package}</h2>
      <dl className="pay-method-grid">
        <div><dt>{od.package}</dt><dd>{pkg?.name}</dd></div>
        <div><dt>{od.amount}</dt><dd>{money}</dd></div>
        {place ? <div><dt>{od.place}</dt><dd>{place.name}</dd></div> : null}
        <div><dt>{od.fulfilment}</dt><dd>{od.provider}</dd></div>
      </dl>
    </section>
  );
  const fulfilmentBlock = (
    <section className="checkout-step" key="fulfilment"><h2><UserCog size={18} /> {od.fulfilment}</h2>
      <dl className="pay-method-grid">
        <div><dt>{od.assignment}</dt><dd>{od.provider}</dd></div>
        <div><dt>{od.evidenceRequired}</dt><dd>{evLabel}</dd></div>
      </dl>
    </section>
  );
  const progressBlock = <section className="checkout-step" key="progress"><h2>{od.progress}</h2><Timeline steps={timeline(status, od.steps)} /></section>;
  const paymentFullBlock = <section className="checkout-step" key="paymentFull"><h2>{od.paymentDetails}</h2><PaymentMethodCard method={DEMO_PAYMENT_METHOD} locale={lang} /></section>;
  const paymentCollapsedBlock = (
    <section className="checkout-step" key="paymentCollapsed"><h2>{od.payment}</h2>
      <div className="sbadge sbadge--success"><ShieldCheck size={14} /> {fill(od.verifiedSummary, { amount: money, date: formatDate(base.created_at, lang) })}</div>
    </section>
  );
  const evidenceBlock = <section className="checkout-step" key="evidence"><h2>{od.completionEvidence}</h2><EvidenceGallery items={evidence} locale={lang} /></section>;

  let blocks: React.ReactNode[];
  if (status === "payment_proof_submitted") {
    blocks = [paymentReviewCard, requestBlock, packageBlock, progressBlock, paymentFullBlock];
  } else if (status === "payment_failed") {
    blocks = [
      <section className="checkout-step decision-card" key="failed"><h2>{od.paymentIssue}</h2>
        <div className="banner-review" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>{od.receiptRejected}</div>
      </section>,
      requestBlock, packageBlock, progressBlock, paymentFullBlock,
    ];
  } else if (status === "paid" || status === "accepted") {
    blocks = [nextActionCard, requestBlock, packageBlock, fulfilmentBlock, progressBlock, paymentCollapsedBlock];
  } else if (status === "in_progress") {
    blocks = [evidenceActionCard, requestBlock, fulfilmentBlock, progressBlock, paymentCollapsedBlock];
  } else if (status === "refund_requested") {
    blocks = [refundCard, requestBlock, packageBlock, progressBlock, paymentCollapsedBlock];
  } else {
    blocks = [statusSummaryCard, evidenceBlock, progressBlock, requestBlock, packageBlock, fulfilmentBlock, paymentCollapsedBlock];
  }

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 720, margin: "0 auto", paddingBottom: "96px" }}>
      <Link href="/provider/orders" className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}>
        <ArrowLeft size={15} /> {od.back}
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
        <div>
          <div className="order-row-num">{base.order_number}</div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{service?.name}</h1>
          <div className="text-muted">{base.customer_name} · {money}</div>
        </div>
        <span className={`sbadge sbadge--${statusTone(status)}`}>{statusLabel(status, lang)}</span>
      </div>

      {blocks}

      {primary ? (
        <div className="order-actionbar">
          <button className="btn btn-primary btn-full" onClick={() => runPrimary(primary.to)}>{A(primary)}</button>
        </div>
      ) : null}

      {receiptOpen ? (
        <div className="receipt-overlay" onClick={() => { setReceiptOpen(false); setZoom(false); }}>
          <div className="receipt-overlay-inner" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-overlay-bar">
              <span>{od.paymentReceipt}</span>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setZoom((z) => !z)}><ZoomIn size={15} /> {zoom ? "1×" : "2×"}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setReceiptOpen(false); setZoom(false); }} aria-label={od.dlg.cancel}><X size={15} /></button>
              </div>
            </div>
            <div className="receipt-overlay-scroll">
              <img src="/demo/receipt-ord-a.svg" alt={od.paymentReceipt} style={{ width: zoom ? "200%" : "100%", maxWidth: zoom ? "none" : "480px" }} />
            </div>
            <p className="receipt-overlay-note">{fill(od.checkBank, { amount: money, ref: base.order_number })}</p>
          </div>
        </div>
      ) : null}

      {dialog ? (
        <div className="dialog-overlay" onClick={() => setDialog(null)}>
          <div className="dialog-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            {dialog === "cantfulfil" ? (
              <>
                <h3>{od.dlg.cantfulfilTitle}</h3>
                <p>{fill(od.dlg.cantfulfilBody, { amount: money })}</p>
              </>
            ) : (
              <>
                <h3>{od.dlg.rejectTitle}</h3>
                <p>{od.dlg.rejectBody}</p>
              </>
            )}
            <label className="form-label" style={{ marginTop: "var(--space-4)" }}>{od.dlg.reason}</label>
            <textarea className="form-input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
              <button ref={keepBtn} className="btn btn-secondary btn-sm" onClick={() => { setDialog(null); setReason(""); }}>
                {dialog === "cantfulfil" ? od.dlg.keepOrder : od.dlg.cancel}
              </button>
              <button className="btn btn-danger btn-sm" disabled={!reason.trim()} onClick={() => confirmDialog(dialog === "cantfulfil" ? "refund_requested" : "payment_failed")}>
                {dialog === "cantfulfil" ? od.dlg.yesStartRefund : od.dlg.rejectReceipt}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

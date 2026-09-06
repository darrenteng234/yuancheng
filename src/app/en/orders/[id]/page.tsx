"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrder, createDispute } from "@/lib/api";
import type { Order } from "@/types";

const STATUS_BADGE: Record<string, string> = {
  completed: "badge-green", in_progress: "badge-orange", in_review: "badge-brown",
  disputed: "badge-red", paid: "badge-gray", unassigned: "badge-gray",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed", in_progress: "In Progress", in_review: "Under Review",
  disputed: "Disputed", paid: "Paid", unassigned: "Unassigned", refunded: "Refunded", cancelled: "Cancelled",
};

const STEPS = [
  { key: "placed", label: "Order Placed", desc: "Your order has been confirmed" },
  { key: "assigned", label: "Runner Assigned", desc: "A runner is being arranged" },
  { key: "progress", label: "Ritual in Progress", desc: "Runner is at the temple" },
  { key: "review", label: "Evidence Review", desc: "Reviewing submitted evidence" },
  { key: "completed", label: "Completed", desc: "Your prayer has been fulfilled" },
];

function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"; }
function fmtRM(n: number) { return `RM${n.toFixed(2)}`; }

function timelineState(s: string) {
  if (s === "cancelled" || s === "refunded") return { done: [] as string[], active: null };
  if (s === "disputed") return { done: ["placed", "assigned", "progress"], active: "review" };
  const m: Record<string, string[]> = { paid: ["placed"], unassigned: ["placed"], in_progress: ["placed", "assigned"], in_review: ["placed", "assigned", "progress"], completed: ["placed", "assigned", "progress", "review"] };
  const done = m[s] || ["placed"];
  const next = STEPS.find(st => !done.includes(st.key));
  return { done, active: next?.key || null };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeClaim, setDisputeClaim] = useState("");
  const [disputeErr, setDisputeErr] = useState<string | null>(null);
  const [disputeSub, setDisputeSub] = useState(false);
  const [disputeDone, setDisputeDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await getOrder(id);
        if (!d) { setError("Order not found"); return; }
        setOrder(d);
      } catch (e) { setError(e instanceof Error ? e.message : "Failed to load order"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const submitDispute = async () => {
    if (!order || !disputeReason) { setDisputeErr("Please select a reason"); return; }
    setDisputeSub(true); setDisputeErr(null);
    try {
      await createDispute({ order_id: order.id, reason: disputeReason, customer_claim: disputeClaim, status: "open", refund_amount: 0 });
      setDisputeDone(true); setShowDispute(false);
      const u = await getOrder(id); setOrder(u);
    } catch (e) { setDisputeErr(e instanceof Error ? e.message : "Failed to submit dispute"); }
    finally { setDisputeSub(false); }
  };

  if (loading) return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 720, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: "var(--space-4)" }}>🙏</div>
        <p className="text-muted">Loading your order...</p>
      </div>
    </section>
  );

  if (error || !order) return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="alert alert-error"><span>⚠️</span><span>{error || "Order not found"}</span></div>
        <Link href="/en/my-orders" className="btn btn-secondary" style={{ marginTop: "var(--space-4)" }}>← My Orders</Link>
      </div>
    </section>
  );

  const { done, active } = timelineState(order.status);
  const evidence = Array.isArray(order.evidence_submitted) ? order.evidence_submitted : [];
  const showEvidence = (order.status === "in_review" || order.status === "completed") && evidence.length > 0;
  const canDispute = !["disputed", "refunded", "cancelled"].includes(order.status);

  return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <Link href="/en/my-orders" className="btn btn-secondary btn-sm" style={{ marginBottom: "var(--space-5)" }}>← My Orders</Link>

        {/* Header */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)" }}>
              <div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Order Number</div>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--amber-700)", fontFamily: "monospace" }}>
                  #{order.order_number?.slice(0, 8).toUpperCase() || order.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`badge ${STATUS_BADGE[order.status] || "badge-gray"}`}>{STATUS_LABEL[order.status] || order.status}</span>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>{fmtDate(order.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-5)" }}>Order Progress</h3>
            <div className="timeline">
              {STEPS.map(s => (
                <div key={s.key} className={`timeline-item ${done.includes(s.key) ? "completed" : ""} ${active === s.key ? "active" : ""}`}>
                  <div className="timeline-dot">{done.includes(s.key) ? "✓" : active === s.key ? "●" : ""}</div>
                  <div className="timeline-title">{s.label}</div>
                  <div className="timeline-date">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-5)" }}>Order Details</h3>
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="text-muted">Temple</span><span style={{ fontWeight: 600 }}>{order.temple?.name || "—"}</span></div>
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="text-muted">Package</span><span style={{ fontWeight: 600 }}>{order.package?.name || "—"}</span></div>
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="text-muted">Contact</span><span>{order.customer_name || order.customer?.name || "—"}</span></div>
              {order.special_instructions && (<><div className="divider" /><div><span className="text-muted" style={{ display: "block", marginBottom: "var(--space-2)" }}>Special Instructions</span><p style={{ lineHeight: 1.7 }}>{order.special_instructions}</p></div></>)}
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600 }}>Total</span><span style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--amber-700)" }}>{fmtRM(order.selling_price)}</span></div>
            </div>
          </div>
        </div>

        {/* Evidence */}
        {showEvidence && (
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>Evidence</h3>
              <div className="evidence-grid">
                {evidence.map((item, i) => {
                  const url = typeof item === "string" ? item : (item as { url?: string })?.url || "";
                  return url.match(/\.(jpg|jpeg|png|webp|gif)/i) ? (
                    <div key={i} className="evidence-item" style={{ padding: 0, overflow: "hidden" }}>
                      <img src={url} alt={`Evidence ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    </div>
                  ) : (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="evidence-item" style={{ background: "var(--stone-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)" }}>📎 File {i + 1}</a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dispute */}
        {canDispute && !disputeDone && (
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-3)" }}>Have an issue?</h3>
              <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>If you're not satisfied with the service, we can help resolve it.</p>
              <button className="btn btn-warning" onClick={() => setShowDispute(true)}>File Dispute</button>
            </div>
          </div>
        )}

        {disputeDone && (
          <div className="alert alert-info" style={{ marginBottom: "var(--space-5)" }}>
            <span>📋</span><div><strong>Dispute submitted</strong> — We'll review and respond within 24 hours.</div>
          </div>
        )}

        {/* Dispute Modal */}
        {showDispute && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--space-4)" }} onClick={e => { if (e.target === e.currentTarget) setShowDispute(false); }}>
            <div className="card" style={{ width: "100%", maxWidth: 520 }}>
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
                  <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>File a Dispute</h2>
                  <button type="button" onClick={() => setShowDispute(false)} disabled={disputeSub} style={{ fontSize: "var(--text-xl)", color: "var(--color-text-muted)", cursor: "pointer", padding: "var(--space-1)", background: "none", border: "none" }}>✕</button>
                </div>

                {disputeDone ? (
                  <div className="alert alert-success" style={{ marginBottom: "var(--space-4)" }}>
                    <div style={{ fontWeight: 600 }}>Dispute submitted successfully</div>
                    <div style={{ fontSize: "var(--text-sm)" }}>Our team will review and respond soon.</div>
                  </div>
                ) : (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Reason *</label>
                      <select className="form-select" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} disabled={disputeSub}>
                        <option value="">Select a reason...</option>
                        <option value="evidence_unclear">Evidence is unclear</option>
                        <option value="wrong_items">Wrong items used</option>
                        <option value="not_performed">Ritual not performed</option>
                        <option value="quality_issue">Poor evidence quality</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Additional Details</label>
                      <textarea className="form-textarea" placeholder="Describe the issue..." value={disputeClaim} onChange={e => setDisputeClaim(e.target.value)} disabled={disputeSub} rows={4} />
                    </div>
                    {disputeErr && <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}><span>⚠️</span><span>{disputeErr}</span></div>}
                  </div>
                )}

                <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDispute(false)} disabled={disputeSub}>{disputeDone ? "Close" : "Cancel"}</button>
                  {!disputeDone && <button type="button" className="btn btn-primary" onClick={submitDispute} disabled={disputeSub || !disputeReason}>{disputeSub ? "Submitting..." : "Submit Dispute"}</button>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: "var(--space-8)" }} />
      </div>
    </section>
  );
}

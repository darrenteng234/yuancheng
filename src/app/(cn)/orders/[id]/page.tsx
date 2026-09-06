"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrder, createDispute } from "@/lib/api";
import type { Order, Dispute } from "@/types";

function statusBadge(status: string): string {
  switch (status) {
    case "completed": return "badge-green";
    case "in_progress": return "badge-orange";
    case "in_review": return "badge-brown";
    case "disputed": return "badge-red";
    case "paid":
    case "unassigned":
      return "badge-gray";
    default: return "badge-gray";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "completed": return "已完成";
    case "in_progress": return "进行中";
    case "in_review": return "审核中";
    case "disputed": return "争议中";
    case "paid": return "已支付";
    case "unassigned": return "待分配";
    case "refunded": return "已退款";
    case "cancelled": return "已取消";
    default: return status;
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function formatCurrency(amount: number): string {
  return `RM${amount.toFixed(2)}`;
}

const TIMELINE_STEPS = [
  { key: "placed", label: "订单已提交", desc: "您的订单已确认" },
  { key: "assigned", label: "匹配执行人", desc: "正在为您安排执行人" },
  { key: "in_progress", label: "仪式进行中", desc: "执行人正在寺庙为您服务" },
  { key: "review", label: "凭证审核中", desc: "正在审核执行人提交的凭证" },
  { key: "completed", label: "订单完成", desc: "您的祈愿已完成" },
];

function getTimelineStatus(order: Order): { completed: string[]; active: string | null } {
  const status = order.status;
  if (status === "cancelled" || status === "refunded") {
    return { completed: [], active: null };
  }
  if (status === "disputed") {
    return { completed: ["placed", "assigned", "in_progress"], active: "review" };
  }
  const map: Record<string, string[]> = {
    paid: ["placed"],
    unassigned: ["placed"],
    in_progress: ["placed", "assigned"],
    in_review: ["placed", "assigned", "in_progress"],
    completed: ["placed", "assigned", "in_progress", "review"],
  };
  const completed = map[status] || ["placed"];
  const nextStep = TIMELINE_STEPS.find(s => !completed.includes(s.key));
  return { completed, active: nextStep?.key || null };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getOrder(orderId);
        if (!data) {
          setError("订单不存在");
          return;
        }
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载订单失败");
      } finally {
        setLoading(false);
      }
    }
    if (orderId) load();
  }, [orderId]);

  const handleSubmitDispute = async () => {
    if (!order || !disputeReason) return;
    setDisputeSubmitting(true);
    try {
      await createDispute({
        order_id: order.id,
        reason: disputeReason,
        customer_claim: disputeDetails,
        status: "open",
        refund_amount: 0,
      });
      setDisputeSubmitted(true);
      setShowDispute(false);
      // Reload order to reflect disputed status
      const updated = await getOrder(orderId);
      setOrder(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交争议失败");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section style={{ padding: "var(--space-10) 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: "center", padding: "var(--space-12)" }}>
              <div style={{ fontSize: 40, marginBottom: "var(--space-4)" }}>🙏</div>
              <p className="text-muted">正在加载订单详情...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section style={{ padding: "var(--space-10) 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error || "订单不存在"}</span>
          </div>
          <Link href="/my-orders" className="btn btn-secondary" style={{ marginTop: "var(--space-4)" }}>← 我的订单</Link>
        </div>
      </section>
    );
  }

  const { completed, active } = getTimelineStatus(order);
  const evidenceItems = Array.isArray(order.evidence_submitted) ? order.evidence_submitted : [];
  const showEvidence = (order.status === "in_review" || order.status === "completed") && evidenceItems.length > 0;
  const canDispute = order.status !== "disputed" && order.status !== "refunded" && order.status !== "cancelled";

  return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Back link */}
        <Link href="/my-orders" className="btn btn-secondary btn-sm" style={{ marginBottom: "var(--space-5)" }}>← 我的订单</Link>

        {/* Order header */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)" }}>
              <div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>订单编号</div>
                <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--amber-700)", fontFamily: "monospace" }}>
                  #{order.order_number?.slice(0, 8).toUpperCase() || order.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`badge ${statusBadge(order.status)}`}>{statusLabel(order.status)}</span>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                  {formatDate(order.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-5)" }}>订单进度</h3>
            <div className="timeline">
              {TIMELINE_STEPS.map((step) => {
                const isCompleted = completed.includes(step.key);
                const isActive = active === step.key;
                return (
                  <div key={step.key} className={`timeline-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
                    <div className="timeline-dot">{isCompleted ? "✓" : isActive ? "●" : ""}</div>
                    <div className="timeline-title">{step.label}</div>
                    <div className="timeline-date">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-5)" }}>订单详情</h3>
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="text-muted">寺庙</span>
                <span style={{ fontWeight: 600 }}>{order.temple?.name || "—"}</span>
              </div>
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="text-muted">套餐</span>
                <span style={{ fontWeight: 600 }}>{order.package?.name || "—"}</span>
              </div>
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="text-muted">联系人</span>
                <span>{order.customer_name || order.customer?.name || "—"}</span>
              </div>
              {order.special_instructions && (
                <>
                  <div className="divider" />
                  <div>
                    <span className="text-muted" style={{ display: "block", marginBottom: "var(--space-2)" }}>特别指示</span>
                    <p style={{ lineHeight: 1.7 }}>{order.special_instructions}</p>
                  </div>
                </>
              )}
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>总金额</span>
                <span style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--amber-700)" }}>
                  {formatCurrency(order.selling_price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence */}
        {showEvidence && (
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>凭证</h3>
              <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>
                执行人提交的仪式凭证如下：
              </p>
              <div className="evidence-grid">
                {evidenceItems.map((item, i) => {
                  const url = typeof item === "string" ? item : (item as { url?: string })?.url || "";
                  const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
                  return isImage ? (
                    <div key={i} className="evidence-item" style={{ padding: 0, overflow: "hidden" }}>
                      <img src={url} alt={`凭证 ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    </div>
                  ) : (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="evidence-item" style={{ background: "var(--stone-100)", fontSize: "var(--text-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      📎 查看文件 {i + 1}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dispute */}
        {canDispute && !disputeSubmitted && (
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-3)" }}>对订单有疑问？</h3>
              <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>
                如果您对服务有任何不满，我们可以协助处理。
              </p>
              <button className="btn btn-warning" onClick={() => setShowDispute(true)}>提出争议</button>
            </div>
          </div>
        )}

        {disputeSubmitted && (
          <div className="alert alert-info" style={{ marginBottom: "var(--space-5)" }}>
            <span>📋</span>
            <div>
              <strong>争议已提交</strong> — 我们会在24小时内审核您的争议并联系您。
            </div>
          </div>
        )}

        {/* Dispute Modal */}
        {showDispute && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--space-4)" }} onClick={(e) => { if (e.target === e.currentTarget) setShowDispute(false); }}>
            <div className="card" style={{ width: "100%", maxWidth: 520 }}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontWeight: 700 }}>提出争议</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowDispute(false)}>✕</button>
                </div>
                <div className="form-group">
                  <label className="form-label">争议原因 *</label>
                  <select className="form-input" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}>
                    <option value="">请选择原因...</option>
                    <option value="evidence_quality">凭证质量不佳</option>
                    <option value="missing_items">缺少指定物品</option>
                    <option value="wrong_temple">寺庙错误</option>
                    <option value="not_performed">仪式未执行</option>
                    <option value="other">其他原因</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">详细说明</label>
                  <textarea className="form-textarea" style={{ minHeight: 120 }} placeholder="请详细描述您的问题..." value={disputeDetails} onChange={(e) => setDisputeDetails(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary" onClick={() => setShowDispute(false)}>取消</button>
                  <button className="btn btn-warning" onClick={handleSubmitDispute} disabled={disputeSubmitting || !disputeReason}>
                    {disputeSubmitting ? "提交中..." : "提交争议"}
                  </button>
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

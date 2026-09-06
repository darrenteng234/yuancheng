"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getOrders, updateOrder, assignRunner, getRunners, getTemples, getPackages, getCustomers } from "@/lib/api";
import type { Order, Runner, Temple, Package, Customer } from "@/types";

// ── Status badge color mapping ──
function statusBadge(status: string): string {
  switch (status) {
    case "completed":
      return "badge-green";
    case "in_progress":
      return "badge-orange";
    case "in_review":
      return "badge-brown";
    case "disputed":
      return "badge-red";
    case "unassigned":
    case "paid":
      return "badge-gray";
    default:
      return "badge-gray";
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// ── Status filter configuration ──
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "unassigned", label: "Unassigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
];

// ── New Order Modal ──
function NewOrderModal({
  temples,
  packages,
  customers,
  onClose,
  onSubmit,
  loading,
}: {
  temples: Temple[];
  packages: Package[];
  customers: Customer[];
  onClose: () => void;
  onSubmit: (order: Partial<Order>) => Promise<void>;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Order>>({
    temple_id: "",
    package_id: "",
    customer_id: "",
    selling_price: 0,
    customer_name: "",
    customer_phone: "",
    special_instructions: "",
    status: "unassigned",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formData.temple_id) {
      setError("Please select a temple");
      return;
    }
    if (!formData.selling_price || formData.selling_price <= 0) {
      setError("Please enter a valid selling price");
      return;
    }
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" }}
      >
        <div
          className="card-body"
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 700 }}>＋ New Order</h3>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              ✕
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>🚨</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Temple *</label>
            <select
              className="form-input"
              value={formData.temple_id || ""}
              onChange={(e) => handleChange("temple_id", e.target.value)}
            >
              <option value="">Select temple...</option>
              {temples.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city}, {t.country})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Package</label>
            <select
              className="form-input"
              value={formData.package_id || ""}
              onChange={(e) => handleChange("package_id", e.target.value)}
            >
              <option value="">Select package...</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — RM{p.selling_price}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Customer</label>
            <select
              className="form-input"
              value={formData.customer_id || ""}
              onChange={(e) => handleChange("customer_id", e.target.value)}
            >
              <option value="">Walk-in / No account</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-2" style={{ gap: "var(--space-3)" }}>
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Walk-in customer name"
                value={formData.customer_name || ""}
                onChange={(e) => handleChange("customer_name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="+60..."
                value={formData.customer_phone || ""}
                onChange={(e) => handleChange("customer_phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: "var(--space-3)" }}>
            <div className="form-group">
              <label className="form-label">Selling Price (RM) *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.01"
                value={formData.selling_price || ""}
                onChange={(e) => handleChange("selling_price", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={formData.status || "unassigned"}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="unassigned">Unassigned</option>
                <option value="paid">Paid</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
                <option value="disputed">Disputed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Instructions</label>
            <textarea
              className="form-textarea"
              placeholder="Any special notes for the runner..."
              value={formData.special_instructions || ""}
              onChange={(e) => handleChange("special_instructions", e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Assign Runner Modal ──
function AssignRunnerModal({
  runners,
  onClose,
  onAssign,
  loading,
}: {
  runners: Runner[];
  onClose: () => void;
  onAssign: (runnerId: string) => Promise<void>;
  loading: boolean;
}) {
  const [selectedRunnerId, setSelectedRunnerId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const activeRunners = runners.filter((r) => r.status === "active");

  const handleAssign = async () => {
    if (!selectedRunnerId) {
      setError("Please select a runner");
      return;
    }
    setError(null);
    try {
      await onAssign(selectedRunnerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign runner");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 480 }}>
        <div
          className="card-body"
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 700 }}>🏃 Assign Runner</h3>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              ✕
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>🚨</span>
              <span>{error}</span>
            </div>
          )}

          {activeRunners.length === 0 ? (
            <div className="alert alert-warning">
              <span>⚠️</span>
              <span>No active runners available. Add or activate runners first.</span>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Select Runner</label>
              <select
                className="form-input"
                value={selectedRunnerId}
                onChange={(e) => setSelectedRunnerId(e.target.value)}
              >
                <option value="">Choose a runner...</option>
                {activeRunners.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.tier} tier (Quality: {r.quality_score})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={loading || activeRunners.length === 0}
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Evidence Item type ──
interface EvidenceItem {
  type: string;
  url: string;
  index: number;
  uploaded_at: string;
}

// ── Shared Evidence Grid ──
function EvidenceGrid({ evidence, style }: { evidence: EvidenceItem[]; style?: React.CSSProperties }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="evidence-grid" style={style}>
        <div className="evidence-item" style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--stone-400)", fontSize: "var(--text-sm)" }}>
          No evidence submitted
        </div>
      </div>
    );
  }

  const photos = evidence.filter((e) => e.type === "photo" || e.type === "image");
  const videos = evidence.filter((e) => e.type === "video");

  return (
    <>
      <div className="evidence-grid" style={style}>
        {photos.map((item, i) => (
          <div
            key={`photo-${i}`}
            className="evidence-item"
            style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
            onClick={() => setLightboxUrl(item.url)}
          >
            <img
              src={item.url}
              alt={`Evidence photo ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          </div>
        ))}
        {videos.map((item, i) => (
          <a
            key={`video-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="evidence-item"
            style={{
              background: "var(--stone-800)",
              color: "white",
              fontSize: "var(--text-xs)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🎥 Video {videos.length > 1 ? i + 1 : ""}
          </a>
        ))}
      </div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--slate-500)", marginTop: "var(--space-1)" }}>
        {photos.length} photo{photos.length !== 1 ? "s" : ""}{videos.length > 0 ? `, ${videos.length} video${videos.length !== 1 ? "s" : ""}` : ""} uploaded
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <img
            src={lightboxUrl}
            alt="Full size evidence"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "var(--radius-md)" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            style={{
              position: "absolute",
              top: "var(--space-4)",
              right: "var(--space-4)",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

// ── Evidence Review Section ──
function EvidenceReviewSection({
  order,
  onClose,
  onAction,
  loading,
}: {
  order: Order;
  onClose: () => void;
  onAction: (action: "approve" | "return" | "reject", notes: string) => Promise<void>;
  loading: boolean;
}) {
  const [reviewNotes, setReviewNotes] = useState(order.review_notes || "");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const evidenceItems = [
    { key: "photo1", label: "📸 Photo 1: Receipt", checked: true },
    { key: "photo2", label: "📸 Photo 2: Entrance + OVC", checked: true },
    { key: "photo3", label: "📸 Photo 3: Offerings + OVC", checked: true },
    { key: "photo4", label: "📸 Photo 4: Wide shot", checked: true },
    { key: "photo5", label: "📸 Photo 5", checked: false, missing: true },
    { key: "video", label: "🎥 Video: Ritual", checked: true },
    { key: "ovc", label: "🔳 OVC visible 2+", checked: true },
  ];

  const hasIssues = !evidenceItems[4].checked;

  const handleAction = async (action: "approve" | "return" | "reject") => {
    setActionLoading(action);
    try {
      await onAction(action, reviewNotes);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="review-section">
      <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>
        🔎 Evidence Review — Order #{order.order_number || order.id.slice(-4)}
      </h3>
      <div
        className="card"
        style={{ marginBottom: "var(--space-6)", borderLeft: "4px solid var(--color-warning)" }}
      >
        <div className="card-body">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
              <h4 style={{ fontWeight: 600 }}>
                Order #{order.order_number || order.id.slice(-4)} —{" "}
                {order.package?.name || "Package"}
              </h4>
              <p className="text-sm text-muted">
                {order.temple?.name || "Temple"} · Runner: {order.runner?.name || "—"} ·
                Submitted {formatDate(order.updated_at)}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span className="badge badge-orange">Pending Review</span>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          {/* Evidence Checklist */}
          <div
            style={{
              background: "var(--stone-50)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              marginBottom: "var(--space-4)",
            }}
          >
            <h4
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                marginBottom: "var(--space-3)",
              }}
            >
              Evidence Checklist
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-2)",
              }}
            >
              {evidenceItems.map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <input type="checkbox" checked={item.checked} readOnly />
                  {item.missing ? (
                    <span style={{ color: "var(--color-error)" }}>Missing</span>
                  ) : (
                    item.label
                  )}
                </label>
              ))}
            </div>
            {hasIssues && (
              <div
                className="alert alert-warning"
                style={{ marginTop: "var(--space-3)", marginBottom: 0 }}
              >
                <span>⚠️</span>
                <div className="text-sm">
                  <strong>Issue:</strong> Photo 5 missing. Only 4 uploaded (SOP requires 5).
                </div>
              </div>
            )}
          </div>

          {/* Evidence Grid */}
          <EvidenceGrid
            evidence={(order.evidence_submitted || []) as EvidenceItem[]}
            style={{ marginBottom: "var(--space-4)" }}
          />

          {/* Review Notes */}
          <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
            <label className="form-label">Review Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="Any quality notes or issues..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button
              className="btn btn-success"
              onClick={() => handleAction("approve")}
              disabled={loading || actionLoading !== null}
            >
              {actionLoading === "approve" ? "Processing..." : "✓ Approve & Deliver"}
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: "var(--color-warning-bg)",
                color: "var(--terracotta-600)",
              }}
              onClick={() => handleAction("return")}
              disabled={loading || actionLoading !== null}
            >
              {actionLoading === "return" ? "Processing..." : "↩ Return to Runner"}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleAction("reject")}
              disabled={loading || actionLoading !== null}
            >
              {actionLoading === "reject" ? "Processing..." : "✗ Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dispute Resolution Section ──
function DisputeSection({
  order,
  onClose,
  onSubmit,
  loading,
}: {
  order: Order;
  onClose: () => void;
  onSubmit: (resolution: string, notes: string) => Promise<void>;
  loading: boolean;
}) {
  const [resolution, setResolution] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resolutionOptions = [
    {
      value: "full_refund",
      label: "Full Refund",
      amount: `RM${order.selling_price}`,
      description:
        "Customer gets full refund. Runner does not get paid. Use when: evidence is clearly fraudulent or ritual was not performed.",
    },
    {
      value: "partial_refund",
      label: "Partial Refund",
      amount: "RM50-100",
      description:
        "Customer gets partial refund. Runner gets reduced fee. Use when: evidence is acceptable but quality is poor.",
    },
    {
      value: "redo",
      label: "Re-do Service",
      amount: null,
      description:
        "Runner re-performs the ritual at no extra cost to customer. Use when: runner agrees and customer wants re-do.",
    },
    {
      value: "rejected",
      label: "Reject Dispute",
      amount: null,
      description:
        "Evidence meets standards. Dispute is rejected. Use when: evidence is clearly acceptable.",
    },
  ];

  const handleSubmit = async () => {
    if (!resolution) {
      setError("Please select a resolution option");
      return;
    }
    setError(null);
    try {
      await onSubmit(resolution, resolutionNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit resolution");
    }
  };

  return (
    <div id="dispute-section">
      <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>
        ⚖️ Dispute Resolution — Order #{order.order_number || order.id.slice(-4)}
      </h3>
      <div
        className="card"
        style={{ marginBottom: "var(--space-6)", borderLeft: "4px solid var(--color-error)" }}
      >
        <div className="card-body">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
              <h4 style={{ fontWeight: 600 }}>
                Dispute — Order #{order.order_number || order.id.slice(-4)}
              </h4>
              <p className="text-sm text-muted">
                Filed {formatDate(order.updated_at)} ·{" "}
                {order.customer?.name || order.customer_name || "—"} ·{" "}
                {order.temple?.name || "Temple"} · {order.package?.name || "Package"} ·
                RM{order.selling_price}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span className="badge badge-red">Active Dispute</span>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
              <span>🚨</span>
              <span>{error}</span>
            </div>
          )}

          {/* Customer Claim vs Runner Response */}
          <div
            className="grid grid-2"
            style={{ gap: "var(--space-4)", marginBottom: "var(--space-4)" }}
          >
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Customer Claim</h4>
              <div
                style={{
                  background: "var(--stone-50)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <strong>Issue:</strong> Evidence quality is poor
                <br />
                <strong>Details:</strong>{" "}
                <em>
                  "Photos are blurry. Cannot see my name on the OVC. Video only shows 2 faces, not
                  all 4."
                </em>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>
                Runner Submission
              </h4>
              <div
                style={{
                  background: "var(--stone-50)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <strong>{order.runner?.name || "Runner"}:</strong>{" "}
                <em>
                  "Photos were taken in low light. OVC was displayed. Video shows all 4 faces —
                  customer may have missed the transition."
                </em>
              </div>
            </div>
          </div>

          {/* Evidence Review */}
          <div
            style={{
              background: "var(--stone-50)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              marginBottom: "var(--space-4)",
            }}
          >
            <h4 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Evidence Review</h4>
            <EvidenceGrid evidence={(order.evidence_submitted || []) as EvidenceItem[]} />
          </div>

          {/* Resolution Options */}
          <h4 style={{ fontWeight: 600, marginBottom: "var(--space-3)" }}>Resolution Options</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              marginBottom: "var(--space-4)",
            }}
          >
            {resolutionOptions.map((option) => (
              <label
                key={option.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-4)",
                  border:
                    resolution === option.value
                      ? "2px solid var(--color-primary)"
                      : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  background:
                    resolution === option.value ? "var(--color-primary-bg, #f0f4ff)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="resolution"
                  value={option.value}
                  checked={resolution === option.value}
                  onChange={(e) => setResolution(e.target.value)}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {option.label}
                    {option.amount ? ` — ${option.amount}` : ""}
                  </div>
                  <div className="text-sm text-muted">{option.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Resolution Notes */}
          <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
            <label className="form-label">Resolution Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Explain the resolution to both customer and runner..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Resolution"}
            </button>
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Orders Page ──
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrderIdForDispute, setActiveOrderIdForDispute] = useState<string | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, runnersData, templesData, packagesData, customersData] =
        await Promise.all([
          getOrders(),
          getRunners(),
          getTemples(),
          getPackages(),
          getCustomers(),
        ]);
      setOrders(ordersData);
      setRunners(runnersData);
      setTemples(templesData);
      setPackages(packagesData);
      setCustomers(customersData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filtered orders ──
  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== "all" && order.status !== selectedStatus) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const orderNumber = (order.order_number || order.id).toLowerCase();
      const customerName = (order.customer?.name || order.customer_name || "").toLowerCase();
      return orderNumber.includes(query) || customerName.includes(query);
    }
    return true;
  });

  // ── Status counts ──
  const statusCounts = {
    all: orders.length,
    unassigned: orders.filter((o) => o.status === "unassigned" || o.status === "paid").length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    in_review: orders.filter((o) => o.status === "in_review").length,
    completed: orders.filter((o) => o.status === "completed").length,
    disputed: orders.filter((o) => o.status === "disputed").length,
  };

  // ── Create new order ──
  const handleCreateOrder = async (orderData: Partial<Order>) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create order");
      }
      setShowNewOrderModal(false);
      showToast("success", `Order #${result.order_number || result.id.slice(-4)} created`);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  // ── Assign runner ──
  const handleAssignRunner = async (orderId: string, runnerId: string) => {
    setActionLoading(true);
    try {
      await assignRunner(orderId, runnerId);
      setAssigningOrderId(null);
      showToast("success", "Runner assigned successfully");
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign runner";
      showToast("error", msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // ── Review action ──
  const handleReviewAction = async (action: "approve" | "return" | "reject", notes: string) => {
    if (!activeOrderId) return;
    setActionLoading(true);
    try {
      let newStatus: Order["status"];
      switch (action) {
        case "approve":
          newStatus = "completed";
          break;
        case "return":
          newStatus = "in_progress";
          break;
        case "reject":
          newStatus = "disputed";
          break;
      }
      await updateOrder(activeOrderId, { status: newStatus, review_notes: notes });
      setActiveOrderId(null);
      showToast("success", `Order ${action === "approve" ? "approved" : action === "return" ? "returned" : "rejected"}`);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update order";
      showToast("error", msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Dispute submit ──
  const handleDisputeSubmit = async (resolution: string, notes: string) => {
    if (!activeOrderIdForDispute) return;
    setActionLoading(true);
    try {
      // Create/update dispute via API
      const disputeResponse = await fetch(`/api/orders/${activeOrderIdForDispute}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Customer dispute",
          resolution,
          admin_notes: notes,
          status: "resolved",
        }),
      });
      if (!disputeResponse.ok) {
        const errData = await disputeResponse.json();
        throw new Error(errData.error || "Failed to create dispute");
      }

      // Update order status based on resolution
      let newStatus: Order["status"] = "refunded";
      if (resolution === "rejected") newStatus = "completed";
      if (resolution === "redo") newStatus = "in_progress";

      await updateOrder(activeOrderIdForDispute, {
        status: newStatus,
        review_notes: notes,
      });
      setActiveOrderIdForDispute(null);
      showToast("success", "Dispute resolved successfully");
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit resolution";
      showToast("error", msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const activeOrder = activeOrderId ? orders.find((o) => o.id === activeOrderId) : null;
  const activeDisputeOrder = activeOrderIdForDispute
    ? orders.find((o) => o.id === activeOrderIdForDispute)
    : null;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>⏳</div>
          <p className="text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}>
          <span>🚨</span>
          <span>Error loading orders: {error}</span>
        </div>
        <button className="btn btn-primary" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 2000,
            padding: "var(--space-3) var(--space-5)",
            borderRadius: "var(--radius-md)",
            background: toast.type === "success" ? "#16a34a" : "#dc2626",
            color: "white",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toast.type === "success" ? "✓" : "✗"} {toast.message}
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <NewOrderModal
          temples={temples}
          packages={packages}
          customers={customers}
          onClose={() => setShowNewOrderModal(false)}
          onSubmit={handleCreateOrder}
          loading={actionLoading}
        />
      )}

      {/* Assign Runner Modal */}
      {assigningOrderId && (
        <AssignRunnerModal
          runners={runners}
          onClose={() => setAssigningOrderId(null)}
          onAssign={(runnerId) => handleAssignRunner(assigningOrderId, runnerId)}
          loading={actionLoading}
        />
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        {STATUS_FILTERS.map((filter) => (
          <span
            key={filter.key}
            className={`category-pill${selectedStatus === filter.key ? " active" : ""}`}
            onClick={() => setSelectedStatus(filter.key)}
          >
            {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search order #, customer..."
          style={{ minWidth: 200 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => setShowNewOrderModal(true)}
          disabled={actionLoading}
        >
          ＋ New Order
        </button>
      </div>

      {/* Orders Table */}
      <table className="data-table" style={{ marginBottom: "var(--space-6)" }}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Temple/Package</th>
            <th>Runner</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  textAlign: "center",
                  padding: "var(--space-4)",
                  color: "var(--color-text-muted)",
                }}
              >
                No orders found
              </td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>#{order.order_number || order.id.slice(-4)}</strong>
                  <br />
                  <span className="text-xs text-muted">{formatDate(order.created_at)}</span>
                </td>
                <td>{order.customer?.name || order.customer_name || "—"}</td>
                <td>
                  {order.temple?.name || "—"} · {order.package?.name || "—"}
                </td>
                <td>
                  {order.runner?.name ? (
                    order.runner.name
                  ) : (
                    <span className="badge badge-orange" style={{ textTransform: "none" }}>
                      Unassigned
                    </span>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>RM{order.selling_price}</td>
                <td>
                  <span
                    className={`badge ${statusBadge(order.status)}`}
                    style={{ textTransform: "none" }}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </td>
                <td>
                  {(order.status === "unassigned" || order.status === "paid") && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setAssigningOrderId(order.id)}
                      disabled={actionLoading}
                    >
                      Assign
                    </button>
                  )}
                  {order.status === "in_progress" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveOrderId(null)}
                      disabled={actionLoading}
                    >
                      View
                    </button>
                  )}
                  {order.status === "in_review" && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveOrderId(order.id)}
                      disabled={actionLoading}
                    >
                      Review
                    </button>
                  )}
                  {order.status === "completed" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveOrderId(null)}
                      disabled={actionLoading}
                    >
                      View
                    </button>
                  )}
                  {order.status === "disputed" && (
                    <button
                      className="btn btn-sm"
                      style={{
                        background: "var(--color-warning-bg)",
                        color: "var(--terracotta-600)",
                        padding: "var(--space-1) var(--space-3)",
                        fontSize: "var(--text-xs)",
                      }}
                      onClick={() => setActiveOrderIdForDispute(order.id)}
                      disabled={actionLoading}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Evidence Review Section */}
      {activeOrder && activeOrder.status === "in_review" && (
        <EvidenceReviewSection
          order={activeOrder}
          onClose={() => setActiveOrderId(null)}
          onAction={handleReviewAction}
          loading={actionLoading}
        />
      )}

      {/* Dispute Resolution Section */}
      {activeDisputeOrder && activeDisputeOrder.status === "disputed" && (
        <DisputeSection
          order={activeDisputeOrder}
          onClose={() => setActiveOrderIdForDispute(null)}
          onSubmit={handleDisputeSubmit}
          loading={actionLoading}
        />
      )}
    </>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrder, updateOrder, getRunners } from "@/lib/api";
import type { Order, Runner } from "@/types";

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
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// ── Status options ──
const STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "unassigned", label: "Unassigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
  { value: "disputed", label: "Disputed" },
  { value: "refunded", label: "Refunded" },
  { value: "cancelled", label: "Cancelled" },
];

// ── Evidence Item type ──
interface EvidenceItem {
  type: string;
  url: string;
  index: number;
  uploaded_at: string;
}

// ── Evidence Grid with Lightbox ──
function EvidenceGrid({
  evidence,
  style,
}: {
  evidence: EvidenceItem[];
  style?: React.CSSProperties;
}) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="evidence-grid" style={style}>
        <div
          className="evidence-item"
          style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            color: "var(--stone-400)",
            fontSize: "var(--text-sm)",
          }}
        >
          No evidence submitted
        </div>
      </div>
    );
  }

  const photos = evidence.filter(
    (e) => e.type === "photo" || e.type === "image"
  );
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
      <div
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--slate-500)",
          marginTop: "var(--space-1)",
        }}
      >
        {photos.length} photo{photos.length !== 1 ? "s" : ""}
        {videos.length > 0
          ? `, ${videos.length} video${videos.length !== 1 ? "s" : ""}`
          : ""}{" "}
        uploaded
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
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: "var(--radius-md)",
            }}
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

// ── Info Row ──
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-2) 0" }}>
      <span
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          minWidth: 120,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "var(--text-sm)" }}>{value}</span>
    </div>
  );
}

// ── Main Order Detail Page ──
export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedRunnerId, setSelectedRunnerId] = useState("");
  const [showRunnerDropdown, setShowRunnerDropdown] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrder(orderId);
      if (!data) {
        setError("Order not found");
        return;
      }
      setOrder(data);
      setSelectedStatus(data.status);
      setAdminNotes(data.review_notes || "");
      setSelectedRunnerId(data.runner_id || "");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load order";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const fetchRunners = useCallback(async () => {
    try {
      const data = await getRunners();
      setRunners(data);
    } catch {
      // runners fetch is non-critical
    }
  }, []);

  useEffect(() => {
    fetchOrder();
    fetchRunners();
  }, [fetchOrder, fetchRunners]);

  // ── Update status ──
  const handleStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.status) return;
    setSaving(true);
    try {
      const updated = await updateOrder(order.id, { status: newStatus as Order["status"] });
      setOrder(updated);
      setSelectedStatus(updated.status);
      showToast("success", `Status updated to "${newStatus.replace("_", " ")}"`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update status";
      showToast("error", msg);
      setSelectedStatus(order.status);
    } finally {
      setSaving(false);
    }
  };

  // ── Save admin notes ──
  const handleSaveNotes = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await updateOrder(order.id, { review_notes: adminNotes });
      setOrder(updated);
      showToast("success", "Admin notes saved");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save notes";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Assign runner ──
  const handleAssignRunner = async (runnerId: string) => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await updateOrder(order.id, {
        runner_id: runnerId,
        status: order.status === "unassigned" || order.status === "paid" ? "in_progress" : undefined,
      });
      setOrder(updated);
      setSelectedRunnerId(runnerId);
      setShowRunnerDropdown(false);
      showToast("success", "Runner assigned successfully");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to assign runner";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

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
          <div
            style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}
          >
            ⏳
          </div>
          <p className="text-muted">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <div
          className="alert alert-error"
          style={{ marginBottom: "var(--space-4)" }}
        >
          <span>🚨</span>
          <span>Error: {error || "Order not found"}</span>
        </div>
        <Link href="/admin/orders" className="btn btn-secondary">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const activeRunners = runners.filter((r) => r.status === "active");
  const hasRunner = !!order.runner_id;
  const evidenceItems = (order.evidence_submitted || []) as EvidenceItem[];

  return (
    <>
      {/* Toast */}
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

      {/* Back Link */}
      <Link
        href="/admin/orders"
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: "var(--space-5)" }}
      >
        ← Back to Orders
      </Link>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              marginBottom: "var(--space-1)",
            }}
          >
            Order #{order.order_number || order.id.slice(-4)}
          </h1>
          <p className="text-sm text-muted">
            Created {formatDate(order.created_at)}
            {order.completed_at
              ? ` · Completed ${formatDate(order.completed_at)}`
              : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span
            className={`badge ${statusBadge(order.status)}`}
            style={{ textTransform: "none", fontSize: "var(--text-sm)" }}
          >
            {order.status.replace("_", " ")}
          </span>
          <span
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--amber-700)",
            }}
          >
            RM{order.selling_price}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div
        className="grid grid-2"
        style={{ gap: "var(--space-6)", marginBottom: "var(--space-6)" }}
      >
        {/* Left Column — Order Info, Temple, Package, Customer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {/* Order Details Card */}
          <div className="card">
            <div className="card-body">
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-lg)",
                }}
              >
                📋 Order Details
              </h3>
              <InfoRow label="Order #" value={order.order_number || order.id.slice(-4)} />
              <InfoRow
                label="Status"
                value={
                  <span
                    className={`badge ${statusBadge(order.status)}`}
                    style={{ textTransform: "none" }}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                }
              />
              <InfoRow label="Created" value={formatDate(order.created_at)} />
              <InfoRow
                label="Updated"
                value={formatDate(order.updated_at)}
              />
              {order.completed_at && (
                <InfoRow
                  label="Completed"
                  value={formatDate(order.completed_at)}
                />
              )}
              {order.reviewed_at && (
                <InfoRow
                  label="Reviewed"
                  value={formatDate(order.reviewed_at)}
                />
              )}
              <InfoRow label="Amount" value={`RM${order.selling_price}`} />
              {order.special_instructions && (
                <div style={{ marginTop: "var(--space-3)" }}>
                  <span className="text-sm text-muted">Special Instructions</span>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      marginTop: "var(--space-1)",
                      background: "var(--stone-50)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    {order.special_instructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Temple Card */}
          {order.temple && (
            <div className="card">
              <div className="card-body">
                <h3
                  style={{
                    fontWeight: 700,
                    marginBottom: "var(--space-4)",
                    fontSize: "var(--text-lg)",
                  }}
                >
                  ⛩️ Temple
                </h3>
                <InfoRow label="Name" value={order.temple.name} />
                <InfoRow
                  label="Location"
                  value={`${order.temple.city || "—"}, ${order.temple.country || "—"}`}
                />
                {order.temple.address && (
                  <InfoRow label="Address" value={order.temple.address} />
                )}
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`badge ${
                        order.temple.status === "active"
                          ? "badge-green"
                          : "badge-gray"
                      }`}
                      style={{ textTransform: "none" }}
                    >
                      {order.temple.status}
                    </span>
                  }
                />
                <InfoRow
                  label="Verification"
                  value={
                    <span
                      className={`badge ${
                        order.temple.verification_status === "verified"
                          ? "badge-green"
                          : "badge-orange"
                      }`}
                      style={{ textTransform: "none" }}
                    >
                      {order.temple.verification_status}
                    </span>
                  }
                />
                {order.temple.short_description && (
                  <InfoRow
                    label="Description"
                    value={order.temple.short_description}
                  />
                )}
              </div>
            </div>
          )}

          {/* Package Card */}
          {order.package && (
            <div className="card">
              <div className="card-body">
                <h3
                  style={{
                    fontWeight: 700,
                    marginBottom: "var(--space-4)",
                    fontSize: "var(--text-lg)",
                  }}
                >
                  📦 Package
                </h3>
                <InfoRow label="Name" value={order.package.name} />
                {order.package.description && (
                  <InfoRow
                    label="Description"
                    value={order.package.description}
                  />
                )}
                <InfoRow
                  label="Price"
                  value={`RM${order.package.selling_price}`}
                />
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`badge ${
                        order.package.status === "active"
                          ? "badge-green"
                          : "badge-gray"
                      }`}
                      style={{ textTransform: "none" }}
                    >
                      {order.package.status}
                    </span>
                  }
                />
              </div>
            </div>
          )}

          {/* Customer Card */}
          <div className="card">
            <div className="card-body">
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-lg)",
                }}
              >
                👤 Customer
              </h3>
              {order.customer ? (
                <>
                  <InfoRow label="Name" value={order.customer.name} />
                  {order.customer.email && (
                    <InfoRow label="Email" value={order.customer.email} />
                  )}
                  {order.customer.phone && (
                    <InfoRow label="Phone" value={order.customer.phone} />
                  )}
                  <InfoRow
                    label="Segment"
                    value={
                      <span
                        className={`badge ${
                          order.customer.segment === "vip"
                            ? "badge-amber"
                            : "badge-gray"
                        }`}
                        style={{ textTransform: "none" }}
                      >
                        {order.customer.segment}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Total Orders"
                    value={String(order.customer.total_orders)}
                  />
                  <InfoRow
                    label="Total Spent"
                    value={`RM${order.customer.total_spent}`}
                  />
                </>
              ) : (
                <>
                  <InfoRow
                    label="Name"
                    value={order.customer_name || "—"}
                  />
                  {order.customer_phone && (
                    <InfoRow label="Phone" value={order.customer_phone} />
                  )}
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-muted)",
                      marginTop: "var(--space-2)",
                    }}
                  >
                    No registered customer account
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Runner, Actions, Evidence, Dispute */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {/* Status Update Card */}
          <div className="card">
            <div className="card-body">
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-lg)",
                }}
              >
                🔄 Update Status
              </h3>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Order Status</label>
                <select
                  className="form-input"
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={saving}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Runner Card */}
          <div className="card">
            <div className="card-body">
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-lg)",
                }}
              >
                🏃 Runner
              </h3>
              {hasRunner && order.runner ? (
                <>
                  <InfoRow label="Name" value={order.runner.name} />
                  {order.runner.email && (
                    <InfoRow label="Email" value={order.runner.email} />
                  )}
                  {order.runner.phone && (
                    <InfoRow label="Phone" value={order.runner.phone} />
                  )}
                  <InfoRow
                    label="Tier"
                    value={
                      <span
                        className={`badge ${
                          order.runner.tier === "platinum"
                            ? "badge-amber"
                            : order.runner.tier === "gold"
                            ? "badge-orange"
                            : "badge-gray"
                        }`}
                        style={{ textTransform: "none" }}
                      >
                        {order.runner.tier}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Quality Score"
                    value={String(order.runner.quality_score)}
                  />
                  <InfoRow
                    label="Status"
                    value={
                      <span
                        className={`badge ${
                          order.runner.status === "active"
                            ? "badge-green"
                            : "badge-red"
                        }`}
                        style={{ textTransform: "none" }}
                      >
                        {order.runner.status}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Return Rate"
                    value={`${order.runner.return_rate}%`}
                  />
                </>
              ) : (
                <div>
                  <p
                    className="text-sm text-muted"
                    style={{ marginBottom: "var(--space-3)" }}
                  >
                    No runner assigned yet.
                  </p>
                  {showRunnerDropdown ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-3)",
                      }}
                    >
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Select Runner</label>
                        {activeRunners.length === 0 ? (
                          <div className="alert alert-warning">
                            <span>⚠️</span>
                            <span>
                              No active runners available. Add or activate runners
                              first.
                            </span>
                          </div>
                        ) : (
                          <select
                            className="form-input"
                            value={selectedRunnerId}
                            onChange={(e) => setSelectedRunnerId(e.target.value)}
                            disabled={saving}
                          >
                            <option value="">Choose a runner...</option>
                            {activeRunners.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} — {r.tier} tier (Quality:{" "}
                                {r.quality_score})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div
                        style={{ display: "flex", gap: "var(--space-2)" }}
                      >
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAssignRunner(selectedRunnerId)}
                          disabled={saving || !selectedRunnerId || activeRunners.length === 0}
                        >
                          {saving ? "Assigning..." : "Assign Runner"}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowRunnerDropdown(false)}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowRunnerDropdown(true)}
                      disabled={saving}
                    >
                      ＋ Assign Runner
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes Card */}
          <div className="card">
            <div className="card-body">
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-lg)",
                }}
              >
                📝 Admin Notes
              </h3>
              <div className="form-group" style={{ marginBottom: "var(--space-3)" }}>
                <label className="form-label">Review Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Internal notes about this order..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={saving}
                />
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveNotes}
                disabled={saving || adminNotes === (order.review_notes || "")}
              >
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>

          {/* Evidence Card */}
          <div className="card">
            <div className="card-body">
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "var(--space-4)",
                  fontSize: "var(--text-lg)",
                }}
              >
                📸 Evidence Photos
              </h3>
              <EvidenceGrid evidence={evidenceItems} />
            </div>
          </div>

          {/* Dispute Details — only show if status is disputed */}
          {order.status === "disputed" && (
            <div
              className="card"
              style={{ borderLeft: "4px solid var(--color-error)" }}
            >
              <div className="card-body">
                <h3
                  style={{
                    fontWeight: 700,
                    marginBottom: "var(--space-4)",
                    fontSize: "var(--text-lg)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  ⚖️ Dispute Details
                </h3>
                <div
                  className="alert alert-warning"
                  style={{ marginBottom: "var(--space-4)" }}
                >
                  <span>⚠️</span>
                  <div>
                    <strong>This order is under dispute.</strong> Review the
                    evidence and customer claim below. Update the status once
                    resolved.
                  </div>
                </div>

                {/* Customer claim placeholder — would come from joined dispute data */}
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
                      fontWeight: 600,
                      fontSize: "var(--text-sm)",
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    Customer Dispute
                  </h4>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    The customer has raised a concern about this order. Please
                    review the evidence carefully and update the order status
                    once a resolution is reached.
                  </p>
                </div>

                {/* Resolution actions */}
                <h4
                  style={{
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Quick Resolution
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                  }}
                >
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleStatusChange("completed")}
                    disabled={saving}
                  >
                    ✓ Resolve in Favor of Runner (Complete)
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleStatusChange("refunded")}
                    disabled={saving}
                  >
                    💰 Issue Full Refund
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleStatusChange("in_progress")}
                    disabled={saving}
                  >
                    ↩ Request Re-do from Runner
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Section (if order has history) */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <div className="card-body">
          <h3
            style={{
              fontWeight: 700,
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-lg)",
            }}
          >
            📅 Order Timeline
          </h3>
          <div className="timeline">
            <div className="timeline-item completed">
              <div className="timeline-dot">✓</div>
              <div className="timeline-date">
                {formatDate(order.updated_at)}
              </div>
              <div className="timeline-title">
                Order created —{" "}
                {order.temple?.name || "Temple"} /{" "}
                {order.package?.name || "Package"}
              </div>
            </div>
            {hasRunner && (
              <div className="timeline-item completed">
                <div className="timeline-dot">✓</div>
                <div className="timeline-date">
                  {formatDate(order.updated_at)}
                </div>
                <div className="timeline-title">
                  Runner assigned — {order.runner?.name}
                </div>
              </div>
            )}
            {(order.status === "in_progress" ||
              order.status === "in_review" ||
              order.status === "completed" ||
              order.status === "disputed" ||
              order.status === "refunded") && (
              <div
                className={`timeline-item ${
                  order.status === "in_progress" ? "active" : "completed"
                }`}
              >
                <div className="timeline-dot">
                  {order.status === "in_progress" ? "●" : "✓"}
                </div>
                <div className="timeline-date">
                  {formatDateShort(order.updated_at)}
                </div>
                <div className="timeline-title">
                  Fulfillment in progress
                </div>
              </div>
            )}
            {(order.status === "in_review" ||
              order.status === "completed" ||
              order.status === "disputed" ||
              order.status === "refunded") && (
              <div
                className={`timeline-item ${
                  order.status === "in_review" ? "active" : "completed"
                }`}
              >
                <div className="timeline-dot">
                  {order.status === "in_review" ? "●" : "✓"}
                </div>
                <div className="timeline-date">
                  {order.reviewed_at
                    ? formatDateShort(order.reviewed_at)
                    : formatDateShort(order.updated_at)}
                </div>
                <div className="timeline-title">
                  Evidence submitted for review
                </div>
              </div>
            )}
            {order.status === "completed" && order.completed_at && (
              <div className="timeline-item completed">
                <div className="timeline-dot">✓</div>
                <div className="timeline-date">
                  {formatDateShort(order.completed_at)}
                </div>
                <div className="timeline-title">
                  Order completed and delivered
                </div>
              </div>
            )}
            {order.status === "disputed" && (
              <div className="timeline-item active">
                <div className="timeline-dot">!</div>
                <div className="timeline-date">
                  {formatDateShort(order.updated_at)}
                </div>
                <div className="timeline-title">
                  Dispute opened — awaiting resolution
                </div>
              </div>
            )}
            {order.status === "refunded" && (
              <div className="timeline-item completed">
                <div className="timeline-dot">✓</div>
                <div className="timeline-date">
                  {formatDateShort(order.updated_at)}
                </div>
                <div className="timeline-title">Order refunded</div>
              </div>
            )}
            {order.status === "cancelled" && (
              <div className="timeline-item completed">
                <div className="timeline-dot">✗</div>
                <div className="timeline-date">
                  {formatDateShort(order.updated_at)}
                </div>
                <div className="timeline-title">Order cancelled</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Back Link */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <Link href="/admin/orders" className="btn btn-secondary btn-sm">
          ← Back to Orders
        </Link>
      </div>
    </>
  );
}

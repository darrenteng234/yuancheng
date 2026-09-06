"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrder, createReceipt, updateOrder, getReceipts } from "@/lib/api";
import type { Order, RunnerReceipt } from "@/types";

function statusBadge(status: string): string {
  switch (status) {
    case "completed": return "badge-green";
    case "in_progress": return "badge-orange";
    case "in_review": return "badge-brown";
    case "disputed": return "badge-red";
    case "unassigned":
    case "paid":
      return "badge-gray";
    default: return "badge-gray";
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Evidence Upload Form ──
function EvidenceUploadForm({
  orderId,
  onSubmit,
  disabled,
}: {
  orderId: string;
  onSubmit: (photos: File[], video: File | null) => void;
  disabled: boolean;
}) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos(files);
      setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setVideo(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (photos.length === 0) { alert("Please upload at least one photo."); return; }
    onSubmit(photos, video);
  };

  return (
    <div className="card" style={{ marginBottom: "var(--space-6)" }}>
      <div className="card-body">
        <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>📸 Evidence Upload</h3>
        <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>
          Upload photos and video as proof of ritual completion.
        </p>
        <div className="form-group">
          <label className="form-label">Photos (required — minimum 1)</label>
          <input type="file" className="form-input" accept="image/*" multiple onChange={handlePhotoChange} disabled={disabled} />
        </div>
        {previewUrls.length > 0 && (
          <div className="evidence-grid" style={{ marginBottom: "var(--space-4)" }}>
            {previewUrls.map((url, i) => (
              <div key={i} className="evidence-item" style={{ position: "relative", overflow: "hidden" }}>
                <img src={url} alt={`Evidence ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Video (recommended)</label>
          <input type="file" className="form-input" accept="video/*" onChange={handleVideoChange} disabled={disabled} />
        </div>
        {video && (
          <div style={{ background: "var(--stone-50)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", marginBottom: "var(--space-4)", fontSize: "var(--text-sm)" }}>
            🎥 {video.name} ({(video.size / 1024 / 1024).toFixed(1)} MB)
          </div>
        )}
        <button className="btn btn-primary" onClick={handleSubmit} disabled={disabled || photos.length === 0}>
          Submit Evidence
        </button>
      </div>
    </div>
  );
}

// ── Receipt Upload Form ──
function ReceiptUploadForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (data: { productCost: number; transportCost: number; otherCost: number; receiptPhoto: File | null }) => void;
  disabled: boolean;
}) {
  const [productCost, setProductCost] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState<File | null>(null);

  const total = (parseFloat(productCost) || 0) + (parseFloat(transportCost) || 0) + (parseFloat(otherCost) || 0);

  return (
    <div className="card" style={{ marginBottom: "var(--space-6)" }}>
      <div className="card-body">
        <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>🧾 Receipt & Costs</h3>
        <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Product Cost (RM)</label>
            <input type="number" className="form-input" placeholder="0.00" min="0" step="0.01" value={productCost} onChange={(e) => setProductCost(e.target.value)} disabled={disabled} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Transport Cost (RM)</label>
            <input type="number" className="form-input" placeholder="0.00" min="0" step="0.01" value={transportCost} onChange={(e) => setTransportCost(e.target.value)} disabled={disabled} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Other Cost (RM)</label>
            <input type="number" className="form-input" placeholder="0.00" min="0" step="0.01" value={otherCost} onChange={(e) => setOtherCost(e.target.value)} disabled={disabled} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Receipt Photo</label>
            <input type="file" className="form-input" accept="image/*" onChange={(e) => setReceiptPhoto(e.target.files?.[0] || null)} disabled={disabled} />
          </div>
        </div>
        <div style={{ marginTop: "var(--space-4)", padding: "var(--space-4)", background: "var(--amber-50)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Total Reimbursable:</span>
          <span style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--amber-700)" }}>RM{total.toFixed(2)}</span>
        </div>
        <button className="btn btn-secondary" style={{ marginTop: "var(--space-4)" }} onClick={() => onSubmit({ productCost: parseFloat(productCost) || 0, transportCost: parseFloat(transportCost) || 0, otherCost: parseFloat(otherCost) || 0, receiptPhoto })} disabled={disabled}>
          Save Receipt
        </button>
      </div>
    </div>
  );
}

// ── Main Order Detail Page ──
export default function RunnerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [existingReceipt, setExistingReceipt] = useState<RunnerReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // In production, this comes from auth context. Using first runner from DB for now.
  const currentRunnerId = "runner-001";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [orderData, receiptsData] = await Promise.all([
        getOrder(orderId),
        getReceipts(currentRunnerId),
      ]);
      setOrder(orderData);
      setExistingReceipt(receiptsData.find((r) => r.order_id === orderId) || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [orderId, currentRunnerId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Accept Order ──
  const handleAccept = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      await updateOrder(order.id, { status: "in_progress", runner_id: currentRunnerId });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept order");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reject / Decline Order ──
  const handleReject = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to decline this order? It will be returned to the unassigned pool.")) return;
    setSubmitting(true);
    try {
      await updateOrder(order.id, { status: "unassigned", runner_id: undefined });
      router.push("/runner/orders");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to decline order");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit Evidence ──
  const handleSubmitEvidence = async (photos: File[], video: File | null) => {
    if (!order) return;
    setSubmitting(true);
    try {
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fd = new FormData();
        fd.append("file", photo);
        fd.append("folder", "evidence");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Failed to upload photo");
        const data = await res.json();
        photoUrls.push(data.url);
      }
      const videoUrls: string[] = [];
      if (video) {
        const fd = new FormData();
        fd.append("file", video);
        fd.append("folder", "evidence");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Failed to upload video");
        const data = await res.json();
        videoUrls.push(data.url);
      }
      await fetch(`/api/orders/${order.id}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: photoUrls, video_urls: videoUrls }),
      });
      await updateOrder(order.id, { status: "in_review" });
      setSuccess(true);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit evidence");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit Receipt ──
  const handleSubmitReceipt = async (data: { productCost: number; transportCost: number; otherCost: number; receiptPhoto: File | null }) => {
    if (!order) return;
    setSubmitting(true);
    try {
      let receiptPhotoUrl: string | undefined;
      if (data.receiptPhoto) {
        const fd = new FormData();
        fd.append("file", data.receiptPhoto);
        fd.append("folder", "receipts");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Failed to upload receipt photo");
        const uploadData = await res.json();
        receiptPhotoUrl = uploadData.url;
      }
      await createReceipt({
        order_id: order.id,
        runner_id: currentRunnerId,
        product_cost: data.productCost,
        transport_cost: data.transportCost,
        other_cost: data.otherCost,
        status: "pending",
        submitted_at: new Date().toISOString(),
        receipt_url: receiptPhotoUrl,
      });
      alert("Receipt submitted successfully!");
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit receipt");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>⏳</div>
          <p className="text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: "var(--space-6) var(--space-4)" }}>
        <div className="alert alert-error"><span>🚨</span><span>{error || "Order not found"}</span></div>
        <button onClick={() => router.back()} className="btn btn-secondary btn-sm" style={{ marginTop: "var(--space-4)" }}>← Back</button>
      </div>
    );
  }

  const isUnassigned = order.status === "unassigned" || order.status === "paid";
  const isInProgress = order.status === "in_progress";
  const isReviewOrCompleted = order.status === "in_review" || order.status === "completed";

  return (
    <div className="container" style={{ padding: "var(--space-6) var(--space-4)", maxWidth: 800 }}>
      {/* Back Link */}
      <button onClick={() => router.back()} className="btn btn-secondary btn-sm" style={{ marginBottom: "var(--space-4)" }}>
        ← Back to Orders
      </button>

      {/* Success Banner */}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: "var(--space-4)" }}>
          <span>✅</span><span>Evidence submitted successfully! Your order is now under review.</span>
        </div>
      )}

      {/* Order Header */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
                Order #{order.order_number || order.id.split("-").pop()}
              </h2>
              <p className="text-sm text-muted">Created {formatDate(order.created_at)}</p>
            </div>
            <span className={`badge ${statusBadge(order.status)}`} style={{ textTransform: "none", fontSize: "var(--text-sm)" }}>
              {order.status.replace("_", " ")}
            </span>
          </div>

          <div className="divider" />

          <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
            <div>
              <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>Customer</h4>
              <p style={{ fontWeight: 600 }}>{order.customer?.name || order.customer_name || "—"}</p>
              {order.customer_phone && <p className="text-sm text-muted">{order.customer_phone}</p>}
            </div>
            <div>
              <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>Temple</h4>
              <p style={{ fontWeight: 600 }}>{order.temple?.name || "—"}</p>
              {order.temple?.address && <p className="text-sm text-muted">{order.temple.address}</p>}
            </div>
            <div>
              <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>Package</h4>
              <p style={{ fontWeight: 600 }}>{order.package?.name || "—"}</p>
            </div>
            <div>
              <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>Order Amount</h4>
              <p style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--amber-700)" }}>RM{order.selling_price}</p>
            </div>
          </div>

          {order.special_instructions && (
            <>
              <div className="divider" />
              <div>
                <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>Special Instructions</h4>
                <p className="text-sm" style={{ lineHeight: 1.7 }}>{order.special_instructions}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}

      {/* Accept / Decline for unassigned orders */}
      {isUnassigned && (
        <div className="card" style={{ marginBottom: "var(--space-6)", border: "2px solid var(--amber-200)" }}>
          <div className="card-body" style={{ textAlign: "center" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>New Order Available</h3>
            <p className="text-sm text-muted" style={{ marginBottom: "var(--space-5)" }}>
              This order is waiting for a runner. Accept to start working on it.
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={handleReject} disabled={submitting}>
                Decline
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleAccept} disabled={submitting}>
                {submitting ? "Accepting..." : "✓ Accept Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence & Receipt for in_progress orders */}
      {isInProgress && !success && (
        <>
          {/* SOP Steps */}
          {order.package && (
            <div className="card" style={{ marginBottom: "var(--space-6)" }}>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>📋 Steps to Complete</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {[
                    { step: "1", title: "Purchase Offerings", desc: "Buy all required offerings. Keep the receipt." },
                    { step: "2", title: "Arrive at Temple", desc: `Go to ${order.temple?.name || "the temple"}. Take a photo at the entrance with OVC visible.` },
                    { step: "3", title: "Perform Ritual", desc: "Perform the ritual. Take photos of offerings with OVC. Record a video." },
                    { step: "4", title: "Upload Evidence", desc: "Upload all photos and video below. Fill in expenses and submit." },
                  ].map((s) => (
                    <div key={s.step} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--amber-100)", color: "var(--amber-800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "var(--text-sm)", flexShrink: 0 }}>{s.step}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.title}</div>
                        <div className="text-sm text-muted">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <EvidenceUploadForm orderId={order.id} onSubmit={handleSubmitEvidence} disabled={submitting} />
          <ReceiptUploadForm onSubmit={handleSubmitReceipt} disabled={submitting} />
        </>
      )}

      {/* Status info for review/completed */}
      {isReviewOrCompleted && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-body" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: "var(--space-3)" }}>{order.status === "completed" ? "✅" : "🔍"}</div>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>
              {order.status === "completed" ? "Order Completed" : "Under Review"}
            </h3>
            <p className="text-sm text-muted">
              {order.status === "completed"
                ? "This order has been completed and approved."
                : "Your evidence is being reviewed by the admin team."}
            </p>
          </div>
        </div>
      )}

      {/* Disputed */}
      {order.status === "disputed" && (
        <div className="card" style={{ marginBottom: "var(--space-6)", border: "2px solid var(--terracotta-100)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, color: "var(--terracotta-600)", marginBottom: "var(--space-3)" }}>⚠️ This order has been disputed</h3>
            <p className="text-sm text-muted">Please contact the admin team for resolution.</p>
          </div>
        </div>
      )}

      {/* Existing Receipt Info */}
      {existingReceipt && (
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>🧾 Your Receipt</h3>
            <div className="grid grid-2" style={{ gap: "var(--space-3)" }}>
              <div><span className="text-muted">Product Cost:</span> <strong>RM{existingReceipt.product_cost.toFixed(2)}</strong></div>
              <div><span className="text-muted">Transport:</span> <strong>RM{existingReceipt.transport_cost.toFixed(2)}</strong></div>
              <div><span className="text-muted">Other:</span> <strong>RM{existingReceipt.other_cost.toFixed(2)}</strong></div>
              <div><span className="text-muted">Status:</span> <span className={`badge ${existingReceipt.status === "verified" ? "badge-green" : existingReceipt.status === "rejected" ? "badge-red" : "badge-orange"}`}>{existingReceipt.status}</span></div>
            </div>
            {existingReceipt.receipt_url && (
              <a href={existingReceipt.receipt_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: "var(--space-3)" }}>
                📎 View Receipt Photo
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

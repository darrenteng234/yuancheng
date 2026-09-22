"use client";
import React from "react";
import { Card, Button, StatusBadge, Badge, Alert } from "@/components/ui";
import { checkTransition } from "@/lib/domain/order";
import type { Order, OrderStatus, Role } from "@/types/platform";

const ALL_STATUSES: OrderStatus[] = [
  "accepted", "in_progress", "evidence_submitted", "under_review", "completed", "cancelled", "disputed", "refunded",
];
const LABEL: Record<string, string> = {
  accepted: "Accept", in_progress: "Start work", evidence_submitted: "Mark evidence submitted",
  under_review: "Send to review", completed: "Mark completed", cancelled: "Cancel",
  disputed: "Flag dispute", refunded: "Refund",
};

type EvidenceItem = { id?: string; type: string; url: string; label?: string };

export function OrderView({
  order, role, evidence, onTransition, onSubmitEvidence, busy,
}: {
  order: Order;
  role: Role;
  evidence?: EvidenceItem[];
  onTransition: (to: OrderStatus) => void;
  onSubmitEvidence?: (items: EvidenceItem[]) => void;
  busy?: boolean;
}) {
  // Actions available now = legal transitions for this role from current status.
  const actions = ALL_STATUSES.filter((to) => checkTransition(order.status, to, role).ok);
  const canDoEvidence = onSubmitEvidence && role !== "customer" && role !== "guest" &&
    (order.status === "in_progress" || order.status === "accepted");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
          <div>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>Order {order.order_number}</h1>
            <div className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>
              {order.currency} {Number(order.total).toFixed(2)} · {(order.created_at || "").slice(0, 10)}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
        {order.customer_name || order.customer_email ? (
          <div className="text-sm" style={{ marginTop: "var(--space-3)" }}>
            <span className="text-muted">Customer: </span>{order.customer_name || "—"} · {order.customer_email || "—"}
          </div>
        ) : null}
        {order.special_instructions ? (
          <Alert style={{ marginTop: "var(--space-3)" }}>{order.special_instructions}</Alert>
        ) : null}
      </Card>

      {order.items?.length ? (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Items</h3>
          {order.items.map((it) => (
            <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-2) 0", borderTop: "1px solid var(--color-border)" }}>
              <span>{it.sku_name} <Badge tone="gray">×{it.quantity}</Badge></span>
              <span>{order.currency} {Number(it.line_total).toFixed(2)}</span>
            </div>
          ))}
        </Card>
      ) : null}

      {evidence && evidence.length > 0 ? (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Evidence ({evidence.length})</h3>
          <div className="evidence-grid">
            {evidence.map((e, i) => (
              <a key={e.id ?? i} href={e.url} target="_blank" rel="noreferrer" className="evidence-item" title={e.label || e.type}>
                {e.type === "video" ? "🎥" : e.type === "receipt" ? "🧾" : "📷"}
              </a>
            ))}
          </div>
        </Card>
      ) : null}

      {canDoEvidence ? <EvidenceForm onSubmit={(items) => onSubmitEvidence!(items)} busy={busy} /> : null}

      {actions.length > 0 ? (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: "var(--space-3)" }}>Actions</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {actions.map((to) => (
              <Button key={to} size="sm" loading={busy}
                variant={to === "completed" ? "success" : to === "cancelled" || to === "refunded" || to === "disputed" ? "secondary" : "primary"}
                onClick={() => onTransition(to)}>
                {LABEL[to] ?? to}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

/**
 * Evidence upload: uploads image files through /api/upload (validates type/size,
 * blocks path traversal, requires staff auth), collects the returned URLs, then
 * submits them as evidence — moving the order to "evidence submitted".
 */
function EvidenceForm({ onSubmit, busy }: { onSubmit: (items: EvidenceItem[]) => void; busy?: boolean }) {
  const [type, setType] = React.useState("photo");
  const [uploaded, setUploaded] = React.useState<EvidenceItem[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "evidence");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) throw new Error(body.error || `Upload failed (${res.status})`);
      setUploaded((u) => [...u, { type, url: body.url as string }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally { setUploading(false); }
  }

  return (
    <Card>
      <h3 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Submit evidence</h3>
      <p className="text-sm text-muted" style={{ marginBottom: "var(--space-3)" }}>
        Upload photos/receipts (JPG, PNG, WebP · max 5MB) or video (MP4, WebM, MOV · max 50MB). Submitting moves the order to “evidence submitted”.
      </p>
      {error ? <Alert tone="error" style={{ marginBottom: "var(--space-3)" }}>{error}</Alert> : null}

      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
        <select className="form-select" style={{ width: 130 }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="photo">Photo</option><option value="video">Video</option><option value="receipt">Receipt</option>
        </select>
        <label className="btn btn-secondary btn-sm" style={{ cursor: uploading ? "wait" : "pointer" }}>
          {uploading ? "Uploading…" : "Add file"}
          <input type="file" accept={type === "video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp"} hidden disabled={uploading} onChange={onFile} />
        </label>
      </div>

      {uploaded.length > 0 ? (
        <div style={{ marginTop: "var(--space-3)" }}>
          <div className="text-sm text-muted" style={{ marginBottom: "var(--space-2)" }}>{uploaded.length} file(s) ready</div>
          <div className="evidence-grid">
            {uploaded.map((u, i) => (
              <a key={i} href={u.url} target="_blank" rel="noreferrer" className="evidence-item">{u.type === "video" ? "🎥" : u.type === "receipt" ? "🧾" : "📷"}</a>
            ))}
          </div>
          <Button loading={busy} style={{ marginTop: "var(--space-3)" }} onClick={() => onSubmit(uploaded)}>
            Submit {uploaded.length} item(s)
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

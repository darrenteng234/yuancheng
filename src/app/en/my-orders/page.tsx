"use client";

import { useState } from "react";
import { getOrders } from "@/lib/api";
import type { Order } from "@/types";

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
    case "completed": return "Completed";
    case "in_progress": return "In Progress";
    case "in_review": return "Under Review";
    case "disputed": return "Disputed";
    case "paid": return "Paid";
    case "unassigned": return "Unassigned";
    case "refunded": return "Refunded";
    case "cancelled": return "Cancelled";
    default: return status;
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount: number): string {
  return `RM${amount.toFixed(2)}`;
}

export default function MyOrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const allOrders = await getOrders();
      const filtered = allOrders.filter(
        (o) =>
          o.customer?.email?.toLowerCase() === email.toLowerCase() ||
          o.customer_name?.toLowerCase() === email.toLowerCase()
      );
      setOrders(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>My Orders</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-6)" }}>View and track all your orders</p>

        {/* Email search */}
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="card-body">
            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end" }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email to view orders"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                />
              </div>
              <button className="btn btn-primary" onClick={handleSearch} disabled={loading || !email.trim()}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: "var(--space-4)" }}><span>⚠️</span><span>{error}</span></div>}

        {searched && !loading && orders.length === 0 && (
          <div className="card">
            <div className="card-body" style={{ textAlign: "center", padding: "var(--space-10)" }}>
              <div style={{ fontSize: 40, marginBottom: "var(--space-3)" }}>📿</div>
              <p className="text-muted">No orders found for this email address.</p>
              <a href="/en/temples" className="btn btn-primary" style={{ marginTop: "var(--space-4)" }}>Browse Temples</a>
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {orders.map((order) => (
              <a key={order.id} href={`/en/orders/${order.id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
                    <div>
                      <div style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--amber-700)", fontSize: "var(--text-base)" }}>
                        #{order.order_number?.slice(0, 8).toUpperCase() || order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
                        {order.temple?.name || "—"} · {order.package?.name || "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={`badge ${statusBadge(order.status)}`}>{statusLabel(order.status)}</span>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="text-sm text-muted">{order.customer_name || order.customer?.name || "—"}</span>
                    <span style={{ fontWeight: 700, color: "var(--amber-700)" }}>{formatCurrency(order.selling_price)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div style={{ height: "var(--space-8)" }} />
      </div>
    </section>
  );
}

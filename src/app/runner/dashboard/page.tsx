"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getOrders, getReceipts } from "@/lib/api";
import type { Order, RunnerReceipt } from "@/types";

// In production, get from auth context
const CURRENT_RUNNER_ID = "runner-001";

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
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatRM(amount: number): string {
  return `RM${amount.toFixed(2)}`;
}

export default function RunnerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [receipts, setReceipts] = useState<RunnerReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, receiptsData] = await Promise.all([
        getOrders(CURRENT_RUNNER_ID),
        getReceipts(CURRENT_RUNNER_ID),
      ]);
      setOrders(ordersData);
      setReceipts(receiptsData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Compute stats
  const myOrders = orders.filter((o) => o.runner_id === CURRENT_RUNNER_ID);
  const pendingOrders = myOrders.filter((o) => o.status === "unassigned" || o.status === "paid");
  const inProgressOrders = myOrders.filter((o) => o.status === "in_progress");
  const completedOrders = myOrders.filter((o) => o.status === "completed");

  const verifiedReceipts = receipts.filter((r) => r.status === "verified");
  const totalEarnings = verifiedReceipts.reduce(
    (s, r) => s + r.product_cost + r.transport_cost + r.other_cost,
    0
  );

  // Recent earnings (last 7 days)
  const now = new Date();
  const last7 = receipts.filter((r) => {
    if (r.status !== "verified" || !r.verified_at) return false;
    const d = new Date(r.verified_at);
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  });
  const last7Earnings = last7.reduce(
    (s, r) => s + r.product_cost + r.transport_cost + r.other_cost,
    0
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-6)" }}>
        📊 Runner Dashboard
      </h1>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-4" style={{ gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        <div className="stat-card">
          <div className="stat-card-label">Available Orders</div>
          <div className="stat-card-value" style={{ color: "var(--amber-600)" }}>
            {pendingOrders.length}
          </div>
          <div className="stat-card-sub">Waiting for you</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">In Progress</div>
          <div className="stat-card-value" style={{ color: "var(--amber-700)" }}>
            {inProgressOrders.length}
          </div>
          <div className="stat-card-sub">Active orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-value" style={{ color: "var(--sage-600)" }}>
            {completedOrders.length}
          </div>
          <div className="stat-card-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Last 7 Days</div>
          <div className="stat-card-value" style={{ color: "var(--sage-700)" }}>
            {formatRM(last7Earnings)}
          </div>
          <div className="stat-card-sub">Total: {formatRM(totalEarnings)}</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: "var(--space-6)" }}>
        {/* ── AVAILABLE ORDERS ── */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>
              🔔 Available Orders
            </h3>
            {pendingOrders.length === 0 ? (
              <p className="text-muted text-sm">No orders waiting. Check back later.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {pendingOrders.slice(0, 5).map((o) => (
                  <Link
                    key={o.id}
                    href={`/runner/orders/${o.id}`}
                    style={{
                      padding: "var(--space-3)",
                      background: "var(--amber-50)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textDecoration: "none",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{o.temple?.name || o.temple_id}</div>
                      <div className="text-sm text-muted">{o.package?.name} · {formatRM(o.selling_price)}</div>
                    </div>
                    <span className="badge badge-amber">Accept</span>
                  </Link>
                ))}
                {pendingOrders.length > 5 && (
                  <Link href="/runner/orders" className="text-sm" style={{ color: "var(--amber-600)" }}>
                    View all {pendingOrders.length} orders →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── IN PROGRESS ORDERS ── */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>
              ⚡ In Progress
            </h3>
            {inProgressOrders.length === 0 ? (
              <p className="text-muted text-sm">No active orders. Accept one above to get started.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {inProgressOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/runner/orders/${o.id}`}
                    style={{
                      padding: "var(--space-3)",
                      background: "var(--stone-50)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textDecoration: "none",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{o.temple?.name || o.temple_id}</div>
                      <div className="text-sm text-muted">Started {formatDate(o.created_at)}</div>
                      <div style={{ marginTop: "var(--space-1)" }}>
                        <span className="badge badge-orange">Upload Evidence</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "var(--text-lg)" }}>→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RECENT EARNINGS ── */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>
              💰 Recent Earnings
            </h3>
            {last7.length === 0 ? (
              <p className="text-muted text-sm">No verified receipts in the last 7 days.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {last7.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "var(--space-2) 0",
                      borderBottom: "1px solid var(--color-border)",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                        Order {r.order_id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-muted">{formatDate(r.verified_at || r.created_at)}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--sage-600)" }}>
                      {formatRM(r.product_cost + r.transport_cost + r.other_cost)}
                    </div>
                  </div>
                ))}
                <Link href="/runner/earnings" className="text-sm" style={{ color: "var(--amber-600)", marginTop: "var(--space-2)" }}>
                  View all earnings →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>
              ⚙️ Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <Link href="/runner/orders" className="btn btn-secondary">
                📦 View All Orders
              </Link>
              <Link href="/runner/earnings" className="btn btn-secondary">
                💰 Earnings & Payments
              </Link>
              <Link href="/runner/profile" className="btn btn-secondary">
                👤 My Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

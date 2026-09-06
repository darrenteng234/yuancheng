"use client";

import { useEffect, useState, useCallback } from "react";
import { getReceipts } from "@/lib/api";
import type { RunnerReceipt } from "@/types";

// ── Status badge color mapping ──
function statusBadge(status: string): string {
  switch (status) {
    case "verified":
      return "badge-green";
    case "pending":
    case "received":
      return "badge-orange";
    case "rejected":
      return "badge-red";
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
  });
}

// ── Stat Card Component ──
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div
        className="stat-card-value"
        style={{ color: color || "var(--stone-900)" }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Simple Bar Chart Component ──
function SimpleBarChart({
  data,
  labelKey,
  valueKey,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
}) {
  const maxValue = Math.max(
    ...data.map((d) => (d[valueKey] as number) || 0),
    1
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "var(--space-3)",
        height: 200,
        padding: "var(--space-4) 0",
      }}
    >
      {data.map((item, i) => {
        const value = (item[valueKey] as number) || 0;
        const height = (value / maxValue) * 160;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
              }}
            >
              RM{value.toFixed(0)}
            </span>
            <div
              style={{
                width: "100%",
                height: `${height}px`,
                background:
                  "linear-gradient(180deg, var(--amber-400), var(--amber-600))",
                borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                minHeight: value > 0 ? 4 : 0,
                transition: "height 0.3s ease",
              }}
            />
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              {item[labelKey] as string}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Earnings Page ──
export default function RunnerEarningsPage() {
  const [receipts, setReceipts] = useState<RunnerReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, this would come from auth context
  const currentRunnerId = "runner-001";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const receiptsData = await getReceipts(currentRunnerId);
      setReceipts(receiptsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load earnings data"
      );
    } finally {
      setLoading(false);
    }
  }, [currentRunnerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Calculations ──
  const getReceiptTotal = (r: RunnerReceipt) =>
    (r.product_cost || 0) + (r.transport_cost || 0) + (r.other_cost || 0);

  const verifiedReceipts = receipts.filter((r) => r.status === "verified");
  const pendingReceipts = receipts.filter((r) => r.status === "pending" || r.status === "received");
  const rejectedReceipts = receipts.filter((r) => r.status === "rejected");

  const totalEarnings = verifiedReceipts.reduce((sum, r) => sum + getReceiptTotal(r), 0);
  const pendingAmount = pendingReceipts.reduce((sum, r) => sum + getReceiptTotal(r), 0);

  // Weekly breakdown (last 8 weeks)
  const weeklyData: { week: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekReceipts = verifiedReceipts.filter((r) => {
      const d = new Date(r.created_at);
      return d >= weekStart && d < weekEnd;
    });

    const weekTotal = weekReceipts.reduce((sum, r) => sum + getReceiptTotal(r), 0);
    const weekLabel = weekStart.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    weeklyData.push({ week: weekLabel, amount: weekTotal });
  }

  // Payment history (mock data — would come from runner_payments table)
  const paymentHistory = [
    {
      id: 1,
      period: "1 - 7 Jun 2026",
      orders: 5,
      amount: 120,
      status: "paid",
      paidAt: "8 Jun 2026",
    },
    {
      id: 2,
      period: "25 May - 1 Jun 2026",
      orders: 8,
      amount: 195,
      status: "paid",
      paidAt: "2 Jun 2026",
    },
    {
      id: 3,
      period: "18 - 24 May 2026",
      orders: 6,
      amount: 140,
      status: "paid",
      paidAt: "25 May 2026",
    },
    {
      id: 4,
      period: "11 - 17 May 2026",
      orders: 4,
      amount: 90,
      status: "pending",
      paidAt: null,
    },
  ];

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
          <p className="text-muted">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>🚨</span>
        <span>Error loading earnings: {error}</span>
      </div>
    );
  }

  return (
    <>
      {/* Stat Grid — 4 cards */}
      <div className="stat-grid">
        <StatCard
          label="Total Earnings"
          value={`RM${totalEarnings.toFixed(0)}`}
          color="var(--amber-600)"
        />
        <StatCard
          label="Pending Amount"
          value={`RM${pendingAmount.toFixed(0)}`}
          color="var(--terracotta-500)"
        />
        <StatCard
          label="Completed Orders"
          value={verifiedReceipts.length}
          color="var(--sage-600)"
        />
        <StatCard
          label="Avg Per Order"
          value={
            verifiedReceipts.length > 0
              ? `RM${(totalEarnings / verifiedReceipts.length).toFixed(0)}`
              : "RM0"
          }
          color="var(--earth-700)"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-2" style={{ gap: "var(--space-6)" }}>
        {/* LEFT COLUMN — Earnings Chart */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}
        >
          {/* Weekly Earnings Chart */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>
                📈 Weekly Earnings
              </h3>
              <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>
                Last 8 weeks of verified earnings
              </p>
              {weeklyData.some((w) => w.amount > 0) ? (
                <SimpleBarChart
                  data={weeklyData as unknown as Record<string, unknown>[]}
                  labelKey="week"
                  valueKey="amount"
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <div style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>
                    📊
                  </div>
                  <p>No earnings data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Breakdown Table */}
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div
                style={{
                  padding: "var(--space-5)",
                  paddingBottom: 0,
                }}
              >
                <h3 style={{ fontWeight: 700 }}>Weekly Breakdown</h3>
              </div>
              <table className="data-table" style={{ border: "none" }}>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Orders</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData
                    .slice()
                    .reverse()
                    .map((week, i) => {
                      const weekReceipts = verifiedReceipts.filter((r) => {
                        const d = new Date(r.created_at);
                        const weekStart = new Date(now);
                        weekStart.setDate(
                          weekStart.getDate() -
                            (weeklyData.length - 1 - i) * 7
                        );
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 7);
                        return d >= weekStart && d < weekEnd;
                      });

                      return (
                        <tr key={i}>
                          <td>{week.week}</td>
                          <td>{weekReceipts.length}</td>
                          <td style={{ fontWeight: 600 }}>
                            RM{week.amount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Payment History & Receipts */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}
        >
          {/* Payment History */}
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div
                style={{
                  padding: "var(--space-5)",
                  paddingBottom: 0,
                }}
              >
                <h3 style={{ fontWeight: 700 }}>💳 Payment History</h3>
              </div>
              <table className="data-table" style={{ border: "none" }}>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Orders</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: "var(--space-4)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        No payment history yet
                      </td>
                    </tr>
                  ) : (
                    paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{payment.period}</div>
                          {payment.paidAt && (
                            <div className="text-xs text-muted">
                              Paid: {payment.paidAt}
                            </div>
                          )}
                        </td>
                        <td>{payment.orders}</td>
                        <td style={{ fontWeight: 600 }}>
                          RM{payment.amount.toFixed(0)}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              payment.status === "paid"
                                ? "badge-green"
                                : "badge-orange"
                            }`}
                            style={{ textTransform: "none" }}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Receipts */}
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div
                style={{
                  padding: "var(--space-5)",
                  paddingBottom: 0,
                }}
              >
                <h3 style={{ fontWeight: 700 }}>🧾 Recent Receipts</h3>
              </div>
              <div style={{ padding: "var(--space-3)" }}>
                {receipts.length === 0 ? (
                  <div
                    style={{
                      padding: "var(--space-4)",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    No receipts submitted yet
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-2)",
                    }}
                  >
                    {receipts.slice(0, 10).map((receipt) => {
                      const total = getReceiptTotal(receipt);
                      return (
                        <div
                          key={receipt.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "var(--space-3) var(--space-4)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "var(--text-sm)",
                              }}
                              >
                              Order {receipt.order_id.slice(-4)}
                            </div>
                            <div className="text-xs text-muted">
                              {formatDate(receipt.created_at)}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 600 }}>
                              RM{total.toFixed(2)}
                            </div>
                            <span
                              className={`badge ${statusBadge(receipt.status)}`}
                              style={{
                                textTransform: "none",
                                fontSize: "10px",
                              }}
                            >
                              {receipt.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Earnings Summary Card */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-4)" }}>
                💰 Earnings Summary
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "var(--space-3)",
                    background: "var(--sage-50)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <span>Verified Earnings</span>
                  <span style={{ fontWeight: 700, color: "var(--sage-700)" }}>
                    RM{totalEarnings.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "var(--space-3)",
                    background: "var(--terracotta-50)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <span>Pending Review</span>
                  <span style={{ fontWeight: 700, color: "var(--terracotta-600)" }}>
                    RM{pendingAmount.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "var(--space-3)",
                    background: "var(--stone-50)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <span>Rejected</span>
                  <span style={{ fontWeight: 700, color: "var(--color-error)" }}>
                    RM
                    {rejectedReceipts
                      .reduce((sum, r) => sum + getReceiptTotal(r), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="divider" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "var(--space-3)",
                    background: "var(--amber-50)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Total Submitted</span>
                  <span
                    style={{ fontWeight: 700, color: "var(--amber-700)" }}
                  >
                    RM
                    {receipts
                      .reduce((sum, r) => sum + getReceiptTotal(r), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

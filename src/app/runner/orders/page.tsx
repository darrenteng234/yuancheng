"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getOrders } from "@/lib/api";
import type { Order } from "@/types";

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
  return dateStr.split("T")[0];
}

// ── Status filter configuration ──
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "unassigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
];

// ── Main Orders Page ──
export default function RunnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filtered orders ──
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (selectedStatus !== "all" && order.status !== selectedStatus) {
      return false;
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const orderNumber = (order.order_number || order.id).toLowerCase();
      const customerName = (
        order.customer?.name ||
        order.customer_name ||
        ""
      ).toLowerCase();
      const templeName = (order.temple?.name || "").toLowerCase();
      return (
        orderNumber.includes(query) ||
        customerName.includes(query) ||
        templeName.includes(query)
      );
    }
    return true;
  });

  // ── Status counts ──
  const statusCounts = {
    all: orders.length,
    unassigned: orders.filter(
      (o) => o.status === "unassigned" || o.status === "paid"
    ).length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    in_review: orders.filter((o) => o.status === "in_review").length,
    completed: orders.filter((o) => o.status === "completed").length,
    disputed: orders.filter((o) => o.status === "disputed").length,
  };

  // ── Get action button based on status ──
  const getActionForOrder = (order: Order) => {
    switch (order.status) {
      case "unassigned":
      case "paid":
        return (
          <Link
            href={`/runner/orders/${order.id}`}
            className="btn btn-primary btn-sm"
          >
            Start
          </Link>
        );
      case "in_progress":
        return (
          <Link
            href={`/runner/orders/${order.id}`}
            className="btn btn-accent btn-sm"
          >
            Upload Evidence
          </Link>
        );
      case "in_review":
        return (
          <Link
            href={`/runner/orders/${order.id}`}
            className="btn btn-secondary btn-sm"
          >
            View
          </Link>
        );
      case "completed":
        return (
          <Link
            href={`/runner/orders/${order.id}`}
            className="btn btn-secondary btn-sm"
          >
            View
          </Link>
        );
      case "disputed":
        return (
          <Link
            href={`/runner/orders/${order.id}`}
            className="btn btn-warning btn-sm"
          >
            Resolve
          </Link>
        );
      default:
        return (
          <Link
            href={`/runner/orders/${order.id}`}
            className="btn btn-secondary btn-sm"
          >
            View
          </Link>
        );
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
          <p className="text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>🚨</span>
        <span>Error loading orders: {error}</span>
      </div>
    );
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="filter-bar">
        {STATUS_FILTERS.map((filter) => (
          <span
            key={filter.key}
            className={`category-pill${
              selectedStatus === filter.key ? " active" : ""
            }`}
            onClick={() => setSelectedStatus(filter.key)}
          >
            {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search order #, customer, temple..."
          style={{ minWidth: 200 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table" style={{ border: "none" }}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Temple</th>
                <th>Package</th>
                <th>Customer</th>
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
                      <strong>
                        #{order.order_number || order.id.split("-").pop()}
                      </strong>
                      <br />
                      <span className="text-xs text-muted">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td>{order.temple?.name || "—"}</td>
                    <td>{order.package?.name || "—"}</td>
                    <td>{order.customer?.name || order.customer_name || "—"}</td>
                    <td style={{ fontWeight: 600 }}>RM{order.selling_price}</td>
                    <td>
                      <span
                        className={`badge ${statusBadge(order.status)}`}
                        style={{ textTransform: "none" }}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>{getActionForOrder(order)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { listOrders } from "@/lib/platform-api";
import { DataTable, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Order } from "@/types/platform";

const FILTERS = ["all", "paid", "accepted", "in_progress", "under_review", "completed", "disputed"] as const;

export default function AdminPlatformOrders() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [rows, setRows] = React.useState<Order[]>([]);
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all");

  const load = React.useCallback(() => {
    setState("loading");
    listOrders(filter === "all" ? undefined : filter).then((r) => { setRows(r); setState("ready"); }).catch(() => setState("error"));
  }, [filter]);
  React.useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Orders</h1>
      <div className="category-pills" style={{ marginBottom: "var(--space-4)" }}>
        {FILTERS.map((f) => <button key={f} className={`category-pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f.replace(/_/g, " ")}</button>)}
      </div>
      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} description="Could not load orders." /> :
        rows.length === 0 ? <EmptyState icon="📭" title="No orders" description="No orders in this view." /> :
        <DataTable<Order> rowKey={(r) => r.id} rows={rows} columns={[
          { key: "n", header: "Order", render: (r) => <Link href={`/admin/platform-orders/${r.id}`} style={{ fontWeight: 600, color: "var(--color-primary)" }}>{r.order_number}</Link> },
          { key: "c", header: "Customer", render: (r) => r.customer_name || r.customer_email || "—" },
          { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "f", header: "Fulfiller", render: (r) => r.fulfiller_id ? r.fulfiller_id.slice(0, 8) : "—" },
          { key: "t", header: "Total", align: "right", render: (r) => `${r.currency} ${Number(r.total).toFixed(2)}` },
        ]} />
      }
    </div>
  );
}

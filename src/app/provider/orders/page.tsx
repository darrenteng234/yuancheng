"use client";
import React from "react";
import Link from "next/link";
import { listOrders } from "@/lib/platform-api";
import { DataTable, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Order } from "@/types/platform";

export default function ProviderOrders() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [rows, setRows] = React.useState<Order[]>([]);
  const load = React.useCallback(() => {
    setState("loading");
    listOrders().then((r) => { setRows(r); setState("ready"); }).catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)", maxWidth: 960 }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Orders</h1>
      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} description="Could not load orders." /> :
        rows.length === 0 ? <EmptyState icon="📭" title="No orders yet" description="Orders from your storefront will appear here." /> :
        <DataTable<Order> rowKey={(r) => r.id} rows={rows} columns={[
          { key: "n", header: "Order", render: (r) => <Link href={`/provider/orders/${r.id}`} style={{ fontWeight: 600, color: "var(--color-primary)" }}>{r.order_number}</Link> },
          { key: "c", header: "Customer", render: (r) => r.customer_name || r.customer_email || "—" },
          { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "t", header: "Total", align: "right", render: (r) => `${r.currency} ${Number(r.total).toFixed(2)}` },
        ]} />
      }
    </div>
  );
}

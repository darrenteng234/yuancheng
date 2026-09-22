"use client";
import React from "react";
import Link from "next/link";
import { listOrders } from "@/lib/platform-api";
import { DataTable, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Order } from "@/types/platform";

// Runner assignments = platform orders scoped to this fulfiller (server-enforced).
export default function RunnerAssignments() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [rows, setRows] = React.useState<Order[]>([]);
  const load = React.useCallback(() => {
    setState("loading");
    listOrders().then((r) => { setRows(r); setState("ready"); }).catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)", maxWidth: 900 }}>
      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} description="Could not load assignments." /> :
        rows.length === 0 ? <EmptyState icon="🧭" title="No assignments" description="Orders assigned to you appear here." /> :
        <DataTable<Order> rowKey={(r) => r.id} rows={rows} columns={[
          { key: "n", header: "Order", render: (r) => <Link href={`/runner/assignments/${r.id}`} style={{ fontWeight: 600, color: "var(--color-primary)" }}>{r.order_number}</Link> },
          { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "t", header: "Total", align: "right", render: (r) => `${r.currency} ${Number(r.total).toFixed(2)}` },
        ]} />
      }
    </div>
  );
}

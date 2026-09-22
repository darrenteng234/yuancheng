"use client";
import React from "react";
import { adminListPayments } from "@/lib/platform-api";
import { DataTable, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Payment } from "@/types/platform";

export default function AdminPayments() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [rows, setRows] = React.useState<Payment[]>([]);
  const load = React.useCallback(() => {
    setState("loading");
    adminListPayments().then((r) => { setRows(r); setState("ready"); }).catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const money = (n: number, c: string) => `${c} ${Number(n).toFixed(2)}`;

  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-1)" }}>Payments</h1>
      <p className="text-muted" style={{ marginBottom: "var(--space-5)" }}>Read-only. Platform fee is 0 in V1; payouts not yet automated.</p>
      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} /> :
        rows.length === 0 ? <EmptyState icon="💳" title="No payments" description="Successful payments will appear here." /> :
        <DataTable<Payment> rowKey={(r) => r.id} rows={rows} columns={[
          { key: "gross", header: "Gross", render: (r) => money(r.gross_amount, r.currency) },
          { key: "pf", header: "Payment fee", render: (r) => money(r.payment_fee, r.currency) },
          { key: "plat", header: "Platform fee", render: (r) => money(r.platform_fee, r.currency) },
          { key: "prov", header: "Provider", render: (r) => money(r.provider_amount, r.currency) },
          { key: "net", header: "Net", render: (r) => money(r.net_amount, r.currency) },
          { key: "payout", header: "Payout", render: (r) => <StatusBadge status={r.payout_status} /> },
          { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]} />
      }
    </div>
  );
}

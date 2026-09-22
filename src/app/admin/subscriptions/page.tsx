"use client";
import React from "react";
import { adminListSubscriptions } from "@/lib/platform-api";
import { DataTable, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Subscription } from "@/types/platform";

type Row = Subscription & { providers?: { name?: string }; plans?: { name?: string } };

export default function AdminSubscriptions() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [rows, setRows] = React.useState<Row[]>([]);
  const load = React.useCallback(() => {
    setState("loading");
    adminListSubscriptions().then((r) => { setRows(r as Row[]); setState("ready"); }).catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-5)" }}>Subscriptions</h1>
      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} /> :
        rows.length === 0 ? <EmptyState icon="📄" title="No subscriptions" description="Provider subscriptions appear here." /> :
        <DataTable<Row> rowKey={(r) => r.id} rows={rows} columns={[
          { key: "p", header: "Provider", render: (r) => r.providers?.name ?? r.provider_id.slice(0, 8) },
          { key: "plan", header: "Plan", render: (r) => r.plans?.name ?? r.plan_id.slice(0, 8) },
          { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "since", header: "Since", render: (r) => (r.created_at || "").slice(0, 10) },
        ]} />
      }
    </div>
  );
}

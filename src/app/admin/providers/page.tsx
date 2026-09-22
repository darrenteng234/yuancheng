"use client";
import React from "react";
import Link from "next/link";
import { listProviders, setProviderStatus } from "@/lib/platform-api";
import { Button, StatusBadge, Badge, DataTable, LoadingState, ErrorState, EmptyState, Alert } from "@/components/ui";
import type { Provider } from "@/types/platform";

const FILTERS = ["all", "pending", "approved", "suspended", "rejected"] as const;

export default function AdminProviders() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [rows, setRows] = React.useState<Provider[]>([]);
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all");
  const [msg, setMsg] = React.useState("");

  const load = React.useCallback(() => {
    setState("loading");
    listProviders(filter === "all" ? undefined : filter)
      .then((r) => { setRows(r); setState("ready"); }).catch(() => setState("error"));
  }, [filter]);
  React.useEffect(() => { load(); }, [load]);

  async function change(id: string, status: string) {
    setMsg("");
    try { await setProviderStatus(id, status); setMsg(`Provider ${status}.`); load(); }
    catch (e) { setMsg(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div style={{ padding: "var(--space-8)" }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Providers</h1>
      <p className="text-muted" style={{ marginBottom: "var(--space-5)" }}>Review applications and manage provider accounts.</p>

      <div className="category-pills" style={{ marginBottom: "var(--space-4)" }}>
        {FILTERS.map((f) => (
          <button key={f} className={`category-pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {msg ? <Alert tone="success" style={{ marginBottom: "var(--space-4)" }}>{msg}</Alert> : null}

      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} description="Could not load providers." /> :
        rows.length === 0 ? <EmptyState icon="🗂️" title="No providers" description="No provider accounts in this view yet." /> :
        <DataTable<Provider>
          rowKey={(r) => r.id}
          rows={rows}
          columns={[
            { key: "name", header: "Provider", render: (r) => <Link href={`/admin/providers/${r.id}`} style={{ fontWeight: 600, color: "var(--color-primary)" }}>{r.name}</Link> },
            { key: "kind", header: "Type", render: (r) => <Badge tone="gray">{r.kind.replace(/_/g, " ")}</Badge> },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "created", header: "Applied", render: (r) => <span className="text-muted">{(r.created_at || "").slice(0, 10)}</span> },
            { key: "actions", header: "Actions", align: "right", render: (r) => (
              <div style={{ display: "inline-flex", gap: "var(--space-2)" }}>
                {r.status !== "approved" ? <Button size="sm" onClick={() => change(r.id, "approved")}>Approve</Button> : null}
                {r.status !== "suspended" ? <Button size="sm" variant="secondary" onClick={() => change(r.id, "suspended")}>Suspend</Button> : null}
                {r.status !== "rejected" ? <Button size="sm" variant="danger" onClick={() => change(r.id, "rejected")}>Reject</Button> : null}
              </div>
            ) },
          ]}
        />
      }
    </div>
  );
}

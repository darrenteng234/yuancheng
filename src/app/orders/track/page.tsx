"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getOrder } from "@/lib/platform-api";
import { Card, StatusBadge, Badge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Order, OrderStatus } from "@/types/platform";

const STEPS: OrderStatus[] = ["paid", "accepted", "in_progress", "evidence_submitted", "under_review", "completed"];
const STEP_LABEL: Record<string, string> = {
  paid: "Paid", accepted: "Accepted", in_progress: "In progress",
  evidence_submitted: "Evidence submitted", under_review: "Under review", completed: "Completed",
};

function TrackInner() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  const token = params.get("token") || "";
  const [state, setState] = React.useState<"loading" | "error" | "forbidden" | "ready" | "badlink">("loading");
  const [order, setOrder] = React.useState<Order | null>(null);

  const load = React.useCallback(() => {
    if (!id || !token) { setState("badlink"); return; }
    setState("loading");
    getOrder(id, token)
      .then((o) => { setOrder(o); setState("ready"); })
      .catch((e: Error) => setState(/forbidden/i.test(e.message) ? "forbidden" : "error"));
  }, [id, token]);
  React.useEffect(() => { load(); }, [load]);

  if (state === "badlink") return <Wrap><EmptyState icon="🔗" title="Invalid tracking link" description="This link is missing its order id or access token." /></Wrap>;
  if (state === "loading") return <Wrap><LoadingState /></Wrap>;
  if (state === "forbidden") return <Wrap><EmptyState icon="🔒" title="Access denied" description="This tracking link is not valid for this order." /></Wrap>;
  if (state === "error" || !order) return <Wrap><ErrorState onRetry={load} description="Could not load this order." /></Wrap>;

  const activeIdx = STEPS.indexOf(order.status);
  return (
    <Wrap>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>Order {order.order_number}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-muted text-sm" style={{ marginTop: "var(--space-1)" }}>
        {order.currency} {Number(order.total).toFixed(2)}
      </p>

      {order.status === "pending_payment" ? (
        <Alert>Awaiting payment. If you already paid, this updates automatically once confirmed.</Alert>
      ) : null}

      <Card style={{ marginTop: "var(--space-5)" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "var(--space-3)" }}>Progress</h3>
        <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {STEPS.map((s, i) => {
            const done = activeIdx >= 0 && i <= activeIdx;
            const current = i === activeIdx;
            return (
              <li key={s} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", opacity: done ? 1 : 0.45 }}>
                <span aria-hidden style={{ width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                  background: done ? "var(--color-success)" : "var(--color-surface-2)", color: done ? "var(--color-on-primary)" : "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
                  {done ? "✓" : i + 1}
                </span>
                <span style={{ fontWeight: current ? 600 : 400 }}>{STEP_LABEL[s]}</span>
              </li>
            );
          })}
        </ol>
      </Card>

      {order.items?.length ? (
        <Card style={{ marginTop: "var(--space-4)" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Items</h3>
          {order.items.map((it) => (
            <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-2) 0", borderTop: "1px solid var(--color-border)" }}>
              <span>{it.sku_name} <Badge tone="gray">×{it.quantity}</Badge></span>
              <span>{order.currency} {Number(it.line_total).toFixed(2)}</span>
            </div>
          ))}
        </Card>
      ) : null}
    </Wrap>
  );
}

export default function TrackPage() {
  return <Suspense fallback={<Wrap><LoadingState /></Wrap>}><TrackInner /></Suspense>;
}

function Alert({ children }: { children: React.ReactNode }) {
  return <div className="alert alert-info" style={{ marginTop: "var(--space-4)" }}>{children}</div>;
}
function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="container" style={{ maxWidth: 560, paddingTop: "var(--space-10)", paddingBottom: "var(--space-16)" }}>{children}</div>;
}

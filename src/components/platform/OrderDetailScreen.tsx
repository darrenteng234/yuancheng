"use client";
import React from "react";
import Link from "next/link";
import { getOrder, transitionOrder, submitEvidence, assignFulfiller } from "@/lib/platform-api";
import { LoadingState, ErrorState, EmptyState, Alert, Card, Input, Button } from "@/components/ui";
import { OrderView } from "./OrderView";
import type { Order, OrderStatus, Role } from "@/types/platform";

type OrderWithEvidence = Order & { evidence?: { id?: string; type: string; url: string; label?: string }[] };

/** One screen for provider/admin/runner order detail — actions gated by `role`. */
export function OrderDetailScreen({ orderId, role, backHref, backLabel, allowAssign }: {
  orderId: string; role: Role; backHref: string; backLabel: string; allowAssign?: boolean;
}) {
  const [state, setState] = React.useState<"loading" | "error" | "forbidden" | "notfound" | "ready">("loading");
  const [order, setOrder] = React.useState<OrderWithEvidence | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: "error" | "success"; text: string } | null>(null);

  const load = React.useCallback(() => {
    setState("loading");
    getOrder(orderId).then((o) => { setOrder(o as OrderWithEvidence); setState("ready"); })
      .catch((e: Error) => setState(/forbidden/i.test(e.message) ? "forbidden" : /not found/i.test(e.message) ? "notfound" : "error"));
  }, [orderId]);
  React.useEffect(() => { load(); }, [load]);

  async function run(fn: () => Promise<unknown>, success: string) {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ tone: "success", text: success }); load(); }
    catch (e) { setMsg({ tone: "error", text: e instanceof Error ? e.message : "Action failed" }); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ maxWidth: 720, marginBottom: "var(--space-16)" }}>
      <div style={{ marginBottom: "var(--space-5)" }}>
        <Link href={backHref} className="text-sm text-muted">← {backLabel}</Link>
      </div>
      {state === "loading" ? <LoadingState /> :
        state === "forbidden" ? <EmptyState icon="🔒" title="Not authorized" description="You do not have access to this order." /> :
        state === "notfound" ? <EmptyState icon="📦" title="Order not found" /> :
        state === "error" || !order ? <ErrorState onRetry={load} description="Could not load this order." /> :
        <>
          {msg ? <Alert tone={msg.tone} style={{ marginBottom: "var(--space-4)" }}>{msg.text}</Alert> : null}
          {allowAssign ? (
            <Card style={{ marginBottom: "var(--space-4)" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Fulfiller</h3>
              <AssignBox current={order.fulfiller_id} busy={busy}
                onAssign={(fid) => run(() => assignFulfiller(orderId, fid), "Fulfiller assigned")} />
            </Card>
          ) : null}
          <OrderView
            order={order}
            role={role}
            evidence={order.evidence}
            busy={busy}
            onTransition={(to: OrderStatus) => run(() => transitionOrder(orderId, to), `Order updated → ${to}`)}
            onSubmitEvidence={(items) => run(() => submitEvidence(orderId, items), "Evidence submitted")}
          />
        </>
      }
    </div>
  );
}

function AssignBox({ current, onAssign, busy }: { current?: string; onAssign: (id: string) => void; busy?: boolean }) {
  const [id, setId] = React.useState(current ?? "");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (id.trim()) onAssign(id.trim()); }}
      style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-end" }}>
      <div style={{ flex: 1 }}><Input label="Fulfiller (runner) id" value={id} onChange={(e) => setId(e.target.value)} placeholder="runner id" /></div>
      <Button type="submit" variant="secondary" loading={busy}>Assign</Button>
    </form>
  );
}

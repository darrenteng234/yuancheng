"use client";
import React from "react";
import { adminListPayments, listOrders } from "@/lib/platform-api";
import { computeEconomics, isUnavailable, type Metric, type EconomicsReport } from "@/lib/domain/economics";
import { Card, LoadingState, ErrorState, Alert } from "@/components/ui";

// Platform economics — consumes the ONE canonical engine (lib/domain/economics).
// No formulas live in this page.
export default function AdminEconomics() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [rep, setRep] = React.useState<EconomicsReport | null>(null);

  const load = React.useCallback(() => {
    setState("loading");
    Promise.all([adminListPayments(), listOrders()])
      .then(([payments, orders]) => { setRep(computeEconomics({ payments, orders })); setState("ready"); })
      .catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  if (state === "loading") return <LoadingState />;
  if (state === "error" || !rep) return <ErrorState onRetry={load} description="Could not load economics data." />;

  return (
    <div>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Economics</h1>
      <p className="text-muted" style={{ marginBottom: "var(--space-5)" }}>
        Money is derived from payment records. Values needing an input we don’t collect yet show as
        <em> unavailable</em> — never faked as zero.
      </p>

      <div className="stat-grid">
        <Stat label="Gross sales" value={money(rep.grossSales)} />
        <Stat label="Payment fees" value={money(rep.paymentFees)} />
        <Stat label="Platform fees" value={money(rep.platformFees)} hint="0 by config (no commission yet)" />
        <Stat label="Refunds" value={money(rep.refunds)} />
        <Stat label="Owed to providers" value={money(rep.providerAmount)} />
        <Stat label="Paid out" value={money(rep.payoutAmount)} />
      </div>

      <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, margin: "var(--space-6) 0 var(--space-3)" }}>Margins & contribution</h2>
      <div className="stat-grid">
        <MetricStat label="Cost of goods/services" m={rep.costOfGoods} fmt={money} />
        <MetricStat label="Fulfilment cost" m={rep.fulfillmentCost} fmt={money} />
        <MetricStat label="Gross margin" m={rep.grossMargin} fmt={(n) => `${n.toFixed(1)}%`} />
        <MetricStat label="Net contribution" m={rep.netContribution} fmt={money} />
        <MetricStat label="Subscription revenue" m={rep.subscriptionRevenue} fmt={money} />
        <MetricStat label="Avg order value" m={rep.averageOrderValue} fmt={money} />
      </div>

      <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, margin: "var(--space-6) 0 var(--space-3)" }}>Orders</h2>
      <div className="stat-grid">
        <Stat label="Total orders" value={String(rep.totalOrders)} />
        <Stat label="Paid+" value={String(rep.paidOrders)} />
        <Stat label="Completed" value={String(rep.completedOrders)} />
        <Stat label="Cancelled" value={String(rep.cancelledOrders)} />
        <Stat label="Refunded" value={String(rep.refundedOrders)} />
        <Stat label="Disputed" value={String(rep.disputedOrders)} />
      </div>
    </div>
  );
}

function money(n: number) { return `RM ${n.toFixed(2)}`; }

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      {hint ? <div className="text-xs text-muted" style={{ marginTop: "var(--space-1)" }}>{hint}</div> : null}
    </div>
  );
}

function MetricStat({ label, m, fmt }: { label: string; m: Metric; fmt: (n: number) => string }) {
  if (isUnavailable(m)) {
    return (
      <div className="stat-card">
        <div className="stat-card-label">{label}</div>
        <div style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-text-muted)" }}>Unavailable</div>
        <div className="text-xs text-muted" style={{ marginTop: "var(--space-1)" }}>Needs: {m.missingInput}</div>
      </div>
    );
  }
  return <Stat label={label} value={fmt(m)} />;
}

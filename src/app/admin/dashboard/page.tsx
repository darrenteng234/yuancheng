"use client";
import React from "react";
import Link from "next/link";
import { adminListPayments, listOrders, listProviders } from "@/lib/platform-api";
import { computeEconomics } from "@/lib/domain/economics";
import { LoadingState, ErrorState } from "@/components/ui";
import type { Provider } from "@/types/platform";

export default function AdminDashboard() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [d, setD] = React.useState<{ gross: number; orders: number; pendingReview: number; providersPending: number; providersActive: number }>();

  const load = React.useCallback(() => {
    setState("loading");
    Promise.all([adminListPayments(), listOrders(), listProviders()])
      .then(([payments, orders, providers]) => {
        const econ = computeEconomics({ payments, orders });
        setD({
          gross: econ.grossSales,
          orders: econ.totalOrders,
          pendingReview: orders.filter((o) => o.status === "under_review").length,
          providersPending: providers.filter((p: Provider) => p.status === "pending").length,
          providersActive: providers.filter((p: Provider) => p.status === "approved").length,
        });
        setState("ready");
      }).catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  if (state === "loading") return <LoadingState />;
  if (state === "error" || !d) return <ErrorState onRetry={load} description="Could not load the dashboard." />;

  return (
    <div>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-5)" }}>Dashboard</h1>
      <div className="stat-grid">
        <Tile label="Gross sales" value={`RM ${d.gross.toFixed(2)}`} href="/admin/economics" />
        <Tile label="Total orders" value={String(d.orders)} href="/admin/platform-orders" />
        <Tile label="Awaiting review" value={String(d.pendingReview)} href="/admin/platform-orders" />
        <Tile label="Provider applications" value={String(d.providersPending)} href="/admin/providers?status=pending" />
        <Tile label="Active providers" value={String(d.providersActive)} href="/admin/providers?status=approved" />
      </div>
    </div>
  );
}

function Tile({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="stat-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
    </Link>
  );
}

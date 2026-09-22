"use client";
import React from "react";
import Link from "next/link";
import { getMyProvider } from "@/lib/platform-api";
import { Card, Button, Badge, StatusBadge, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Provider, Plan, Subscription } from "@/types/platform";
import type { LimitCheck } from "@/lib/domain/plan";

export default function ProviderDashboard() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [data, setData] = React.useState<{ provider: Provider | null; plan?: Plan; subscription?: Subscription; skuLimit?: LimitCheck }>();

  const load = React.useCallback(() => {
    setState("loading");
    getMyProvider().then((d) => { setData(d); setState("ready"); }).catch(() => setState("error"));
  }, []);
  React.useEffect(load, [load]);

  if (state === "loading") return <Shell><LoadingState /></Shell>;
  if (state === "error") return <Shell><ErrorState description="Could not load your provider account." onRetry={load} /></Shell>;

  if (!data?.provider) {
    return (
      <Shell>
        <EmptyState icon="🏮" title="Become a provider"
          description="Publish your services on Yuancheng, take orders, and manage fulfilment — all in one place."
          action={<Link href="/provider/apply"><Button>Apply now</Button></Link>} />
      </Shell>
    );
  }

  const p = data.provider;
  const limit = data.skuLimit;
  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>{p.name}</h1>
          <div style={{ marginTop: "var(--space-2)", display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <StatusBadge status={p.status} />
            <Badge tone="gray">{p.kind.replace(/_/g, " ")}</Badge>
            {data.plan ? <Badge tone="amber">{data.plan.name} plan</Badge> : null}
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link href="/provider/account"><Button variant="secondary" size="sm">Account</Button></Link>
        </div>
      </div>

      {p.status !== "approved" ? (
        <Card><p className="text-sm">Your application is <strong>{p.status}</strong>. You can set up your storefront and products now, but publishing publicly unlocks once an admin approves your account.</p></Card>
      ) : null}

      <div className="grid grid-3" style={{ marginTop: "var(--space-6)" }}>
        <Card>
          <div className="text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>Active SKUs</div>
          <div style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginTop: "var(--space-1)" }}>
            {limit ? `${limit.used}${limit.limit === null ? "" : ` / ${limit.limit}`}` : "—"}
          </div>
          {limit && limit.limit !== null ? (
            <div className="text-xs text-muted" style={{ marginTop: "var(--space-1)" }}>
              {limit.remaining} remaining on {data.plan?.name ?? "Free"} plan
            </div>
          ) : null}
        </Card>
        <QuickLink href="/provider/products" label="Products & SKUs" desc="Create, price, publish" />
        <QuickLink href="/provider/orders" label="Orders" desc="View and fulfil" />
      </div>

      <div className="grid grid-2" style={{ marginTop: "var(--space-4)" }}>
        <QuickLink href="/provider/storefront" label="Storefront" desc="Your public selling surface" />
        <QuickLink href="/provider/account" label="Account & plan" desc="Profile, plan, settings" />
      </div>
    </Shell>
  );
}

function QuickLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} style={{ display: "block" }}>
      <Card>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>{desc}</div>
      </Card>
    </Link>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)", maxWidth: 960 }}>
      {children}
    </div>
  );
}

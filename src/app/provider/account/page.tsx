"use client";
import React from "react";
import Link from "next/link";
import { getMyProvider, updateProviderProfile } from "@/lib/platform-api";
import { Card, Button, Input, Badge, StatusBadge, Alert, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Provider, Plan } from "@/types/platform";
import type { LimitCheck } from "@/lib/domain/plan";

export default function ProviderAccount() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [provider, setProvider] = React.useState<Provider | null>(null);
  const [plan, setPlan] = React.useState<Plan | null>(null);
  const [limit, setLimit] = React.useState<LimitCheck | null>(null);
  const [form, setForm] = React.useState({ name: "", contact_email: "", contact_phone: "" });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: "error" | "success"; text: string } | null>(null);

  const load = React.useCallback(() => {
    setState("loading");
    getMyProvider().then((d) => {
      setProvider(d.provider); setPlan(d.plan ?? null); setLimit(d.skuLimit ?? null);
      if (d.provider) setForm({ name: d.provider.name, contact_email: d.provider.contact_email ?? "", contact_phone: d.provider.contact_phone ?? "" });
      setState("ready");
    }).catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!provider) return;
    setBusy(true); setMsg(null);
    try { await updateProviderProfile(provider.id, form); setMsg({ tone: "success", text: "Saved." }); load(); }
    catch (err) { setMsg({ tone: "error", text: err instanceof Error ? err.message : "Save failed" }); }
    finally { setBusy(false); }
  }

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)", maxWidth: 640 }}>
      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} /> :
        !provider ? <EmptyState icon="🏮" title="No provider account" action={<Link href="/provider/apply"><Button>Apply</Button></Link>} /> :
        <>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Account & plan</h1>
          <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
            <StatusBadge status={provider.status} />
            {plan ? <Badge tone="amber">{plan.name} plan</Badge> : null}
            {limit ? <Badge tone="gray">SKUs {limit.used}{limit.limit === null ? "" : `/${limit.limit}`}</Badge> : null}
          </div>
          {msg ? <Alert tone={msg.tone} style={{ marginBottom: "var(--space-4)" }}>{msg.text}</Alert> : null}
          <Card>
            <form onSubmit={save}>
              <Input label="Provider name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Contact email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              <Input label="Contact phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
              <Button type="submit" loading={busy} style={{ marginTop: "var(--space-2)" }}>Save changes</Button>
            </form>
          </Card>
          {plan ? (
            <Card style={{ marginTop: "var(--space-4)" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Plan limits</h3>
              <div className="text-sm text-muted">
                Active SKUs: {plan.sku_limit ?? "unlimited"} · Storefronts: {plan.storefront_limit ?? "unlimited"}
                {plan.monthly_price != null ? ` · ${plan.currency} ${plan.monthly_price}/mo` : " · pricing TBD"}
              </div>
            </Card>
          ) : null}
        </>
      }
    </div>
  );
}

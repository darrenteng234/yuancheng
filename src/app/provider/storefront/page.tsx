"use client";
import React from "react";
import Link from "next/link";
import { listStorefronts, createStorefront, setStorefrontStatus, updateStorefront, getMyProvider } from "@/lib/platform-api";
import { Card, Button, Input, Textarea, StatusBadge, Alert, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Storefront, Provider } from "@/types/platform";

export default function ProviderStorefront() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [sf, setSf] = React.useState<Storefront | null>(null);
  const [provider, setProvider] = React.useState<Provider | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [form, setForm] = React.useState({ name: "", slug: "", description: "" });

  const load = React.useCallback(() => {
    setState("loading");
    Promise.all([listStorefronts(), getMyProvider()]).then(([fronts, me]) => {
      setProvider(me.provider); const s = fronts[0] ?? null; setSf(s);
      if (s) setForm({ name: s.name, slug: s.slug, description: s.description ?? "" });
      setState("ready");
    }).catch(() => setState("error"));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function run(fn: () => Promise<unknown>, text: string) {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ tone: "success", text }); load(); }
    catch (e) { setMsg({ tone: "error", text: e instanceof Error ? e.message : "Failed" }); }
    finally { setBusy(false); }
  }

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)", maxWidth: 640 }}>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Storefront</h1>
      {msg ? <Alert tone={msg.tone} style={{ marginBottom: "var(--space-4)" }}>{msg.text}</Alert> : null}

      {state === "loading" ? <LoadingState /> :
        state === "error" ? <ErrorState onRetry={load} /> :
        !sf ? (
          <EmptyState icon="🏪" title="Create your storefront"
            description="Your public selling surface. Free plan includes one storefront."
            action={<Button loading={busy} onClick={() => run(() => createStorefront({ name: "My Storefront", slug: `store-${Math.random().toString(36).slice(2, 8)}` }), "Storefront created")}>Create storefront</Button>} />
        ) : (
          <>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                <StatusBadge status={sf.status} />
                <Link className="text-sm" href={`/s/${sf.slug}`} target="_blank" style={{ color: "var(--color-primary)" }}>View public page ↗</Link>
              </div>
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Slug" value={form.slug} hint="Used in your public URL /s/<slug>. (create-time)" disabled />
              <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Button loading={busy} style={{ marginTop: "var(--space-2)" }}
                onClick={() => run(() => updateStorefront(sf.id, { name: form.name, description: form.description }), "Storefront saved")}>
                Save changes
              </Button>
            </Card>
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)", flexWrap: "wrap" }}>
              {sf.status !== "published" ? (
                <Button loading={busy} disabled={provider?.status !== "approved"}
                  onClick={() => run(() => setStorefrontStatus(sf.id, "published"), "Storefront published")}>
                  Publish
                </Button>
              ) : (
                <Button variant="secondary" loading={busy} onClick={() => run(() => setStorefrontStatus(sf.id, "paused"), "Storefront unpublished")}>Unpublish</Button>
              )}
              {provider?.status !== "approved" ? (
                <span className="text-sm text-muted" style={{ alignSelf: "center" }}>Publishing unlocks after admin approval.</span>
              ) : null}
            </div>
          </>
        )}
    </div>
  );
}

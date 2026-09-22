"use client";
import React from "react";
import Link from "next/link";
import {
  listStorefronts, createStorefront, listProducts, createProduct,
  listSkus, createSku, setSkuStatus, getMyProvider,
} from "@/lib/platform-api";
import { Card, Button, Input, Badge, StatusBadge, Alert, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import type { Storefront, PlatformProduct, Sku } from "@/types/platform";
import type { LimitCheck } from "@/lib/domain/plan";

export default function ProviderProducts() {
  const [state, setState] = React.useState<"loading" | "error" | "ready">("loading");
  const [storefront, setStorefront] = React.useState<Storefront | null>(null);
  const [products, setProducts] = React.useState<PlatformProduct[]>([]);
  const [skus, setSkus] = React.useState<Record<string, Sku[]>>({});
  const [limit, setLimit] = React.useState<LimitCheck | null>(null);
  const [msg, setMsg] = React.useState<{ tone: "error" | "success"; text: string } | null>(null);

  const load = React.useCallback(async () => {
    setState("loading");
    try {
      const [fronts, me] = await Promise.all([listStorefronts(), getMyProvider()]);
      setLimit(me.skuLimit ?? null);
      const sf = fronts[0] ?? null;
      setStorefront(sf);
      if (sf) {
        const prods = await listProducts(sf.id);
        setProducts(prods);
        const map: Record<string, Sku[]> = {};
        for (const p of prods) map[p.id] = await listSkus(p.id);
        setSkus(map);
      }
      setState("ready");
    } catch { setState("error"); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function act<T>(fn: () => Promise<T>, success?: string) {
    setMsg(null);
    try { await fn(); if (success) setMsg({ tone: "success", text: success }); await load(); }
    catch (e) { setMsg({ tone: "error", text: e instanceof Error ? e.message : "Action failed" }); }
  }

  if (state === "loading") return <Shell><LoadingState /></Shell>;
  if (state === "error") return <Shell><ErrorState onRetry={load} description="Could not load your catalog." /></Shell>;

  if (!storefront) {
    return (
      <Shell>
        <EmptyState icon="🏪" title="Create your storefront first"
          description="A storefront is your public selling surface. You need one before adding products."
          action={<Button onClick={() => act(() => createStorefront({
            name: "My Storefront", slug: `store-${Math.random().toString(36).slice(2, 8)}`,
          }), "Storefront created")}>Create storefront</Button>} />
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Products & SKUs</h1>
          <div className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>
            {storefront.name} · <StatusBadge status={storefront.status} />
          </div>
        </div>
        {limit ? (
          <Card padded>
            <div className="text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>Active SKUs</div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-xl)" }}>
              {limit.used}{limit.limit === null ? "" : ` / ${limit.limit}`}
            </div>
          </Card>
        ) : null}
      </div>

      {msg ? <Alert tone={msg.tone} style={{ margin: "var(--space-4) 0" }}>{msg.text}</Alert> : null}
      {limit && limit.limit !== null && limit.remaining === 0 ? (
        <Alert tone="warning" style={{ margin: "var(--space-4) 0" }}>
          Active-SKU limit reached ({limit.limit}). Unpublish a SKU or upgrade your plan to publish more.
        </Alert>
      ) : null}

      <NewProduct storefrontId={storefront.id} onCreate={(name) =>
        act(() => createProduct({ storefront_id: storefront.id, name, type: "service" }), "Product added")} />

      {products.length === 0 ? (
        <EmptyState icon="📦" title="No products yet" description="Add your first product above." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
          {products.map((p) => (
            <Card key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{p.name}</strong>
                <Badge tone="gray">{(skus[p.id]?.length ?? 0)} SKU(s)</Badge>
              </div>
              <div style={{ marginTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {(skus[p.id] ?? []).map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", padding: "var(--space-2) 0", borderTop: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                      <span>{s.name}</span>
                      <span className="text-muted text-sm">{s.currency} {Number(s.price).toFixed(2)}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    {s.status === "published" ? (
                      <Button size="sm" variant="secondary" onClick={() => act(() => setSkuStatus(s.id, "inactive"), "Unpublished")}>Unpublish</Button>
                    ) : (
                      <Button size="sm" onClick={() => act(() => setSkuStatus(s.id, "published"), "Published")}>Publish</Button>
                    )}
                  </div>
                ))}
                <NewSku onCreate={(name, price) => act(() => createSku({ product_id: p.id, name, price }), "SKU added")} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}

function NewProduct({ onCreate }: { storefrontId: string; onCreate: (name: string) => void }) {
  const [name, setName] = React.useState("");
  return (
    <Card padded style={undefined}>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onCreate(name.trim()); setName(""); } }}
        style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}><Input label="New product name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Memorial Offering" /></div>
        <Button type="submit">Add product</Button>
      </form>
    </Card>
  );
}

function NewSku({ onCreate }: { onCreate: (name: string, price: number) => void }) {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onCreate(name.trim(), Number(price) || 0); setName(""); setPrice(""); } }}
      style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-end", marginTop: "var(--space-2)" }}>
      <div style={{ flex: 1 }}><Input label="New SKU" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard" /></div>
      <div style={{ width: 110 }}><Input label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" /></div>
      <Button type="submit" variant="secondary">Add SKU</Button>
    </form>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)", maxWidth: 900 }}>
      {children}
    </div>
  );
}

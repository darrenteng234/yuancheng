"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/platform-api";
import { Card, Button, Input, Alert, EmptyState } from "@/components/ui";
import type { PlatformProduct, Sku } from "@/types/platform";

type ProductWithSkus = PlatformProduct & { skus: Sku[] };

/**
 * Minimal customer purchase: pick one SKU, enter contact, create the order.
 * Order is created as pending_payment; payment is a separate step (Stripe test).
 * Prices come from the server — this UI only references SKU ids.
 */
export function StorefrontBuy({ storefrontId, products }: { storefrontId: string; products: ProductWithSkus[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Sku | null>(null);
  const [form, setForm] = React.useState({ customer_name: "", customer_email: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  if (products.length === 0) {
    return <EmptyState icon="🕯️" title="Nothing available yet" description="This provider has not published any services." />;
  }

  async function purchase(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !selected) return;
    setBusy(true); setError("");
    try {
      const order = await createOrder({
        storefront_id: storefrontId,
        items: [{ sku_id: selected.id, quantity: 1 }],
        customer_name: form.customer_name,
        customer_email: form.customer_email,
      });
      // Straight to secure payment; order is pending_payment until the webhook.
      router.push(`/pay?order=${order.id}&token=${encodeURIComponent(order.access_token)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create order");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={purchase}>
      {error ? <Alert tone="error" style={{ marginBottom: "var(--space-4)" }}>{error}</Alert> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {products.map((p) => (
          <Card key={p.id}>
            <strong>{p.name}</strong>
            {p.description ? <p className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>{p.description}</p> : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
              {p.skus.map((s) => {
                const active = selected?.id === s.id;
                return (
                  <button type="button" key={s.id} onClick={() => setSelected(s)}
                    className={`category-pill ${active ? "active" : ""}`}>
                    {s.name} · {s.currency} {Number(s.price).toFixed(2)}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: "var(--space-4)" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>Your details</h3>
        <Input label="Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
        <Input label="Email" type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
        <div className="text-sm" style={{ margin: "var(--space-3) 0" }}>
          {selected ? <>Selected: <strong>{selected.name}</strong> — {selected.currency} {Number(selected.price).toFixed(2)}</> : <span className="text-muted">Select an option above.</span>}
        </div>
        <Button type="submit" full loading={busy} disabled={!selected}>Place order</Button>
      </Card>
    </form>
  );
}

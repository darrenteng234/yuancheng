import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { DEMO_PRODUCTS, money } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";

export default function ProviderProducts() {
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title="Products" subtitle="Physical products. Customers contact you to buy — no Yuancheng checkout."
        actions={<Link href="/provider/products/new" className="btn btn-primary btn-sm"><Plus size={15} /> Add product</Link>} />
      {DEMO_PRODUCTS.length === 0 ? (
        <div className="state-block"><Package size={32} className="state-icon" /><h3>No products yet</h3><p>Add a product to show it on your storefront.</p><Link href="/provider/products/new" className="btn btn-primary btn-sm">Add product</Link></div>
      ) : (
        DEMO_PRODUCTS.map((p) => (
          <div key={p.slug} className="order-row">
            <div className="order-row-main">
              <span className="order-row-title">{p.name}</span>
              <span className="order-row-meta">{money(p.price, p.currency)} · Contact provider</span>
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
              <span className="sbadge sbadge--muted"><Package size={13} /> Physical</span>
              <span className="sbadge sbadge--success">Published</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

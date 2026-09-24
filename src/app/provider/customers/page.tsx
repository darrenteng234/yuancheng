import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { DEMO_ORDERS, money } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";

// Derive customers from this provider's own orders (no CRM, no duplication).
function customers() {
  const map = new Map<string, { name: string; orders: number; last: string; total: number }>();
  for (const o of DEMO_ORDERS) {
    const c = map.get(o.customer_name) ?? { name: o.customer_name, orders: 0, last: o.created_at, total: 0 };
    c.orders += 1; c.total += o.amount; if (o.created_at > c.last) c.last = o.created_at;
    map.set(o.customer_name, c);
  }
  return [...map.values()];
}

export default function ProviderCustomers() {
  const list = customers();
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title="Customers" subtitle="People who have ordered from you." />
      {list.length === 0 ? (
        <div className="state-block"><Users size={32} className="state-icon" /><h3>No customers yet</h3><p>Customers will appear here after your first order.</p></div>
      ) : (
        list.map((c) => (
          <Link key={c.name} href={`/provider/customers/${encodeURIComponent(c.name)}`} className="order-row">
            <div className="order-row-main">
              <span className="order-row-title">{c.name}</span>
              <span className="order-row-meta">Kuala Lumpur, Malaysia · {c.orders} order{c.orders === 1 ? "" : "s"} · last {c.last}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span className="text-muted">{money(c.total)}</span>
              <ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} />
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

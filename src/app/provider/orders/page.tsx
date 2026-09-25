import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OrderStatus } from "@/types/platform";
import { DEMO_ORDERS, getService, money } from "@/lib/demo/catalog";
import { PageHeader, OrderStatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "review", label: "Payment review", match: (s: string) => s === "payment_proof_submitted" },
  { key: "paid", label: "Paid", match: (s: string) => s === "paid" || s === "accepted" },
  { key: "progress", label: "In progress", match: (s: string) => s === "in_progress" || s === "evidence_submitted" },
  { key: "completed", label: "Completed", match: (s: string) => s === "completed" },
];

export default async function ProviderOrders({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "all" } = await searchParams;
  const active = FILTERS.find((x) => x.key === f) ?? FILTERS[0];
  const orders = DEMO_ORDERS.filter((o) => !active.match || active.match(o.status));

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title="Orders" subtitle="Review requests, verify payments, and fulfil orders." />
      <div className="tabs">
        {FILTERS.map((x) => (
          <Link key={x.key} href={`/provider/orders?f=${x.key}`} className="tab" aria-selected={x.key === active.key}>{x.label}</Link>
        ))}
      </div>
      {orders.length === 0 ? (
        <div className="state-block"><h3>No orders here</h3><p>Orders in this state will appear here.</p></div>
      ) : (
        orders.map((o) => {
          const service = getService(o.serviceSlug);
          return (
            <Link key={o.id} href={`/provider/orders/${o.id}`} className="order-row">
              <div className="order-row-main">
                <span className="order-row-num">{o.order_number} · {formatDate(o.created_at)}</span>
                <span className="order-row-title">{service?.name}</span>
                <span className="order-row-meta">{o.customer_name} · {money(o.amount, o.currency)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <OrderStatusBadge status={o.status as OrderStatus} />
                <ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} />
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

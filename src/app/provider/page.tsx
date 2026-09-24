import Link from "next/link";
import { ShieldCheck, Plus, ClipboardList, Store, ArrowRight } from "lucide-react";
import { DEMO_ORDERS, DEMO_SERVICES, DEMO_PRODUCTS, money } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";

const PROVIDER_NAME = "Golden Lotus Services";

export default function ProviderDashboard() {
  const proofReview = DEMO_ORDERS.filter((o) => o.status === "payment_proof_submitted");
  const readyAccept = DEMO_ORDERS.filter((o) => o.status === "paid");
  const inProgress = DEMO_ORDERS.filter((o) => o.status === "in_progress" || o.status === "accepted");
  const completed = DEMO_ORDERS.filter((o) => o.status === "completed");
  const revenue = completed.reduce((s, o) => s + o.amount, 0);

  const attention = [
    proofReview.length ? { n: proofReview.length, label: "Payment proof awaiting review", href: `/provider/orders/${proofReview[0].id}` } : null,
    readyAccept.length ? { n: readyAccept.length, label: "Order ready to accept", href: "/provider/orders?f=paid" } : null,
    inProgress.length ? { n: inProgress.length, label: "Fulfilment in progress", href: "/provider/orders?f=progress" } : null,
  ].filter(Boolean) as { n: number; label: string; href: string }[];

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title="Good day" subtitle={PROVIDER_NAME}
        actions={<span className="sbadge sbadge--success"><ShieldCheck size={14} /> Verified provider</span>} />

      {/* Needs attention */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>Needs attention</h2>
        {attention.length === 0 ? (
          <p className="text-muted">Nothing needs your attention right now.</p>
        ) : (
          <div className="needs-attention">
            {attention.map((a, i) => (
              <Link key={i} href={a.href} className="na-item">
                <span>{a.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}><span className="na-count">{a.n}</span><ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} /></span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* This week */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>This week</h2>
        <div className="metric-grid">
          <div className="metric-card"><div className="m-val">{DEMO_ORDERS.length}</div><div className="m-label">Orders</div></div>
          <div className="metric-card"><div className="m-val">{completed.length}</div><div className="m-label">Completed</div></div>
          <div className="metric-card"><div className="m-val">{money(revenue)}</div><div className="m-label">Order value</div></div>
        </div>
      </section>

      {/* Quick actions */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>Quick actions</h2>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Link href="/provider/services/new" className="btn btn-primary btn-sm"><Plus size={15} /> Create service</Link>
          <Link href="/provider/orders" className="btn btn-secondary btn-sm"><ClipboardList size={15} /> View orders</Link>
          <Link href="/provider/storefront" className="btn btn-secondary btn-sm"><Store size={15} /> Edit storefront</Link>
        </div>
      </section>

      {/* Catalog capacity */}
      <section>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>Catalog</h2>
        <div className="metric-card">
          <div className="capacity-row"><span>Active services</span><span style={{ fontWeight: 600 }}>{DEMO_SERVICES.length} / 3</span></div>
          <div className="capacity-row"><span>Products</span><span style={{ fontWeight: 600 }}>{DEMO_PRODUCTS.length}</span></div>
          <div className="capacity-row"><span>Plan</span><span style={{ fontWeight: 600 }}>Free (beta)</span></div>
        </div>
      </section>
    </div>
  );
}

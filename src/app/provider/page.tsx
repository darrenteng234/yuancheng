import Link from "next/link";
import { ShieldCheck, Plus, ClipboardList, Store, ArrowRight } from "lucide-react";
import { DEMO_ORDERS, DEMO_SERVICES, DEMO_PRODUCTS, money } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

const PROVIDER_NAME = "Golden Lotus Services";

export default async function ProviderDashboard() {
  const t = getProviderDict(await providerLang()).dash;
  const proofReview = DEMO_ORDERS.filter((o) => o.status === "payment_proof_submitted");
  const readyAccept = DEMO_ORDERS.filter((o) => o.status === "paid");
  const inProgress = DEMO_ORDERS.filter((o) => o.status === "in_progress" || o.status === "accepted");
  const completed = DEMO_ORDERS.filter((o) => o.status === "completed");
  const revenue = completed.reduce((s, o) => s + o.amount, 0);

  const attention = [
    proofReview.length ? { n: proofReview.length, label: t.proofReview, href: `/provider/orders/${proofReview[0].id}` } : null,
    readyAccept.length ? { n: readyAccept.length, label: t.readyAccept, href: "/provider/orders?f=paid" } : null,
    inProgress.length ? { n: inProgress.length, label: t.inProgress, href: "/provider/orders?f=progress" } : null,
  ].filter(Boolean) as { n: number; label: string; href: string }[];

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title={t.greeting} subtitle={PROVIDER_NAME}
        actions={<span className="sbadge sbadge--success"><ShieldCheck size={14} /> {t.verified}</span>} />

      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>{t.needsAttention}</h2>
        {attention.length === 0 ? (
          <p className="text-muted">{t.nothing}</p>
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

      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>{t.thisWeek}</h2>
        <div className="metric-grid">
          <div className="metric-card"><div className="m-val">{DEMO_ORDERS.length}</div><div className="m-label">{t.orders}</div></div>
          <div className="metric-card"><div className="m-val">{completed.length}</div><div className="m-label">{t.completed}</div></div>
          <div className="metric-card"><div className="m-val">{money(revenue)}</div><div className="m-label">{t.orderValue}</div></div>
        </div>
      </section>

      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>{t.quickActions}</h2>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Link href="/provider/services/new" className="btn btn-primary btn-sm"><Plus size={15} /> {t.createService}</Link>
          <Link href="/provider/orders" className="btn btn-secondary btn-sm"><ClipboardList size={15} /> {t.viewOrders}</Link>
          <Link href="/provider/storefront" className="btn btn-secondary btn-sm"><Store size={15} /> {t.editStorefront}</Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>{t.catalog}</h2>
        <div className="metric-card">
          <div className="capacity-row"><span>{t.activeServices}</span><span style={{ fontWeight: 600 }}>{DEMO_SERVICES.length} / 3</span></div>
          <div className="capacity-row"><span>{t.products}</span><span style={{ fontWeight: 600 }}>{DEMO_PRODUCTS.length}</span></div>
          <div className="capacity-row"><span>{t.plan}</span><span style={{ fontWeight: 600 }}>{t.freeBeta}</span></div>
        </div>
      </section>
    </div>
  );
}

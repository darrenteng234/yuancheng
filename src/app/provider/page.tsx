import Link from "next/link";
import { ShieldCheck, Plus, ClipboardList, Store, Receipt } from "lucide-react";
import { DEMO_ORDERS, DEMO_SERVICES, DEMO_PRODUCTS, getService, money, orderUploadedISO } from "@/lib/demo/catalog";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict, fill } from "@/lib/i18n/provider";
import { isOverdue, verifyDeadlineLabel } from "@/lib/demo/contact";
import { formatDate } from "@/lib/format";

const PROVIDER_NAME = "Golden Lotus Services";
const WD_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WD_ZH = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
// Payment is verified once the order is at/after "paid".
const VERIFIED: string[] = ["paid", "accepted", "in_progress", "evidence_submitted", "under_review", "completed"];

export default async function ProviderDashboard() {
  const lang = await providerLang();
  const t = getProviderDict(lang).dash;
  const zh = lang === "zh";

  const kl = new Date(Date.now() + 8 * 3600000);
  const wd = zh ? WD_ZH[kl.getUTCDay()] : WD_EN[kl.getUTCDay()];
  const dateLine = zh ? `${formatDate(new Date(), "zh")} ${wd}` : `${wd}, ${formatDate(new Date())}`;

  const proofReview = DEMO_ORDERS.filter((o) => o.status === "payment_proof_submitted")
    .sort((a, b) => Number(isOverdue(orderUploadedISO(b))) - Number(isOverdue(orderUploadedISO(a))));
  const completed = DEMO_ORDERS.filter((o) => o.status === "completed");
  const verifiedValue = DEMO_ORDERS.filter((o) => VERIFIED.includes(o.status)).reduce((s, o) => s + o.amount, 0);

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <div className="text-muted" style={{ fontSize: "var(--text-sm)", marginBottom: 4 }}>{dateLine}</div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 600 }}>{PROVIDER_NAME}</h1>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span className="sbadge sbadge--success"><ShieldCheck size={13} /> {t.identityVerified}</span>
          <span className="sbadge sbadge--success"><ShieldCheck size={13} /> {t.physicalVerified}</span>
        </div>
      </div>

      {/* Needs attention — one row per order */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>{fill(t.needsTitle, { n: String(proofReview.length) })}</h2>
        {proofReview.length === 0 ? (
          <div className="metric-card"><p className="text-muted">{t.emptyAttention}</p></div>
        ) : (
          <div className="needs-attention">
            {proofReview.map((o) => {
              const overdue = isOverdue(orderUploadedISO(o));
              const service = getService(o.serviceSlug);
              return (
                <div key={o.id} className="na-row">
                  <Receipt size={18} style={{ color: "var(--color-primary)", flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{t.checkReceipt}</div>
                    <div className="text-muted" style={{ fontSize: "var(--text-sm)" }}>{o.order_number} · {service?.name} · {o.customer_name}</div>
                    <div style={{ fontSize: "var(--text-sm)", marginTop: 2 }}>
                      {money(o.amount, o.currency)} · {overdue
                        ? <span className="sbadge sbadge--warning">{getProviderDict(lang).od.overdue}</span>
                        : <span className="text-muted">{fill(getProviderDict(lang).od.verifyBy, { deadline: verifyDeadlineLabel(orderUploadedISO(o), lang) })}</span>}
                    </div>
                  </div>
                  <Link href={`/provider/orders/${o.id}`} className="btn btn-primary btn-sm" style={{ flex: "none" }}>{t.review}</Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* This week */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>{t.thisWeek}</h2>
        <div className="metric-grid">
          <div className="metric-card"><div className="m-val">{DEMO_ORDERS.length}</div><div className="m-label">{t.orders}</div></div>
          <div className="metric-card"><div className="m-val">{completed.length}</div><div className="m-label">{t.completed}</div></div>
          <div className="metric-card">
            <div className="m-val">{money(verifiedValue)}</div><div className="m-label">{t.orderValue}</div>
            <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: 6 }}>{t.orderValueCaption}</div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>{t.quickActions}</h2>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Link href="/provider/services/new" className="btn btn-primary btn-sm"><Plus size={15} /> {t.createService}</Link>
          <Link href="/provider/orders" className="btn btn-secondary btn-sm"><ClipboardList size={15} /> {t.viewOrders}</Link>
          <Link href="/provider/storefront" className="btn btn-secondary btn-sm"><Store size={15} /> {t.editStorefront}</Link>
        </div>
      </section>

      {/* Catalog */}
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

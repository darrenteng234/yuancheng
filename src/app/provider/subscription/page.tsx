import { Check, X } from "lucide-react";
import { DEMO_SERVICES, DEMO_PRODUCTS } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

export default async function ProviderSubscription() {
  const t = getProviderDict(await providerLang()).sub;
  const caps = [
    { label: t.services, used: DEMO_SERVICES.length, limit: 3 as number | null },
    { label: t.products, used: DEMO_PRODUCTS.length, limit: null as number | null },
    { label: t.staff, used: 0, limit: 0 as number | null },
  ];
  const overLimit = caps.some((c) => c.limit !== null && c.used > c.limit);
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 720, margin: "0 auto" }}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <div className="acct-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{t.free}</div>
            <div className="text-muted">{t.freeDesc}</div>
          </div>
          <span className="sbadge sbadge--success">{t.active}</span>
        </div>
      </div>
      {overLimit ? <div className="banner-review" style={{ marginBottom: "var(--space-5)" }}>{t.overLimit}</div> : null}
      <div className="acct-section">
        <h2>{t.capacity}</h2>
        {caps.map((c) => (
          <div key={c.label} className="capacity-row">
            <span>{c.label}</span>
            <span style={{ fontWeight: 600, color: c.limit !== null && c.used > c.limit ? "var(--color-warning)" : "var(--color-text)" }}>
              {c.limit === null ? `${c.used} · ${t.unlimited}` : `${c.used} / ${c.limit}`}
            </span>
          </div>
        ))}
        <div className="capacity-row"><span>{t.runner}</span><span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--color-text-muted)" }}><X size={14} /> {t.disabled}</span></div>
        <div className="capacity-row"><span>{t.evidence}</span><span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--color-success)" }}><Check size={14} /> {t.enabled}</span></div>
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button className="btn btn-secondary btn-sm" disabled>{t.reviewCatalog}</button>
        <button className="btn btn-primary btn-sm" disabled>{t.increaseCapacity}</button>
      </div>
      <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>{t.note}</p>
    </div>
  );
}

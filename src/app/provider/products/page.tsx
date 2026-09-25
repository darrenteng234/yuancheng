import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { DEMO_PRODUCTS, money } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

export default async function ProviderProducts() {
  const t = getProviderDict(await providerLang()).products;
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title={t.title} subtitle={t.subtitle}
        actions={<Link href="/provider/products/new" className="btn btn-primary btn-sm"><Plus size={15} /> {t.add}</Link>} />
      {DEMO_PRODUCTS.length === 0 ? (
        <div className="state-block"><Package size={32} className="state-icon" /><h3>{t.empty}</h3><p>{t.emptyBody}</p></div>
      ) : (
        DEMO_PRODUCTS.map((p) => (
          <div key={p.slug} className="order-row">
            <div className="order-row-main">
              <span className="order-row-title">{p.name}</span>
              <span className="order-row-meta">{money(p.price, p.currency)} · {t.contactProvider}</span>
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
              <span className="sbadge sbadge--muted"><Package size={13} /> {t.physical}</span>
              <span className="sbadge sbadge--success">{t.published}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

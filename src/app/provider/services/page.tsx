import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { DEMO_SERVICES, getPlace, packagesByService } from "@/lib/demo/catalog";
import { PageHeader, EvidenceBadge } from "@/components/ui";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

export default async function ProviderServices() {
  const lang = await providerLang();
  const t = getProviderDict(lang).services;
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title={t.title} subtitle={t.subtitle}
        actions={<Link href="/provider/services/new" className="btn btn-primary btn-sm"><Plus size={15} /> {t.create}</Link>} />
      {DEMO_SERVICES.length === 0 ? (
        <div className="state-block"><h3>{t.empty}</h3><Link href="/provider/services/new" className="btn btn-primary btn-sm">{t.emptyCta}</Link></div>
      ) : (
        DEMO_SERVICES.map((s) => {
          const place = getPlace(s.placeSlug);
          const pkgs = packagesByService(s.slug);
          return (
            <div key={s.slug} className="order-row">
              <div className="order-row-main">
                <span className="order-row-title">{s.name}</span>
                {place ? <span className="order-row-meta"><MapPin size={12} style={{ verticalAlign: "-2px" }} /> {place.name} · {pkgs.length} {t.packages}</span> : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <EvidenceBadge evidence={s.evidence} locale={lang} />
                <span className="sbadge sbadge--success">{t.published}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

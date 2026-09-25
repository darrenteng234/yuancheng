import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

export default async function NewProduct() {
  const t = getProviderDict(await providerLang()).products;
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 640, margin: "0 auto" }}>
      <Link href="/provider/products" className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}><ArrowLeft size={15} /> {t.title}</Link>
      <PageHeader title={t.newTitle} subtitle={t.newSub} />
      <div className="checkout-step">
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div><label className="form-label">{t.name}</label><input className="form-input" /></div>
          <div><label className="form-label">{t.description}</label><textarea className="form-input" rows={3} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div><label className="form-label">{t.priceRM}</label><input className="form-input" type="number" /></div>
            <div><label className="form-label">{t.status}</label><select className="form-input"><option>{t.published}</option><option>{t.draft}</option></select></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
          <button className="btn btn-primary" disabled>{t.save}</button>
          <Link href="/provider/products" className="btn btn-secondary">{t.title}</Link>
        </div>
        <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>{t.demoNote}</p>
      </div>
    </div>
  );
}

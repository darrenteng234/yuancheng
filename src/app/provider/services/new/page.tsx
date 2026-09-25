import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

export default async function NewService() {
  const t = getProviderDict(await providerLang()).services;
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 720, margin: "0 auto" }}>
      <Link href="/provider/services" className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}><ArrowLeft size={15} /> {t.title}</Link>
      <PageHeader title={t.newTitle} subtitle={t.newSub} />
      <div className="checkout-step">
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div><label className="form-label">{t.name}</label><input className="form-input" /></div>
          <div><label className="form-label">{t.description}</label><textarea className="form-input" rows={3} /></div>
          <div><label className="form-label">{t.guidance}</label><textarea className="form-input" rows={2} /></div>
          <div><label className="form-label">{t.placeField}</label><select className="form-input"><option>Golden Lotus Temple — Kuala Lumpur</option></select></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div><label className="form-label">{t.evidence}</label><select className="form-input"><option>{t.evidence}</option></select></div>
            <div><label className="form-label">{t.visibility}</label><select className="form-input"><option>{t.auto}</option><option>{t.approval}</option></select></div>
          </div>
          <div><label className="form-label">{t.customerPhoto}</label><select className="form-input"><option>{t.off}</option><option>{t.optional}</option><option>{t.required}</option></select></div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
          <button className="btn btn-primary" disabled>{t.save}</button>
          <Link href="/provider/services" className="btn btn-secondary">{t.cancel}</Link>
        </div>
        <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>{t.demoNote}</p>
      </div>
    </div>
  );
}

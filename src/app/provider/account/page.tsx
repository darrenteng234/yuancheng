import { ShieldCheck, Landmark, QrCode, Plus } from "lucide-react";
import { DEMO_PROVIDERS, DEMO_PAYMENT_METHOD } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

export default async function ProviderAccount() {
  const t = getProviderDict(await providerLang()).acct;
  const p = DEMO_PROVIDERS[0];
  const verifications = [
    { type: t.identity, state: t.verified, tone: "success" },
    { type: t.business, state: t.verified, tone: "success" },
    { type: t.physicalLocation, state: t.pending, tone: "warning" },
  ];
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 760, margin: "0 auto" }}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <div className="acct-section">
        <h2>{t.businessInfo}</h2>
        <dl className="pay-method-grid">
          <div><dt>{t.businessName}</dt><dd>{p.name}</dd></div>
          <div><dt>{t.location}</dt><dd>{p.location}, Malaysia</dd></div>
        </dl>
      </div>
      <div className="acct-section">
        <h2>{t.verification}</h2>
        {verifications.map((v) => (
          <div key={v.type} className="capacity-row">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {v.tone === "success" ? <ShieldCheck size={16} style={{ color: "var(--color-success)" }} /> : null}{v.type}
            </span>
            <span className={`sbadge sbadge--${v.tone}`}>{v.state}</span>
          </div>
        ))}
        <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>{t.verificationNote}</p>
      </div>
      <div className="acct-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ marginBottom: 0 }}>{t.paymentMethods}</h2>
          <button className="btn btn-secondary btn-sm" disabled><Plus size={14} /> {t.addMethod}</button>
        </div>
        <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: "var(--space-3) 0 var(--space-4)" }}>{t.paymentNote}</p>
        <div className="pay-method" style={{ marginBottom: "var(--space-3)" }}>
          <div className="pay-method-head"><Landmark size={18} /> {DEMO_PAYMENT_METHOD.bank_name}</div>
          <dl className="pay-method-grid">
            <div><dt>{t.accountName}</dt><dd>{DEMO_PAYMENT_METHOD.account_name}</dd></div>
            <div><dt>{t.accountNumber}</dt><dd>{DEMO_PAYMENT_METHOD.account_number}</dd></div>
          </dl>
        </div>
        <div className="pay-method">
          <div className="pay-method-head"><QrCode size={18} /> {t.duitnow}</div>
          <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>{DEMO_PAYMENT_METHOD.display_name}</p>
        </div>
      </div>
      <div className="acct-section">
        <h2>{t.security}</h2>
        <div className="capacity-row"><span>{t.email}</span><span className="text-muted">sales.provider@yuancheng.demo</span></div>
        <div className="capacity-row"><span>{t.password}</span><button className="disc-card-cta" disabled style={{ background: "none" }}>{t.change}</button></div>
      </div>
    </div>
  );
}

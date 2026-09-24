import { ShieldCheck, Landmark, QrCode, Plus } from "lucide-react";
import { DEMO_PROVIDERS, DEMO_PAYMENT_METHOD } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";

const VERIFICATIONS = [
  { type: "Identity", state: "Verified", tone: "success" },
  { type: "Business", state: "Verified", tone: "success" },
  { type: "Physical location", state: "Pending", tone: "warning" },
];

export default function ProviderAccount() {
  const p = DEMO_PROVIDERS[0];
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 760, margin: "0 auto" }}>
      <PageHeader title="Account" subtitle="Business details, verification and how customers pay you." />

      <div className="acct-section">
        <h2>Business information</h2>
        <dl className="pay-method-grid">
          <div><dt>Business name</dt><dd>{p.name}</dd></div>
          <div><dt>Location</dt><dd>{p.location}, Malaysia</dd></div>
        </dl>
      </div>

      <div className="acct-section">
        <h2>Verification</h2>
        {VERIFICATIONS.map((v) => (
          <div key={v.type} className="capacity-row">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {v.tone === "success" ? <ShieldCheck size={16} style={{ color: "var(--color-success)" }} /> : null}{v.type}
            </span>
            <span className={`sbadge sbadge--${v.tone}`}>{v.state}</span>
          </div>
        ))}
        <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>
          Verified provider. Verification confirms identity and business — it is not an endorsement by any place, and Yuancheng does not guarantee outcomes.
        </p>
      </div>

      <div className="acct-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ marginBottom: 0 }}>Payment methods</h2>
          <button className="btn btn-secondary btn-sm" disabled><Plus size={14} /> Add method</button>
        </div>
        <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: "var(--space-3) 0 var(--space-4)" }}>
          How customers pay you directly (Stage 1). This is your account — not a Yuancheng payout account.
        </p>
        <div className="pay-method" style={{ marginBottom: "var(--space-3)" }}>
          <div className="pay-method-head"><Landmark size={18} /> {DEMO_PAYMENT_METHOD.bank_name}</div>
          <dl className="pay-method-grid">
            <div><dt>Account name</dt><dd>{DEMO_PAYMENT_METHOD.account_name}</dd></div>
            <div><dt>Account number</dt><dd>{DEMO_PAYMENT_METHOD.account_number}</dd></div>
          </dl>
        </div>
        <div className="pay-method">
          <div className="pay-method-head"><QrCode size={18} /> DuitNow QR</div>
          <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>{DEMO_PAYMENT_METHOD.display_name}</p>
        </div>
      </div>

      <div className="acct-section">
        <h2>Security</h2>
        <div className="capacity-row"><span>Email</span><span className="text-muted">sales.provider@yuancheng.demo</span></div>
        <div className="capacity-row"><span>Password</span><button className="disc-card-cta" disabled style={{ background: "none" }}>Change</button></div>
      </div>
    </div>
  );
}

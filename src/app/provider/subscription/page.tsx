import { Check, X } from "lucide-react";
import { DEMO_SERVICES, DEMO_PRODUCTS } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";

export default function ProviderSubscription() {
  // Fixture entitlements (Free plan). Over-limit would warn, never auto-unpublish.
  const caps = [
    { label: "Services", used: DEMO_SERVICES.length, limit: 3 },
    { label: "Products", used: DEMO_PRODUCTS.length, limit: null as number | null },
    { label: "Staff", used: 0, limit: 0 },
  ];
  const overLimit = caps.some((c) => c.limit !== null && c.used > c.limit);

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 720, margin: "0 auto" }}>
      <PageHeader title="Subscription" subtitle="Your plan and capacity." />

      <div className="acct-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>Free</div>
            <div className="text-muted">Free during beta · Platform commission 0%</div>
          </div>
          <span className="sbadge sbadge--success">Active</span>
        </div>
      </div>

      {overLimit ? (
        <div className="banner-review" style={{ marginBottom: "var(--space-5)" }}>
          You’re currently over your plan allowance. Existing listings stay active — review your catalog or increase capacity.
        </div>
      ) : null}

      <div className="acct-section">
        <h2>Capacity</h2>
        {caps.map((c) => (
          <div key={c.label} className="capacity-row">
            <span>{c.label}</span>
            <span style={{ fontWeight: 600, color: c.limit !== null && c.used > c.limit ? "var(--color-warning)" : "var(--color-text)" }}>
              {c.limit === null ? `${c.used} · unlimited` : `${c.used} / ${c.limit}`}
            </span>
          </div>
        ))}
        <div className="capacity-row"><span>Runner</span><span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--color-text-muted)" }}><X size={14} /> Disabled</span></div>
        <div className="capacity-row"><span>Evidence</span><span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--color-success)" }}><Check size={14} /> Enabled</span></div>
      </div>

      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button className="btn btn-secondary btn-sm" disabled>Review catalog</button>
        <button className="btn btn-primary btn-sm" disabled>Increase capacity</button>
      </div>
      <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>Paid plans and pricing are not enabled in the beta.</p>
    </div>
  );
}

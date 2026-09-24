import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DEMO_PROVIDERS, DEMO_SERVICES, DEMO_PRODUCTS } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";

export default function ProviderStorefront() {
  const p = DEMO_PROVIDERS[0];
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 900, margin: "0 auto" }}>
      <PageHeader title="Storefront" subtitle="What your customers see."
        actions={<Link href={`/en/providers/${p.slug}`} target="_blank" className="btn btn-secondary btn-sm"><ExternalLink size={15} /> Preview storefront</Link>} />

      <div className="acct-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ marginBottom: 0 }}>Business profile</h2>
          <span className="sbadge sbadge--success">Published</span>
        </div>
        <dl className="pay-method-grid" style={{ marginTop: "var(--space-4)" }}>
          <div><dt>Business name</dt><dd>{p.name}</dd></div>
          <div><dt>Location</dt><dd>{p.location}, Malaysia</dd></div>
        </dl>
        <div style={{ marginTop: "var(--space-4)" }}>
          <dt style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>About</dt>
          <p style={{ marginTop: 6, color: "var(--color-text-secondary)" }}>{p.about.en}</p>
        </div>
      </div>

      <div className="acct-section">
        <h2>Services ({DEMO_SERVICES.length})</h2>
        {DEMO_SERVICES.map((s) => <div key={s.slug} className="capacity-row"><span>{s.name}</span><Link href="/provider/services" className="disc-card-cta">Manage</Link></div>)}
      </div>

      <div className="acct-section">
        <h2>Products ({DEMO_PRODUCTS.length})</h2>
        {DEMO_PRODUCTS.map((pr) => <div key={pr.slug} className="capacity-row"><span>{pr.name}</span><Link href="/provider/products" className="disc-card-cta">Manage</Link></div>)}
      </div>

      <div className="acct-section">
        <h2>Fulfilment information</h2>
        <p className="text-muted">Orders are fulfilled by the provider. Payment is made directly to the provider (Stage 1).</p>
      </div>
    </div>
  );
}

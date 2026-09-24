import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { DEMO_SERVICES, getPlace, packagesByService } from "@/lib/demo/catalog";
import { PageHeader, EvidenceBadge } from "@/components/ui";

export default function ProviderServices() {
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title="Services" subtitle="Your service listings and their packages."
        actions={<Link href="/provider/services/new" className="btn btn-primary btn-sm"><Plus size={15} /> Create service</Link>} />
      {DEMO_SERVICES.length === 0 ? (
        <div className="state-block"><h3>No services yet</h3><p>Create your first service to start taking orders.</p><Link href="/provider/services/new" className="btn btn-primary btn-sm">Create your first service</Link></div>
      ) : (
        DEMO_SERVICES.map((s) => {
          const place = getPlace(s.placeSlug);
          const pkgs = packagesByService(s.slug);
          return (
            <div key={s.slug} className="order-row">
              <div className="order-row-main">
                <span className="order-row-title">{s.name}</span>
                {place ? <span className="order-row-meta"><MapPin size={12} style={{ verticalAlign: "-2px" }} /> {place.name} · {pkgs.length} package{pkgs.length === 1 ? "" : "s"}</span> : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <EvidenceBadge evidence={s.evidence} />
                <span className="sbadge sbadge--success">Published</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

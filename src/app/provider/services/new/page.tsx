import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";

// Service editor (fixture stub — fields mirror the canonical model; not persisted).
export default function NewService() {
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 720, margin: "0 auto" }}>
      <Link href="/provider/services" className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}><ArrowLeft size={15} /> Services</Link>
      <PageHeader title="Create service" subtitle="Describe the service. Packages are added after saving." />
      <div className="checkout-step">
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div><label className="form-label">Service name</label><input className="form-input" placeholder="e.g. Temple Offering Service" /></div>
          <div><label className="form-label">Description</label><textarea className="form-input" rows={3} /></div>
          <div><label className="form-label">Request guidance (shown to the customer)</label><textarea className="form-input" rows={2} /></div>
          <div><label className="form-label">Place</label><select className="form-input"><option>Golden Lotus Temple — Kuala Lumpur</option><option>No place (general service)</option></select></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div><label className="form-label">Evidence</label><select className="form-input"><option>None</option><option>Photo</option><option>Photo + video</option></select></div>
            <div><label className="form-label">Customer visibility</label><select className="form-input"><option>Automatic</option><option>Approval required</option></select></div>
          </div>
          <div><label className="form-label">Customer photo</label><select className="form-input"><option>Off</option><option>Optional</option><option>Required</option></select></div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
          <button className="btn btn-primary" disabled>Save service</button>
          <Link href="/provider/services" className="btn btn-secondary">Cancel</Link>
        </div>
        <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>Demo: saving is disabled until repositories are wired.</p>
      </div>
    </div>
  );
}

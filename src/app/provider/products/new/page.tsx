import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";

export default function NewProduct() {
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 640, margin: "0 auto" }}>
      <Link href="/provider/products" className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}><ArrowLeft size={15} /> Products</Link>
      <PageHeader title="Add product" subtitle="Physical product — sold outside Yuancheng (Contact provider)." />
      <div className="checkout-step">
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div><label className="form-label">Product name</label><input className="form-input" placeholder="e.g. Blessing Set" /></div>
          <div><label className="form-label">Description</label><textarea className="form-input" rows={3} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div><label className="form-label">Price (RM)</label><input className="form-input" type="number" placeholder="68" /></div>
            <div><label className="form-label">Status</label><select className="form-input"><option>Published</option><option>Draft</option></select></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
          <button className="btn btn-primary" disabled>Save product</button>
          <Link href="/provider/products" className="btn btn-secondary">Cancel</Link>
        </div>
        <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>Demo: no cart, checkout, payment, shipping or inventory. Save disabled until repositories are wired.</p>
      </div>
    </div>
  );
}

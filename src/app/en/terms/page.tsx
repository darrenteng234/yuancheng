import Link from "next/link";

export default function EnTermsPage() {
  return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: "var(--space-8)" }}>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--stone-900)", marginBottom: "var(--space-2)" }}>Terms of Service</h1>
          <p style={{ color: "var(--stone-500)", fontSize: "var(--text-sm)" }}>Last updated: June 2026</p>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--amber-700)", marginBottom: "var(--space-3)" }}>1. Service Scope</h2>
            <p style={{ color: "var(--stone-600)", lineHeight: 1.8 }}>
              YUANCHENG provides a platform connecting believers with trusted runners who perform temple-related services on their behalf. We facilitate offerings, prayers, and rituals at temples across the region. We act as an intermediary service provider.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--amber-700)", marginBottom: "var(--space-3)" }}>2. No Guarantee of Spiritual Outcomes</h2>
            <p style={{ color: "var(--stone-600)", lineHeight: 1.8 }}>
              We do not guarantee any religious, spiritual, or supernatural outcomes from the services performed. Results of prayers, offerings, and rituals are beyond our control. We ensure the service is performed as requested, but make no promises regarding spiritual efficacy.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--amber-700)", marginBottom: "var(--space-3)" }}>3. Payment & Pricing</h2>
            <p style={{ color: "var(--stone-600)", lineHeight: 1.8 }}>
              All prices are listed in Malaysian Ringgit (RM). Payment is processed securely via Stripe. The total amount includes the package price. Additional costs incurred by runners (transport, materials) are reimbursed separately with receipt verification.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--amber-700)", marginBottom: "var(--space-3)" }}>4. Refund Policy</h2>
            <p style={{ color: "var(--stone-600)", lineHeight: 1.8 }}>
              Refunds are available within 7 days of order placement if the service has not yet been performed. Once a runner has been assigned and begun the service, no refund is available. Disputed orders will be reviewed within 3 business days. See our <Link href="/en/refund" style={{ color: "var(--amber-600)", textDecoration: "underline" }}>Refund Policy</Link> for details.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--amber-700)", marginBottom: "var(--space-3)" }}>5. Runner Conduct</h2>
            <p style={{ color: "var(--stone-600)", lineHeight: 1.8 }}>
              All runners are vetted and trained. They are required to follow standard operating procedures and provide photo/video evidence of completed services. Misconduct or fraud will result in immediate termination and potential legal action.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--amber-700)", marginBottom: "var(--space-3)" }}>6. Limitation of Liability</h2>
            <p style={{ color: "var(--stone-600)", lineHeight: 1.8 }}>
              YUANCHENG is not liable for any damages arising from the use of our services, including but not limited to spiritual dissatisfaction, travel disruptions, or temple policy changes beyond our control.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-body">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--amber-700)", marginBottom: "var(--space-3)" }}>7. Contact</h2>
            <p style={{ color: "var(--stone-600)", lineHeight: 1.8 }}>
              For questions about these terms, please <Link href="/en/temple-request" style={{ color: "var(--amber-600)", textDecoration: "underline" }}>contact us</Link>.
            </p>
          </div>
        </div>

        <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
          <Link href="/en" className="btn btn-secondary">← Back to Home</Link>
        </div>
      </div>
    </section>
  );
}

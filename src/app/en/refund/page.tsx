import Link from "next/link";

export default function RefundPage() {
  return (
    <>
      <section style={{
        background: "linear-gradient(135deg, var(--stone-900) 0%, var(--earth-900) 50%, var(--amber-900) 100%)",
        color: "white",
        padding: "var(--space-10) 0",
        textAlign: "center",
      }}>
        <div className="container">
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-3)" }}>
            Refund Policy
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "var(--text-lg)" }}>
            Fair, transparent, and clear.
          </p>
        </div>
      </section>

      <section style={{ padding: "var(--space-10) 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Refund Window</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  If your order has <strong>not yet started</strong>, you may request a full refund within 7 calendar days of placing the order. Orders past the 7-day window but not yet started will be reviewed on a case-by-case basis.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>After Service Completion</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  Once the runner has completed the ritual and delivered the evidence, the order is considered fulfilled. Completed services are <strong>non-refundable</strong>. We encourage you to review the package details carefully before placing your order.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Dispute Resolution</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  If you have concerns about the service quality (e.g., evidence does not match the order, ritual not performed as agreed), please contact us within 48 hours of receiving the evidence. Our team will review and respond within <strong>3 business days</strong>.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Refund Method</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  Refunds are processed via the <strong>original payment method</strong>. Bank transfer refunds typically take 5-7 business days to appear, depending on your bank&apos;s processing time. Stripe credit card refunds may take an additional 1-3 business days.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Contact Us</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  To request a refund or raise a dispute, please reach out through our temple request page. We are committed to handling every request with fairness and respect.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
            <Link href="/en" className="btn btn-secondary">← Back to Home</Link>
          </div>
        </div>
      </section>
    </>
  );
}

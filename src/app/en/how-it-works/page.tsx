import Link from "next/link";

const steps = [
  {
    num: "1",
    icon: "🔍",
    title: "Browse & Choose",
    description: "Explore our list of verified temples. Pick the one that matches your spiritual needs.",
    details: ["View temple details and photos", "See available service packages", "Read about each temple's history"],
  },
  {
    num: "2",
    icon: "📦",
    title: "Select Your Package",
    description: "Choose a service package that fits your intention — from simple offerings to full ceremonies.",
    details: ["Basic, Standard, or Premium packages", "Clear pricing with no hidden fees", "Custom instructions supported"],
  },
  {
    num: "3",
    icon: "💳",
    title: "Place Your Order",
    description: "Fill in your details and make a secure payment. Your funds are held safely until completion.",
    details: ["Secure payment processing", "Funds held in escrow", "Instant order confirmation"],
  },
  {
    num: "4",
    icon: "🏃",
    title: "Runner Assigned",
    description: "We assign a verified local runner to your order. They prepare and travel to the temple.",
    details: ["Verified and trained runners", "Real-time order tracking", "Direct communication via WhatsApp"],
  },
  {
    num: "5",
    icon: "🙏",
    title: "Ritual Performed",
    description: "Your runner performs the ritual at the temple following our strict SOP guidelines.",
    details: ["Follows temple-specific SOP", "Respectful and professional", "Every step documented"],
  },
  {
    num: "6",
    icon: "📸",
    title: "Evidence & Verification",
    description: "Receive photo and video evidence with a unique QR verification code.",
    details: ["Photo + video proof", "Unique QR verification code", "Review and confirm completion"],
  },
];

export default function HowItWorksPage() {
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
            How It Works
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "var(--text-lg)", maxWidth: 560, margin: "0 auto" }}>
            From choosing your temple to receiving verified evidence — here&apos;s how YUANCHENG works.
          </p>
        </div>
      </section>

      <section style={{ padding: "var(--space-8) 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{
              display: "flex",
              gap: "var(--space-5)",
              marginBottom: i < steps.length - 1 ? "var(--space-8)" : 0,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--amber-500), var(--amber-600))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
                color: "white",
                fontWeight: 700,
              }}>
                {step.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: 24 }}>{step.icon}</span>
                  <h3 style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{step.title}</h3>
                </div>
                <p className="text-muted" style={{ marginBottom: "var(--space-3)", lineHeight: 1.6 }}>
                  {step.description}
                </p>
                <ul style={{ paddingLeft: "var(--space-5)", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                  {step.details.map((d, j) => (
                    <li key={j} style={{ marginBottom: "var(--space-1)" }}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        background: "var(--stone-50)",
        padding: "var(--space-12) 0",
        textAlign: "center",
      }}>
        <div className="container">
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
            Ready to Get Started?
          </h2>
          <p className="text-muted" style={{ marginBottom: "var(--space-5)" }}>
            Browse our temples and place your first order today.
          </p>
          <Link href="/en/temples" className="btn btn-primary btn-lg">
            Browse Temples →
          </Link>
        </div>
      </section>

      <div style={{ height: "var(--space-10)" }} />
    </>
  );
}

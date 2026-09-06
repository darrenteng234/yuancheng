import Link from "next/link";

export default function AboutPage() {
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
            About Us
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "var(--text-lg)" }}>
            Where devotion meets dedication.
          </p>
        </div>
      </section>

      <section style={{ padding: "var(--space-10) 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Who We Are</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  YUANCHENG is a trusted temple proxy prayer service platform. We connect believers with verified local runners who perform rituals, offerings, and prayers at temples in Bangkok and beyond. Our mission is simple: to ensure every sincere wish finds its way to the temple, no matter where you are in the world.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Why We Exist</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  Faith should not be limited by distance. Whether you are unable to travel due to distance, health, or time constraints, YUANCHENG bridges the gap between your devotion and the temple. Our runners carry your wishes to sacred spaces with the utmost respect and care.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>How It Works</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)", marginBottom: "var(--space-3)" }}>
                  Three simple steps to fulfill your devotion:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--amber-100)",
                      color: "var(--amber-800)",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      flexShrink: 0,
                    }}>1</span>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>Choose a temple &amp; package</strong> — Browse our temple listings and select the ritual package that matches your needs.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--amber-100)",
                      color: "var(--amber-800)",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      flexShrink: 0,
                    }}>2</span>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>Runner performs the ritual</strong> — Our verified runner visits the temple and carries out the ceremony according to your wishes.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--amber-100)",
                      color: "var(--amber-800)",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      flexShrink: 0,
                    }}>3</span>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>Evidence delivered</strong> — You receive photo and video evidence confirming the ritual was completed with care.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Our Values</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "var(--space-1)", fontSize: "var(--text-base)" }}>🙏 Respect</h3>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      Every order is treated with the highest level of reverence. Each ritual is performed according to traditional customs — never rushed, never careless.
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "var(--space-1)", fontSize: "var(--text-base)" }}>🔍 Transparency</h3>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      From placement to completion, every step is trackable. We provide real photo and video evidence so you can have complete peace of mind.
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "var(--space-1)", fontSize: "var(--text-base)" }}>⚖; No Overpromising</h3>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      We do only what we can deliver. We make no guarantees of spiritual outcomes. The result of faith depends on each individual&apos;s own karma and devotion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
            <p className="text-muted" style={{ marginBottom: "var(--space-3)" }}>
              Let every sincere wish find its home.
            </p>
            <Link href="/en/temples" className="btn btn-primary">Browse Temples</Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { getTemples, getPackages } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function EnHomePage() {
  const temples = await getTemples();
  const packages = await getPackages();

  const sortedTemples = [...temples].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;
    return a.name.localeCompare(b.name);
  });

  const templePrices = new Map<string, number>();
  const templePackageCounts = new Map<string, number>();
  packages.forEach((pkg) => {
    if (pkg.status === "active") {
      templePackageCounts.set(pkg.temple_id, (templePackageCounts.get(pkg.temple_id) || 0) + 1);
      const current = templePrices.get(pkg.temple_id);
      if (current === undefined || pkg.selling_price < current) {
        templePrices.set(pkg.temple_id, pkg.selling_price);
      }
    }
  });

  const templeIcons: Record<string, string> = {
    "Erawan Shrine": "⛩️",
    "Wat Pho": "🏛️",
    "Wat Arun": "🏯",
  };

  const templeDescriptions: Record<string, string> = {
    "Erawan Shrine": "Four-Faced Brahma shrine in central Bangkok. Known for career, wealth, health, and relationships.",
    "Wat Pho": "One of Bangkok's oldest temples, serene and sacred.",
    "Wat Arun": "Temple of Dawn by the river. Where sincerity meets spirit.",
  };

  return (
    <>
      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, var(--stone-900) 0%, var(--stone-800) 50%, var(--earth-700) 100%)",
        color: "white", padding: "var(--space-12) 0", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, fontSize: 180, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 30, pointerEvents: "none" }}>
          ⛩️ 🕉️ 🪔 🙏 🌸
        </div>
        <div className="container" style={{ position: "relative" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-10)", alignItems: "center" }}>
            <div>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <span className="badge badge-amber" style={{ fontSize: "var(--text-sm)", padding: "var(--space-1) var(--space-4)" }}>Trusted by believers, verified with care</span>
              </div>
              <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: "var(--space-5)" }}>
                Your prayers,<br /><span style={{ color: "var(--amber-400)" }}>fulfilled with care.</span>
              </h1>
              <p style={{ fontSize: "var(--text-lg)", color: "rgba(255,255,255,0.7)", marginBottom: "var(--space-6)", lineHeight: 1.7 }}>
                Connecting you with verified local runners at Bangkok temples. Every order includes photo and video evidence — so you know it was done right.
              </p>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
                <Link href="/en/temples" className="btn btn-primary btn-lg">Browse Temples</Link>
                <Link href="/en/temple-request" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>Request Temple</Link>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                {[
                  { href: "/en/temples?intent=business", emoji: "💼", label: "Career" },
                  { href: "/en/temples?intent=health", emoji: "💗", label: "Health" },
                  { href: "/en/temples?intent=love", emoji: "💕", label: "Love" },
                  { href: "/en/temples?intent=luck", emoji: "🍀", label: "Luck" },
                  { href: "/en/temples?intent=vow", emoji: "🌻", label: "Vow" },
                ].map((item) => (
                  <Link key={item.label} href={item.href} style={{ padding: "var(--space-2) var(--space-4)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "var(--radius-full)", color: "rgba(255,255,255,0.8)", fontSize: "var(--text-sm)", fontWeight: 500 }}>
                    {item.emoji} {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src="/josstick-hero.png" alt="Burning joss sticks" style={{ maxWidth: "100%", height: "auto", maxHeight: 420, objectFit: "contain", filter: "drop-shadow(0 0 30px rgba(184,134,11,0.25))" }} />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section style={{ padding: "var(--space-10) 0" }}>
        <div className="container">
          <div className="grid grid-4 text-center">
            {[
              { icon: "📸", title: "Photo & Video Proof", desc: "Every order includes photos and video with unique verification code" },
              { icon: "🙏", title: "Verified Runners", desc: "Trained local runners who know each temple's customs" },
              { icon: "🔒", title: "Order Tracking", desc: "Track your order in real-time, from placement to completion" },
              { icon: "📋", title: "Standard Process", desc: "Every ritual follows our team-approved standard procedures" },
            ].map((item) => (
              <div key={item.title} className="card" style={{ padding: "var(--space-5)" }}>
                <div style={{ fontSize: 36, marginBottom: "var(--space-3)" }}>{item.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "var(--space-1)" }}>{item.title}</div>
                <div className="text-sm text-muted">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLES */}
      <section style={{ padding: "var(--space-10) 0", background: "var(--stone-50)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>Bangkok Temples</h2>
            <p className="text-muted">Trusted temples, proper rituals</p>
          </div>
          <div className="grid grid-3">
            {sortedTemples.map((temple) => {
              const pkgCount = templePackageCounts.get(temple.id) || 0;
              const fromPrice = templePrices.get(temple.id);
              const icon = templeIcons[temple.name] || "⛩️";
              const desc = templeDescriptions[temple.name] || "";
              const isActive = temple.status === "active";
              return (
                <Link key={temple.id} href={`/en/temples/${temple.id}`} className="card" style={{ overflow: "hidden", cursor: "pointer", textDecoration: "none", opacity: isActive ? 1 : 0.6 }}>
                  <div style={{ height: 180, background: isActive ? "linear-gradient(135deg, var(--earth-100), var(--amber-100))" : "var(--stone-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, position: "relative" }}>
                    {icon}
                    {!isActive && <span className="badge badge-orange" style={{ position: "absolute", top: "var(--space-3)", right: "var(--space-3)" }}>Coming Soon</span>}
                  </div>
                  <div className="card-body">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-1)" }}>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>{temple.name}</div>
                      <span className="badge badge-brown">{temple.verification_status === "verified" ? "Verified" : "Pending"}</span>
                    </div>
                    <div className="text-sm text-muted" style={{ marginBottom: "var(--space-2)" }}>📍 {temple.city}, {temple.country}</div>
                    <div className="text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "var(--space-3)", minHeight: 42 }}>{desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-xs text-muted">{pkgCount} packages</span>
                      {fromPrice !== undefined && <span style={{ fontWeight: 700, color: "var(--amber-700)" }}>From RM{fromPrice}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <Link href="/en/temple-request" className="btn btn-secondary">Can't find your temple? Request it →</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "var(--space-10) 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>How It Works</h2>
            <p className="text-muted">Simple, transparent, respectful</p>
          </div>
          <div className="grid grid-4 text-center">
            {[
              { num: "1️⃣", title: "Choose", desc: "Select a temple and package. Tell us your prayer intention." },
              { num: "2️⃣", title: "Pay", desc: "Secure payment. Funds held until your order is completed." },
              { num: "3️⃣", title: "Perform", desc: "Verified runner performs the ritual at the temple." },
              { num: "4️⃣", title: "Verify", desc: "Receive photos, video, and unique verification code." },
            ].map((step) => (
              <div key={step.num} className="card" style={{ padding: "var(--space-6)" }}>
                <div style={{ fontSize: 36, marginBottom: "var(--space-3)" }}>{step.num}</div>
                <div style={{ fontWeight: 700, marginBottom: "var(--space-1)" }}>{step.title}</div>
                <div className="text-sm text-muted">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, var(--amber-700), var(--amber-600))", padding: "var(--space-10) 0", textAlign: "center", color: "white" }}>
        <div className="container">
          <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Ready to proceed?</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "var(--space-6)", fontSize: "var(--text-lg)" }}>Browse temples. Pray with sincerity.</p>
          <Link href="/en/temples" className="btn" style={{ background: "white", color: "var(--amber-800)", fontWeight: 700, padding: "var(--space-4) var(--space-8)" }}>Browse Temples</Link>
        </div>
      </section>
    </>
  );
}

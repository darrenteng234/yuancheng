import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const features = [
    { icon: "🪷", title: t.home.featureFulfilment, desc: t.home.featureFulfilmentDesc },
    { icon: "📷", title: t.home.featureEvidence, desc: t.home.featureEvidenceDesc },
    { icon: "📦", title: t.home.featureTracking, desc: t.home.featureTrackingDesc },
  ];
  return (
    <div className="container" style={{ paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)", maxWidth: 820 }}>
      <header style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--text-5xl)", fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>{t.home.heroTitle}</h1>
        <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-secondary)", marginTop: "var(--space-3)", maxWidth: "56ch", marginInline: "auto" }}>{t.home.heroSubtitle}</p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", marginTop: "var(--space-6)", flexWrap: "wrap" }}>
          <Link href={`/${locale}/how-it-works`} className="btn btn-primary btn-lg">{t.home.ctaDiscover}</Link>
          <Link href="/provider" className="btn btn-secondary btn-lg">{t.home.ctaProvider}</Link>
        </div>
      </header>
      <section className="grid grid-3" style={{ marginTop: "var(--space-16)" }}>
        {features.map((f) => (
          <div key={f.title} className="card"><div className="card-body">
            <div style={{ fontSize: "var(--text-2xl)" }} aria-hidden>{f.icon}</div>
            <div style={{ fontWeight: 600, marginTop: "var(--space-2)" }}>{f.title}</div>
            <p className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>{f.desc}</p>
          </div></div>
        ))}
      </section>
    </div>
  );
}

import { getDictionary } from "@/lib/i18n";

export default async function HowItWorks({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <div className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", maxWidth: 640 }}>
      <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700 }}>{t.howItWorks.title}</h1>
      <p className="text-muted" style={{ marginTop: "var(--space-2)", marginBottom: "var(--space-8)" }}>{t.howItWorks.intro}</p>
      <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {t.howItWorks.steps.map((s, i) => (
          <li key={i} className="card"><div className="card-body" style={{ display: "flex", gap: "var(--space-4)" }}>
            <span aria-hidden style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "var(--radius-full)", background: "var(--color-primary)", color: "var(--color-on-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{i + 1}</span>
            <div><div style={{ fontWeight: 600 }}>{s.title}</div><p className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>{s.body}</p></div>
          </div></li>
        ))}
      </ol>
    </div>
  );
}

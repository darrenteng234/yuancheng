import { getDictionary } from "@/lib/i18n";

export default async function Faq({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <div className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", maxWidth: 640 }}>
      <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: "var(--space-6)" }}>{t.faq.title}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {t.faq.items.map((it, i) => (
          <div key={i} className="card"><div className="card-body">
            <div style={{ fontWeight: 600 }}>{it.q}</div>
            <p className="text-sm text-muted" style={{ marginTop: "var(--space-1)" }}>{it.a}</p>
          </div></div>
        ))}
      </div>
    </div>
  );
}

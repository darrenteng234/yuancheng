import { getDictionary } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <div className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", maxWidth: 640 }}>
      <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>{t.refund.title}</h1>
      <p style={{ color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{t.refund.body}</p>
    </div>
  );
}

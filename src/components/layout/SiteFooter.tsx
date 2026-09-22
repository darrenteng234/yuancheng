import Link from "next/link";
import { getDictionary, LOCALES, LOCALE_LABELS, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale } from "@/types/platform";

/** Shared customer footer. Server component; locale-aware. */
export function SiteFooter({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const col = { display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" } as const;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid grid-4" style={{ gap: "var(--space-8)", marginBottom: "var(--space-8)" }}>
          <div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--amber-400)", marginBottom: "var(--space-3)" }}>⛩️ {t.common.appName}</div>
            <p style={{ color: "var(--stone-400)", lineHeight: 1.7, fontSize: "var(--text-sm)" }}>{t.common.tagline}</p>
          </div>
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>{t.nav.howItWorks}</h4>
            <Link href={`/${locale}/how-it-works`} style={col}>{t.nav.howItWorks}</Link>
            <Link href={`/${locale}/faq`} style={col}>{t.nav.faq}</Link>
            <Link href="/orders/track" style={col}>{t.nav.myOrders}</Link>
          </div>
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>Yuancheng</h4>
            <Link href={`/${locale}/about`} style={col}>{t.about.title}</Link>
            <Link href={`/${locale}/terms`} style={col}>{t.terms.title}</Link>
            <Link href={`/${locale}/refund`} style={col}>{t.refund.title}</Link>
            <Link href="/provider" style={col}>{t.nav.providerPortal}</Link>
          </div>
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>Language</h4>
            {LOCALES.map((l) => <Link key={l} href={`/${l}`} style={col}>{LOCALE_LABELS[l as Locale]}</Link>)}
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--stone-800)", paddingTop: "var(--space-4)", textAlign: "center", color: "var(--stone-500)", fontSize: "var(--text-xs)" }}>
          © 2026 愿成 YUANCHENG. We facilitate temple-related services. We do not guarantee religious or spiritual outcomes.
        </div>
      </div>
    </footer>
  );
}

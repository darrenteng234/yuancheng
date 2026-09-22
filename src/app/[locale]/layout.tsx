import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, LOCALE_HTML_LANG, isLocale, getDictionary } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LangSetter } from "./lang-setter";

// Per-locale metadata: canonical + hreflang alternates + og:locale.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? (locale as Locale) : "en";
  const t = getDictionary(l);
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) languages[LOCALE_HTML_LANG[loc as Locale]] = `/${loc}`;
  return {
    title: `${t.common.appName} — ${t.common.tagline}`,
    description: t.home.heroSubtitle,
    alternates: { canonical: `/${l}`, languages },
    openGraph: { locale: LOCALE_HTML_LANG[l].replace("-", "_"), url: `/${l}` },
  };
}

// Static params for production-active locales. Adding ms/id/th/vi later = extend
// LOCALES in i18n/config + add a dictionary file. No new page tree.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || !LOCALES.includes(locale as Locale)) notFound();
  const l = locale as Locale;
  return (
    <div lang={LOCALE_HTML_LANG[l]} style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <LangSetter lang={LOCALE_HTML_LANG[l]} />
      <SiteHeader locale={l} />
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter locale={l} />
    </div>
  );
}

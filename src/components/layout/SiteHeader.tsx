"use client";
import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui";
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import { getDictionary } from "@/lib/i18n";

/** Shared customer-facing header. Locale-aware; nav from the dictionary. */
export function SiteHeader({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const [open, setOpen] = React.useState(false);
  const nav = [
    { href: `/${locale}`, label: t.common.appName },
    { href: `/${locale}/how-it-works`, label: t.nav.howItWorks },
    { href: `/${locale}/faq`, label: t.nav.faq },
    { href: "/orders/track", label: t.nav.myOrders },
  ];
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href={`/${locale}`} className="header-logo">⛩️ {t.common.appName}</Link>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>☰</button>
        <nav className={`header-nav${open ? " open" : ""}`}>
          {nav.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link href="/provider" className="btn btn-secondary btn-sm">{t.nav.providerPortal}</Link>
          <Link href="/login" className="btn btn-primary btn-sm">{t.nav.signIn}</Link>
          {LOCALES.filter((l) => l !== locale).map((l) => (
            <Link key={l} href={`/${l}`} className="btn btn-ghost btn-sm" aria-label={LOCALE_LABELS[l as Locale]}>
              {l.toUpperCase()}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { Menu, X, Globe } from "lucide-react";
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale } from "@/types/platform";

const LABELS: Record<string, Record<string, string>> = {
  en: { discover: "Discover", providers: "Providers", places: "Places", how: "How it works", orders: "My orders", signin: "Sign in", forProviders: "For providers" },
  zh: { discover: "发现", providers: "服务商", places: "场所", how: "运作方式", orders: "我的订单", signin: "登录", forProviders: "服务商入口" },
};

/** Shared customer-facing header. Locale-aware. No emoji, single light theme. */
export function SiteHeader({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const L = LABELS[locale === "zh" ? "zh" : "en"];
  const [open, setOpen] = React.useState(false);
  const nav = [
    { href: `/${locale}/discover`, label: L.discover },
    { href: `/${locale}/discover?tab=providers`, label: L.providers },
    { href: `/${locale}/discover?tab=places`, label: L.places },
    { href: `/${locale}/how-it-works`, label: L.how, secondary: true },
  ];
  const other = LOCALES.filter((x) => x !== locale)[0] as Locale | undefined;
  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link href={`/${locale}`} className="header-logo" style={{ letterSpacing: "0.12em", fontWeight: 700 }}>YUANCHENG</Link>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={`header-nav${open ? " open" : ""}`}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={n.secondary ? "nav-secondary" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/orders/track" className="nav-link-plain">{L.orders}</Link>
          <Link href="/login" className="btn btn-primary btn-sm">{L.signin}</Link>
          {other ? (
            <Link href={`/${other}`} className="btn btn-ghost btn-sm" aria-label={LOCALE_LABELS[other]} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Globe size={15} /> {other.toUpperCase()}
            </Link>
          ) : null}
          <Link href="/provider" className="nav-link-plain nav-secondary">{L.forProviders}</Link>
        </div>
      </div>
    </header>
  );
}

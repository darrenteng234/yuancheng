"use client";
import React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale } from "@/types/platform";

const LABELS: Record<string, Record<string, string>> = {
  en: { services: "Services", how: "How it works", orders: "My orders", signin: "Sign in", forProviders: "For providers" },
  zh: { services: "服务", how: "运作方式", orders: "我的委托", signin: "登录", forProviders: "服务商入口" },
};

/** Shared customer-facing header. Locale-aware. No emoji, single light theme. */
export function SiteHeader({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const L = LABELS[locale === "zh" ? "zh" : "en"];
  const [open, setOpen] = React.useState(false);
  const nav = [
    { href: `/${locale}/discover`, label: L.services },
    { href: `/${locale}/how-it-works`, label: L.how },
  ];
  const other = LOCALES.filter((x) => x !== locale)[0] as Locale | undefined;
  const otherLabel = other === "zh" ? "中文" : "EN";
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link href={`/${locale}`} className="header-logo" onClick={close}><Logo /></Link>

        {/* Centre nav (desktop) / drawer body (mobile). Drawer-only extras follow
            the primary links in the order: nav · my orders · language · providers. */}
        <nav className={`header-nav${open ? " open" : ""}`}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={close}>{n.label}</Link>
          ))}
          <Link href={`/${locale}/orders`} onClick={close} className="drawer-only">{L.orders}</Link>
          {other ? <Link href={`/${other}`} onClick={close} className="drawer-only">{otherLabel}</Link> : null}
          <Link href="/provider" onClick={close} className="drawer-only nav-secondary">{L.forProviders}</Link>
        </nav>

        <div className="header-actions">
          <Link href={`/${locale}/orders`} className="nav-link-plain header-desktop-only">{L.orders}</Link>
          {other ? <Link href={`/${other}`} className="nav-link-plain header-desktop-only">{otherLabel}</Link> : null}
          <Link href={`/${locale}/login`} className="btn btn-secondary btn-sm">{L.signin}</Link>
          <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

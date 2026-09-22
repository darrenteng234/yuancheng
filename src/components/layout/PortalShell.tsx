"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui";
import type { NavItem } from "./nav";

/**
 * Shared portal layout (sidebar + header) for admin / provider / runner.
 * One implementation, one design system. Optional client auth guard.
 */
export function PortalShell({
  brand, nav, logoutHref, authCheckUrl, loginUrl, children,
}: {
  brand: string;
  nav: NavItem[];
  logoutHref?: string;
  authCheckUrl?: string;
  loginUrl?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  // Login / logout pages render bare (no sidebar, no auth guard) so the guard
  // can't loop on the very page it would redirect to.
  const isAuthPage = /\/(login|logout|register|apply)$/.test(pathname);
  const [checked, setChecked] = React.useState(!authCheckUrl);

  React.useEffect(() => { setOpen(false); }, [pathname]);

  React.useEffect(() => {
    if (!authCheckUrl || isAuthPage) return;
    let cancelled = false;
    fetch(authCheckUrl).then((res) => {
      if (!res.ok) { if (!cancelled && loginUrl) router.replace(loginUrl); return; }
      if (!cancelled) setChecked(true);
    }).catch(() => { if (!cancelled && loginUrl) router.replace(loginUrl); });
    return () => { cancelled = true; };
  }, [authCheckUrl, loginUrl, router]);

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const current = nav.find((i) => active(i.href));

  // Bare render for login/logout — no chrome, no guard.
  if (isAuthPage) return <>{children}</>;

  if (!checked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "var(--space-3)" }} aria-hidden>⛩️</div>
          <p>Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar${open ? "" : " collapsed"}`}>
        <div className="admin-sidebar-brand">{brand}</div>
        <ul className="admin-sidebar-nav">
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={active(item.href) ? "active" : ""}>
                {item.icon ? <span aria-hidden style={{ marginRight: "var(--space-2)" }}>{item.icon}</span> : null}{item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{current?.label ?? brand}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <ThemeToggle />
            {logoutHref ? <Link href={logoutHref} className="btn btn-secondary btn-sm">Logout</Link> : null}
          </div>
        </header>
        <button className="sidebar-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

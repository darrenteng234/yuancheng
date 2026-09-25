"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LoaderCircle } from "lucide-react";
import type { NavItem } from "./nav";

// Lets a page override the top-bar title (e.g. "Order YC-90001" on order detail).
const TitleCtx = React.createContext<(t: string | null) => void>(() => {});
export const usePortalTitle = () => React.useContext(TitleCtx);

/**
 * Shared portal layout (sidebar + header) for admin / provider / runner.
 * One implementation, one design system. Optional client auth guard.
 */
export function PortalShell({
  brand, nav, logoutHref, logoutLabel = "Logout", authCheckUrl, loginUrl, headerExtra, children,
}: {
  brand: string;
  nav: NavItem[];
  logoutHref?: string;
  logoutLabel?: string;
  authCheckUrl?: string;
  loginUrl?: string;
  headerExtra?: React.ReactNode;
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

  // Close the mobile drawer on Esc.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
  // Longest matching nav href wins, so /provider/orders beats /provider on order detail.
  const current = [...nav].filter((i) => active(i.href)).sort((a, b) => b.href.length - a.href.length)[0];
  const [titleOverride, setTitleOverride] = React.useState<string | null>(null);

  // Bare render for login/logout — no chrome, no guard.
  if (isAuthPage) return <>{children}</>;

  if (!checked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          <LoaderCircle size={28} style={{ marginBottom: "var(--space-3)", animation: "spin 1s linear infinite" }} aria-hidden />
          <p>Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {open ? <div className="sidebar-backdrop" onClick={() => setOpen(false)} aria-hidden /> : null}
      <aside id="portal-sidebar" className={`admin-sidebar${open ? "" : " collapsed"}`}>
        <div className="admin-sidebar-brand"><span className="yc-seal" style={{ width: 22, height: 22, fontSize: 13 }} aria-hidden>愿</span> {brand}</div>
        <ul className="admin-sidebar-nav">
          {nav.map((item, i) => {
            const showGroup = item.group && item.group !== nav[i - 1]?.group;
            return (
              <React.Fragment key={item.href}>
                {showGroup ? <li className="sidebar-group">{item.group}</li> : null}
                <li>
                  <Link href={item.href} className={active(item.href) ? "active" : ""} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    {item.icon ? <item.icon size={17} aria-hidden /> : null}{item.label}
                  </Link>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0 }}>
            <button className="menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} aria-controls="portal-sidebar">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titleOverride ?? current?.label ?? brand}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {headerExtra}
            {logoutHref ? <Link href={logoutHref} className="btn btn-secondary btn-sm">{logoutLabel}</Link> : null}
          </div>
        </header>
        <div className="admin-content"><TitleCtx.Provider value={setTitleOverride}>{children}</TitleCtx.Provider></div>
      </div>
    </div>
  );
}

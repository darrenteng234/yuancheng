"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NotificationBell from "@/components/NotificationBell";

const navItems = [
  { href: "/admin/dashboard", label: "📊 Dashboard" },
  { href: "/admin/setup", label: "🚀 Quick Setup" },
  { href: "/admin/orders", label: "📦 Orders" },
  { href: "/admin/products", label: "🛍️ Products & Packages" },
  { href: "/admin/temples", label: "⛩️ Temples & Runners" },
  { href: "/admin/temple-content", label: "📝 Temple Content" },
  { href: "/admin/economics", label: "💰 Economics" },
  { href: "/admin/fraud", label: "🛡️ Quality & Fraud" },
  { href: "/admin/customers", label: "👥 Customers" },
  { href: "/admin/settings", label: "⚙️ Settings" },
  { href: "/admin/playbooks", label: "📋 Playbooks" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Auth guard: verify admin status on mount
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth-check", { method: "GET" });
        if (!res.ok) {
          if (!cancelled) router.replace("/admin/login");
          return;
        }
        if (!cancelled) setAuthChecked(true);
      } catch {
        if (!cancelled) router.replace("/admin/login");
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Show loading state while checking auth
  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg, #faf9f6)",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "var(--space-3)" }}>⛩️</div>
          <p>Verifying access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside
        className={`admin-sidebar${sidebarOpen ? "" : " collapsed"}`}
        id="sidebar"
      >
        <div className="admin-sidebar-brand">⛩️ YUANCHENG Admin</div>

        {/* Global Search */}
        <div className="search-container" style={{ padding: "0 var(--space-4)" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            id="global-search"
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <div className="search-results" style={{ display: "block" }}>
              <div style={{ padding: "var(--space-4)", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                Searching for &ldquo;{searchQuery}&rdquo;...
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ul className="admin-sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link href={item.href} className={isActive ? "active" : ""}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
              {navItems.find(
                (item) =>
                  pathname === item.href || pathname.startsWith(item.href + "/")
              )?.label || "Admin"}
            </h2>
            <p className="text-sm text-muted">
              Real-time overview · Data persists in browser
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <NotificationBell />
            <Link href="/" className="btn btn-secondary btn-sm">View Site</Link>
            <Link href="/admin/logout" className="btn btn-sm" style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>Logout</Link>
          </div>
        </div>

        {/* Mobile Sidebar Toggle */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        {/* Page Content */}
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

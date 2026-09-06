"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/runner/dashboard", label: "📊 Dashboard" },
  { href: "/runner/orders", label: "📦 Orders" },
  { href: "/runner/orders?status=completed", label: "📋 History" },
  { href: "/runner/earnings", label: "💰 Earnings" },
  { href: "/runner/profile", label: "👤 Profile" },
];

export default function RunnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Check if runner is authenticated
    fetch("/api/runner/auth-check")
      .then((res) => {
        if (!res.ok) {
          router.replace("/runner/login");
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => {
        router.replace("/runner/login");
      });
  }, [router]);

  if (!authChecked) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar${sidebarOpen ? "" : " collapsed"}`} id="runner-sidebar">
        <div className="admin-sidebar-brand">🏃 YUANCHENG Runner</div>
        <ul className="admin-sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
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

      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
              {navItems.find(
                (item) =>
                  pathname === item.href || pathname.startsWith(item.href + "/")
              )?.label || "Runner"}
            </h2>
            <p className="text-sm text-muted">Runner Portal</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              👋 Welcome
            </span>
            <Link href="/runner/logout" className="btn btn-sm">Logout</Link>
          </div>
        </div>

        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

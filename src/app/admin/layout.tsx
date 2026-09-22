"use client";
import { PortalShell } from "@/components/layout/PortalShell";
import { ADMIN_NAV } from "@/components/layout/nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      brand="⛩️ Yuancheng Admin"
      nav={ADMIN_NAV}
      logoutHref="/admin/logout"
      authCheckUrl="/api/admin/auth-check"
      loginUrl="/admin/login"
    >
      {children}
    </PortalShell>
  );
}

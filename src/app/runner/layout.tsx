"use client";
import { PortalShell } from "@/components/layout/PortalShell";
import { RUNNER_NAV } from "@/components/layout/nav";

export default function RunnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      brand="🏃 Yuancheng Runner"
      nav={RUNNER_NAV}
      logoutHref="/runner/logout"
      authCheckUrl="/api/runner/auth-check"
      loginUrl="/runner/login"
    >
      {children}
    </PortalShell>
  );
}

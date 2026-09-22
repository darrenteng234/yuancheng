"use client";
import { PortalShell } from "@/components/layout/PortalShell";
import { PROVIDER_NAV } from "@/components/layout/nav";

// Session is enforced by middleware; provider-role is enforced per-API. The shell
// bypasses /provider/apply so a not-yet-provider can still apply.
export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell brand="🏮 Yuancheng Provider" nav={PROVIDER_NAV}>
      {children}
    </PortalShell>
  );
}

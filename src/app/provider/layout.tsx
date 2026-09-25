import { providerLang } from "@/lib/i18n/provider-lang";
import { ProviderShell } from "@/components/layout/ProviderShell";

// Session is enforced by middleware; provider-role per-API. Language read server-side.
export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const lang = await providerLang();
  return <ProviderShell lang={lang}>{children}</ProviderShell>;
}

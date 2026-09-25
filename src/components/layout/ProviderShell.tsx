"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "./PortalShell";
import { PROVIDER_NAV } from "./nav";
import { getProviderDict, PROVIDER_LANG_COOKIE, type ProviderDict, type ProviderLang } from "@/lib/i18n/provider";


const Ctx = React.createContext<{ lang: ProviderLang; t: ProviderDict }>({ lang: "en", t: getProviderDict("en") });
export const useProviderT = () => React.useContext(Ctx);

const NAV_KEY: Record<string, keyof ProviderDict["nav"]> = {
  "/provider": "dashboard", "/provider/storefront": "storefront", "/provider/services": "services",
  "/provider/products": "products", "/provider/orders": "orders", "/provider/customers": "customers",
  "/provider/subscription": "subscription", "/provider/account": "account",
};

function LangSwitch({ lang }: { lang: ProviderLang }) {
  const router = useRouter();
  const set = (l: ProviderLang) => {
    document.cookie = `${PROVIDER_LANG_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };
  return (
    <div className="langswitch" role="group" aria-label="Language">
      <button aria-pressed={lang === "en"} onClick={() => set("en")}>EN</button>
      <button aria-pressed={lang === "zh"} onClick={() => set("zh")}>中文</button>
    </div>
  );
}

export function ProviderShell({ lang, children }: { lang: ProviderLang; children: React.ReactNode }) {
  const t = getProviderDict(lang);
  const nav = PROVIDER_NAV.map((n) => ({
    ...n,
    label: t.nav[NAV_KEY[n.href]] ?? n.label,
    group: n.group ? (t.nav[n.group as keyof ProviderDict["nav"]] ?? n.group) : undefined,
  }));
  return (
    <Ctx.Provider value={{ lang, t }}>
      <PortalShell brand={t.nav.brand} nav={nav} logoutLabel={t.nav.logout} headerExtra={<LangSwitch lang={lang} />}>
        {children}
      </PortalShell>
    </Ctx.Provider>
  );
}

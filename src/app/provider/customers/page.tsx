import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { DEMO_ORDERS, money, orderCreatedISO } from "@/lib/demo/catalog";
import { PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

function customers() {
  const map = new Map<string, { name: string; orders: number; lastDays: number; total: number }>();
  for (const o of DEMO_ORDERS) {
    const c = map.get(o.customer_name) ?? { name: o.customer_name, orders: 0, lastDays: o.createdDaysAgo, total: 0 };
    c.orders += 1; c.total += o.amount; if (o.createdDaysAgo < c.lastDays) c.lastDays = o.createdDaysAgo;
    map.set(o.customer_name, c);
  }
  return [...map.values()];
}

export default async function ProviderCustomers() {
  const lang = await providerLang();
  const t = getProviderDict(lang).customers;
  const list = customers();
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      {list.length === 0 ? (
        <div className="state-block"><Users size={32} className="state-icon" /><h3>{t.empty}</h3><p>{t.emptyBody}</p></div>
      ) : (
        list.map((c) => (
          <Link key={c.name} href={`/provider/customers/${encodeURIComponent(c.name)}`} className="order-row">
            <div className="order-row-main">
              <span className="order-row-title">{c.name}</span>
              <span className="order-row-meta">Kuala Lumpur, Malaysia · {c.orders} {t.orders} · {t.last} {formatDate(new Date(Date.now() - c.lastDays * 86400000).toISOString(), lang)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span className="text-muted">{money(c.total)}</span>
              <ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} />
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

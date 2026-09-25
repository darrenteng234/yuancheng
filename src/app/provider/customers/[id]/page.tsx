import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { OrderStatus } from "@/types/platform";
import { DEMO_ORDERS, getService, money, orderCreatedISO } from "@/lib/demo/catalog";
import { PageHeader, OrderStatusBadge, NotFoundState } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict } from "@/lib/i18n/provider";

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await providerLang();
  const t = getProviderDict(lang).customers;
  const name = decodeURIComponent(id);
  const orders = DEMO_ORDERS.filter((o) => o.customer_name === name);
  if (orders.length === 0) return <div style={{ padding: "var(--space-6)" }}><NotFoundState title={t.notFound} href="/provider/customers" cta={t.title} /></div>;
  const total = orders.reduce((s, o) => s + o.amount, 0);

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/provider/customers" className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}><ArrowLeft size={15} /> {t.title}</Link>
      <PageHeader title={name} subtitle={`Kuala Lumpur, Malaysia · ${orders.length} ${t.orders} · ${money(total)}`} />
      <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-4)" }}>{t.orderHistory}</h2>
      {orders.map((o) => {
        const service = getService(o.serviceSlug);
        return (
          <Link key={o.id} href={`/provider/orders/${o.id}`} className="order-row">
            <div className="order-row-main">
              <span className="order-row-num">{o.order_number} · {formatDate(orderCreatedISO(o), lang)}</span>
              <span className="order-row-title">{service?.name}</span>
              <span className="order-row-meta">{money(o.amount, o.currency)}</span>
            </div>
            <OrderStatusBadge status={o.status as OrderStatus} locale={lang} />
          </Link>
        );
      })}
    </div>
  );
}

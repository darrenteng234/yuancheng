import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale, OrderStatus } from "@/types/platform";
import { DEMO_ORDERS, getService, getProvider, money } from "@/lib/demo/catalog";
import { PageHeader, OrderStatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function Orders({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const orders = DEMO_ORDERS;

  return (
    <div className="container section">
      <PageHeader title={zh ? "我的订单" : "My orders"} subtitle={zh ? "您的服务请求会显示在这里。" : "Your service requests appear here."} />
      {orders.length === 0 ? (
        <div className="state-block">
          <PackageOpen size={32} className="state-icon" />
          <h3>{zh ? "还没有订单" : "No orders yet"}</h3>
          <p>{zh ? "下单后，您的订单会显示在这里。" : "Your orders will appear here once you place a service request."}</p>
          <Link href={`/${l}/discover`} className="btn btn-primary btn-sm">{zh ? "浏览服务" : "Explore services"}</Link>
        </div>
      ) : (
        orders.map((o) => {
          const service = getService(o.serviceSlug);
          const provider = getProvider(o.providerSlug);
          return (
            <Link key={o.id} href={`/${l}/orders/${o.id}`} className="order-row">
              <div className="order-row-main">
                <span className="order-row-num">{o.order_number} · {formatDate(o.created_at)}</span>
                <span className="order-row-title">{service?.name}</span>
                <span className="order-row-meta">{provider?.name} · {money(o.amount, o.currency)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <OrderStatusBadge status={o.status as OrderStatus} locale={l} />
                <ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} />
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

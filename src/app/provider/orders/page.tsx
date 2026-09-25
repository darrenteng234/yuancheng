import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OrderStatus } from "@/types/platform";
import { DEMO_ORDERS, getService, money, orderCreatedISO, orderUploadedISO } from "@/lib/demo/catalog";
import { PageHeader, OrderStatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { providerLang } from "@/lib/i18n/provider-lang";
import { getProviderDict, fill } from "@/lib/i18n/provider";
import { isOverdue, verifyDeadlineLabel } from "@/lib/demo/contact";

export default async function ProviderOrders({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "all" } = await searchParams;
  const lang = await providerLang();
  const t = getProviderDict(lang).orders;
  const FILTERS = [
    { key: "all", label: t.all, match: undefined as undefined | ((s: string) => boolean) },
    { key: "review", label: t.review, match: (s: string) => s === "payment_proof_submitted" },
    { key: "paid", label: t.paid, match: (s: string) => s === "paid" || s === "accepted" },
    { key: "progress", label: t.progress, match: (s: string) => s === "in_progress" || s === "evidence_submitted" },
    { key: "completed", label: t.completed, match: (s: string) => s === "completed" },
  ];
  const od = getProviderDict(lang).od;
  const active = FILTERS.find((x) => x.key === f) ?? FILTERS[0];
  const overdueOf = (o: (typeof DEMO_ORDERS)[number]) => o.status === "payment_proof_submitted" && isOverdue(orderUploadedISO(o));
  // Overdue payment reviews sort to the top.
  const orders = DEMO_ORDERS.filter((o) => !active.match || active.match(o.status))
    .sort((a, b) => Number(overdueOf(b)) - Number(overdueOf(a)));

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <div className="tabs">
        {FILTERS.map((x) => (
          <Link key={x.key} href={`/provider/orders?f=${x.key}`} className="tab" aria-selected={x.key === active.key} aria-current={x.key === active.key ? "page" : undefined}>{x.label}</Link>
        ))}
      </div>
      {orders.length === 0 ? (
        <div className="state-block"><h3>{t.empty}</h3><p>{t.emptyBody}</p></div>
      ) : (
        orders.map((o) => {
          const service = getService(o.serviceSlug);
          return (
            <Link key={o.id} href={`/provider/orders/${o.id}`} className="order-row">
              <div className="order-row-main" style={{ minWidth: 0 }}>
                <span className="order-row-num">{o.order_number} · {formatDate(orderCreatedISO(o), lang)}</span>
                <span className="order-row-title">{service?.name}</span>
                <span className="order-row-meta">{o.customer_name} · {money(o.amount, o.currency)}</span>
                {o.status === "payment_proof_submitted" ? (
                  overdueOf(o)
                    ? <span className="sbadge sbadge--warning" style={{ marginTop: 4, alignSelf: "flex-start" }}>{od.overdue}</span>
                    : <span className="order-row-meta">{fill(od.verifyBy, { deadline: verifyDeadlineLabel(orderUploadedISO(o), lang) })}</span>
                ) : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: "none" }}>
                <OrderStatusBadge status={o.status as OrderStatus} locale={lang} />
                <ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} />
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

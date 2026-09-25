import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck, Camera, Video, Store, CheckCircle2, Info } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import { getService, getProvider, getPlace, money, packagesByService } from "@/lib/demo/catalog";
import { PackageCard } from "@/components/order/OrderParts";

const EVIDENCE = {
  none: { en: "No evidence", zh: "无" },
  photo: { en: "Photo", zh: "照片" },
  photo_video: { en: "Photo + video", zh: "照片 + 视频" },
};

export default async function ServiceDetail({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const s = getService(slug);
  if (!s) notFound();
  const provider = getProvider(s.providerSlug);
  const place = getPlace(s.placeSlug);
  const pkgs = packagesByService(s.slug);
  const startPrice = pkgs.length ? Math.min(...pkgs.map((p) => p.price)) : s.price;

  const steps = zh
    ? [["下单", "您完成付款后订单创建。"], ["服务商接单", "服务商确认并接受订单。"], ["代办", "服务商代您执行服务。"], ["完成记录", "完成时提交照片/视频（如适用）。"], ["完成", "订单标记为完成。"]]
    : [["Order placed", "Your order is created after payment."], ["Provider accepts", "The provider confirms and accepts."], ["Fulfilment", "The provider carries out the service."], ["Evidence", "Photo/video submitted on completion (where offered)."], ["Completion", "The order is marked complete."]];

  return (
    <div className="container section">
      <div style={{ marginBottom: "var(--space-6)" }}>
        <span className="tag tag--accent">{zh ? "投资者演示" : "Investor Demo"}</span>
      </div>

      <div className="svc-detail">
        {/* LEFT — image */}
        <div className="svc-image"><Store size={64} /></div>

        {/* RIGHT — purchase panel */}
        <aside className="svc-buy">
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 600 }}>{s.name}</h1>
          <div style={{ color: "var(--color-text-secondary)", marginTop: "4px" }}>
            {provider?.name}
          </div>
          {place ? <div className="disc-card-meta" style={{ marginTop: "4px" }}><MapPin size={14} /> {place.name} · {place.location}</div> : null}
          <div className="svc-tags">
            {provider?.verified ? <span className="tag tag--verified"><ShieldCheck size={13} /> {zh ? "已核实服务商" : "Verified provider"}</span> : null}
            <span className="tag">{s.evidence === "photo_video" ? <Video size={13} /> : s.evidence === "photo" ? <Camera size={13} /> : null} {EVIDENCE[s.evidence][zh ? "zh" : "en"]}</span>
            <span className="tag">{s.fulfilment}</span>
          </div>
          <div className="svc-price">{pkgs.length ? (zh ? "起 " : "From ") : ""}{money(startPrice, s.currency)}</div>
          <Link href={`/${l}/checkout?service=${s.slug}`} className="btn btn-primary btn-lg btn-full">
            {zh ? "选择套餐" : "Choose a package"}
          </Link>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-3)", textAlign: "center" }}>
            {zh ? "结账使用 Stripe 测试模式（Beta）。" : "Checkout uses Stripe test mode (beta)."}
          </p>
        </aside>
      </div>

      {/* About */}
      <section className="svc-section">
        <h2>{zh ? "关于此服务" : "About this service"}</h2>
        <p>{s.about[zh ? "zh" : "en"]}</p>
      </section>

      {/* Packages */}
      <section className="svc-section">
        <h2>{zh ? "套餐" : "Packages"}</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>{zh ? "每个套餐包含以下内容。" : "Each package includes the following."}</p>
        <div className="disc-grid">
          {pkgs.map((p) => (
            <PackageCard key={p.id} name={p.name} price={money(p.price, p.currency)} locale={l}
              includes={p.includes.map((i) => (zh ? i.zh : i.en))} />
          ))}
        </div>
      </section>

      {/* Fulfilment + Evidence */}
      <div className="svc-two">
        <section className="svc-section">
          <h2>{zh ? "代办方式" : "Fulfilment"}</h2>
          <p>{s.fulfilment}. {zh ? "由服务商代您执行。" : "Carried out by the provider on your behalf."}</p>
        </section>
        <section className="svc-section">
          <h2>{zh ? "完成记录" : "Evidence"}</h2>
          <p>{EVIDENCE[s.evidence][zh ? "zh" : "en"]}. {s.visibility === "approval" ? (zh ? "需审核后对客户可见。" : "Visible to customer after approval.") : (zh ? "完成后自动对客户可见。" : "Shown to the customer automatically on completion.")}</p>
        </section>
      </div>

      {/* What happens after purchase */}
      <section className="svc-section">
        <h2>{zh ? "购买后会发生什么" : "What happens after purchase"}</h2>
        <div className="steps" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          {steps.map(([title, body], i) => (
            <div key={title} className="step">
              <div className="step-n">{i + 1}</div>
              <h3>{title}</h3><p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before you purchase */}
      <section className="svc-section svc-note">
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Info size={18} /> {zh ? "购买前请注意" : "Before you purchase"}</h2>
        <ul style={{ marginTop: "var(--space-3)", paddingLeft: "var(--space-5)", color: "var(--color-text-secondary)", display: "grid", gap: "6px" }}>
          <li>{zh ? "价格与完成记录政策如上所示。" : "Price and evidence policy are shown above."}</li>
          <li>{zh ? "完成记录仅记录服务商所提交的内容，并非宗教或精神结果的保证。" : "Completion evidence records what the provider submitted. It is not a guarantee of religious or spiritual outcomes."}</li>
          <li>{zh ? "如有问题，可通过订单发起申诉。" : "If there is an issue, you can raise it from your order."}</li>
        </ul>
      </section>

      {/* Refund / issue */}
      <section className="svc-section">
        <h2>{zh ? "退款与问题" : "Refunds & issues"}</h2>
        <p>{zh ? "如服务未按说明完成，请从订单页面报告问题。退款依据平台政策处理。" : "If a service is not completed as described, report an issue from your order. Refunds are handled per platform policy."}</p>
      </section>

      <div style={{ marginTop: "var(--space-8)" }}>
        <Link href={`/${l}/checkout?service=${s.slug}`} className="btn btn-primary btn-lg">
          <CheckCircle2 size={18} /> {zh ? "选择套餐" : "Choose a package"}
        </Link>
      </div>
    </div>
  );
}

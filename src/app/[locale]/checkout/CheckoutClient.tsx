"use client";
import React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Upload, Info, ArrowLeft } from "lucide-react";
import { getService, getPackage, getProvider, getPlace, packagesByService, money, DEMO_PAYMENT_METHOD } from "@/lib/demo/catalog";
import { PaymentMethodCard, PackageCard } from "@/components/order/OrderParts";

const REQUEST_MAX = 2000;
const NOTE_MAX = 500;

export default function CheckoutClient() {
  const params = useParams();
  const sp = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const zh = locale === "zh";
  const serviceSlug = sp.get("service") || "temple-offering-service";
  const service = getService(serviceSlug);
  const pkgs = packagesByService(serviceSlug);
  const [pkgId, setPkgId] = React.useState(sp.get("package") || pkgs[0]?.id || "");
  const pkg = getPackage(pkgId) || pkgs[0];
  const provider = service ? getProvider(service.providerSlug) : undefined;
  const place = service ? getPlace(service.placeSlug) : undefined;

  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("+60 ");
  const [request, setRequest] = React.useState("");
  const [note, setNote] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [proofName, setProofName] = React.useState("");

  if (!service || !pkg) {
    return <div className="container section"><p>{zh ? "找不到服务。" : "Service not found."} <Link href={`/${locale}/discover`}>{zh ? "返回浏览" : "Back to discover"}</Link></p></div>;
  }
  const amount = pkg.price;
  const canPay = name.trim() && location.trim() && request.trim() && whatsapp.replace(/\D/g, "").length >= 8;

  if (submitted) {
    return (
      <div className="container section" style={{ maxWidth: 640 }}>
        <div className="checkout-step" style={{ textAlign: "center" }}>
          <CheckCircle2 size={40} style={{ color: "var(--color-warning)", margin: "0 auto var(--space-3)" }} />
          <h2 style={{ justifyContent: "center" }}>{zh ? "收据已提交" : "Receipt submitted"}</h2>
          <p className="text-muted" style={{ marginBottom: "var(--space-5)" }}>
            {zh ? "上传收据并不代表付款已核实。服务商将审核并确认您的付款。"
                : "Uploading your receipt does not mean payment has been verified. The provider will review and confirm your payment."}
          </p>
          <Link href={`/${locale}/orders/ord-a`} className="btn btn-primary">{zh ? "查看订单" : "View order"}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <Link href={`/${locale}/services/${service.slug}`} className="nav-link-plain" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: "var(--space-4)" }}>
        <ArrowLeft size={15} /> {zh ? "返回服务" : "Back to service"}
      </Link>
      <h1 style={{ fontSize: "var(--text-4xl)", fontWeight: 600, marginBottom: "var(--space-6)" }}>{zh ? "结账" : "Checkout"}</h1>

      <div className="checkout-grid">
        <div>
          {/* 1. Package / order */}
          <div className="checkout-step">
            <h2><span className="step-num">1</span> {zh ? "选择套餐" : "Choose package"}</h2>
            <div style={{ display: "grid", gap: "var(--space-3)" }}>
              {pkgs.map((p) => (
                <PackageCard key={p.id} name={p.name} price={money(p.price, p.currency)} locale={locale}
                  includes={p.includes.map((i) => (zh ? i.zh : i.en))}
                  selected={p.id === pkgId} onSelect={() => setPkgId(p.id)} />
              ))}
            </div>
          </div>

          {/* 2. Customer information + request */}
          <div className="checkout-step">
            <h2><span className="step-num">2</span> {zh ? "您的信息与请求" : "Your details & request"}</h2>
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <div>
                <label className="form-label">{zh ? "姓名" : "Name"} *</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={zh ? "您的姓名" : "Your name"} />
              </div>
              <div>
                <label className="form-label">{zh ? "国家 / 城市" : "Country / City"} *</label>
                <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={zh ? "例如：马来西亚，吉隆坡" : "e.g. Kuala Lumpur, Malaysia"} />
              </div>
              <div>
                <label className="form-label">{zh ? "WhatsApp 号码" : "WhatsApp number"} *</label>
                <input className="form-input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" placeholder="+60 12 345 6789" />
                <div className="field-count" style={{ textAlign: "left", color: "var(--color-text-muted)" }}>{zh ? "服务商会用它联系您（默认马来西亚 +60）。" : "The provider uses this to reach you (Malaysia +60 by default)."}</div>
              </div>
              <div>
                <label className="form-label">{zh ? "您的请求" : "Your request"} *</label>
                <textarea className="form-input" rows={4} maxLength={REQUEST_MAX} value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder={zh ? "用您自己的话写下您的请求…" : "Write your request in your own words…"} />
                <div className="field-count">{request.length}/{REQUEST_MAX}</div>
              </div>
              <div>
                <label className="form-label">{zh ? "附加备注（可选）" : "Additional note (optional)"}</label>
                <textarea className="form-input" rows={2} maxLength={NOTE_MAX} value={note}
                  onChange={(e) => setNote(e.target.value)} />
                <div className="field-count">{note.length}/{NOTE_MAX}</div>
              </div>
            </div>
          </div>

          {/* 3. Payment instructions (manual, provider-direct) */}
          <div className="checkout-step">
            <h2><span className="step-num">3</span> {zh ? "付款说明" : "Payment instructions"}</h2>
            <PaymentMethodCard method={DEMO_PAYMENT_METHOD} locale={locale} />
          </div>

          {/* 4. Payment proof */}
          <div className="checkout-step">
            <h2><span className="step-num">4</span> {zh ? "上传收据" : "Upload receipt"}</h2>
            <div className="banner-review" style={{ marginBottom: "var(--space-4)" }}>
              <Info size={16} style={{ flex: "none", marginTop: 1 }} />
              {zh ? "先直接向服务商付款，然后在此上传收据。" : "Pay the provider directly first, then upload your receipt here."}
            </div>
            <label className="proof-drop">
              <Upload size={22} style={{ marginBottom: 8 }} />
              <div>{proofName || (zh ? "点击选择收据图片" : "Click to choose a receipt image")}</div>
              <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => setProofName(e.target.files?.[0]?.name || "")} />
            </label>
            <button className="btn btn-primary btn-lg btn-full" style={{ marginTop: "var(--space-5)" }}
              disabled={!canPay || !proofName}
              onClick={() => setSubmitted(true)}>
              {zh ? "我已付款，提交收据" : "I’ve made the payment — submit receipt"}
            </button>
            {!canPay ? <p className="field-count" style={{ textAlign: "center" }}>{zh ? "请先填写姓名、地点与请求。" : "Fill in name, location and request first."}</p> : null}
          </div>
        </div>

        {/* Summary */}
        <aside className="checkout-summary">
          <h3 style={{ fontWeight: 600, marginBottom: "var(--space-4)" }}>{zh ? "订单摘要" : "Order summary"}</h3>
          <div className="summary-row"><span>{zh ? "服务" : "Service"}</span><span style={{ color: "var(--color-text)", fontWeight: 500 }}>{service.name}</span></div>
          <div className="summary-row"><span>{zh ? "套餐" : "Package"}</span><span style={{ color: "var(--color-text)", fontWeight: 500 }}>{pkg.name}</span></div>
          <div className="summary-row"><span>{zh ? "服务商" : "Provider"}</span><span>{provider?.name}</span></div>
          {place ? <div className="summary-row"><span>{zh ? "场所" : "Place"}</span><span>{place.name}</span></div> : null}
          <div className="summary-row"><span>{zh ? "代办" : "Fulfilment"}</span><span>{zh ? "服务商代办" : "Provider"}</span></div>
          <div className="summary-row"><span>{zh ? "完成记录" : "Evidence"}</span><span>{pkg.evidence === "photo_video" ? (zh ? "照片+视频" : "Photo+video") : pkg.evidence === "photo" ? (zh ? "照片" : "Photo") : (zh ? "无" : "None")}</span></div>
          <div className="summary-total"><span>{zh ? "总计" : "Total"}</span><span>{money(amount, pkg.currency)}</span></div>
          <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-4)" }}>
            {zh ? "第一阶段：直接向服务商付款。愿成不代收款项。" : "Stage 1: you pay the provider directly. Yuancheng does not collect the funds."}
          </p>
        </aside>
      </div>
    </div>
  );
}

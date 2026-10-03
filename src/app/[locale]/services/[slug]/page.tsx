import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck, Camera, Video, Store, CheckCircle2, Info, Clock, Heart, Gift } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import {
  getService, getProvider, getPlace, money, packagesByService,
  svcName, provName, placeName, occasionLabel,
} from "@/lib/demo/catalog";
import { PackageCard } from "@/components/order/OrderParts";
import { DemoTag } from "@/components/marketing/Cards";

const EVIDENCE = {
  none: { en: "No evidence", zh: "无" },
  photo: { en: "Photo record", zh: "照片记录" },
  photo_video: { en: "Photo + video record", zh: "照片 + 视频记录" },
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
  const name = svcName(s, l);
  const evLabel = EVIDENCE[s.evidence][zh ? "zh" : "en"];
  const bestFor = s.occasions.map((o) => occasionLabel(o, l)).join(zh ? "、" : ", ");

  return (
    <div className="container section">
      <div style={{ marginBottom: "var(--space-6)", display: "flex", gap: "var(--space-2)" }}>
        <DemoTag zh={zh} />
      </div>

      <div className="svc-detail">
        {/* LEFT — image */}
        <div className="svc-image"><Store size={64} /></div>

        {/* RIGHT — purchase panel */}
        <aside className="svc-buy">
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 600 }}>{name}</h1>
          <div style={{ color: "var(--color-text-secondary)", marginTop: "4px" }}>
            {provider ? provName(provider, l) : null}
          </div>
          {place ? <div className="disc-card-meta" style={{ marginTop: "4px" }}><MapPin size={14} /> {placeName(place, l)} · {s.region}</div> : null}
          <div className="svc-tags">
            {provider?.verified ? <span className="tag tag--verified"><ShieldCheck size={13} /> {zh ? "已核实服务商" : "Verified provider"}</span> : null}
            <span className="tag">{s.evidence === "photo_video" ? <Video size={13} /> : s.evidence === "photo" ? <Camera size={13} /> : null} {evLabel}</span>
            <span className="tag"><Clock size={13} /> {s.delivery[zh ? "zh" : "en"]}</span>
          </div>
          <div className="svc-price">{pkgs.length ? (zh ? "起 " : "From ") : ""}{money(startPrice, s.currency)}</div>
          <Link href={`/${l}/checkout?service=${s.slug}`} className="btn btn-primary btn-lg btn-full">
            {zh ? "选择供奉方式" : "Choose a package"}
          </Link>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-3)", textAlign: "center" }}>
            {zh ? "结账使用 Stripe 测试模式（Beta）。" : "Checkout uses Stripe test mode (beta)."}
          </p>
        </aside>
      </div>

      {/* Fixed five-part structure */}
      {/* 1 — Best for */}
      <section className="svc-section">
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Heart size={18} /> {zh ? "适合" : "Best for"}</h2>
        <p>{bestFor}</p>
      </section>

      {/* 2 — The provider will */}
      <section className="svc-section">
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle2 size={18} /> {zh ? "服务商会" : "The provider will"}</h2>
        <p>{s.about[zh ? "zh" : "en"]}</p>
      </section>

      {/* 3 — You receive (evidence + timing) */}
      <section className="svc-section">
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Camera size={18} /> {zh ? "您会收到" : "You receive"}</h2>
        <p>{evLabel} · {s.delivery[zh ? "zh" : "en"]}
          {s.visibility === "approval"
            ? ` · ${zh ? "需审核后对您可见" : "visible to you after review"}`
            : ` · ${zh ? "完成后自动可见" : "shown automatically on completion"}`}</p>
      </section>

      {/* 4 — Packages */}
      <section className="svc-section">
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Gift size={18} /> {zh ? "供奉方式" : "Packages"}</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>{zh ? "每个供奉方式包含以下内容。" : "Each package includes the following."}</p>
        <div className="disc-grid">
          {pkgs.map((p) => (
            <PackageCard key={p.id} name={zh ? p.nameZh : p.name} price={money(p.price, p.currency)} locale={l}
              includes={p.includes.map((i) => (zh ? i.zh : i.en))} />
          ))}
        </div>
      </section>

      {/* 5 — Disclaimer */}
      <section className="svc-section svc-note">
        <p style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "var(--color-text-secondary)" }}>
          <Info size={16} style={{ flex: "none", marginTop: 2 }} />
          {zh
            ? "完成记录仅记录服务商所提交的内容，并非宗教或精神结果的保证。"
            : "Completion evidence records what the provider submitted. It is not a guarantee of religious or spiritual outcomes."}
        </p>
      </section>

      <div style={{ marginTop: "var(--space-8)" }}>
        <Link href={`/${l}/checkout?service=${s.slug}`} className="btn btn-primary btn-lg">
          <CheckCircle2 size={18} /> {zh ? "选择供奉方式" : "Choose a package"}
        </Link>
      </div>
    </div>
  );
}

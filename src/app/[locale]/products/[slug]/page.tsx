import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, Store } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import { getProduct, getProvider, money } from "@/lib/demo/catalog";

export default async function ProductDetail({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const pr = getProduct(slug);
  if (!pr) notFound();
  const provider = getProvider(pr.providerSlug);

  return (
    <div className="container section">
      <span className="tag tag--accent">{zh ? "投资者演示" : "Investor Demo"}</span>
      <div className="svc-detail" style={{ marginTop: "var(--space-6)" }}>
        <div className="svc-image"><Store size={64} /></div>
        <aside className="svc-buy">
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 600 }}>{pr.name}</h1>
          {provider ? (
            <Link href={`/${l}/providers/${provider.slug}`} style={{ color: "var(--color-text-secondary)", marginTop: "4px", display: "inline-block" }}>{provider.name}</Link>
          ) : null}
          <div className="svc-tags"><span className="tag"><Package size={13} /> {zh ? "实体商品" : "Physical product"}</span></div>
          <div className="svc-price">{money(pr.price, pr.currency)}</div>
          <div className="demo-banner" style={{ marginBottom: "var(--space-4)" }}>
            {zh ? "此实体商品在 Yuancheng 之外购买。" : "This physical product is purchased outside Yuancheng."}
          </div>
          {provider ? (
            <Link href={`/${l}/providers/${provider.slug}`} className="btn btn-primary btn-lg btn-full">{zh ? "联系服务商" : "Contact provider"}</Link>
          ) : null}
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-3)", textAlign: "center" }}>
            {zh ? "V1 不通过 Yuancheng 结账。" : "No Yuancheng checkout in V1."}
          </p>
        </aside>
      </div>
      <section className="svc-section">
        <h2>{zh ? "关于此商品" : "About this product"}</h2>
        <p>{pr.about[zh ? "zh" : "en"]}</p>
      </section>
    </div>
  );
}

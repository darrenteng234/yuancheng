import { notFound } from "next/navigation";
import { MapPin, ShieldCheck } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import { getProvider, getPlace, servicesByProvider, productsByProvider, money } from "@/lib/demo/catalog";
import { ServiceCard, ProductCard } from "@/components/marketing/Cards";

export default async function ProviderDetail({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const p = getProvider(slug);
  if (!p) notFound();
  const place = getPlace(p.placeSlug);
  const services = servicesByProvider(slug);
  const products = productsByProvider(slug);

  return (
    <div className="container">
      <div className="detail-hero">
        <span className="tag tag--accent">{zh ? "投资者演示" : "Investor Demo"}</span>
        <h1 style={{ marginTop: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {p.name}
          {p.verified ? <span className="tag tag--verified"><ShieldCheck size={14} /> {zh ? "已核实服务商" : "Verified provider"}</span> : null}
        </h1>
        {place ? <div className="disc-card-meta" style={{ marginTop: "var(--space-2)" }}><MapPin size={14} /> {place.name} · {p.location}</div> : null}
        <p style={{ marginTop: "var(--space-4)", color: "var(--color-text-secondary)", maxWidth: "70ch" }}>{p.about[zh ? "zh" : "en"]}</p>
      </div>

      <section style={{ marginBottom: "var(--space-12)" }}>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 600, marginBottom: "var(--space-5)" }}>{zh ? "服务" : "Services"}</h2>
        <div className="disc-grid">
          {services.map((s) => (
            <ServiceCard key={s.slug} locale={l} s={{ slug: s.slug, name: s.name, provider: p.name, place: place ? `${place.name} · ${p.location}` : undefined, price: money(s.price, s.currency), verified: p.verified, evidence: s.evidence, fulfilment: s.fulfilment }} />
          ))}
        </div>
      </section>

      <section className="section--tight">
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 600, marginBottom: "var(--space-5)" }}>{zh ? "商品" : "Products"}</h2>
        <div className="disc-grid">
          {products.map((pr) => (
            <ProductCard key={pr.slug} locale={l} pr={{ slug: pr.slug, name: pr.name, provider: p.name, price: money(pr.price, pr.currency) }} />
          ))}
        </div>
      </section>
    </div>
  );
}

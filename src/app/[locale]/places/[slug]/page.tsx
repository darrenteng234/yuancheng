import { notFound } from "next/navigation";
import { MapPin, Info } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import { getPlace, getProvider, providersByPlace, servicesByPlace, money } from "@/lib/demo/catalog";
import { ProviderCard, ServiceCard } from "@/components/marketing/Cards";

export default async function PlaceDetail({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const place = getPlace(slug);
  if (!place) notFound();
  const providers = providersByPlace(slug);
  const services = servicesByPlace(slug);

  return (
    <div className="container">
      <div className="detail-hero">
        <span className="tag tag--accent">{zh ? "投资者演示" : "Investor Demo"}</span>
        <h1 style={{ marginTop: "var(--space-3)" }}>{place.name}</h1>
        <div className="disc-card-meta" style={{ marginTop: "var(--space-2)" }}><MapPin size={14} /> {place.location}</div>
        <p style={{ marginTop: "var(--space-4)", color: "var(--color-text-secondary)", maxWidth: "70ch" }}>{place.about[zh ? "zh" : "en"]}</p>
      </div>

      <div className="svc-note" style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", marginBottom: "var(--space-10)" }}>
        <Info size={18} style={{ color: "var(--color-primary)", flex: "none", marginTop: "2px" }} />
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
          {zh ? "此处显示的服务商独立经营。场所仅标识服务相关或代办的位置，并不代表场所已批准这些服务商。" : "Providers shown here operate independently. The place identifies where the service is associated or fulfilled — it does not mean the place has approved these providers."}
        </p>
      </div>

      <section style={{ marginBottom: "var(--space-12)" }}>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 600, marginBottom: "var(--space-5)" }}>{zh ? "此处的服务商" : "Providers here"}</h2>
        <div className="disc-grid disc-grid--2">
          {providers.map((p) => (
            <ProviderCard key={p.slug} locale={l} p={{ slug: p.slug, name: p.name, place: p.location, verified: p.verified, serviceCount: servicesByPlace(slug).filter((s) => s.providerSlug === p.slug).length }} />
          ))}
        </div>
      </section>

      <section className="section--tight">
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 600, marginBottom: "var(--space-5)" }}>{zh ? "与此地相关的服务" : "Services associated with this place"}</h2>
        <div className="disc-grid">
          {services.map((s) => {
            const prov = getProvider(s.providerSlug);
            return <ServiceCard key={s.slug} locale={l} s={{ slug: s.slug, name: s.name, provider: prov?.name ?? "", place: `${place.name} · ${place.location}`, price: money(s.price, s.currency), verified: prov?.verified, evidence: s.evidence, fulfilment: s.fulfilment }} />;
          })}
        </div>
      </section>
    </div>
  );
}

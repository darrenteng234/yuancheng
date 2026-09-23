import Link from "next/link";
import { Search } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import {
  ServiceCard, ProviderCard, PlaceCard, ProductCard,
  type ServiceCardData, type ProviderCardData, type PlaceCardData, type ProductCardData,
} from "@/components/marketing/Cards";

// Fictional Investor Demo content. Replaced by live data once demo seed is applied.
const SERVICES: ServiceCardData[] = [
  { slug: "temple-offering-service", name: "Temple Offering Service", provider: "Golden Lotus Services", place: "Golden Lotus Temple · Kuala Lumpur", price: "RM 88", verified: true, evidence: "photo_video", fulfilment: "Provider fulfilled" },
  { slug: "blessing-service", name: "Blessing Service", provider: "Golden Lotus Services", place: "Golden Lotus Temple · Kuala Lumpur", price: "RM 120", verified: true, evidence: "photo", fulfilment: "Provider fulfilled" },
  { slug: "ancestral-remembrance", name: "Ancestral Remembrance", provider: "Golden Lotus Services", place: "Golden Lotus Temple · Kuala Lumpur", price: "RM 168", verified: true, evidence: "photo_video", fulfilment: "Provider fulfilled" },
];
const PROVIDERS: ProviderCardData[] = [
  { slug: "golden-lotus-services", name: "Golden Lotus Services", place: "Kuala Lumpur", verified: true, serviceCount: 3 },
];
const PLACES: PlaceCardData[] = [
  { slug: "golden-lotus-temple", name: "Golden Lotus Temple", location: "Kuala Lumpur, Malaysia", providerCount: 1, serviceCount: 3 },
];
const PRODUCTS: ProductCardData[] = [
  { slug: "blessing-set", name: "Blessing Set", provider: "Golden Lotus Services", price: "RM 68" },
];

const TABS = [
  { key: "all", en: "All", zh: "全部" },
  { key: "services", en: "Services", zh: "服务" },
  { key: "providers", en: "Providers", zh: "服务商" },
  { key: "places", en: "Places", zh: "场所" },
  { key: "products", en: "Products", zh: "商品" },
];

export default async function Discover({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab = "all" } = await searchParams;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const active = TABS.some((t) => t.key === tab) ? tab : "all";

  const showServices = active === "all" || active === "services";
  const showProviders = active === "all" || active === "providers";
  const showPlaces = active === "all" || active === "places";
  const showProducts = active === "all" || active === "products";

  return (
    <div className="container section">
      <h1 style={{ fontSize: "var(--text-4xl)", fontWeight: 600, marginBottom: "var(--space-6)" }}>
        {zh ? "发现" : "Discover"}
      </h1>

      <div className="search-bar" style={{ marginBottom: "var(--space-6)" }}>
        <Search size={20} className="sb-icon" />
        <input placeholder={zh ? "搜索服务、服务商或场所" : "Search services, providers or places"} aria-label="Search" />
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <Link key={t.key} href={`/${l}/discover?tab=${t.key}`} className="tab" aria-selected={active === t.key}>
            {zh ? t.zh : t.en}
          </Link>
        ))}
      </div>

      {showServices ? (
        <section style={{ marginBottom: "var(--space-12)" }}>
          {active === "all" ? <h2 className="section-head" style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{zh ? "服务" : "Services"}</h2> : null}
          <div className="disc-grid">{SERVICES.map((s) => <ServiceCard key={s.slug} locale={l} s={s} />)}</div>
        </section>
      ) : null}

      {showProviders ? (
        <section style={{ marginBottom: "var(--space-12)" }}>
          {active === "all" ? <h2 className="section-head" style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{zh ? "服务商" : "Providers"}</h2> : null}
          <div className="disc-grid disc-grid--2">{PROVIDERS.map((p) => <ProviderCard key={p.slug} locale={l} p={p} />)}</div>
        </section>
      ) : null}

      {showPlaces ? (
        <section style={{ marginBottom: "var(--space-12)" }}>
          {active === "all" ? <h2 className="section-head" style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{zh ? "场所" : "Places"}</h2> : null}
          <div className="disc-grid">{PLACES.map((pl) => <PlaceCard key={pl.slug} locale={l} pl={pl} />)}</div>
        </section>
      ) : null}

      {showProducts ? (
        <section style={{ marginBottom: "var(--space-12)" }}>
          {active === "all" ? <h2 className="section-head" style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{zh ? "商品" : "Products"}</h2> : null}
          <div className="disc-grid">{PRODUCTS.map((pr) => <ProductCard key={pr.slug} locale={l} pr={pr} />)}</div>
        </section>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { Search } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import {
  ServiceCard, ProviderCard, PlaceCard, ProductCard,
  type ServiceCardData, type ProviderCardData, type PlaceCardData, type ProductCardData,
} from "@/components/marketing/Cards";
import {
  DEMO_SERVICES, DEMO_PROVIDERS, DEMO_PLACES, DEMO_PRODUCTS,
  getProvider, getPlace, packagesByService, servicesByProvider,
  svcName, provName, placeName, money, occasionLabel,
  OCCASION_CHIPS, type Occasion, type DemoService,
} from "@/lib/demo/catalog";

const OCCASION_KEYS = OCCASION_CHIPS.map((c) => c.key);
const isOccasion = (x: string): x is Occasion => (OCCASION_KEYS as string[]).includes(x)
  || ["vesak", "hungry_ghost", "birthday"].includes(x);

function toServiceCard(s: DemoService, l: string): ServiceCardData {
  const pkgs = packagesByService(s.slug);
  const start = pkgs.length ? Math.min(...pkgs.map((p) => p.price)) : s.price;
  const provider = getProvider(s.providerSlug);
  const place = getPlace(s.placeSlug);
  return {
    slug: s.slug, name: svcName(s, l), provider: provider ? provName(provider, l) : "",
    place: place ? `${placeName(place, l)} · ${s.region}` : s.region,
    price: money(start, s.currency), verified: provider?.verified,
    evidence: s.evidence, fulfilment: l === "zh" ? "服务商代办" : "Provider fulfilled", demo: true,
  };
}

const TABS = [
  { key: "all", en: "All", zh: "全部" },
  { key: "services", en: "Services", zh: "服务" },
  { key: "providers", en: "Providers", zh: "服务商" },
  { key: "places", en: "Places", zh: "场所" },
  { key: "products", en: "Products", zh: "供品" },
];

export default async function Discover({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; occasion?: string }>;
}) {
  const { locale } = await params;
  const { tab = "all", occasion } = await searchParams;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const occ = occasion && isOccasion(occasion) ? (occasion as Occasion) : undefined;
  const active = occ ? "services" : (TABS.some((t) => t.key === tab) ? tab : "all");

  const svcSource = occ ? DEMO_SERVICES.filter((s) => s.occasions.includes(occ)) : DEMO_SERVICES;
  const SERVICES: ServiceCardData[] = svcSource.map((s) => toServiceCard(s, l));
  const PROVIDERS: ProviderCardData[] = DEMO_PROVIDERS.map((p) => ({
    slug: p.slug, name: provName(p, l), place: p.location, verified: p.verified,
    serviceCount: servicesByProvider(p.slug).length, demo: true,
  }));
  const PLACES: PlaceCardData[] = DEMO_PLACES.map((pl) => ({
    slug: pl.slug, name: placeName(pl, l), location: pl.location,
    providerCount: DEMO_PROVIDERS.filter((p) => p.placeSlug === pl.slug).length,
    serviceCount: DEMO_SERVICES.filter((s) => s.placeSlug === pl.slug).length, demo: true,
  }));
  const PRODUCTS: ProductCardData[] = DEMO_PRODUCTS.map((pr) => {
    const provider = getProvider(pr.providerSlug);
    return { slug: pr.slug, name: pr.name, provider: provider ? provName(provider, l) : "", price: money(pr.price, pr.currency) };
  });

  const showServices = active === "all" || active === "services";
  const showProviders = !occ && (active === "all" || active === "providers");
  const showPlaces = !occ && (active === "all" || active === "places");
  const showProducts = !occ && (active === "all" || active === "products");

  return (
    <div className="container section">
      <h1 style={{ fontSize: "var(--text-4xl)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
        {occ ? occasionLabel(occ, l) : (zh ? "发现" : "Discover")}
      </h1>
      {occ ? (
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
          {zh ? `与「${occasionLabel(occ, "zh")}」相关的服务` : `Services for ${occasionLabel(occ, "en")}`} ·{" "}
          <Link href={`/${l}/discover`} className="nav-link-plain" style={{ display: "inline" }}>{zh ? "清除筛选" : "Clear filter"}</Link>
        </p>
      ) : null}

      <div className="search-bar" style={{ marginBottom: "var(--space-5)" }}>
        <Search size={20} className="sb-icon" />
        <input placeholder={zh ? "搜索服务、服务商或场所" : "Search services, providers or places"} aria-label="Search" />
      </div>

      {/* Occasion chips */}
      <div className="chip-row" style={{ marginBottom: "var(--space-6)" }}>
        {OCCASION_CHIPS.map((c) => (
          <Link key={c.key} href={`/${l}/discover?occasion=${c.key}`} className={`chip${occ === c.key ? " chip--active" : ""}`}>
            {zh ? c.zh : c.en}
          </Link>
        ))}
      </div>

      {!occ ? (
        <div className="tabs">
          {TABS.map((t) => (
            <Link key={t.key} href={`/${l}/discover?tab=${t.key}`} className="tab" aria-selected={active === t.key}>
              {zh ? t.zh : t.en}
            </Link>
          ))}
        </div>
      ) : null}

      {showServices ? (
        <section style={{ marginBottom: "var(--space-12)" }}>
          {active === "all" ? <h2 className="section-head" style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{zh ? "服务" : "Services"}</h2> : null}
          {SERVICES.length ? (
            <div className="disc-grid">{SERVICES.map((s) => <ServiceCard key={s.slug} locale={l} s={s} />)}</div>
          ) : (
            <p style={{ color: "var(--color-text-secondary)" }}>{zh ? "暂无相关服务。" : "No services for this occasion yet."}</p>
          )}
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
          {active === "all" ? <h2 className="section-head" style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{zh ? "供品" : "Products"}</h2> : null}
          <div className="disc-grid">{PRODUCTS.map((pr) => <ProductCard key={pr.slug} locale={l} pr={pr} />)}</div>
        </section>
      ) : null}
    </div>
  );
}

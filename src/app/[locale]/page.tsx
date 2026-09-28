import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import {
  Search, ShieldCheck, ClipboardList, Sparkles, Camera, MapPin, ArrowRight, Store, Video,
} from "lucide-react";
import { ServiceCard, PlaceCard, type ServiceCardData, type PlaceCardData } from "@/components/marketing/Cards";
import {
  DEMO_SERVICES, DEMO_PLACES, getProvider, getPlace, packagesByService,
  svcName, provName, placeName, money, OCCASION_CHIPS, occasionLabel,
  upcomingOccasions, servicesByOccasion, type DemoService,
} from "@/lib/demo/catalog";
import { formatDate } from "@/lib/format";

// Localised marketing copy kept local to the page (no typed-dictionary churn).
const COPY = {
  en: {
    heroTitle: "Wherever you are, your offering still reaches the temple.",
    heroSub: "Local providers make offerings, light lamps and tend graves for you — with a photo and video record.",
    exploreServices: "Explore services", forProviders: "For providers",
    searchHead: "What are you looking for?",
    searchPlaceholder: "Search services, providers or places",
    exploreServicesHead: "Explore services", exploreServicesSub: "Verified providers, clear expectations, and a record when the work is done.",
    explorePlacesHead: "Explore places", explorePlacesSub: "Discover places and the independent providers associated with them.",
    worksHead: "How Yuancheng works",
    trustHead: "Built on trust",
    providerCtaHead: "Run your services with Yuancheng.",
    providerCtaSub: "Publish your storefront, take orders, and record completion — all in one place.",
    becomeProvider: "Become a provider", viewAll: "View all",
    steps: [
      ["Discover", "Browse services and products from providers connected to places you care about."],
      ["Order", "Place an order with clear pricing, fulfilment and evidence expectations up front."],
      ["Fulfil", "The provider accepts and carries out the service on your behalf."],
      ["Evidence", "Where offered, the provider submits photo or video records on completion."],
    ],
    trust: [
      ["Provider verification", "Providers are reviewed before they can publish services."],
      ["Clear service expectations", "Every service states its price, fulfilment and evidence policy."],
      ["Order records", "Each order keeps a full, timestamped history."],
      ["Completion evidence", "Where offered, completion is recorded with photos or video."],
    ],
    categories: ["Offerings", "Ceremonies", "Temple Services", "Religious Products", "Other Services"],
  },
  zh: {
    heroTitle: "人在外地，心意照样送到。",
    heroSub: "由当地服务商代您供奉、点灯、扫墓，完成后附照片与视频记录。",
    exploreServices: "浏览服务", forProviders: "服务商入口",
    searchHead: "您在寻找什么？",
    searchPlaceholder: "搜索服务、服务商或场所",
    exploreServicesHead: "浏览服务", exploreServicesSub: "经核实的服务商、清晰的说明，完成后留有记录。",
    explorePlacesHead: "探索场所", explorePlacesSub: "发现场所以及与其相关的独立服务商。",
    worksHead: "愿成如何运作",
    trustHead: "建立在信任之上",
    providerCtaHead: "在愿成经营您的服务。",
    providerCtaSub: "发布店面、接收订单并记录完成情况——一站式完成。",
    becomeProvider: "成为服务商", viewAll: "查看全部",
    steps: [
      ["发现", "浏览与您关心的场所相关的服务商所提供的服务与商品。"],
      ["下单", "以清晰的价格、代办方式与完成记录说明下单。"],
      ["代办", "服务商接单并代您完成服务。"],
      ["完成记录", "在提供的情况下，服务商在完成时提交照片或视频记录。"],
    ],
    trust: [
      ["服务商核实", "服务商需经审核方可发布服务。"],
      ["清晰的服务说明", "每项服务均标明价格、代办方式与完成记录政策。"],
      ["订单记录", "每笔订单均保留完整的时间记录。"],
      ["完成记录", "在提供的情况下，完成时以照片或视频记录。"],
    ],
    categories: ["供奉", "法会", "寺庙服务", "宗教用品", "其他服务"],
  },
} as const;

// Build a localised service card from a demo service (price = cheapest package).
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

const STEP_ICONS = [Search, ClipboardList, Sparkles, Camera];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const t = COPY[zh ? "zh" : "en"];

  const featured = DEMO_SERVICES.slice(0, 6).map((s) => toServiceCard(s, l));
  const places: PlaceCardData[] = DEMO_PLACES.map((p) => ({
    slug: p.slug, name: placeName(p, l), location: p.location,
    providerCount: 1, serviceCount: DEMO_SERVICES.filter((s) => s.placeSlug === p.slug).length, demo: true,
  }));
  const upcoming = upcomingOccasions().slice(0, 4).map((u) => ({
    ...u, label: occasionLabel(u.key, l), dateLabel: formatDate(u.date, zh ? "zh" : "en"),
    services: servicesByOccasion(u.key).slice(0, 1).map((s) => toServiceCard(s, l)),
  }));

  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>{t.heroTitle}</h1>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-ctas">
              <Link href={`/${l}/discover`} className="btn btn-primary btn-lg">{t.exploreServices}</Link>
              <Link href="/provider" className="btn btn-secondary btn-lg">{t.forProviders}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <article className="feature-card">
              <div className="feature-card-img"><Store size={40} /></div>
              <div className="feature-card-body">
                <h3>{zh ? "寺庙供奉服务" : "Temple Offering Service"}</h3>
                <div className="fc-provider">Golden Lotus Services</div>
                <div className="fc-place"><MapPin size={13} /> Golden Lotus Temple · Kuala Lumpur</div>
                <div className="feature-card-tags">
                  <span className="tag tag--verified"><ShieldCheck size={13} /> {zh ? "已核实服务商" : "Verified provider"}</span>
                  <span className="tag"><Video size={13} /> {zh ? "照片 + 视频" : "Photo + video"}</span>
                  <span className="tag">{zh ? "服务商代办" : "Provider fulfilled"}</span>
                </div>
                <div className="feature-card-foot">
                  <span className="feature-card-price">RM 88.00</span>
                  <Link href={`/${l}/services/temple-offering-service`} className="btn btn-primary btn-sm">{zh ? "查看服务" : "View service"}</Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Search */}
      <section className="section--tight section-alt">
        <div className="container">
          <div className="section-head" style={{ marginBottom: "var(--space-6)" }}><h2>{t.searchHead}</h2></div>
          <Link href={`/${l}/discover`} className="search-bar" style={{ marginBottom: "var(--space-6)" }}>
            <Search size={20} className="sb-icon" />
            <span style={{ color: "var(--color-text-muted)" }}>{t.searchPlaceholder}</span>
          </Link>
          <div className="chip-row">
            {OCCASION_CHIPS.map((c) => (
              <Link key={c.key} href={`/${l}/discover?occasion=${c.key}`} className="chip">{zh ? c.zh : c.en}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2b — Upcoming occasions (computed from today) */}
      <section className="section--tight">
        <div className="container">
          <div className="section-head" style={{ marginBottom: "var(--space-5)" }}>
            <h2>{zh ? "即将到来的时节" : "Upcoming occasions"}</h2>
          </div>
          <div className="upcoming-strip">
            {upcoming.map((u) => (
              <Link key={u.key} href={`/${l}/discover?occasion=${u.key}`} className="upcoming-card">
                <div className="upcoming-date">{u.dateLabel}</div>
                <div className="upcoming-title">{u.label}</div>
                {u.services[0] ? <div className="upcoming-svc">{u.services[0].name} · {u.services[0].price}</div> : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Explore services */}
      <section className="section">
        <div className="container">
          <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: "none" }}>
            <div><h2>{t.exploreServicesHead}</h2><p>{t.exploreServicesSub}</p></div>
            <Link href={`/${l}/discover`} className="disc-card-cta" style={{ whiteSpace: "nowrap" }}>{t.viewAll} <ArrowRight size={15} /></Link>
          </div>
          <div className="disc-grid">
            {featured.map((s) => <ServiceCard key={s.slug} locale={l} s={s} />)}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Explore places */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head"><h2>{t.explorePlacesHead}</h2><p>{t.explorePlacesSub}</p></div>
          <div className="disc-grid">
            {places.map((pl) => <PlaceCard key={pl.slug} locale={l} pl={pl} />)}
          </div>
        </div>
      </section>

      {/* SECTION 5 — How it works */}
      <section className="section">
        <div className="container">
          <div className="section-head"><h2>{t.worksHead}</h2></div>
          <div className="steps">
            {t.steps.map(([title, body], i) => {
              const Icon = STEP_ICONS[i];
              return (
                <div key={title} className="step">
                  <div className="step-n">{i + 1}</div>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Icon size={18} /> {title}</h3>
                  <p>{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Trust */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head"><h2>{t.trustHead}</h2></div>
          <div className="trust-grid">
            {t.trust.map(([title, body]) => (
              <div key={title} className="trust-item">
                <ShieldCheck size={20} className="ti-icon" />
                <div><h4>{title}</h4><p>{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — Provider CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>{t.providerCtaHead}</h2>
            <p>{t.providerCtaSub}</p>
            <Link href="/provider" className="btn btn-lg" style={{ background: "#fff", color: "var(--evergreen)" }}>{t.becomeProvider}</Link>
          </div>
        </div>
      </section>
      {/* SECTION 8 — footer rendered by [locale]/layout (SiteFooter) */}
    </>
  );
}

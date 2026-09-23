import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import {
  Search, ShieldCheck, ClipboardList, Sparkles, Camera, MapPin, ArrowRight, Store, Video,
} from "lucide-react";
import { ServiceCard, PlaceCard, type ServiceCardData, type PlaceCardData } from "@/components/marketing/Cards";

// Localised marketing copy kept local to the page (no typed-dictionary churn).
const COPY = {
  en: {
    heroTitle: "Trusted religious services, made easier to discover and fulfil.",
    heroSub: "Explore providers, services and products connected to places and communities.",
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
    heroTitle: "值得信赖的宗教服务，更易于发现与代办。",
    heroSub: "探索与场所和社区相关的服务商、服务与商品。",
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
      ["下单", "以清晰的价格、代办方式与凭证说明下单。"],
      ["代办", "服务商接单并代您完成服务。"],
      ["凭证", "在提供的情况下，服务商在完成时提交照片或视频记录。"],
    ],
    trust: [
      ["服务商核实", "服务商需经审核方可发布服务。"],
      ["清晰的服务说明", "每项服务均标明价格、代办方式与凭证政策。"],
      ["订单记录", "每笔订单均保留完整的时间记录。"],
      ["完成凭证", "在提供的情况下，完成时以照片或视频记录。"],
    ],
    categories: ["供奉", "法会", "寺庙服务", "宗教用品", "其他服务"],
  },
} as const;

// Sample demo content (fictional — Investor Demo). Real listings render once seeded.
const SAMPLE_SERVICES: ServiceCardData[] = [
  { slug: "temple-offering-service", name: "Temple Offering Service", provider: "Golden Lotus Services", place: "Golden Lotus Temple · Kuala Lumpur", price: "RM 88", verified: true, evidence: "photo_video", fulfilment: "Provider fulfilled" },
  { slug: "blessing-service", name: "Blessing Service", provider: "Golden Lotus Services", place: "Golden Lotus Temple · Kuala Lumpur", price: "RM 120", verified: true, evidence: "photo", fulfilment: "Provider fulfilled" },
  { slug: "ancestral-remembrance", name: "Ancestral Remembrance", provider: "Golden Lotus Services", place: "Golden Lotus Temple · Kuala Lumpur", price: "RM 168", verified: true, evidence: "photo_video", fulfilment: "Provider fulfilled" },
];
const SAMPLE_PLACES: PlaceCardData[] = [
  { slug: "golden-lotus-temple", name: "Golden Lotus Temple", location: "Kuala Lumpur, Malaysia", providerCount: 1, serviceCount: 3 },
];

const STEP_ICONS = [Search, ClipboardList, Sparkles, Camera];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const t = COPY[l === "zh" ? "zh" : "en"];

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
                <h3>Temple Offering Service</h3>
                <div className="fc-provider">Golden Lotus Services</div>
                <div className="fc-place"><MapPin size={13} /> Golden Lotus Temple · Kuala Lumpur</div>
                <div className="feature-card-tags">
                  <span className="tag tag--verified"><ShieldCheck size={13} /> Verified provider</span>
                  <span className="tag"><Video size={13} /> Photo + video</span>
                  <span className="tag">Provider fulfilled</span>
                </div>
                <div className="feature-card-foot">
                  <span className="feature-card-price">RM 88</span>
                  <Link href={`/${l}/services/temple-offering-service`} className="btn btn-primary btn-sm">View service</Link>
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
            {t.categories.map((c) => (
              <Link key={c} href={`/${l}/discover`} className="chip">{c}</Link>
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
            {SAMPLE_SERVICES.map((s) => <ServiceCard key={s.slug} locale={l} s={s} />)}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Explore places */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head"><h2>{t.explorePlacesHead}</h2><p>{t.explorePlacesSub}</p></div>
          <div className="disc-grid">
            {SAMPLE_PLACES.map((pl) => <PlaceCard key={pl.slug} locale={l} pl={pl} />)}
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

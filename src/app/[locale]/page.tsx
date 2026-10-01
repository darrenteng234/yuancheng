import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import { Sparkles, CreditCard, Camera } from "lucide-react";
import { ServiceCard, type ServiceCardData } from "@/components/marketing/Cards";
import {
  DEMO_SERVICES, getProvider, getPlace, packagesByService,
  svcName, provName, placeName, money, OCCASION_CHIPS, type DemoService,
} from "@/lib/demo/catalog";

// Localised marketing copy kept local to the page.
const COPY = {
  en: {
    heroTitle: "Wherever you are, your offering still reaches the temple.",
    heroSub: "Local providers make offerings, light lamps and tend graves for you — with a photo and video record.",
    browse: "Browse services",
    featuredHead: "Featured services",
    worksHead: "How it works",
    steps: [
      ["Choose a service", "Pick a service and package."],
      ["Pay the provider", "Pay the provider directly and upload your receipt."],
      ["Get a completion record", "Receive a photo and video record on completion."],
    ],
  },
  zh: {
    heroTitle: "人在外地，心意照样送到。",
    heroSub: "由当地服务商代您供奉、点灯、扫墓，完成后附照片与视频记录。",
    browse: "浏览服务",
    featuredHead: "精选服务",
    worksHead: "运作方式",
    steps: [
      ["选服务", "挑选服务与配套。"],
      ["付款给服务商", "直接向服务商付款并上传收据。"],
      ["收到完成记录", "完成后收到照片与视频记录。"],
    ],
  },
} as const;

const EVIDENCE_META = {
  none: { en: "No record", zh: "无记录" },
  photo: { en: "Photo record", zh: "照片记录" },
  photo_video: { en: "Photo + video record", zh: "照片 + 视频记录" },
};
const STEP_ICONS = [Sparkles, CreditCard, Camera];

// Localised service card (price = cheapest package; one meta line: evidence · delivery).
function toServiceCard(s: DemoService, l: string): ServiceCardData {
  const pkgs = packagesByService(s.slug);
  const start = pkgs.length ? Math.min(...pkgs.map((p) => p.price)) : s.price;
  const provider = getProvider(s.providerSlug);
  const place = getPlace(s.placeSlug);
  const zh = l === "zh";
  return {
    slug: s.slug, name: svcName(s, l), provider: provider ? provName(provider, l) : "",
    place: place ? `${placeName(place, l)} · ${s.region}` : s.region,
    price: money(start, s.currency), evidence: s.evidence, demo: true,
    meta: `${EVIDENCE_META[s.evidence][zh ? "zh" : "en"]} · ${s.delivery[zh ? "zh" : "en"]}`,
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "en";
  const zh = l === "zh";
  const t = COPY[zh ? "zh" : "en"];
  // One service each from three different providers + occasions.
  const FEATURED_SLUGS = ["grave-tending", "lamp-dedication", "monk-alms"];
  const featured = FEATURED_SLUGS
    .map((slug) => DEMO_SERVICES.find((s) => s.slug === slug))
    .filter((s): s is DemoService => Boolean(s))
    .map((s) => toServiceCard(s, l));

  return (
    <>
      {/* 1 — Hero + occasion chips */}
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: 820 }}>
            <h1>{t.heroTitle}</h1>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-ctas" style={{ marginBottom: "var(--space-6)" }}>
              <Link href={`/${l}/discover`} className="btn btn-primary btn-lg">{t.browse}</Link>
            </div>
            <div className="chip-row">
              {OCCASION_CHIPS.map((c) => (
                <Link key={c.key} href={`/${l}/discover?occasion=${c.key}`} className="chip">{zh ? c.zh : c.en}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Featured services */}
      <section className="section">
        <div className="container">
          <div className="section-head"><h2>{t.featuredHead}</h2></div>
          <div className="disc-grid">
            {featured.map((s) => <ServiceCard key={s.slug} locale={l} s={s} />)}
          </div>
        </div>
      </section>

      {/* 3 — How it works (3 steps) */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head"><h2>{t.worksHead}</h2></div>
          <div className="steps steps--3">
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
      {/* 4 — footer rendered by [locale]/layout (SiteFooter) */}
    </>
  );
}

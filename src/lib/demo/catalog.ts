/**
 * Fictional "Investor Demo" catalog used to render the public browse surface
 * (home, discover, place/provider/service/product detail) before/independently
 * of live DB rows. All entities are clearly marked demo. This is display data
 * only — real orders/payments always go through the DB + domain logic.
 */

export interface DemoService {
  slug: string; name: string; providerSlug: string; placeSlug: string;
  price: number; currency: string;
  evidence: "none" | "photo" | "photo_video";
  visibility: "automatic" | "approval";
  fulfilment: string;
  about: { en: string; zh: string };
  category: string;
}
export interface DemoProvider {
  slug: string; name: string; placeSlug: string; verified: boolean;
  about: { en: string; zh: string }; location: string;
}
export interface DemoPlace {
  slug: string; name: string; location: string; about: { en: string; zh: string };
}
export interface DemoProduct {
  slug: string; name: string; providerSlug: string; price: number; currency: string;
  about: { en: string; zh: string };
}

export const DEMO_PLACES: DemoPlace[] = [
  {
    slug: "golden-lotus-temple", name: "Golden Lotus Temple", location: "Kuala Lumpur, Malaysia",
    about: {
      en: "A community temple in Kuala Lumpur. Independent providers offer services associated with this place.",
      zh: "位于吉隆坡的社区寺庙。独立服务商提供与此地相关的服务。",
    },
  },
];

export const DEMO_PROVIDERS: DemoProvider[] = [
  {
    slug: "golden-lotus-services", name: "Golden Lotus Services", placeSlug: "golden-lotus-temple",
    verified: true, location: "Kuala Lumpur",
    about: {
      en: "An independent provider offering offerings, ceremonies and remembrance services. Operates at Golden Lotus Temple.",
      zh: "一家独立服务商，提供供奉、法会与追思服务，在金莲寺开展业务。",
    },
  },
];

export const DEMO_SERVICES: DemoService[] = [
  {
    slug: "temple-offering-service", name: "Temple Offering Service", providerSlug: "golden-lotus-services",
    placeSlug: "golden-lotus-temple", price: 88, currency: "MYR", evidence: "photo_video",
    visibility: "automatic", fulfilment: "Provider fulfilled", category: "Offerings",
    about: {
      en: "An offering made on your behalf at the temple, with photo and video recorded on completion.",
      zh: "由服务商代您在寺庙进行供奉，完成时附照片与视频记录。",
    },
  },
  {
    slug: "blessing-service", name: "Blessing Service", providerSlug: "golden-lotus-services",
    placeSlug: "golden-lotus-temple", price: 120, currency: "MYR", evidence: "photo",
    visibility: "approval", fulfilment: "Provider fulfilled", category: "Ceremonies",
    about: {
      en: "A blessing ceremony performed on your behalf, with a photo record on completion.",
      zh: "由服务商代您进行祈福仪式，完成时附照片记录。",
    },
  },
  {
    slug: "ancestral-remembrance", name: "Ancestral Remembrance", providerSlug: "golden-lotus-services",
    placeSlug: "golden-lotus-temple", price: 168, currency: "MYR", evidence: "photo_video",
    visibility: "automatic", fulfilment: "Provider fulfilled", category: "Ceremonies",
    about: {
      en: "A remembrance service for ancestors, with photo and video recorded on completion.",
      zh: "为先人举行的追思服务，完成时附照片与视频记录。",
    },
  },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    slug: "blessing-set", name: "Blessing Set", providerSlug: "golden-lotus-services",
    price: 68, currency: "MYR",
    about: {
      en: "A physical blessing set. Purchased externally — contact the provider to arrange.",
      zh: "实体祈福套装。通过外部渠道购买——请联系服务商安排。",
    },
  },
];

export const money = (n: number, cur = "MYR") => `${cur === "MYR" ? "RM" : cur} ${n.toFixed(0)}`;

export const getService = (slug: string) => DEMO_SERVICES.find((s) => s.slug === slug);
export const getProvider = (slug: string) => DEMO_PROVIDERS.find((p) => p.slug === slug);
export const getPlace = (slug: string) => DEMO_PLACES.find((p) => p.slug === slug);
export const getProduct = (slug: string) => DEMO_PRODUCTS.find((p) => p.slug === slug);
export const servicesByProvider = (slug: string) => DEMO_SERVICES.filter((s) => s.providerSlug === slug);
export const servicesByPlace = (slug: string) => DEMO_SERVICES.filter((s) => s.placeSlug === slug);
export const providersByPlace = (slug: string) => DEMO_PROVIDERS.filter((p) => p.placeSlug === slug);
export const productsByProvider = (slug: string) => DEMO_PRODUCTS.filter((p) => p.providerSlug === slug);

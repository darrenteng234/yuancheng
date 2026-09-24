/**
 * Fictional "Investor Demo" catalog used to render the public browse surface
 * (home, discover, place/provider/service/product detail) before/independently
 * of live DB rows. All entities are clearly marked demo. This is display data
 * only — real orders/payments always go through the DB + domain logic.
 */
import type { OrderStatus } from "@/types/platform";

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

// ── Packages (customer-facing: Service → Package). "What's included" per price ──
export interface DemoPackage {
  id: string; serviceSlug: string; name: string; tier: string; price: number; currency: string;
  includes: { en: string; zh: string }[];
  evidence: "none" | "photo" | "photo_video";
}
export const DEMO_PACKAGES: DemoPackage[] = [
  { id: "pk-offering-basic", serviceSlug: "temple-offering-service", name: "Basic", tier: "basic", price: 88, currency: "MYR", evidence: "photo",
    includes: [{ en: "Standard offering set", zh: "标准供品套装" }, { en: "Provider fulfilment", zh: "服务商代办" }, { en: "Photo evidence", zh: "照片凭证" }] },
  { id: "pk-offering-premium", serviceSlug: "temple-offering-service", name: "Premium", tier: "premium", price: 188, currency: "MYR", evidence: "photo_video",
    includes: [{ en: "Larger offering set", zh: "加大供品套装" }, { en: "Provider fulfilment", zh: "服务商代办" }, { en: "Photo + video evidence", zh: "照片 + 视频凭证" }] },
  { id: "pk-blessing-basic", serviceSlug: "blessing-service", name: "Standard", tier: "standard", price: 120, currency: "MYR", evidence: "photo",
    includes: [{ en: "Blessing ceremony", zh: "祈福仪式" }, { en: "Provider fulfilment", zh: "服务商代办" }, { en: "Photo evidence", zh: "照片凭证" }] },
  { id: "pk-ancestral-basic", serviceSlug: "ancestral-remembrance", name: "Standard", tier: "standard", price: 168, currency: "MYR", evidence: "photo_video",
    includes: [{ en: "Remembrance service", zh: "追思服务" }, { en: "Provider fulfilment", zh: "服务商代办" }, { en: "Photo + video evidence", zh: "照片 + 视频凭证" }] },
];
export const packagesByService = (slug: string) => DEMO_PACKAGES.filter((p) => p.serviceSlug === slug);
export const getPackage = (id: string) => DEMO_PACKAGES.find((p) => p.id === id);

// ── Provider payment method (manual, provider-direct) ──────────────────────────
export const DEMO_PAYMENT_METHOD = {
  type: "duitnow_qr" as const,
  display_name: "Golden Lotus Services — DuitNow",
  bank_name: "Maybank",
  account_name: "Golden Lotus Services Sdn Bhd",
  account_number: "5141 2233 4455",
  instructions: {
    en: "Transfer the exact amount, then upload your receipt. The provider will verify your payment.",
    zh: "请转账确切金额，然后上传收据。服务商将核实您的付款。",
  },
};

// ── Demo orders (customer/provider/admin UI fixtures) ──────────────────────────
export type DemoEvidence = { type: "photo" | "video"; url: string; label: string };
export interface DemoOrder {
  id: string; order_number: string; serviceSlug: string; packageId: string; providerSlug: string;
  status: OrderStatus; amount: number; currency: string; created_at: string;
  customer_name: string; customer_request: string; customer_location?: string;
  evidence: DemoEvidence[];
}
export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: "ord-a", order_number: "YC-90001", serviceSlug: "temple-offering-service", packageId: "pk-offering-basic",
    providerSlug: "golden-lotus-services", status: "payment_proof_submitted", amount: 88, currency: "MYR",
    created_at: "2026-09-20", customer_name: "Demo Customer",
    customer_request: "Please make an offering for the health and safety of my family.",
    evidence: [],
  },
  {
    id: "ord-b", order_number: "YC-90002", serviceSlug: "temple-offering-service", packageId: "pk-offering-premium",
    providerSlug: "golden-lotus-services", status: "completed", amount: 188, currency: "MYR",
    created_at: "2026-09-12", customer_name: "Demo Customer",
    customer_request: "Offering with photo and video, in memory of my grandfather.",
    evidence: [
      { type: "photo", url: "https://picsum.photos/seed/yuancheng1/900/700", label: "Offering placed" },
      { type: "photo", url: "https://picsum.photos/seed/yuancheng2/900/700", label: "At the altar" },
      { type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", label: "Ceremony clip" },
    ],
  },
];
export const getOrder = (id: string) => DEMO_ORDERS.find((o) => o.id === id || o.order_number === id);

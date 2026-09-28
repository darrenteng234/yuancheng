/**
 * Fictional "Investor Demo" catalog used to render the public browse surface
 * (home, discover, place/provider/service/product detail) before/independently
 * of live DB rows. All entities are clearly marked demo (demo: true → a small
 * "示范 / Demo" tag). This is display data only — real orders/payments always go
 * through the DB + domain logic. Names are invented; never real temple names.
 */
import type { OrderStatus } from "@/types/platform";

// ── Occasions ──────────────────────────────────────────────────────────────────
export type Occasion =
  | "qingming" | "anniversary" | "cny_taisui" | "vesak"
  | "hungry_ghost" | "birthday" | "family_blessing" | "lamp" | "alms";

export const OCCASION_LABEL: Record<Occasion, { en: string; zh: string }> = {
  qingming: { en: "Qingming", zh: "清明" },
  anniversary: { en: "Death anniversary", zh: "忌日" },
  cny_taisui: { en: "New Year Tai Sui", zh: "新年安太岁" },
  vesak: { en: "Vesak", zh: "卫塞节" },
  hungry_ghost: { en: "Hungry Ghost", zh: "中元节" },
  birthday: { en: "Birthday", zh: "寿诞" },
  family_blessing: { en: "Family blessing", zh: "家人祈福" },
  lamp: { en: "Lamp lighting", zh: "点灯" },
  alms: { en: "Alms & monk offering", zh: "供斋供僧" },
};
export const occasionLabel = (o: Occasion, locale: string) => OCCASION_LABEL[o][locale === "zh" ? "zh" : "en"];

/** Occasion chips shown on the home page (ordered). */
export const OCCASION_CHIPS: { key: Occasion; en: string; zh: string }[] = [
  { key: "qingming", en: "Qingming grave visit", zh: "清明扫墓" },
  { key: "anniversary", en: "Death anniversary", zh: "先人忌日" },
  { key: "family_blessing", en: "Family blessing", zh: "家人祈福" },
  { key: "cny_taisui", en: "New Year Tai Sui", zh: "新年安太岁" },
  { key: "lamp", en: "Lamp lighting", zh: "点灯" },
  { key: "alms", en: "Alms & monk offering", zh: "供斋供僧" },
];

// ── Types ────────────────────────────────────────────────────────────────────
export interface DemoService {
  slug: string; name: string; nameZh: string; providerSlug: string; placeSlug: string;
  price: number; currency: string;
  evidence: "none" | "photo" | "photo_video";
  visibility: "automatic" | "approval";
  fulfilment: string;
  about: { en: string; zh: string };
  category: string;
  occasions: Occasion[];
  delivery: { en: string; zh: string };
  region: string;
  demo: true;
}
export interface DemoProvider {
  slug: string; name: string; nameZh: string; placeSlug: string; verified: boolean;
  about: { en: string; zh: string }; location: string; demo: true;
}
export interface DemoPlace {
  slug: string; name: string; nameZh: string; location: string; about: { en: string; zh: string }; demo: true;
}
export interface DemoProduct {
  slug: string; name: string; providerSlug: string; price: number; currency: string;
  about: { en: string; zh: string };
}

// Localised display-name helpers (customer surfaces).
export const svcName = (s: { name: string; nameZh: string }, locale: string) => (locale === "zh" ? s.nameZh : s.name);
export const provName = svcName;
export const placeName = svcName;

export const DEMO_PLACES: DemoPlace[] = [
  { slug: "golden-lotus-temple", name: "Golden Lotus Temple", nameZh: "金莲寺", location: "Kuala Lumpur, Malaysia", demo: true,
    about: { en: "A community temple in Kuala Lumpur. Independent providers offer services associated with this place.", zh: "位于吉隆坡的社区寺庙。独立服务商提供与此地相关的服务。" } },
  { slug: "evergreen-grove-hall", name: "Evergreen Grove Hall", nameZh: "常青园", location: "George Town, Penang", demo: true,
    about: { en: "A memorial grove and hall in Penang, where independent providers tend graves and light lamps on your behalf.", zh: "位于槟城的纪念园与礼堂，独立服务商在此代您扫墓、点灯。" } },
  { slug: "serene-water-temple", name: "Serene Water Temple", nameZh: "静水寺", location: "Ipoh, Perak", demo: true,
    about: { en: "A temple in Ipoh associated with alms and seasonal offerings carried out by independent providers.", zh: "位于怡保的寺庙，独立服务商在此进行供斋与节令供奉。" } },
  { slug: "jade-mountain-shrine", name: "Jade Mountain Shrine", nameZh: "玉山祠", location: "Johor Bahru, Johor", demo: true,
    about: { en: "A hillside shrine in Johor Bahru where independent providers keep tablets and dedicate lamps.", zh: "位于新山的山边祠堂，独立服务商在此安奉牌位、供养光明灯。" } },
  { slug: "harmony-pavilion", name: "Harmony Pavilion", nameZh: "和合轩", location: "Malacca City, Melaka", demo: true,
    about: { en: "A pavilion in Malacca associated with New Year and seasonal rites carried out by independent providers.", zh: "位于马六甲的轩阁，独立服务商在此进行新年与节令法事。" } },
];

export const DEMO_PROVIDERS: DemoProvider[] = [
  { slug: "golden-lotus-services", name: "Golden Lotus Services", nameZh: "金莲服务", placeSlug: "golden-lotus-temple", verified: true, location: "Kuala Lumpur", demo: true,
    about: { en: "An independent provider offering offerings, ceremonies and remembrance services. Operates at Golden Lotus Temple.", zh: "一家独立服务商，提供供奉、法会与追思服务，在金莲寺开展业务。" } },
  { slug: "evergreen-grove-rites", name: "Evergreen Grove Rites", nameZh: "常青园礼仪", placeSlug: "evergreen-grove-hall", verified: true, location: "Penang", demo: true,
    about: { en: "An independent provider tending graves and lighting lamps on your behalf at Evergreen Grove Hall.", zh: "一家独立服务商，在常青园代您扫墓、点灯。" } },
  { slug: "serene-water-merit", name: "Serene Water Merit", nameZh: "静水功德", placeSlug: "serene-water-temple", verified: true, location: "Ipoh", demo: true,
    about: { en: "An independent provider carrying out alms and seasonal offerings at Serene Water Temple.", zh: "一家独立服务商，在静水寺进行供斋与节令供奉。" } },
  { slug: "jade-mountain-devotions", name: "Jade Mountain Devotions", nameZh: "玉山敬奉", placeSlug: "jade-mountain-shrine", verified: true, location: "Johor Bahru", demo: true,
    about: { en: "An independent provider keeping ancestor tablets and dedicating lamps at Jade Mountain Shrine.", zh: "一家独立服务商，在玉山祠安奉先人牌位、供养光明灯。" } },
  { slug: "harmony-pavilion-care", name: "Harmony Pavilion Care", nameZh: "和合轩代办", placeSlug: "harmony-pavilion", verified: true, location: "Malacca", demo: true,
    about: { en: "An independent provider carrying out New Year and seasonal rites at Harmony Pavilion.", zh: "一家独立服务商，在和合轩进行新年与节令法事。" } },
];

const D3 = { en: "within 3 days", zh: "3 天内" };
const D5 = { en: "within 5 days", zh: "5 天内" };

export const DEMO_SERVICES: DemoService[] = [
  // Provider 1 — Golden Lotus Services (orders reference these slugs; keep them).
  { slug: "temple-offering-service", name: "Temple Offering Service", nameZh: "寺庙供奉服务", providerSlug: "golden-lotus-services", placeSlug: "golden-lotus-temple",
    price: 88, currency: "MYR", evidence: "photo_video", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Offerings",
    occasions: ["family_blessing", "cny_taisui"], delivery: D3, region: "Kuala Lumpur", demo: true,
    about: { en: "The provider makes an offering on your behalf at the temple and records it on completion.", zh: "服务商代您在寺庙进行供奉，完成时记录。" } },
  { slug: "blessing-service", name: "Blessing Service", nameZh: "祈福服务", providerSlug: "golden-lotus-services", placeSlug: "golden-lotus-temple",
    price: 120, currency: "MYR", evidence: "photo", visibility: "approval", fulfilment: "Provider fulfilled", category: "Ceremonies",
    occasions: ["family_blessing", "birthday"], delivery: D3, region: "Kuala Lumpur", demo: true,
    about: { en: "The provider carries out a blessing ceremony on your behalf and records it on completion.", zh: "服务商代您进行祈福仪式，完成时记录。" } },
  { slug: "ancestral-remembrance", name: "Ancestral Remembrance", nameZh: "先人追思服务", providerSlug: "golden-lotus-services", placeSlug: "golden-lotus-temple",
    price: 168, currency: "MYR", evidence: "photo_video", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Ceremonies",
    occasions: ["qingming", "anniversary"], delivery: D3, region: "Kuala Lumpur", demo: true,
    about: { en: "The provider holds a remembrance service for your ancestors and records it on completion.", zh: "服务商代您为先人举行追思，完成时记录。" } },

  // Provider 2 — Evergreen Grove Rites (Penang).
  { slug: "grave-tending", name: "Grave Tending", nameZh: "扫墓代办", providerSlug: "evergreen-grove-rites", placeSlug: "evergreen-grove-hall",
    price: 138, currency: "MYR", evidence: "photo_video", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Grave care",
    occasions: ["qingming", "anniversary"], delivery: D5, region: "Penang", demo: true,
    about: { en: "The provider cleans and tends the grave, and places offerings on your behalf.", zh: "服务商代您清理、打理墓地并摆放供品。" } },
  { slug: "lamp-lighting", name: "Lamp Lighting", nameZh: "点灯祈福", providerSlug: "evergreen-grove-rites", placeSlug: "evergreen-grove-hall",
    price: 78, currency: "MYR", evidence: "photo", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Lamps",
    occasions: ["lamp", "family_blessing", "vesak"], delivery: D3, region: "Penang", demo: true,
    about: { en: "The provider lights a lamp in your family's name and records it on completion.", zh: "服务商以您家人的名义点灯，完成时记录。" } },
  { slug: "taisui-blessing", name: "Tai Sui Offering", nameZh: "安太岁", providerSlug: "evergreen-grove-rites", placeSlug: "evergreen-grove-hall",
    price: 108, currency: "MYR", evidence: "photo", visibility: "approval", fulfilment: "Provider fulfilled", category: "New Year",
    occasions: ["cny_taisui"], delivery: D5, region: "Penang", demo: true,
    about: { en: "The provider registers a Tai Sui offering in your name for the new year and records it.", zh: "服务商在新年以您的名义登记安太岁供奉，并记录。" } },

  // Provider 3 — Serene Water Merit (Ipoh).
  { slug: "vesak-offering", name: "Vesak Offering", nameZh: "卫塞供斋", providerSlug: "serene-water-merit", placeSlug: "serene-water-temple",
    price: 158, currency: "MYR", evidence: "photo_video", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Offerings",
    occasions: ["vesak", "alms"], delivery: D3, region: "Ipoh", demo: true,
    about: { en: "The provider prepares a Vesak alms offering on your behalf and records it on completion.", zh: "服务商代您准备卫塞供斋，完成时记录。" } },
  { slug: "hungry-ghost-offering", name: "Hungry Ghost Offering", nameZh: "中元普度供奉", providerSlug: "serene-water-merit", placeSlug: "serene-water-temple",
    price: 188, currency: "MYR", evidence: "photo_video", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Seasonal",
    occasions: ["hungry_ghost"], delivery: D5, region: "Ipoh", demo: true,
    about: { en: "The provider makes a seventh-month offering on your behalf and records it on completion.", zh: "服务商代您在七月进行普度供奉，完成时记录。" } },
  { slug: "monk-alms", name: "Monk Alms Offering", nameZh: "供僧斋僧", providerSlug: "serene-water-merit", placeSlug: "serene-water-temple",
    price: 128, currency: "MYR", evidence: "photo", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Alms",
    occasions: ["alms", "family_blessing"], delivery: D3, region: "Ipoh", demo: true,
    about: { en: "The provider offers alms to monks in your family's name and records it on completion.", zh: "服务商以您家人的名义供僧，完成时记录。" } },

  // Provider 4 — Jade Mountain Devotions (Johor Bahru).
  { slug: "ancestor-tablet", name: "Ancestor Tablet Service", nameZh: "先人牌位供奉", providerSlug: "jade-mountain-devotions", placeSlug: "jade-mountain-shrine",
    price: 148, currency: "MYR", evidence: "photo", visibility: "approval", fulfilment: "Provider fulfilled", category: "Tablets",
    occasions: ["anniversary", "qingming"], delivery: D5, region: "Johor Bahru", demo: true,
    about: { en: "The provider installs and maintains an ancestor tablet on your behalf and records it.", zh: "服务商代您安奉并照料先人牌位，并记录。" } },
  { slug: "birthday-blessing", name: "Birthday Devotion", nameZh: "寿诞祈福", providerSlug: "jade-mountain-devotions", placeSlug: "jade-mountain-shrine",
    price: 98, currency: "MYR", evidence: "photo", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Ceremonies",
    occasions: ["birthday", "family_blessing"], delivery: D3, region: "Johor Bahru", demo: true,
    about: { en: "The provider carries out a birthday devotion in your family member's name and records it.", zh: "服务商以您家人的名义进行寿诞祈福，并记录。" } },
  { slug: "lamp-dedication", name: "Light Dedication", nameZh: "光明灯供养", providerSlug: "jade-mountain-devotions", placeSlug: "jade-mountain-shrine",
    price: 118, currency: "MYR", evidence: "photo_video", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Lamps",
    occasions: ["lamp", "family_blessing"], delivery: D3, region: "Johor Bahru", demo: true,
    about: { en: "The provider dedicates a light for the year in your family's name and records it.", zh: "服务商以您家人的名义供养全年光明灯，并记录。" } },

  // Provider 5 — Harmony Pavilion Care (Malacca).
  { slug: "cny-taisui-rite", name: "New Year Tai Sui Rite", nameZh: "新年安太岁法事", providerSlug: "harmony-pavilion-care", placeSlug: "harmony-pavilion",
    price: 168, currency: "MYR", evidence: "photo_video", visibility: "approval", fulfilment: "Provider fulfilled", category: "New Year",
    occasions: ["cny_taisui"], delivery: D5, region: "Malacca", demo: true,
    about: { en: "The provider carries out a New Year Tai Sui rite in your name and records it on completion.", zh: "服务商以您的名义进行新年安太岁法事，完成时记录。" } },
  { slug: "qingming-cleanup", name: "Qingming Grave Care", nameZh: "清明扫墓清理", providerSlug: "harmony-pavilion-care", placeSlug: "harmony-pavilion",
    price: 128, currency: "MYR", evidence: "photo_video", visibility: "automatic", fulfilment: "Provider fulfilled", category: "Grave care",
    occasions: ["qingming"], delivery: D5, region: "Malacca", demo: true,
    about: { en: "The provider cleans the grave and places Qingming offerings on your behalf and records it.", zh: "服务商代您清明扫墓、摆放供品，并记录。" } },
  { slug: "hungry-ghost-rite", name: "Ullambana Rite", nameZh: "盂兰盆超度", providerSlug: "harmony-pavilion-care", placeSlug: "harmony-pavilion",
    price: 198, currency: "MYR", evidence: "photo", visibility: "approval", fulfilment: "Provider fulfilled", category: "Seasonal",
    occasions: ["hungry_ghost", "anniversary"], delivery: D5, region: "Malacca", demo: true,
    about: { en: "The provider carries out an Ullambana rite for your ancestors and records it on completion.", zh: "服务商代您为先人进行盂兰盆超度，完成时记录。" } },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    slug: "blessing-set", name: "Offering Set", providerSlug: "golden-lotus-services",
    price: 68, currency: "MYR",
    about: {
      en: "A physical offering set. Purchased externally — contact the provider to arrange.",
      zh: "实体供品套装。通过外部渠道购买——请联系服务商安排。",
    },
  },
];

// Single money formatter (RM 88.00). Delegates to src/lib/format.
export { formatMoney as money } from "@/lib/format";

export const getService = (slug: string) => DEMO_SERVICES.find((s) => s.slug === slug);
export const getProvider = (slug: string) => DEMO_PROVIDERS.find((p) => p.slug === slug);
export const getPlace = (slug: string) => DEMO_PLACES.find((p) => p.slug === slug);
export const getProduct = (slug: string) => DEMO_PRODUCTS.find((p) => p.slug === slug);
export const servicesByProvider = (slug: string) => DEMO_SERVICES.filter((s) => s.providerSlug === slug);
export const servicesByPlace = (slug: string) => DEMO_SERVICES.filter((s) => s.placeSlug === slug);
export const providersByPlace = (slug: string) => DEMO_PROVIDERS.filter((p) => p.placeSlug === slug);
export const productsByProvider = (slug: string) => DEMO_PRODUCTS.filter((p) => p.providerSlug === slug);
export const servicesByOccasion = (o: Occasion) => DEMO_SERVICES.filter((s) => s.occasions.includes(o));

// ── Upcoming occasions (computed from today so the demo never goes stale) ────────
// Approximate festival dates for the demo; the "next" one after today is shown.
const FESTIVALS: { key: Occasion; dates: string[] }[] = [
  { key: "cny_taisui", dates: ["2026-02-17", "2027-02-06", "2028-01-26"] },
  { key: "qingming", dates: ["2026-04-04", "2027-04-05", "2028-04-04"] },
  { key: "vesak", dates: ["2026-05-31", "2027-05-20", "2028-05-09"] },
  { key: "hungry_ghost", dates: ["2026-09-05", "2027-08-26", "2028-09-13"] },
];
export interface UpcomingOccasion { key: Occasion; date: string; }
export function upcomingOccasions(now: Date = new Date()): UpcomingOccasion[] {
  const today = now.getTime();
  const next: UpcomingOccasion[] = [];
  for (const f of FESTIVALS) {
    const d = f.dates.find((x) => new Date(x + "T00:00:00+08:00").getTime() > today);
    if (d) next.push({ key: f.key, date: d });
  }
  return next.sort((a, b) => a.date.localeCompare(b.date));
}

// ── Packages (customer-facing: Service → Package). "What's included" per price ──
export interface DemoPackage {
  id: string; serviceSlug: string; name: string; nameZh: string; tier: string; price: number; currency: string;
  includes: { en: string; zh: string }[];
  evidence: "none" | "photo" | "photo_video";
}
const FULFIL = { en: "Provider fulfilment", zh: "服务商代办" };
const PHOTO = { en: "Photo record", zh: "照片记录" };
const PHOTO_VIDEO = { en: "Photo + video record", zh: "照片 + 视频记录" };
const inc = (first: { en: string; zh: string }, ev: "photo" | "photo_video") => [first, FULFIL, ev === "photo_video" ? PHOTO_VIDEO : PHOTO];

export const DEMO_PACKAGES: DemoPackage[] = [
  // Golden Lotus (ids referenced by demo orders — keep pk-offering-basic / -premium / pk-blessing-basic).
  { id: "pk-offering-basic", serviceSlug: "temple-offering-service", name: "Basic", nameZh: "基础", tier: "basic", price: 88, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Standard offering set", zh: "标准供品套装" }, "photo") },
  { id: "pk-offering-premium", serviceSlug: "temple-offering-service", name: "Premium", nameZh: "尊享", tier: "premium", price: 188, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Larger offering set", zh: "加大供品套装" }, "photo_video") },
  { id: "pk-blessing-basic", serviceSlug: "blessing-service", name: "Standard", nameZh: "标准", tier: "standard", price: 120, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Blessing ceremony", zh: "祈福仪式" }, "photo") },
  { id: "pk-blessing-premium", serviceSlug: "blessing-service", name: "Premium", nameZh: "尊享", tier: "premium", price: 200, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Extended ceremony", zh: "加长仪式" }, "photo_video") },
  { id: "pk-ancestral-basic", serviceSlug: "ancestral-remembrance", name: "Standard", nameZh: "标准", tier: "standard", price: 168, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Remembrance service", zh: "追思服务" }, "photo_video") },
  { id: "pk-ancestral-premium", serviceSlug: "ancestral-remembrance", name: "Premium", nameZh: "尊享", tier: "premium", price: 268, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Extended remembrance", zh: "加长追思" }, "photo_video") },

  // Evergreen Grove Rites.
  { id: "pk-grave-basic", serviceSlug: "grave-tending", name: "Standard", nameZh: "标准", tier: "basic", price: 138, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Clean + offerings", zh: "清理与供品" }, "photo_video") },
  { id: "pk-grave-premium", serviceSlug: "grave-tending", name: "Premium", nameZh: "尊享", tier: "premium", price: 238, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Deep clean + full offerings", zh: "深度清理与全套供品" }, "photo_video") },
  { id: "pk-lamp-basic", serviceSlug: "lamp-lighting", name: "Standard", nameZh: "标准", tier: "basic", price: 78, currency: "MYR", evidence: "photo",
    includes: inc({ en: "One lamp, one name", zh: "一盏灯、一位名字" }, "photo") },
  { id: "pk-lamp-premium", serviceSlug: "lamp-lighting", name: "Family", nameZh: "全家", tier: "premium", price: 138, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Lamp for the whole family", zh: "全家点灯" }, "photo") },
  { id: "pk-taisui-basic", serviceSlug: "taisui-blessing", name: "Standard", nameZh: "标准", tier: "basic", price: 108, currency: "MYR", evidence: "photo",
    includes: inc({ en: "One-name registration", zh: "单人登记" }, "photo") },
  { id: "pk-taisui-premium", serviceSlug: "taisui-blessing", name: "Family", nameZh: "全家", tier: "premium", price: 178, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Whole-family registration", zh: "全家登记" }, "photo") },

  // Serene Water Merit.
  { id: "pk-vesak-basic", serviceSlug: "vesak-offering", name: "Standard", nameZh: "标准", tier: "basic", price: 158, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Vesak alms offering", zh: "卫塞供斋" }, "photo_video") },
  { id: "pk-vesak-premium", serviceSlug: "vesak-offering", name: "Premium", nameZh: "尊享", tier: "premium", price: 258, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Extended alms offering", zh: "加量供斋" }, "photo_video") },
  { id: "pk-hungry-basic", serviceSlug: "hungry-ghost-offering", name: "Standard", nameZh: "标准", tier: "basic", price: 188, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Seventh-month offering", zh: "七月供奉" }, "photo_video") },
  { id: "pk-hungry-premium", serviceSlug: "hungry-ghost-offering", name: "Premium", nameZh: "尊享", tier: "premium", price: 298, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Full seventh-month set", zh: "七月全套供奉" }, "photo_video") },
  { id: "pk-alms-basic", serviceSlug: "monk-alms", name: "Standard", nameZh: "标准", tier: "basic", price: 128, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Alms for monks", zh: "供僧" }, "photo") },
  { id: "pk-alms-premium", serviceSlug: "monk-alms", name: "Premium", nameZh: "尊享", tier: "premium", price: 208, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Extended alms", zh: "加量供僧" }, "photo") },

  // Jade Mountain Devotions.
  { id: "pk-tablet-basic", serviceSlug: "ancestor-tablet", name: "Annual", nameZh: "年度", tier: "basic", price: 148, currency: "MYR", evidence: "photo",
    includes: inc({ en: "One-year tablet care", zh: "一年牌位照料" }, "photo") },
  { id: "pk-tablet-premium", serviceSlug: "ancestor-tablet", name: "Premium", nameZh: "尊享", tier: "premium", price: 248, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Premium tablet + seasonal offerings", zh: "尊享牌位与节令供奉" }, "photo") },
  { id: "pk-birthday-basic", serviceSlug: "birthday-blessing", name: "Standard", nameZh: "标准", tier: "basic", price: 98, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Birthday devotion", zh: "寿诞祈福" }, "photo") },
  { id: "pk-birthday-premium", serviceSlug: "birthday-blessing", name: "Premium", nameZh: "尊享", tier: "premium", price: 168, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Devotion + lamp", zh: "祈福加点灯" }, "photo") },
  { id: "pk-dedication-basic", serviceSlug: "lamp-dedication", name: "Standard", nameZh: "标准", tier: "basic", price: 118, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "One-year light", zh: "一年光明灯" }, "photo_video") },
  { id: "pk-dedication-premium", serviceSlug: "lamp-dedication", name: "Family", nameZh: "全家", tier: "premium", price: 198, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Family light dedication", zh: "全家光明灯" }, "photo_video") },

  // Harmony Pavilion Care.
  { id: "pk-cnyrite-basic", serviceSlug: "cny-taisui-rite", name: "Standard", nameZh: "标准", tier: "basic", price: 168, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Tai Sui rite, one name", zh: "安太岁法事、单人" }, "photo_video") },
  { id: "pk-cnyrite-premium", serviceSlug: "cny-taisui-rite", name: "Family", nameZh: "全家", tier: "premium", price: 288, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Whole-family rite", zh: "全家法事" }, "photo_video") },
  { id: "pk-qingming-basic", serviceSlug: "qingming-cleanup", name: "Standard", nameZh: "标准", tier: "basic", price: 128, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Grave clean + offerings", zh: "扫墓与供品" }, "photo_video") },
  { id: "pk-qingming-premium", serviceSlug: "qingming-cleanup", name: "Premium", nameZh: "尊享", tier: "premium", price: 218, currency: "MYR", evidence: "photo_video",
    includes: inc({ en: "Deep clean + full offerings", zh: "深度清理与全套供品" }, "photo_video") },
  { id: "pk-ullambana-basic", serviceSlug: "hungry-ghost-rite", name: "Standard", nameZh: "标准", tier: "basic", price: 198, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Ullambana rite", zh: "盂兰盆超度" }, "photo") },
  { id: "pk-ullambana-premium", serviceSlug: "hungry-ghost-rite", name: "Premium", nameZh: "尊享", tier: "premium", price: 328, currency: "MYR", evidence: "photo",
    includes: inc({ en: "Extended rite", zh: "加长超度" }, "photo") },
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

// ── Demo orders (fixtures). Timestamps are RELATIVE to now so the demo never
// goes stale: created_at derives from createdDaysAgo, and the receipt-upload time
// (for verify deadlines) derives from uploadedHoursAgo, both computed at render. ──
export type DemoEvidence = { type: "photo" | "video"; url: string; label: { en: string; zh: string } };
export interface DemoOrder {
  id: string; order_number: string; serviceSlug: string; packageId: string; providerSlug: string;
  status: OrderStatus; amount: number; currency: string;
  createdDaysAgo: number; uploadedHoursAgo?: number; completedDaysAgo?: number;
  customer_name: string; customer_request: string; customer_location?: string; customer_phone?: string;
  evidence: DemoEvidence[];
}
export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: "ord-a", order_number: "YC-90001", serviceSlug: "temple-offering-service", packageId: "pk-offering-basic",
    providerSlug: "golden-lotus-services", status: "payment_proof_submitted", amount: 88, currency: "MYR",
    createdDaysAgo: 0, uploadedHoursAgo: 3, customer_name: "Demo Customer",
    customer_request: "Please make an offering for the health and safety of my family.",
    customer_phone: "60000000000",
    evidence: [],
  },
  {
    id: "ord-c", order_number: "YC-90003", serviceSlug: "blessing-service", packageId: "pk-blessing-basic",
    providerSlug: "golden-lotus-services", status: "payment_proof_submitted", amount: 120, currency: "MYR",
    createdDaysAgo: 2, uploadedHoursAgo: 26, customer_name: "Wei Ling",
    customer_request: "A blessing for my mother’s recovery.",
    customer_phone: "60000000000",
    evidence: [],
  },
  {
    id: "ord-b", order_number: "YC-90002", serviceSlug: "temple-offering-service", packageId: "pk-offering-premium",
    providerSlug: "golden-lotus-services", status: "completed", amount: 188, currency: "MYR",
    createdDaysAgo: 13, completedDaysAgo: 12, customer_name: "Demo Customer",
    customer_request: "Offering with photo and video, in memory of my grandfather.",
    customer_phone: "60000000000",
    evidence: [
      { type: "photo", url: "/demo/evidence-placeholder.svg", label: { en: "Offering placed", zh: "供品已摆放" } },
      { type: "photo", url: "/demo/evidence-placeholder.svg", label: { en: "At the altar", zh: "于祭坛前" } },
      { type: "video", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", label: { en: "Ceremony clip", zh: "仪式片段" } },
    ],
  },
];
export const getOrder = (id: string) => DEMO_ORDERS.find((o) => o.id === id || o.order_number === id);

/** Relative timestamps computed at call time (keeps the demo current). */
export const orderCreatedISO = (o: DemoOrder) => new Date(Date.now() - o.createdDaysAgo * 86400000).toISOString();
export const orderUploadedISO = (o: DemoOrder) => new Date(Date.now() - (o.uploadedHoursAgo ?? 0) * 3600000).toISOString();

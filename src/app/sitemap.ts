import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";

// Public, indexable pages across all production locales. Private portals excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://yuancheng.dev";
  const paths = ["", "/how-it-works", "/faq", "/about", "/terms", "/refund"];
  const entries: MetadataRoute.Sitemap = [];
  for (const loc of LOCALES) {
    for (const p of paths) {
      entries.push({ url: `${base}/${loc}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.6 });
    }
  }
  return entries;
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://yuancheng.dev";
  return {
    rules: [
      // Public marketing/customer pages are indexable; private portals are not.
      { userAgent: "*", allow: "/", disallow: ["/admin", "/provider", "/runner", "/api", "/pay", "/orders/track"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

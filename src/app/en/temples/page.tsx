"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getTemples, getPackages } from "@/lib/server-data";
import type { Temple, Package } from "@/types";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { key: "all", label: "All", keywords: [] },
  { key: "business", label: "💼 Business", keywords: ["事业", "工作", "生意", "career", "business", "work", "wealth"] },
  { key: "health", label: "💗 Health", keywords: ["健康", "身体", "疾病", "health", "healing", "body"] },
  { key: "love", label: "💕 Love", keywords: ["感情", "爱情", "恋爱", "love", "relationship", "romance"] },
  { key: "exams", label: "📖 Exams", keywords: ["学业", "考试", "读书", "exam", "study", "education"] },
  { key: "luck", label: "🍀 Luck", keywords: ["好运", "运气", "转运", "luck", "fortune", "lucky"] },
  { key: "vow", label: "🌻 Vow", keywords: ["还愿", "许愿", "还神", "vow", "wish", "fulfill"] },
];

function templeMatchesCategory(temple: Temple, category: typeof CATEGORIES[number]): boolean {
  if (category.key === "all") return true;
  const tags = [
    ...(temple.prayer_tags_zh || []),
    ...(temple.prayer_tags || []),
  ];
  const descriptions = [
    temple.short_description_zh || "",
    temple.short_description || "",
  ];
  const searchable = [
    ...tags,
    ...descriptions,
  ].map((s) => s.toLowerCase());

  return category.keywords.some((kw) =>
    searchable.some((s) => s.includes(kw.toLowerCase()))
  );
}

export default function TemplesPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: "var(--space-10) 0", textAlign: "center" }}>
        <p className="text-muted">Loading...</p>
      </div>
    }>
      <TemplesPageInner />
    </Suspense>
  );
}

function TemplesPageInner() {
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent");

  const [temples, setTemples] = useState<Temple[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [t, p] = await Promise.all([getTemples(), getPackages()]);
      setTemples(t);
      setPackages(p);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (intentParam) {
      const cat = CATEGORIES.find((c) => c.key === intentParam);
      if (cat) setActiveCategory(cat.key);
    }
  }, [intentParam]);

  const sortedTemples = useMemo(() => {
    return [...temples].sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [temples]);

  const filteredTemples = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0];
    return sortedTemples.filter((t) => templeMatchesCategory(t, cat));
  }, [sortedTemples, activeCategory]);

  const templePackageCounts = useMemo(() => {
    const map = new Map<string, number>();
    packages.forEach((pkg) => {
      if (pkg.status === "active") {
        map.set(pkg.temple_id, (map.get(pkg.temple_id) || 0) + 1);
      }
    });
    return map;
  }, [packages]);

  const templePrices = useMemo(() => {
    const map = new Map<string, number>();
    packages.forEach((pkg) => {
      if (pkg.status === "active") {
        const current = map.get(pkg.temple_id);
        if (current === undefined || pkg.selling_price < current) {
          map.set(pkg.temple_id, pkg.selling_price);
        }
      }
    });
    return map;
  }, [packages]);

  const templeIcons: Record<string, string> = {
    "Erawan Shrine": "⛩️",
    "Wat Pho": "🏛️",
    "Wat Arun": "🏯",
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "var(--space-10) 0", textAlign: "center" }}>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header" style={{ background: "var(--stone-50)" }}>
        <div className="container">
          <h1>Temples in Bangkok</h1>
          <p>Browse available temples. More coming soon.</p>
        </div>
      </div>

      <section style={{ paddingTop: "var(--space-8)" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-6)",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <div className="category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`category-pill${activeCategory === cat.key ? " active" : ""}`}
                  onClick={() => setActiveCategory(cat.key)}
                  type="button"
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <span className="text-sm text-muted">
              Showing {filteredTemples.length} of {sortedTemples.length} temples
            </span>
          </div>

          {filteredTemples.length === 0 ? (
            <div className="card text-center" style={{ padding: "var(--space-8)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-3)" }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>
                No temples found
              </h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
                Try selecting a different category.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveCategory("all")}
                type="button"
              >
                Clear Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {filteredTemples.map((temple) => {
                const pkgCount = templePackageCounts.get(temple.id) || 0;
                const fromPrice = templePrices.get(temple.id);
                const icon = templeIcons[temple.name] || "⛩️";
                const isActive = temple.status === "active";

                return (
                  <Link
                    key={temple.id}
                    href={`/en/temples/${temple.id}`}
                    className="card"
                    style={{
                      overflow: "hidden",
                      textDecoration: "none",
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    <div
                      style={{
                        height: 180,
                        background: isActive
                          ? "linear-gradient(135deg, var(--earth-100), var(--amber-100))"
                          : "var(--stone-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 56,
                        position: "relative",
                      }}
                    >
                      {icon}
                      {!isActive && (
                        <span
                          className="badge badge-orange"
                          style={{
                            position: "absolute",
                            top: "var(--space-3)",
                            right: "var(--space-3)",
                          }}
                        >
                          Soon
                        </span>
                      )}
                    </div>
                    <div className="card-body">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "var(--space-1)",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{temple.name}</div>
                        <span className="badge badge-brown">
                          {temple.verification_status === "verified" ? "Verified" : "Pending"}
                        </span>
                      </div>
                      <div className="text-sm text-muted" style={{ marginBottom: "var(--space-2)" }}>
                        📍 {temple.city}, {temple.country}
                      </div>
                      {temple.short_description && (
                        <div
                          className="text-sm"
                          style={{
                            marginBottom: "var(--space-2)",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {temple.short_description}
                        </div>
                      )}
                      {temple.prayer_tags && temple.prayer_tags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "var(--space-2)" }}>
                          {temple.prayer_tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: "var(--text-xs)",
                                padding: "2px 8px",
                                borderRadius: "var(--radius-full)",
                                background: "var(--stone-100)",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-sm text-muted" style={{ marginBottom: "var(--space-3)" }}>
                        {temple.address || "Address coming soon"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span className="text-xs text-muted">{pkgCount} packages</span>
                        {fromPrice !== undefined && (
                          <span style={{ fontWeight: 700, color: "var(--amber-700)" }}>
                            From RM{fromPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="card text-center" style={{ padding: "var(--space-8)", marginTop: "var(--space-6)" }}>
            <div style={{ fontSize: 32, marginBottom: "var(--space-3)" }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>
              Can&apos;t Find Your Temple?
            </h3>
            <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
              Tell us which temple you&apos;d like us to add.
            </p>
            <Link href="/en/temple-request" className="btn btn-primary btn-lg">
              Request a Temple
            </Link>
          </div>
        </div>
      </section>

      <div style={{ height: "var(--space-16)" }} />
    </>
  );
}

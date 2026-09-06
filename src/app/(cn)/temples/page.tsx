"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getTemples, getPackages } from "@/lib/server-data";
import type { Temple, Package } from "@/types";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { key: "all", label: "全部", keywords: [] },
  { key: "business", label: "💼 事业", keywords: ["事业", "工作", "生意", "career", "business", "work"] },
  { key: "health", label: "💗 健康", keywords: ["健康", "身体", "疾病", "health", "healing", "body"] },
  { key: "love", label: "💕 感情", keywords: ["感情", "爱情", "恋爱", "love", "relationship", "romance"] },
  { key: "exams", label: "📖 学业", keywords: ["学业", "考试", "读书", "exam", "study", "education"] },
  { key: "luck", label: "🍀 好运", keywords: ["好运", "运气", "转运", "luck", "fortune", "lucky"] },
  { key: "vow", label: "🌻 还愿", keywords: ["还愿", "许愿", "还神", "vow", "wish", "fulfill"] },
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
        <p className="text-muted">加载中...</p>
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
        <p className="text-muted">加载中...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header" style={{ background: "var(--stone-50)" }}>
        <div className="container">
          <h1>曼谷寺庙</h1>
          <p>浏览现有寺庙，更多即将推出。</p>
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
              显示 {filteredTemples.length} / {sortedTemples.length} 座寺庙
            </span>
          </div>

          {filteredTemples.length === 0 ? (
            <div className="card text-center" style={{ padding: "var(--space-8)" }}>
              <div style={{ fontSize: 32, marginBottom: "var(--space-3)" }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>
                没有找到匹配的寺庙
              </h3>
              <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
                请尝试其他分类。
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveCategory("all")}
                type="button"
              >
                清除筛选
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
                    href={`/temples/${temple.id}`}
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
                          即将推出
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
                          {temple.verification_status === "verified" ? "已认证" : "待认证"}
                        </span>
                      </div>
                      <div className="text-sm text-muted" style={{ marginBottom: "var(--space-2)" }}>
                        📍 {temple.city}, {temple.country}
                      </div>
                      {temple.short_description_zh && (
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
                          {temple.short_description_zh}
                        </div>
                      )}
                      {temple.prayer_tags_zh && temple.prayer_tags_zh.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "var(--space-2)" }}>
                          {temple.prayer_tags_zh.slice(0, 4).map((tag) => (
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
                        {temple.address || "地址即将公布"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span className="text-xs text-muted">{pkgCount} 个配套</span>
                        {fromPrice !== undefined && (
                          <span style={{ fontWeight: 700, color: "var(--amber-700)" }}>
                            RM{fromPrice} 起
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
              找不到您的寺庙？
            </h3>
            <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
              告诉我们您希望我们加入哪座寺庙。
            </p>
            <Link href="/temple-request" className="btn btn-primary btn-lg">
              申请寺庙
            </Link>
          </div>
        </div>
      </section>

      <div style={{ height: "var(--space-16)" }} />
    </>
  );
}

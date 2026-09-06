"use client";

import Link from "next/link";
import PhotoCarousel from "./PhotoCarousel";

interface PackageCardProps {
  pkg: {
    id: string;
    name: string;
    selling_price: number;
    description?: string;
    photos?: string[];
  };
  templeId: string;
  isPopular: boolean;
  href?: string;
  labels?: {
    popular?: string;
    photos?: string;
    video?: string;
    ovc?: string;
    select?: string;
    comingSoon?: string;
  };
}

const defaultLabels = {
  popular: "最受欢迎",
  photos: "📸 照片",
  video: "🎥 视频",
  ovc: "🔳 验证码",
  select: "选择配套",
  comingSoon: "产品图片即将推出",
};

export default function PackageCard({ pkg, templeId, isPopular, href, labels: customLabels }: PackageCardProps) {
  const labels = { ...defaultLabels, ...customLabels };
  const checkoutUrl = href || `/checkout?temple=${templeId}&package=${pkg.id}`;
  return (
    <div
      className="card"
      style={{
        border: isPopular
          ? "2px solid var(--amber-400)"
          : "2px solid var(--color-border)",
        padding: "var(--space-5)",
        position: "relative",
        cursor: "pointer",
      }}
      onClick={() => {
        window.location.href = checkoutUrl;
      }}
    >
      {isPopular && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--amber-600)",
            color: "white",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            padding: "2px var(--space-3)",
            borderRadius: "var(--radius-full)",
            whiteSpace: "nowrap",
          }}
        >
          {labels.popular}
        </div>
      )}
      <div
        style={{
          fontWeight: 700,
          fontSize: "var(--text-lg)",
          marginBottom: "var(--space-1)",
        }}
      >
        {pkg.name}
      </div>
      <div
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: 700,
          color: "var(--amber-700)",
          marginBottom: "var(--space-3)",
        }}
      >
        RM{pkg.selling_price}
      </div>
      {pkg.photos && pkg.photos.length > 0 ? (
        <div style={{ marginBottom: "var(--space-3)" }}>
          <PhotoCarousel photos={pkg.photos} alt={pkg.name} height={160} showThumbnails={false} />
        </div>
      ) : (
        <div
          style={{
            height: 120,
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--earth-100), var(--amber-100))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "var(--space-1)",
            marginBottom: "var(--space-3)",
          }}
        >
          <span style={{ fontSize: 28 }}>📦</span>
          <span className="text-xs text-muted">{labels.comingSoon}</span>
        </div>
      )}
      {pkg.description && (
        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.8,
            marginBottom: "var(--space-4)",
          }}
        >
          {pkg.description}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <span className="badge badge-brown">{labels.photos}</span>
        <span className="badge badge-brown">{labels.video}</span>
        <span className="badge badge-brown">{labels.ovc}</span>
      </div>
      <Link
        href={checkoutUrl}
        className={isPopular ? "btn btn-primary btn-full" : "btn btn-secondary btn-full"}
        onClick={(e) => e.stopPropagation()}
      >
        {labels.select}
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";

interface PhotoCarouselProps {
  photos: string[];
  alt?: string;
  height?: number;
  showThumbnails?: boolean;
}

export default function PhotoCarousel({
  photos,
  alt = "Photo",
  height = 400,
  showThumbnails = true,
}: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div
        style={{
          height,
          background: "linear-gradient(135deg, var(--earth-100), var(--amber-100))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-lg)",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <span style={{ fontSize: 48 }}>🖼️</span>
        <span className="text-sm text-muted">No photos yet</span>
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <img
          src={photos[0]}
          alt={alt}
          style={{ width: "100%", height, objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--stone-100)",
        }}
      >
        <img
          src={photos[current]}
          alt={`${alt} ${current + 1}`}
          style={{
            width: "100%",
            height,
            objectFit: "cover",
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrent((c) => (c === 0 ? photos.length - 1 : c - 1))}
          style={{
            position: "absolute",
            left: "var(--space-3)",
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ‹
        </button>
        <button
          onClick={() => setCurrent((c) => (c === photos.length - 1 ? 0 : c + 1))}
          style={{
            position: "absolute",
            right: "var(--space-3)",
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ›
        </button>

        {/* Counter */}
        <div
          style={{
            position: "absolute",
            bottom: "var(--space-3)",
            right: "var(--space-3)",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "2px 10px",
            borderRadius: "var(--radius-full)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
          }}
        >
          {current + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && photos.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginTop: "var(--space-3)",
            overflowX: "auto",
            paddingBottom: "var(--space-1)",
          }}
        >
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 64,
                height: 48,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                border: i === current ? "2px solid var(--amber-500)" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
                opacity: i === current ? 1 : 0.6,
                transition: "all 0.2s",
              }}
            >
              <img
                src={photo}
                alt={`Thumbnail ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

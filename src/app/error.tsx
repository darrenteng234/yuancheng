"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-8) var(--space-4)",
      textAlign: "center",
      background: "var(--color-bg, #faf9f7)",
      color: "var(--color-text-primary, #2c2416)",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ fontSize: 56, marginBottom: "var(--space-4)" }}>🙏</div>
        <h1 style={{
          fontSize: "clamp(22px, 3.5vw, 32px)",
          fontWeight: 800,
          color: "var(--amber-800, #92400e)",
          marginBottom: "var(--space-2)"
        }}>
          系统稍息，请重试 / Please Try Again
        </h1>
        <p style={{
          fontSize: "var(--text-base, 15px)",
          color: "var(--color-text-secondary, #6b5e4c)",
          marginBottom: "var(--space-6)",
          lineHeight: 1.6
        }}>
          页面加载时遇到些许阻碍，您可以尝试重新载入，或返回主殿。<br />
          We encountered an unexpected condition loading this page.
        </p>
        <div style={{
          display: "flex",
          gap: "var(--space-3)",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              background: "var(--amber-700, #b45309)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            重试 / Retry
          </button>
          <Link
            href="/"
            style={{
              padding: "10px 20px",
              background: "white",
              border: "1px solid var(--color-border, #e8dcc8)",
              color: "var(--color-text-primary, #2c2416)",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            返回首页 / Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
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
        <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }}>⛩️</div>
        <h1 style={{
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 800,
          color: "var(--amber-800, #92400e)",
          marginBottom: "var(--space-2)"
        }}>
          404 — 页面未找到 / Page Not Found
        </h1>
        <p style={{
          fontSize: "var(--text-base, 16px)",
          color: "var(--color-text-secondary, #6b5e4c)",
          marginBottom: "var(--space-6)",
          lineHeight: 1.6
        }}>
          您访问的殿堂或页面似乎不存在或已被移至其他圣所。<br />
          The temple or page you are looking for does not exist or has been moved.
        </p>
        <div style={{
          display: "flex",
          gap: "var(--space-3)",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <Link
            href="/"
            style={{
              padding: "10px 20px",
              background: "var(--amber-700, #b45309)",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            返回中文首页
          </Link>
          <Link
            href="/temples"
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
            浏览寺庙 / Browse Temples
          </Link>
          <Link
            href="/en"
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid var(--color-border, #e8dcc8)",
              color: "var(--color-text-secondary, #6b5e4c)",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "14px"
            }}
          >
            English Home
          </Link>
        </div>
      </div>
    </div>
  );
}

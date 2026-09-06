import Link from "next/link";
import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "YUANCHENG — Temple Proxy Prayer Services",
    template: "%s | YUANCHENG",
  },
  description: "Connecting believers with sacred sites. Professional temple proxy prayer services with photo and video evidence. Where sincere prayers find their home.",
  keywords: ["temple", "prayer", "proxy", "Bangkok", "Thailand", "religious service", "Buddhist", "Hindu"],
  authors: [{ name: "YUANCHENG" }],
  creator: "YUANCHENG",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yuancheng.dev/en",
    siteName: "YUANCHENG",
    title: "YUANCHENG — Temple Proxy Prayer Services",
    description: "Connecting believers with sacred sites. Professional temple proxy prayer services with photo and video evidence.",
    images: [{ url: "/josstick-hero.png", alt: "YUANCHENG" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YUANCHENG — Temple Proxy Prayer Services",
    description: "Connecting believers with sacred sites.",
    images: ["/josstick-hero.png"],
  },
  robots: { index: true, follow: true },
};

export default function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/en" className="header-logo">
            ⛩️ YUANCHENG
          </Link>
          <nav className="header-nav">
            <Link href="/en">Home</Link>
            <Link href="/en/temples">Temples</Link>
            <Link href="/en/how-it-works">How It Works</Link>
            <Link href="/en/faq">FAQ</Link>
          </nav>
          <div className="header-actions">
            <Link href="/en/my-orders" className="btn btn-secondary btn-sm">My Orders</Link>
            <Link href="/en/profile" className="btn btn-secondary btn-sm">Account</Link>
            <Link href="/en/login" className="btn btn-primary btn-sm">Log In</Link>
            <Link href="/" className="btn btn-sm" style={{
              background: "transparent",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
              marginLeft: "var(--space-2)",
            }}>中文</Link>
          </div>
        </div>
      </header>
      <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="grid grid-4" style={{ gap: "var(--space-8)", marginBottom: "var(--space-8)" }}>
            <div>
              <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--amber-400)", marginBottom: "var(--space-3)" }}>⛩️ YUANCHENG</div>
              <p style={{ color: "var(--stone-400)", lineHeight: 1.7, fontSize: "var(--text-sm)" }}>Connecting believers with sacred sites. Where sincere prayers find their home.</p>
              <p style={{ color: "var(--stone-500)", fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>We facilitate temple-related services and offerings. We do not guarantee religious or spiritual outcomes.</p>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>Platform</h4>
              <Link href="/en/my-orders" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>My Orders</Link>
              <Link href="/en/temples" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>Temples</Link>
              <Link href="/en/how-it-works" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>How It Works</Link>
              <Link href="/en/faq" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>FAQ</Link>
              <Link href="/en/temple-request" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>Request Temple</Link>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>Support</h4>
              <Link href="/en/about" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>About Us</Link>
              <Link href="/en/temple-request" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>Contact Us</Link>
              <Link href="/en/refund" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>Refund Policy</Link>
              <Link href="/en/terms" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>Terms of Service</Link>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>语言 Language</h4>
              <Link href="/" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>中文</Link>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--stone-800)", paddingTop: "var(--space-4)", textAlign: "center", color: "var(--stone-500)", fontSize: "var(--text-xs)" }}>© 2026 YUANCHENG. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}

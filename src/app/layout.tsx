import "./globals.css";
import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";

// Headings only. Body keeps the system stack.
const serif = Noto_Serif_SC({ weight: "600", subsets: ["latin"], display: "swap", variable: "--font-serif", preload: false });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yuancheng — Discover and fulfil trusted religious services",
    template: "%s | Yuancheng",
  },
  description:
    "Yuancheng connects you with verified providers offering religious services and products across places and communities — with clear expectations and completion records.",
  openGraph: {
    type: "website",
    siteName: "Yuancheng",
    title: "Yuancheng",
    description:
      "Discover verified providers, services and products connected to places and communities.",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: "Yuancheng" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={serif.variable}>
      <body>{children}</body>
    </html>
  );
}

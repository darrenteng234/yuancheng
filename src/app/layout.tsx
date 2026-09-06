import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://yuancheng.dev"),
  title: {
    default: "愿成 YUANCHENG — 代拜服务 · 寺庙祈福 · 诚心托付",
    template: "%s | 愿成 YUANCHENG",
  },
  description: "连接信众与圣地的桥梁。愿成提供专业的寺庙代拜服务，每份订单附有照片与视频证明。让每一份诚愿，都能找到归处。",
  keywords: ["寺庙", "代拜", "祈福", "曼谷", "泰国", "宗教服务", "temple", "prayer", "Bangkok", "Thailand"],
  authors: [{ name: "YUANCHENG" }],
  creator: "YUANCHENG",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://yuancheng.dev",
    siteName: "愿成 YUANCHENG",
    title: "愿成 YUANCHENG — 代拜服务 · 寺庙祈福",
    description: "连接信众与圣地的桥梁。专业寺庙代拜服务，每份订单附有照片与视频证明。",
    images: [
      {
        url: "/josstick-hero.png",
        alt: "愿成 YUANCHENG — 代拜服务",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "愿成 YUANCHENG — 代拜服务 · 寺庙祈福",
    description: "连接信众与圣地的桥梁。专业寺庙代拜服务，每份订单附有照片与视频证明。",
    images: ["/josstick-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

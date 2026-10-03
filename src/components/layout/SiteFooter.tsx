import Link from "next/link";
import { getDictionary, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale } from "@/types/platform";
import { Logo } from "@/components/brand/Logo";

/** Shared customer footer. Server component; locale-aware. Fully translated. */
export function SiteFooter({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const zh = locale === "zh";
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid grid-4" style={{ gap: "var(--space-8)", marginBottom: "var(--space-8)" }}>
          {/* col 1 — seal + tagline */}
          <div>
            <div style={{ marginBottom: "var(--space-3)" }}><Logo light /></div>
            <p style={{ color: "var(--footer-text)", lineHeight: 1.7, fontSize: "var(--text-sm)" }}>{t.common.tagline}</p>
          </div>

          {/* col 2 — About */}
          <div>
            <h4 className="footer-col-head">{zh ? "了解愿成" : "About"}</h4>
            <Link href={`/${locale}/how-it-works`} className="footer-link">{zh ? "运作方式" : "How it works"}</Link>
            <Link href={`/${locale}/faq`} className="footer-link">{zh ? "常见问题" : "FAQ"}</Link>
            <Link href={`/${locale}/about`} className="footer-link">{zh ? "关于愿成" : "About Yuancheng"}</Link>
          </div>

          {/* col 3 — Help */}
          <div>
            <h4 className="footer-col-head">{zh ? "帮助" : "Help"}</h4>
            <Link href={`/${locale}/orders`} className="footer-link">{zh ? "我的委托" : "My orders"}</Link>
            <Link href={`/${locale}/refund`} className="footer-link">{zh ? "退款政策" : "Refund policy"}</Link>
            <Link href={`/${locale}/terms`} className="footer-link">{zh ? "服务条款" : "Terms of service"}</Link>
          </div>

          {/* col 4 — For providers */}
          <div>
            <h4 className="footer-col-head">{zh ? "服务商" : "For providers"}</h4>
            <Link href="/provider" className="footer-link">{zh ? "服务商入口" : "Provider portal"}</Link>
            <Link href="/provider/apply" className="footer-link">{zh ? "成为服务商" : "Become a provider"}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          {zh
            ? "© 2026 愿成 Yuancheng。我们协助联系寺庙相关服务，不保证任何宗教或灵性结果。"
            : "© 2026 Yuancheng. We connect you with temple-related services. We do not guarantee religious or spiritual outcomes."}
        </div>
      </div>
    </footer>
  );
}

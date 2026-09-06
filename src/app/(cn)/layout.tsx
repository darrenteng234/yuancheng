import Link from "next/link";
import "../globals.css";

export default function CnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="header-logo">
            ⛩️ 愿成
          </Link>
          <nav className="header-nav">
            <Link href="/">首页</Link>
            <Link href="/temples">寺庙</Link>
            <Link href="/how-it-works">服务流程</Link>
            <Link href="/faq">常见问题</Link>
          </nav>
          <div className="header-actions">
            <Link href="/my-orders" className="btn btn-secondary btn-sm">我的订单</Link>
            <Link href="/profile" className="btn btn-secondary btn-sm">账户</Link>
            <Link href="/login" className="btn btn-primary btn-sm">登录</Link>
            <Link href="/en" className="btn btn-sm" style={{
              background: "transparent",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
              marginLeft: "var(--space-2)",
            }}>EN</Link>
          </div>
        </div>
      </header>
      <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="grid grid-4" style={{ gap: "var(--space-8)", marginBottom: "var(--space-8)" }}>
            <div>
              <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--amber-400)", marginBottom: "var(--space-3)" }}>⛩️ 愿成</div>
              <p style={{ color: "var(--stone-400)", lineHeight: 1.7, fontSize: "var(--text-sm)" }}>连接信众与圣地的桥梁。让每一份诚愿，都能找到归处。</p>
              <p style={{ color: "var(--stone-500)", fontSize: "var(--text-xs)", marginTop: "var(--space-3)" }}>我们协助您完成寺庙相关的事务，但不保证任何宗教或灵性结果。</p>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>平台</h4>
              <Link href="/my-orders" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>我的订单</Link>
              <Link href="/temples" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>寺庙</Link>
              <Link href="/how-it-works" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>服务流程</Link>
              <Link href="/faq" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>常见问题</Link>
              <Link href="/temple-request" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>申请寺庙</Link>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>联系</h4>
              <Link href="/about" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>关于我们</Link>
              <Link href="/refund" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>退款政策</Link>
              <Link href="/terms" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>服务条款</Link>
            </div>
            <div>
              <h4 style={{ color: "white", fontWeight: 600, marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>语言 Language</h4>
              <Link href="/en" style={{ display: "block", color: "var(--stone-400)", fontSize: "var(--text-sm)", padding: "2px 0" }}>English</Link>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--stone-800)", paddingTop: "var(--space-4)", textAlign: "center", color: "var(--stone-500)", fontSize: "var(--text-xs)" }}>© 2026 愿成 YUANCHENG. 保留所有权利。</div>
        </div>
      </footer>
    </>
  );
}

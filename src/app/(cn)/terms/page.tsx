import Link from "next/link";

export default function TermsPage() {
  return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>服务条款</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-8)" }}>最后更新：2026年6月</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>1. 服务说明</h2>
              <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                愿成（YUANCHENG）是一个连接信众与寺庙的平台。我们提供代拜服务，包括前往寺庙进行祈福、献供、诵经等宗教仪式。
                我们的执行人（Runner）会在指定的寺庙代表您完成相关仪式，并提供照片和视频作为凭证。
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>2. 服务范围</h2>
              <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                我们的服务包括但不限于：寺庙祈福、献花供香、诵读经文、还愿仪式等。具体服务内容以各寺庙页面列出的配套为准。
                我们不保证任何宗教或灵性结果，服务仅限于协助您完成寺庙相关的物理仪式。
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>3. 订单与付款</h2>
              <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                下单即表示您同意我们的服务条款。付款通过 Stripe 安全处理。资金将保留至订单完成并验证。
                如您对服务不满意，可在收到凭证后48小时内提出争议。
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>4. 退款政策</h2>
              <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                如执行人未按约定完成仪式，或凭证质量严重不符合标准，我们将全额退款。
                如您对服务结果不满意但不属于上述情况，我们将根据具体情况部分退款。
                退款将在审核通过后5-7个工作日内原路返回。
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>5. 责任限制</h2>
              <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
               我们不对因不可抗力、寺庙临时关闭、宗教政策变化等原因导致的服务延误或失败承担责任。
               我们的责任上限为订单金额。
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>6. 隐私保护</h2>
              <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                我们仅收集提供服务所必需的信息（姓名、联系方式、特殊说明）。
                您的个人信息不会被出售或分享给第三方合作伙伴。
                凭证照片仅用于向您证明仪式已完成。
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
          <Link href="/" className="btn btn-secondary">← 返回首页</Link>
        </div>
      </div>
    </section>
  );
}

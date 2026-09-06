import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <>
      <div className="page-header" style={{ background: "var(--stone-50)" }}>
        <div className="container">
          <h1>服务流程</h1>
          <p>了解愿成如何帮助您完成祈愿</p>
        </div>
      </div>
      <section style={{ padding: "var(--space-8) 0" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--amber-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "var(--text-lg)", flexShrink: 0 }}>1</div>
                <h3 style={{ fontWeight: 700 }}>选择寺庙与配套</h3>
              </div>
              <p className="text-muted" style={{ lineHeight: 1.7, marginLeft: 60 }}>
                浏览我们合作的寺庙，选择符合您心愿的配套。每个配套包含不同的供品组合和凭证类型。
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--amber-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "var(--text-lg)", flexShrink: 0 }}>2</div>
                <h3 style={{ fontWeight: 700 }}>填写资料并付款</h3>
              </div>
              <p className="text-muted" style={{ lineHeight: 1.7, marginLeft: 60 }}>
                填写您的联系资料，如有特殊祈愿可在备注中说明。付款安全处理，资金将保留至订单完成。
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--amber-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "var(--text-lg)", flexShrink: 0 }}>3</div>
                <h3 style={{ fontWeight: 700 }}>执行人前往寺庙</h3>
              </div>
              <p className="text-muted" style={{ lineHeight: 1.7, marginLeft: 60 }}>
                我们的认证执行人当天前往寺庙，按照传统礼仪完成全部供奉与祈愿仪式。
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--amber-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "var(--text-lg)", flexShrink: 0 }}>4</div>
                <h3 style={{ fontWeight: 700 }}>接收凭证</h3>
              </div>
              <p className="text-muted" style={{ lineHeight: 1.7, marginLeft: 60 }}>
                收到照片、视频（如适用）及寺庙收据等凭证。所有凭证发送至您的邮箱并保存在账户中。
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link href="/temples" className="btn btn-primary btn-lg">浏览寺庙</Link>
          </div>
        </div>
      </section>
      <div style={{ height: "var(--space-10)" }} />
    </>
  );
}

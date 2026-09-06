import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <div className="page-header" style={{ background: "var(--stone-50)" }}>
        <div className="container">
          <h1>关于我们</h1>
          <p>愿有所托，善有所归</p>
        </div>
      </div>
      <section style={{ padding: "var(--space-10) 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>我们是谁</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  愿成（YUANCHENG）是一个连接信众与寺庙的代拜服务平台。我们理解，并非每个人都有机会亲自前往寺庙祈福——或因距离遥远，或因身体不便，或因时间有限。因此，我们搭建了一座桥梁，让每一份诚心都能抵达佛前。
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>为何存在</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  信仰不应被距离所限。无论您身在世界的哪个角落，只要心中有礼佛之念，就能通过愿成将您的诚愿托付给专业的执行人。他们将在泰国各大寺庙中，以恭敬之心代为完成祈福、供香、诵经等仪式。
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>如何运作</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)", marginBottom: "var(--space-3)" }}>
                  只需三步，即可完成您的心愿：
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--amber-100)",
                      color: "var(--amber-800)",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      flexShrink: 0,
                    }}>1</span>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>选择寺庙与配套</strong> — 浏览我们的寺庙列表，选择您心仪的寺庙和祈福配套。
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--amber-100)",
                      color: "var(--amber-800)",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      flexShrink: 0,
                    }}>2</span>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>执行人代为祈福</strong> — 我们的专业执行人前往寺庙，按照您的意愿完成仪式。
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--amber-100)",
                      color: "var(--amber-800)",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      flexShrink: 0,
                    }}>3</span>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>凭证送达</strong> — 您将收到照片和视频凭证，确认仪式已圆满完成。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>我们的价值观</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "var(--space-1)", fontSize: "var(--text-base)" }}>🙏 尊重</h3>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      我们以最高的恭敬心对待每一份托付。每一次仪式都按照传统礼仪认真执行，绝不敷衍。
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "var(--space-1)", fontSize: "var(--text-base)" }}>🔍 透明</h3>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      从下单到完成，每一步都可追踪。我们提供真实的照片和视频凭证，让您安心。
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "var(--space-1)", fontSize: "var(--text-base)" }}>⚖️ 不夸大</h3>
                    <p style={{ lineHeight: 1.7, color: "var(--color-text-secondary)", margin: 0 }}>
                      我们只做力所能及之事。不承诺灵验，不夸大效果。信仰的结果，取决于每个人的因缘。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
            <p className="text-muted" style={{ marginBottom: "var(--space-3)" }}>
              让每一份诚愿，都能找到归处。
            </p>
            <Link href="/temples" className="btn btn-primary">浏览寺庙</Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";

export default function RefundPage() {
  return (
    <>
      <div className="page-header" style={{ background: "var(--stone-50)" }}>
        <div className="container">
          <h1>退款政策</h1>
          <p>公平、透明、清晰</p>
        </div>
      </div>
      <section style={{ padding: "var(--space-10) 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>退款窗口</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  订单在<strong>服务尚未开始</strong>前，您可以在下单后7个自然日内申请全额退款。超过7天但服务仍未开始的订单，我们将根据具体情况酌情处理。
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>服务完成后</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  一旦执行人已完成仪式并交付凭证，订单即视为已完成。已完成的服务<strong>不可退款</strong>。我们理解每位信众的期望，因此建议您在下单前仔细确认配套内容。
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>争议处理</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  如果您对服务质量有异议（如凭证与订单不符、仪式未按约定执行等），请在收到凭证后48小时内联系我们。我们的团队将在<strong>3个工作日内</strong>完成审核并给出处理方案。
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>退款方式</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  退款将按<strong>原支付方式</strong>退回。银行转账退款通常需要5-7个工作日到账，具体到账时间取决于您的银行处理速度。Stripe 信用卡退款可能需要额外1-3个工作日。
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-3)" }}>联系我们</h2>
                <p style={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
                  如需申请退款或提出争议，请通过寺庙申请页面联系我们。我们承诺以公平、尊重的态度处理每一位信众的诉求。
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
            <Link href="/" className="btn btn-secondary">← 返回首页</Link>
          </div>
        </div>
      </section>
    </>
  );
}

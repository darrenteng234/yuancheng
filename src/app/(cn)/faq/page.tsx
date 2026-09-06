import Link from "next/link";

export default function FaqPage() {
  return (
    <>
      <div className="page-header" style={{ background: "var(--stone-50)" }}>
        <div className="container">
          <h1>常见问题</h1>
          <p>关于愿成代拜服务的常见问题解答</p>
        </div>
      </div>
      <section style={{ padding: "var(--space-8) 0" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>你们的代拜服务合法吗？</h3>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                是的。我们与泰国当地合法的执行人合作，按照传统礼仪在寺庙进行祈愿和供奉。我们不提供任何宗教或灵性结果的保证。
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>如何确认仪式真的进行了？</h3>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                每份订单都包含在寺庙拍摄的清晰照片。高级配套还包含视频记录。您还会收到寺庙出具的所有供品的实际收据。
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>可以附上个人祈愿吗？</h3>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                可以。在结账时，您可以添加特殊说明，写下您的个人祈愿或心愿。我们的执行人会在仪式中代为诵读。
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>如果以后需要还愿怎么办？</h3>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                您可以随时再次下单。许多客户会回来还愿。您的订单历史记录会保存在您的账户中。
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>需要多长时间？</h3>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                大多数订单在24小时内完成。凭证会通过电子邮件发送给您，也可以在您的账户中查看。
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>你们保证灵验吗？</h3>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                不。我们不提供任何宗教或灵性结果的保证。我们的角色是协助您完成寺庙相关的供奉和祈愿事务，以尊重传统的方式进行。信仰的结果取决于个人因缘。
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-muted" style={{ marginBottom: "var(--space-3)" }}>还有其他问题？</p>
            <Link href="/about" className="btn btn-primary">联系我们</Link>
          </div>
        </div>
      </section>
      <div style={{ height: "var(--space-10)" }} />
    </>
  );
}

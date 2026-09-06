import { getOrder } from "@/lib/server-data";
import Link from "next/link";

function statusBadge(status: string): string {
  switch (status) {
    case "completed": return "badge-green";
    case "in_progress": return "badge-orange";
    case "in_review": return "badge-brown";
    case "disputed": return "badge-red";
    default: return "badge-gray";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "completed": return "已完成";
    case "in_progress": return "进行中";
    case "in_review": return "审核中";
    case "disputed": return "争议中";
    case "paid": return "已支付";
    case "unassigned": return "待分配";
    default: return status;
  }
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : null;

  return (
    <section style={{ padding: "var(--space-10) 0" }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--sage-500), var(--sage-600))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto var(--space-5)", fontSize: 36, color: "white",
          }}>✓</div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>订单已确认</h1>
          <p className="text-muted">感谢您的信任。我们的执行人将尽快前往寺庙完成您的祈愿。</p>
        </div>

        {order ? (
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <div>
                  <span className="text-sm text-muted">订单编号</span>
                  <div style={{ fontWeight: 700, color: "var(--amber-700)", fontSize: "var(--text-lg)", fontFamily: "monospace" }}>
                    #{order.order_number?.slice(0, 8).toUpperCase() || order.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
                <span className={`badge ${statusBadge(order.status)}`}>{statusLabel(order.status)}</span>
              </div>
              <div className="divider" />
              <div style={{ display: "grid", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="text-muted">寺庙</span>
                  <span style={{ fontWeight: 600 }}>{order.temple?.name || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="text-muted">套餐</span>
                  <span style={{ fontWeight: 600 }}>{order.package?.name || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="text-muted">金额</span>
                  <span style={{ fontWeight: 700, color: "var(--amber-700)" }}>RM{order.selling_price.toFixed(2)}</span>
                </div>
              </div>
              <div className="divider" />
              <div className="timeline" style={{ marginTop: "var(--space-4)" }}>
                <div className="timeline-item completed">
                  <div className="timeline-dot">✓</div>
                  <div className="timeline-title">订单已提交</div>
                  <div className="timeline-date">刚刚</div>
                </div>
                <div className="timeline-item active">
                  <div className="timeline-dot">●</div>
                  <div className="timeline-title">匹配执行人</div>
                  <div className="timeline-date">通常在1小时内</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">仪式进行中</div>
                  <div className="timeline-date">执行人正在准备您的服务</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">凭证已提交</div>
                  <div className="timeline-date">照片和视频凭证发送给您</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">订单完成 🎉</div>
                  <div className="timeline-date">您的服务已完成</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-dot">✓</div>
                  <div className="timeline-title">订单已提交</div>
                  <div className="timeline-date">刚刚</div>
                </div>
                <div className="timeline-item active">
                  <div className="timeline-dot">●</div>
                  <div className="timeline-title">匹配执行人</div>
                  <div className="timeline-date">通常在1小时内</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">仪式进行中</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">凭证已提交</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">订单完成 🎉</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="alert alert-info" style={{ marginBottom: "var(--space-6)" }}>
          <span>📧</span>
          <div>
            <strong>订单追踪</strong> — 您可以随时查看订单进度。
            {order && (
              <><br /><Link href={`/orders/${order.id}`} style={{ color: "var(--amber-700)", fontWeight: 600 }}>点击查看订单详情 →</Link></>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-3)" }}>
          <Link href="/" className="btn btn-secondary btn-full">返回首页</Link>
          <Link href="/my-orders" className="btn btn-primary btn-full">我的订单</Link>
        </div>
      </div>
      <div style={{ height: "var(--space-10)" }} />
    </section>
  );
}

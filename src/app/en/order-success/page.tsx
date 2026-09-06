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
    case "completed": return "Completed";
    case "in_progress": return "In Progress";
    case "in_review": return "Under Review";
    case "disputed": return "Disputed";
    case "paid": return "Paid";
    case "unassigned": return "Unassigned";
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
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Order Confirmed</h1>
          <p className="text-muted">Thank you for your trust. Our runner will fulfill your prayer soon.</p>
        </div>

        {order ? (
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <div>
                  <span className="text-sm text-muted">Order Number</span>
                  <div style={{ fontWeight: 700, color: "var(--amber-700)", fontSize: "var(--text-lg)", fontFamily: "monospace" }}>
                    #{order.order_number?.slice(0, 8).toUpperCase() || order.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
                <span className={`badge ${statusBadge(order.status)}`}>{statusLabel(order.status)}</span>
              </div>
              <div className="divider" />
              <div style={{ display: "grid", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="text-muted">Temple</span>
                  <span style={{ fontWeight: 600 }}>{order.temple?.name || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="text-muted">Package</span>
                  <span style={{ fontWeight: 600 }}>{order.package?.name || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="text-muted">Total</span>
                  <span style={{ fontWeight: 700, color: "var(--amber-700)" }}>RM{order.selling_price.toFixed(2)}</span>
                </div>
              </div>
              <div className="divider" />
              <div className="timeline" style={{ marginTop: "var(--space-4)" }}>
                <div className="timeline-item completed">
                  <div className="timeline-dot">✓</div>
                  <div className="timeline-title">Order Placed</div>
                  <div className="timeline-date">Just now</div>
                </div>
                <div className="timeline-item active">
                  <div className="timeline-dot">●</div>
                  <div className="timeline-title">Runner Assigned</div>
                  <div className="timeline-date">Usually within 1 hour</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">Ritual in Progress</div>
                  <div className="timeline-date">Runner is preparing your service</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">Evidence Submitted</div>
                  <div className="timeline-date">Photos and video sent to you</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">Order Complete 🎉</div>
                  <div className="timeline-date">Your service is fulfilled</div>
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
                  <div className="timeline-title">Order Placed</div>
                  <div className="timeline-date">Just now</div>
                </div>
                <div className="timeline-item active">
                  <div className="timeline-dot">●</div>
                  <div className="timeline-title">Runner Assigned</div>
                  <div className="timeline-date">Usually within 1 hour</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">Ritual in Progress</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">Evidence Submitted</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-title">Order Complete 🎉</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="alert alert-info" style={{ marginBottom: "var(--space-6)" }}>
          <span>📧</span>
          <div>
            <strong>Track Your Order</strong> — You can check the progress anytime.
            {order && (
              <><br /><Link href={`/en/orders/${order.id}`} style={{ color: "var(--amber-700)", fontWeight: 600 }}>View order details →</Link></>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-3)" }}>
          <Link href="/en" className="btn btn-secondary btn-full">Back to Home</Link>
          <Link href="/en/my-orders" className="btn btn-primary btn-full">My Orders</Link>
        </div>
      </div>
      <div style={{ height: "var(--space-10)" }} />
    </section>
  );
}

/**
 * Email utility for YUANCHENG
 *
 * Uses Resend if RESEND_API_KEY is set, otherwise logs to console.
 * Run: pnpm add resend
 */

let resendClient: { emails: { send: (p: { from: string; to: string; subject: string; html: string }) => Promise<{ id?: string }> } } | null = null;

function getClient() {
  if (resendClient) return resendClient;
  if (typeof process !== "undefined" && process.env.RESEND_API_KEY) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ResendLib = require("resend") as { Resend: new (key: string) => typeof resendClient };
      resendClient = new ResendLib.Resend(process.env.RESEND_API_KEY);
      return resendClient;
    } catch {
      console.warn("[email] RESEND_API_KEY set but resend package not installed. Run: pnpm add resend");
      return null;
    }
  }
  return null;
}

const FROM = process.env.EMAIL_FROM || "YUANCHENG <noreply@yuancheng.dev>";

// ── HTML Template ──
function wrapHTML(title: string, bodyHTML: string, lang: "cn" | "en") {
  const tagline = lang === "cn" ? "传承信仰" : "Devotion Delivered";
  const footer = lang === "cn"
    ? "我们协助您完成寺庙相关事务，但不保证任何宗教或灵性结果。"
    : "We facilitate temple-related services. We do not guarantee religious or spiritual outcomes.";
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#faf9f7;font-family:'Helvetica Neue',Arial,sans-serif;color:#2c2416;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
<tr><td style="padding:32px 24px;text-align:center;">
<div style="font-size:24px;font-weight:700;letter-spacing:4px;color:#b45309;margin-bottom:8px;">YUANCHENG</div>
<div style="font-size:11px;letter-spacing:2px;color:#92702a;text-transform:uppercase;">${tagline}</div>
<hr style="border:none;border-top:1px solid #e8dcc8;margin:24px 0;" />
<h1 style="font-size:20px;font-weight:600;color:#3b2f1b;margin:0 0 16px;">${title}</h1>
<div style="font-size:15px;line-height:1.7;color:#3b2f1b;text-align:left;">${bodyHTML}</div>
<hr style="border:none;border-top:1px solid #e8dcc8;margin:24px 0;" />
<p style="font-size:12px;color:#92702a;line-height:1.6;">${footer}</p>
<p style="font-size:11px;color:#b8a88a;margin-top:8px;">© ${new Date().getFullYear()} YUANCHENG. All rights reserved.</p>
</td></tr></table></body></html>`;
}

// ── Send helpers ──
async function sendMail(to: string, subject: string, html: string) {
  const client = getClient();
  if (client) {
    void client.emails.send({ from: FROM, to, subject, html })
      .then(() => console.log(`[email] Sent to ${to}: ${subject}`))
      .catch((err: Error) => console.error(`[email] Failed:`, err));
  } else {
    console.log(`[email:dev] To: ${to} | Subject: ${subject}`);
  }
}

// ── Runner Assignment Email ──
export async function sendRunnerAssignmentEmail(p: {
  to: string; orderNumber: string; templeName: string; packageName: string;
  customerName: string; specialInstructions: string; orderId: string; lang?: "cn" | "en";
}) {
  const lang = p.lang || "en";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
  const subject = lang === "cn"
    ? `新任务分配 — 订单 ${p.orderNumber}`
    : `New Assignment — Order ${p.orderNumber}`;
  const title = lang === "cn" ? "新任务已分配" : "New Task Assigned";
  const body = lang === "cn"
    ? `<p>您有一个新的执行任务。以下是详细信息：</p>
      <table style="width:100%;background:#fff;border-radius:8px;border:1px solid #e8dcc8;margin:16px 0;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>订单编号</strong></td><td style="padding:12px 16px;">${p.orderNumber}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>寺庙</strong></td><td style="padding:12px 16px;">${p.templeName}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>配套</strong></td><td style="padding:12px 16px;">${p.packageName}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>客户</strong></td><td style="padding:12px 16px;">${p.customerName}</td></tr>
      <tr><td style="padding:12px 16px;"><strong>特别指示</strong></td><td style="padding:12px 16px;">${p.specialInstructions || "无 / None"}</td></tr>
      </table>
      <p>请在接单后尽快前往寺庙完成祈愿服务。完成后请上传凭证照片和视频。</p>
      <p><a href="${siteUrl}/runner/orders/${p.orderId}" style="display:inline-block;background:#b8860b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">查看任务详情</a></p>`
    : `<p>You have a new assignment. Here are the details:</p>
      <table style="width:100%;background:#fff;border-radius:8px;border:1px solid #e8dcc8;margin:16px 0;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Order #</strong></td><td style="padding:12px 16px;">${p.orderNumber}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Temple</strong></td><td style="padding:12px 16px;">${p.templeName}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Package</strong></td><td style="padding:12px 16px;">${p.packageName}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Customer</strong></td><td style="padding:12px 16px;">${p.customerName}</td></tr>
      <tr><td style="padding:12px 16px;"><strong>Special Instructions</strong></td><td style="padding:12px 16px;">${p.specialInstructions || "None"}</td></tr>
      </table>
      <p>Please visit the temple promptly to fulfill the prayer service. Remember to upload photos and video upon completion.</p>
      <p><a href="${siteUrl}/runner/orders/${p.orderId}" style="display:inline-block;background:#b8860b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Assignment</a></p>`;
  await sendMail(p.to, subject, wrapHTML(title, body, lang));
}

// ── Public API ──
export async function sendOrderConfirmation(p: {
  to: string; orderNumber: string; templeName: string; packageName: string; amount: number; orderId: string; lang?: "cn" | "en";
}) {
  const lang = p.lang || "en";
  const subject = lang === "cn" ? `订单确认 — ${p.orderNumber}` : `Order Confirmation — ${p.orderNumber}`;
  const title = lang === "cn" ? "订单已确认" : "Order Confirmed";
  const body = lang === "cn"
    ? `<p>感谢您的信任。我们已收到您的订单，正在为您安排执行人。</p>
      <table style="width:100%;background:#fff;border-radius:8px;border:1px solid #e8dcc8;margin:16px 0;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>订单编号</strong></td><td style="padding:12px 16px;">${p.orderNumber}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>寺庙</strong></td><td style="padding:12px 16px;">${p.templeName}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>配套</strong></td><td style="padding:12px 16px;">${p.packageName}</td></tr>
      <tr><td style="padding:12px 16px;"><strong>金额</strong></td><td style="padding:12px 16px;color:#b8860b;font-weight:700;">RM${p.amount.toFixed(2)}</td></tr>
      </table>
      <p>执行人将尽快前往寺庙完成您的祈愿。完成后我们会发送凭证照片和视频给您。</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"}/orders/${p.orderId}" style="display:inline-block;background:#b8860b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">查看订单状态</a></p>`
    : `<p>Thank you for your trust. We've received your order and are assigning a runner.</p>
      <table style="width:100%;background:#fff;border-radius:8px;border:1px solid #e8dcc8;margin:16px 0;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Order #</strong></td><td style="padding:12px 16px;">${p.orderNumber}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Temple</strong></td><td style="padding:12px 16px;">${p.templeName}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Package</strong></td><td style="padding:12px 16px;">${p.packageName}</td></tr>
      <tr><td style="padding:12px 16px;"><strong>Amount</strong></td><td style="padding:12px 16px;color:#b8860b;font-weight:700;">RM${p.amount.toFixed(2)}</td></tr>
      </table>
      <p>Your runner will fulfill your prayer soon. We'll send photos and video upon completion.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"}/en/orders/${p.orderId}" style="display:inline-block;background:#b8860b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Track Order</a></p>`;
  await sendMail(p.to, subject, wrapHTML(title, body, lang));
}

export async function sendOrderStatusUpdate(p: {
  to: string; orderNumber: string; status: string; templeName: string; lang?: "cn" | "en";
}) {
  const lang = p.lang || "en";
  const labels: Record<string, Record<string, string>> = {
    cn: { paid: "已支付", unassigned: "待分配", in_progress: "进行中", in_review: "审核中", completed: "已完成", disputed: "争议中", refunded: "已退款" },
    en: { paid: "Paid", unassigned: "Unassigned", in_progress: "In Progress", in_review: "Under Review", completed: "Completed", disputed: "Disputed", refunded: "Refunded" },
  };
  const label = labels[lang]?.[p.status] || p.status;
  const subject = lang === "cn" ? `订单状态更新 — ${p.orderNumber} — ${label}` : `Order Update — ${p.orderNumber} — ${label}`;
  const title = lang === "cn" ? "订单状态已更新" : "Order Status Updated";
  const body = lang === "cn"
    ? `<p>您的订单 <strong>${p.orderNumber}</strong>（${p.templeName}）状态已更新为：</p>
      <div style="text-align:center;padding:24px;background:#fff8ee;border-radius:8px;margin:16px 0;">
      <div style="font-size:24px;font-weight:700;color:#b8860b;">${label}</div>
      </div>
      <p>如有任何问题，请随时联系我们。</p>`
    : `<p>Your order <strong>${p.orderNumber}</strong> (${p.templeName}) status has been updated to:</p>
      <div style="text-align:center;padding:24px;background:#fff8ee;border-radius:8px;margin:16px 0;">
      <div style="font-size:24px;font-weight:700;color:#b8860b;">${label}</div>
      </div>
      <p>If you have any questions, please contact us.</p>`;
  await sendMail(p.to, subject, wrapHTML(title, body, lang));
}

export async function sendDisputeNotification(p: {
  to: string; orderNumber: string; reason: string; lang?: "cn" | "en";
}) {
  const lang = p.lang || "en";
  const subject = lang === "cn" ? `争议已提交 — ${p.orderNumber}` : `Dispute Filed — ${p.orderNumber}`;
  const title = lang === "cn" ? "争议已提交" : "Dispute Filed";
  const body = lang === "cn"
    ? `<p>我们已收到您对订单 <strong>${p.orderNumber}</strong> 的争议申请。</p>
      <p><strong>原因：</strong>${p.reason}</p>
      <p>我们的团队将在24小时内审核并联系您。感谢您的耐心。</p>`
    : `<p>We've received your dispute for order <strong>${p.orderNumber}</strong>.</p>
      <p><strong>Reason:</strong> ${p.reason}</p>
      <p>Our team will review and respond within 24 hours. Thank you for your patience.</p>`;
  await sendMail(p.to, subject, wrapHTML(title, body, lang));
}

export async function sendRunnerApprovalEmail(p: {
  to: string; runnerName: string; lang?: "cn" | "en";
}) {
  const lang = p.lang || "en";
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002"}/runner/dashboard`;
  const subject = lang === "cn"
    ? `欢迎加入 YUANCHENG — 您的跑腿申请已通过！`
    : `Welcome to YUANCHENG — Your Runner Application is Approved!`;
  const title = lang === "cn" ? "恭喜您成为 YUANCHENG 跑腿员！" : "Congratulations, Runner!";
  const body = lang === "cn"
    ? `<p>亲爱的 <strong>${p.runnerName}</strong>，</p>
      <p>我们很高兴地通知您，您的跑腿员申请已通过审核！您已正式加入 YUANCHENG 的跑腿团队。</p>
      <p>作为新入职的跑腿员，您将从 <strong>Bronze 级别</strong> 开始。完成前 5 单且质量评分达到 4.0 以上，即可晋升至 Silver 级别，享受更高的订单优先级和更好的收益。</p>
      <table style="width:100%;background:#fff;border-radius:8px;border:1px solid #e8dcc8;margin:16px 0;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>当前级别</strong></td><td style="padding:12px 16px;">🥉 Bronze</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>状态</strong></td><td style="padding:12px 16px;color:#2d7a3a;font-weight:700;">● 已激活</td></tr>
      <tr><td style="padding:12px 16px;"><strong>下一步</strong></td><td style="padding:12px 16px;">登录跑腿员平台，查看您的首个订单任务</td></tr>
      </table>
      <p>如有任何问题，请随时联系我们的团队。</p>
      <p><a href="${dashboardUrl}" style="display:inline-block;background:#b8860b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">进入跑腿员平台</a></p>
      <p style="margin-top:16px;">祝您工作顺利！<br/>YUANCHENG 团队</p>`
    : `<p>Dear <strong>${p.runnerName}</strong>,</p>
      <p>We're thrilled to let you know that your runner application has been approved! You're now officially part of the YUANCHENG runner network.</p>
      <p>As a new runner, you'll start at the <strong>Bronze tier</strong>. Complete your first 5 orders with a quality score of 4.0+ to advance to Silver tier for higher priority orders and better earnings.</p>
      <table style="width:100%;background:#fff;border-radius:8px;border:1px solid #e8dcc8;margin:16px 0;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Current Tier</strong></td><td style="padding:12px 16px;">🥉 Bronze</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e8dcc8;"><strong>Status</strong></td><td style="padding:12px 16px;color:#2d7a3a;font-weight:700;">● Active</td></tr>
      <tr><td style="padding:12px 16px;"><strong>Next Step</strong></td><td style="padding:12px 16px;">Log in to the runner portal to see your first assignments</td></tr>
      </table>
      <p>If you have any questions, feel free to reach out to our team anytime.</p>
      <p><a href="${dashboardUrl}" style="display:inline-block;background:#b8860b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Runner Dashboard</a></p>
      <p style="margin-top:16px;">Best of luck on your journey!<br/>The YUANCHENG Team</p>`;
  await sendMail(p.to, subject, wrapHTML(title, body, lang));
}

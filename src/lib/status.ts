/**
 * Human-friendly order status labels (bilingual) + tone. UI NEVER shows raw enum
 * strings. Tone maps to StatusBadge colors.
 */
import type { OrderStatus } from "@/types/platform";

export type Tone = "info" | "success" | "warning" | "error" | "muted";

interface Label { en: string; zh: string; tone: Tone; }

const LABELS: Record<OrderStatus, Label> = {
  draft:                   { en: "Draft", zh: "草稿", tone: "muted" },
  pending_payment:         { en: "Awaiting payment", zh: "待付款", tone: "info" },
  payment_proof_submitted: { en: "Payment under review", zh: "付款审核中", tone: "warning" },
  payment_failed:          { en: "Payment issue", zh: "付款问题", tone: "error" },
  paid:                    { en: "Paid", zh: "已付款", tone: "success" },
  accepted:                { en: "Accepted", zh: "已接单", tone: "info" },
  in_progress:             { en: "In progress", zh: "进行中", tone: "info" },
  evidence_submitted:      { en: "Evidence submitted", zh: "已提交凭证", tone: "info" },
  under_review:            { en: "Under review", zh: "审核中", tone: "warning" },
  completed:               { en: "Completed", zh: "已完成", tone: "success" },
  cancelled:               { en: "Cancelled", zh: "已取消", tone: "muted" },
  refunded:                { en: "Refunded", zh: "已退款", tone: "muted" },
  refund_requested:        { en: "Refund requested", zh: "已申请退款", tone: "warning" },
  refund_confirmed:        { en: "Refund confirmed", zh: "退款已确认", tone: "success" },
  disputed:                { en: "Issue raised", zh: "问题反馈", tone: "error" },
};

export function statusLabel(status: OrderStatus, locale = "en"): string {
  const l = LABELS[status] ?? LABELS.draft;
  return locale === "zh" ? l.zh : l.en;
}
export function statusTone(status: OrderStatus): Tone {
  return (LABELS[status] ?? LABELS.draft).tone;
}

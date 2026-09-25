/** Contact + deadline helpers (fixtures only; reminders/escalation are backend). */
import { formatDateTime } from "@/lib/format";
import type { Lang } from "@/lib/format";

export const SUPPORT_WHATSAPP = "60111111111"; // placeholder Yuancheng support number
export const DEMO_PROVIDER_WHATSAPP = "60127770000"; // demo provider (Golden Lotus) contact

const VERIFY_HOURS = 24;

/** Verification deadline = receipt upload time + 24h. */
export function verifyDeadline(uploadedISO: string): Date {
  return new Date(new Date(uploadedISO).getTime() + VERIFY_HOURS * 3600 * 1000);
}
export function verifyDeadlineLabel(uploadedISO: string, lang: Lang): string {
  return formatDateTime(verifyDeadline(uploadedISO).toISOString(), lang);
}
export function isOverdue(uploadedISO: string, now: Date = new Date()): boolean {
  return now.getTime() > verifyDeadline(uploadedISO).getTime();
}
export function waLink(number: string, text: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

/** Prefilled provider→customer refund message. */
export function refundMessage(orderNumber: string, amount: string, lang: Lang): string {
  return lang === "zh"
    ? `您好，关于订单 ${orderNumber}：我无法完成此订单，将退还 ${amount}。请提供您的银行资料以便我转账退款。`
    : `Hi, regarding order ${orderNumber}: I'm unable to fulfil this order and will refund ${amount}. Please share your bank details so I can transfer the refund.`;
}
/** Prefilled customer→provider "is my payment verified" message. */
export function verifyChaseMessage(orderNumber: string, lang: Lang): string {
  return lang === "zh"
    ? `您好，想咨询订单 ${orderNumber} 的付款是否已确认？`
    : `Hi, checking on order ${orderNumber} — has my payment been verified?`;
}

/**
 * Single source of display formatting. Used across /provider and the customer
 * order pages — no inline money/date formatting anywhere else.
 */

/** "RM 88.00" (MYR) or "<CODE> 88.00" for other currencies. */
export function formatMoney(amount: number, currency = "MYR"): string {
  const n = (Math.round(amount * 100) / 100).toFixed(2);
  return `${currency === "MYR" ? "RM" : currency} ${n}`;
}

/** "20 Sep 2026" from an ISO date/datetime string (or Date). */
export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** "20 Sep 2026, 10:32" — date + 24h time. */
export function formatDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return String(input);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date}, ${time}`;
}

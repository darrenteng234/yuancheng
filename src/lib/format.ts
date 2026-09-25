/**
 * Single source of display formatting (money + dates). Deterministic across
 * server and browser: dates always render in Asia/Kuala_Lumpur (UTC+8, no DST),
 * with fixed English month names (no toLocale*), so SSR and client agree and
 * there are no hydration mismatches.
 */

export type Lang = "en" | "zh";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");

interface KLParts { y: number; m: number; d: number; hh: number; mm: number; }

/** Resolve an input to Malaysian (UTC+8) calendar parts. */
function klParts(input: string | Date): KLParts | null {
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    const t = new Date(input.getTime() + 8 * 3600 * 1000);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), hh: t.getUTCHours(), mm: t.getUTCMinutes() };
  }
  const s = input.trim();
  // Date-only → a Malaysian calendar date, never shifted.
  let mo = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mo) return { y: +mo[1], m: +mo[2], d: +mo[3], hh: 0, mm: 0 };
  // Instant with explicit zone (Z or ±hh:mm) → convert to KL.
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s)) {
    const t = new Date(s);
    if (isNaN(t.getTime())) return null;
    const k = new Date(t.getTime() + 8 * 3600 * 1000);
    return { y: k.getUTCFullYear(), m: k.getUTCMonth() + 1, d: k.getUTCDate(), hh: k.getUTCHours(), mm: k.getUTCMinutes() };
  }
  // Zoneless datetime → treat as KL wall-clock (read components directly).
  mo = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (mo) return { y: +mo[1], m: +mo[2], d: +mo[3], hh: +mo[4], mm: +mo[5] };
  const t = new Date(s);
  if (isNaN(t.getTime())) return null;
  const k = new Date(t.getTime() + 8 * 3600 * 1000);
  return { y: k.getUTCFullYear(), m: k.getUTCMonth() + 1, d: k.getUTCDate(), hh: k.getUTCHours(), mm: k.getUTCMinutes() };
}

/** "RM 88.00" (MYR) or "<CODE> 88.00". */
export function formatMoney(amount: number, currency = "MYR"): string {
  const n = (Math.round(amount * 100) / 100).toFixed(2);
  return `${currency === "MYR" ? "RM" : currency} ${n}`;
}

/** "20 Sep 2026" (en) / "2026年9月20日" (zh). */
export function formatDate(input: string | Date, locale: Lang = "en"): string {
  const p = klParts(input);
  if (!p) return String(input);
  return locale === "zh" ? `${p.y}年${p.m}月${p.d}日` : `${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}

/** "20 Sep 2026, 10:32" (en) / "2026年9月20日 10:32" (zh). */
export function formatDateTime(input: string | Date, locale: Lang = "en"): string {
  const p = klParts(input);
  if (!p) return String(input);
  const time = `${pad(p.hh)}:${pad(p.mm)}`;
  return locale === "zh" ? `${p.y}年${p.m}月${p.d}日 ${time}` : `${p.d} ${MONTHS[p.m - 1]} ${p.y}, ${time}`;
}

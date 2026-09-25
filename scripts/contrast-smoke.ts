/* WCAG contrast: every text/background token pair used by body, badges, banners,
 * buttons must be >= 4.5:1. Saffron/cinnabar are decoration-only and excluded. */
function lin(c: number) { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }
function lum(hex: string) { const h = hex.replace("#", ""); const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16); return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b); }
function ratio(a: string, b: string) { const L1 = lum(a), L2 = lum(b); const hi = Math.max(L1,L2), lo = Math.min(L1,L2); return (hi + 0.05) / (lo + 0.05); }

const C = {
  ink: "#1F2A24", muted: "#5F6761", white: "#FFFFFF", ivory: "#F7F4EE", ivory2: "#F1EDE4", ivoryHover: "#EFEBE1",
  sandalwood: "#5A3A22", primaryBg: "#F3EBE3",
  success: "#2E6B55", successBg: "#E7F0EB", warning: "#8A5A1F", warningBg: "#F7EEDD",
  error: "#9A3B3B", errorBg: "#F7E9E7", info: "#43627A", infoBg: "#E8EFF3",
};
const PAIRS: [string, string, string][] = [
  ["body ink/ivory", C.ink, C.ivory], ["body ink/white", C.ink, C.white], ["body ink/ivory-2", C.ink, C.ivory2],
  ["muted/ivory", C.muted, C.ivory], ["muted/white", C.muted, C.white], ["muted/ivory-2", C.muted, C.ivory2], ["muted/ivory-hover", C.muted, C.ivoryHover],
  ["primary btn white/sandalwood", C.white, C.sandalwood],
  ["tag verified sandalwood/primary-bg", C.sandalwood, C.primaryBg],
  ["badge success", C.success, C.successBg], ["badge warning", C.warning, C.warningBg],
  ["badge error", C.error, C.errorBg], ["badge info", C.info, C.infoBg],
  ["badge muted/surface-2", C.muted, C.ivory2],
  ["banner-review warning/warning-bg", C.warning, C.warningBg],
  ["btn-danger white/error", C.white, C.error],
];
let pass = 0, fail = 0;
console.log("CONTRAST (>= 4.5:1)");
for (const [name, fg, bg] of PAIRS) {
  const r = ratio(fg, bg); const ok = r >= 4.5;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "✓" : "✗"} ${name.padEnd(34)} ${r.toFixed(2)}:1`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

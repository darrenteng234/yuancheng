/**
 * Copy lint: customer-facing strings must not promise religious/spiritual
 * outcomes. Scans the customer dictionaries and demo fixtures, and fails on
 * banned claim terms. Negated/disclaimer uses (不保证 / 并非…保证 / do not
 * guarantee / not a guarantee) are allowed.
 *
 * Usage: npx tsx scripts/copy-lint.ts
 */
import { en } from "../src/lib/i18n/dictionaries/en";
import { zh } from "../src/lib/i18n/dictionaries/zh";
import {
  DEMO_SERVICES, DEMO_PROVIDERS, DEMO_PLACES, DEMO_PACKAGES, DEMO_PRODUCTS,
  OCCASION_LABEL, OCCASION_CHIPS,
} from "../src/lib/demo/catalog";

/** Collect every string leaf, with a dotted path, from a value. */
function collect(value: unknown, path: string, out: { path: string; s: string }[]) {
  if (typeof value === "string") { out.push({ path, s: value }); return; }
  if (Array.isArray(value)) { value.forEach((v, i) => collect(v, `${path}[${i}]`, out)); return; }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collect(v, path ? `${path}.${k}` : k, out);
  }
}

// Banned zh outcome-claim terms (exact substrings).
const ZH_TERMS = ["保佑", "灵验", "有求必应", "消灾", "转运"];

interface Hit { path: string; term: string; s: string; }
function scan(label: string, value: unknown, hits: Hit[]) {
  const leaves: { path: string; s: string }[] = [];
  collect(value, label, leaves);
  for (const { path, s } of leaves) {
    for (const term of ZH_TERMS) if (s.includes(term)) hits.push({ path, term, s });
    // 保证 (guarantee) — allow only in a negation/disclaimer.
    if (s.includes("保证") && !/(不保证|不作保证|并非[\s\S]*保证|非[\s\S]*保证)/.test(s)) {
      hits.push({ path, term: "保证", s });
    }
    // guarantee — allow only "do/does not guarantee" / "not a guarantee".
    if (/guarantee/i.test(s) && !/((do|does)(n['’]t| not) guarantee|not a guarantee|no guarantee)/i.test(s)) {
      hits.push({ path, term: "guarantee", s });
    }
    // Outcome-claim phrases in English.
    for (const re of [/answered? prayer/i, /grant(s|ed)? (your|the) wish/i, /ward(s)? off/i, /bring(s)? (you )?(good )?fortune/i, /will bless\b/i]) {
      if (re.test(s)) hits.push({ path, term: re.source, s });
    }
  }
}

const hits: Hit[] = [];
scan("en", en, hits);
scan("zh", zh, hits);
scan("DEMO_SERVICES", DEMO_SERVICES, hits);
scan("DEMO_PROVIDERS", DEMO_PROVIDERS, hits);
scan("DEMO_PLACES", DEMO_PLACES, hits);
scan("DEMO_PACKAGES", DEMO_PACKAGES, hits);
scan("DEMO_PRODUCTS", DEMO_PRODUCTS, hits);
scan("OCCASION_LABEL", OCCASION_LABEL, hits);
scan("OCCASION_CHIPS", OCCASION_CHIPS, hits);

console.log("COPY LINT (customer dict + fixtures)");
if (hits.length === 0) {
  console.log("  ✓ no banned outcome-claim terms");
  console.log("\n0 hits");
  process.exit(0);
}
for (const h of hits) console.log(`  ✗ [${h.term}]  ${h.path}: "${h.s}"`);
console.log(`\n${hits.length} hit${hits.length === 1 ? "" : "s"}`);
process.exit(1);

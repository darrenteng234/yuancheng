/**
 * Screenshot harness for the provider portal UX audit (Phase 5B).
 * Usage: npx tsx scripts/capture-screens.ts <before|after>
 * Requires the dev server on http://localhost:3000 with NEXT_PUBLIC_DEMO_MODE=true.
 * Saves PNGs to docs/design-audit/screens/<before|after>/ and asserts that at
 * 375px every route has no horizontal overflow (scrollWidth === 375).
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const MODE = process.argv[2] === 'after' ? 'after' : 'before';
const BASE = process.env.CAPTURE_BASE || 'http://localhost:3000';
const OUT = path.join('docs/design-audit/screens', MODE);
const WIDTHS = [375, 768, 1440];
const ROUTES: [string, string][] = [
  ['provider', '/provider'],
  ['orders', '/provider/orders'],
  ['orders-ord-a', '/provider/orders/ord-a'],
  ['orders-ord-b', '/provider/orders/ord-b'],
  ['account', '/provider/account'],
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const failures: string[] = [];
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    for (const [slug, route] of ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const file = path.join(OUT, `${slug}__${w}.png`);
      await page.screenshot({ path: file, fullPage: true });
      if (w === 375) {
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        const ok = sw === 375;
        console.log(`  ${ok ? '✓' : '✗'} ${route} @375 scrollWidth=${sw}`);
        if (!ok) failures.push(`${route} scrollWidth=${sw} (expected 375)`);
      } else {
        console.log(`  · ${route} @${w} captured`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`\n${MODE.toUpperCase()} screenshots → ${OUT}`);
  if (failures.length) {
    console.log(`\nHorizontal-overflow failures (${failures.length}):`);
    failures.forEach((f) => console.log('  ✗', f));
    if (MODE === 'after') { console.error('\nFAIL: overflow present in "after" run'); process.exit(1); }
  } else {
    console.log('No horizontal overflow at 375px.');
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

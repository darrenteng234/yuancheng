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

const MODE = process.argv[2] || 'before'; // before | after | after-5c | after-5f
const IS_5C = MODE.startsWith('after-5');
const IS_5F = MODE === 'after-5f'; // customer home; locale in the path, not a cookie
const IS_6A = MODE === 'after-6a'; // customer home + one service detail per provider
const IS_7 = MODE === 'after-7'; // customer (path locale) + provider (cookie locale)
const PATH_LOCALE = IS_5F || IS_6A; // locale lives in the URL path, not a cookie
const BASE = process.env.CAPTURE_BASE || 'http://localhost:3000';
const OUT = path.join('docs/design-audit/screens', MODE);
const BILINGUAL = IS_5C || IS_6A || IS_7;
const WIDTHS = BILINGUAL ? [375, 1440] : [375, 768, 1440];
const LANGS = BILINGUAL ? ['en', 'zh'] : [''];
const ROUTES: [string, string][] = IS_7
  ? [
      ['home', ''],
      ['svc-detail', '/services/temple-offering-service'],
      ['provider-orders', '/provider/orders'],
      ['provider-ord-a', '/provider/orders/ord-a'],
    ]
  : IS_6A
  ? [
      ['home', ''],
      ['svc-golden-lotus', '/services/temple-offering-service'],
      ['svc-evergreen', '/services/grave-tending'],
      ['svc-serene-water', '/services/vesak-offering'],
      ['svc-jade-mountain', '/services/ancestor-tablet'],
      ['svc-harmony', '/services/cny-taisui-rite'],
    ]
  : IS_5F
  ? [['home', '']]
  : [
      ['provider', '/provider'],
      ['orders', '/provider/orders'],
      ['orders-ord-a', '/provider/orders/ord-a'],
      ['orders-ord-b', '/provider/orders/ord-b'],
      ['account', '/provider/account'],
    ];

async function main() {
  const browser = await chromium.launch();
  const failures: string[] = [];
  for (const lang of LANGS) {
    const dir = lang ? path.join(OUT, lang) : OUT;
    fs.mkdirSync(dir, { recursive: true });
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 812 }, deviceScaleFactor: 2 });
      if (lang) await ctx.addCookies([{ name: 'yc_provider_lang', value: lang, url: BASE }]);
      const page = await ctx.newPage();
      for (const [slug, route] of ROUTES) {
        // Phase 7 mixes schemes: customer pages use the path locale, provider
        // pages use the yc_provider_lang cookie (set below) at the bare route.
        const pathLocale = PATH_LOCALE || (IS_7 && !route.startsWith('/provider'));
        const url = pathLocale && lang ? `${BASE}/${lang}${route}` : `${BASE}${route}`;
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(dir, `${slug}__${w}.png`), fullPage: true });
        if (w === 375) {
          const sw = await page.evaluate(() => document.documentElement.scrollWidth);
          if (sw !== 375) failures.push(`${lang || ''} ${route} scrollWidth=${sw}`);
          // 5C acceptance: receipt thumbnail inside the first 375×812 viewport on ord-a.
          if (IS_5C && slug === 'orders-ord-a') {
            const box = await page.locator('.receipt-thumb').boundingBox();
            const inFold = !!box && (box.y + box.height) <= 812;
            console.log(`  ${inFold ? '✓' : '✗'} [${lang}] ord-a receipt in first viewport (bottom=${box ? Math.round(box.y + box.height) : 'n/a'})`);
            if (!inFold) failures.push(`${lang} ord-a receipt not in first 375x812 viewport`);
          }
          console.log(`  ${sw === 375 ? '✓' : '✗'} [${lang}] ${route} @375 scrollWidth=${sw}`);
        } else {
          console.log(`  · [${lang}] ${route} @${w} captured`);
        }
      }
      await ctx.close();
    }
  }
  await browser.close();
  console.log(`\n${MODE.toUpperCase()} screenshots → ${OUT}`);
  if (failures.length) {
    console.log(`\nHorizontal-overflow failures (${failures.length}):`);
    failures.forEach((f) => console.log('  ✗', f));
    if (MODE === 'after' || IS_5C || IS_6A || IS_7) { console.error('\nFAIL in "' + MODE + '" run'); process.exit(1); }
  } else {
    console.log('No horizontal overflow at 375px.');
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

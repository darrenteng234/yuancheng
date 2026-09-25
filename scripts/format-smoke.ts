/* Deterministic formatter tests (KL/UTC+8, fixed month names). Run via npm test. */
import { formatDate, formatDateTime, formatMoney } from '../src/lib/format';
let pass = 0, fail = 0;
const ok = (n: string, c: boolean) => c ? (pass++, console.log('  ✓', n)) : (fail++, console.log('  ✗ FAIL:', n));

console.log('FORMAT — money');
ok('formatMoney 88 → RM 88.00', formatMoney(88) === 'RM 88.00');
ok('formatMoney 188.5 → RM 188.50', formatMoney(188.5) === 'RM 188.50');

console.log('FORMAT — date (en)');
ok('date-only unchanged: 2026-09-20 → 20 Sep 2026', formatDate('2026-09-20') === '20 Sep 2026');
ok('month is "Sep" not "Sept"', formatDate('2026-09-20').includes('Sep') && !formatDate('2026-09-20').includes('Sept'));
ok('UTC 19 Sep 20:00Z → 20 Sep (KL +8)', formatDate('2026-09-19T20:00:00Z') === '20 Sep 2026');
ok('zoneless datetime kept as KL wall-clock', formatDate('2026-09-20T10:32:00') === '20 Sep 2026');
ok('datetime en → 20 Sep 2026, 10:32', formatDateTime('2026-09-20T10:32:00') === '20 Sep 2026, 10:32');

console.log('FORMAT — date (zh)');
ok('zh date → 2026年9月20日', formatDate('2026-09-20', 'zh') === '2026年9月20日');
ok('zh datetime → 2026年9月20日 10:32', formatDateTime('2026-09-20T10:32:00', 'zh') === '2026年9月20日 10:32');
ok('zh UTC shift → 2026年9月20日', formatDate('2026-09-19T20:00:00Z', 'zh') === '2026年9月20日');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

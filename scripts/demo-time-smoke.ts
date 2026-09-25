/* Demo timestamps are relative to now: Order A never overdue, Order C always overdue. */
import { DEMO_ORDERS, orderUploadedISO } from "../src/lib/demo/catalog";
import { isOverdue } from "../src/lib/demo/contact";
let pass = 0, fail = 0;
const ok = (n: string, c: boolean) => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗ FAIL:", n));
const A = DEMO_ORDERS.find((o) => o.id === "ord-a")!;
const C = DEMO_ORDERS.find((o) => o.id === "ord-c")!;
console.log("DEMO TIME (relative to now)");
ok("ord-a exists + payment_proof_submitted", !!A && A.status === "payment_proof_submitted");
ok("ord-c exists + payment_proof_submitted", !!C && C.status === "payment_proof_submitted");
ok("isOverdue(ord-a) === false", isOverdue(orderUploadedISO(A)) === false);
ok("isOverdue(ord-c) === true", isOverdue(orderUploadedISO(C)) === true);
ok("ord-b completed", !!DEMO_ORDERS.find((o) => o.id === "ord-b" && o.status === "completed"));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

/* Provider/authz business-rule smoke test. Run: npx tsx scripts/provider-smoke.ts */
import { canPublishSku, checkLimit, DEFAULT_FREE_PLAN, DEFAULT_PAID_PLAN } from '../src/lib/domain/plan';
import { canPublishPublicly } from '../src/lib/repos/providers';
import {
  canViewOrder, canActOnOrder, canManageProvider, canAdministerProvider, orderListScope,
  type Actor,
} from '../src/lib/domain/permissions';

let pass = 0, fail = 0;
function ok(name: string, cond: boolean) { cond ? (pass++, console.log('  ✓', name)) : (fail++, console.log('  ✗ FAIL:', name)); }

const admin: Actor = { role: 'admin', userId: 'a' };
const owner: Actor = { role: 'provider_owner', userId: 'u1', providerId: 'P1' };
const staff: Actor = { role: 'provider_staff', userId: 'u2', providerId: 'P1' };
const otherOwner: Actor = { role: 'provider_owner', userId: 'u3', providerId: 'P2' };
const fulfiller: Actor = { role: 'fulfiller', userId: 'u4', fulfillerId: 'F1' };
const customer: Actor = { role: 'customer', userId: 'u5', customerId: 'C1' };
const guest: Actor = { role: 'guest' };

const order = { provider_id: 'P1', customer_id: 'C1', fulfiller_id: 'F1', access_token: 'secret' };

console.log('PLAN LIMITS (free = 1 storefront, 3 SKUs; configurable)');
ok('free storefront_limit is 1', DEFAULT_FREE_PLAN.storefront_limit === 1);
ok('2nd storefront blocked on free', !checkLimit(DEFAULT_FREE_PLAN.storefront_limit, 1, 'Storefront').allowed);
ok('paid plan sku unlimited', canPublishSku({ name: 'Pro', sku_limit: DEFAULT_PAID_PLAN.sku_limit }, 500).allowed);
ok('free blocks 4th SKU', !canPublishSku({ name: 'Free', sku_limit: DEFAULT_FREE_PLAN.sku_limit }, 3).allowed);

console.log('PROVIDER APPROVAL GATING');
ok('approved provider may publish', canPublishPublicly({ status: 'approved' }));
ok('pending provider may NOT publish', !canPublishPublicly({ status: 'pending' }));
ok('suspended provider may NOT publish', !canPublishPublicly({ status: 'suspended' }));

console.log('ORDER OWNERSHIP (no client-side filtering)');
ok('admin sees any order', canViewOrder(admin, order));
ok('owner sees own-provider order', canViewOrder(owner, order));
ok('OTHER provider CANNOT see order', !canViewOrder(otherOwner, order));
ok('assigned fulfiller sees order', canViewOrder(fulfiller, order));
ok('customer sees own order', canViewOrder(customer, order));
ok('guest w/o token CANNOT see order', !canViewOrder(guest, order));
ok('guest WITH token sees order', canViewOrder(guest, order, 'secret'));
ok('guest WRONG token blocked', !canViewOrder(guest, order, 'nope'));

console.log('ORDER ACT / PROVIDER MANAGE');
ok('staff can act on own-provider order', canActOnOrder(staff, order));
ok('customer CANNOT act on order', !canActOnOrder(customer, order));
ok('owner manages own provider', canManageProvider(owner, 'P1'));
ok('staff CANNOT administer (owner-only)', !canAdministerProvider(staff, 'P1'));
ok('owner administers own provider', canAdministerProvider(owner, 'P1'));

console.log('LIST SCOPING (DB filter, never fetch-all)');
ok('admin scope = null (all)', orderListScope(admin) === null);
ok('provider scope = provider_id', orderListScope(owner)?.column === 'provider_id' && orderListScope(owner)?.value === 'P1');
ok('fulfiller scope = fulfiller_id', orderListScope(fulfiller)?.column === 'fulfiller_id');
ok('customer scope = customer_id', orderListScope(customer)?.column === 'customer_id');
ok('guest scope = deny (__none__)', orderListScope(guest)?.value === '__none__');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

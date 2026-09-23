/* Canonical V1 backend logic — deterministic checks for the new domain modules.
 * Run: npx tsx scripts/canonical-smoke.ts */
import { checkTransition } from '../src/lib/domain/order';
import { normalizeRole, roleEquals, isProviderRole } from '../src/lib/domain/roles';
import { resolveEntitlements, checkCapacity, canUseRunner } from '../src/lib/domain/entitlements';
import { canSubmitProof, orderStatusAfterProofDecision, isVerifiableBy } from '../src/lib/domain/payment-manual';
import { buildEvidenceSnapshot, customerCanSeeEvidence, videoExpected } from '../src/lib/domain/evidence';
import { validateAssignment, canTaskTransition } from '../src/lib/domain/fulfillment';
import type { PlanEntitlement, ProviderEntitlement } from '../src/types/platform';

let pass = 0, fail = 0;
const ok = (n: string, c: boolean) => c ? (pass++, console.log('  ✓', n)) : (fail++, console.log('  ✗ FAIL:', n));

console.log('ROLES — map, never rename');
ok('admin → superadmin', normalizeRole('admin') === 'superadmin');
ok('fulfiller → provider_runner', normalizeRole('fulfiller') === 'provider_runner');
ok('admin equals superadmin', roleEquals('admin', 'superadmin'));
ok('provider_runner is a provider role', isProviderRole('provider_runner'));

console.log('MANUAL PAYMENT STATE MACHINE');
ok('pending → proof_submitted (customer)', checkTransition('pending_payment', 'payment_proof_submitted', 'customer').ok);
ok('proof_submitted → paid (provider verifies)', checkTransition('payment_proof_submitted', 'paid', 'provider_owner').ok);
ok('customer CANNOT self-verify to paid', !checkTransition('payment_proof_submitted', 'paid', 'customer').ok);
ok('runner CANNOT fulfil before paid (proof stage)', !checkTransition('payment_proof_submitted', 'in_progress', 'provider_runner').ok);
ok('runner CAN fulfil after paid', checkTransition('accepted', 'in_progress', 'provider_runner').ok);
ok('superadmin alias completes', checkTransition('under_review', 'completed', 'superadmin').ok);
ok('admin alias completes too (back-compat)', checkTransition('under_review', 'completed', 'admin').ok);
ok('cannot skip pending → completed', !checkTransition('pending_payment', 'completed', 'admin').ok);

console.log('REFUND WORKFLOW (provider-direct)');
ok('paid → refund_requested (customer)', checkTransition('paid', 'refund_requested', 'customer').ok);
ok('refund_requested → refund_confirmed (provider_owner)', checkTransition('refund_requested', 'refund_confirmed', 'provider_owner').ok);
ok('customer CANNOT confirm refund', !checkTransition('refund_requested', 'refund_confirmed', 'customer').ok);

console.log('PAYMENT-MANUAL rules');
ok('can submit proof while pending', canSubmitProof('pending_payment'));
ok('cannot submit proof once paid', !canSubmitProof('paid'));
ok('accepted proof → paid', orderStatusAfterProofDecision('accepted') === 'paid');
ok('rejected proof → pending', orderStatusAfterProofDecision('rejected') === 'pending_payment');
ok('provider verifies, customer does not', isVerifiableBy('provider_owner') && !isVerifiableBy('customer'));

console.log('ENTITLEMENTS — capability, not plan strings');
const planE: PlanEntitlement[] = [
  { id: '1', plan_id: 'p', key: 'service_limit', limit_int: 3, enabled: true, value_text: null, created_at: '' },
  { id: '2', plan_id: 'p', key: 'runner_enabled', limit_int: null, enabled: false, value_text: null, created_at: '' },
];
const emptyProv: ProviderEntitlement[] = [];
const map = resolveEntitlements(planE, emptyProv);
ok('free service_limit = 3', checkCapacity(map, 'service_limit', 2).allowed);
ok('at limit blocks new', !checkCapacity(map, 'service_limit', 3).allowed);
ok('over-limit flagged, not auto-removed', checkCapacity(map, 'service_limit', 5).overLimit === true);
ok('runner disabled on free', canUseRunner(map) === false);
const promo: ProviderEntitlement[] = [{ id: 'x', provider_id: 'pr', key: 'service_limit', limit_int: null, enabled: true, value_text: null, expires_at: '2000-01-01T00:00:00Z', note: 'expired promo', created_at: '', updated_at: '' }];
const mapExpired = resolveEntitlements(planE, promo);
ok('expired provider grant ignored (still 3)', !checkCapacity(mapExpired, 'service_limit', 3).allowed);
const active: ProviderEntitlement[] = [{ id: 'y', provider_id: 'pr', key: 'service_limit', limit_int: null, enabled: true, value_text: null, note: 'grant', created_at: '', updated_at: '' }];
ok('active unlimited grant → allowed', checkCapacity(resolveEntitlements(planE, active), 'service_limit', 99).allowed);

console.log('EVIDENCE snapshot + visibility');
const snap = buildEvidenceSnapshot({ evidence_type: 'photo_and_video', evidence_visibility: 'automatic' });
ok('snapshot captures type', snap.evidence_type === 'photo_and_video');
ok('video expected', videoExpected(snap));
ok('automatic visible once submitted', customerCanSeeEvidence(snap, { submitted: true, approved: false }));
const snapApproval = buildEvidenceSnapshot({ evidence_type: 'photo', evidence_visibility: 'approval_required' });
ok('approval_required hidden until approved', !customerCanSeeEvidence(snapApproval, { submitted: true, approved: false }));
ok('approval_required visible after approval', customerCanSeeEvidence(snapApproval, { submitted: true, approved: true }));
ok('none is never visible', !customerCanSeeEvidence(buildEvidenceSnapshot({ evidence_type: 'none', evidence_visibility: 'automatic' }), { submitted: true, approved: true }));

console.log('FULFILLMENT tasks');
ok('runner assignment needs assignee', !validateAssignment('runner', {}).ok);
ok('external assignment needs a name', !validateAssignment('external', {}).ok);
ok('provider assignment ok with nothing', validateAssignment('provider', {}).ok);
ok('task pending → started', canTaskTransition('pending', 'started'));
ok('task cannot pending → completed', !canTaskTransition('pending', 'completed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

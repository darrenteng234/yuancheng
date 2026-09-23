/**
 * Evidence policy + purchase-time snapshot. The evidence promise is FROZEN onto
 * the order at purchase, so later provider changes never rewrite what an
 * existing customer was promised (in either direction).
 */
import type { EvidencePolicySnapshot, EvidenceType, EvidenceVisibility, Service } from '@/types/platform';

export function buildEvidenceSnapshot(
  src: Pick<Service, 'evidence_type' | 'evidence_visibility'>
): EvidencePolicySnapshot {
  return { evidence_type: src.evidence_type, customer_visibility: src.evidence_visibility };
}

export function evidenceExpected(snapshot?: EvidencePolicySnapshot): boolean {
  return !!snapshot && snapshot.evidence_type !== 'none';
}

export function videoExpected(snapshot?: EvidencePolicySnapshot): boolean {
  return snapshot?.evidence_type === 'photo_and_video';
}

/**
 * Whether the customer may see submitted evidence. `automatic` → visible once
 * submitted; `approval_required` → visible only after provider/admin approval.
 */
export function customerCanSeeEvidence(
  snapshot: EvidencePolicySnapshot | undefined,
  opts: { submitted: boolean; approved: boolean }
): boolean {
  if (!snapshot || snapshot.evidence_type === 'none') return false;
  if (!opts.submitted) return false;
  return snapshot.customer_visibility === 'automatic' ? true : opts.approved;
}

export const EVIDENCE_DISCLAIMER =
  'Completion evidence records what the provider submitted. It is not a guarantee of religious or spiritual outcomes.';

export function normalizeEvidenceType(x: string): EvidenceType {
  return x === 'none' || x === 'photo' || x === 'photo_and_video' ? x : 'photo';
}
export function normalizeVisibility(x: string): EvidenceVisibility {
  return x === 'approval_required' ? 'approval_required' : 'automatic';
}

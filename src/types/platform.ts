/**
 * ============================================================================
 * Yuancheng Platform Domain — provider-centric model (V1 foundation)
 * ============================================================================
 * This is the NEW source of truth for the platform pivot. The legacy temple-only
 * types in ./index.ts remain for existing pages during migration.
 *
 * Design intent (locked hypotheses):
 *  - Provider is the core entity; it is NOT assumed to be a conventional merchant.
 *  - Plan limits (e.g. sku_limit) are DATA on the plan, never hard-coded.
 *  - Orders cannot be fulfilled while unpaid (see OrderStatus + lib/domain/order).
 *  - Payment carries the full money breakdown; platform fee is configurable and
 *    defaults to zero (no commission activated yet).
 *  - Fulfillment may be Yuancheng-run OR provider-run (fulfillment_mode).
 * ============================================================================
 */

// ── Providers & membership ──────────────────────────────────────────────────
export type ProviderKind =
  | 'temple'
  | 'organization'
  | 'service_operator'
  | 'religious_service'
  | 'community_org'
  | 'other';

export type ProviderStatus = 'pending' | 'approved' | 'suspended' | 'rejected';
export type FulfillmentMode = 'platform' | 'provider';

export interface Provider {
  id: string;
  name: string;
  kind: ProviderKind;
  status: ProviderStatus;
  /** How this provider's orders are fulfilled. Platform = Yuancheng runners. */
  fulfillment_mode: FulfillmentMode;
  owner_user_id: string;
  contact_email?: string;
  contact_phone?: string;
  default_locale?: Locale;
  /**
   * Optional PRIMARY temple/org link (convenience for single-temple providers).
   * A provider may be associated with MANY temples via `provider_temples`; do not
   * treat this field as the parent of the provider.
   */
  temple_id?: string;
  approved_at?: string;
  // Canonical V1 additive fields (migration 01)
  slug?: string;
  description?: string;
  country?: string;
  city?: string;
  address?: string;
  storefront_status?: 'draft' | 'published' | 'paused';
  created_at: string;
  updated_at: string;
}

/** Many-to-many: a provider may operate services connected to multiple temples/orgs. */
export interface ProviderTemple {
  id: string;
  provider_id: string;
  temple_id: string;
  created_at: string;
}

export type ProviderRole = 'owner' | 'staff';
export interface ProviderMember {
  id: string;
  provider_id: string;
  user_id: string;
  role: ProviderRole;
  created_at: string;
}

// ── Storefront ──────────────────────────────────────────────────────────────
export interface Storefront {
  id: string;
  provider_id: string;
  slug: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'paused';
  locale?: Locale;
  branding?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Products & SKUs ─────────────────────────────────────────────────────────
export type SkuStatus = 'draft' | 'inactive' | 'archived' | 'published';

export interface PlatformProduct {
  id: string;
  provider_id: string;
  storefront_id: string;
  name: string;
  description?: string;
  type: 'physical' | 'service' | 'donation';
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface Sku {
  id: string;
  product_id: string;
  provider_id: string;
  name: string;
  price: number;
  currency: Currency;
  /** Only `published` SKUs count against plan.sku_limit (see lib/domain/plan). */
  status: SkuStatus;
  evidence_required?: string[];
  // Canonical V1: a SKU may be a package under a service (migration 03)
  service_id?: string;
  tier?: 'basic' | 'standard' | 'premium' | 'custom';
  includes?: string[];
  created_at: string;
  updated_at: string;
}

// ── Plans & subscriptions ───────────────────────────────────────────────────
export type PlanFeature =
  | 'multiple_storefronts'
  | 'staff_accounts'
  | 'analytics'
  | 'automation'
  | 'custom_branding';

export interface Plan {
  id: string;
  name: string;
  tier: 'free' | 'paid';
  /** null = unlimited. Never hard-code the number anywhere else. */
  sku_limit: number | null;         // ENFORCED now
  storefront_limit: number | null;  // ENFORCED now
  staff_limit: number | null;       // config only (not enforced yet)
  order_limit: number | null;       // config only
  storage_limit_mb: number | null;  // config only
  analytics_level: 'none' | 'basic' | 'advanced';   // config only
  automation_level: 'none' | 'basic' | 'advanced';  // config only
  features: PlanFeature[];
  /** Price left intentionally open; nullable until pricing is decided. */
  monthly_price?: number | null;
  currency?: Currency;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export interface Subscription {
  id: string;
  provider_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

// ── Customers ───────────────────────────────────────────────────────────────
export interface PlatformCustomer {
  id: string;
  /** Bound to a Supabase auth user when the customer has an account; guest orders leave it null. */
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferred_language?: Locale;
  created_at: string;
  updated_at: string;
}

// ── Orders ──────────────────────────────────────────────────────────────────
/**
 * Ordered lifecycle. Anything before PAID is pre-fulfillment; runners/providers
 * may only act from ACCEPTED onward. See lib/domain/order for the transition map.
 */
export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'payment_failed'
  | 'payment_proof_submitted'   // manual flow: customer uploaded proof, awaiting provider verify
  | 'paid'
  | 'accepted'
  | 'in_progress'
  | 'evidence_submitted'
  | 'under_review'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'refund_requested'
  | 'refund_confirmed'
  | 'disputed';

export interface Order {
  id: string;
  order_number: string;
  provider_id: string;
  storefront_id: string;
  customer_id?: string;
  /** Assigned fulfiller (platform runner or provider staff). */
  fulfiller_id?: string;
  status: OrderStatus;
  currency: Currency;
  /** Snapshot totals in the order's currency. */
  subtotal: number;
  total: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  special_instructions?: string;
  /** Secure guest access token (order tracking without an account). */
  access_token?: string;
  accepted_at?: string;
  completed_at?: string;
  // Canonical V1 additive (migration 05): request + immutable snapshots
  service_id?: string;
  package_id?: string;
  place_id?: string;
  customer_request?: string;
  additional_note?: string;
  customer_photo?: string;               // private storage path
  service_snapshot?: Record<string, unknown>;
  package_snapshot?: Record<string, unknown>;
  place_snapshot?: Record<string, unknown>;
  evidence_policy_snapshot?: EvidencePolicySnapshot;
  payment_instruction_snapshot?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  sku_id: string;
  /** Snapshot of name/price at purchase time (SKU may change later). */
  sku_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

// ── Evidence ────────────────────────────────────────────────────────────────
export interface Evidence {
  id: string;
  order_id: string;
  type: 'photo' | 'video' | 'receipt' | 'ovc';
  url: string;
  label?: string;
  uploaded_by?: string;
  created_at: string;
}

// ── Payments, payouts, refunds ──────────────────────────────────────────────
export type PaymentStatus = 'requires_payment' | 'processing' | 'succeeded' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'scheduled' | 'paid' | 'failed';
export type Currency = 'MYR' | 'SGD' | 'THB' | 'IDR' | 'VND' | 'USD';

/**
 * One customer payment, with the full money breakdown. `platform_fee` is
 * configurable and defaults to 0 — no commission is active yet, but the field
 * exists so enabling one later is a config change, not a schema change.
 * Invariant: provider_amount = gross_amount - payment_fee - platform_fee - refunded_amount.
 */
export interface Payment {
  id: string;
  order_id: string;
  provider_id: string;
  currency: Currency;
  gross_amount: number;      // what the customer paid
  payment_fee: number;       // gateway (Stripe) fee
  platform_fee: number;      // Yuancheng commission — default 0
  provider_amount: number;   // owed to provider before payout
  refund_amount: number;     // total refunded so far
  net_amount: number;        // gross - payment_fee - platform_fee - refund
  payout_amount: number;     // amount actually scheduled/paid out (0 until payout)
  status: PaymentStatus;
  payout_status: PayoutStatus;
  stripe_payment_intent_id?: string;
  // Canonical V1: generic processor abstraction (migration 04). Stage 1 = 'manual'.
  processor?: PaymentProcessor;
  processor_reference?: string;
  platform_fee_rate?: number;
  created_at: string;
  updated_at: string;
}

/** Payment processor. Stage 1 is 'manual' (provider-direct). Others are future adapters. */
export type PaymentProcessor = 'manual' | 'stripe' | 'xendit' | 'curlec';

export interface Payout {
  id: string;
  provider_id: string;
  period_start: string;
  period_end: string;
  amount: number;
  currency: Currency;
  status: PayoutStatus;
  paid_at?: string;
  created_at: string;
}

/**
 * Refund (provider-direct model). Yuancheng RECORDS the refund; the provider
 * returns the money directly. Yuancheng never claims to have refunded funds it
 * did not hold.
 */
export type RefundStatus =
  | 'requested' | 'approved' | 'provider_refunding' | 'confirmed' | 'rejected'
  | 'pending' | 'succeeded' | 'failed';   // legacy values retained
export interface Refund {
  id: string;
  order_id: string;
  payment_id?: string;
  amount: number;
  currency?: Currency;
  reason?: string;
  status: RefundStatus;
  requested_at?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  notes?: string;
  created_at: string;
}

export interface PlatformDispute {
  id: string;
  order_id: string;
  customer_id?: string;
  reason: string;
  customer_claim?: string;
  resolution?: 'full_refund' | 'partial_refund' | 'redo' | 'rejected' | 'pending';
  refund_amount: number;
  status: 'open' | 'resolved' | 'escalated';
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
}

// ── Locale ──────────────────────────────────────────────────────────────────
export type Locale = 'en' | 'zh' | 'ms' | 'id' | 'th' | 'vi';

// ── Actor / permissions ─────────────────────────────────────────────────────
/**
 * Authorization roles. Canonical V1 names are `superadmin` and `provider_runner`;
 * `admin` and `fulfiller` are retained as deprecated aliases so existing records
 * and code keep working (see lib/domain/roles for normalization). superadmin =
 * Yuancheng company administrator (distinct from provider_owner).
 */
export type Role =
  | 'superadmin' | 'admin'          // admin = deprecated alias of superadmin
  | 'provider_owner'
  | 'provider_staff'
  | 'provider_runner' | 'fulfiller' // fulfiller = deprecated alias of provider_runner
  | 'customer'
  | 'guest';

// ============================================================================
// Canonical V1 backend contract — additive entities
// ============================================================================

/** Structured provider verification (migration 02). */
export type VerificationType = 'identity' | 'business' | 'physical_location';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export interface ProviderVerification {
  id: string;
  provider_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  reference?: string;
  notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

/** Evidence configuration (frozen onto the order at purchase). */
export type EvidenceType = 'none' | 'photo' | 'photo_and_video';
export type EvidenceVisibility = 'automatic' | 'approval_required';
export interface EvidencePolicySnapshot {
  evidence_type: EvidenceType;
  customer_visibility: EvidenceVisibility;
}

/** Service listing (migration 03) — one provider offering in one place/context. */
export interface Service {
  id: string;
  provider_id: string;
  storefront_id?: string;
  place_id?: string;                 // nullable: future non-place services
  name: string;
  slug: string;
  description?: string;
  request_guidance?: string;
  status: 'draft' | 'published' | 'paused' | 'archived';
  customer_photo_required: boolean;
  customer_photo_optional: boolean;
  evidence_type: EvidenceType;
  evidence_visibility: EvidenceVisibility;
  created_at: string;
  updated_at: string;
}

/** Provider-controlled payment instructions (migration 04). */
export type PaymentMethodType = 'bank_transfer' | 'duitnow_qr' | 'other';
export interface ProviderPaymentMethod {
  id: string;
  provider_id: string;
  type: PaymentMethodType;
  country?: string;
  currency?: Currency;
  display_name: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  qr_asset?: string;                 // private storage path
  instructions?: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Immutable snapshot of the instructions shown to the customer at order time. */
export interface OrderPaymentInstruction {
  id: string;
  order_id: string;
  payment_method_type?: PaymentMethodType;
  display_name?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  instructions?: string;
  qr_reference?: string;
  created_at: string;
}

/** Customer-uploaded proof of a direct payment. upload != paid. */
export type PaymentProofStatus = 'submitted' | 'accepted' | 'rejected';
export interface PaymentProof {
  id: string;
  order_id: string;
  uploaded_by?: string;
  storage_path: string;              // PRIVATE bucket path
  file_type?: string;
  status: PaymentProofStatus;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

/** Append-only order audit event (migration 05). */
export interface OrderEvent {
  id: string;
  order_id: string;
  actor_user_id?: string;
  actor_role?: Role;
  event_type: string;
  from_status?: OrderStatus;
  to_status?: OrderStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/** Fulfillment task (migration 06). One order = one task in V1. */
export type FulfillmentAssignmentType = 'provider' | 'staff' | 'runner' | 'external';
export type FulfillmentTaskStatus = 'pending' | 'started' | 'completed' | 'cancelled';
export interface FulfillmentTask {
  id: string;
  order_id: string;
  provider_id: string;
  assignment_type: FulfillmentAssignmentType;
  assigned_user_id?: string;
  external_fulfiller_name?: string;
  status: FulfillmentTaskStatus;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/** Entitlements (migration 07). Capability-based, never plan-string checks. */
export type EntitlementKey =
  | 'service_limit' | 'package_limit' | 'product_limit' | 'location_limit'
  | 'staff_limit' | 'runner_enabled' | 'evidence_enabled'
  | 'analytics_level' | 'custom_branding';
export interface PlanEntitlement {
  id: string;
  plan_id: string;
  key: EntitlementKey;
  limit_int?: number | null;
  enabled: boolean;
  value_text?: string | null;
  created_at: string;
}
export interface ProviderEntitlement {
  id: string;
  provider_id: string;
  key: EntitlementKey;
  limit_int?: number | null;
  enabled: boolean;
  value_text?: string | null;
  expires_at?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

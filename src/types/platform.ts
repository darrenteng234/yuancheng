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
  | 'paid'
  | 'accepted'
  | 'in_progress'
  | 'evidence_submitted'
  | 'under_review'
  | 'completed'
  | 'cancelled'
  | 'refunded'
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
  created_at: string;
  updated_at: string;
}

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

export interface Refund {
  id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'succeeded' | 'failed';
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
export type Role = 'admin' | 'provider_owner' | 'provider_staff' | 'fulfiller' | 'customer' | 'guest';

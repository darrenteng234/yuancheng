export interface Temple {
  id: string;
  name: string;
  country: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'researching' | 'sop_drafted' | 'runner_ready' | 'active' | 'paused';
  verification_status: 'unverified' | 'verified';
  notes?: string;
  photos?: string[];
  short_description?: string;
  short_description_zh?: string;
  prayer_tags?: string[];
  prayer_tags_zh?: string[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  temple_id: string;
  name: string;
  type: 'physical' | 'service' | 'donation';
  cost_to_runner: number;
  evidence_required: string[];
  notes?: string;
  is_active: boolean;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  temple_id: string;
  name: string;
  description?: string;
  selling_price: number;
  status: 'draft' | 'active' | 'paused' | 'archived';
  evidence_sop?: Record<string, unknown>;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface PackageProduct {
  id: string;
  package_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Runner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  quality_score: number;
  status: 'active' | 'probation' | 'suspended' | 'banned';
  return_rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  segment: 'one_time' | 'repeat' | 'vip' | 'vow_fulfiller' | 'custom_vow' | 'disputed';
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  temple_id: string;
  package_id?: string;
  runner_id?: string;
  selling_price: number;
  status: 'paid' | 'unassigned' | 'in_progress' | 'in_review' | 'completed' | 'disputed' | 'refunded' | 'cancelled';
  customer_name?: string;
  customer_phone?: string;
  special_instructions?: string;
  evidence_submitted: unknown[];
  review_notes?: string;
  reviewed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer?: Customer;
  temple?: Temple;
  package?: Package;
  runner?: Runner;
}

export interface RunnerReceipt {
  id: string;
  order_id: string;
  runner_id: string;
  product_cost: number;
  transport_cost: number;
  other_cost: number;
  receipt_url?: string;
  status: 'pending' | 'received' | 'verified' | 'rejected';
  submitted_at?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
}

export interface RunnerPayment {
  id: string;
  runner_id: string;
  period_start: string;
  period_end: string;
  total_reimbursable: number;
  amount_paid: number;
  status: 'pending' | 'paid' | 'partial';
  paid_at?: string;
  notes?: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  customer_id?: string;
  reason: string;
  customer_claim?: string;
  runner_response?: string;
  resolution?: 'full_refund' | 'partial_refund' | 'redo' | 'rejected' | 'pending';
  refund_amount: number;
  status: 'open' | 'resolved' | 'escalated';
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
}

export interface TempleRequest {
  id: string;
  temple_name: string;
  country: string;
  city?: string;
  requested_by?: string;
  request_count: number;
  status: 'pending' | 'researching' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface Setting {
  id?: string;
  key: string;
  value: unknown;
  description?: string;
  updated_at: string;
}


import { supabaseAdmin } from '@/lib/supabase';

/** Returns the service-role client or throws — never silently degrades in prod. */
export function db() {
  if (!supabaseAdmin) throw new Error('Supabase service role not configured');
  return supabaseAdmin;
}

export class NotFoundError extends Error {
  constructor(what = 'Resource') { super(`${what} not found`); this.name = 'NotFoundError'; }
}
export class LimitError extends Error {
  constructor(msg: string) { super(msg); this.name = 'LimitError'; }
}
export class ForbiddenError extends Error {
  constructor(msg = 'Forbidden') { super(msg); this.name = 'ForbiddenError'; }
}

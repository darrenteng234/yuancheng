import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Import-safe: supabase-js throws if given an empty URL. When env is missing
// (misconfig, tests, build without secrets) fall back to a syntactically valid
// placeholder so the module loads; any real call then fails at the network, not
// at import — which would otherwise crash every route that imports this file.
const SAFE_URL = supabaseUrl || 'http://placeholder.invalid';
const SAFE_ANON = supabaseAnonKey || 'placeholder-anon-key';

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(SAFE_URL, SAFE_ANON);

// Service role client for admin operations (server-side only). Null when the
// service key is absent — callers already handle null (return 500 / dev fallback).
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl || SAFE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

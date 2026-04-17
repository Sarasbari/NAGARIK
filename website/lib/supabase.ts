import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Server-side Supabase client with service role key.
 * Use in Server Components and Route Handlers only.
 */
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Client-side Supabase client with anon key.
 */
export function createBrowserSupabaseClient() {
  return createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

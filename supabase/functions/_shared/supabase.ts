import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

/**
 * Create a Supabase client with the service role key.
 * This bypasses RLS — use only in Edge Functions for server-side operations.
 */
export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Create a Supabase client scoped to the requesting user's JWT.
 * This respects RLS policies.
 */
export function createUserClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

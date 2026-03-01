import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      // Hash-based routing uses "#" for app routes (e.g. "#/dashboard").
      // Enable URL session parsing only when auth params are actually present.
      detectSessionInUrl: (() => {
        if (typeof window === 'undefined') return false
        const hash = window.location.hash || ''
        const search = window.location.search || ''
        return (
          hash.includes('access_token=') ||
          hash.includes('refresh_token=') ||
          hash.includes('type=recovery') ||
          search.includes('code=')
        )
      })()
    }
  }
)

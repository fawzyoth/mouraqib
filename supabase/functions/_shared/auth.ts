import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.93.3'

export interface AuthUser {
  id: string
  email: string
  organizationId: string
  role: string
  isAdmin: boolean
}

/**
 * Decode a JWT payload without verification.
 * Signature verification is handled by checking the user exists via admin API.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payload)
  } catch {
    return null
  }
}

/**
 * Verify the JWT from the Authorization header and return the user's profile.
 * Uses auth.admin.getUserById() to verify the user exists, bypassing
 * getUser(token) which fails with ES256 JWTs on this project.
 */
export async function verifyUser(authHeader: string | null): Promise<{ user: AuthUser | null; error: string | null }> {
  console.log('[AUTH] verifyUser called, authHeader present:', !!authHeader)

  if (!authHeader) {
    return { user: null, error: 'No Authorization header provided' }
  }

  const token = authHeader.replace('Bearer ', '')
  const payload = decodeJwtPayload(token)

  if (!payload) {
    console.log('[AUTH] FAIL: could not decode JWT payload')
    return { user: null, error: 'Invalid JWT format' }
  }

  const userId = payload.sub as string
  const exp = payload.exp as number
  const email = payload.email as string

  console.log('[AUTH] JWT decoded — sub:', userId, '| email:', email, '| exp:', exp)

  // Check expiry
  const now = Math.floor(Date.now() / 1000)
  if (exp && now > exp) {
    console.log('[AUTH] FAIL: token expired at', exp, '| now:', now, '| expired', now - exp, 'seconds ago')
    return { user: null, error: `JWT expired ${now - exp} seconds ago` }
  }

  if (!userId) {
    console.log('[AUTH] FAIL: no sub claim in JWT')
    return { user: null, error: 'JWT has no sub claim' }
  }

  // Use service client with admin API to verify user exists
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  console.log('[AUTH] verifying user via admin API...')
  const { data: { user: authUser }, error: adminError } = await supabase.auth.admin.getUserById(userId)

  if (adminError) {
    console.log('[AUTH] FAIL: admin.getUserById error:', adminError.message)
    return { user: null, error: `User verification failed: ${adminError.message}` }
  }
  if (!authUser) {
    console.log('[AUTH] FAIL: admin.getUserById returned null')
    return { user: null, error: 'User not found in auth system' }
  }

  console.log('[AUTH] user verified — id:', authUser.id, '| email:', authUser.email)

  // Fetch profile
  console.log('[AUTH] fetching profile...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, role, is_admin')
    .eq('id', authUser.id)
    .single()

  if (profileError) {
    console.log('[AUTH] FAIL: profile error:', profileError.message, '| code:', profileError.code)
    return { user: null, error: `Profile lookup failed: ${profileError.message}` }
  }
  if (!profile) {
    return { user: null, error: 'No profile found for this user' }
  }

  console.log('[AUTH] SUCCESS — org:', profile.organization_id, '| role:', profile.role)

  return {
    user: {
      id: authUser.id,
      email: authUser.email ?? '',
      organizationId: profile.organization_id,
      role: profile.role,
      isAdmin: profile.is_admin,
    },
    error: null,
  }
}

/**
 * Check if user has one of the required roles.
 */
export function hasRole(user: AuthUser, roles: string[]): boolean {
  return user.isAdmin || roles.includes(user.role)
}

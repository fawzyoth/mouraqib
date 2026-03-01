import { createServiceClient } from './supabase.ts'

export interface AuthUser {
  id: string
  email: string
  organizationId: string
  role: string
  isAdmin: boolean
}

/**
 * Verify the JWT from the Authorization header and return the user's profile.
 * Returns null if the token is invalid or the user has no profile.
 */
export async function verifyUser(authHeader: string | null): Promise<AuthUser | null> {
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  const supabase = createServiceClient()

  // Verify JWT and get the user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return null

  // Fetch profile with organization info
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id, role, is_admin')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return null

  return {
    id: user.id,
    email: user.email ?? '',
    organizationId: profile.organization_id,
    role: profile.role,
    isAdmin: profile.is_admin,
  }
}

/**
 * Check if user has one of the required roles.
 */
export function hasRole(user: AuthUser, roles: string[]): boolean {
  return user.isAdmin || roles.includes(user.role)
}

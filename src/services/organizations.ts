import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { OrganizationUpdate } from '@/types/database'

export const organizationsService = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: OrganizationUpdate) {
    const { data, error } = await (supabase
      .from('organizations') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    if (error) throw error
    return data
  },

  async inviteMember(organizationId: string, email: string, role: string, name: string, password: string) {
    const validRoles = ['manager', 'agent_confirmation', 'agent_warehouse']
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`)
    }

    // 1. Save admin session
    const { data: { session: adminSession } } = await supabase.auth.getSession()

    // 2. Block auth state listener, then sign up
    const authStore = useAuthStore()
    authStore.isCreatingMember = true

    console.log('[inviteMember] Creating auth user:', { email, name, role, organizationId })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name || email.split('@')[0] } },
    })

    // 3. Restore admin session and re-enable auth listener
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      })
    }
    authStore.isCreatingMember = false

    // "User already registered" is OK — we'll just move their profile
    if (error && !error.message.includes('already registered')) {
      console.error('[inviteMember] SignUp error:', error)
      throw error
    }
    console.log('[inviteMember] Auth user ready')

    // 4. Move member to the correct organization via RPC (uses email, works for new + existing)
    console.log('[inviteMember] Calling add_team_member RPC...')
    const { data: memberId, error: rpcError } = await (supabase.rpc as any)('add_team_member', {
      member_email: email,
      target_org_id: organizationId,
      member_name: name || email.split('@')[0],
      member_role: role,
    })

    if (rpcError) {
      console.error('[inviteMember] RPC error:', rpcError)
      throw rpcError
    }
    console.log('[inviteMember] Member added to org successfully')

    return { id: memberId || data?.user?.id || '', email, name, role }
  },

  async updateMemberRole(memberId: string, role: string) {
    const { data, error } = await (supabase
      .from('profiles') as any)
      .update({ role })
      .eq('id', memberId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeMember(memberId: string) {
    const { error } = await (supabase
      .from('profiles') as any)
      .update({ organization_id: null })
      .eq('id', memberId)

    if (error) throw error
  },

  // Roles CRUD
  async getRoles(organizationId: string) {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    if (error) throw error
    return data
  },

  async createRole(role: { organization_id: string; name: string; description?: string; permissions?: string[] }) {
    const { data, error } = await (supabase
      .from('roles') as any)
      .insert(role)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateRole(id: string, updates: { name?: string; description?: string; permissions?: string[] }) {
    const { data, error } = await (supabase
      .from('roles') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteRole(id: string) {
    const { error } = await (supabase
      .from('roles') as any)
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Platform admin functions
  async getAllOrganizations() {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        credits:organization_credits(*),
        member_count:profiles(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getOrganizationWithDetails(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        credits:organization_credits(*),
        profiles(*),
        boutiques(count),
        shipments(count)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}

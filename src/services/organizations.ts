import { supabase } from '@/lib/supabase'
import type { Organization, OrganizationUpdate, Profile } from '@/types/database'

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
    const { data, error } = await supabase
      .from('organizations')
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

  async inviteMember(organizationId: string, email: string, role: string, boutiqueIds?: string[]) {
    const response = await supabase.functions.invoke('invite-member', {
      body: { email, role, boutiqueIds },
    })

    if (response.error) {
      throw new Error(response.error.message ?? 'Failed to send invitation')
    }

    return response.data
  },

  async updateMemberRole(memberId: string, role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeMember(memberId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ organization_id: null })
      .eq('id', memberId)

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

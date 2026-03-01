import { supabase } from '@/lib/supabase'
import type { FeatureFlag } from '@/types/database'

export const featureFlagsService = {
  async getForOrg(organizationId: string): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('organization_id', organizationId)

    if (error) throw error
    return data ?? []
  },

  async getForOrgAdmin(organizationId: string): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('organization_id', organizationId)
      .order('role')
      .order('feature')

    if (error) throw error
    return data ?? []
  },

  async upsert(organizationId: string, role: string, feature: string, enabled: boolean) {
    const { data, error } = await supabase
      .from('feature_flags')
      .upsert(
        { organization_id: organizationId, role, feature, enabled },
        { onConflict: 'organization_id,role,feature' }
      )
      .select()
      .single()

    if (error) throw error
    return data
  },

  async bulkUpsert(organizationId: string, flags: { role: string; feature: string; enabled: boolean }[]) {
    const rows = flags.map(f => ({
      organization_id: organizationId,
      role: f.role,
      feature: f.feature,
      enabled: f.enabled,
    }))

    const { data, error } = await supabase
      .from('feature_flags')
      .upsert(rows, { onConflict: 'organization_id,role,feature' })
      .select()

    if (error) throw error
    return data ?? []
  },
}

import { supabase } from '@/lib/supabase'
import type { FeatureFlag } from '@/types/database'

// Simple cache to avoid re-fetching flags on every router navigation
let _cachedOrgId: string | null = null
let _cachedFlags: FeatureFlag[] = []
let _cacheTimestamp = 0
const CACHE_TTL = 60_000 // 1 minute

export const featureFlagsService = {
  async getForOrg(organizationId: string): Promise<FeatureFlag[]> {
    const now = Date.now()
    if (_cachedOrgId === organizationId && now - _cacheTimestamp < CACHE_TTL) {
      return _cachedFlags
    }

    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('organization_id', organizationId)

    if (error) throw error

    _cachedOrgId = organizationId
    _cachedFlags = data ?? []
    _cacheTimestamp = now
    return _cachedFlags
  },

  clearCache() {
    _cachedOrgId = null
    _cachedFlags = []
    _cacheTimestamp = 0
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

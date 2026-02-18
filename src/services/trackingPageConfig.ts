import { supabase } from '@/lib/supabase'
import type { TrackingPageConfigUpdate } from '@/types/database'

export const trackingPageConfigService = {
  async get(organizationId: string) {
    const { data, error } = await supabase
      .from('tracking_page_config')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async upsert(organizationId: string, updates: Omit<TrackingPageConfigUpdate, 'id' | 'organization_id'>) {
    const { data: existing } = await supabase
      .from('tracking_page_config')
      .select('id')
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('tracking_page_config')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('tracking_page_config')
        .insert({ organization_id: organizationId, ...updates })
        .select()
        .single()

      if (error) throw error
      return data
    }
  },
}

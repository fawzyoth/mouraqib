import { supabase } from '@/lib/supabase'
import type { NotificationSettingInsert, NotificationSettingUpdate } from '@/types/database'

export const notificationSettingsService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .order('event_type')

    if (error) throw error
    return data
  },

  async update(id: string, updates: NotificationSettingUpdate) {
    const { data, error } = await supabase
      .from('notification_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async create(setting: NotificationSettingInsert) {
    const { data, error } = await supabase
      .from('notification_settings')
      .insert(setting)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

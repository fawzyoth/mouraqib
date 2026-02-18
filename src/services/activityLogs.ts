import { supabase } from '@/lib/supabase'
import type { ActivityLogInsert } from '@/types/database'

export const activityLogsService = {
  async getAll(organizationId: string, limit = 50) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async create(log: ActivityLogInsert) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(log)
      .select()
      .single()

    if (error) throw error
    return data
  },

  subscribeToChanges(organizationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`activity_logs:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `organization_id=eq.${organizationId}`,
        },
        callback
      )
      .subscribe()
  },
}

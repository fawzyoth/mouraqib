import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type PickupEvent = Database['public']['Tables']['pickup_events']['Row']
type PickupEventInsert = Database['public']['Tables']['pickup_events']['Insert']

export const pickupEventsService = {
  async getAll(organizationId: string): Promise<PickupEvent[]> {
    const PAGE_SIZE = 1000
    const allData: PickupEvent[] = []
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('pickup_events')
        .select('*')
        .eq('organization_id', organizationId)
        .order('pickup_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      allData.push(...data)
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    return allData
  },

  async create(event: PickupEventInsert): Promise<PickupEvent> {
    const { data, error } = await supabase
      .from('pickup_events')
      .insert(event)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pickup_events')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

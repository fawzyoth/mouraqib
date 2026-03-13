import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type PickupEvent = Database['public']['Tables']['pickup_events']['Row']
type PickupEventInsert = Database['public']['Tables']['pickup_events']['Insert']

export const pickupEventsService = {
  async getAll(organizationId: string): Promise<PickupEvent[]> {
    const { data, error } = await supabase
      .from('pickup_events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('pickup_at', { ascending: false })

    if (error) throw error
    return data
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

import { supabase } from '@/lib/supabase'
import type { PickupRequest, PickupRequestInsert, PickupRequestUpdate } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface PickupFilters {
  status?: string
  boutiqueId?: string
  carrierId?: string
  dateFrom?: string
  dateTo?: string
}

export const pickupsService = {
  async getAll(organizationId: string, filters?: PickupFilters) {
    let query = supabase
      .from('pickup_requests')
      .select(`
        *,
        boutique:boutiques(id, name, color),
        carrier:carriers(id, name)
      `)
      .eq('organization_id', organizationId)
      .order('scheduled_date', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.boutiqueId) {
      query = query.eq('boutique_id', filters.boutiqueId)
    }
    if (filters?.carrierId) {
      query = query.eq('carrier_id', filters.carrierId)
    }
    if (filters?.dateFrom) {
      query = query.gte('scheduled_date', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('scheduled_date', filters.dateTo)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('pickup_requests')
      .select(`
        *,
        boutique:boutiques(id, name, color, address),
        carrier:carriers(id, name),
        shipments:shipments(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getUpcoming(organizationId: string, limit = 5) {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('pickup_requests')
      .select(`
        *,
        boutique:boutiques(id, name, color),
        carrier:carriers(id, name)
      `)
      .eq('organization_id', organizationId)
      .gte('scheduled_date', today)
      .in('status', ['pending', 'confirmed'])
      .order('scheduled_date', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },

  async create(pickup: PickupRequestInsert) {
    const { data, error } = await supabase
      .from('pickup_requests')
      .insert(pickup)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: PickupRequestUpdate) {
    const { data, error } = await supabase
      .from('pickup_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: string) {
    const updates: PickupRequestUpdate = { status: status as any }

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    }

    return this.update(id, updates)
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('pickup_requests')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async assignShipments(pickupId: string, shipmentIds: string[]) {
    const { error } = await supabase
      .from('shipments')
      .update({ pickup_id: pickupId, status: 'pickup_scheduled' })
      .in('id', shipmentIds)

    if (error) throw error

    // Update shipment count
    await supabase
      .from('pickup_requests')
      .update({ shipment_count: shipmentIds.length })
      .eq('id', pickupId)
  },

  async getStats(organizationId: string) {
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('status')
      .eq('organization_id', organizationId)

    if (error) throw error

    const stats = {
      total: data.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      failed: 0
    }

    data.forEach(p => {
      if (p.status in stats) {
        stats[p.status as keyof typeof stats]++
      }
    })

    return stats
  },

  subscribeToChanges(
    organizationId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    return supabase
      .channel('pickups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pickup_requests',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe()
  },

  unsubscribe(channel: RealtimeChannel) {
    supabase.removeChannel(channel)
  }
}

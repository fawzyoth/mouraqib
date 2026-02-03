import { supabase } from '@/lib/supabase'
import type { Shipment, ShipmentInsert, ShipmentUpdate, ShipmentEvent } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ShipmentFilters {
  status?: string
  boutiqueId?: string
  carrierId?: string
  governorate?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export const shipmentsService = {
  async getAll(organizationId: string, filters?: ShipmentFilters) {
    let query = supabase
      .from('shipments')
      .select(`
        *,
        boutique:boutiques(id, name, color),
        carrier:carriers(id, name),
        client:clients(id, name, phone)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.boutiqueId) {
      query = query.eq('boutique_id', filters.boutiqueId)
    }
    if (filters?.carrierId) {
      query = query.eq('carrier_id', filters.carrierId)
    }
    if (filters?.governorate) {
      query = query.eq('governorate', filters.governorate)
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }
    if (filters?.search) {
      query = query.or(`tracking_number.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%,recipient_phone.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        boutique:boutiques(id, name, color),
        carrier:carriers(id, name),
        client:clients(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByTrackingNumber(trackingNumber: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        boutique:boutiques(id, name, color),
        carrier:carriers(id, name),
        events:shipment_events(*)
      `)
      .eq('tracking_number', trackingNumber)
      .single()

    if (error) throw error
    return data
  },

  async create(shipment: ShipmentInsert) {
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createMany(shipments: ShipmentInsert[]) {
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipments)
      .select()

    if (error) throw error
    return data
  },

  async update(id: string, updates: ShipmentUpdate) {
    const { data, error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: string) {
    const updates: ShipmentUpdate = { status: status as any }

    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString()
    } else if (status === 'returned') {
      updates.returned_at = new Date().toISOString()
    }

    return this.update(id, updates)
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getEvents(shipmentId: string) {
    const { data, error } = await supabase
      .from('shipment_events')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async addEvent(shipmentId: string, status: string, description?: string, location?: string) {
    const { data, error } = await supabase
      .from('shipment_events')
      .insert({
        shipment_id: shipmentId,
        status,
        description,
        location
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getStats(organizationId: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select('status')
      .eq('organization_id', organizationId)

    if (error) throw error

    const stats = {
      total: data.length,
      pending: 0,
      pickup_scheduled: 0,
      picked_up: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0
    }

    data.forEach(s => {
      if (s.status in stats) {
        stats[s.status as keyof typeof stats]++
      }
    })

    return stats
  },

  subscribeToChanges(
    organizationId: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    return supabase
      .channel('shipments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments',
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

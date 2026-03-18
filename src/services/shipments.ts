import { supabase } from '@/lib/supabase'
import type { Shipment, ShipmentInsert, ShipmentUpdate, ShipmentEvent } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { RETURN_STATUSES } from '@/utils/shipment-statuses'

const RETURN_STATUSES_SET = new Set(RETURN_STATUSES)

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
        carrier:carriers(id, name, sender_id),
        client:clients(id, name, phone),
        shipment_events(status, created_at)
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

    const { data, error } = await query.limit(10000)

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        boutique:boutiques(id, name, color),
        carrier:carriers(id, name, sender_id),
        client:clients(*),
        shipment_events(*)
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
        carrier:carriers(id, name, sender_id),
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

    if (status === 'Livré') {
      updates.delivered_at = new Date().toISOString()
    } else if (RETURN_STATUSES_SET.has(status)) {
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

  async requestDeletion(id: string, reason: string | null, requestedBy: string, requestedByName: string) {
    const { data, error } = await supabase
      .from('shipments')
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_requested_by: requestedBy,
        deletion_reason: reason,
        deletion_requested_by_name: requestedByName,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async cancelDeletionRequest(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .update({
        deletion_requested_at: null,
        deletion_requested_by: null,
        deletion_reason: null,
        deletion_requested_by_name: null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
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
    // Use server-side aggregation via RPC (no download-all-rows)
    const { data, error } = await supabase.rpc('get_shipment_stats', {
      p_organization_id: organizationId,
    })

    const stats: Record<string, number> = {
      total: 0,
    }

    if (!error && data) {
      for (const row of data) {
        stats[row.status] = Number(row.count)
        stats.total += Number(row.count)
      }
    }

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

import { supabase } from '@/lib/supabase'
import type { Client, ClientInsert, ClientUpdate } from '@/types/database'

export interface ClientFilters {
  status?: string
  boutiqueId?: string
  governorate?: string
  search?: string
}

export const clientsService = {
  async getAll(organizationId: string, filters?: ClientFilters) {
    let query = supabase
      .from('clients')
      .select(`
        *,
        boutique:boutiques(id, name, color)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.boutiqueId) {
      query = query.eq('boutique_id', filters.boutiqueId)
    }
    if (filters?.governorate) {
      query = query.eq('governorate', filters.governorate)
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        boutique:boutiques(id, name, color)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByPhone(phone: string, organizationId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('phone', phone)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async create(client: ClientInsert) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: ClientUpdate) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getStats(organizationId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('status')
      .eq('organization_id', organizationId)

    if (error) throw error

    const stats = {
      total: data.length,
      active: 0,
      vip: 0,
      inactive: 0,
      blocked: 0
    }

    data.forEach(c => {
      if (c.status in stats) {
        stats[c.status as keyof typeof stats]++
      }
    })

    return stats
  },

  async getTopClients(organizationId: string, limit = 10) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', organizationId)
      .order('total_orders', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}

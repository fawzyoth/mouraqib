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
    const PAGE_SIZE = 1000
    const allData: Client[] = []
    let from = 0

    while (true) {
      let query = supabase
        .from('clients')
        .select(`
          *,
          boutique:boutiques(id, name, color)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

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
      allData.push(...(data as Client[]))
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    return allData
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
    const statuses = ['active', 'vip', 'inactive', 'blocked'] as const
    const stats = { total: 0, active: 0, vip: 0, inactive: 0, blocked: 0 }

    const results = await Promise.all(
      statuses.map(status =>
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', status)
      )
    )

    for (let i = 0; i < statuses.length; i++) {
      const { count, error } = results[i]
      if (error) throw error
      const n = count ?? 0
      stats[statuses[i]] = n
      stats.total += n
    }

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

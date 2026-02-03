import { supabase } from '@/lib/supabase'
import type { Carrier, CarrierInsert, CarrierUpdate } from '@/types/database'

export const carriersService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    if (error) throw error
    return data
  },

  async getActive(organizationId: string) {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(carrier: CarrierInsert) {
    const { data, error } = await supabase
      .from('carriers')
      .insert(carrier)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: CarrierUpdate) {
    const { data, error } = await supabase
      .from('carriers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('carriers')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async updateApiStatus(id: string, status: 'connected' | 'disconnected' | 'error') {
    return this.update(id, { api_status: status })
  },

  async getCarriersForRegion(organizationId: string, governorate: string) {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .or(`all_regions.eq.true,regions.cs.{${governorate}}`)

    if (error) throw error
    return data
  }
}

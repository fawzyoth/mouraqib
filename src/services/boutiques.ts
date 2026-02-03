import { supabase } from '@/lib/supabase'
import type { Boutique, BoutiqueInsert, BoutiqueUpdate } from '@/types/database'

export const boutiquesService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('boutiques')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('boutiques')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getDefault(organizationId: string) {
    const { data, error } = await supabase
      .from('boutiques')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_default', true)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async create(boutique: BoutiqueInsert) {
    const { data, error } = await supabase
      .from('boutiques')
      .insert(boutique)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: BoutiqueUpdate) {
    const { data, error } = await supabase
      .from('boutiques')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('boutiques')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async setDefault(id: string, organizationId: string) {
    // First, unset all defaults
    await supabase
      .from('boutiques')
      .update({ is_default: false })
      .eq('organization_id', organizationId)

    // Then set the new default
    const { data, error } = await supabase
      .from('boutiques')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

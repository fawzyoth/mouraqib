import { supabase } from '@/lib/supabase'
import type { InvoiceInsert, InvoiceUpdate } from '@/types/database'

export const invoicesService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(invoice: InvoiceInsert) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: InvoiceUpdate) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

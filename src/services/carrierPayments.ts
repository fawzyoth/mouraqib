import { supabase } from '@/lib/supabase'
import type { CarrierPaymentInsert } from '@/types/database'

export const carrierPaymentsService = {
  async create(payment: CarrierPaymentInsert) {
    const { data, error } = await supabase
      .from('carrier_payments')
      .insert(payment)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll(organizationId: string) {
    const PAGE_SIZE = 1000
    const allData: any[] = []
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('carrier_payments')
        .select(`
          *,
          carrier:carriers(id, name)
        `)
        .eq('organization_id', organizationId)
        .order('payment_date', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      allData.push(...data)
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    return allData
  },

  async getShipments(carrierPaymentId: string) {
    const PAGE_SIZE = 1000
    const allData: any[] = []
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('carrier_payment_shipments')
        .select(`
          *,
          shipment:shipments(id, tracking_number, recipient_name, cod_amount, delivery_fee)
        `)
        .eq('carrier_payment_id', carrierPaymentId)
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      allData.push(...data)
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    return allData
  },

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'disputed', notes?: string) {
    const { data, error } = await supabase
      .from('carrier_payments')
      .update({ status, notes: notes || null })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

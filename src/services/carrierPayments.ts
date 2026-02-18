import { supabase } from '@/lib/supabase'

export const carrierPaymentsService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('carrier_payments')
      .select(`
        *,
        carrier:carriers(id, name)
      `)
      .eq('organization_id', organizationId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getShipments(carrierPaymentId: string) {
    const { data, error } = await supabase
      .from('carrier_payment_shipments')
      .select(`
        *,
        shipment:shipments(id, tracking_number, recipient_name, cod_amount, delivery_fee)
      `)
      .eq('carrier_payment_id', carrierPaymentId)

    if (error) throw error
    return data
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

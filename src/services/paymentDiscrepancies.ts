import { supabase } from '@/lib/supabase'

export const paymentDiscrepanciesService = {
  async getAll(organizationId: string) {
    const PAGE_SIZE = 1000
    const allData: any[] = []
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('payment_discrepancies')
        .select(`
          *,
          carrier:carriers(id, name),
          shipment:shipments(id, tracking_number, recipient_name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      allData.push(...data)
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    return allData
  },

  async updateStatus(id: string, status: 'pending' | 'resolved' | 'disputed', notes?: string) {
    const updates: Record<string, any> = { status, notes: notes || null }
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('payment_discrepancies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getStats(organizationId: string) {
    const stats = {
      ourTotal: 0,
      theirTotal: 0,
      totalDifference: 0,
      differencePercent: 0,
      totalPending: 0,
      pendingCount: 0,
      unexpectedFees: 0,
      unexpectedFeesCount: 0,
      recovered: 0,
    }

    const PAGE_SIZE = 1000
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('payment_discrepancies')
        .select('expected_amount, actual_amount, difference, status')
        .eq('organization_id', organizationId)
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error

      for (const d of data) {
        stats.ourTotal += d.expected_amount
        stats.theirTotal += d.actual_amount
        stats.totalDifference += Math.abs(d.difference)
        if (d.status === 'pending') {
          stats.totalPending += Math.abs(d.difference)
          stats.pendingCount++
        }
        if (d.difference < 0) {
          stats.unexpectedFees += Math.abs(d.difference)
          stats.unexpectedFeesCount++
        }
        if (d.status === 'resolved') {
          stats.recovered += Math.abs(d.difference)
        }
      }

      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    stats.differencePercent = stats.ourTotal > 0
      ? Math.round((stats.totalDifference / stats.ourTotal) * 100 * 10) / 10
      : 0

    return stats
  },
}

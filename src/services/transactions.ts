import { supabase } from '@/lib/supabase'
import type { Transaction, OrganizationCredits } from '@/types/database'

export interface TransactionFilters {
  type?: 'credit' | 'debit'
  dateFrom?: string
  dateTo?: string
}

export const transactionsService = {
  async getAll(organizationId: string, filters?: TransactionFilters) {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getCredits(organizationId: string) {
    const { data, error } = await supabase
      .from('organization_credits')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Add credits via the process-recharge Edge Function.
   * This is atomic — no race conditions on concurrent calls.
   */
  async addCredit(
    organizationId: string,
    createdBy: string,
    amount: number,
    purchasedDelivered: number,
    purchasedReturned: number,
    paymentMethod: 'cash' | 'transfer' | 'cheque',
    note?: string
  ) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await supabase.functions.invoke('process-recharge', {
      body: {
        organizationId,
        amount,
        purchasedDelivered,
        purchasedReturned,
        paymentMethod,
        note,
      },
    })

    if (response.error) {
      throw new Error(response.error.message ?? 'Failed to process recharge')
    }

    return response.data
  },

  // Note: chargeDelivery() and incrementUnbilled() have been removed.
  // Billing is now handled automatically by the hourly sync-and-bill cron job.
  // The cron finds shipments with status 'delivered' or 'returned' that have
  // billed_at IS NULL, debits credits atomically, and marks them as billed.

  async getBalance(organizationId: string) {
    const { data, error } = await supabase
      .from('organization_credits')
      .select('balance, delivered_credits, returned_credits, unbilled_delivered, unbilled_returned')
      .eq('organization_id', organizationId)
      .single()

    if (error) throw error
    return data
  },

  async getSummary(organizationId: string) {
    const credits = await this.getCredits(organizationId)
    const { data: transactions } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('organization_id', organizationId)

    const summary = {
      totalCredits: 0,
      totalDebits: 0,
      currentBalance: credits?.balance ?? 0,
      deliveredCredits: credits?.delivered_credits ?? 0,
      returnedCredits: credits?.returned_credits ?? 0,
      unbilledDelivered: credits?.unbilled_delivered ?? 0,
      unbilledReturned: credits?.unbilled_returned ?? 0
    }

    transactions?.forEach(t => {
      if (t.type === 'credit') {
        summary.totalCredits += t.amount
      } else {
        summary.totalDebits += t.amount
      }
    })

    return summary
  }
}

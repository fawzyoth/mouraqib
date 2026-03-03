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

  /**
   * Add a manual debit (charge) against an organization's credits.
   *
   * Since there is no dedicated Edge Function for debits, this performs two
   * sequential operations: a Supabase insert into `transactions` with
   * type 'debit', followed by a read-then-write update on
   * `organization_credits` to decrement the balance and credit counters.
   *
   * For true atomicity a DB function (like process_recharge) is preferred;
   * this can be upgraded later if needed.
   *
   * The caller is responsible for computing `amount` (e.g. from delivery
   * fees x counts) before invoking this method.
   */
  async addDebit(
    organizationId: string,
    createdBy: string,
    amount: number,
    billedDelivered: number,
    billedReturned: number,
    note?: string
  ) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // 1. Insert the debit transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        organization_id: organizationId,
        created_by: createdBy,
        type: 'debit' as const,
        amount,
        billed_delivered: billedDelivered,
        billed_returned: billedReturned,
        note: note ?? null,
      })
      .select()
      .single()

    if (txError) throw txError

    // 2. Read current credits then write decremented values
    const { data: current, error: fetchError } = await supabase
      .from('organization_credits')
      .select('balance, delivered_credits, returned_credits')
      .eq('organization_id', organizationId)
      .single()

    if (fetchError) throw fetchError

    const { error: updateError } = await supabase
      .from('organization_credits')
      .update({
        balance: (current.balance ?? 0) - amount,
        delivered_credits: Math.max(0, (current.delivered_credits ?? 0) - billedDelivered),
        returned_credits: Math.max(0, (current.returned_credits ?? 0) - billedReturned),
      })
      .eq('organization_id', organizationId)

    if (updateError) throw updateError

    return transaction
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

  /**
   * Fetch recent transactions across all organizations (admin only).
   * Joins with organizations to get the company name.
   */
  async getRecentTransactions(limit = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, organization:organizations(name)')
      .order('created_at', { ascending: false })
      .limit(limit)

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

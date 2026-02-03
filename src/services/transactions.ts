import { supabase } from '@/lib/supabase'
import type { Transaction, TransactionInsert, OrganizationCredits } from '@/types/database'

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

  async addCredit(
    organizationId: string,
    createdBy: string,
    amount: number,
    purchasedDelivered: number,
    purchasedReturned: number,
    paymentMethod: 'cash' | 'transfer' | 'cheque',
    note?: string
  ) {
    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        organization_id: organizationId,
        created_by: createdBy,
        type: 'credit',
        amount,
        purchased_delivered: purchasedDelivered,
        purchased_returned: purchasedReturned,
        payment_method: paymentMethod,
        note
      })
      .select()
      .single()

    if (txError) throw txError

    // Update organization credits
    const { data: currentCredits } = await supabase
      .from('organization_credits')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (currentCredits) {
      await supabase
        .from('organization_credits')
        .update({
          delivered_credits: currentCredits.delivered_credits + purchasedDelivered,
          returned_credits: currentCredits.returned_credits + purchasedReturned,
          balance: currentCredits.balance + amount
        })
        .eq('organization_id', organizationId)
    }

    return transaction
  },

  async chargeDelivery(
    organizationId: string,
    createdBy: string,
    deliveredCount: number,
    returnedCount: number,
    deliveredFee: number,
    returnedFee: number,
    note?: string
  ) {
    const amount = (deliveredCount * deliveredFee) + (returnedCount * returnedFee)

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        organization_id: organizationId,
        created_by: createdBy,
        type: 'debit',
        amount,
        billed_delivered: deliveredCount,
        billed_returned: returnedCount,
        note
      })
      .select()
      .single()

    if (txError) throw txError

    // Update organization credits
    const { data: currentCredits } = await supabase
      .from('organization_credits')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (currentCredits) {
      await supabase
        .from('organization_credits')
        .update({
          delivered_credits: Math.max(0, currentCredits.delivered_credits - deliveredCount),
          returned_credits: Math.max(0, currentCredits.returned_credits - returnedCount),
          unbilled_delivered: Math.max(0, currentCredits.unbilled_delivered - deliveredCount),
          unbilled_returned: Math.max(0, currentCredits.unbilled_returned - returnedCount),
          balance: currentCredits.balance - amount
        })
        .eq('organization_id', organizationId)
    }

    return transaction
  },

  async incrementUnbilled(organizationId: string, type: 'delivered' | 'returned') {
    const { data: currentCredits } = await supabase
      .from('organization_credits')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (currentCredits) {
      const updates = type === 'delivered'
        ? { unbilled_delivered: currentCredits.unbilled_delivered + 1 }
        : { unbilled_returned: currentCredits.unbilled_returned + 1 }

      await supabase
        .from('organization_credits')
        .update(updates)
        .eq('organization_id', organizationId)
    }
  },

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
    const { data: credits } = await this.getCredits(organizationId)
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

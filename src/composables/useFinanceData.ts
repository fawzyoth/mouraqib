import { ref, type Ref } from 'vue'
import { transactionsService, invoicesService } from '@/services'
import { supabase } from '@/lib/supabase'
import { useToast } from './useToast'
import { CREDIT_PRICE_DELIVERED, CREDIT_PRICE_RETURNED } from '@/data/pricing'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useFinanceData(orgId: Ref<string>) {
  const userBalance = ref({ delivered: 0, returned: 0 })
  const invoices = ref<any[]>([])
  const payments = ref<any[]>([])
  const isLoading = ref(false)
  const toast = useToast()
  let creditsChannel: RealtimeChannel | null = null

  async function load() {
    if (!orgId.value) return
    isLoading.value = true
    try {
      const [credits, invoiceRows, paymentRows] = await Promise.all([
        transactionsService.getCredits(orgId.value),
        invoicesService.getAll(orgId.value),
        supabase
          .from('service_payments')
          .select('*')
          .eq('organization_id', orgId.value)
          .order('date', { ascending: false })
          .then(({ data, error }) => {
            if (error) throw error
            return data || []
          }),
      ])

      if (credits) {
        userBalance.value = {
          delivered: credits.delivered_credits || 0,
          returned: credits.returned_credits || 0,
        }
      }

      invoices.value = invoiceRows.map((inv: any) => ({
        id: inv.id,
        number: inv.number,
        type: inv.type,
        party: inv.party_name,
        amount: inv.amount,
        status: inv.status,
        dueDate: inv.due_date,
        paidAt: inv.paid_at,
        createdAt: inv.created_at,
      }))

      payments.value = paymentRows.map((p: any) => ({
        id: p.id,
        date: new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        description: p.description || '',
        reference: p.reference || '',
        amount: p.amount,
        status: p.status,
      }))
    } catch (e: any) {
      toast.error('Erreur chargement finances: ' + (e.message || e))
    } finally {
      isLoading.value = false
    }
  }

  async function processRecharge(form: { delivered: number; returned: number; paymentMethod: string }, userId: string): Promise<boolean> {
    try {
      const amount = form.delivered * CREDIT_PRICE_DELIVERED + form.returned * CREDIT_PRICE_RETURNED
      await transactionsService.addCredit(
        orgId.value,
        userId,
        amount,
        form.delivered,
        form.returned,
        form.paymentMethod as 'cash' | 'transfer' | 'cheque',
      )
      // Refresh credits
      const credits = await transactionsService.getCredits(orgId.value)
      if (credits) {
        userBalance.value = {
          delivered: credits.delivered_credits || 0,
          returned: credits.returned_credits || 0,
        }
      }
      toast.success('Recharge effectuée')
      return true
    } catch (e: any) {
      toast.error('Erreur recharge: ' + (e.message || e))
      return false
    }
  }

  function subscribeToCredits() {
    if (!orgId.value) return
    creditsChannel = supabase
      .channel(`credits:${orgId.value}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'organization_credits',
          filter: `organization_id=eq.${orgId.value}`,
        },
        (payload: any) => {
          if (payload.new) {
            userBalance.value = {
              delivered: payload.new.delivered_credits || 0,
              returned: payload.new.returned_credits || 0,
            }
          }
        }
      )
      .subscribe()
  }

  function unsubscribe() {
    if (creditsChannel) {
      creditsChannel.unsubscribe()
      creditsChannel = null
    }
  }

  return { userBalance, invoices, payments, isLoading, load, processRecharge, subscribeToCredits, unsubscribe }
}

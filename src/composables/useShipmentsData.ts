import { ref, type Ref } from 'vue'
import { shipmentsService } from '@/services'
import { dbShipmentToUI, uiShipmentToInsert, STATUS_UI_TO_DB } from '@/mappers/shipments'
import type { UIShipment } from '@/mappers/shipments'
import { useToast } from './useToast'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface OrgContext {
  name: string
  address: string
  phone: string
}

export function useShipmentsData(orgId: Ref<string>) {
  const shipments = ref<UIShipment[]>([])
  const isLoading = ref(false)
  const toast = useToast()
  let realtimeChannel: RealtimeChannel | null = null

  async function load(orgContext: OrgContext) {
    if (!orgId.value) return
    isLoading.value = true
    try {
      const rows = await shipmentsService.getAll(orgId.value)
      shipments.value = rows.map((row: any) => dbShipmentToUI(row, orgContext))
    } catch (e: any) {
      toast.error('Erreur chargement colis: ' + (e.message || e))
    } finally {
      isLoading.value = false
    }
  }

  async function create(
    form: Record<string, any>,
    orgContext: OrgContext,
    userId: string | null,
    carrierId: string | null
  ): Promise<UIShipment | null> {
    if (!orgId.value) {
      toast.error('Organisation introuvable — veuillez vous reconnecter')
      return null
    }
    try {
      const insert = uiShipmentToInsert(form, orgId.value, userId, carrierId)
      const row = await shipmentsService.create(insert)

      // Add initial event
      await shipmentsService.addEvent(row.id, 'pending', 'Commande en attente de ramassage', 'Tunisie')

      const uiShipment = dbShipmentToUI(row as any, orgContext)
      uiShipment.events = [{
        status: 'Informations reçues',
        description: 'Commande en attente de ramassage',
        location: 'Tunisie',
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
          + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        completed: true,
      }]
      shipments.value.unshift(uiShipment)
      toast.success('Colis créé')
      return uiShipment
    } catch (e: any) {
      toast.error('Erreur création colis: ' + (e.message || e))
      return null
    }
  }

  async function updateStatus(id: string, newUiStatus: string): Promise<boolean> {
    const dbStatus = STATUS_UI_TO_DB[newUiStatus] || newUiStatus
    try {
      await shipmentsService.updateStatus(id, dbStatus as any)
      const index = shipments.value.findIndex(s => s.id === id)
      if (index !== -1) {
        shipments.value[index] = { ...shipments.value[index], status: newUiStatus }
      }
      return true
    } catch (e: any) {
      toast.error('Erreur mise à jour statut: ' + (e.message || e))
      return false
    }
  }

  function subscribe(orgContext: OrgContext) {
    if (!orgId.value) return
    realtimeChannel = shipmentsService.subscribeToChanges(orgId.value, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newShipment = dbShipmentToUI(payload.new as any, orgContext)
        // Only add if not already present (avoid duplicate from own create)
        if (!shipments.value.find(s => s.id === newShipment.id)) {
          shipments.value.unshift(newShipment)
        }
      } else if (payload.eventType === 'UPDATE') {
        const updated = dbShipmentToUI(payload.new as any, orgContext)
        const index = shipments.value.findIndex(s => s.id === updated.id)
        if (index !== -1) {
          // Preserve events
          updated.events = shipments.value[index].events
          shipments.value[index] = updated
        }
      } else if (payload.eventType === 'DELETE') {
        shipments.value = shipments.value.filter(s => s.id !== payload.old.id)
      }
    })
  }

  function unsubscribe() {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe()
      realtimeChannel = null
    }
  }

  return { shipments, isLoading, load, create, updateStatus, subscribe, unsubscribe }
}

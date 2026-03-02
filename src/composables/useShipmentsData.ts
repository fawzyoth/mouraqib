import { ref, type Ref } from 'vue'
import { supabase } from '@/lib/supabase'
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
    carrierId: string | null,
    carrierApiStatus?: string
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

      // If carrier API is connected, send to carrier-proxy to get real tracking number
      console.log('[create-shipment] carrierId:', carrierId, 'carrierApiStatus:', carrierApiStatus)
      if (carrierId && carrierApiStatus === 'connected') {
        try {
          const { data, error } = await supabase.functions.invoke('carrier-proxy', {
            body: {
              carrierId,
              action: 'create-shipment',
              payload: {
                shipmentId: row.id,
                clientName: form.customerName,
                governorate: form.gouvernorat,
                city: form.delegation || form.gouvernorat,
                address: form.address,
                phone: form.phone,
                phone2: form.phoneSecondary || undefined,
                price: (form.productPrice || 0) + (form.deliveryFee || 0),
                designation: form.productName + (form.description ? ` - ${form.description}` : ''),
                article: form.productName || undefined,
                articleCount: 1,
                comment: form.reference || undefined,
                exchangeCount: form.type === 'exchange' ? (form.exchangeItemCount || 1) : undefined,
              },
            },
          })

          if (!error && data?.result) {
            const result = data.result
            if (result.carrierTrackingNumber) {
              uiShipment.trackingNumber = result.carrierTrackingNumber
            }
            if (result.printUrl) {
              uiShipment.labelUrl = result.printUrl
            }
            toast.success('Colis envoyé au transporteur')
          } else if (error) {
            // FunctionsHttpError stores the raw Response in error.context
            let detail = ''
            try {
              const response = (error as any).context
              if (response && typeof response.json === 'function') {
                const body = await response.json()
                detail = body?.error || body?.detail || JSON.stringify(body)
              }
            } catch { /* ignore */ }
            console.error('[carrier-proxy] create-shipment error:', error.message, detail)
            toast.warning(detail || 'Colis créé localement, mais non envoyé au transporteur')
          }
        } catch (proxyErr: any) {
          console.error('[carrier-proxy] create-shipment failed:', proxyErr)
          toast.warning('Colis créé localement, mais non envoyé au transporteur')
        }
      }

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

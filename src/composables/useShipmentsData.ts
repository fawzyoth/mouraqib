import { ref, type Ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { shipmentsService, clientsService } from '@/services'
import { dbShipmentToUI, uiShipmentToInsert } from '@/mappers/shipments'
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
      // Auto-create client if no existing client was selected
      if (!form.clientId && form.phone) {
        const existing = await clientsService.getByPhone(form.phone, orgId.value)
        if (existing) {
          form.clientId = existing.id
        } else {
          const newClient = await clientsService.create({
            organization_id: orgId.value,
            name: form.customerName,
            phone: form.phone,
            phone_secondary: form.phoneSecondary || null,
            address: form.address || null,
            governorate: form.gouvernorat || null,
            delegation: form.delegation || null,
            locality: form.locality || null,
            postal_code: form.postalCode || null,
            status: 'active',
          })
          form.clientId = newClient.id
        }
      }

      // Build carrier-proxy payload (shared between carrier-first and legacy paths)
      const carrierPayload = {
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
      }

      // ── Carrier-first: call carrier API before DB insert ──
      let carrierData: { carrier_tracking_number?: string; label_url?: string; status?: string } | undefined
      const isFirstDelivery = (form.carrier || '').toLowerCase().includes('first delivery')

      if (carrierId) {
        try {
          const { data, error } = await supabase.functions.invoke('carrier-proxy', {
            body: {
              carrierId,
              action: 'create-shipment',
              payload: carrierPayload, // no shipmentId → carrier-first path
            },
          })

          if (error || !data?.result) {
            // Extract error detail for toast
            let detail = ''
            try {
              const response = (error as any)?.context
              if (response && typeof response.json === 'function') {
                const body = await response.json()
                detail = body?.error || body?.detail || JSON.stringify(body)
              }
            } catch { /* ignore */ }
            console.error('[carrier-proxy] create-shipment error:', error?.message, detail)
            toast.error(detail || 'Erreur transporteur — colis non créé')
            return null
          }

          const result = data.result
          carrierData = {
            carrier_tracking_number: result.carrierTrackingNumber,
            label_url: result.printUrl || undefined,
            status: result.status,
          }
        } catch (proxyErr: any) {
          console.error('[carrier-proxy] create-shipment failed:', proxyErr)
          toast.error('Erreur transporteur — colis non créé')
          return null
        }
      }

      // ── Insert into DB (with carrier data if available) ──
      const insert = uiShipmentToInsert(form, orgId.value, userId, carrierId, carrierData)
      const row = await shipmentsService.create(insert)

      // Add initial event
      const eventStatus = carrierData?.status || 'En attente'
      shipmentsService.addEvent(row.id, eventStatus, 'Commande en attente de ramassage', 'Tunisie').catch(console.error)

      toast.success('Colis créé')

      // ── Post-insert: auto-pickup for First Delivery (fire-and-forget) ──
      if (carrierId && carrierData && isFirstDelivery) {
        supabase.functions.invoke('carrier-proxy', {
          body: {
            carrierId,
            action: 'create-shipment',
            payload: {
              shipmentId: row.id,
              skipCarrierCreate: true,
              carrierTrackingNumber: carrierData.carrier_tracking_number,
              ...carrierPayload,
            },
          },
        }).catch((err: any) => {
          console.error('[carrier-proxy] auto-pickup failed:', err)
        })
      }

      // Return a UI shipment for the success screen (list is handled by realtime)
      const enrichedRow = {
        ...row,
        carrier: carrierId ? { name: form.carrier || 'Non assigné' } : null,
        client: form.clientId ? { name: form.customerName || '-' } : null,
      }
      return dbShipmentToUI(enrichedRow as any, orgContext)
    } catch (e: any) {
      toast.error('Erreur création colis: ' + (e.message || e))
      return null
    }
  }

  async function markAsPrinted(ids: string[]): Promise<boolean> {
    try {
      const now = new Date().toISOString()
      for (const id of ids) {
        await shipmentsService.update(id, { label_printed: true, label_printed_at: now })
        const index = shipments.value.findIndex(s => s.id === id)
        if (index !== -1) {
          shipments.value[index] = { ...shipments.value[index], labelPrinted: true, labelPrintedAt: now }
        }
      }
      return true
    } catch (e: any) {
      toast.error('Erreur mise à jour impression: ' + (e.message || e))
      return false
    }
  }

  async function updateStatus(id: string, newUiStatus: string): Promise<boolean> {
    try {
      await shipmentsService.updateStatus(id, newUiStatus)
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

  async function markAsOutScanned(ids: string[]): Promise<boolean> {
    try {
      const now = new Date().toISOString()
      for (const id of ids) {
        // Update DB
        await shipmentsService.update(id, { out_scanned_at: now })
        // Add event for history
        await shipmentsService.addEvent(id, 'Colis scanné', 'Colis scanné et prêt pour pickup')
        // Update local state
        const index = shipments.value.findIndex(s => s.id === id)
        if (index !== -1) {
          shipments.value[index] = { ...shipments.value[index], outScannedAt: now }
        }
      }
      return true
    } catch (e: any) {
      toast.error('Erreur lors du scan: ' + (e.message || e))
      return false
    }
  }

  async function markAsInScanned(ids: string[]): Promise<boolean> {
    try {
      const now = new Date().toISOString()
      for (const id of ids) {
        await shipmentsService.update(id, { in_scanned_at: now })
        await shipmentsService.addEvent(id, 'Retour scanné', 'Colis scanné pour retour')
        const index = shipments.value.findIndex(s => s.id === id)
        if (index !== -1) {
          shipments.value[index] = { ...shipments.value[index], inScannedAt: now }
        }
      }
      return true
    } catch (e: any) {
      toast.error('Erreur lors du scan: ' + (e.message || e))
      return false
    }
  }

  async function requestDeletion(id: string, reason: string | null, userId: string, userName: string): Promise<boolean> {
    try {
      await shipmentsService.requestDeletion(id, reason, userId, userName)
      const index = shipments.value.findIndex(s => s.id === id)
      if (index !== -1) {
        shipments.value[index] = {
          ...shipments.value[index],
          deletionRequestedAt: new Date().toISOString(),
          deletionRequestedBy: userId,
          deletionReason: reason,
          deletionRequestedByName: userName,
        }
      }
      toast.success('Demande de suppression envoyée')
      return true
    } catch (e: any) {
      toast.error('Erreur demande de suppression: ' + (e.message || e))
      return false
    }
  }

  async function cancelDeletionRequest(id: string): Promise<boolean> {
    try {
      await shipmentsService.cancelDeletionRequest(id)
      const index = shipments.value.findIndex(s => s.id === id)
      if (index !== -1) {
        shipments.value[index] = {
          ...shipments.value[index],
          deletionRequestedAt: null,
          deletionRequestedBy: null,
          deletionReason: null,
          deletionRequestedByName: null,
        }
      }
      toast.success('Demande de suppression annulée')
      return true
    } catch (e: any) {
      toast.error('Erreur annulation: ' + (e.message || e))
      return false
    }
  }

  function subscribe(orgContext: OrgContext, carriers?: Ref<{ id: string; name: string }[]>, clients?: Ref<{ id: string; name: string }[]>) {
    if (!orgId.value) return
    realtimeChannel = shipmentsService.subscribeToChanges(orgId.value, (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const raw = payload.new as any
        // Realtime payload is flat — enrich with carrier/client from existing frontend data
        if (raw.carrier_id && carriers?.value) {
          const c = carriers.value.find(c => c.id === raw.carrier_id)
          if (c) raw.carrier = { id: c.id, name: c.name }
        }
        if (raw.client_id && clients?.value) {
          const cl = clients.value.find(cl => cl.id === raw.client_id)
          if (cl) raw.client = { id: cl.id, name: cl.name }
        }
        const newShipment = dbShipmentToUI(raw, orgContext)
        // Only add if not already present (avoid duplicate from own create)
        if (!shipments.value.find(s => s.id === newShipment.id)) {
          shipments.value.unshift(newShipment)
        }
      } else if (payload.eventType === 'UPDATE') {
        const raw = payload.new as any
        const index = shipments.value.findIndex(s => s.id === raw.id)
        if (index !== -1) {
          // Realtime payload is a flat row without joins (no carrier, client, boutique).
          // Merge only scalar fields into the existing enriched object.
          const existing = shipments.value[index]
          const patched = dbShipmentToUI({ ...raw, carrier: null, client: null, boutique: null, pickup: null }, orgContext)
          shipments.value[index] = {
            ...existing,
            trackingNumber: patched.trackingNumber,
            labelUrl: raw.label_url || existing.labelUrl,
            status: patched.status,
            lastSyncedAt: patched.lastSyncedAt,
            updatedAt: patched.updatedAt,
            deliveredAt: patched.deliveredAt,
            returnedAt: patched.returnedAt,
            billedAt: patched.billedAt,
            deletionRequestedAt: patched.deletionRequestedAt,
            deletionRequestedBy: patched.deletionRequestedBy,
            deletionReason: patched.deletionReason,
            deletionRequestedByName: patched.deletionRequestedByName,
          }
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

  return { shipments, isLoading, load, create, markAsPrinted, markAsOutScanned, markAsInScanned, updateStatus, requestDeletion, cancelDeletionRequest, subscribe, unsubscribe }
}

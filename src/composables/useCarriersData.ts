import { ref, type Ref } from 'vue'
import { carriersService } from '@/services'
import { dbCarrierToUI, uiCarrierToInsert, uiCarrierToUpdate } from '@/mappers/carriers'
import type { UICarrier } from '@/mappers/carriers'
import { useToast } from './useToast'

export function useCarriersData(orgId: Ref<string>) {
  const carriers = ref<UICarrier[]>([])
  const isLoading = ref(false)
  const toast = useToast()

  async function load() {
    if (!orgId.value) return
    isLoading.value = true
    try {
      const rows = await carriersService.getAll(orgId.value)
      carriers.value = rows.map(dbCarrierToUI)
    } catch (e: any) {
      toast.error('Erreur chargement transporteurs: ' + (e.message || e))
    } finally {
      isLoading.value = false
    }
  }

  async function create(formData: Record<string, any>): Promise<UICarrier | null> {
    try {
      const insert = uiCarrierToInsert(formData, orgId.value)
      const row = await carriersService.create(insert)
      const uiCarrier = dbCarrierToUI(row)
      carriers.value.push(uiCarrier)
      toast.success('Transporteur ajouté')
      return uiCarrier
    } catch (e: any) {
      toast.error('Erreur ajout transporteur: ' + (e.message || e))
      return null
    }
  }

  async function update(id: string, formData: Record<string, any>): Promise<UICarrier | null> {
    try {
      const updates = uiCarrierToUpdate(formData)
      const row = await carriersService.update(id, updates)
      const uiCarrier = dbCarrierToUI(row)
      const index = carriers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        // Preserve computed stats
        uiCarrier.shipments = carriers.value[index].shipments
        uiCarrier.delivered = carriers.value[index].delivered
        uiCarrier.deliveryRate = carriers.value[index].deliveryRate
        uiCarrier.avgTime = carriers.value[index].avgTime
        carriers.value[index] = uiCarrier
      }
      toast.success('Transporteur mis à jour')
      return uiCarrier
    } catch (e: any) {
      toast.error('Erreur mise à jour transporteur: ' + (e.message || e))
      return null
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await carriersService.delete(id)
      carriers.value = carriers.value.filter(c => c.id !== id)
      toast.success('Transporteur supprimé')
      return true
    } catch (e: any) {
      toast.error('Erreur suppression transporteur: ' + (e.message || e))
      return false
    }
  }

  return { carriers, isLoading, load, create, update, remove }
}

import { ref, type Ref } from 'vue'
import { pickupsService } from '@/services'
import { dbPickupToUI, uiPickupToInsert } from '@/mappers/pickups'
import type { UIPickup } from '@/mappers/pickups'
import { useToast } from './useToast'

export function usePickupsData(orgId: Ref<string>) {
  const pickupRequests = ref<UIPickup[]>([])
  const pickupHistory = ref<UIPickup[]>([])
  const scheduledPickups = ref<UIPickup[]>([])
  const isLoading = ref(false)
  const toast = useToast()

  async function load() {
    if (!orgId.value) return
    isLoading.value = true
    try {
      const rows = await pickupsService.getAll(orgId.value)
      const all = rows.map((r: any) => dbPickupToUI(r))

      pickupRequests.value = all.filter(p => p.status === 'pending' || p.status === 'confirmed')
      pickupHistory.value = all.filter(p => p.status === 'completed' || p.status === 'cancelled' || p.status === 'failed')
      scheduledPickups.value = all.filter(p => p.status === 'confirmed')
    } catch (e: any) {
      toast.error('Erreur chargement enlèvements: ' + (e.message || e))
    } finally {
      isLoading.value = false
    }
  }

  async function create(form: Record<string, any>, carrierId: string | null): Promise<UIPickup | null> {
    try {
      const insert = uiPickupToInsert(form, orgId.value, carrierId)
      const row = await pickupsService.create(insert)
      const uiPickup = dbPickupToUI(row as any)
      pickupRequests.value.unshift(uiPickup)
      toast.success('Enlèvement programmé')
      return uiPickup
    } catch (e: any) {
      toast.error('Erreur programmation enlèvement: ' + (e.message || e))
      return null
    }
  }

  async function updateStatus(id: string, status: string): Promise<boolean> {
    try {
      await pickupsService.updateStatus(id, status as any)
      // Move between lists based on new status
      const allLists = [...pickupRequests.value, ...pickupHistory.value, ...scheduledPickups.value]
      const pickup = allLists.find(p => p.id === id)
      if (pickup) {
        pickup.status = status
        // Re-split
        const active = allLists.filter(p => p.status === 'pending' || p.status === 'confirmed')
        const history = allLists.filter(p => p.status === 'completed' || p.status === 'cancelled' || p.status === 'failed')
        const scheduled = allLists.filter(p => p.status === 'confirmed')
        pickupRequests.value = active
        pickupHistory.value = history
        scheduledPickups.value = scheduled
      }
      return true
    } catch (e: any) {
      toast.error('Erreur mise à jour enlèvement: ' + (e.message || e))
      return false
    }
  }

  return { pickupRequests, pickupHistory, scheduledPickups, isLoading, load, create, updateStatus }
}

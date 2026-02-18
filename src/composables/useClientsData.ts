import { ref, type Ref } from 'vue'
import { clientsService } from '@/services'
import { dbClientToUI, uiClientToInsert } from '@/mappers/clients'
import type { UIClient } from '@/mappers/clients'
import { useToast } from './useToast'

export function useClientsData(orgId: Ref<string>) {
  const clientsList = ref<UIClient[]>([])
  const clientStats = ref({
    totalClients: 0,
    activeClients: 0,
    vipClients: 0,
    inactiveClients: 0,
    blockedClients: 0,
  })
  const isLoading = ref(false)
  const toast = useToast()

  async function load() {
    if (!orgId.value) return
    isLoading.value = true
    try {
      const [rows, stats] = await Promise.all([
        clientsService.getAll(orgId.value),
        clientsService.getStats(orgId.value),
      ])
      clientsList.value = rows.map(dbClientToUI)
      clientStats.value = {
        totalClients: stats.total || 0,
        activeClients: stats.active || 0,
        vipClients: stats.vip || 0,
        inactiveClients: stats.inactive || 0,
        blockedClients: stats.blocked || 0,
      }
    } catch (e: any) {
      toast.error('Erreur chargement clients: ' + (e.message || e))
    } finally {
      isLoading.value = false
    }
  }

  async function create(formData: Record<string, any>): Promise<UIClient | null> {
    if (!orgId.value) {
      toast.error('Organisation introuvable — veuillez vous reconnecter')
      return null
    }
    try {
      const insert = uiClientToInsert(formData, orgId.value)
      const row = await clientsService.create(insert)
      const uiClient = dbClientToUI(row)
      clientsList.value.push(uiClient)
      clientStats.value.totalClients++
      clientStats.value.activeClients++
      toast.success('Client ajouté')
      return uiClient
    } catch (e: any) {
      toast.error('Erreur ajout client: ' + (e.message || e))
      return null
    }
  }

  async function updateStatus(id: string, newStatus: 'active' | 'vip' | 'inactive' | 'blocked'): Promise<boolean> {
    try {
      await clientsService.update(id, { status: newStatus })
      const index = clientsList.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clientsList.value[index] = { ...clientsList.value[index], status: newStatus }
      }
      return true
    } catch (e: any) {
      toast.error('Erreur mise à jour statut: ' + (e.message || e))
      return false
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await clientsService.delete(id)
      clientsList.value = clientsList.value.filter(c => c.id !== id)
      clientStats.value.totalClients--
      toast.success('Client supprimé')
      return true
    } catch (e: any) {
      toast.error('Erreur suppression client: ' + (e.message || e))
      return false
    }
  }

  return { clientsList, clientStats, isLoading, load, create, updateStatus, remove }
}

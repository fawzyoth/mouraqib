import { ref, type Ref } from 'vue'
import { boutiquesService } from '@/services'
import type { Boutique as DBBoutique, BoutiqueInsert } from '@/types/database'
import type { Boutique } from '@/types/delivery-tracker'
import { useToast } from './useToast'

function dbBoutiqueToUI(row: DBBoutique): Boutique {
  const initials = row.name
    .split(' ')
    .map(w => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    initials: initials || 'B',
    color: row.color,
  }
}

export function useBoutiquesData(orgId: Ref<string>) {
  const boutiques = ref<Boutique[]>([])
  const isLoading = ref(false)
  const toast = useToast()

  async function load() {
    if (!orgId.value) return
    isLoading.value = true
    try {
      const rows = await boutiquesService.getAll(orgId.value)
      boutiques.value = rows.map(dbBoutiqueToUI)
    } catch (e: any) {
      toast.error('Erreur chargement boutiques: ' + (e.message || e))
    } finally {
      isLoading.value = false
    }
  }

  async function create(formData: Record<string, any>): Promise<Boutique | null> {
    try {
      const insert: BoutiqueInsert = {
        organization_id: orgId.value,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        governorate: formData.governorate || null,
        color: formData.color || '#f97316',
      }
      const row = await boutiquesService.create(insert)
      const uiBoutique = dbBoutiqueToUI(row)
      boutiques.value.push(uiBoutique)
      toast.success('Boutique créée')
      return uiBoutique
    } catch (e: any) {
      toast.error('Erreur création boutique: ' + (e.message || e))
      return null
    }
  }

  return { boutiques, isLoading, load, create }
}

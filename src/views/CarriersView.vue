<template>
  <!-- Carriers: Connected -->
  <ConnectedCarriers
    v-if="activeSection === 'connected-carriers'"
    :carriers="appStore.carriers"
    :selected-carrier="selectedCarrier"
    :delivery-carriers-count="deliveryCarriersCount"
    :syncing-carrier-id="syncingCarrierId"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @navigate="navigateTo"
    @select-carrier="selectCarrier"
    @edit-carrier="editCarrier"
    @delete-carrier="deleteCarrier"
    @sync-carrier="syncCarrier"
  />

  <!-- Carriers: Add Carrier -->
  <AddCarrier
    v-else-if="activeSection === 'add-carrier'"
    :editing-carrier="editingCarrier"
    :new-carrier="newCarrier"
    :carrier-wizard-step="carrierWizardStep"
    :show-api-key="showApiKey"
    :modal-carrier-search-query="modalCarrierSearchQuery"
    :selected-modal-carrier="selectedModalCarrier"
    :filtered-modal-carriers="filteredModalCarriers"
    :gouvernorats="gouvernorats"
    :sync-steps="carrierSyncSteps"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @update:carrierWizardStep="carrierWizardStep = $event"
    @update:modalCarrierSearchQuery="modalCarrierSearchQuery = $event"
    @update:showApiKey="showApiKey = $event"
    @update:newCarrierField="(field: string, value: any) => ((newCarrier as any)[field] = value)"
    @select-carrier-from-list="selectCarrierFromList"
    @toggle-all-regions="newCarrier.allRegions = !newCarrier.allRegions"
    @select-all-regions="selectAllRegions"
    @clear-all-regions="clearAllRegions"
    @toggle-region="toggleRegion"
    @close="editingCarrier = null; carrierSyncSteps = []; resetNewCarrierForm(); navigateTo('connected-carriers')"
    @save="saveCarrierFromPage"
  />

  <!-- Add Carrier Modal -->
  <AddCarrierModal
    :show="showAddCarrierModal"
    :editing-carrier="editingCarrier"
    :available-carriers="availableCarriers"
    :governorats="gouvernorats"
    @close="closeCarrierModal"
    @save="saveCarrier"
  />
</template>

<script setup lang="ts">
import { computed, ref, reactive, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { subSectionRoutes } from '@/composables/useNavigation'
import { deliveryCarriers } from '@/data/carriers-catalog'
import zonesData from '@/data/zones-first'
import { carriersService } from '@/services'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

// Feature components
import ConnectedCarriers from '@/components/features/carriers/ConnectedCarriers.vue'
import AddCarrier from '@/components/features/carriers/AddCarrier.vue'

// Modal components
import AddCarrierModal from '@/components/modals/AddCarrierModal.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const toast = useToast()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

function navigateTo(subSection: string) {
  const routeInfo = subSectionRoutes[subSection]
  if (routeInfo) router.push(routeInfo.path)
}

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

const selectedCarrier = ref<any>(null)
const syncingCarrierId = ref<string | null>(null)
const deliveryCarriersCount = computed(() => deliveryCarriers.length)
const editingCarrier = ref<any>(null)
const showAddCarrierModal = ref(false)
const availableCarriers = ref<any[]>(deliveryCarriers)
const gouvernorats = computed(() => Object.keys(zonesData).sort())

// Add Carrier page state
const newCarrier = reactive({
  name: '',
  apiId: '',
  apiKey: '',
  apiSecret: '',
  fraisColisLivres: 7,
  fraisColisRetour: 5,
  fraisColisEchange: 8,
  fraisColisBig: 12,
  fraisColisPickup: 3,
  fraisPaiement: 1.5,
  retenuPassage: 0,
  allRegions: true,
  regions: [] as string[],
})
const carrierWizardStep = ref(1)
const showApiKey = ref(false)
const modalCarrierSearchQuery = ref('')
const selectedModalCarrier = ref<any>(null)
const carrierSyncSteps = ref<any[]>([])

const filteredModalCarriers = computed(() => {
  const q = modalCarrierSearchQuery.value.toLowerCase().trim()
  if (!q) return deliveryCarriers
  return deliveryCarriers.filter(c => c.name.toLowerCase().includes(q))
})

function resetNewCarrierForm() {
  Object.assign(newCarrier, {
    name: '',
    apiId: '',
    apiKey: '',
    apiSecret: '',
    fraisColisLivres: 7,
    fraisColisRetour: 5,
    fraisColisEchange: 8,
    fraisColisBig: 12,
    fraisColisPickup: 3,
    fraisPaiement: 1.5,
    retenuPassage: 0,
    allRegions: true,
    regions: [],
  })
  carrierWizardStep.value = 1
  selectedModalCarrier.value = null
  modalCarrierSearchQuery.value = ''
  showApiKey.value = false
  // Note: carrierSyncSteps NOT cleared here — cleared by @close handler
}

function selectCarrier(carrier: any) {
  selectedCarrier.value = carrier
}

function editCarrier(carrier: any) {
  editingCarrier.value = carrier.id
  Object.assign(newCarrier, {
    name: carrier.name,
    apiId: carrier.apiId || '',
    apiKey: carrier.apiKey || '',
    apiSecret: '',
    fraisColisLivres: carrier.fraisColisLivres ?? 7,
    fraisColisRetour: carrier.fraisColisRetour ?? 5,
    fraisColisEchange: carrier.fraisColisEchange ?? 8,
    fraisColisBig: carrier.fraisColisBig ?? 12,
    fraisColisPickup: carrier.fraisColisPickup ?? 3,
    fraisPaiement: carrier.fraisPaiement ?? 1.5,
    retenuPassage: carrier.retenuPassage ?? 0,
    allRegions: carrier.allRegions ?? true,
    regions: carrier.regions ? [...carrier.regions] : [],
  })
  // Find matching catalog carrier for config fields
  const catalogMatch = deliveryCarriers.find(
    c => c.name.toLowerCase() === carrier.name.toLowerCase()
  )
  selectedModalCarrier.value = catalogMatch || null
  carrierWizardStep.value = 2
  navigateTo('add-carrier')
}

async function deleteCarrier(carrierId: string) {
  const ok = await appStore.carriersData.remove(carrierId)
  if (ok && selectedCarrier.value?.id === carrierId) {
    selectedCarrier.value = null
  }
}

async function syncCarrier(carrier: any) {
  if (authStore.isDemoMode || syncingCarrierId.value) return
  syncingCarrierId.value = carrier.id
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const fnHeaders = session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined

    // Step 1: Test connection
    const { data: testResult, error: testError } = await supabase.functions.invoke('carrier-credentials', {
      headers: fnHeaders,
      body: { action: 'test', carrierId: carrier.id }
    })
    if (testError || !testResult?.success) {
      toast.error(`${carrier.name}: connexion API échouée`)
      return
    }

    // Step 2: Sync shipments
    const { data: syncResult, error: syncError } = await supabase.functions.invoke('carrier-proxy', {
      headers: fnHeaders,
      body: { carrierId: carrier.id, action: 'sync-shipments', payload: {} }
    })
    if (syncError) {
      toast.error(`${carrier.name}: erreur de synchronisation`)
      return
    }

    const synced = syncResult?.result?.synced ?? 0
    const total = syncResult?.result?.total ?? 0
    if (synced > 0) {
      toast.success(`${carrier.name}: ${synced} nouveau${synced > 1 ? 'x' : ''} colis importé${synced > 1 ? 's' : ''} (${total} total)`)
    } else {
      toast.success(`${carrier.name}: ${total > 0 ? total + ' colis déjà à jour' : 'aucun colis trouvé'}`)
    }
  } catch (e) {
    toast.error(`${carrier.name}: erreur de synchronisation`)
    console.warn('Carrier sync failed:', e)
  } finally {
    syncingCarrierId.value = null
  }
}

function selectCarrierFromList(carrier: any) {
  selectedModalCarrier.value = carrier
  newCarrier.name = carrier.name
}

function selectAllRegions() {
  newCarrier.regions = [...gouvernorats.value]
}

function clearAllRegions() { newCarrier.regions = [] }

function toggleRegion(region: string) {
  const i = newCarrier.regions.indexOf(region)
  if (i >= 0) newCarrier.regions.splice(i, 1)
  else newCarrier.regions.push(region)
}

async function saveCarrierFromPage() {
  const STANDARD_KEYS = new Set(['apiKey', 'accountId', 'secretKey'])
  const hasCustom = selectedModalCarrier.value?.configFields?.some(
    (f: any) => !STANDARD_KEYS.has(f.key)
  )

  // Build credentials object based on carrier config type
  let credentials: Record<string, string>
  if (hasCustom) {
    credentials = {}
    for (const f of selectedModalCarrier.value!.configFields!) {
      if ((newCarrier as any)[f.key]) {
        credentials[f.key] = (newCarrier as any)[f.key]
      }
    }
    const allFilled = selectedModalCarrier.value!.configFields!
      .filter((f: any) => f.required)
      .every((f: any) => !!(newCarrier as any)[f.key])
    if (!newCarrier.name || !allFilled) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }
  } else {
    const needsApiId = !selectedModalCarrier.value?.configFields ||
      selectedModalCarrier.value.configFields.some((f: any) => f.key === 'accountId')
    if (!newCarrier.name || (needsApiId && !newCarrier.apiId) || !newCarrier.apiKey) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }
    credentials = { apiKey: newCarrier.apiKey, ...(newCarrier.apiId ? { apiId: newCarrier.apiId } : {}) }
  }

  if (!newCarrier.allRegions && newCarrier.regions.length === 0) {
    toast.error('Veuillez sélectionner au moins une région')
    return
  }

  // --- Editing: update & return ---
  if (editingCarrier.value) {
    const updated = await appStore.carriersData.update(editingCarrier.value, { ...newCarrier })
    if (updated) {
      // Save encrypted credentials via edge function
      if (Object.keys(credentials).length > 0 && !authStore.isDemoMode) {
        const { data: { session } } = await supabase.auth.getSession()
        const fnHeaders = session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined
        await supabase.functions.invoke('carrier-credentials', {
          headers: fnHeaders,
          body: { action: 'save', carrierId: String(editingCarrier.value), credentials }
        })
      }
      if (selectedCarrier.value?.id === editingCarrier.value) {
        selectedCarrier.value = updated
      }
    }
    editingCarrier.value = null
    resetNewCarrierForm()
    navigateTo('connected-carriers')
    return
  }

  // --- Adding new carrier: step-by-step sync with UI feedback ---
  if (authStore.isDemoMode) {
    await appStore.carriersData.create({ ...newCarrier })
    resetNewCarrierForm()
    navigateTo('connected-carriers')
    return
  }

  const { data: { session } } = await supabase.auth.getSession()
  const fnHeaders = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : undefined

  const skipTestAndSync = !!hasCustom
  carrierSyncSteps.value = [
    { label: 'Enregistrement du transporteur', status: 'loading' },
    { label: 'Sauvegarde des identifiants API', status: 'pending' },
    ...(!skipTestAndSync ? [
      { label: 'Test de connexion API', status: 'pending' as const },
      { label: 'Synchronisation des colis', status: 'pending' as const },
    ] : []),
  ]

  // Step 1: Save carrier (without raw credentials in the DB)
  const carrierData = { ...newCarrier, apiKey: '', apiId: '' }
  const uiCarrier = await appStore.carriersData.create(carrierData)
  if (!uiCarrier) {
    carrierSyncSteps.value[0].status = 'error'
    carrierSyncSteps.value[0].detail = 'Échec de l\'enregistrement'
    return
  }
  carrierSyncSteps.value[0].status = 'done'
  carrierSyncSteps.value[0].detail = 'Transporteur enregistré'

  // Step 2: Save encrypted credentials via edge function
  carrierSyncSteps.value[1].status = 'loading'
  try {
    const { data: saveResult, error: saveError } = await supabase.functions.invoke('carrier-credentials', {
      headers: fnHeaders,
      body: { action: 'save', carrierId: uiCarrier.id, credentials }
    })
    if (saveError || !saveResult?.success) {
      carrierSyncSteps.value[1].status = 'error'
      carrierSyncSteps.value[1].detail = saveError?.message || 'Échec de la sauvegarde'
      for (let i = 2; i < carrierSyncSteps.value.length; i++) {
        carrierSyncSteps.value[i].status = 'error'
        carrierSyncSteps.value[i].detail = 'Ignoré'
      }
      resetNewCarrierForm()
      return
    }
    carrierSyncSteps.value[1].status = 'done'
    carrierSyncSteps.value[1].detail = 'Identifiants chiffrés et sauvegardés'
  } catch {
    carrierSyncSteps.value[1].status = 'error'
    carrierSyncSteps.value[1].detail = 'Erreur de sauvegarde'
    for (let i = 2; i < carrierSyncSteps.value.length; i++) {
      carrierSyncSteps.value[i].status = 'error'
      carrierSyncSteps.value[i].detail = 'Ignoré'
    }
    resetNewCarrierForm()
    return
  }

  if (!skipTestAndSync) {
    // Step 3: Test API connection
    carrierSyncSteps.value[2].status = 'loading'
    try {
      const { data: testResult, error: testError } = await supabase.functions.invoke('carrier-credentials', {
        headers: fnHeaders,
        body: { action: 'test', carrierId: uiCarrier.id }
      })
      if (testError || !testResult?.success) {
        carrierSyncSteps.value[2].status = 'error'
        carrierSyncSteps.value[2].detail = 'Connexion échouée — vérifiez vos identifiants'
        carrierSyncSteps.value[3].status = 'error'
        carrierSyncSteps.value[3].detail = 'Ignoré (connexion échouée)'
        resetNewCarrierForm()
        return
      }
      carrierSyncSteps.value[2].status = 'done'
      carrierSyncSteps.value[2].detail = 'API connectée'
    } catch {
      carrierSyncSteps.value[2].status = 'error'
      carrierSyncSteps.value[2].detail = 'Erreur de connexion'
      carrierSyncSteps.value[3].status = 'error'
      carrierSyncSteps.value[3].detail = 'Ignoré (connexion échouée)'
      resetNewCarrierForm()
      return
    }

    // Step 4: Sync shipments
    carrierSyncSteps.value[3].status = 'loading'
    try {
      const { data: syncResult, error: syncError } = await supabase.functions.invoke('carrier-proxy', {
        headers: fnHeaders,
        body: { carrierId: uiCarrier.id, action: 'sync-shipments', payload: {} }
      })
      if (syncError) {
        carrierSyncSteps.value[3].status = 'error'
        carrierSyncSteps.value[3].detail = 'Erreur lors de la synchronisation'
      } else {
        const synced = syncResult?.result?.synced ?? 0
        const total = syncResult?.result?.total ?? 0
        carrierSyncSteps.value[3].status = 'done'
        carrierSyncSteps.value[3].detail = synced > 0
          ? `${synced} nouveau${synced > 1 ? 'x' : ''} colis importé${synced > 1 ? 's' : ''} (${total} total)`
          : total > 0
            ? `${total} colis déjà à jour`
            : 'Aucun colis trouvé'
      }
    } catch {
      carrierSyncSteps.value[3].status = 'error'
      carrierSyncSteps.value[3].detail = 'Erreur lors de la synchronisation'
    }
  }

  editingCarrier.value = null
  resetNewCarrierForm()
}

function closeCarrierModal() { showAddCarrierModal.value = false }

async function saveCarrier(data: any) {
  if (editingCarrier.value) {
    await appStore.carriersData.update(editingCarrier.value, data)
  } else {
    await appStore.carriersData.create(data)
  }
  editingCarrier.value = null
  showAddCarrierModal.value = false
}

// Reset form when navigating to add-carrier without editing
watch(activeSection, (section) => {
  if (section === 'add-carrier' && !editingCarrier.value) {
    resetNewCarrierForm()
  }
})
</script>

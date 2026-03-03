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
    @close="editingCarrier = null; resetNewCarrierForm(); navigateTo('connected-carriers')"
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
import { useToast } from '@/composables/useToast'

// Feature components
import ConnectedCarriers from '@/components/features/carriers/ConnectedCarriers.vue'
import AddCarrier from '@/components/features/carriers/AddCarrier.vue'

// Modal components
import AddCarrierModal from '@/components/modals/AddCarrierModal.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
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
  carrierSyncSteps.value = []
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
  syncingCarrierId.value = carrier.id
  try {
    await carriersService.updateApiStatus(carrier.id, 'connected')
    // Update local state
    const idx = appStore.carriers.findIndex((c: any) => c.id === carrier.id)
    if (idx !== -1) {
      appStore.carriers[idx].apiStatus = 'connected'
    }
    if (selectedCarrier.value?.id === carrier.id) {
      selectedCarrier.value = { ...selectedCarrier.value, apiStatus: 'connected' }
    }
  } catch {
    // If sync fails, mark as error
    const idx = appStore.carriers.findIndex((c: any) => c.id === carrier.id)
    if (idx !== -1) {
      appStore.carriers[idx].apiStatus = 'error'
    }
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
  if (!newCarrier.name) {
    toast.error('Veuillez sélectionner un transporteur')
    return
  }
  try {
    let result: any
    if (editingCarrier.value) {
      result = await appStore.carriersData.update(editingCarrier.value, { ...newCarrier })
      if (result && selectedCarrier.value?.id === editingCarrier.value) {
        selectedCarrier.value = result
      }
    } else {
      result = await appStore.carriersData.create({ ...newCarrier })
    }
    if (!result) return // create/update already showed a toast error
    editingCarrier.value = null
    resetNewCarrierForm()
    navigateTo('connected-carriers')
  } catch (e: any) {
    console.error('saveCarrierFromPage error:', e)
    toast.error('Erreur: ' + (e.message || e))
  }
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

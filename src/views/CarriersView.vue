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
    @close="navigateTo('connected-carriers')"
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
import { computed, ref, reactive, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { subSectionRoutes } from '@/composables/useNavigation'

// Feature components
import ConnectedCarriers from '@/components/features/carriers/ConnectedCarriers.vue'
import AddCarrier from '@/components/features/carriers/AddCarrier.vue'

// Modal components
import AddCarrierModal from '@/components/modals/AddCarrierModal.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
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
const deliveryCarriersCount = ref(0)
const editingCarrier = ref<any>(null)
const showAddCarrierModal = ref(false)
const availableCarriers = ref<any[]>([])
const gouvernorats = ref<any[]>([])

// Add Carrier page state
const newCarrier = reactive({
  name: '',
  apiKey: '',
  apiSecret: '',
  allRegions: false,
  regions: [] as string[],
})
const carrierWizardStep = ref(1)
const showApiKey = ref(false)
const modalCarrierSearchQuery = ref('')
const selectedModalCarrier = ref<any>(null)
const filteredModalCarriers = ref<any[]>([])
const carrierSyncSteps = ref<any[]>([])

// Stubs (will be migrated from DTV)
function selectCarrier(_carrier: any) { selectedCarrier.value = _carrier }
function editCarrier(_carrier: any) { /* stub */ }
function deleteCarrier(_carrier: any) { /* stub */ }
function syncCarrier(_carrier: any) { /* stub */ }
function selectCarrierFromList(_carrier: any) { /* stub */ }
function selectAllRegions() { /* stub */ }
function clearAllRegions() { newCarrier.regions = [] }
function toggleRegion(region: string) {
  const i = newCarrier.regions.indexOf(region)
  if (i >= 0) newCarrier.regions.splice(i, 1)
  else newCarrier.regions.push(region)
}
function saveCarrierFromPage() { /* stub */ }
function closeCarrierModal() { showAddCarrierModal.value = false }
function saveCarrier(_data: any) { /* stub */ }
</script>

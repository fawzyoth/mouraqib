<template>
  <!-- Shipments: All Shipments -->
  <ShipmentsList
    v-if="activeSection === 'all-shipments'"
    :shipments="appStore.shipments"
    :status-tabs="statusTabs"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @open-bulk-import="openBulkImport"
    @open-add-shipment="navigateTo('create-shipment')"
    @select-shipment="(s: any) => { selectedShipment = s; showShipmentDetail = true }"
  />

  <!-- Shipments: Create Shipment — success screen or form -->
  <ShipmentCreatedSuccess
    v-else-if="activeSection === 'create-shipment' && createdShipment"
    :shipment="createdShipment"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @print-label="handleSuccessPrintLabel"
    @create-another="handleCreateAnother"
    @view-shipments="handleViewShipments"
  />

  <CreateShipment
    v-else-if="activeSection === 'create-shipment'"
    :clients="appStore.clients"
    :carriers="appStore.carriers"
    :initial-carrier="stickyCarrier"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @submit="handleCreateShipment"
    @reset="resetShipmentForm"
  />

  <!-- Shipments: Labels -->
  <ShipmentLabels
    v-else-if="activeSection === 'labels'"
    :shipments="appStore.shipments"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @print-selected="printSelectedLabels"
  />

  <!-- Shipment Detail Panel (always rendered, toggled via :show) -->
  <ShipmentDetailPanel
    :show="showShipmentDetail"
    :shipment="selectedShipment"
    @close="selectedShipment = null; showShipmentDetail = false"
  />

  <!-- Print Label Modal -->
  <PrintLabelModal
    :show="showPrintLabelModal"
    :shipment="labelToPrint"
    @close="closePrintModal"
    @print="printLabel"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { subSectionRoutes } from '@/composables/useNavigation'

// Feature components
import ShipmentsList from '@/components/features/shipments/ShipmentsList.vue'
import CreateShipment from '@/components/features/shipments/CreateShipment.vue'
import ShipmentCreatedSuccess from '@/components/features/shipments/ShipmentCreatedSuccess.vue'
import ShipmentLabels from '@/components/features/shipments/ShipmentLabels.vue'
import ShipmentDetailPanel from '@/components/features/shipments/ShipmentDetailPanel.vue'

// Modal components
import PrintLabelModal from '@/components/modals/PrintLabelModal.vue'

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
// Injected from layout
// ---------------------------------------------------------------------------
const openBulkImport = inject<() => void>('openBulkImport', () => {})

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

// Status tabs for ShipmentsList
const statusTabs = ref([
  { id: 'all', label: 'Tous', count: 0 },
  { id: 'in-transit', label: 'En transit', count: 0 },
  { id: 'delivered', label: 'Livré', count: 0 },
  { id: 'returned', label: 'Retourné', count: 0 },
])

// Shipment detail panel
const selectedShipment = ref<any>(null)
const showShipmentDetail = ref(false)

// Create shipment
const createdShipment = ref<any>(null)
const stickyCarrier = ref('')

function handleCreateShipment(_data: any) { /* stub */ }
function resetShipmentForm() { /* stub */ }
function handleSuccessPrintLabel(_shipment: any) {
  labelToPrint.value = _shipment
  showPrintLabelModal.value = true
}
function handleCreateAnother() {
  createdShipment.value = null
}
function handleViewShipments() {
  createdShipment.value = null
  navigateTo('all-shipments')
}

// Labels
function printSelectedLabels(_ids: any[]) { /* stub */ }

// Print label modal
const showPrintLabelModal = ref(false)
const labelToPrint = ref<any>(null)

function closePrintModal() {
  showPrintLabelModal.value = false
  labelToPrint.value = null
}
function printLabel(_shipment: any) { /* stub */ }
</script>

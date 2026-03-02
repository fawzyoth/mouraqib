<template>
  <!-- Pickups: Scan Pickup -->
  <ScanPickup
    v-if="activeSection === 'schedule-pickup'"
    :scan-input="scanInput"
    :scan-feedback="scanFeedback"
    :confirmed-shipments="confirmedShipments"
    :pickup-candidates="pickupCandidates"
    :confirmed-by-carrier="confirmedByCarrier"
    :confirmed-total-c-o-d="confirmedTotalCOD"
    :pickup-by-carrier="pickupByCarrier"
    :pending-pickups-count="pendingPickupsCount"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @update:scan-input="scanInput = $event"
    @handle-scan="handleScan"
    @open-pickup-confirmation="showPickupConfirmModal = true"
    @navigate-to-labels="navigateTo('labels')"
  />

  <!-- Pickups: History -->
  <PickupHistory
    v-else-if="activeSection === 'pickup-history'"
    :pickup-history="appStore.pickupHistory"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Pickup Confirm Modal -->
  <PickupConfirmModal
    :show="showPickupConfirmModal"
    :confirmed-shipments="confirmedShipments"
    :confirmed-by-carrier="confirmedByCarrier"
    @close="showPickupConfirmModal = false"
    @confirm="confirmScanPickup"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { subSectionRoutes } from '@/composables/useNavigation'

// Feature components
import ScanPickup from '@/components/features/pickups/ScanPickup.vue'
import PickupHistory from '@/components/features/pickups/PickupHistory.vue'

// Modal components
import PickupConfirmModal from '@/components/modals/PickupConfirmModal.vue'

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

// Scan pickup state
const scanInput = ref('')
const scanFeedback = ref<any>(null)
const confirmedShipments = ref<any[]>([])
const pickupCandidates = ref<any[]>([])
const confirmedByCarrier = ref<Record<string, any[]>>({})
const confirmedTotalCOD = ref(0)
const pickupByCarrier = ref<Record<string, any[]>>({})
const pendingPickupsCount = ref(0)

// Modal
const showPickupConfirmModal = ref(false)

// Stubs (will be migrated from DTV)
function handleScan() { /* stub */ }
function confirmScanPickup() { /* stub */ }
</script>

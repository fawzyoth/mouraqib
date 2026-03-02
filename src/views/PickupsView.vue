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
    @unconfirm-shipment="unconfirmShipment"
    @clear-scan-session="clearScanSession"
    @navigate-to-labels="navigateTo('labels')"
  />

  <!-- Pickups: History -->
  <PickupHistory
    v-else-if="activeSection === 'pickup-history'"
    :scanned-shipments="allPickedUpShipments"
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
// Scan state
// ---------------------------------------------------------------------------
const scanInput = ref('')
const scanFeedback = ref<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)
const scannedShipments = ref<any[]>([])
const showPickupConfirmModal = ref(false)

// Derived props for ScanPickup
const confirmedShipments = computed(() => scannedShipments.value)
const pickupCandidates = computed(() => scannedShipments.value)

const confirmedByCarrier = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const s of scannedShipments.value) {
    const carrier = s.carrier || 'Non assigné'
    if (!groups[carrier]) groups[carrier] = []
    groups[carrier].push(s)
  }
  return Object.entries(groups).map(([carrier, shipments]) => ({ carrier, shipments }))
})

const confirmedTotalCOD = computed(() =>
  scannedShipments.value.reduce((sum: number, s: any) => sum + (s.cod || s.totalPrice || 0), 0)
)

const pickupByCarrier = computed(() => {
  const groups: Record<string, any> = {}
  for (const s of scannedShipments.value) {
    const carrier = s.carrier || 'Non assigné'
    if (!groups[carrier]) {
      groups[carrier] = { carrier, shipments: [], confirmedCount: 0 }
    }
    groups[carrier].shipments.push({ ...s, confirmed: true })
    groups[carrier].confirmedCount++
  }
  return Object.values(groups)
})

const pendingPickupsCount = computed(() =>
  appStore.shipments.filter((s: any) => s.status === 'Pending').length
)

// Merge session scans with DB picked-up shipments for history
const allPickedUpShipments = computed(() => {
  const sessionIds = new Set(scannedShipments.value.map((s: any) => s.id))
  const fromDb = appStore.shipments
    .filter((s: any) => s.status === 'Picked up' && !sessionIds.has(s.id))
    .map((s: any) => ({ ...s, scannedAt: null }))
  return [...scannedShipments.value, ...fromDb]
})

// ---------------------------------------------------------------------------
// Scan logic
// ---------------------------------------------------------------------------
let feedbackTimeout: ReturnType<typeof setTimeout> | null = null

function autoHideFeedback() {
  if (feedbackTimeout) clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => { scanFeedback.value = null }, 4000)
}

async function handleScan() {
  const input = scanInput.value.trim()
  if (!input) return

  // Find shipment by tracking number
  const shipment = appStore.shipments.find(
    (s: any) => s.trackingNumber === input
  )

  if (!shipment) {
    scanFeedback.value = { type: 'error', message: `Colis "${input}" introuvable` }
    scanInput.value = ''
    autoHideFeedback()
    return
  }

  // Already scanned this session
  if (scannedShipments.value.find((s: any) => s.id === shipment.id)) {
    scanFeedback.value = { type: 'warning', message: `Colis "${input}" déjà scanné` }
    scanInput.value = ''
    autoHideFeedback()
    return
  }

  // Already picked up in DB
  if (shipment.status === 'Picked up') {
    scanFeedback.value = { type: 'warning', message: `Colis "${input}" déjà enlevé` }
    scanInput.value = ''
    autoHideFeedback()
    return
  }

  // Update status to picked_up
  const success = await appStore.shipmentsData.updateStatus(shipment.id, 'Picked up')
  if (!success) {
    scanFeedback.value = { type: 'error', message: 'Erreur lors de la mise à jour du colis' }
    scanInput.value = ''
    autoHideFeedback()
    return
  }

  // Add to scanned list with timestamp
  scannedShipments.value.unshift({
    ...shipment,
    status: 'Picked up',
    scannedAt: new Date().toISOString(),
  })

  scanFeedback.value = {
    type: 'success',
    message: `${shipment.trackingNumber} — ${shipment.customerName} — enlevé`,
  }
  scanInput.value = ''
  autoHideFeedback()
}

function unconfirmShipment(trackingNumber: string) {
  scannedShipments.value = scannedShipments.value.filter(
    (s: any) => s.trackingNumber !== trackingNumber
  )
}

function clearScanSession() {
  scannedShipments.value = []
  scanFeedback.value = null
}

function confirmScanPickup() {
  showPickupConfirmModal.value = false
}
</script>

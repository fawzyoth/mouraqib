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
    @select-shipment="selectedShipment = $event"
  />

  <!-- Pickups: History -->
  <ShipmentsList
    v-else-if="activeSection === 'pickup-history'"
    :shipments="scannedOutShipments"
    :status-tabs="historyStatusTabs"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @select-shipment="selectedShipment = $event"
  />

  <!-- Shipment Detail Panel -->
  <ShipmentDetailPanel
    :show="!!selectedShipment"
    :shipment="selectedShipment"
    @close="selectedShipment = null"
  />

  <!-- Pickup Confirm Modal -->
  <PickupConfirmModal
    :show="showPickupConfirmModal"
    :confirmed-shipments="modalShipments"
    :confirmed-by-carrier="modalByCarrier"
    @close="showPickupConfirmModal = false"
    @confirm="handleConfirmPickup"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { subSectionRoutes } from '@/composables/useNavigation'

// Feature components
import ScanPickup from '@/components/features/pickups/ScanPickup.vue'
import ShipmentsList from '@/components/features/shipments/ShipmentsList.vue'

// Modal components
import PickupConfirmModal from '@/components/modals/PickupConfirmModal.vue'
import ShipmentDetailPanel from '@/components/features/shipments/ShipmentDetailPanel.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

function navigateTo(subSection: string) {
  const routeInfo = subSectionRoutes[subSection]
  if (routeInfo) router.push(routeInfo.path)
}

// Shipment detail panel
const selectedShipment = ref<any>(null)

// ---------------------------------------------------------------------------
// History: all shipments with outScannedAt
// ---------------------------------------------------------------------------
const scannedOutShipments = computed(() =>
  appStore.shipments.filter((s: any) => s.outScannedAt)
)

const historyStatusTabs = computed(() => {
  const s = scannedOutShipments.value
  const countIn = (statuses: string[]) => {
    const set = new Set(statuses)
    return s.filter((sh: any) => set.has(sh.status)).length
  }
  return [
    { id: 'all', label: 'Tous', count: s.length },
    { id: 'pending', label: 'En attente', count: countIn(['En attente', 'A vérifier']) },
    { id: 'in-progress', label: 'En cours', count: countIn(['En cours', 'Au magasin', 'Echange', 'Rtn dépôt']) },
    { id: 'delivered', label: 'Livré', count: countIn(['Livré']) },
    { id: 'returned', label: 'Retours', count: countIn(['Retour Expéditeur', 'Rtn client/agence', 'Retour reçu', 'Rtn définitif', 'Retour assigné', "Retour en cours d'expédition", 'Retour enlevé', 'Retour Annulé']) },
  ].filter(t => t.id === 'all' || t.count > 0)
})

// ---------------------------------------------------------------------------
// Scan state
// ---------------------------------------------------------------------------
const scanInput = ref('')
const scanFeedback = ref<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)
const scannedShipments = ref<any[]>([])
const showPickupConfirmModal = ref(false)

// Derived props for ScanPickup
// Shipments already scanned in DB (have outScannedAt but not yet picked up)
const dbScannedShipments = computed(() =>
  appStore.shipments.filter((s: any) => s.outScannedAt && s.status !== 'Enlevé')
)

const confirmedShipments = computed(() => {
  const sessionIds = new Set(scannedShipments.value.map((s: any) => s.id))
  const fromDb = dbScannedShipments.value.filter((s: any) => !sessionIds.has(s.id))
  return [...scannedShipments.value, ...fromDb]
})

const pickupCandidates = computed(() => {
  const confirmedIds = new Set(confirmedShipments.value.map((s: any) => s.id))
  // Unscanned: label printed, not yet picked up, not already confirmed
  const unscanned = appStore.shipments.filter((s: any) =>
    s.labelPrinted && s.status !== 'Picked up' && s.status !== 'Enlevé' && !confirmedIds.has(s.id)
  )
  return [...confirmedShipments.value, ...unscanned]
})

const confirmedByCarrier = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const s of confirmedShipments.value) {
    const carrier = s.carrier || 'Non assigné'
    if (!groups[carrier]) groups[carrier] = []
    groups[carrier].push(s)
  }
  return Object.entries(groups).map(([carrier, shipments]) => ({ carrier, shipments }))
})

const confirmedTotalCOD = computed(() =>
  confirmedShipments.value.reduce((sum: number, s: any) => sum + (s.cod || s.totalPrice || 0), 0)
)

const pickupByCarrier = computed(() => {
  const confirmedIds = new Set(confirmedShipments.value.map((s: any) => s.id))
  const groups: Record<string, any> = {}

  // Add unscanned candidates first
  for (const s of appStore.shipments) {
    if (!s.labelPrinted || s.status === 'Enlevé' || confirmedIds.has(s.id)) continue
    const carrier = s.carrier || 'Non assigné'
    if (!groups[carrier]) {
      groups[carrier] = { carrier, shipments: [], confirmedCount: 0 }
    }
    groups[carrier].shipments.push({ ...s, confirmed: false })
  }

  // Then add confirmed shipments (session-scanned + DB-scanned)
  for (const s of confirmedShipments.value) {
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
  appStore.shipments.filter((s: any) => !s.labelPrinted && s.status === 'En attente').length
)

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
  if (shipment.status === 'Enlevé') {
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

// ---------------------------------------------------------------------------
// Request pickup (from RequestPickup page)
// ---------------------------------------------------------------------------
const requestedShipmentIds = ref<string[]>([])

// Shipments displayed in the confirm modal (works for both scan and request flows)
const modalShipments = computed(() => {
  if (requestedShipmentIds.value.length > 0) {
    const idSet = new Set(requestedShipmentIds.value)
    return appStore.shipments.filter((s: any) => idSet.has(s.id))
  }
  return confirmedShipments.value
})

const modalByCarrier = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const s of modalShipments.value) {
    const carrier = s.carrier || 'Non assigné'
    if (!groups[carrier]) groups[carrier] = []
    groups[carrier].push(s)
  }
  return Object.entries(groups).map(([carrier, shipments]) => ({ carrier, shipments }))
})

function handleRequestPickup(shipmentIds: string[]) {
  requestedShipmentIds.value = shipmentIds
  showPickupConfirmModal.value = true
}

async function handleConfirmPickup(data: { date: string; timeSlot: string; address: string }) {
  // Create one pickup request per carrier
  for (const group of modalByCarrier.value) {
    const carrierId = group.shipments[0]?.carrierId || null
    const pickup = await appStore.pickupsData.create({
      date: data.date,
      timeSlot: data.timeSlot,
      address: data.address,
      shipmentCount: group.shipments.length,
    }, carrierId)

    // Assign shipments to the pickup and update their status
    if (pickup) {
      const ids = group.shipments.map((s: any) => s.id)
      try {
        const { pickupsService } = await import('@/services/pickups')
        await pickupsService.assignShipments(pickup.id, ids)
        // Update local shipment statuses
        for (const id of ids) {
          await appStore.shipmentsData.updateStatus(id, 'Pickup scheduled')
        }
      } catch (e) {
        console.error('Failed to assign shipments to pickup:', e)
      }
    }
  }

  showPickupConfirmModal.value = false
  requestedShipmentIds.value = []
}
</script>

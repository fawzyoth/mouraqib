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
    @request-deletion="openDeletionModal"
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
    :clients="enrichedClients"
    :carriers="appStore.carriers"
    :initial-carrier="stickyCarrier"
    :loading="creatingShipment"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @submit="handleCreateShipment"
    @reset="resetShipmentForm"
  />

  <!-- Shipments: Deletion Requests -->
  <DeletionRequests
    v-else-if="activeSection === 'deletion-requests'"
    :shipments="appStore.shipments"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @cancel-deletion-request="handleCancelDeletionRequest"
    @deletion-confirmed="handleDeletionConfirmed"
  />

  <!-- Shipments: Labels -->
  <ShipmentLabels
    v-else-if="activeSection === 'labels'"
    :shipments="appStore.shipments"
    :printing="printingLabels"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @print-selected="printSelectedLabels"
    @open-label-preview="openLabelPreview"
    @select-shipment="(s: any) => { selectedShipment = s; showShipmentDetail = true }"
  />

  <!-- Shipment Detail Panel (always rendered, toggled via :show) -->
  <ShipmentDetailPanel
    :show="showShipmentDetail"
    :shipment="selectedShipment"
    @close="selectedShipment = null; showShipmentDetail = false"
    @request-deletion="openDeletionModal"
    @cancel-deletion-request="handleCancelDeletionRequest"
  />

  <!-- Request Deletion Modal -->
  <RequestDeletionModal
    :show="showDeletionModal"
    :shipment="deletionTarget"
    @close="showDeletionModal = false; deletionTarget = null"
    @confirm="handleConfirmDeletionRequest"
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
import { useAuthStore } from '@/stores/auth'
import { subSectionRoutes } from '@/composables/useNavigation'

// Feature components
import ShipmentsList from '@/components/features/shipments/ShipmentsList.vue'
import CreateShipment from '@/components/features/shipments/CreateShipment.vue'
import ShipmentCreatedSuccess from '@/components/features/shipments/ShipmentCreatedSuccess.vue'
import ShipmentLabels from '@/components/features/shipments/ShipmentLabels.vue'
import ShipmentDetailPanel from '@/components/features/shipments/ShipmentDetailPanel.vue'
import DeletionRequests from '@/components/features/shipments/DeletionRequests.vue'

// Modal components
import PrintLabelModal from '@/components/modals/PrintLabelModal.vue'
import RequestDeletionModal from '@/components/modals/RequestDeletionModal.vue'

import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
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

// Enrich clients with shipment-based delivery stats
const enrichedClients = computed(() => {
  const shipments = appStore.shipments
  const statsMap = new Map<string, { totalOrders: number; deliveredOrders: number }>()
  for (const s of shipments) {
    if (!s.clientId) continue
    let entry = statsMap.get(s.clientId)
    if (!entry) {
      entry = { totalOrders: 0, deliveredOrders: 0 }
      statsMap.set(s.clientId, entry)
    }
    entry.totalOrders++
    if (s.status === 'Livré') entry.deliveredOrders++
  }
  return appStore.clients.map((client: any) => {
    const stats = statsMap.get(client.id)
    if (!stats) return { ...client, totalOrders: 0, deliveredOrders: 0, deliveryRate: 0 }
    const deliveryRate = stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0
    return { ...client, totalOrders: stats.totalOrders, deliveredOrders: stats.deliveredOrders, deliveryRate }
  })
})

// Status tabs for ShipmentsList (counts derived from store)
const statusTabs = computed(() => {
  const s = appStore.shipments
  const countIn = (statuses: string[]) => {
    const set = new Set(statuses)
    return s.filter((sh: any) => set.has(sh.status)).length
  }
  const excludedSet = new Set(['Livré', 'Supprimé', "Demande d'enlèvement annulé"])
  const activeCount = s.filter((sh: any) => !excludedSet.has(sh.status) && !sh.inScannedAt).length
  return [
    { id: 'active', label: 'Actifs', count: activeCount },
    { id: 'all', label: 'Tous', count: s.length },
    { id: 'pending', label: 'En attente', count: countIn(['En attente', 'A vérifier']) },
    { id: 'pickup', label: 'Enlèvement', count: countIn(["Demande d'enlèvement", "Demande d'enlèvement assignée", "En cours d'enlèvement", 'Enlevé']) },
    { id: 'in-progress', label: 'En cours', count: countIn(['En cours', 'Au magasin', 'Echange', 'Rtn dépôt']) },
    { id: 'delivered', label: 'Livré', count: countIn(['Livré']) },
    { id: 'returned', label: 'Retours', count: countIn(['Retour Expéditeur', 'Rtn client/agence', 'Retour reçu', 'Rtn définitif', 'Retour assigné', "Retour en cours d'expédition", 'Retour enlevé', 'Retour Annulé']) },
    { id: 'cancelled', label: 'Supprimé', count: countIn(['Supprimé', "Demande d'enlèvement annulé"]) },
  ].filter(t => t.id === 'active' || t.id === 'all' || t.count > 0)
})

// Shipment detail panel
const selectedShipment = ref<any>(null)
const showShipmentDetail = ref(false)

// Deletion request
const showDeletionModal = ref(false)
const deletionTarget = ref<any>(null)

function openDeletionModal(shipment: any) {
  deletionTarget.value = shipment
  showDeletionModal.value = true
}

async function handleConfirmDeletionRequest(reason: string | null) {
  if (!deletionTarget.value) return
  const userId = authStore.user?.id
  const userName = authStore.user?.name
  if (!userId || !userName) return
  await appStore.shipmentsData.requestDeletion(deletionTarget.value.id, reason, userId, userName)
  showDeletionModal.value = false
  deletionTarget.value = null
}

async function handleCancelDeletionRequest(shipment: any) {
  await appStore.shipmentsData.cancelDeletionRequest(shipment.id)
}

function handleDeletionConfirmed(shipmentId: string) {
  const idx = appStore.shipments.findIndex((s: any) => s.id === shipmentId)
  if (idx !== -1) appStore.shipments.splice(idx, 1)
}

// Create shipment
const createdShipment = ref<any>(null)
const creatingShipment = ref(false)
const stickyCarrier = ref('')

async function handleCreateShipment(data: any) {
  creatingShipment.value = true
  try {
    const carrier = appStore.carriers.find((c: any) => c.name === data.carrier)
    const carrierId = carrier?.id || null
    const userId = authStore.user?.id || null

    const result = await appStore.shipmentsData.create(
      data,
      appStore.orgContext,
      userId,
      carrierId,
      carrier?.apiStatus
    )
    if (result) {
      createdShipment.value = result
      stickyCarrier.value = data.carrier || ''
    }
  } finally {
    creatingShipment.value = false
  }
}
function resetShipmentForm() {
  createdShipment.value = null
  stickyCarrier.value = ''
}
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

// Labels — open the real carrier label URL (same as sidebar) and mark as printed
function openLabelPreview(shipment: any) {
  if (shipment.labelUrl) {
    window.open(shipment.labelUrl, '_blank')
    appStore.shipmentsData.markAsPrinted([shipment.id])
  }
}

const toast = useToast()
const printingLabels = ref(false)

async function printSelectedLabels(ids: any[]) {
  const shipments = appStore.shipments.filter((s: any) => ids.includes(s.id))
  const urls = shipments
    .map((s: any) => s.labelUrl)
    .filter((url: string | null | undefined) => !!url)

  if (urls.length === 0) {
    toast.error('Aucun bordereau avec URL disponible')
    return
  }

  printingLabels.value = true
  try {
    const { data, error } = await supabase.functions.invoke('merge-multiple-labels', {
      body: { urls },
    })

    if (error) throw error

    const text = data instanceof Blob ? await data.text() : typeof data === 'string' ? data : JSON.stringify(data)

    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(text)
        printWindow.document.close()
        printWindow.onload = () => printWindow.print()
      }
    } else if (text.startsWith('{') && text.includes('"pdf"')) {
      const json = JSON.parse(text)
      if (json.pdf) {
        const pdfBytes = Uint8Array.from(atob(json.pdf), c => c.charCodeAt(0))
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })
        window.open(URL.createObjectURL(pdfBlob), '_blank')
      }
      if (json.html) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(json.html)
          printWindow.document.close()
          printWindow.onload = () => printWindow.print()
        }
      }
    } else {
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' })
      window.open(URL.createObjectURL(blob), '_blank')
    }

    // Mark as printed
    const printedIds = shipments.filter((s: any) => s.labelUrl).map((s: any) => s.id)
    if (printedIds.length > 0) {
      appStore.shipmentsData.markAsPrinted(printedIds)
    }
  } catch (e: any) {
    toast.error('Erreur fusion PDF: ' + (e.message || e))
  } finally {
    printingLabels.value = false
  }
}

// Print label modal (used from shipment creation success screen)
const showPrintLabelModal = ref(false)
const labelToPrint = ref<any>(null)

function closePrintModal() {
  showPrintLabelModal.value = false
  labelToPrint.value = null
}
function printLabel() {
  if (labelToPrint.value?.labelUrl) {
    window.open(labelToPrint.value.labelUrl, '_blank')
  }
}
</script>

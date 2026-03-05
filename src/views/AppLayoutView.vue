<template>
  <!-- Loading overlay -->
  <div v-if="appStore.isLoading && !authStore.isDemoMode" class="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-950">
    <div class="text-center">
      <Loader2 class="w-8 h-8 animate-spin text-primary-blue mx-auto mb-3" />
      <p class="text-sm text-gray-500">Chargement...</p>
    </div>
  </div>

  <ToastContainer />

  <AppShell
    :main-section="mainSection"
    :active-section="activeSection"
    :section-label="getMainSectionLabel(mainSection)"
    :nav-items="filteredMainNavigation"
    :sub-nav-items="currentSubNavigation"
    :user-name="authStore.user?.name || authStore.organization?.name || ''"
    :user-email="authStore.user?.email || authStore.organization?.email || ''"
    :user-initial="(authStore.user?.name || authStore.organization?.name || 'U').charAt(0)"
    :balance="appStore.userBalance"
    :sidebar-open="sidebarOpen"
    :sub-menu-open="subMenuOpen"
    :shipments-count="appStore.shipments.length"
    :delivered-count="appStore.deliveredCount"
    @select-main="selectMainSection"
    @select-sub="navigateTo"
    @toggle-menu="sidebarOpen = true"
    @close-menu="sidebarOpen = false"
    @close-submenu="subMenuOpen = false"
    @open-search="openGlobalSearch"
    @logout="handleLogout"
    @recharge="showRechargeModal = true"
  >
    <!-- Search Results Page (shown above router view) -->
    <SearchResultsPage
      v-if="showSearchResultsPage"
      :shipments="appStore.shipments"
      :initial-query="searchResultsQuery"
      @close="closeSearchResultsPage"
      @select-result="handleSearchResultSelect"
    />

    <!-- Section content -->
    <RouterView v-else />
  </AppShell>

  <!-- Global Modals -->
  <GlobalSearchModal
    :show="showGlobalSearch"
    :shipments="appStore.shipments"
    :clients="appStore.clients"
    @close="closeGlobalSearch"
    @select-result="handleSearchResultSelect"
    @navigate="handleSearchNavigate"
  />

  <RechargeModal
    :show="showRechargeModal"
    v-model:delivered="rechargeForm.delivered"
    v-model:returned="rechargeForm.returned"
    @close="showRechargeModal = false"
    @confirm="processRecharge"
  />

  <BulkImportModal
    :show="showBulkImportModal"
    @close="showBulkImportModal = false"
    @import="handleBulkImport"
  />

  <!-- Shipment Detail (from search results) -->
  <ShipmentDetailPanel
    :show="showShipmentDetail"
    :shipment="selectedShipment"
    @close="selectedShipment = null; showShipmentDetail = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useNavigation } from '@/composables/useNavigation'
import { useFeatureFlags } from '@/composables/useFeatureFlags'
import { useToast } from '@/composables/useToast'
import { RECHARGE_DEFAULT_DELIVERED, RECHARGE_DEFAULT_RETURNED } from '@/data/pricing'

// Layout
import AppShell from '@/components/layout/AppShell.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'

// Feature components used at layout level
import SearchResultsPage from '@/components/features/shipments/SearchResultsPage.vue'
import ShipmentDetailPanel from '@/components/features/shipments/ShipmentDetailPanel.vue'

// Global modals
import GlobalSearchModal from '@/components/modals/GlobalSearchModal.vue'
import RechargeModal from '@/components/modals/RechargeModal.vue'
import BulkImportModal from '@/components/modals/BulkImportModal.vue'
import { supabase } from '@/lib/supabase'
import { shipmentsService } from '@/services/shipments'
import { pickupsService } from '@/services/pickups'
import type { ShipmentInsert } from '@/types/database'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const toast = useToast()

const orgId = computed(() => authStore.user?.organizationId || '')
const isAdmin = computed(() => authStore.isPlatformAdmin)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const { isFeatureEnabled, loadFlags } = useFeatureFlags(orgId)

const {
  mainSection,
  activeSection,
  showSearchResultsPage,
  filteredMainNavigation,
  currentSubNavigation,
  getMainSectionLabel,
  selectMainSection,
  navigateTo,
} = useNavigation({ isAdmin, isFeatureEnabled, isSuperAdmin })

// Mobile menu state
const sidebarOpen = ref(false)
const subMenuOpen = ref(false)

// Global search
const showGlobalSearch = ref(false)
const searchResultsQuery = ref('')

function openGlobalSearch() {
  showGlobalSearch.value = true
}

function closeGlobalSearch() {
  showGlobalSearch.value = false
}

function handleSearchNavigate(query: string) {
  searchResultsQuery.value = query
  showSearchResultsPage.value = true
  showGlobalSearch.value = false
}

function closeSearchResultsPage() {
  showSearchResultsPage.value = false
  searchResultsQuery.value = ''
}

// Shipment detail (triggered from search)
const showShipmentDetail = ref(false)
const selectedShipment = ref<any>(null)

function handleSearchResultSelect(result: any) {
  selectedShipment.value = result
  showShipmentDetail.value = true
  showGlobalSearch.value = false
}

// Recharge modal
const showRechargeModal = ref(false)
const rechargeForm = ref({
  delivered: RECHARGE_DEFAULT_DELIVERED,
  returned: RECHARGE_DEFAULT_RETURNED,
})

function processRecharge(payload: { delivered: number; returned: number }) {
  if (!authStore.isDemoMode) {
    toast.success('Commande envoy\u00e9e \u2014 vos cr\u00e9dits seront ajout\u00e9s apr\u00e8s confirmation du paiement')
  } else {
    // Demo mode: add credits locally
    appStore.userBalance.delivered += payload.delivered
    appStore.userBalance.returned += payload.returned
    toast.success(`Cr\u00e9dits ajout\u00e9s: ${payload.delivered} livraison, ${payload.returned} retour`)
  }
  showRechargeModal.value = false
  rechargeForm.value = { delivered: RECHARGE_DEFAULT_DELIVERED, returned: RECHARGE_DEFAULT_RETURNED }
}

// Bulk import modal
const showBulkImportModal = ref(false)

async function handleBulkImport(payload: { type: 'excel' | 'manual'; rows: Partial<ShipmentInsert>[]; manualRows?: { recipient: string; phone: string; address: string; amount: number | null }[] }) {
  showBulkImportModal.value = false
  const orgId = authStore.user?.organizationId
  const userId = authStore.user?.id || null
  if (!orgId) {
    toast.error('Organisation introuvable')
    return
  }

  try {
    let inserts: ShipmentInsert[] = []

    // Find a connected carrier with API integration for this org (First Delivery or Navex)
    const supportedCarrier = appStore.carriers.find((c: any) => {
      const name = c.name.toLowerCase().trim()
      const isFirstDelivery = name === 'first' || name === 'first delivery' || name === 'first-delivery' || name === 'firstdelivery' || name === 'first delivery group'
      const isNavex = name === 'navex' || name === 'navex delivery'
      return (isFirstDelivery || isNavex) && c.apiStatus === 'connected'
    })
    const isNavexCarrier = supportedCarrier && ['navex', 'navex delivery'].includes(supportedCarrier.name.toLowerCase().trim())

    if (payload.type === 'excel') {
      inserts = payload.rows.map((row) => ({
        organization_id: orgId,
        created_by: userId,
        carrier_id: supportedCarrier?.id || null,
        recipient_name: row.recipient_name || '',
        recipient_phone: row.recipient_phone || '',
        recipient_phone_secondary: row.recipient_phone_secondary || null,
        recipient_address: row.recipient_address || '',
        governorate: row.governorate || '',
        delegation: row.delegation || null,
        product_description: row.product_description || null,
        is_fragile: row.is_fragile || false,
        allow_open: row.allow_open || false,
        cod_amount: row.cod_amount || 0,
        product_price: row.product_price || 0,
        delivery_fee: row.delivery_fee || 0,
      }))
    } else if (payload.manualRows) {
      inserts = payload.manualRows.map((row) => ({
        organization_id: orgId,
        created_by: userId,
        carrier_id: supportedCarrier?.id || null,
        recipient_name: row.recipient,
        recipient_phone: row.phone,
        recipient_address: row.address || '',
        governorate: '',
        cod_amount: row.amount || 0,
        product_price: row.amount || 0,
        delivery_fee: 0,
      }))
    }

    if (inserts.length === 0) return

    // 1. Insert all shipments into DB
    const createdShipments = await shipmentsService.createMany(inserts)
    toast.success(`${createdShipments.length} colis importés`)

    // 2. Register each shipment with the connected carrier API, then request pickup
    if (supportedCarrier && createdShipments.length > 0) {
      toast.success(`Envoi des colis au transporteur ${supportedCarrier.name}...`)

      const barCodes: string[] = []
      const shipmentIds: string[] = []
      let successCount = 0

      for (const shipment of createdShipments) {
        try {
          const { data, error } = await supabase.functions.invoke('carrier-proxy', {
            body: {
              carrierId: supportedCarrier.id,
              action: 'create-shipment',
              payload: {
                shipmentId: shipment.id,
                clientName: shipment.recipient_name,
                governorate: shipment.governorate,
                city: shipment.delegation || shipment.governorate,
                address: shipment.recipient_address,
                phone: shipment.recipient_phone,
                phone2: shipment.recipient_phone_secondary || undefined,
                price: shipment.cod_amount,
                designation: shipment.product_description || '',
                articleCount: 1,
              },
            },
          })

          if (!error && data?.result?.carrierTrackingNumber) {
            barCodes.push(data.result.carrierTrackingNumber)
            shipmentIds.push(shipment.id)
            successCount++
          } else {
            let detail = ''
            try {
              const response = (error as any)?.context
              if (response && typeof response.json === 'function') {
                const body = await response.json()
                detail = body?.error || body?.detail || ''
              }
            } catch { /* ignore */ }
            console.error(`[bulk-import] create-shipment failed for ${shipment.id}:`, error?.message, detail)
          }
        } catch (err: any) {
          console.error(`[bulk-import] create-shipment error for ${shipment.id}:`, err)
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount}/${createdShipments.length} colis envoyés au transporteur`)
      } else {
        toast.warning('Aucun colis envoyé au transporteur')
      }

      // 3. Request pickup for all successfully registered shipments (skip for Navex — auto-scheduled)
      if (barCodes.length > 0 && !isNavexCarrier) {
        try {
          // Create a pickup_request in DB
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          const scheduledDate = tomorrow.toISOString().split('T')[0]

          const pickup = await pickupsService.create({
            organization_id: orgId,
            carrier_id: supportedCarrier.id,
            scheduled_date: scheduledDate,
            time_slot: '08:00-10:00',
            address: appStore.orgContext.address || 'Adresse de ramassage',
            shipment_count: barCodes.length,
            notes: `Import automatique - ${barCodes.length} colis`,
          })

          // Link shipments to pickup
          await pickupsService.assignShipments(pickup.id, shipmentIds)

          // Call carrier-proxy request-pickup
          const { data: pickupData, error: pickupError } = await supabase.functions.invoke('carrier-proxy', {
            body: {
              carrierId: supportedCarrier.id,
              action: 'request-pickup',
              payload: {
                pickupId: pickup.id,
                barCodes,
              },
            },
          })

          if (!pickupError && pickupData?.result) {
            toast.success(`Demande de ramassage envoyée (${barCodes.length} colis)`)
          } else {
            let detail = ''
            try {
              const response = (pickupError as any)?.context
              if (response && typeof response.json === 'function') {
                const body = await response.json()
                detail = body?.error || body?.detail || ''
              }
            } catch { /* ignore */ }
            console.error('[bulk-import] request-pickup error:', pickupError?.message, detail)
            toast.warning('Colis créés mais la demande de ramassage a échoué')
          }
        } catch (pickupErr: any) {
          console.error('[bulk-import] pickup request failed:', pickupErr)
          toast.warning('Colis créés mais la demande de ramassage a échoué')
        }
      }
    }

    // Reload shipments to pick up the new ones
    await appStore.shipmentsData.load(appStore.orgContext)
  } catch (e: any) {
    toast.error('Erreur import: ' + (e.message || e))
  }
}

// Logout
async function handleLogout() {
  await authStore.signOut()
  router.push('/signin')
}

// Keyboard shortcut: Cmd+K for search
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (showGlobalSearch.value) {
      closeGlobalSearch()
    } else {
      openGlobalSearch()
    }
  }
}

// Provide functions for child views
provide('openBulkImport', () => { showBulkImportModal.value = true })
provide('openShipmentDetail', (shipment: any) => {
  selectedShipment.value = shipment
  showShipmentDetail.value = true
})
provide('subMenuOpen', subMenuOpen)

// Lifecycle
onMounted(async () => {
  document.addEventListener('keydown', handleGlobalKeydown)

  if (!authStore.isDemoMode) {
    await loadFlags()
    await appStore.loadAll()
    appStore.subscribe()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  appStore.unsubscribe()
})
</script>

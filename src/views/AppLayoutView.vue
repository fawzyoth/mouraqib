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

function handleBulkImport(payload: any) {
  // This will be handled by the shipments view via inject
  showBulkImportModal.value = false
}

// Logout
function handleLogout() {
  authStore.signOut()
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

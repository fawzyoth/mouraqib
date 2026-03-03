<template>
  <!-- Clients: All Clients -->
  <ClientsList
    v-if="activeSection === 'all-clients'"
    :clients="enrichedClients"
    :client-stats="computedClientStats"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @open-add-client="navigateTo('add-client')"
    @view-client="(c: any) => { selectedClient = c; showClientDetail = true }"
    @edit-client="(c: any) => { selectedClient = c; showClientDetail = true; enterEditMode(c) }"
    @toggle-vip="toggleClientVip"
    @toggle-blocked="toggleClientBlocked"
  />

  <!-- Clients: Add Client -->
  <AddClientForm
    v-else-if="activeSection === 'add-client'"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @submit="addClient"
    @cancel="navigateTo('all-clients')"
  />

  <!-- Clients: VIP -->
  <VipClients
    v-else-if="activeSection === 'vip-clients'"
    :clients="appStore.clients"
    :total-revenue="totalVipRevenue"
    :average-delivery-rate="avgVipDeliveryRate"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @view-client="(c: any) => { selectedClient = c; showClientDetail = true }"
    @remove-vip="toggleClientVip"
  />

  <!-- Clients: Blocked -->
  <BlockedClients
    v-else-if="activeSection === 'blocked-clients'"
    :clients="appStore.clients"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @view-client="(c: any) => { selectedClient = c; showClientDetail = true }"
    @unblock-client="toggleClientBlocked"
  />

  <!-- Clients: Statistics -->
  <ClientStatistics
    v-else-if="activeSection === 'client-stats'"
    :clients="enrichedClients"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Client Detail Panel -->
  <ClientDetailPanel
    :show="showClientDetail"
    :client="selectedClient"
    :is-editing="isEditingClient"
    :edit-form="editClientForm"
    :is-saving="isSavingClient"
    @close="selectedClient = null; showClientDetail = false; isEditingClient = false"
    @enter-edit="enterEditMode(selectedClient)"
    @cancel-edit="isEditingClient = false"
    @save="saveClientEdit"
  />
</template>

<script setup lang="ts">
import { computed, ref, reactive, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { subSectionRoutes } from '@/composables/useNavigation'

// Feature components
import ClientsList from '@/components/features/clients/ClientsList.vue'
import AddClientForm from '@/components/features/clients/AddClientForm.vue'
import VipClients from '@/components/features/clients/VipClients.vue'
import BlockedClients from '@/components/features/clients/BlockedClients.vue'
import ClientStatistics from '@/components/features/clients/ClientStatistics.vue'
import ClientDetailPanel from '@/components/features/clients/ClientDetailPanel.vue'

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

// Compute per-client stats from actual shipments data
const enrichedClients = computed(() => {
  const shipments = appStore.shipments
  // Build a map: clientId → { totalOrders, deliveredOrders, totalSpent }
  const statsMap = new Map<string, { totalOrders: number; deliveredOrders: number; totalSpent: number }>()
  for (const s of shipments) {
    if (!s.clientId) continue
    let entry = statsMap.get(s.clientId)
    if (!entry) {
      entry = { totalOrders: 0, deliveredOrders: 0, totalSpent: 0 }
      statsMap.set(s.clientId, entry)
    }
    entry.totalOrders++
    if (s.status === 'Delivered') {
      entry.deliveredOrders++
      entry.totalSpent += s.cod || 0
    }
  }
  return appStore.clients.map((client: any) => {
    const stats = statsMap.get(client.id)
    if (!stats) return { ...client, totalOrders: 0, deliveredOrders: 0, deliveryRate: 0, totalSpent: 0 }
    const deliveryRate = stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0
    return { ...client, totalOrders: stats.totalOrders, deliveredOrders: stats.deliveredOrders, deliveryRate, totalSpent: stats.totalSpent }
  })
})

const computedClientStats = computed(() => {
  const clients = enrichedClients.value
  const totalClients = clients.length
  const activeClients = clients.filter((c: any) => c.status === 'active').length
  const totalDelivered = clients.reduce((sum: number, c: any) => sum + c.deliveredOrders, 0)
  const totalOrders = clients.reduce((sum: number, c: any) => sum + c.totalOrders, 0)
  const deliveryRate = totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0
  const totalRevenue = clients.reduce((sum: number, c: any) => sum + c.totalSpent, 0)
  return { totalClients, activeClients, newThisMonth: 0, deliveryRate, totalRevenue }
})

// Client detail panel
const selectedClient = ref<any>(null)
const showClientDetail = ref(false)
const isEditingClient = ref(false)
const isSavingClient = ref(false)
const editClientForm = reactive({
  name: '',
  phone: '',
  phoneSecondary: '',
  email: '',
  address: '',
  region: '',
  delegation: '',
  locality: '',
  postalCode: '',
  status: 'active',
  notes: '',
})

// VIP stats
const totalVipRevenue = ref(0)
const avgVipDeliveryRate = ref(0)

function enterEditMode(client: any) {
  if (client) {
    editClientForm.name = client.name || ''
    editClientForm.phone = client.phone || ''
    editClientForm.phoneSecondary = client.phoneSecondary || ''
    editClientForm.email = client.email || ''
    editClientForm.address = client.address || ''
    editClientForm.region = client.region || ''
    editClientForm.delegation = client.delegation || ''
    editClientForm.locality = client.locality || ''
    editClientForm.postalCode = client.postalCode || ''
    editClientForm.status = client.status || 'active'
    editClientForm.notes = client.notes || ''
  }
  isEditingClient.value = true
}

async function saveClientEdit() {
  if (!selectedClient.value?.id) return
  isSavingClient.value = true
  try {
    const updated = await appStore.clientsData.update(selectedClient.value.id, editClientForm)
    if (updated) {
      selectedClient.value = { ...selectedClient.value, ...updated }
      isEditingClient.value = false
    }
  } finally {
    isSavingClient.value = false
  }
}

// Stubs (will be migrated from DTV)
function addClient(_data: any) { /* stub */ }
function toggleClientVip(_client: any) { /* stub */ }
function toggleClientBlocked(_client: any) { /* stub */ }
</script>

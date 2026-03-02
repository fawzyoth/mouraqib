<template>
  <!-- Clients: All Clients -->
  <ClientsList
    v-if="activeSection === 'all-clients'"
    :clients="appStore.clients"
    :client-stats="appStore.clientStats"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @open-add-client="navigateTo('add-client')"
    @view-client="(c: any) => { selectedClient = c; showClientDetail = true }"
    @edit-client="(c: any) => { selectedClient = c; showClientDetail = true; isEditingClient = true }"
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
    :clients="appStore.clients"
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
    @enter-edit="isEditingClient = true"
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

// Client detail panel
const selectedClient = ref<any>(null)
const showClientDetail = ref(false)
const isEditingClient = ref(false)
const isSavingClient = ref(false)
const editClientForm = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
})

// VIP stats
const totalVipRevenue = ref(0)
const avgVipDeliveryRate = ref(0)

// Stubs (will be migrated from DTV)
function addClient(_data: any) { /* stub */ }
function toggleClientVip(_client: any) { /* stub */ }
function toggleClientBlocked(_client: any) { /* stub */ }
function saveClientEdit() { /* stub */ }
</script>

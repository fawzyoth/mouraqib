<template>
  <div class="flex flex-col h-full">
    <header class="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Demande d'enlevement</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Selectionnez les colis a enlever et programmez le ramassage</p>
          </div>
        </div>
        <button
          @click="openConfirmModal"
          :disabled="selectedIds.length === 0"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedIds.length > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          ]"
        >
          <Truck class="w-4 h-4" />
          <span class="hidden sm:inline">Demander enlevement ({{ selectedIds.length }})</span>
          <span class="sm:hidden">{{ selectedIds.length }}</span>
        </button>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-4 sm:p-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{{ printedShipments.length }}</p>
              <p class="text-xs sm:text-sm text-gray-500">Prets</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{{ selectedIds.length }}</p>
              <p class="text-xs sm:text-sm text-gray-500">Selectionnes</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Wallet class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{{ selectedTotalCOD.toLocaleString() }}</p>
              <p class="text-xs sm:text-sm text-gray-500">COD (TND)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <!-- Search & Actions -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex-1 relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher par N bordereau, client, telephone..."
                class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <select
              v-model="carrierFilter"
              class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
            >
              <option value="all">Tous les transporteurs</option>
              <option v-for="c in carrierList" :key="c" :value="c">{{ c }}</option>
            </select>
            <button
              @click="toggleSelectAll"
              class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-nowrap"
            >
              {{ isAllSelected ? 'Tout deselectionner' : 'Tout selectionner' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="printedShipments.length === 0" class="p-12 text-center">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Aucun colis pret pour l'enlevement</p>
          <p class="text-sm text-gray-400 mt-1">Creez des colis et imprimez leurs bordereaux d'abord</p>
        </div>

        <!-- Shipments Table -->
        <div v-else class="table-responsive">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    :indeterminate="selectedIds.length > 0 && !isAllSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">N Bordereau</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Transporteur</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Telephone</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Destination</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">COD</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr
                v-for="shipment in filteredShipments"
                :key="shipment.id"
                @click="toggleSelection(shipment.id)"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                :class="selectedIds.includes(shipment.id) ? 'bg-orange-50 dark:bg-orange-900/10' : ''"
              >
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(shipment.id)"
                    @click.stop
                    @change="toggleSelection(shipment.id)"
                    class="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </td>
                <td class="px-4 py-3">
                  <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ shipment.labelNumber || shipment.trackingNumber || '—' }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded font-medium">{{ shipment.carrier }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ shipment.customerName }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.recipientPhone }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  <span class="truncate max-w-[180px] inline-block">{{ shipment.destination }}</span>
                </td>
                <td class="px-4 py-3 text-sm font-semibold text-orange-600">{{ (shipment.cod || shipment.totalPrice || 0).toLocaleString() }} TND</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter, Truck, Package, CheckCircle, Wallet, Search
} from 'lucide-vue-next'

const props = defineProps<{
  shipments: any[]
}>()

const emit = defineEmits<{
  'toggle-submenu': []
  'request-pickup': [shipmentIds: string[]]
}>()

const searchQuery = ref('')
const carrierFilter = ref('all')
const selectedIds = ref<string[]>([])

// Only show printed shipments not yet picked up
const printedShipments = computed(() =>
  props.shipments.filter((s: any) =>
    s.labelPrinted && s.status !== 'Picked up' && s.status !== 'Delivered' && s.status !== 'Returned' && s.status !== 'Cancelled'
  )
)

const carrierList = computed(() => {
  const carriers = new Set(printedShipments.value.map((s: any) => s.carrier).filter(Boolean))
  return [...carriers].sort()
})

const filteredShipments = computed(() => {
  let result = printedShipments.value

  if (carrierFilter.value !== 'all') {
    result = result.filter((s: any) => s.carrier === carrierFilter.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((s: any) =>
      (s.labelNumber || '').toLowerCase().includes(q) ||
      (s.trackingNumber || '').toLowerCase().includes(q) ||
      (s.customerName || '').toLowerCase().includes(q) ||
      (s.recipientPhone || '').toLowerCase().includes(q) ||
      (s.carrier || '').toLowerCase().includes(q)
    )
  }

  return result
})

const isAllSelected = computed(() =>
  filteredShipments.value.length > 0 && selectedIds.value.length === filteredShipments.value.length
)

const selectedTotalCOD = computed(() => {
  const idSet = new Set(selectedIds.value)
  return printedShipments.value
    .filter((s: any) => idSet.has(s.id))
    .reduce((sum: number, s: any) => sum + (s.cod || s.totalPrice || 0), 0)
})

function toggleSelection(id: string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredShipments.value.map((s: any) => s.id)
  }
}

function openConfirmModal() {
  if (selectedIds.value.length === 0) return
  emit('request-pickup', [...selectedIds.value])
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Header -->
    <header class="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Colis</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gerez tous vos colis et expeditions</p>
          </div>
        </div>
        <div class="flex items-center space-x-2 sm:space-x-3">
          <button class="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
            <Upload class="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button
            @click="$emit('open-bulk-import')"
            class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
          >
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Importer</span>
          </button>
          <button
            @click="$emit('open-add-shipment')"
            class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <Plus class="w-4 h-4" />
            <span class="hidden sm:inline">Nouveau colis</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <!-- Status Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-800 px-4">
          <div class="flex items-center space-x-1 overflow-x-auto">
            <button
              v-for="tab in statusTabs"
              :key="tab.id"
              @click="activeStatusTab = tab.id"
              :class="[
                'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeStatusTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              ]"
            >
              {{ tab.label }}
              <span v-if="tab.count !== undefined" class="ml-1 text-gray-400">({{ tab.count }})</span>
            </button>
            <button class="px-3 py-3 text-gray-400 hover:text-gray-600">
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par numero de suivi ou transporteur..."
              class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveColumnFilters" class="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-wrap">
          <span class="text-xs text-gray-500">Filtres:</span>
          <template v-for="col in columns" :key="col.key">
            <span v-if="columnFilters[col.key]" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
              {{ col.label }}: {{ columnFilters[col.key] }}
              <button @click="columnFilters[col.key] = ''" class="hover:text-orange-900 dark:hover:text-orange-200">
                <X class="w-3 h-3" />
              </button>
            </span>
          </template>
          <button @click="clearAllFilters" class="text-xs text-gray-500 hover:text-red-500 ml-1">Tout effacer</button>
        </div>

        <!-- Table -->
        <div class="table-responsive">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th v-for="col in columns" :key="col.key" class="px-4 py-0 text-left">
                <div class="relative">
                  <!-- Sort button -->
                  <button
                    @click="toggleSort(col.key)"
                    class="w-full flex items-center gap-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                    :class="sortKey === col.key ? 'text-orange-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                  >
                    <span>{{ col.label }}</span>
                    <template v-if="sortKey === col.key">
                      <ChevronUp v-if="sortDir === 'asc'" class="w-3.5 h-3.5" />
                      <ChevronDown v-else class="w-3.5 h-3.5" />
                    </template>
                    <ArrowUpDown v-else class="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </button>
                  <!-- Filter toggle -->
                  <button
                    v-if="col.filterable"
                    @click.stop="toggleColumnFilter(col.key)"
                    class="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    :class="columnFilters[col.key] ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'"
                  >
                    <Filter class="w-3 h-3" />
                  </button>
                </div>
                <!-- Inline filter input -->
                <div v-if="openFilter === col.key" class="pb-2">
                  <input
                    ref="filterInputRef"
                    v-model="columnFilters[col.key]"
                    type="text"
                    :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                    class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    @keydown.escape="openFilter = null"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="shipment in paginatedShipments" :key="shipment.id" @click="$emit('select-shipment', shipment)" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <td class="px-4 py-3" data-label="N Suivi">
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Exemple</span>
                  <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Transporteur">{{ shipment.carrier }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Client">{{ shipment.client || '-' }}</td>
              <td class="px-4 py-3" data-label="Statut">
                <span :class="['inline-flex items-center space-x-1 text-sm font-medium', getStatusTextClass(shipment.status)]">
                  <span :class="['w-2 h-2 rounded-full', getStatusDotClass(shipment.status)]"></span>
                  <span>{{ getStatusLabel(shipment.status) }}</span>
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Evenement">{{ shipment.latestEvent }}</td>
              <td class="px-4 py-3" data-label="Origine">
                <div class="flex items-center space-x-2">
                  <span class="text-lg">{{ shipment.originFlag }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ shipment.origin }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Lignes par page</span>
            <select v-model="pageSize" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <span class="text-sm text-gray-600 dark:text-gray-400">— {{ paginatedShipments.length }} sur {{ filteredShipments.length }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <button @click="currentPage--" :disabled="currentPage <= 1" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-50">
              <ChevronLeft class="w-4 h-4" />
            </button>
            <span class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">{{ currentPage }}</span>
            <span class="text-sm text-gray-500">/ {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage >= totalPages" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-50">
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import {
  ListFilter,
  Upload,
  Download,
  Plus,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Filter,
  X
} from 'lucide-vue-next'
import { getStatusLabel, getStatusTextClass, getStatusDotClass } from '@/composables/useStatusFormatting'

interface StatusTab {
  id: string
  label: string
  count?: number
}

interface Shipment {
  id: number
  trackingNumber: string
  carrier: string
  client?: string
  status: string
  latestEvent: string
  originFlag: string
  origin: string
  [key: string]: any
}

const props = defineProps<{
  shipments: Shipment[]
  statusTabs: StatusTab[]
}>()

defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'open-bulk-import'): void
  (e: 'open-add-shipment'): void
  (e: 'select-shipment', shipment: Shipment): void
}>()

const columns = [
  { key: 'trackingNumber', label: 'Numero de suivi', filterable: true },
  { key: 'carrier', label: 'Transporteur', filterable: true },
  { key: 'client', label: 'Client', filterable: true },
  { key: 'status', label: 'Statut', filterable: true },
  { key: 'latestEvent', label: 'Dernier evenement', filterable: false },
  { key: 'origin', label: 'Origine', filterable: true },
]

const activeStatusTab = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSizeOptions = [5, 10, 15, 20, 50, 100]
const pageSize = ref(20)

// Sort
const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: string) {
  if (sortKey.value === key) {
    if (sortDir.value === 'asc') {
      sortDir.value = 'desc'
    } else {
      sortKey.value = null
      sortDir.value = 'asc'
    }
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

// Column filters
const columnFilters = reactive<Record<string, string>>({
  trackingNumber: '',
  carrier: '',
  client: '',
  status: '',
  origin: '',
})
const openFilter = ref<string | null>(null)
const filterInputRef = ref<HTMLInputElement[] | null>(null)

function toggleColumnFilter(key: string) {
  openFilter.value = openFilter.value === key ? null : key
  if (openFilter.value) {
    nextTick(() => {
      if (filterInputRef.value?.length) {
        filterInputRef.value[0].focus()
      }
    })
  }
}

const hasActiveColumnFilters = computed(() =>
  Object.values(columnFilters).some(v => v !== '')
)

function clearAllFilters() {
  for (const key of Object.keys(columnFilters)) {
    columnFilters[key] = ''
  }
  openFilter.value = null
}

const filteredShipments = computed(() => {
  let result = props.shipments

  // Status tab filter
  if (activeStatusTab.value !== 'all') {
    const statusMap: Record<string, string> = {
      'exception': 'Exception',
      'failed': 'Failed attempt',
      'expired': 'Expired',
      'out-for-delivery': 'Out for delivery',
      'delivered': 'Delivered',
      'pending': 'Pending'
    }
    result = result.filter(s => s.status === statusMap[activeStatusTab.value])
  }

  // Global search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.trackingNumber.toLowerCase().includes(q) ||
      s.carrier.toLowerCase().includes(q)
    )
  }

  // Per-column filters
  for (const [key, val] of Object.entries(columnFilters)) {
    if (val) {
      const q = val.toLowerCase()
      result = result.filter(s => {
        const cell = String(s[key] ?? '').toLowerCase()
        return cell.includes(q)
      })
    }
  }

  // Sort
  if (sortKey.value) {
    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    result = [...result].sort((a, b) => {
      const va = String(a[key] ?? '').toLowerCase()
      const vb = String(b[key] ?? '').toLowerCase()
      return va < vb ? -dir : va > vb ? dir : 0
    })
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredShipments.value.length / pageSize.value)))

const paginatedShipments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredShipments.value.slice(start, start + pageSize.value)
})

// Reset to page 1 when filters or page size change
watch([activeStatusTab, searchQuery, pageSize, columnFilters], () => {
  currentPage.value = 1
})
</script>

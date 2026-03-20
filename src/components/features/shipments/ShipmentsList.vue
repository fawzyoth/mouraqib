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
          <button
            @click="$emit('open-pickup-modal')"
            class="flex items-center gap-1.5 px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Truck class="w-4 h-4" />
            <span class="hidden sm:inline">Pickup</span>
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
              {{ col.label }}: {{ col.key === 'status' ? getStatusLabel(columnFilters[col.key]) : columnFilters[col.key] }}
              <button @click="clearColumnFilter(col.key)" class="hover:text-orange-900 dark:hover:text-orange-200">
                <X class="w-3 h-3" />
              </button>
            </span>
            <span v-if="dateFilters[col.key] && (dateFilters[col.key].from || dateFilters[col.key].to)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
              {{ col.label }}: {{ dateFilters[col.key].from || '...' }} → {{ dateFilters[col.key].to || '...' }}
              <button @click="clearDateFilter(col.key)" class="hover:text-orange-900 dark:hover:text-orange-200">
                <X class="w-3 h-3" />
              </button>
            </span>
          </template>
          <button @click="clearAllFilters" class="text-xs text-gray-500 hover:text-red-500 ml-1">Tout effacer</button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
        <table class="w-full min-w-[1000px]">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th v-for="col in columns" :key="col.key" :class="['px-4 py-0 text-left', col.width]">
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
                    :class="(columnFilters[col.key] || (dateFilters[col.key] && (dateFilters[col.key].from || dateFilters[col.key].to))) ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'"
                  >
                    <Filter class="w-3 h-3" />
                  </button>
                </div>
                <!-- Inline filter input -->
                <div v-if="openFilter === col.key" class="pb-2">
                  <!-- Date range inputs -->
                  <template v-if="col.type === 'date'">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-1">
                        <span class="text-[10px] text-gray-400 w-5 shrink-0">De</span>
                        <input
                          ref="filterInputRef"
                          v-model="dateFilters[col.key].from"
                          type="date"
                          class="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          @keydown.escape="openFilter = null"
                        />
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="text-[10px] text-gray-400 w-5 shrink-0">A</span>
                        <input
                          v-model="dateFilters[col.key].to"
                          type="date"
                          class="w-full px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          @keydown.escape="openFilter = null"
                        />
                      </div>
                      <button
                        v-if="dateFilters[col.key].from || dateFilters[col.key].to"
                        @click="clearDateFilter(col.key)"
                        class="text-[10px] text-gray-400 hover:text-red-500 text-right"
                      >
                        Effacer
                      </button>
                    </div>
                  </template>
                  <!-- Plain text input for trackingNumber and recipientPhone -->
                  <template v-else-if="col.key === 'trackingNumber' || col.key === 'recipientPhone'">
                    <input
                      ref="filterInputRef"
                      v-model="columnFilters[col.key]"
                      type="text"
                      :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                      class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      @keydown.escape="openFilter = null"
                    />
                  </template>
                  <!-- Typeahead select for carrier, client, status -->
                  <template v-else>
                    <TypeaheadFilter
                      v-model="columnFilters[col.key]"
                      :options="uniqueColumnValues[col.key] || []"
                      :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                      :display-fn="col.key === 'status' ? getStatusLabel : undefined"
                    />
                  </template>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="shipment in paginatedShipments" :key="shipment.id" @click="$emit('select-shipment', shipment)" class="group even:bg-gray-50/50 even:dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <td class="px-4 py-3" data-label="N Suivi">
                <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Transporteur">{{ shipment.carrier }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Client">{{ shipment.client || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono" data-label="Téléphone">{{ shipment.recipientPhone || '-' }}</td>
              <td class="px-4 py-3" data-label="Statut">
                <span :class="['inline-flex items-center space-x-1 text-sm font-medium whitespace-nowrap', getStatusTextClass(shipment.status)]">
                  <span :class="['w-2 h-2 rounded-full flex-shrink-0', getStatusDotClass(shipment.status)]"></span>
                  <span>{{ getStatusLabel(shipment.status) }}</span>
                </span>
                <div v-if="shipment.outScannedAt && shipment.status === 'En attente'" class="text-xs text-green-600 dark:text-green-400">prêt et scanné</div>
                <div v-if="shipment.inScannedAt" class="text-xs text-green-600 dark:text-green-400">retour scanné</div>
              </td>
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Prix">{{ shipment.amount ? shipment.amount.toFixed(2) : '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" data-label="Création">
                <template v-if="shipment.createdAt">
                  <div>{{ formatDateShort(shipment.createdAt) }}</div>
                  <div class="text-xs text-gray-400">{{ formatTime(shipment.createdAt) }}</div>
                </template>
                <template v-else>-</template>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" data-label="Scan Pickup">
                <template v-if="shipment.outScannedAt">
                  <div>{{ formatDateShort(shipment.outScannedAt) }}</div>
                  <div class="text-xs text-gray-400">{{ formatTime(shipment.outScannedAt) }}</div>
                </template>
                <template v-else>-</template>
              </td>
              <td v-if="showScanRetourColumn" class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" data-label="Scan Retour">
                <template v-if="shipment.inScannedAt">
                  <div>{{ formatDateShort(shipment.inScannedAt) }}</div>
                  <div class="text-xs text-gray-400">{{ formatTime(shipment.inScannedAt) }}</div>
                </template>
                <template v-else>-</template>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" data-label="Livraison">
                <template v-if="shipment.deliveryDate">
                  <div>{{ formatDateShort(shipment.deliveryDate) }}</div>
                  <div class="text-xs text-gray-400">{{ formatTime(shipment.deliveryDate) }}</div>
                </template>
                <template v-else>-</template>
              </td>
              <td class="px-4 py-3 text-sm whitespace-nowrap" data-label="Durée">
                <template v-if="shipment.createdAt">
                  <span :class="durationClass(shipment.createdAt, shipment.deliveryDate)" class="inline-flex items-center gap-1 font-medium">
                    <CheckCircle2 v-if="durationHours(shipment.createdAt, shipment.deliveryDate) < 48" class="w-3.5 h-3.5" />
                    <AlertTriangle v-else-if="durationHours(shipment.createdAt, shipment.deliveryDate) < 72" class="w-3.5 h-3.5" />
                    <XCircle v-else class="w-3.5 h-3.5" />
                    {{ formatDuration(shipment.createdAt, shipment.deliveryDate) }}
                  </span>
                </template>
                <template v-else>-</template>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Sync">{{ formatSyncDate(shipment.lastSyncedAt) }}</td>
              <td class="px-4 py-1" data-label="">
                <button
                  v-if="shipment.deletionRequestedAt"
                  class="p-1.5 rounded-lg text-orange-500"
                  title="Suppression demandee"
                  @click.stop
                >
                  <Clock class="w-4 h-4" />
                </button>
                <button
                  v-else
                  class="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Demander la suppression"
                  @click.stop="$emit('request-deletion', shipment)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
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
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ListFilter,
  Upload,
  Download,
  Plus,
  Truck,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-vue-next'
import { getStatusLabel, getStatusTextClass, getStatusDotClass } from '@/composables/useStatusFormatting'
import TypeaheadFilter from '@/components/shared/TypeaheadFilter.vue'

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
  amount: number
  createdAt: string
  deliveryDate: string | null
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
  (e: 'open-pickup-modal'): void
  (e: 'select-shipment', shipment: Shipment): void
  (e: 'request-deletion', shipment: Shipment): void
}>()

const showScanRetourColumn = computed(() => activeStatusTab.value === 'all' || activeStatusTab.value === 'returned')

const columns = computed(() => {
  const base = [
    { key: 'trackingNumber', label: 'Numero de suivi', filterable: true },
    { key: 'carrier', label: 'Trans.', filterable: true, width: 'w-16' },
    { key: 'client', label: 'Client', filterable: true },
    { key: 'recipientPhone', label: 'Téléphone', filterable: true },
    { key: 'status', label: 'Statut', filterable: true },
    { key: 'amount', label: 'Prix', filterable: false },
    { key: 'createdAt', label: 'Création', filterable: true, type: 'date' },
    { key: 'outScannedAt', label: 'Scan Pickup', filterable: true, type: 'date' },
    ...(showScanRetourColumn.value ? [{ key: 'inScannedAt', label: 'Scan Retour', filterable: true, type: 'date' }] : []),
    { key: 'deliveryDate', label: 'Livraison', filterable: true, type: 'date' },
    { key: 'duration', label: 'Durée', filterable: false },
    { key: 'lastSyncedAt', label: 'Last Sync', filterable: true, type: 'date', width: 'w-24' },
  ]
  return base
})

const route = useRoute()
const router = useRouter()

// ---------------------------------------------------------------------------
// Filter state — initialized from URL query params
// ---------------------------------------------------------------------------
const q = route.query
const columnFilterKeys = ['trackingNumber', 'carrier', 'client', 'status', 'recipientPhone']
const dateFilterKeys = ['createdAt', 'outScannedAt', 'inScannedAt', 'deliveryDate', 'lastSyncedAt']

const activeStatusTab = ref((q.tab as string) || 'active')
const searchQuery = ref((q.q as string) || '')
const currentPage = ref(parseInt(q.page as string) || 1)
const pageSizeOptions = [5, 10, 15, 20, 50, 100]
const pageSize = ref(parseInt(q.size as string) || 20)

// Sort
const sortKey = ref<string | null>((q.sort as string) || null)
const sortDir = ref<'asc' | 'desc'>(((q.dir as string) || 'asc') as 'asc' | 'desc')

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
const columnFilters = reactive<Record<string, string>>(
  Object.fromEntries(columnFilterKeys.map(k => [k, (q[`f_${k}`] as string) || '']))
)

// Date range filters
const dateFilters = reactive<Record<string, { from: string; to: string }>>(
  Object.fromEntries(dateFilterKeys.map(k => [k, { from: (q[`df_${k}`] as string) || '', to: (q[`dt_${k}`] as string) || '' }]))
)

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
  Object.values(columnFilters).some(v => v !== '') ||
  Object.values(dateFilters).some(v => v.from !== '' || v.to !== '')
)

function clearAllFilters() {
  for (const key of Object.keys(columnFilters)) {
    columnFilters[key] = ''
  }
  for (const key of Object.keys(dateFilters)) {
    dateFilters[key].from = ''
    dateFilters[key].to = ''
  }
  openFilter.value = null
}

function clearDateFilter(key: string) {
  dateFilters[key].from = ''
  dateFilters[key].to = ''
}

// Unique values per column derived from all shipments
const uniqueColumnValues = computed(() => {
  const result: Record<string, string[]> = {}
  for (const key of ['carrier', 'client', 'status']) {
    const values = new Set<string>()
    for (const s of props.shipments) {
      const val = s[key]
      if (val && String(val).trim()) {
        values.add(String(val))
      }
    }
    result[key] = Array.from(values).sort((a, b) => a.localeCompare(b, 'fr'))
  }
  return result
})

function clearColumnFilter(key: string) {
  columnFilters[key] = ''
}

// ---------------------------------------------------------------------------
// Bidirectional URL sync
// ---------------------------------------------------------------------------
let skipUrlSync = false

function syncToUrl() {
  if (skipUrlSync) return
  const params: Record<string, string> = {}
  params.tab = activeStatusTab.value
  if (searchQuery.value) params.q = searchQuery.value
  if (sortKey.value) params.sort = sortKey.value
  if (sortKey.value && sortDir.value !== 'asc') params.dir = sortDir.value
  if (currentPage.value > 1) params.page = String(currentPage.value)
  if (pageSize.value !== 20) params.size = String(pageSize.value)
  for (const [key, val] of Object.entries(columnFilters)) {
    if (val) params[`f_${key}`] = val
  }
  for (const [key, range] of Object.entries(dateFilters)) {
    if (range.from) params[`df_${key}`] = range.from
    if (range.to) params[`dt_${key}`] = range.to
  }
  router.replace({ query: params })
}

watch(
  [activeStatusTab, searchQuery, sortKey, sortDir, currentPage, pageSize, columnFilters, dateFilters],
  syncToUrl,
  { deep: true }
)

// Sync URL → filters (back/forward navigation)
watch(() => route.query, (newQ) => {
  skipUrlSync = true
  activeStatusTab.value = (newQ.tab as string) || 'active'
  searchQuery.value = (newQ.q as string) || ''
  sortKey.value = (newQ.sort as string) || null
  sortDir.value = ((newQ.dir as string) || 'asc') as 'asc' | 'desc'
  currentPage.value = parseInt(newQ.page as string) || 1
  pageSize.value = parseInt(newQ.size as string) || 20
  for (const key of columnFilterKeys) {
    columnFilters[key] = (newQ[`f_${key}`] as string) || ''
  }
  for (const key of dateFilterKeys) {
    dateFilters[key].from = (newQ[`df_${key}`] as string) || ''
    dateFilters[key].to = (newQ[`dt_${key}`] as string) || ''
  }
  nextTick(() => { skipUrlSync = false })
})

const filteredShipments = computed(() => {
  let result = props.shipments

  // Status tab filter
  if (activeStatusTab.value === 'active') {
    const excludedSet = new Set(['Livré', 'Supprimé', "Demande d'enlèvement annulé"])
    result = result.filter(s => !excludedSet.has(s.status) && !s.inScannedAt)
  } else if (activeStatusTab.value !== 'all') {
    const statusGroups: Record<string, Set<string>> = {
      'pending': new Set(['En attente', 'A vérifier']),
      'pickup': new Set(["Demande d'enlèvement", "Demande d'enlèvement assignée", "En cours d'enlèvement", 'Enlevé']),
      'in-progress': new Set(['En cours', 'Au magasin', 'Echange', 'Rtn dépôt']),
      'delivered': new Set(['Livré']),
      'returned': new Set(['Retour Expéditeur', 'Rtn client/agence', 'Retour reçu', 'Rtn définitif', 'Retour assigné', "Retour en cours d'expédition", 'Retour enlevé', 'Retour Annulé']),
      'cancelled': new Set(['Supprimé', "Demande d'enlèvement annulé"]),
    }
    const group = statusGroups[activeStatusTab.value]
    if (group) {
      result = result.filter(s => group.has(s.status))
    }
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

  // Date range filters
  for (const [key, range] of Object.entries(dateFilters)) {
    if (range.from || range.to) {
      result = result.filter(s => {
        const raw = s[key]
        if (!raw) return false
        const d = new Date(raw)
        if (isNaN(d.getTime())) return false
        const dateStr = d.toISOString().slice(0, 10) // YYYY-MM-DD
        if (range.from && dateStr < range.from) return false
        if (range.to && dateStr > range.to) return false
        return true
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
watch([activeStatusTab, searchQuery, pageSize, columnFilters, dateFilters], () => {
  currentPage.value = 1
}, { deep: true })

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric'
  return d.toLocaleDateString('fr-FR', opts)
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function durationHours(createdAt: string, deliveryDate: string | null | undefined): number {
  const start = new Date(createdAt).getTime()
  const end = deliveryDate ? Math.min(new Date(deliveryDate).getTime(), now.value) : now.value
  return (end - start) / 3_600_000
}

function formatDuration(createdAt: string, deliveryDate: string | null | undefined): string {
  const h = durationHours(createdAt, deliveryDate)
  if (h < 0) return '-'
  const days = Math.floor(h / 24)
  const hrs = Math.floor(h % 24)
  if (days > 0) return `${days}j ${hrs}h`
  return `${Math.floor(h)}h`
}

function durationClass(createdAt: string, deliveryDate: string | null | undefined): string {
  const h = durationHours(createdAt, deliveryDate)
  if (h < 48) return 'text-green-600 dark:text-green-400'
  if (h < 72) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

// Reactive ticker for relative sync times
const now = ref(Date.now())
let tickerInterval: ReturnType<typeof setInterval> | null = null
onMounted(() => { tickerInterval = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { if (tickerInterval) clearInterval(tickerInterval) })

function formatSyncDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const diffSec = Math.floor((now.value - d.getTime()) / 1000)
  if (diffSec < 100) return `${diffSec}s`
  const today = new Date(now.value)
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

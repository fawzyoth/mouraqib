<template>
  <div class="flex flex-col h-full overflow-hidden">
    <header class="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Bordereaux</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gerez et imprimez vos etiquettes d'envoi</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center space-x-3">
          <button
            @click="$emit('print-selected', selectedLabels)"
            :disabled="selectedLabels.length === 0 || printing"
            :class="[
              'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedLabels.length > 0 && !printing
                ? 'bg-primary-blue hover:bg-primary-blue-hover text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            ]"
          >
            <Loader2 v-if="printing" class="w-4 h-4 animate-spin" />
            <Printer v-else class="w-4 h-4" />
            <span>{{ printing ? 'Fusion en cours...' : `Imprimer (${selectedLabels.length})` }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Table Container -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <!-- Status Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-800 px-4">
          <div class="flex items-center space-x-1 overflow-x-auto">
            <button
              v-for="tab in labelTabs"
              :key="tab.id"
              @click="labelFilterPrinted = tab.id"
              :class="[
                'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                labelFilterPrinted === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              ]"
            >
              {{ tab.label }}
              <span class="ml-1 text-gray-400">({{ tab.count }})</span>
            </button>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-4">
            <div class="flex-1 relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="labelSearchQuery"
                type="text"
                placeholder="Rechercher par N bordereau, client, telephone..."
                class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <button
              @click="selectAllLabels"
              class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {{ selectedLabels.length === filteredLabels.length && filteredLabels.length > 0 ? 'Tout deselectionner' : 'Tout selectionner' }}
            </button>
          </div>
        </div>

        <!-- Active Column Filters -->
        <div v-if="hasActiveColumnFilters" class="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-wrap">
          <span class="text-xs text-gray-500">Filtres:</span>
          <template v-for="col in columns" :key="col.key">
            <span v-if="columnFilters[col.key]" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
              {{ col.label }}: {{ columnFilters[col.key] }}
              <button @click="columnFilters[col.key] = ''" class="hover:text-orange-900 dark:hover:text-orange-200">
                <X class="w-3 h-3" />
              </button>
            </span>
            <span v-if="dateFilters[col.key] && (dateFilters[col.key].from || dateFilters[col.key].to)" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
              {{ col.label }}: {{ dateFilters[col.key].from || '...' }} &rarr; {{ dateFilters[col.key].to || '...' }}
              <button @click="clearDateFilter(col.key)" class="hover:text-orange-900 dark:hover:text-orange-200">
                <X class="w-3 h-3" />
              </button>
            </span>
          </template>
          <button @click="clearAllFilters" class="text-xs text-gray-500 hover:text-red-500 ml-1">Tout effacer</button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
          <table class="w-full min-w-[800px]">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <!-- Checkbox column header -->
                <th class="px-4 py-0 w-10">
                  <div class="flex items-center py-2.5">
                    <input
                      type="checkbox"
                      :checked="selectedLabels.length === filteredLabels.length && filteredLabels.length > 0"
                      :indeterminate="selectedLabels.length > 0 && selectedLabels.length < filteredLabels.length"
                      @change="selectAllLabels"
                      class="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                    />
                  </div>
                </th>
                <!-- Sortable/filterable columns -->
                <th v-for="col in columns" :key="col.key" class="px-4 py-0 text-left">
                  <div class="relative">
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
                    <button
                      v-if="col.filterable"
                      @click.stop="toggleColumnFilter(col.key)"
                      class="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      :class="(columnFilters[col.key] || (dateFilters[col.key] && (dateFilters[col.key].from || dateFilters[col.key].to))) ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'"
                    >
                      <Filter class="w-3 h-3" />
                    </button>
                  </div>
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
                    <!-- Typeahead select -->
                    <template v-else-if="col.type === 'typeahead'">
                      <TypeaheadFilter
                        v-model="columnFilters[col.key]"
                        :options="uniqueColumnValues[col.key] || []"
                        :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                      />
                    </template>
                    <!-- Plain text input -->
                    <template v-else>
                      <input
                        ref="filterInputRef"
                        v-model="columnFilters[col.key]"
                        type="text"
                        :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                        class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        @keydown.escape="openFilter = null"
                      />
                    </template>
                  </div>
                </th>
                <!-- Actions column header -->
                <th class="px-4 py-0 text-left">
                  <div class="py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr
                v-for="shipment in paginatedLabels"
                :key="shipment.id"
                @click="$emit('select-shipment', shipment)"
                class="even:bg-gray-50/50 even:dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                :class="selectedLabels.includes(shipment.id) ? 'bg-orange-50 dark:bg-orange-900/10' : ''"
              >
                <!-- Checkbox -->
                <td class="px-4 py-3" data-label="">
                  <input
                    type="checkbox"
                    :checked="selectedLabels.includes(shipment.id)"
                    @change="toggleLabelSelection(shipment.id)"
                    class="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                  />
                </td>
                <!-- Label Number -->
                <td class="px-4 py-3" data-label="N Bordereau">
                  <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ shipment.labelNumber || shipment.trackingNumber || '—' }}</span>
                </td>
                <!-- Carrier -->
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Transporteur">
                  <span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded font-medium">
                    {{ shipment.carrier }}
                  </span>
                </td>
                <!-- Customer Name -->
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white" data-label="Client">{{ shipment.customerName }}</td>
                <!-- Status -->
                <td class="px-4 py-3" data-label="Statut">
                  <span
                    :class="[
                      'px-2 py-0.5 text-xs rounded font-medium whitespace-nowrap',
                      shipment.labelPrinted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    ]"
                  >{{ shipment.labelPrinted ? 'Imprimé' : 'A imprimer' }}</span>
                </td>
                <!-- COD -->
                <td class="px-4 py-3 text-sm font-semibold text-orange-600" data-label="Montant COD">
                  {{ shipment.cod?.toLocaleString() }}
                </td>
                <!-- Created At -->
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" data-label="Création">
                  {{ formatDate(shipment.createdAt) }}
                </td>
                <!-- Label Printed At -->
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" data-label="Imprimé le">
                  {{ formatDate(shipment.labelPrintedAt) }}
                </td>
                <!-- Actions -->
                <td class="px-4 py-3" data-label="Actions">
                  <button
                    @click.stop="$emit('open-label-preview', shipment)"
                    class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Imprimer le bordereau"
                  >
                    <Printer class="w-4 h-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredLabels.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-500 dark:text-gray-400">Aucun bordereau trouve</p>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Lignes par page</span>
            <select v-model="pageSize" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <span class="text-sm text-gray-600 dark:text-gray-400">— {{ paginatedLabels.length }} sur {{ filteredLabels.length }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <button @click="currentPage--" :disabled="currentPage <= 1" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-50">
              <ChevronLeft class="w-4 h-4" />
            </button>
            <span class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">{{ currentPage }}</span>
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
  Printer,
  FileText,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Loader2
} from 'lucide-vue-next'
import TypeaheadFilter from '@/components/shared/TypeaheadFilter.vue'

interface LabelShipment {
  id: number
  labelNumber: string
  labelPrinted: boolean
  labelPrintedAt?: string | null
  carrier: string
  fragile?: boolean
  customerName: string
  recipientPhone: string
  recipientAddress: string
  weight: number
  dimensions: string
  cod?: number
  trackingNumber?: string
  createdAt?: string
  [key: string]: any
}

const props = withDefaults(defineProps<{
  shipments: LabelShipment[]
  printing?: boolean
}>(), {
  printing: false,
})

defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'print-selected', ids: number[]): void
  (e: 'open-label-preview', shipment: LabelShipment): void
  (e: 'select-shipment', shipment: LabelShipment): void
}>()

const columns = [
  { key: 'labelNumber', label: 'N\u00b0 Bordereau', filterable: true },
  { key: 'carrier', label: 'Transporteur', filterable: true, type: 'typeahead' },
  { key: 'customerName', label: 'Client', filterable: true, type: 'typeahead' },
  { key: 'printStatus', label: 'Statut', filterable: true, type: 'typeahead' },
  { key: 'cod', label: 'Montant', filterable: false },
  { key: 'createdAt', label: 'Création', filterable: true, type: 'date' as const },
  { key: 'labelPrintedAt', label: 'Imprimé le', filterable: true, type: 'date' as const },
]

const selectedLabels = ref<number[]>([])
const labelSearchQuery = ref('')
const labelFilterPrinted = ref('active')

const excludedStatuses = new Set(['Livré', 'Supprimé', "Demande d'enlèvement annulé", 'Retour Expéditeur', 'Rtn client/agence', 'Retour reçu', 'Rtn définitif', 'Retour assigné', "Retour en cours d'expédition", 'Retour enlevé', 'Retour Annulé'])

const activeShipments = computed(() => props.shipments.filter(s => !excludedStatuses.has(s.status)))

// Tab definitions
const labelTabs = computed(() => [
  { id: 'active', label: 'Actifs', count: activeShipments.value.length },
  { id: 'unprinted', label: 'A imprimer', count: unprintedLabelsCount.value },
  { id: 'printed', label: 'Imprimé', count: printedLabelsCount.value },
  { id: 'all', label: 'Tous', count: props.shipments.length },
])

// Sort state
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
  labelNumber: '',
  carrier: '',
  customerName: '',
  printStatus: '',
})

// Date range filters
const dateFilterKeys = ['createdAt', 'labelPrintedAt']
const dateFilters = reactive<Record<string, { from: string; to: string }>>(
  Object.fromEntries(dateFilterKeys.map(k => [k, { from: '', to: '' }]))
)

const typeaheadKeys = ['carrier', 'customerName', 'printStatus']
const uniqueColumnValues = computed(() => {
  const result: Record<string, string[]> = {}
  result['printStatus'] = ['Imprimé', 'A imprimer']
  for (const key of typeaheadKeys.filter(k => k !== 'printStatus')) {
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

// Pagination
const currentPage = ref(1)
const pageSizeOptions = [10, 20, 50, 100]
const pageSize = ref(20)

// Stats
const printedLabelsCount = computed(() => {
  return props.shipments.filter(s => s.labelPrinted).length
})

const unprintedLabelsCount = computed(() => {
  return props.shipments.filter(s => !s.labelPrinted).length
})

// Filtered labels with column filters and sorting
const filteredLabels = computed(() => {
  let result = props.shipments

  // Tab filter
  if (labelFilterPrinted.value === 'active') {
    result = result.filter(s => !excludedStatuses.has(s.status))
  } else if (labelFilterPrinted.value === 'printed') {
    result = result.filter(s => s.labelPrinted)
  } else if (labelFilterPrinted.value === 'unprinted') {
    result = result.filter(s => !s.labelPrinted)
  }

  // Global search
  if (labelSearchQuery.value) {
    const query = labelSearchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.labelNumber?.toLowerCase().includes(query) ||
      s.customerName?.toLowerCase().includes(query) ||
      s.recipientPhone?.toLowerCase().includes(query) ||
      s.trackingNumber?.toLowerCase().includes(query) ||
      s.carrier?.toLowerCase().includes(query)
    )
  }

  // Per-column filters
  for (const [key, val] of Object.entries(columnFilters)) {
    if (val) {
      const q = val.toLowerCase()
      result = result.filter(s => {
        const cell = key === 'printStatus'
          ? (s.labelPrinted ? 'imprimé' : 'a imprimer')
          : String(s[key] ?? '').toLowerCase()
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
      const va = key === 'printStatus'
        ? (a.labelPrinted ? 'imprimé' : 'a imprimer')
        : String(a[key] ?? '').toLowerCase()
      const vb = key === 'printStatus'
        ? (b.labelPrinted ? 'imprimé' : 'a imprimer')
        : String(b[key] ?? '').toLowerCase()
      return va < vb ? -dir : va > vb ? dir : 0
    })
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLabels.value.length / pageSize.value)))

const paginatedLabels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredLabels.value.slice(start, start + pageSize.value)
})

// Reset to page 1 when filters or page size change
watch([labelFilterPrinted, labelSearchQuery, pageSize, columnFilters, dateFilters], () => {
  currentPage.value = 1
}, { deep: true })

function toggleLabelSelection(id: number) {
  const index = selectedLabels.value.indexOf(id)
  if (index === -1) {
    selectedLabels.value.push(id)
  } else {
    selectedLabels.value.splice(index, 1)
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function selectAllLabels() {
  if (selectedLabels.value.length === filteredLabels.value.length && filteredLabels.value.length > 0) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = filteredLabels.value.map(s => s.id)
  }
}
</script>

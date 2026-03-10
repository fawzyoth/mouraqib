<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{{ sectionTitle }}</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
            {{ mode === 'lost' ? 'Colis declares perdus par les transporteurs' :
               mode === 'recovered' ? 'Colis retournes et recuperes avec succes' :
               mode === 'active' ? 'Colis en cours de retour vers votre entrepot' :
               'Suivez les retours signales par vos transporteurs' }}
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2 sm:space-x-3">
        <!-- Sync Status - hidden on mobile -->
        <div class="hidden sm:flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span class="text-xs font-medium text-green-700 dark:text-green-400">Synchronise avec transporteurs</span>
        </div>
        <button @click="$emit('sync-returns')" class="flex items-center space-x-0 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isSyncingReturns }" />
          <span class="hidden sm:inline">Actualiser</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
    <!-- Returns List with Cards -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ sectionTitle }}</h3>
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
              :class="mode === 'lost' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      mode === 'recovered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      localFilter === 'delayed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      localFilter === 'on-time' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
              {{ displayedReturns.length }} colis
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input v-model="searchQuery" type="text" placeholder="Rechercher..." class="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white w-48 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
            <select v-model="carrierFilter" class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <option value="">Tous les transporteurs</option>
              <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.name">{{ carrier.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="hasActiveColumnFilters" class="mb-4 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 flex items-center gap-2 flex-wrap">
      <span class="text-xs text-gray-500">Filtres:</span>
      <template v-for="col in columns" :key="col.key">
        <span v-if="columnFilters[col.key]" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
          {{ col.label }}: {{ columnFilters[col.key] }}
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

      <!-- Returns Table -->
      <div v-if="displayedReturns.length > 0" class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
        <table class="w-full min-w-[1000px]">
            <thead>
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
                  <!-- Plain text input for trackingNumber -->
                  <template v-else-if="col.key === 'trackingNumber'">
                    <input
                      ref="filterInputRef"
                      v-model="columnFilters[col.key]"
                      type="text"
                      :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                      class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      @keydown.escape="openFilter = null"
                    />
                  </template>
                  <!-- Typeahead select for other fields -->
                  <template v-else>
                    <TypeaheadFilter
                      v-model="columnFilters[col.key]"
                      :options="uniqueColumnValues[col.key] || []"
                      :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                    />
                  </template>
                </div>
              </th>
            </tr>
            </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="ret in displayedReturns" :key="ret.id" 
                @click="$emit('select-return', ret)"
                class="group even:bg-gray-50/50 even:dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <td class="px-4 py-3" data-label="N Suivi">
                <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ ret.trackingNumber || '-' }}</span>
              </td>
              <td class="px-4 py-3" data-label="Transporteur">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ ret.carrier || 'Non assigné' }}</span>
              </td>
              <td class="px-4 py-3" data-label="Client">
                <span class="text-sm text-gray-900 dark:text-white">{{ ret.customerName || '-' }}</span>
              </td>
              <td class="px-4 py-3" data-label="Statut">
                <span :class="['inline-flex items-center space-x-1 text-sm font-medium whitespace-nowrap', getStatusTextClass(ret.status)]">
                  <span :class="['w-2 h-2 rounded-full flex-shrink-0', getStatusDotClass(ret.status)]"></span>
                  <span>{{ getStatusLabel(ret.status) }}</span>
                </span>
              </td>
              <td class="px-4 py-3 text-sm font-semibold" :class="ret.status === 'Perdu' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'" data-label="Valeur">
                {{ ret.value != null ? ret.value.toFixed(2) : '-' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" data-label="Scan Retour">
                <template v-if="ret.inScannedAt">
                  <div>{{ formatDateShort(ret.inScannedAt) }}</div>
                  <div class="text-xs text-gray-400">{{ formatTime(ret.inScannedAt) }}</div>
                </template>
                <template v-else>-</template>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" data-label="Dern. Statut">
                <template v-if="ret.lastStatusAt">
                  <div>{{ formatDateShort(ret.lastStatusAt) }}</div>
                  <div class="text-xs text-gray-400">{{ formatTime(ret.lastStatusAt) }}</div>
                </template>
                <template v-else>-</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="p-16 text-center">
        <div :class="[
          'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center',
          mode === 'lost' ? 'bg-red-100 dark:bg-red-900/20' :
          mode === 'recovered' ? 'bg-green-100 dark:bg-green-900/20' :
          'bg-blue-100 dark:bg-blue-900/20'
        ]">
          <PackageX v-if="mode === 'lost'" class="w-10 h-10 text-red-400" />
          <PackageCheck v-else-if="mode === 'recovered'" class="w-10 h-10 text-green-400" />
          <RotateCcw v-else class="w-10 h-10 text-blue-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ mode === 'lost' ? 'Aucun colis perdu' :
             mode === 'recovered' ? 'Aucun colis recupere' :
             'Aucun retour en cours' }}
        </h3>
        <p class="text-gray-500 max-w-sm mx-auto">
          {{ mode === 'lost' ? 'Bonne nouvelle ! Aucun de vos colis n\'a ete declare perdu par les transporteurs.' :
             mode === 'recovered' ? 'Les colis retournes avec succes apparaitront ici une fois recuperes.' :
             'Tous vos colis ont ete livres avec succes. Les retours apparaitront ici automatiquement.' }}
        </p>
      </div>
    </div>

  </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import {
  ListFilter, RefreshCw, RotateCcw, Clock, AlertTriangle, Search,
  PackageX, PackageCheck, Truck, MapPin,
  ChevronUp, ChevronDown, ArrowUpDown, Filter, X
} from 'lucide-vue-next'
import { getStatusLabel, getStatusTextClass, getStatusDotClass } from '@/composables/useStatusFormatting'
import TypeaheadFilter from '@/components/shared/TypeaheadFilter.vue'

interface ReturnItem {
  id: string | number
  trackingNumber: string
  status: string
  isDelayed: boolean
  daysDelayed?: number
  originalOrder: string
  customerName: string
  destination: string
  expectedArrival?: string
  value: number
  inScannedAt: string | null
  lastStatusAt: string | null
  carrier: string
  reason: string
}

interface ActiveReturnsStats {
  total: number
  delayed: number
  onTime: number
  delayedPercent: number
  onTimePercent: number
}

interface CarrierOption {
  id: string | number
  name: string
}

const props = defineProps<{
  mode: 'active' | 'recovered' | 'lost'
  sectionTitle: string
  filteredReturns: ReturnItem[]
  activeReturnsStats: ActiveReturnsStats
  isSyncingReturns: boolean
  carriers: CarrierOption[]
}>()

defineEmits<{
  'toggle-submenu': []
  'sync-returns': []
  'select-return': [returnItem: ReturnItem]
}>()

const columns = [
  { key: 'trackingNumber', label: 'N Suivi', filterable: true },
  { key: 'carrier', label: 'Transporteur', filterable: true },
  { key: 'customerName', label: 'Client', filterable: true },
  { key: 'status', label: 'Statut', filterable: true },
  { key: 'value', label: 'Valeur', filterable: false },
  { key: 'inScannedAt', label: 'Scan Retour', filterable: true, type: 'date' as const },
  { key: 'lastStatusAt', label: 'Dern. Statut', filterable: true, type: 'date' as const }
]

const localFilter = ref<'all'>('all')
const searchQuery = ref('')
const carrierFilter = ref('')
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
const columnFilterKeys = ['trackingNumber', 'carrier', 'customerName', 'status']
const dateFilterKeys = ['inScannedAt', 'lastStatusAt']

const columnFilters = reactive<Record<string, string>>(
  Object.fromEntries(columnFilterKeys.map(k => [k, '']))
)

const dateFilters = reactive<Record<string, { from: string; to: string }>>(
  Object.fromEntries(dateFilterKeys.map(k => [k, { from: '', to: '' }]))
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

function clearColumnFilter(key: string) {
  columnFilters[key] = ''
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

const uniqueColumnValues = computed(() => {
  const result: Record<string, string[]> = {}
  for (const key of ['carrier', 'customerName', 'status']) {
    const values = new Set<string>()
    for (const s of props.filteredReturns) {
      const val = (s as any)[key]
      if (val && String(val).trim()) {
        values.add(String(val))
      }
    }
    result[key] = Array.from(values).sort((a, b) => a.localeCompare(b, 'fr'))
  }
  return result
})

const displayedReturns = computed(() => {
  let result = props.filteredReturns

  // Carrier filter
  if (carrierFilter.value) {
    result = result.filter(s => s.carrier === carrierFilter.value)
  }

  // Global search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.trackingNumber.toLowerCase().includes(q) ||
      s.carrier.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q)
    )
  }

  // Per-column filters
  for (const [key, val] of Object.entries(columnFilters)) {
    if (val) {
      const q = val.toLowerCase()
      result = result.filter(s => {
        const cell = String((s as any)[key] ?? '').toLowerCase()
        return cell.includes(q)
      })
    }
  }

  // Date range filters
  for (const [key, range] of Object.entries(dateFilters)) {
    if (range.from || range.to) {
      result = result.filter(s => {
        const raw = (s as any)[key]
        if (!raw) return false
        // Assumes returnDate is something like 'DD/MM/YYYY' or 'DD MMM YYYY' in french. Need a generic parser or it might fail if string fmt is weird.
        // For now, attempting basic parse. In a real app we'd parse this properly.
        const [day, monthStr, year] = raw.split(' ')
        // simplistic hack since actual date format could vary
        const d = new Date(raw) 
        if (isNaN(d.getTime())) return false // Might need better parse
        const dateStr = d.toISOString().slice(0, 10)
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
      const va = String((a as any)[key] ?? '').toLowerCase()
      const vb = String((b as any)[key] ?? '').toLowerCase()
      return va < vb ? -dir : va > vb ? dir : 0
    })
  }

  return result
})

</script>

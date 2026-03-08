<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Tous les Clients</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gerez votre base de clients</p>
          </div>
        </div>
        <button @click="$emit('open-add-client')" class="btn-primary">
          <Plus class="w-4 h-4" />
          <span>Ajouter un client</span>
        </button>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Clients</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientStats.totalClients }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center">
              <Users class="w-6 h-6 text-primary-blue" />
            </div>
          </div>
          <p class="text-xs text-green-600 mt-2">+{{ clientStats.newThisMonth }} ce mois</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Clients Actifs</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientStats.activeClients }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Commande dans les 30 jours</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Taux de Livraison</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientStats.deliveryRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Moyenne globale</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Chiffre d'affaires</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ (clientStats.totalRevenue ?? 0).toLocaleString() }} TND</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Banknote class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Total des commandes</p>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex-1 min-w-[200px] relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="clientSearchQuery"
                type="text"
                placeholder="Rechercher par nom, telephone, adresse..."
                class="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>
            <select v-model="clientFilterStatus" class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="vip">VIP</option>
              <option value="blocked">Bloques</option>
            </select>
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveColumnFilters" class="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-wrap">
          <span class="text-xs text-gray-500">Filtres:</span>
          <template v-for="col in columns" :key="col.key">
            <span v-if="columnFilters[col.key]" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              {{ col.label }}: {{ col.key === 'status' ? clientStatusLabel(columnFilters[col.key]) : columnFilters[col.key] }}
              <button @click="columnFilters[col.key] = ''" class="hover:text-blue-900 dark:hover:text-blue-200">
                <X class="w-3 h-3" />
              </button>
            </span>
          </template>
          <button @click="clearAllFilters" class="text-xs text-gray-500 hover:text-red-500 ml-1">Tout effacer</button>
        </div>

        <!-- Clients Table -->
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
                      :class="sortKey === col.key ? 'text-primary-blue' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
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
                      :class="columnFilters[col.key] ? 'text-primary-blue' : 'text-gray-400 hover:text-gray-600'"
                    >
                      <FilterIcon class="w-3 h-3" />
                    </button>
                  </div>
                  <!-- Inline filter input -->
                  <div v-if="openFilter === col.key" class="pb-2">
                    <!-- Typeahead select -->
                    <template v-if="col.type === 'typeahead'">
                      <TypeaheadFilter
                        v-model="columnFilters[col.key]"
                        :options="uniqueColumnValues[col.key] || []"
                        :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                        :display-fn="col.key === 'status' ? clientStatusLabel : undefined"
                      />
                    </template>
                    <!-- Plain text input -->
                    <template v-else>
                      <input
                        ref="filterInputRef"
                        v-model="columnFilters[col.key]"
                        type="text"
                        :placeholder="'Filtrer ' + col.label.toLowerCase() + '...'"
                        class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-blue focus:border-primary-blue"
                        @keydown.escape="openFilter = null"
                      />
                    </template>
                  </div>
                </th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="client in paginatedClients" :key="client.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" @click="$emit('view-client', client)">
                <td class="px-4 py-4" data-label="Client">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                      <span class="text-sm font-semibold text-primary-blue">{{ client.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.name }}</p>
                      <p class="text-xs text-gray-500">Depuis {{ client.memberSince }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4" data-label="Contact">
                  <p class="text-sm text-gray-900 dark:text-white">{{ client.phone }}</p>
                </td>
                <td class="px-4 py-4" data-label="Adresse">
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ client.address }}</p>
                  <p class="text-xs text-gray-500">{{ client.region }}</p>
                </td>
                <td class="px-4 py-4" data-label="Commandes">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.totalOrders }}</p>
                </td>
                <td class="px-4 py-4" data-label="Taux">
                  <span class="text-sm font-medium" :class="client.deliveryRate >= 80 ? 'text-green-600' : client.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">
                    {{ client.deliveryRate }}%
                  </span>
                </td>
                <td class="px-4 py-4" data-label="Total">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ (client.totalSpent ?? 0).toLocaleString() }} TND</p>
                </td>
                <td class="px-4 py-4" data-label="Statut">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    client.status === 'active' ? 'bg-green-100 text-green-700' :
                    client.status === 'vip' ? 'bg-purple-100 text-purple-700' :
                    client.status === 'blocked' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  ]">
                    {{ client.status === 'active' ? 'Actif' : client.status === 'vip' ? 'VIP' : client.status === 'blocked' ? 'Bloque' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-4 py-4" data-label="Actions" @click.stop>
                  <div class="flex items-center space-x-2">
                    <button @click="$emit('view-client', client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button @click="$emit('edit-client', client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                      <Settings class="w-4 h-4" />
                    </button>
                    <button @click="$emit('toggle-vip', client)" class="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg" :title="client.status === 'vip' ? 'Retirer VIP' : 'Marquer VIP'">
                      <Star class="w-4 h-4" :class="client.status === 'vip' ? 'fill-purple-600 text-purple-600' : ''" />
                    </button>
                    <button @click="$emit('toggle-blocked', client)" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg" :title="client.status === 'blocked' ? 'Debloquer' : 'Bloquer'">
                      <Ban class="w-4 h-4" :class="client.status === 'blocked' ? 'text-red-600' : ''" />
                    </button>
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
            <select v-model="pageSize" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:ring-2 focus:ring-primary-blue focus:border-transparent">
              <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <span class="text-sm text-gray-600 dark:text-gray-400">&mdash; {{ paginatedClients.length }} sur {{ sortedClients.length }}</span>
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
  Plus,
  Users,
  CheckCircle,
  TrendingUp,
  Banknote,
  Search,
  Eye,
  Settings,
  Star,
  Ban,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  X
} from 'lucide-vue-next'
import TypeaheadFilter from '@/components/shared/TypeaheadFilter.vue'

interface ClientStats {
  totalClients: number
  activeClients: number
  newThisMonth: number
  deliveryRate: number
  totalRevenue: number
}

interface Client {
  id: number
  name: string
  phone: string
  address: string
  region: string
  totalOrders: number
  deliveryRate: number
  totalSpent: number
  status: string
  memberSince: string
  [key: string]: any
}

const props = defineProps<{
  clients: Client[]
  clientStats: ClientStats
}>()

defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'open-add-client'): void
  (e: 'view-client', client: Client): void
  (e: 'edit-client', client: Client): void
  (e: 'toggle-vip', client: Client): void
  (e: 'toggle-blocked', client: Client): void
}>()

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
const columns = [
  { key: 'name', label: 'Client', filterable: true },
  { key: 'phone', label: 'Contact', filterable: true },
  { key: 'address', label: 'Adresse', filterable: true },
  { key: 'totalOrders', label: 'Commandes', filterable: false },
  { key: 'deliveryRate', label: 'Taux', filterable: false },
  { key: 'totalSpent', label: 'Total', filterable: false },
  { key: 'status', label: 'Statut', filterable: true, type: 'typeahead' },
]

const columnFilterKeys = columns.filter(c => c.filterable).map(c => c.key)

// ---------------------------------------------------------------------------
// Search / filter / sort / pagination state
// ---------------------------------------------------------------------------
const clientSearchQuery = ref('')
const clientFilterStatus = ref('all')

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
const columnFilters = reactive<Record<string, string>>(
  Object.fromEntries(columnFilterKeys.map(k => [k, '']))
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
  Object.values(columnFilters).some(v => v !== '')
)

function clearAllFilters() {
  for (const key of Object.keys(columnFilters)) {
    columnFilters[key] = ''
  }
  openFilter.value = null
}

function clientStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Actif',
    vip: 'VIP',
    blocked: 'Bloqué',
    inactive: 'Inactif',
  }
  return labels[status] || status
}

const typeaheadKeys = ['status']
const uniqueColumnValues = computed(() => {
  const result: Record<string, string[]> = {}
  for (const key of typeaheadKeys) {
    const values = new Set<string>()
    for (const c of props.clients) {
      const val = c[key]
      if (val && String(val).trim()) {
        values.add(String(val))
      }
    }
    result[key] = Array.from(values).sort((a, b) => a.localeCompare(b, 'fr'))
  }
  return result
})

// Pagination
const currentPage = ref(1)
const pageSizeOptions = [10, 20, 50, 100]
const pageSize = ref(20)

// ---------------------------------------------------------------------------
// Computed: filter → sort → paginate
// ---------------------------------------------------------------------------

// Helper to get the sortable/filterable value for a column from a client row
function getCellValue(client: Client, key: string): string {
  if (key === 'address') return [client.address, client.region].filter(Boolean).join(' ').toLowerCase()
  if (key === 'status') {
    const labels: Record<string, string> = { active: 'actif', vip: 'vip', blocked: 'bloque', inactive: 'inactif' }
    return labels[client.status] || client.status
  }
  return String(client[key] ?? '').toLowerCase()
}

const sortedClients = computed(() => {
  let result = props.clients

  // Status dropdown filter
  if (clientFilterStatus.value !== 'all') {
    result = result.filter(c => c.status === clientFilterStatus.value)
  }

  // Global search
  if (clientSearchQuery.value) {
    const q = clientSearchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q) ||
      (c.region || '').toLowerCase().includes(q)
    )
  }

  // Per-column filters
  for (const [key, val] of Object.entries(columnFilters)) {
    if (val) {
      const q = val.toLowerCase()
      result = result.filter(c => getCellValue(c, key).includes(q))
    }
  }

  // Sort
  if (sortKey.value) {
    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    const numericKeys = new Set(['totalOrders', 'deliveryRate', 'totalSpent'])
    result = [...result].sort((a, b) => {
      if (numericKeys.has(key)) {
        return ((a[key] as number) - (b[key] as number)) * dir
      }
      const va = getCellValue(a, key)
      const vb = getCellValue(b, key)
      return va < vb ? -dir : va > vb ? dir : 0
    })
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedClients.value.length / pageSize.value)))

const paginatedClients = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedClients.value.slice(start, start + pageSize.value)
})

// Reset to page 1 when filters change
watch([clientSearchQuery, clientFilterStatus, pageSize, columnFilters], () => {
  currentPage.value = 1
}, { deep: true })
</script>

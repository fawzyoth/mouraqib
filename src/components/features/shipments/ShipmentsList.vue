<template>
  <div>
    <!-- Header -->
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
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

        <!-- Search & Filters -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="flex-1 relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher des colis"
                class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <button class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Recherche groupee
            </button>
            <button class="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <SlidersHorizontal class="w-4 h-4" />
              <span>Ajouter des filtres</span>
            </button>
            <button class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ArrowUpDown class="w-4 h-4" />
            </button>
            <button class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <LayoutGrid class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Bulk Select -->
        <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-3">
          <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue" />
          <span class="text-sm text-gray-600 dark:text-gray-400">Affichage de {{ filteredShipments.length }} colis</span>
        </div>

        <!-- Table -->
        <div class="table-responsive">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="w-10 px-4 py-3"></th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Numero de suivi</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transporteur</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider underline decoration-dotted cursor-help">Dernier evenement</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Origine</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="shipment in filteredShipments" :key="shipment.id" @click="$emit('select-shipment', shipment)" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <td class="px-4 py-3" @click.stop>
                <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue" />
              </td>
              <td class="px-4 py-3" data-label="N Suivi">
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Exemple</span>
                  <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Transporteur">{{ shipment.carrier }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Service">{{ shipment.service || '-' }}</td>
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
          <span class="text-sm text-gray-600 dark:text-gray-400">Affichage de {{ filteredShipments.length }} sur {{ shipments.length }} resultats</span>
          <div class="flex items-center space-x-1">
            <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-50" disabled>
              <ChevronLeft class="w-4 h-4" />
            </button>
            <span class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">1</span>
            <span class="text-sm text-gray-500">/ 1</span>
            <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-50" disabled>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter,
  Upload,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  ChevronLeft,
  ChevronRight
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
  service?: string
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

const activeStatusTab = ref('all')
const searchQuery = ref('')

const filteredShipments = computed(() => {
  let result = props.shipments

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

  if (searchQuery.value) {
    result = result.filter(s =>
      s.trackingNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return result
})
</script>

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
    <div v-if="mode === 'active'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div @click="localFilter = 'all'"
        :class="['bg-white dark:bg-gray-900 rounded-xl border p-4 cursor-pointer transition-all',
          localFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300']">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <RotateCcw class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeReturnsStats.total }}</p>
              <p class="text-sm text-gray-500">Tous les retours actifs</p>
            </div>
          </div>
        </div>
      </div>
    </div>

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
              <input type="text" placeholder="Rechercher..." class="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white w-48 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
            <select class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <option value="all">Tous les transporteurs</option>
              <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.name">{{ carrier.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Returns Table -->
      <div v-if="displayedReturns.length > 0" class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
        <table class="w-full min-w-[1000px]">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">N Suivi</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transporteur</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Raison</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valeur</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Retour</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="ret in displayedReturns" :key="ret.id" 
                @click="$emit('select-return', ret)"
                class="group even:bg-gray-50/50 even:dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <td class="px-4 py-3" data-label="N Suivi">
                <div class="flex flex-col">
                  <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ ret.trackingNumber }}</span>
                  <span class="text-xs text-gray-500">Cmd: {{ ret.originalOrder }}</span>
                </div>
              </td>
              <td class="px-4 py-3" data-label="Transporteur">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ ret.carrier }}</span>
              </td>
              <td class="px-4 py-3" data-label="Client">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-900 dark:text-white">{{ ret.customerName }}</span>
                  <span class="text-xs text-gray-500 flex items-center mt-0.5"><MapPin class="w-3 h-3 mr-1" />{{ ret.destination }}</span>
                </div>
              </td>
              <td class="px-4 py-3" data-label="Raison">
                <span :class="[
                  'px-2.5 py-1 text-xs font-medium rounded-lg',
                  ret.reason === 'Refus client' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  ret.reason === 'Client absent' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  ret.reason === 'Adresse incorrecte' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  ret.reason === 'Colis endommage' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                ]">
                  {{ ret.reason }}
                </span>
              </td>
              <td class="px-4 py-3" data-label="Statut">
                <div class="flex flex-col gap-1 items-start">
                  <span :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1',
                    ret.status === 'Perdu' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    ret.status === 'Recupere' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  ]">
                    <PackageX v-if="ret.status === 'Perdu'" class="w-3 h-3" />
                    <PackageCheck v-else-if="ret.status === 'Recupere'" class="w-3 h-3" />
                    <Truck v-else class="w-3 h-3" />
                    {{ ret.status }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm font-semibold" :class="ret.status === 'Perdu' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'" data-label="Valeur">
                {{ ret.value }} DT
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Date Retour">
                <span class="flex items-center"><RotateCcw class="w-3 h-3 mr-1 text-gray-400" /> {{ ret.returnDate }}</span>
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

    <!-- Insights Section (for active mode only) -->
    <div v-if="mode === 'active'" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Return Reasons Breakdown -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-4">Raisons des retours</h4>
        <div v-if="returnReasonsBreakdown.length > 0" class="space-y-3">
          <div v-for="item in returnReasonsBreakdown" :key="item.reason" class="flex items-center">
            <div class="w-32 text-sm text-gray-600 dark:text-gray-400">{{ item.reason }}</div>
            <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
              <div class="h-full rounded-full" :class="item.color" :style="{ width: item.percent + '%' }"></div>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white w-10 text-right">{{ item.percent }}%</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 text-center py-4">Aucune donnee de retour disponible</p>
      </div>

      <!-- Tips to Reduce Returns -->
      <div class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 p-6">
        <div class="flex items-start space-x-3">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
            <Lightbulb class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 class="font-semibold text-orange-900 dark:text-orange-300 mb-2">Conseils pour reduire les retours</h4>
            <ul class="text-sm text-orange-700 dark:text-orange-400 space-y-2">
              <li class="flex items-start">
                <CheckCircle class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Confirmez les commandes par telephone avant expedition</span>
              </li>
              <li class="flex items-start">
                <CheckCircle class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Verifiez les adresses avec les clients</span>
              </li>
              <li class="flex items-start">
                <CheckCircle class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Proposez des creneaux de livraison flexibles</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter, RefreshCw, RotateCcw, Clock, AlertTriangle, Search,
  PackageX, PackageCheck, Truck, User, MapPin, Calendar, Building2,
  Lightbulb, CheckCircle
} from 'lucide-vue-next'

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
  returnDate: string
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

const localFilter = ref<'all'>('all')

const displayedReturns = computed(() => {
  return props.filteredReturns
})

const reasonColors: Record<string, string> = {
  'Client absent': 'bg-orange-500',
  'Refus client': 'bg-yellow-500',
  'Adresse incorrecte': 'bg-purple-500',
  'Injoignable': 'bg-gray-500',
  'Colis endommage': 'bg-red-500',
}

const returnReasonsBreakdown = computed(() => {
  const returns = props.filteredReturns
  if (returns.length === 0) return []

  const counts: Record<string, number> = {}
  for (const r of returns) {
    if (r.reason) {
      counts[r.reason] = (counts[r.reason] || 0) + 1
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return Object.entries(counts)
    .map(([reason, count]) => ({
      reason,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: reasonColors[reason] || 'bg-blue-500',
    }))
    .sort((a, b) => b.count - a.count)
})
</script>

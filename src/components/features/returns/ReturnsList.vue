<template>
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
    <!-- Active Returns Stats (only for active mode) -->
    <div v-if="mode === 'active'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      <div @click="localFilter = 'on-time'"
        :class="['bg-white dark:bg-gray-900 rounded-xl border p-4 cursor-pointer transition-all',
          localFilter === 'on-time' ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300']">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">{{ activeReturnsStats.onTime }}</p>
              <p class="text-sm text-gray-500">A l'heure</p>
            </div>
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            {{ activeReturnsStats.onTimePercent }}%
          </span>
        </div>
      </div>
      <div @click="localFilter = 'delayed'"
        :class="['bg-white dark:bg-gray-900 rounded-xl border p-4 cursor-pointer transition-all',
          localFilter === 'delayed' ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300']">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle class="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-red-600">{{ activeReturnsStats.delayed }}</p>
              <p class="text-sm text-gray-500">En retard</p>
            </div>
          </div>
          <span class="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
            {{ activeReturnsStats.delayedPercent }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Delayed Alert Banner (only for active mode with delayed filter) -->
    <div v-if="mode === 'active' && activeReturnsStats.delayed > 0 && localFilter !== 'on-time'"
      class="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
      <div class="flex items-start space-x-3">
        <AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-medium text-red-800 dark:text-red-300">{{ activeReturnsStats.delayed }} retour(s) en retard</p>
          <p class="text-sm text-red-600 dark:text-red-400 mt-1">
            Ces colis ont depasse le delai de retour estime. Contactez le transporteur pour plus d'informations.
          </p>
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

      <!-- Returns Cards -->
      <div v-if="displayedReturns.length > 0" class="p-4 space-y-3">
        <div v-for="ret in displayedReturns" :key="ret.id"
          :class="[
            'group rounded-xl p-4 transition-all cursor-pointer',
            ret.isDelayed && mode === 'active'
              ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
          ]">
          <div class="flex items-start justify-between">
            <!-- Left: Main Info -->
            <div class="flex items-start space-x-4">
              <!-- Status Icon -->
              <div class="flex-shrink-0 relative">
                <div :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  ret.status === 'Perdu' ? 'bg-red-100 dark:bg-red-900/30' :
                  ret.status === 'Recupere' ? 'bg-green-100 dark:bg-green-900/30' :
                  ret.isDelayed ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                ]">
                  <PackageX v-if="ret.status === 'Perdu'" class="w-6 h-6 text-red-600" />
                  <PackageCheck v-else-if="ret.status === 'Recupere'" class="w-6 h-6 text-green-600" />
                  <AlertTriangle v-else-if="ret.isDelayed" class="w-6 h-6 text-red-600" />
                  <Truck v-else class="w-6 h-6 text-blue-600" />
                </div>
                <!-- Delay indicator badge -->
                <div v-if="ret.isDelayed && ret.status === 'En transit'" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span class="text-[10px] font-bold text-white">!</span>
                </div>
              </div>
              <!-- Details -->
              <div>
                <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                  <p class="font-semibold text-gray-900 dark:text-white">{{ ret.trackingNumber }}</p>
                  <span :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    ret.status === 'Perdu' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    ret.status === 'Recupere' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  ]">
                    {{ ret.status }}
                  </span>
                  <!-- Delay badge for active returns -->
                  <span v-if="ret.status === 'En transit' && ret.isDelayed" class="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    En retard +{{ ret.daysDelayed }}j
                  </span>
                  <span v-else-if="ret.status === 'En transit' && !ret.isDelayed" class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    A l'heure
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-0.5">Commande: {{ ret.originalOrder }}</p>
                <div class="flex items-center space-x-4 mt-2 flex-wrap gap-y-1">
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User class="w-4 h-4 mr-1.5" />
                    {{ ret.customerName }}
                  </div>
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin class="w-4 h-4 mr-1.5" />
                    {{ ret.destination }}
                  </div>
                  <!-- Expected arrival for active returns -->
                  <div v-if="ret.status === 'En transit' && ret.expectedArrival"
                    :class="['flex items-center text-sm', ret.isDelayed ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400']">
                    <Calendar class="w-4 h-4 mr-1.5" />
                    {{ ret.isDelayed ? 'Attendu le' : 'Arrivee prevue' }}: {{ ret.expectedArrival }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Value & Actions -->
            <div class="text-right">
              <p :class="[
                'text-lg font-bold',
                ret.status === 'Perdu' ? 'text-red-600' : 'text-gray-900 dark:text-white'
              ]">
                {{ ret.value }} DT
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ ret.returnDate }}</p>
            </div>
          </div>

          <!-- Carrier & Reason Section -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <!-- Carrier Info -->
              <div class="flex items-center space-x-3">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  ret.carrier === 'Yalidine' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  ret.carrier === 'ZR Express' ? 'bg-green-100 dark:bg-green-900/30' :
                  ret.carrier === 'Maystro' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  ret.carrier === 'Ecotrack' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-gray-100 dark:bg-gray-800'
                ]">
                  <Building2 :class="[
                    'w-5 h-5',
                    ret.carrier === 'Yalidine' ? 'text-blue-600' :
                    ret.carrier === 'ZR Express' ? 'text-green-600' :
                    ret.carrier === 'Maystro' ? 'text-purple-600' :
                    ret.carrier === 'Ecotrack' ? 'text-orange-600' :
                    'text-gray-500'
                  ]" />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white text-sm">{{ ret.carrier }}</p>
                  <p class="text-xs text-gray-500">Transporteur</p>
                </div>
              </div>
              <!-- Reason Badge -->
              <div class="flex items-center space-x-2">
                <span :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg',
                  ret.reason === 'Refus client' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  ret.reason === 'Client absent' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  ret.reason === 'Adresse incorrecte' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  ret.reason === 'Colis endommage' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                ]">
                  {{ ret.reason }}
                </span>
                <button class="text-sm text-orange-600 hover:text-orange-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Details ->
                </button>
              </div>
            </div>
          </div>
        </div>
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
        <div class="space-y-3">
          <div class="flex items-center">
            <div class="w-32 text-sm text-gray-600 dark:text-gray-400">Client absent</div>
            <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
              <div class="h-full bg-orange-500 rounded-full" style="width: 45%"></div>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">45%</span>
          </div>
          <div class="flex items-center">
            <div class="w-32 text-sm text-gray-600 dark:text-gray-400">Refus client</div>
            <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
              <div class="h-full bg-yellow-500 rounded-full" style="width: 30%"></div>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">30%</span>
          </div>
          <div class="flex items-center">
            <div class="w-32 text-sm text-gray-600 dark:text-gray-400">Adresse incorrecte</div>
            <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
              <div class="h-full bg-purple-500 rounded-full" style="width: 15%"></div>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">15%</span>
          </div>
          <div class="flex items-center">
            <div class="w-32 text-sm text-gray-600 dark:text-gray-400">Injoignable</div>
            <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
              <div class="h-full bg-gray-500 rounded-full" style="width: 10%"></div>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">10%</span>
          </div>
        </div>
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
}>()

const localFilter = ref<'all' | 'on-time' | 'delayed'>('all')

const displayedReturns = computed(() => {
  if (props.mode !== 'active' || localFilter.value === 'all') {
    return props.filteredReturns
  }
  if (localFilter.value === 'delayed') {
    return props.filteredReturns.filter(r => r.isDelayed)
  }
  if (localFilter.value === 'on-time') {
    return props.filteredReturns.filter(r => !r.isDelayed)
  }
  return props.filteredReturns
})
</script>

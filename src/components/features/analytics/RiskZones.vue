<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Zones a Risque</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Identifiez les zones geographiques problematiques</p>
        </div>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Risk Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
        <div class="flex items-center space-x-3">
          <MapPinned class="w-6 h-6 text-red-600" />
          <div>
            <p class="text-2xl font-bold text-red-700 dark:text-red-400">{{ riskZones.highRiskCount }}</p>
            <p class="text-sm text-red-600 dark:text-red-400">Zones Haut Risque</p>
          </div>
        </div>
      </div>
      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800">
        <div class="flex items-center space-x-3">
          <MapPinned class="w-6 h-6 text-yellow-600" />
          <div>
            <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{{ riskZones.mediumRiskCount }}</p>
            <p class="text-sm text-yellow-600 dark:text-yellow-400">Zones Risque Moyen</p>
          </div>
        </div>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
        <div class="flex items-center space-x-3">
          <MapPinned class="w-6 h-6 text-green-600" />
          <div>
            <p class="text-2xl font-bold text-green-700 dark:text-green-400">{{ riskZones.lowRiskCount }}</p>
            <p class="text-sm text-green-600 dark:text-green-400">Zones Faible Risque</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Zones Table -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">Detail par Zone</h3>
        <div class="flex items-center space-x-2">
          <button
            @click="localFilter = 'all'"
            :class="localFilter === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >Tous</button>
          <button
            @click="localFilter = 'high'"
            :class="localFilter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >Haut</button>
          <button
            @click="localFilter = 'medium'"
            :class="localFilter === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >Moyen</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Zone</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Risque</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taux Echec</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Retours</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Colis Affectes</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Raison Principale</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="zone in filteredZones" :key="zone.name" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Zone">{{ zone.name }}</td>
              <td class="px-4 py-3" data-label="Risque">
                <span :class="zone.risk === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : zone.risk === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ zone.risk === 'high' ? 'Haut' : zone.risk === 'medium' ? 'Moyen' : 'Faible' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Taux Echec">{{ zone.failureRate }}%</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Retours">{{ zone.returnRate }}%</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Colis Affectes">{{ zone.affectedShipments }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Raison Principale">{{ zone.mainReason }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ListFilter, MapPinned } from 'lucide-vue-next'

interface Zone {
  name: string
  risk: 'high' | 'medium' | 'low'
  failureRate: number
  returnRate: number
  affectedShipments: number
  mainReason: string
}

interface RiskZonesData {
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  zones: Zone[]
}

const props = defineProps<{
  riskZones: RiskZonesData
}>()

defineEmits<{
  'toggle-submenu': []
}>()

const localFilter = ref<'all' | 'high' | 'medium'>('all')

const filteredZones = computed(() => {
  if (localFilter.value === 'all') return props.riskZones.zones
  return props.riskZones.zones.filter(z => z.risk === localFilter.value)
})
</script>

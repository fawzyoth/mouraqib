<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Performance Livraison</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analysez les performances de livraison par transporteur et region</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select :value="analyticsDateRange" @change="$emit('update:analyticsDateRange', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
        </select>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Performance Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500">Livraisons Reussies</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{{ deliveryPerformance.successfulDeliveries }}</p>
        <p class="text-xs text-gray-400 mt-1">sur {{ deliveryPerformance.totalAttempts }} tentatives</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500">Premiere Tentative</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ deliveryPerformance.firstAttemptRate }}%</p>
        <p class="text-xs text-gray-400 mt-1">taux de reussite</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500">Delai Moyen</p>
        <p class="text-2xl font-bold text-orange-600 mt-1">{{ deliveryPerformance.avgDeliveryTime }}h</p>
        <p class="text-xs text-gray-400 mt-1">apres expedition</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500">Ponctualite</p>
        <p class="text-2xl font-bold text-purple-600 mt-1">{{ deliveryPerformance.onTimeRate }}%</p>
        <p class="text-xs text-gray-400 mt-1">dans les delais</p>
      </div>
    </div>

    <!-- Carrier Performance -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Performance par Transporteur</h3>
      </div>
      <div class="table-responsive">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Transporteur</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Colis</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Livres</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taux</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Delai Moy.</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="carrier in carriers" :key="carrier.name" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Transporteur">{{ carrier.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Colis">{{ carrier.shipments }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Livres">{{ carrier.delivered }}</td>
              <td class="px-4 py-3" data-label="Taux">
                <div class="flex items-center space-x-2">
                  <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" :style="{ width: carrier.deliveryRate + '%' }"></div>
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ carrier.deliveryRate }}%</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Delai">{{ carrier.avgTime }} jours</td>
              <td class="px-4 py-3" data-label="Score">
                <span :class="carrier.deliveryRate >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : carrier.deliveryRate >= 80 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ carrier.deliveryRate >= 90 ? 'Excellent' : carrier.deliveryRate >= 80 ? 'Bon' : 'A ameliorer' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Regional Performance -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Performance par Region</h3>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="region in deliveryPerformance.regionalPerformance" :key="region.name" class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-900 dark:text-white">{{ region.name }}</span>
            <span :class="region.rate >= 90 ? 'text-green-600' : region.rate >= 80 ? 'text-yellow-600' : 'text-red-600'" class="text-sm font-bold">{{ region.rate }}%</span>
          </div>
          <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div :class="region.rate >= 90 ? 'bg-green-500' : region.rate >= 80 ? 'bg-yellow-500' : 'bg-red-500'" class="h-full rounded-full" :style="{ width: region.rate + '%' }"></div>
          </div>
          <p class="text-xs text-gray-500 mt-2">{{ region.shipments }} colis - {{ region.avgTime }} jours moy.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter } from 'lucide-vue-next'

interface RegionalPerformance {
  name: string
  rate: number
  shipments: number
  avgTime: number
}

interface DeliveryPerformanceData {
  successfulDeliveries: number
  totalAttempts: number
  firstAttemptRate: number
  avgDeliveryTime: number
  onTimeRate: number
  regionalPerformance: RegionalPerformance[]
}

interface Carrier {
  name: string
  shipments: number
  delivered: number
  deliveryRate: number
  avgTime: number
}

const { deliveryPerformance, carriers } = withDefaults(defineProps<{
  analyticsDateRange: string
  deliveryPerformance?: DeliveryPerformanceData
  carriers?: Carrier[]
}>(), {
  deliveryPerformance: () => ({
    successfulDeliveries: 0,
    totalAttempts: 0,
    firstAttemptRate: 0,
    avgDeliveryTime: 0,
    onTimeRate: 0,
    regionalPerformance: [],
  }),
  carriers: () => [],
})

defineEmits<{
  'toggle-submenu': []
  'update:analyticsDateRange': [value: string]
}>()
</script>

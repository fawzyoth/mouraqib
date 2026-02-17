<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Tendances</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analysez les tendances et previsions</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select :value="trendsPeriod" @change="$emit('update:trendsPeriod', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuel</option>
          <option value="quarterly">Trimestriel</option>
        </select>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Trend Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Volume de Colis</h3>
        <div class="h-48 flex items-end space-x-2">
          <div v-for="(value, index) in trends.volumeTrend" :key="index" class="flex-1 flex flex-col items-center">
            <div class="w-full bg-blue-500 rounded-t transition-all duration-300" :style="{ height: (value / Math.max(...trends.volumeTrend) * 100) + '%' }"></div>
            <span class="text-xs text-gray-500 mt-2">{{ trends.labels[index] }}</span>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm">
          <span class="text-gray-500">Prevision prochaine periode:</span>
          <span class="font-semibold text-blue-600">+{{ trends.volumeForecast }}%</span>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Taux de Livraison</h3>
        <div class="h-48 flex items-end space-x-2">
          <div v-for="(value, index) in trends.deliveryRateTrend" :key="index" class="flex-1 flex flex-col items-center">
            <div class="w-full bg-green-500 rounded-t transition-all duration-300" :style="{ height: value + '%' }"></div>
            <span class="text-xs text-gray-500 mt-2">{{ trends.labels[index] }}</span>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm">
          <span class="text-gray-500">Prevision prochaine periode:</span>
          <span class="font-semibold text-green-600">{{ trends.deliveryForecast }}%</span>
        </div>
      </div>
    </div>

    <!-- Key Insights -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Insights Cles</h3>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="insight in trends.insights" :key="insight.title" class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div class="flex items-center space-x-2 mb-2">
            <TrendingUp v-if="insight.trend === 'up'" class="w-4 h-4 text-green-600" />
            <TrendingDown v-else class="w-4 h-4 text-red-600" />
            <span class="font-medium text-gray-900 dark:text-white">{{ insight.title }}</span>
          </div>
          <p class="text-sm text-gray-500">{{ insight.description }}</p>
          <p class="text-xs text-gray-400 mt-2">{{ insight.period }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, TrendingUp, TrendingDown } from 'lucide-vue-next'

interface Insight {
  title: string
  description: string
  trend: 'up' | 'down'
  period: string
}

interface TrendsData {
  labels: string[]
  volumeTrend: number[]
  deliveryRateTrend: number[]
  volumeForecast: number
  deliveryForecast: number
  insights: Insight[]
}

defineProps<{
  trendsPeriod: string
  trends: TrendsData
}>()

defineEmits<{
  'toggle-submenu': []
  'update:trendsPeriod': [value: string]
}>()
</script>

<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">KPIs Globaux</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Vue d'ensemble de vos indicateurs cles de performance</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select :value="analyticsDateRange" @change="$emit('update:analyticsDateRange', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
        </select>
        <button class="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Download class="w-4 h-4" />
          <span>Exporter</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Main KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Package class="w-5 h-5 text-blue-600" />
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+12%</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ analyticsKpis.totalShipments }}</p>
        <p class="text-sm text-gray-500 mt-1">Total Colis</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+2.3%</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ analyticsKpis.deliveryRate }}%</p>
        <p class="text-sm text-gray-500 mt-1">Taux de Livraison</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Timer class="w-5 h-5 text-orange-600" />
          </div>
          <span class="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">+0.5j</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ analyticsKpis.avgTransitTime }} jours</p>
        <p class="text-sm text-gray-500 mt-1">Transit Moyen</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <DollarSign class="w-5 h-5 text-purple-600" />
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+8%</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ analyticsKpis.totalRevenue }} DT</p>
        <p class="text-sm text-gray-500 mt-1">Chiffre d'Affaires</p>
      </div>
    </div>

    <!-- Secondary KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <RotateCcw class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ analyticsKpis.returnRate }}%</p>
            <p class="text-sm text-gray-500">Taux de Retour</p>
          </div>
        </div>
        <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-red-500 rounded-full" :style="{ width: analyticsKpis.returnRate + '%' }"></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <AlertTriangle class="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ analyticsKpis.exceptionRate }}%</p>
            <p class="text-sm text-gray-500">Taux d'Exception</p>
          </div>
        </div>
        <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-yellow-500 rounded-full" :style="{ width: analyticsKpis.exceptionRate + '%' }"></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Users class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ analyticsKpis.customerSatisfaction }}%</p>
            <p class="text-sm text-gray-500">Satisfaction Client</p>
          </div>
        </div>
        <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-green-500 rounded-full" :style="{ width: analyticsKpis.customerSatisfaction + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Volume Chart -->
    <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Volume de Colis</h3>
      <div class="h-64 flex items-end space-x-2">
        <div v-for="(value, index) in chartData" :key="index" class="flex-1 flex flex-col items-center">
          <div class="w-full bg-orange-500 rounded-t transition-all duration-300" :style="{ height: value + '%' }"></div>
          <span class="text-xs text-gray-500 mt-2">{{ chartLabels[index] }}</span>
        </div>
      </div>
    </div>

    <!-- KPI Comparison Table -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Comparaison par Periode</h3>
      </div>
      <div class="table-responsive">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Indicateur</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cette periode</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Periode precedente</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Variation</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="kpi in analyticsKpiComparison" :key="kpi.name" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Indicateur">{{ kpi.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Cette periode">{{ kpi.current }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Precedente">{{ kpi.previous }}</td>
              <td class="px-4 py-3" data-label="Variation">
                <span :class="kpi.change > 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                  {{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, Download, Package, CheckCircle, Timer, DollarSign, RotateCcw, AlertTriangle, Users } from 'lucide-vue-next'

interface AnalyticsKpis {
  totalShipments: number
  deliveryRate: number
  avgTransitTime: number
  totalRevenue: number
  returnRate: number
  exceptionRate: number
  customerSatisfaction: number
}

interface KpiComparison {
  name: string
  current: string
  previous: string
  change: number
}

defineProps<{
  analyticsDateRange: string
  analyticsKpis: AnalyticsKpis
  analyticsKpiComparison: KpiComparison[]
  chartData: number[]
  chartLabels: string[]
}>()

defineEmits<{
  'toggle-submenu': []
  'update:analyticsDateRange': [value: string]
}>()
</script>

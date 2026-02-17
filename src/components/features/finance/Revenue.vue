<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Revenus</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Vue d'ensemble de vos revenus et marges</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select :value="period" @change="$emit('update:period', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette ann&eacute;e</option>
        </select>
        <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
          <FileDown class="w-4 h-4" /><span>Rapport</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Revenue Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div><p class="text-green-100 text-sm">Revenu brut</p><p class="text-3xl font-bold mt-1">{{ stats.grossRevenue.toLocaleString() }} TND</p></div>
          <div class="p-3 bg-white/20 rounded-lg"><TrendingUp class="w-6 h-6" /></div>
        </div>
        <div class="mt-3 flex items-center space-x-1 text-sm"><ArrowUp class="w-4 h-4" /><span>+{{ stats.grossGrowth }}% vs p&eacute;riode pr&eacute;c&eacute;dente</span></div>
      </div>
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div><p class="text-blue-100 text-sm">Revenu net</p><p class="text-3xl font-bold mt-1">{{ stats.netRevenue.toLocaleString() }} TND</p></div>
          <div class="p-3 bg-white/20 rounded-lg"><Wallet class="w-6 h-6" /></div>
        </div>
        <div class="mt-3 flex items-center space-x-1 text-sm"><span>Marge: {{ stats.marginPercent }}%</span></div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><Truck class="w-5 h-5 text-red-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.shippingCosts.toLocaleString() }} TND</p><p class="text-sm text-gray-500">Frais livraison</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Package class="w-5 h-5 text-purple-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.avgOrderValue.toLocaleString() }} TND</p><p class="text-sm text-gray-500">Panier moyen</p></div>
        </div>
      </div>
    </div>

    <!-- Revenue Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800"><h3 class="font-semibold text-gray-900 dark:text-white">Par cat&eacute;gorie de produit</h3></div>
        <div class="p-4 space-y-4">
          <div v-for="cat in byCategory" :key="cat.name" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ cat.name }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ cat.amount.toLocaleString() }} TND</span>
            </div>
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div class="h-full rounded-full" :class="cat.color" :style="{ width: cat.percent + '%' }"></div></div>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800"><h3 class="font-semibold text-gray-900 dark:text-white">Par r&eacute;gion</h3></div>
        <div class="p-4 space-y-4">
          <div v-for="region in byRegion" :key="region.name" class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"><MapPin class="w-4 h-4 text-gray-600" /></div>
              <div><p class="text-sm font-medium text-gray-900 dark:text-white">{{ region.name }}</p><p class="text-xs text-gray-500">{{ region.orders }} commandes</p></div>
            </div>
            <div class="text-right"><p class="text-sm font-semibold text-gray-900 dark:text-white">{{ region.amount.toLocaleString() }} TND</p><p class="text-xs text-gray-500">{{ region.percent }}%</p></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Revenue Chart -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">&Eacute;volution des revenus</h3>
        <div class="flex items-center space-x-2 text-sm">
          <span class="flex items-center"><span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>Revenu brut</span>
          <span class="flex items-center"><span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>Revenu net</span>
        </div>
      </div>
      <div class="p-4">
        <div class="flex items-end space-x-2 h-48">
          <div v-for="(day, index) in chartData" :key="index" class="flex-1 flex flex-col items-center space-y-1">
            <div class="w-full flex space-x-0.5">
              <div class="flex-1 bg-green-500 rounded-t" :style="{ height: (day.gross / 1000) * 2 + 'px' }"></div>
              <div class="flex-1 bg-blue-500 rounded-t" :style="{ height: (day.net / 1000) * 2 + 'px' }"></div>
            </div>
            <span class="text-xs text-gray-500">{{ day.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, FileDown, TrendingUp, ArrowUp, Wallet, Truck, Package, MapPin } from 'lucide-vue-next'

interface RevenueStats {
  grossRevenue: number; netRevenue: number; marginPercent: number; shippingCosts: number; avgOrderValue: number; grossGrowth: number
}

interface Props {
  period: string
  stats: RevenueStats
  byCategory: any[]
  byRegion: any[]
  chartData: any[]
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'update:period': [value: string]
}>()
</script>

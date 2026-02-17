<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Valeur des retours</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Statistiques et details par entreprise de livraison</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette annee</option>
        </select>
        <button class="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
          <Download class="w-4 h-4" />
          <span>Exporter</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
    <!-- Global Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <RotateCcw class="w-5 h-5 text-blue-600" />
          </div>
          <span class="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">Total</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ returnsData.total }}</p>
        <p class="text-sm text-gray-500 mt-1">Retours ce mois</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <DollarSign class="w-5 h-5 text-green-600" />
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Recupere</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ returnsData.recoveredValue }} DT</p>
        <p class="text-sm text-gray-500 mt-1">Valeur recuperee</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Clock class="w-5 h-5 text-orange-600" />
          </div>
          <span class="text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">En transit</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ returnsData.pendingValue }} DT</p>
        <p class="text-sm text-gray-500 mt-1">Valeur en transit</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle class="w-5 h-5 text-red-600" />
          </div>
          <span class="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">Perdu</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ returnsData.lostValue }} DT</p>
        <p class="text-sm text-gray-500 mt-1">Valeur perdue</p>
      </div>
    </div>

    <!-- Statistics per Carrier -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Details par transporteur</h3>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-800">
        <div v-for="carrier in carriersReturnStats" :key="carrier.name" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <!-- Carrier Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <Building2 class="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h4>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="text-sm text-gray-500">{{ carrier.totalReturns }} retours</span>
                  <span class="text-gray-300 dark:text-gray-600">-</span>
                  <span :class="carrier.returnRate > 10 ? 'text-red-600' : carrier.returnRate > 5 ? 'text-orange-600' : 'text-green-600'" class="text-sm font-medium">
                    {{ carrier.returnRate }}% taux de retour
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ carrier.totalValue }} DT</p>
              <p class="text-sm text-gray-500">Valeur totale des retours</p>
            </div>
          </div>

          <!-- Carrier Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div class="flex items-center space-x-2">
                <PackageCheck class="w-4 h-4 text-green-600" />
                <span class="text-xs font-medium text-green-700 dark:text-green-400">Recuperes</span>
              </div>
              <p class="text-lg font-bold text-green-700 dark:text-green-400 mt-1">{{ carrier.recovered }}</p>
              <p class="text-xs text-green-600 dark:text-green-500">{{ carrier.recoveredValue }} DT</p>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div class="flex items-center space-x-2">
                <Truck class="w-4 h-4 text-blue-600" />
                <span class="text-xs font-medium text-blue-700 dark:text-blue-400">En transit</span>
              </div>
              <p class="text-lg font-bold text-blue-700 dark:text-blue-400 mt-1">{{ carrier.inTransit }}</p>
              <p class="text-xs text-blue-600 dark:text-blue-500">{{ carrier.inTransitValue }} DT</p>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div class="flex items-center space-x-2">
                <PackageX class="w-4 h-4 text-red-600" />
                <span class="text-xs font-medium text-red-700 dark:text-red-400">Perdus</span>
              </div>
              <p class="text-lg font-bold text-red-700 dark:text-red-400 mt-1">{{ carrier.lost }}</p>
              <p class="text-xs text-red-600 dark:text-red-500">{{ carrier.lostValue }} DT</p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div class="flex items-center space-x-2">
                <Receipt class="w-4 h-4 text-purple-600" />
                <span class="text-xs font-medium text-purple-700 dark:text-purple-400">Frais retour</span>
              </div>
              <p class="text-lg font-bold text-purple-700 dark:text-purple-400 mt-1">{{ carrier.returnFees }} DT</p>
              <p class="text-xs text-purple-600 dark:text-purple-500">Cout total</p>
            </div>
          </div>

          <!-- Carrier Return Reasons -->
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <p class="text-xs font-medium text-gray-500 mb-3">Raisons des retours</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="(count, reason) in carrier.reasons" :key="reason"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-full',
                  reason === 'Refus client' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  reason === 'Client absent' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  reason === 'Adresse incorrecte' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  reason === 'Colis endommage' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                ]">
                {{ reason }}: {{ count }}
              </span>
            </div>
          </div>

          <!-- Performance indicator -->
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">Delai moyen de retour:</span>
                <span class="text-xs font-semibold text-gray-900 dark:text-white">{{ carrier.avgReturnDays }} jours</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">Taux recuperation:</span>
                <span :class="carrier.recoveryRate >= 90 ? 'text-green-600' : carrier.recoveryRate >= 70 ? 'text-orange-600' : 'text-red-600'" class="text-xs font-semibold">
                  {{ carrier.recoveryRate }}%
                </span>
              </div>
            </div>
            <button class="text-sm text-orange-600 hover:text-orange-700 font-medium">
              Voir tous les retours ->
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Trend Chart Placeholder -->
    <div class="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Evolution des retours</h3>
      <div class="h-48 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
        <div class="text-center">
          <BarChart3 class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p class="text-sm text-gray-500">Graphique d'evolution mensuelle</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ListFilter, Download, RotateCcw, DollarSign, Clock, AlertTriangle,
  Building2, PackageCheck, Truck, PackageX, Receipt, BarChart3
} from 'lucide-vue-next'

interface ReturnsData {
  total: number
  totalValue: number
  recoveredValue: number
  pendingValue: number
  lostValue: number
}

interface CarrierReturnStats {
  name: string
  totalReturns: number
  returnRate: number
  totalValue: number
  recovered: number
  recoveredValue: number
  inTransit: number
  inTransitValue: number
  lost: number
  lostValue: number
  returnFees: number
  reasons: Record<string, number>
  avgReturnDays: number
  recoveryRate: number
}

defineProps<{
  returnsData: ReturnsData
  carriersReturnStats: CarrierReturnStats[]
}>()

defineEmits<{
  'toggle-submenu': []
}>()
</script>

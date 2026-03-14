<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm opacity-90">COD à récupérer</span>
        <Banknote class="w-5 h-5 opacity-80" />
      </div>
      <p class="text-3xl font-bold">{{ pendingCOD.toFixed(2) }} <span class="text-lg font-normal">TND</span></p>
      <p class="text-sm opacity-80 mt-1">{{ pendingCODCount }} colis en cours</p>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-500">Frais de livraison</span>
        <Truck class="w-4 h-4 text-gray-400" />
      </div>
      <p class="text-2xl font-bold text-red-600">{{ deliveryFees.toFixed(2) }} <span class="text-sm font-normal">TND</span></p>
      <p class="text-xs text-gray-500 mt-1">Total colis livrés</p>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-500">Marge nette</span>
        <TrendingUp class="w-4 h-4 text-gray-400" />
      </div>
      <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ netMargin.toFixed(2) }} <span class="text-sm font-normal">TND</span></p>
      <p class="text-xs text-green-600 mt-1">+{{ marginPercent }}% du CA</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Banknote, Truck, TrendingUp } from 'lucide-vue-next'

defineProps<{
  pendingCOD: number
  pendingCODCount: number
  deliveryFees: number
  netMargin: number
  marginPercent: number
}>()
</script>

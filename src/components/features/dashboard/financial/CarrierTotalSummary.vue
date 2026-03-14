<template>
  <div class="border-t-2 border-gray-300 dark:border-gray-600">
    <div class="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center">
      <span class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total</span>
    </div>
    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <div class="px-5 py-2.5 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">COD collecté</span>
        <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ totalCOD.toFixed(2) }} TND</span>
      </div>
      <div class="px-5 py-2.5 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">Frais livraison</span>
        <span class="text-sm font-medium text-red-600">-{{ totalDeliveryFees.toFixed(2) }} TND</span>
      </div>
      <div class="px-5 py-2.5 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">Frais retour</span>
        <span class="text-sm font-medium text-red-600">-{{ totalReturnFees.toFixed(2) }} TND</span>
      </div>
      <div class="px-5 py-2.5 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">Frais pickups</span>
        <span class="text-sm font-medium text-red-600">-{{ totalPickupFees.toFixed(2) }} TND</span>
      </div>
      <div class="px-5 py-2.5 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">Frais de paiement</span>
        <span class="text-sm font-medium text-red-600">
          {{ totalPaymentFees > 0 ? '-' + totalPaymentFees.toFixed(2) + ' TND' : '—' }}
        </span>
      </div>
      <div class="px-5 py-2.5 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">Total retenue</span>
        <span class="text-sm font-medium text-red-600">-{{ totalWithholding.toFixed(2) }} TND</span>
      </div>
      <div class="px-5 py-4 flex items-center justify-between bg-green-50 dark:bg-green-900/20">
        <span class="text-sm font-bold text-gray-900 dark:text-white">Total à récupérer</span>
        <span class="text-lg font-bold text-green-600">{{ netAmount.toFixed(2) }} TND</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalCOD: number
  totalDeliveryFees: number
  totalReturnFees: number
  totalPickupFees: number
  totalPaymentFees: number
  totalWithholding: number
  netAmount: number
}>()
</script>

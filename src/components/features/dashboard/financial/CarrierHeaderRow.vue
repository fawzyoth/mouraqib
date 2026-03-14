<template>
  <div
    class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
    @click="$emit('toggle')"
  >
    <div class="flex items-center space-x-3">
      <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', carrier.colorClass]">
        <Building2 class="w-5 h-5" :class="carrier.iconColor" />
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
        <p class="text-xs text-gray-500">
          <template v-if="carrier.deliveredShipments.length > 0 && carrier.returnedShipments.length > 0">
            {{ carrier.deliveredShipments.length }} livrés · {{ carrier.returnedShipments.length }} retours
          </template>
          <template v-else-if="carrier.deliveredShipments.length > 0">
            {{ carrier.deliveredShipments.length }} livré{{ carrier.deliveredShipments.length !== 1 ? 's' : '' }}
          </template>
          <template v-else>
            {{ carrier.returnedShipments.length }} retour{{ carrier.returnedShipments.length !== 1 ? 's' : '' }}
          </template>
        </p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <!-- COD Collecté -->
      <div class="text-right hidden sm:block">
        <p class="text-xs text-gray-400">COD Collecté</p>
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ carrier.amount.toFixed(2) }} TND</p>
      </div>
      <!-- Frais Total -->
      <div class="text-right hidden sm:block" v-if="carrier.totalFees !== undefined">
        <p class="text-xs text-gray-400">Frais Total</p>
        <p class="text-sm font-semibold text-red-600">-{{ (carrier.totalFees || 0).toFixed(2) }} TND</p>
      </div>
      <!-- Net à recevoir -->
      <div class="text-right bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg hidden sm:block" v-if="carrier.netAmount !== undefined">
        <p class="text-xs text-green-600">Net à recevoir</p>
        <p class="text-sm font-bold text-green-600">{{ (carrier.netAmount || 0).toFixed(2) }} TND</p>
      </div>
      <!-- Mobile: just the amount + progress bar -->
      <div class="text-right sm:hidden">
        <p class="text-base font-bold text-gray-900 dark:text-white">{{ carrier.amount.toFixed(2) }} TND</p>
        <div class="mt-1 h-1.5 w-24 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-green-500 rounded-full"
            :style="{ width: maxAmount > 0 ? (carrier.amount / maxAmount * 100) + '%' : '0%' }"
          ></div>
        </div>
      </div>
      <!-- Chevron -->
      <ChevronDown
        class="w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0"
        :class="{ 'rotate-180': expanded }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2, ChevronDown } from 'lucide-vue-next'
import type { CarrierCOD } from './types'

defineProps<{
  carrier: CarrierCOD
  expanded: boolean
  maxAmount: number
}>()

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

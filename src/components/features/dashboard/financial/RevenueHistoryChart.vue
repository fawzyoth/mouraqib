<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <h3 class="font-semibold text-gray-900 dark:text-white">Historique de revenu</h3>
      <span class="text-xs text-gray-500">7 derniers jours</span>
    </div>
    <div class="p-5">
      <div v-if="totalRevenue > 0" class="flex items-end justify-between gap-2 h-40 mb-3">
        <div
          v-for="(day, index) in history"
          :key="index"
          class="flex-1 flex flex-col items-center justify-end group relative"
        >
          <!-- Tooltip -->
          <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div class="font-semibold">{{ day.amount.toFixed(2) }} TND</div>
            <div class="text-gray-400">{{ day.count }} livraison{{ day.count !== 1 ? 's' : '' }}</div>
          </div>
          <!-- Bar -->
          <div
            class="w-full rounded-t-md transition-all duration-300"
            :class="index === todayIndex ? 'bg-green-500' : 'bg-green-200 dark:bg-green-900/50 group-hover:bg-green-400'"
            :style="{ height: maxRevenue > 0 ? Math.max((day.amount / maxRevenue) * 100, day.amount > 0 ? 4 : 0) + '%' : '0%' }"
          ></div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-40 mb-3">
        <div class="text-center">
          <TrendingUp class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p class="text-sm text-gray-500">Aucune livraison sur 7 jours</p>
        </div>
      </div>
      <!-- Day labels -->
      <div class="flex justify-between gap-2">
        <div
          v-for="(day, index) in history"
          :key="index"
          class="flex-1 text-center"
        >
          <span
            class="text-xs"
            :class="index === todayIndex ? 'text-green-600 font-semibold' : 'text-gray-400'"
          >{{ day.label }}</span>
        </div>
      </div>
      <!-- Summary -->
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
        <span class="text-gray-500">Total 7 jours</span>
        <span class="font-semibold text-gray-900 dark:text-white">{{ totalRevenue.toFixed(2) }} TND</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp } from 'lucide-vue-next'
import type { RevenueDay } from './types'

const props = defineProps<{
  history: RevenueDay[]
}>()

const maxRevenue = computed(() =>
  Math.max(...props.history.map(d => d.amount), 0)
)

const totalRevenue = computed(() =>
  props.history.reduce((sum, d) => sum + d.amount, 0)
)

const todayIndex = computed(() => props.history.length - 1)
</script>

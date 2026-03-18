<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <h3 class="font-semibold text-gray-900 dark:text-white">Historique de revenu</h3>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block"></span>
          <span class="text-xs text-gray-500">COD</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block"></span>
          <span class="text-xs text-gray-500">Frais</span>
        </div>
        <span class="text-xs text-gray-400">7 derniers jours</span>
      </div>
    </div>
    <div class="p-5">
      <div v-if="maxValue > 0" class="flex items-end justify-between gap-2 h-40 mb-3">
        <div
          v-for="(day, index) in history"
          :key="index"
          class="flex-1 flex items-end justify-center gap-0.5 group relative"
        >
          <!-- Tooltip -->
          <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            <div class="font-semibold text-green-400">COD : {{ day.amount.toFixed(2) }} TND</div>
            <div class="text-red-400">Frais : -{{ day.expenses.toFixed(2) }} TND</div>
            <div class="text-gray-300 mt-0.5">Net : {{ (day.amount - day.expenses).toFixed(2) }} TND</div>
            <div class="text-gray-400">{{ day.count }} livraison{{ day.count !== 1 ? 's' : '' }}</div>
          </div>
          <!-- Revenue bar -->
          <div
            class="flex-1 rounded-t-sm transition-all duration-300"
            :class="index === todayIndex ? 'bg-green-500' : 'bg-green-200 dark:bg-green-900/50 group-hover:bg-green-400'"
            :style="{ height: barHeight(day.amount) }"
          ></div>
          <!-- Expenses bar -->
          <div
            class="flex-1 rounded-t-sm transition-all duration-300"
            :class="index === todayIndex ? 'bg-red-400' : 'bg-red-200 dark:bg-red-900/40 group-hover:bg-red-400'"
            :style="{ height: barHeight(day.expenses) }"
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
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-sm">
        <div>
          <div class="text-xs text-gray-400 mb-0.5">COD 7j</div>
          <div class="font-semibold text-gray-900 dark:text-white">{{ totalRevenue.toFixed(2) }} TND</div>
        </div>
        <div>
          <div class="text-xs text-gray-400 mb-0.5">Frais 7j</div>
          <div class="font-semibold text-red-600">-{{ totalExpenses.toFixed(2) }} TND</div>
        </div>
        <div>
          <div class="text-xs text-gray-400 mb-0.5">Net 7j</div>
          <div class="font-semibold" :class="totalNet >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ totalNet.toFixed(2) }} TND
          </div>
        </div>
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

const maxValue = computed(() =>
  Math.max(...props.history.map(d => Math.max(d.amount, d.expenses)), 0)
)

const totalRevenue = computed(() =>
  props.history.reduce((sum, d) => sum + d.amount, 0)
)

const totalExpenses = computed(() =>
  props.history.reduce((sum, d) => sum + d.expenses, 0)
)

const totalNet = computed(() => totalRevenue.value - totalExpenses.value)

const todayIndex = computed(() => props.history.length - 1)

function barHeight(value: number): string {
  if (maxValue.value === 0) return '0px'
  const px = (value / maxValue.value) * 152
  return Math.round(Math.max(px > 0 ? px : 0, value > 0 ? 4 : 0)) + 'px'
}
</script>

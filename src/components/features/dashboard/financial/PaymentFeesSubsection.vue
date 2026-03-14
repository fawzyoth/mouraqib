<template>
  <div class="border-t border-gray-200 dark:border-gray-800">
    <div class="px-5 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center">
      <span class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
        Frais de paiement ({{ rows.length }})
      </span>
    </div>
    <div v-if="rows.length > 0" class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[300px]">
        <thead class="bg-gray-50/80 dark:bg-gray-800/40">
          <tr>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Colis</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">COD du jour</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frais</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <tr v-for="(row, i) in rows" :key="i" class="even:bg-gray-50/50 even:dark:bg-gray-800/20">
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ formatDateLong(row.date) }}</td>
            <td class="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">{{ row.dailyCount > 0 ? row.dailyCount : '—' }}</td>
            <td class="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">{{ row.dailyCOD > 0 ? row.dailyCOD.toFixed(2) + ' TND' : '—' }}</td>
            <td class="px-4 py-3 text-sm text-right font-medium text-red-600">{{ row.fee.toFixed(2) }} TND</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50/80 dark:bg-gray-800/40">
          <tr class="border-t-2 border-gray-200 dark:border-gray-700">
            <td colspan="3" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Frais de Paiement</td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-red-600">{{ totalPaymentFees.toFixed(2) }} TND</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div v-else class="px-5 py-3 text-sm text-gray-400 dark:text-gray-500 italic">
      Aucun frais de paiement
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentFeeRow } from './types'
import { formatDateLong } from './formatters'

defineProps<{
  rows: PaymentFeeRow[]
  totalPaymentFees: number
}>()
</script>

<template>
  <div class="border-t border-gray-200 dark:border-gray-800">
    <div class="px-5 py-2 bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-between">
      <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
        Pickups ({{ events.length }})
      </span>
      <button
        @click.stop="$emit('add-pickup', carrierName)"
        class="text-xs text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-medium transition-colors"
      >
        + Ajouter
      </button>
    </div>
    <div v-if="events.length > 0" class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[400px]">
        <thead class="bg-indigo-50/50 dark:bg-indigo-900/10">
          <tr>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frais</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <tr v-for="ev in events" :key="ev.id" class="even:bg-gray-50/50 even:dark:bg-gray-800/20">
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ formatDateTime(ev.pickupAt) }}</td>
            <td class="px-4 py-3 text-sm text-right font-medium text-indigo-600">{{ ev.fee.toLocaleString() }}</td>
            <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ ev.notes || '—' }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-indigo-50/50 dark:bg-indigo-900/10">
          <tr class="border-t-2 border-gray-200 dark:border-gray-700">
            <td class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">TOTAL Pickups</td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-indigo-600">{{ totalPickupFees.toLocaleString() }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div v-else class="px-5 py-3 text-sm text-gray-400 dark:text-gray-500 italic">
      Aucun pickup enregistré
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PickupEventRow } from './types'
import { formatDateTime } from './formatters'

defineProps<{
  carrierName: string
  events: PickupEventRow[]
  totalPickupFees: number
}>()

defineEmits<{
  (e: 'add-pickup', carrierName: string): void
}>()
</script>

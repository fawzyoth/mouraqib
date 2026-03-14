<template>
  <div v-if="shipments.length > 0">
    <div class="px-5 py-2 bg-orange-50 dark:bg-orange-900/10 border-t border-gray-200 dark:border-gray-800 flex items-center">
      <span class="text-xs font-semibold text-orange-600 uppercase tracking-wider">
        Retours ({{ shipments.length }})
      </span>
    </div>
    <div class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[640px]">
        <thead class="bg-orange-50/50 dark:bg-orange-900/10">
          <tr>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">N° Tracking</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date Retour</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Valeur</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Scan</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-orange-600">Frais Retour</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <tr
            v-for="shipment in shipments"
            :key="shipment.id"
            class="even:bg-gray-50/50 even:dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            @click="$emit('select-shipment', shipment.raw)"
          >
            <td class="px-4 py-3">
              <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.tracking }}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.client }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {{ shipment.deliveryDate ? formatDateTime(shipment.deliveryDate) : '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">{{ shipment.cod > 0 ? shipment.cod.toLocaleString() : '—' }}</td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
              <template v-if="shipment.inScannedAt">
                <span class="text-green-600 font-medium">Scanné</span>
                <div class="text-xs text-gray-400">{{ formatDateTime(shipment.inScannedAt) }}</div>
              </template>
              <template v-else>
                <span class="inline-flex items-center gap-1 text-red-600 font-medium">
                  <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
                  Non scanné
                </span>
              </template>
            </td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-orange-600">{{ shipment.returnFee.toLocaleString() }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-orange-50/50 dark:bg-orange-900/10">
          <tr class="border-t-2 border-gray-200 dark:border-gray-700">
            <td colspan="5" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">TOTAL Retours</td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-orange-600">{{ totalReturnFees.toLocaleString() }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import type { ReturnedRow } from './types'
import { formatDateTime } from './formatters'

defineProps<{
  shipments: ReturnedRow[]
  totalReturnFees: number
}>()

defineEmits<{
  (e: 'select-shipment', raw: any): void
}>()
</script>

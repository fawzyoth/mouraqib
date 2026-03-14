<template>
  <div v-if="shipments.length > 0">
    <div class="px-5 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center">
      <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Livraisons ({{ shipments.length }})
      </span>
    </div>
    <div class="overflow-x-auto border-t border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[640px]">
        <thead class="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">N° Tracking</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Livraison</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Prix</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frais Livr.</th>
            <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Net</th>
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
            <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ shipment.cod.toLocaleString() }}</td>
            <td class="px-4 py-3 text-sm text-right text-red-600">-{{ shipment.deliveryFee.toLocaleString() }}</td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-green-600">{{ shipment.net.toLocaleString() }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 dark:bg-gray-800/50">
          <tr class="border-t-2 border-gray-200 dark:border-gray-700">
            <td colspan="3" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">TOTAL Livraisons</td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">{{ totalCOD.toLocaleString() }}</td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-red-600">-{{ totalDeliveryFees.toLocaleString() }}</td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-green-600">{{ (totalCOD - totalDeliveryFees).toLocaleString() }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeliveredRow } from './types'
import { formatDateTime } from './formatters'

defineProps<{
  shipments: DeliveredRow[]
  totalCOD: number
  totalDeliveryFees: number
}>()

defineEmits<{
  (e: 'select-shipment', raw: any): void
}>()
</script>

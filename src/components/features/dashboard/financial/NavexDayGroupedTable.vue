<template>
  <div>
    <template v-for="date in sortedDates" :key="date">
      <!-- Day header -->
      <div class="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 border-t border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
        <span class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          {{ formatDateLong(date) }}
        </span>
      </div>

      <!-- Deliveries for this day -->
      <template v-if="deliveriesByDay.get(date)?.length">
        <div class="px-5 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900 flex items-center">
          <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Livraisons ({{ deliveriesByDay.get(date)!.length }})
          </span>
        </div>
        <div class="overflow-x-auto border-t border-indigo-100 dark:border-indigo-900">
          <table class="w-full min-w-[560px]">
            <thead class="bg-indigo-50/30 dark:bg-indigo-950/10">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">N° Tracking</th>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">COD</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frais Livr.</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Net</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="s in deliveriesByDay.get(date)"
                :key="s.id"
                class="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer"
                @click="$emit('select-shipment', s.raw)"
              >
                <td class="px-4 py-2.5">
                  <span class="font-mono text-sm text-gray-900 dark:text-white">{{ s.tracking }}</span>
                </td>
                <td class="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{{ s.client }}</td>
                <td class="px-4 py-2.5 text-sm text-right font-medium text-gray-900 dark:text-white">{{ s.cod.toFixed(2) }}</td>
                <td class="px-4 py-2.5 text-sm text-right text-red-600">-{{ s.deliveryFee.toFixed(2) }}</td>
                <td class="px-4 py-2.5 text-sm text-right font-semibold text-green-600">{{ s.net.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Returns for this day -->
      <template v-if="returnsByDay.get(date)?.length">
        <div class="px-5 py-1.5 bg-orange-50/50 dark:bg-orange-950/20 border-t border-orange-100 dark:border-orange-900 flex items-center">
          <span class="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
            Retours ({{ returnsByDay.get(date)!.length }})
          </span>
        </div>
        <div class="overflow-x-auto border-t border-orange-100 dark:border-orange-900">
          <table class="w-full min-w-[560px]">
            <thead class="bg-orange-50/30 dark:bg-orange-950/10">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">N° Tracking</th>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                <th class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frais Retour</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="s in returnsByDay.get(date)"
                :key="s.id"
                class="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors cursor-pointer"
                @click="$emit('select-shipment', s.raw)"
              >
                <td class="px-4 py-2.5">
                  <span class="font-mono text-sm text-gray-900 dark:text-white">{{ s.tracking }}</span>
                </td>
                <td class="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{{ s.client }}</td>
                <td class="px-4 py-2.5 text-sm text-right text-red-600">-{{ s.returnFee.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Day summary footer -->
      <div class="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
        <div class="divide-y divide-gray-100 dark:divide-gray-700/50">
          <div class="px-5 py-2 flex items-center justify-between">
            <span class="text-xs text-gray-500 dark:text-gray-400">COD collecté</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ dayCOD(date).toFixed(2) }} TND
            </span>
          </div>
          <div class="px-5 py-2 flex items-center justify-between">
            <span class="text-xs text-gray-500 dark:text-gray-400">Frais livraison</span>
            <span class="text-sm font-medium text-red-600">-{{ dayDeliveryFees(date).toFixed(2) }} TND</span>
          </div>
          <div class="px-5 py-2 flex items-center justify-between">
            <span class="text-xs text-gray-500 dark:text-gray-400">Frais retour</span>
            <span class="text-sm font-medium text-red-600">-{{ dayReturnFees(date).toFixed(2) }} TND</span>
          </div>
          <div class="px-5 py-2 flex items-center justify-between">
            <span class="text-xs text-gray-500 dark:text-gray-400">Frais pickups</span>
            <span class="text-sm font-medium text-red-600">-{{ dayPickupFees(date).toFixed(2) }} TND</span>
          </div>
          <div class="px-5 py-2 flex items-center justify-between">
            <span class="text-xs text-gray-500 dark:text-gray-400">Frais de paiement</span>
            <span class="text-sm font-medium text-red-600">
              {{ paymentFeeByDay.has(date) ? '-' + paymentFeeByDay.get(date)!.fee.toFixed(2) + ' TND' : '—' }}
            </span>
          </div>
          <div v-if="withholdingRate > 0" class="px-5 py-2 flex items-center justify-between">
            <span class="text-xs text-gray-500 dark:text-gray-400">Retenue ({{ withholdingRate }}%)</span>
            <span class="text-sm font-medium text-red-600">-{{ dayWithholding(date).toFixed(2) }} TND</span>
          </div>
          <div class="px-5 py-2 flex items-center justify-between">
            <span class="text-xs text-gray-500 dark:text-gray-400">Total retenue</span>
            <span class="text-sm font-medium text-red-600">-{{ dayTotalFees(date).toFixed(2) }} TND</span>
          </div>
          <div class="px-5 py-3 flex items-center justify-between bg-green-50 dark:bg-green-900/20">
            <span class="text-sm font-bold text-gray-900 dark:text-white">Total à récupérer</span>
            <span class="text-base font-bold text-green-600">{{ dayNetAmount(date).toFixed(2) }} TND</span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="sortedDates.length === 0" class="px-5 py-8 text-center text-sm text-gray-400">
      Aucune donnée disponible
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DeliveredRow, ReturnedRow, PaymentFeeRow, PickupEventRow } from './types'
import { formatDateLong } from './formatters'

const props = defineProps<{
  deliveredShipments: DeliveredRow[]
  returnedShipments: ReturnedRow[]
  paymentFeeRows: PaymentFeeRow[]
  pickupEvents: PickupEventRow[]
  withholdingRate: number
}>()

defineEmits<{
  (e: 'select-shipment', raw: any): void
}>()

const deliveriesByDay = computed(() => {
  const map = new Map<string, DeliveredRow[]>()
  for (const s of props.deliveredShipments) {
    const day = s.deliveryDate ? s.deliveryDate.split('T')[0] : ''
    if (!day) continue
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(s)
  }
  return map
})

const returnsByDay = computed(() => {
  const map = new Map<string, ReturnedRow[]>()
  for (const s of props.returnedShipments) {
    const day = s.deliveryDate ? s.deliveryDate.split('T')[0] : ''
    if (!day) continue
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(s)
  }
  return map
})

const pickupsByDay = computed(() => {
  const map = new Map<string, PickupEventRow[]>()
  for (const ev of props.pickupEvents) {
    const day = ev.pickupAt ? ev.pickupAt.split('T')[0] : ''
    if (!day) continue
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(ev)
  }
  return map
})

const paymentFeeByDay = computed(() => {
  const map = new Map<string, PaymentFeeRow>()
  for (const row of props.paymentFeeRows) {
    map.set(row.date, row)
  }
  return map
})

const sortedDates = computed(() => {
  const dates = new Set<string>()
  for (const day of deliveriesByDay.value.keys()) dates.add(day)
  for (const day of returnsByDay.value.keys()) dates.add(day)
  return [...dates].sort((a, b) => b.localeCompare(a))
})

function dayCOD(date: string): number {
  return (deliveriesByDay.value.get(date) ?? []).reduce((s, r) => s + r.cod, 0)
}

function dayDeliveryFees(date: string): number {
  return (deliveriesByDay.value.get(date) ?? []).reduce((s, r) => s + r.deliveryFee, 0)
}

function dayReturnFees(date: string): number {
  return (returnsByDay.value.get(date) ?? []).reduce((s, r) => s + r.returnFee, 0)
}

function dayPickupFees(date: string): number {
  return (pickupsByDay.value.get(date) ?? []).reduce((s, ev) => s + ev.fee, 0)
}

function dayPaymentFee(date: string): number {
  return paymentFeeByDay.value.get(date)?.fee ?? 0
}

function dayWithholding(date: string): number {
  const retenuBase = Math.max(0, dayCOD(date) - dayDeliveryFees(date) - dayReturnFees(date) - dayPaymentFee(date))
  return retenuBase * props.withholdingRate / 100
}

function dayTotalFees(date: string): number {
  return dayDeliveryFees(date) + dayReturnFees(date) + dayPickupFees(date) + dayPaymentFee(date) + dayWithholding(date)
}

function dayNetAmount(date: string): number {
  return dayCOD(date) - dayTotalFees(date)
}
</script>

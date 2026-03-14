<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Aperçu financier</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Suivi de votre trésorerie et paiements</p>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <FinancialSummaryCards
        :pending-c-o-d="financialData.pendingCOD"
        :pending-c-o-d-count="financialData.pendingCODCount"
        :delivery-fees="financialData.deliveryFees"
        :net-margin="financialData.netMargin"
        :margin-percent="financialData.marginPercent"
      />

      <CarrierList
        :carriers="financialData.codByCarrier"
        :carrier-sections="carrierSectionsConfig"
        @select-shipment="selectedShipment = $event"
        @add-pickup="$emit('add-pickup', $event)"
      />

      <RevenueHistoryChart :history="financialData.revenueHistory" />
    </main>
  </div>

  <ShipmentDetailPanel
    :show="!!selectedShipment"
    :shipment="selectedShipment"
    @close="selectedShipment = null"
    @request-deletion="selectedShipment = null"
    @cancel-deletion-request="selectedShipment = null"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ListFilter } from 'lucide-vue-next'
import ShipmentDetailPanel from '@/components/features/shipments/ShipmentDetailPanel.vue'
import FinancialSummaryCards from './financial/FinancialSummaryCards.vue'
import CarrierList from './financial/CarrierList.vue'
import RevenueHistoryChart from './financial/RevenueHistoryChart.vue'
import type { FinancialData, CarrierSectionKey } from './financial/types'

interface Props {
  financialData: FinancialData
  /**
   * Optional per-carrier section config. Keys are carrier names.
   * Controls which sections appear and in what order for each carrier.
   * Falls back to DEFAULT_CARRIER_SECTIONS when not specified for a carrier.
   *
   * Example:
   * { 'Aramex': ['livraisons', 'pickups', 'total'] }
   */
  carrierSectionsConfig?: Record<string, CarrierSectionKey[]>
}

withDefaults(defineProps<Props>(), {
  financialData: () => ({
    pendingCOD: 0,
    pendingCODCount: 0,
    deliveryFees: 0,
    netMargin: 0,
    marginPercent: 0,
    codByCarrier: [],
    revenueHistory: [],
  }),
})

defineEmits<{
  (e: 'toggle-sub-menu'): void
  (e: 'add-pickup', carrierId: string): void
}>()

const selectedShipment = ref<any>(null)
</script>

<template>
  <div>
    <template v-for="section in sections" :key="section">
      <LivraisonsTable
        v-if="section === 'livraisons'"
        :shipments="carrier.deliveredShipments"
        :total-c-o-d="carrier.totalCOD"
        :total-delivery-fees="carrier.totalDeliveryFees"
        @select-shipment="$emit('select-shipment', $event)"
      />
      <RetoursTable
        v-else-if="section === 'retours'"
        :shipments="carrier.returnedShipments"
        :total-return-fees="carrier.totalReturnFees"
        @select-shipment="$emit('select-shipment', $event)"
      />
      <template v-else-if="section === 'pickups'">
        <!-- "Frais additionnels" header before the first additional-fee section -->
        <div
          v-if="!hasRenderedAdditionalHeader"
          class="px-5 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 flex items-center"
        >
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Frais additionnels</span>
        </div>
        <PickupsSubsection
          :carrier-name="carrier.name"
          :events="carrier.pickupEvents"
          :total-pickup-fees="carrier.totalPickupFees"
          @add-pickup="$emit('add-pickup', $event)"
        />
      </template>
      <template v-else-if="section === 'frais-paiement'">
        <div
          v-if="!hasRenderedAdditionalHeader && !sections.includes('pickups')"
          class="px-5 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 flex items-center"
        >
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Frais additionnels</span>
        </div>
        <PaymentFeesSubsection
          :rows="carrier.paymentFeeRows"
          :total-payment-fees="carrier.totalPaymentFees"
        />
      </template>
      <NavexDayGroupedTable
        v-else-if="section === 'journees'"
        :delivered-shipments="carrier.deliveredShipments"
        :returned-shipments="carrier.returnedShipments"
        :payment-fee-rows="carrier.paymentFeeRows"
        :pickup-events="carrier.pickupEvents"
        :withholding-rate="carrier.withholdingRate"
        @select-shipment="$emit('select-shipment', $event)"
      />
      <CarrierTotalSummary
        v-else-if="section === 'total'"
        :total-c-o-d="carrier.totalCOD"
        :total-delivery-fees="carrier.totalDeliveryFees"
        :total-return-fees="carrier.totalReturnFees"
        :total-pickup-fees="carrier.totalPickupFees"
        :total-payment-fees="carrier.totalPaymentFees"
        :total-withholding="carrier.totalWithholding"
        :net-amount="carrier.netAmount"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LivraisonsTable from './LivraisonsTable.vue'
import RetoursTable from './RetoursTable.vue'
import PickupsSubsection from './PickupsSubsection.vue'
import PaymentFeesSubsection from './PaymentFeesSubsection.vue'
import CarrierTotalSummary from './CarrierTotalSummary.vue'
import NavexDayGroupedTable from './NavexDayGroupedTable.vue'
import type { CarrierCOD, CarrierSectionKey } from './types'
import { DEFAULT_CARRIER_SECTIONS } from './types'

const props = withDefaults(
  defineProps<{
    carrier: CarrierCOD
    sections?: CarrierSectionKey[]
  }>(),
  { sections: () => [...DEFAULT_CARRIER_SECTIONS] }
)

defineEmits<{
  (e: 'select-shipment', raw: any): void
  (e: 'add-pickup', carrierName: string): void
}>()

// True when 'pickups' appears in sections before 'frais-paiement' (header shown by pickups block)
const hasRenderedAdditionalHeader = computed(() =>
  props.sections.includes('pickups')
)
</script>

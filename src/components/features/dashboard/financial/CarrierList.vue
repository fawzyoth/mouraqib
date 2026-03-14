<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <h3 class="font-semibold text-gray-900 dark:text-white">COD à récupérer par transporteur</h3>
      <span class="text-xs text-gray-500">
        {{ carriers.length }} transporteur{{ carriers.length !== 1 ? 's' : '' }}
      </span>
    </div>
    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <template v-for="carrier in carriers" :key="carrier.name">
        <CarrierHeaderRow
          :carrier="carrier"
          :expanded="expandedCarrier === carrier.name"
          :max-amount="maxCarrierAmount"
          @toggle="toggleCarrier(carrier.name)"
        />
        <CarrierExpanded
          v-if="expandedCarrier === carrier.name"
          :carrier="carrier"
          :sections="carrierSections?.[carrier.name] ?? defaultSections"
          @select-shipment="$emit('select-shipment', $event)"
          @add-pickup="$emit('add-pickup', $event)"
        />
      </template>

      <div v-if="carriers.length === 0" class="px-5 py-10 text-center">
        <Banknote class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p class="text-sm text-gray-500">Aucun COD en attente</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Banknote } from 'lucide-vue-next'
import CarrierHeaderRow from './CarrierHeaderRow.vue'
import CarrierExpanded from './CarrierExpanded.vue'
import type { CarrierCOD, CarrierSectionKey } from './types'
import { DEFAULT_CARRIER_SECTIONS } from './types'

const props = withDefaults(
  defineProps<{
    carriers: CarrierCOD[]
    carrierSections?: Record<string, CarrierSectionKey[]>
    defaultSections?: CarrierSectionKey[]
  }>(),
  { defaultSections: () => [...DEFAULT_CARRIER_SECTIONS] }
)

defineEmits<{
  (e: 'select-shipment', raw: any): void
  (e: 'add-pickup', carrierName: string): void
}>()

const expandedCarrier = ref<string | null>(null)

function toggleCarrier(name: string) {
  expandedCarrier.value = expandedCarrier.value === name ? null : name
}

const maxCarrierAmount = computed(() =>
  Math.max(...props.carriers.map(c => c.amount), 0)
)
</script>

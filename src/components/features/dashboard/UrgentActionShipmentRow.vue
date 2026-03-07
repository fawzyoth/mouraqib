<template>
  <div :class="[
    'flex items-center justify-between p-3 rounded-lg transition-colors duration-300',
    scanned
      ? 'bg-green-50 dark:bg-green-900/20 ring-1 ring-green-200 dark:ring-green-800'
      : 'bg-gray-50 dark:bg-gray-800/50'
  ]">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <span :class="['w-2 h-2 rounded-full flex-shrink-0', getStatusDotClass(shipment.status)]"></span>
      <div class="min-w-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
          {{ shipment.trackingNumber }}
          <span class="text-gray-400 font-normal">— {{ shipment.customerName }}</span>
        </p>
        <p class="text-xs text-gray-500 truncate">
          {{ shipment.destination }} · {{ shipment.carrier }}
          <template v-if="shipment.cod"> · <span class="font-medium">{{ shipment.cod }} TND</span></template>
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0 ml-3">
      <span :class="['text-xs px-2 py-0.5 rounded-full', statusBadgeClass]">
        {{ getStatusLabel(shipment.status) }}
      </span>

      <!-- Contextual primary action -->
      <span
        v-if="actionType === 'confirm' && scanned"
        class="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400"
      >
        <CheckCircle class="w-4 h-4" />
        Scanné
      </span>
      <button
        v-else-if="actionType === 'print'"
        :disabled="processing"
        @click="$emit('print')"
        class="btn-primary btn-primary-sm whitespace-nowrap"
      >
        <Loader2 v-if="processing" class="w-3.5 h-3.5 animate-spin" />
        <template v-else>Imprimer</template>
      </button>

      <!-- Secondary: navigate to detail -->
      <button
        v-if="actionType === 'confirm' || actionType === 'print'"
        @click="$emit('view')"
        class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Voir détails"
      >
        <ExternalLink class="w-4 h-4 text-gray-400" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, ExternalLink, CheckCircle } from 'lucide-vue-next'
import { getStatusLabel, getStatusDotClass } from '@/composables/useStatusFormatting'
import type { UIShipment } from '@/mappers/shipments'

const props = withDefaults(defineProps<{
  shipment: UIShipment
  actionType: string
  processing: boolean
  scanned?: boolean
}>(), {
  scanned: false,
})

defineEmits<{
  (e: 'confirm'): void
  (e: 'print'): void
  (e: 'view'): void
}>()

const statusBadgeClass = computed(() => {
  const s = props.shipment.status
  if (s === 'Livré') return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  if (s === 'En cours' || s === 'Au magasin') return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  if (s.includes('Retour') || s.includes('Rtn')) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (s === 'Enlevé' || s.includes('enlèvement')) return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
})
</script>

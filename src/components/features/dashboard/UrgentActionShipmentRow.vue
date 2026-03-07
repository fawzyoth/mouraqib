<template>
  <div :class="[
    'flex items-center justify-between p-3 rounded-lg transition-colors duration-300 relative',
    isRowScanned
      ? 'bg-green-50 dark:bg-green-900/20 ring-1 ring-green-200 dark:ring-green-800'
      : isOverdue
        ? 'bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800'
        : 'bg-gray-50 dark:bg-gray-800/50'
  ]">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <span :class="['w-2 h-2 rounded-full flex-shrink-0', getStatusDotClass(shipment.status)]"></span>
      <div class="min-w-0 flex-1 py-0.5">
        <div class="flex items-center gap-2 mb-0.5">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ shipment.trackingNumber }}
            <span v-if="shipment.cod" class="text-xs text-gray-500 font-normal ml-1 whitespace-nowrap">({{ shipment.cod }} TND)</span>
          </p>

        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ shipment.customerName }}</span>
          <span class="text-gray-300 dark:text-gray-600">•</span>
          <span>{{ shipment.destination }}</span>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 flex-shrink-0 ml-3">
      <!-- Status & Dates grouped vertically -->
      <div class="flex flex-col items-end gap-1.5">
        <span :class="['text-[10px] px-2 py-0.5 rounded-full font-medium', statusBadgeClass]">
          {{ getStatusLabel(shipment.status) }}
        </span>

        <!-- Contextual date action state -->
        <div
          v-if="(actionType === 'confirm' || actionType === 'return') && isRowScanned"
          class="flex flex-col items-end gap-0.5 text-xs text-green-600 dark:text-green-400 leading-none"
        >
          <span class="flex items-center gap-1 font-medium">
            <CheckCircle class="w-3.5 h-3.5" />
            Scanné
          </span>
          <span v-if="scannedAtDate" class="text-[10px] text-green-700/70 dark:text-green-300/70">
            {{ formatDateTime(scannedAtDate) }}
          </span>
        </div>
        <div
          v-else-if="actionType === 'confirm'"
          class="flex flex-col items-end justify-center"
        >
          <div v-if="isOverdue" class="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium text-xs mb-0.5 leading-none">
            <AlertTriangle class="w-3.5 h-3.5" />
            +24h !
          </div>
          <span :class="['text-[10px]', isOverdue ? 'text-red-500/80 dark:text-red-400/80' : 'text-gray-500 dark:text-gray-400']">
            Créé le {{ formatDateTime(shipment.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-1.5 pl-2 border-l border-gray-100 dark:border-gray-800">
        <button
          v-if="actionType === 'print'"
          :disabled="processing"
          @click="$emit('print')"
          class="btn-primary btn-primary-sm whitespace-nowrap"
        >
          <Loader2 v-if="processing" class="w-3.5 h-3.5 animate-spin" />
          <template v-else>Imprimer</template>
        </button>

        <button
          v-if="actionType === 'confirm' || actionType === 'print' || actionType === 'return'"
          @click="$emit('view')"
          class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          title="Voir détails"
        >
          <ExternalLink class="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>

    <!-- Carrier Badge Badge in Bottom Right Corner -->
    <div class="absolute bottom-0 right-0 px-2 py-0.5 rounded-tl-lg rounded-br-lg text-[9px] font-medium bg-gray-200/80 text-gray-600 dark:bg-gray-700/80 dark:text-gray-400 pointer-events-none">
      {{ shipment.carrier }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-vue-next'
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

const isRowScanned = computed(() => {
  if (props.scanned) return true
  if (props.actionType === 'confirm') return !!props.shipment.outScannedAt
  if (props.actionType === 'return') return !!props.shipment.inScannedAt
  return false
})

const scannedAtDate = computed(() => {
  if (props.actionType === 'confirm') return props.shipment.outScannedAt
  if (props.actionType === 'return') return props.shipment.inScannedAt
  return null
})

const isOverdue = computed(() => {
  if (props.actionType !== 'confirm') return false
  if (isRowScanned.value) return false
  if (!props.shipment.createdAt) return false
  
  const createdTime = new Date(props.shipment.createdAt).getTime()
  const now = Date.now()
  const diffHours = (now - createdTime) / (1000 * 60 * 60)
  return diffHours > 24
})

const statusBadgeClass = computed(() => {
  const s = props.shipment.status
  if (s === 'Livré') return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
  if (s === 'En cours' || s === 'Au magasin' || s === 'Rtn dépôt') return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  if (s.includes('Retour') || s.includes('Rtn')) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (s === 'Enlevé' || s.includes('enlèvement')) return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
})

function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

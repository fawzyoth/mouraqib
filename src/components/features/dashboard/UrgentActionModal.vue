<template>
  <ModalShell :show="show" :title="modalTitle" size="lg" @close="$emit('close')">
    <!-- Grouped view (tout traiter) -->
    <template v-if="!action">
      <div v-for="group in groupedShipments" :key="group.type" class="mb-6 last:mb-0">
        <div class="flex items-center gap-2 mb-3">
          <span :class="[
            'w-2 h-2 rounded-full',
            group.type === 'confirm' ? 'bg-blue-500' :
            group.type === 'print' ? 'bg-purple-500' :
            group.type === 'delayed' ? 'bg-red-500' :
            'bg-yellow-500'
          ]"></span>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">{{ group.label }}</h4>
          <span class="text-xs text-gray-400">({{ group.shipments.length }})</span>
        </div>
        <div class="space-y-2">
          <ShipmentRow
            v-for="s in group.shipments"
            :key="s.id"
            :shipment="s"
            :action-type="group.type"
            :processing="processingIds.has(s.id)"
            @confirm="handleConfirm(s)"
            @print="handlePrint(s)"
            @view="handleView(s)"
          />
        </div>
      </div>
      <div v-if="groupedShipments.length === 0" class="py-8 text-center">
        <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p class="text-gray-500">Toutes les actions ont été traitées !</p>
      </div>
    </template>

    <!-- Single action view -->
    <template v-else>
      <div class="space-y-2">
        <ShipmentRow
          v-for="s in filteredShipments"
          :key="s.id"
          :shipment="s"
          :action-type="action.type"
          :processing="processingIds.has(s.id)"
          @confirm="handleConfirm(s)"
          @print="handlePrint(s)"
          @view="handleView(s)"
        />
      </div>
      <div v-if="filteredShipments.length === 0" class="py-8 text-center">
        <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p class="text-gray-500">Toutes les actions ont été traitées !</p>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle } from 'lucide-vue-next'
import ModalShell from '@/components/shared/ModalShell.vue'
import { useAppStore } from '@/stores/app'
import { getStatusLabel, getStatusDotClass } from '@/composables/useStatusFormatting'
import ShipmentRow from './UrgentActionShipmentRow.vue'
import type { UIShipment } from '@/mappers/shipments'

interface UrgentAction {
  id: string | number
  type: string
  title: string
  actionLabel: string
  shipmentIds: string[]
}

const props = defineProps<{
  show: boolean
  action: UrgentAction | null
  allActions: UrgentAction[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const appStore = useAppStore()
const processingIds = reactive(new Set<string>())

const modalTitle = computed(() => {
  if (props.action) return props.action.title
  return 'Toutes les actions urgentes'
})

// For single-action mode: filter shipments that still match
const filteredShipments = computed(() => {
  if (!props.action) return []
  const idSet = new Set(props.action.shipmentIds)
  return appStore.shipments.filter(s => idSet.has(s.id))
})

// For tout-traiter mode: group by action type
const groupedShipments = computed(() => {
  if (props.action) return []
  const groups: { type: string; label: string; shipments: UIShipment[] }[] = []
  for (const act of props.allActions) {
    if (!act.shipmentIds?.length) continue
    const idSet = new Set(act.shipmentIds)
    const shipments = appStore.shipments.filter(s => idSet.has(s.id))
    if (shipments.length > 0) {
      groups.push({
        type: act.type,
        label: act.title,
        shipments,
      })
    }
  }
  return groups
})

// Auto-close when all shipments are processed
watch(
  () => props.action ? filteredShipments.value.length : groupedShipments.value.reduce((sum, g) => sum + g.shipments.length, 0),
  (count) => {
    if (props.show && count === 0) {
      setTimeout(() => emit('close'), 1200)
    }
  }
)

function handleConfirm(_shipment: UIShipment) {
  emit('close')
  router.push('/pickups')
}

async function handlePrint(shipment: UIShipment) {
  processingIds.add(shipment.id)
  try {
    await appStore.shipmentsData.markAsPrinted([shipment.id])
  } finally {
    processingIds.delete(shipment.id)
  }
}

function handleView(shipment: UIShipment) {
  emit('close')
  router.push(`/shipments?f_trackingNumber=${shipment.trackingNumber}`)
}
</script>

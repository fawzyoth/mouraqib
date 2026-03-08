<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Header -->
    <header class="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Demandes de suppression</h1>
          <p class="text-sm text-gray-500 mt-0.5 hidden sm:block">Validez ou rejetez les demandes de suppression de colis</p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <!-- Empty state -->
        <div v-if="deletionRequests.length === 0" class="p-12 text-center">
          <Trash2 class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Aucune demande de suppression en attente</p>
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">N Suivi</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Transporteur</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Statut</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Raison</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Demande par</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date demande</th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="shipment in deletionRequests" :key="shipment.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-4 py-3">
                  <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.client || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.carrier }}</td>
                <td class="px-4 py-3">
                  <span :class="['inline-flex items-center gap-1 text-sm font-medium', getStatusTextClass(shipment.status)]">
                    <span :class="['w-2 h-2 rounded-full', getStatusDotClass(shipment.status)]"></span>
                    {{ getStatusLabel(shipment.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                  {{ shipment.deletionReason || '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.deletionRequestedByName || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {{ formatDate(shipment.deletionRequestedAt) }}
                </td>
                <td class="px-4 py-3">
                  <div v-if="confirmingId === shipment.id" class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">{{ confirmAction === 'confirm' ? 'Confirmer ?' : 'Rejeter ?' }}</span>
                    <button
                      @click="executeAction(shipment)"
                      :disabled="processing"
                      class="p-1.5 rounded-lg text-white text-xs"
                      :class="confirmAction === 'confirm' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
                    >
                      <Check class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click="confirmingId = null"
                      :disabled="processing"
                      class="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div v-else class="flex items-center gap-1">
                    <button
                      @click="startConfirm(shipment.id, 'confirm')"
                      class="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
                      title="Confirmer la suppression"
                    >
                      <CheckCircle class="w-4 h-4" />
                    </button>
                    <button
                      @click="startConfirm(shipment.id, 'discard')"
                      class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                      title="Rejeter la demande"
                    >
                      <XCircle class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ListFilter, Trash2, CheckCircle, XCircle, Check, X } from 'lucide-vue-next'
import { getStatusLabel, getStatusTextClass, getStatusDotClass } from '@/composables/useStatusFormatting'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import type { UIShipment } from '@/mappers/shipments'

const props = defineProps<{
  shipments: UIShipment[]
}>()

const emit = defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'cancel-deletion-request', shipment: UIShipment): void
  (e: 'deletion-confirmed', shipmentId: string): void
}>()

const toast = useToast()
const confirmingId = ref<string | null>(null)
const confirmAction = ref<'confirm' | 'discard'>('confirm')
const processing = ref(false)

const deletionRequests = computed(() =>
  props.shipments.filter(s => s.deletionRequestedAt)
)

function startConfirm(id: string, action: 'confirm' | 'discard') {
  confirmingId.value = id
  confirmAction.value = action
}

async function executeAction(shipment: UIShipment) {
  processing.value = true
  try {
    if (confirmAction.value === 'confirm') {
      const { error } = await supabase.functions.invoke('confirm-deletion', {
        body: { shipmentId: shipment.id },
      })
      if (error) {
        let detail = ''
        try {
          const response = (error as any).context
          if (response && typeof response.json === 'function') {
            const body = await response.json()
            detail = body?.error || body?.detail || ''
          }
        } catch { /* ignore */ }
        throw new Error(detail || error.message)
      }
      emit('deletion-confirmed', shipment.id)
      toast.success('Colis supprimé')
    } else {
      emit('cancel-deletion-request', shipment)
    }
  } catch (e: any) {
    toast.error('Erreur: ' + (e.message || e))
  } finally {
    processing.value = false
    confirmingId.value = null
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

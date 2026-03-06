<template>
  <!-- Overlay -->
  <div
    v-if="show && shipment"
    @click="$emit('close')"
    class="fixed inset-0 bg-black/30 z-40"
  ></div>

  <!-- Panel -->
  <div
    v-if="show && shipment"
    class="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto"
  >
    <!-- Sticky header -->
    <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">Détails du colis</h3>
        <button @click="$emit('close')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <X class="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>

    <div class="p-4 space-y-5">
      <!-- Top section: Tracking number, status, label -->
      <div class="text-center py-4">
        <p class="text-lg font-mono font-bold text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</p>
        <span :class="[
          'mt-2 inline-block px-3 py-1 text-xs rounded-full font-medium',
          getStatusTextClass(shipment.status)
        ]">{{ getStatusLabel(shipment.status) }}</span>
        <div v-if="shipment.labelNumber" class="mt-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">Bordereau: <span class="font-mono font-medium text-gray-700 dark:text-gray-300">{{ shipment.labelNumber }}</span></p>
          <span v-if="shipment.labelPrinted" class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Imprimé</span>
          <span v-else class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Non imprimé</span>
        </div>
        <a
          v-if="shipment.labelUrl"
          :href="shipment.labelUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Printer class="w-3.5 h-3.5" />
          Imprimer le bordereau
        </a>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Destinataire (Recipient) -->
      <div>
        <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Destinataire</p>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <User class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Nom</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.recipient }}</p>
            </div>
          </div>
          <div v-if="shipment.recipientPhone" class="flex items-start gap-3">
            <PhoneIcon class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.recipientPhone }}</p>
            </div>
          </div>
          <div v-if="shipment.recipientPhoneSecondary" class="flex items-start gap-3">
            <PhoneIcon class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Téléphone secondaire</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.recipientPhoneSecondary }}</p>
            </div>
          </div>
          <div v-if="shipment.recipientAddress" class="flex items-start gap-3">
            <MapPin class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Adresse</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.recipientAddress }}</p>
            </div>
          </div>
          <div v-if="shipment.destination" class="flex items-start gap-3">
            <Globe class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Destination</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.destination }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Expéditeur (Sender) -->
      <div>
        <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Expéditeur</p>
        <div class="space-y-3">
          <div v-if="shipment.senderName" class="flex items-start gap-3">
            <User class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Nom</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.senderName }}</p>
            </div>
          </div>
          <div v-if="shipment.senderPhone" class="flex items-start gap-3">
            <PhoneIcon class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.senderPhone }}</p>
            </div>
          </div>
          <div v-if="shipment.senderAddress" class="flex items-start gap-3">
            <MapPin class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-gray-500 dark:text-gray-400">Adresse</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.senderAddress }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Colis (Package) -->
      <div>
        <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Colis</p>
        <div class="space-y-2.5">
          <div v-if="shipment.productDescription" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Description</span>
            <span class="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{{ shipment.productDescription }}</span>
          </div>
          <div v-if="shipment.reference" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Référence</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.reference }}</span>
          </div>
          <div v-if="shipment.weight" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Poids</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.weight }} kg</span>
          </div>
          <div v-if="shipment.dimensions" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Dimensions</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.dimensions }}</span>
          </div>
          <div v-if="shipment.fragile" class="flex justify-between text-sm items-center">
            <span class="text-gray-500 dark:text-gray-400">Fragile</span>
            <span class="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              <AlertTriangle class="w-3 h-3 inline-block mr-0.5 -mt-0.5" /> Fragile
            </span>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Financier (Financial) -->
      <div>
        <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Financier</p>
        <div class="space-y-2.5">
          <div v-if="shipment.productPrice" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Prix produit</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.productPrice }} TND</span>
          </div>
          <div v-if="shipment.deliveryFee" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Frais de livraison</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.deliveryFee }} TND</span>
          </div>
          <div v-if="shipment.cod" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">COD</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.cod }} TND</span>
          </div>
          <div class="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
            <span class="text-gray-500 dark:text-gray-400 font-medium">Montant total</span>
            <span class="font-bold text-primary-blue dark:text-blue-400 text-base">{{ shipment.totalPrice || shipment.amount }} TND</span>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Suivi (Tracking) -->
      <div>
        <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Suivi</p>
        <div class="space-y-2.5">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Transporteur</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.carrier }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Date de création</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ new Date(shipment.createdAt).toLocaleDateString('fr-FR') }}</span>
          </div>
          <div v-if="shipment.deliveryDate" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Date de livraison</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ new Date(shipment.deliveryDate).toLocaleDateString('fr-FR') }}</span>
          </div>
          <div v-if="shipment.transitDays" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Jours en transit</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.transitDays }} jours</span>
          </div>
          <div v-if="shipment.client" class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Client</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ shipment.client }}</span>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800"></div>

      <!-- Historique (Status Timeline) -->
      <div>
        <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Historique</p>

        <!-- Loading state -->
        <div v-if="loadingEvents" class="flex items-center gap-2 text-xs text-gray-400">
          <div class="w-3 h-3 border-2 border-gray-300 border-t-[#4959b4] rounded-full animate-spin"></div>
          Chargement...
        </div>

        <!-- Empty state -->
        <p v-else-if="events.length === 0" class="text-xs text-gray-400 dark:text-gray-500">Aucun historique</p>

        <!-- Timeline -->
        <div v-else class="relative">
          <div
            v-for="(event, index) in events"
            :key="event.id"
            class="relative flex gap-3 pb-4 last:pb-0"
          >
            <!-- Vertical line -->
            <div class="flex flex-col items-center">
              <div :class="['w-2.5 h-2.5 rounded-full shrink-0 mt-0.5', getStatusDotClass(event.status)]"></div>
              <div v-if="index < events.length - 1" class="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1"></div>
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1 -mt-0.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ getStatusLabel(event.status) }}</span>
                <span class="text-xs text-gray-400 dark:text-gray-500 shrink-0">{{ formatEventDate(event.createdAt) }}</span>
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span v-if="event.source && event.source !== 'system'" class="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {{ getSourceLabel(event.source) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, User, Phone as PhoneIcon, MapPin, Globe, AlertTriangle, Printer } from 'lucide-vue-next'
import { getStatusLabel, getStatusTextClass, getStatusDotClass } from '@/composables/useStatusFormatting'
import { shipmentsService } from '@/services/shipments'
import { STATUS_DB_TO_UI } from '@/mappers/shipments'
import type { UIShipmentEvent } from '@/mappers/shipments'

const props = defineProps<{
  show: boolean
  shipment: Record<string, any> | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

const events = ref<UIShipmentEvent[]>([])
const loadingEvents = ref(false)

watch(
  () => props.show && props.shipment?.id,
  async (shipmentId) => {
    if (!shipmentId) {
      events.value = []
      return
    }
    loadingEvents.value = true
    try {
      const raw = await shipmentsService.getEvents(props.shipment!.id)
      events.value = (raw ?? []).map((e: any) => ({
        id: e.id,
        status: STATUS_DB_TO_UI[e.status] || e.status,
        oldStatus: e.old_status ? (STATUS_DB_TO_UI[e.old_status] || e.old_status) : null,
        description: e.description,
        source: e.source,
        createdAt: e.created_at,
      }))
    } catch (err) {
      console.error('[detail] Failed to load events:', err)
      events.value = []
    } finally {
      loadingEvents.value = false
    }
  },
  { immediate: true }
)

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    poll: 'Auto',
    manual: 'Manuel',
    'carrier-proxy': 'API',
    sync: 'Sync',
    system: 'Système',
  }
  return labels[source] || source
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Confirmer l'enlèvement</h3>
              <p class="text-sm text-gray-500 mt-1">{{ confirmedShipments.length }} colis · {{ confirmedByCarrier.length }} transporteur{{ confirmedByCarrier.length > 1 ? 's' : '' }}</p>
            </div>
            <button @click="$emit('close')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div class="space-y-4">
            <!-- Pickup Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'enlèvement</label>
              <input
                v-model="pickupSchedule.date"
                type="date"
                :min="minPickupDate"
                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <!-- Time Slot -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Créneau horaire</label>
              <select
                v-model="pickupSchedule.timeSlot"
                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un créneau</option>
                <option value="08:00 - 10:00">08:00 - 10:00</option>
                <option value="10:00 - 12:00">10:00 - 12:00</option>
                <option value="14:00 - 16:00">14:00 - 16:00</option>
                <option value="16:00 - 18:00">16:00 - 18:00</option>
              </select>
            </div>

            <!-- Pickup Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse d'enlèvement</label>
              <textarea
                v-model="pickupSchedule.address"
                rows="2"
                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <!-- Per-Carrier Summary -->
            <div class="space-y-3">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Résumé par transporteur</p>
              <div v-for="group in confirmedByCarrier" :key="group.carrier" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <Truck class="w-4 h-4 text-gray-500" />
                    <span class="font-medium text-sm text-gray-900 dark:text-white">{{ group.carrier }}</span>
                  </div>
                  <span class="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">{{ group.shipments.length }} colis</span>
                </div>
                <div class="space-y-1 max-h-24 overflow-y-auto">
                  <div v-for="s in group.shipments" :key="s.trackingNumber" class="flex items-center justify-between text-xs">
                    <span class="font-mono text-gray-600 dark:text-gray-400">{{ s.trackingNumber }}</span>
                    <span class="text-gray-500">{{ (s.cod || s.totalPrice || 0).toLocaleString() }} TND</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info Box -->
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <AlertCircle class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div class="text-sm">
                  <p class="font-medium text-orange-800 dark:text-orange-200">{{ confirmedByCarrier.length }} demande{{ confirmedByCarrier.length > 1 ? 's' : '' }} d'enlèvement {{ confirmedByCarrier.length > 1 ? 'seront créées' : 'sera créée' }}</p>
                  <p class="text-orange-700 dark:text-orange-300 mt-1">Une demande par transporteur. Assurez-vous que les colis sont prêts pour le ramassage.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              @click="handleConfirm"
              :disabled="!pickupSchedule.date || !pickupSchedule.timeSlot || confirmingPickup"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                pickupSchedule.date && pickupSchedule.timeSlot && !confirmingPickup
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              ]"
            >
              <Loader2 v-if="confirmingPickup" class="w-4 h-4 animate-spin" />
              Créer {{ confirmedByCarrier.length }} demande{{ confirmedByCarrier.length > 1 ? 's' : '' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { X, Truck, AlertCircle, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  confirmedShipments: any[]
  confirmedByCarrier: any[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: { date: string; timeSlot: string; address: string }]
}>()

const pickupSchedule = reactive({
  date: '',
  timeSlot: '',
  address: '123 Avenue Habib Bourguiba, Tunis, Tunisie'
})

const confirmingPickup = ref(false)

const minPickupDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

function handleConfirm() {
  if (!pickupSchedule.date || !pickupSchedule.timeSlot) return
  confirmingPickup.value = true
  emit('confirm', {
    date: pickupSchedule.date,
    timeSlot: pickupSchedule.timeSlot,
    address: pickupSchedule.address
  })
}
</script>

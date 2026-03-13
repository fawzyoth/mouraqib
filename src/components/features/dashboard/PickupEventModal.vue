<template>
  <ModalShell :show="show" title="Enregistrer un pickup" size="sm" @close="$emit('close')">
    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- Transporteur -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transporteur</label>
        <select
          v-model="form.carrierId"
          class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
          @change="onCarrierChange"
        >
          <option value="" disabled>Sélectionner un transporteur</option>
          <option v-for="c in carriers" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Date & heure -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & heure</label>
        <input
          v-model="form.pickupAt"
          type="datetime-local"
          class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Frais -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frais (TND)</label>
        <input
          v-model.number="form.fee"
          type="number"
          step="0.01"
          min="0"
          class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes <span class="text-gray-400">(optionnel)</span></label>
        <input
          v-model="form.notes"
          type="text"
          class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Ex: Pickup matin"
        />
      </div>

      <div class="flex gap-3 pt-2">
        <button type="button" @click="$emit('close')" class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Annuler
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </ModalShell>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ModalShell from '@/components/shared/ModalShell.vue'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import type { UICarrier } from '@/mappers/carriers'

const props = defineProps<{
  show: boolean
  carriers: UICarrier[]
  preselectedCarrierId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const appStore = useAppStore()
const toast = useToast()
const submitting = ref(false)

function nowLocalIso(): string {
  const d = new Date()
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 16)
}

function defaultFee(carrierId: string): number {
  const c = props.carriers.find(c => c.id === carrierId)
  return c?.fraisColisPickup ?? 0
}

const form = ref({
  carrierId: props.preselectedCarrierId || '',
  pickupAt: nowLocalIso(),
  fee: defaultFee(props.preselectedCarrierId || ''),
  notes: '',
})

// Reset form when modal opens / preselected carrier changes
watch(() => props.show, (open) => {
  if (open) {
    form.value = {
      carrierId: props.preselectedCarrierId || '',
      pickupAt: nowLocalIso(),
      fee: defaultFee(props.preselectedCarrierId || ''),
      notes: '',
    }
  }
})

watch(() => props.preselectedCarrierId, (id) => {
  if (id) {
    form.value.carrierId = id
    form.value.fee = defaultFee(id)
  }
})

function onCarrierChange() {
  form.value.fee = defaultFee(form.value.carrierId)
}

async function onSubmit() {
  if (!form.value.carrierId) return
  submitting.value = true
  try {
    await appStore.createPickupEvent({
      organization_id: appStore.orgId,
      carrier_id: form.value.carrierId,
      pickup_at: new Date(form.value.pickupAt).toISOString(),
      fee: form.value.fee,
      notes: form.value.notes || null,
    })
    toast.success('Pickup enregistré')
    emit('close')
  } catch (e: any) {
    toast.error('Erreur: ' + (e.message || e))
  } finally {
    submitting.value = false
  }
}
</script>

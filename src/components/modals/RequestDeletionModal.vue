<template>
  <ModalShell :show="show" title="Demander la suppression" size="sm" @close="$emit('close')">
    <div class="space-y-4">
      <div class="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertTriangle class="w-5 h-5 text-red-500 shrink-0" />
        <div class="min-w-0">
          <p class="text-sm font-medium text-red-800 dark:text-red-300">Suppression du colis</p>
          <p class="text-xs text-red-600 dark:text-red-400 font-mono mt-0.5">{{ shipment?.trackingNumber }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Raison <span class="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          v-model="reason"
          rows="3"
          placeholder="Pourquoi ce colis doit-il etre supprime ?"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button
          @click="$emit('confirm', reason.trim() || null)"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Demander la suppression
        </button>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import ModalShell from '@/components/shared/ModalShell.vue'

const props = defineProps<{
  show: boolean
  shipment: Record<string, any> | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm', reason: string | null): void
}>()

const reason = ref('')

watch(() => props.show, (val) => {
  if (val) reason.value = ''
})
</script>

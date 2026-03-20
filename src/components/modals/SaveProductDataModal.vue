<template>
  <ModalShell :show="show" title="Nouveau Produit" size="md" @close="$emit('dismiss')">
    <div class="space-y-4">
      <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Package class="w-5 h-5 text-blue-500 shrink-0" />
        <p class="text-sm text-blue-800 dark:text-blue-300">
          Ce produit n'existe pas encore dans votre catalogue. Souhaitez-vous l'ajouter pour y accéder rapidement la prochaine fois ?
        </p>
      </div>

      <!-- Form -->
      <div class="space-y-4 pt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du produit <span class="text-red-500">*</span></label>
          <input
            v-model="productName"
            type="text"
            class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix (DT) <span class="text-red-500">*</span></label>
          <input
            v-model.number="productPrice"
            type="number"
            min="0"
            step="0.001"
            class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          @click="$emit('dismiss')"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Non, merci
        </button>
        <button
          @click="handleConfirm"
          :disabled="!productName || productPrice < 0"
          class="px-4 py-2 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer le produit
        </button>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Package } from 'lucide-vue-next'
import ModalShell from '@/components/shared/ModalShell.vue'

const props = defineProps<{
  show: boolean
  initialName: string
  initialPrice: number
}>()

const emit = defineEmits<{
  (e: 'confirm', data: { name: string; price: number }): void
  (e: 'dismiss'): void
}>()

const productName = ref('')
const productPrice = ref(0)

watch(
  () => [props.show, props.initialName, props.initialPrice],
  ([show, name, price]) => {
    if (show) {
      productName.value = name as string
      productPrice.value = price as number
    }
  }
)

function handleConfirm() {
  if (productName.value && productPrice.value >= 0) {
    emit('confirm', { name: productName.value, price: productPrice.value })
  }
}
</script>

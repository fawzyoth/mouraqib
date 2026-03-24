<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center gap-3">
        <button @click="$emit('cancel')" class="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ajouter un produit</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Créer un nouveau produit dans votre catalogue</p>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-md mx-auto">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du produit <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Ex: T-shirt blanc"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prix en DT <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.price"
                type="number"
                required
                min="0"
                step="0.001"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="0.000"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="$emit('cancel')"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isSaving || !form.name || form.price < 0"
                class="px-4 py-2 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'

const props = defineProps<{
  productsData: { create: (name: string, price: number) => Promise<any> }
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const isSaving = ref(false)
const form = reactive({ name: '', price: 0 })

async function handleSubmit() {
  if (!form.name || form.price < 0) return
  isSaving.value = true
  try {
    const result = await props.productsData.create(form.name, form.price)
    if (result) emit('submit')
  } finally {
    isSaving.value = false
  }
}
</script>

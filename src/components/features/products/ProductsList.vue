<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Produits</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez votre catalogue de produits</p>
          </div>
        </div>
        <button @click="$emit('open-add-product')" class="btn-primary">
          <Plus class="w-4 h-4" />
          <span>Ajouter un produit</span>
        </button>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total produits</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ products.length }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center">
              <Tag class="w-6 h-6 text-primary-blue" />
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Prix moyen</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ averagePrice }} DT</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <DollarSign class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <div class="p-4">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par nom..."
              class="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800/50">
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Nom</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Prix (DT)</th>
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date de création</th>
                <th class="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="4" class="text-center py-12 text-gray-500">Aucun produit trouvé</td>
              </tr>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ product.name }}</td>
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ product.price }} DT</td>
                <td class="px-4 py-3 text-gray-500">{{ formatDate(product.created_at) }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      v-if="confirmDeleteId !== product.id"
                      @click="openEdit(product)"
                      class="p-1.5 text-gray-400 hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <template v-if="confirmDeleteId === product.id">
                      <span class="text-xs text-red-600 font-medium">Confirmer ?</span>
                      <button
                        @click="confirmDelete(product.id)"
                        class="px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        Oui
                      </button>
                      <button
                        @click="confirmDeleteId = null"
                        class="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Non
                      </button>
                    </template>
                    <button
                      v-else
                      @click="confirmDeleteId = product.id"
                      class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 class="w-4 h-4" />
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

  <!-- Edit modal -->
  <SaveProductDataModal
    :show="showEditModal"
    :initial-name="editProduct?.name || ''"
    :initial-price="editProduct?.price || 0"
    @confirm="handleEditConfirm"
    @dismiss="showEditModal = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Tag, DollarSign, Search, Pencil, Trash2 } from 'lucide-vue-next'
import SaveProductDataModal from '@/components/modals/SaveProductDataModal.vue'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

const props = defineProps<{
  products: Product[]
  productsData: { update: (id: string, name: string, price: number) => Promise<any>; remove: (id: string) => Promise<void> }
}>()

defineEmits<{ (e: 'open-add-product'): void }>()

const searchQuery = ref('')
const confirmDeleteId = ref<string | null>(null)
const showEditModal = ref(false)
const editProduct = ref<Product | null>(null)

const filteredProducts = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return props.products
  return props.products.filter(p => p.name.toLowerCase().includes(q))
})

const averagePrice = computed(() => {
  if (!props.products.length) return '0.000'
  const avg = props.products.reduce((sum, p) => sum + p.price, 0) / props.products.length
  return avg.toFixed(3)
})

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function openEdit(product: Product) {
  editProduct.value = product
  showEditModal.value = true
}

async function handleEditConfirm(data: { name: string; price: number }) {
  if (!editProduct.value) return
  await props.productsData.update(editProduct.value.id, data.name, data.price)
  showEditModal.value = false
  editProduct.value = null
}

async function confirmDelete(id: string) {
  await props.productsData.remove(id)
  confirmDeleteId.value = null
}
</script>

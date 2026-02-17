<template>
  <div>
    <!-- Header -->
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('close')" class="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Resultats de recherche</h1>
            <p class="text-sm text-gray-500 mt-0.5">{{ fullSearchResults.length }} resultat{{ fullSearchResults.length > 1 ? 's' : '' }} pour "{{ searchResultsQuery }}"</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="$emit('close')" class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
            <X class="w-4 h-4" />
            <span class="hidden sm:inline">Fermer</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Search Results Content -->
    <main class="flex-1 overflow-y-auto p-4 sm:p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Search Input & Filters -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search Input -->
            <div class="flex-1 relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="searchResultsQuery"
                type="text"
                placeholder="Rechercher un colis, client, numero de suivi..."
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#4959b4] focus:border-transparent"
              />
            </div>
            <!-- Status Filter -->
            <select
              v-model="searchResultsFilter"
              class="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#4959b4]"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in-transit">En livraison</option>
              <option value="delivered">Livres</option>
              <option value="returned">Retournes</option>
            </select>
            <!-- Sort -->
            <select
              v-model="searchResultsSort"
              class="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#4959b4]"
            >
              <option value="date">Date (recent)</option>
              <option value="tracking">Numero de suivi</option>
              <option value="recipient">Destinataire</option>
              <option value="amount">Montant</option>
            </select>
          </div>
        </div>

        <!-- Results Grid -->
        <div v-if="fullSearchResults.length > 0" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Colis</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinataire</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Transporteur</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr
                  v-for="result in fullSearchResults"
                  :key="result.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  @click="$emit('select-result', result)"
                >
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Package class="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p class="text-sm font-semibold font-mono text-gray-900 dark:text-white">{{ result.trackingNumber }}</p>
                        <p class="text-xs text-gray-500">{{ new Date(result.createdAt).toLocaleDateString('fr-FR') }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ result.recipient }}</p>
                    <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ result.recipientAddress }}</p>
                  </td>
                  <td class="px-4 py-4 hidden md:table-cell">
                    <p class="text-sm text-gray-700 dark:text-gray-300">{{ result.carrier }}</p>
                  </td>
                  <td class="px-4 py-4">
                    <span :class="[
                      'px-2 py-1 text-xs rounded-full font-medium',
                      result.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      result.status === 'Out for delivery' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      result.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      result.status === 'Returned' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-600'
                    ]">
                      {{ result.status === 'Delivered' ? 'Livre' : result.status === 'Out for delivery' ? 'En livraison' : result.status === 'Pending' ? 'En attente' : result.status === 'Returned' ? 'Retourne' : result.status }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-right">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ result.amount }} TND</p>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <button
                      @click.stop="$emit('select-result', result)"
                      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Voir les details"
                    >
                      <Eye class="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <SearchX class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun resultat trouve</h3>
          <p class="text-gray-500 mb-4">Aucun colis ne correspond a "{{ searchResultsQuery }}"</p>
          <p class="text-sm text-gray-400">Essayez avec un numero de suivi, nom de client, ou numero de telephone</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  X,
  Search,
  Package,
  Eye,
  SearchX
} from 'lucide-vue-next'

interface Shipment {
  id: number
  trackingNumber: string
  carrier: string
  recipient: string
  recipientAddress: string
  recipientPhone: string
  status: string
  amount: number
  createdAt: string
  orderId?: string
  [key: string]: any
}

const props = defineProps<{
  shipments: Shipment[]
  initialQuery: string
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'select-result', result: Shipment): void
}>()

const searchResultsQuery = ref(props.initialQuery)
const searchResultsFilter = ref<'all' | 'pending' | 'delivered' | 'in-transit' | 'returned'>('all')
const searchResultsSort = ref<'date' | 'tracking' | 'recipient' | 'amount'>('date')

const fullSearchResults = computed(() => {
  if (!searchResultsQuery.value || searchResultsQuery.value.length < 2) return []

  const query = searchResultsQuery.value.toLowerCase().trim()

  let results = props.shipments.filter(shipment => {
    return (
      shipment.trackingNumber.toLowerCase().includes(query) ||
      shipment.recipient.toLowerCase().includes(query) ||
      shipment.recipientPhone.toLowerCase().includes(query) ||
      shipment.recipientAddress.toLowerCase().includes(query) ||
      (shipment.orderId && shipment.orderId.toLowerCase().includes(query))
    )
  })

  // Apply status filter
  if (searchResultsFilter.value !== 'all') {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'delivered': 'Delivered',
      'in-transit': 'Out for delivery',
      'returned': 'Returned'
    }
    results = results.filter(s => s.status === statusMap[searchResultsFilter.value])
  }

  // Apply sorting
  results = [...results].sort((a, b) => {
    switch (searchResultsSort.value) {
      case 'tracking':
        return a.trackingNumber.localeCompare(b.trackingNumber)
      case 'recipient':
        return a.recipient.localeCompare(b.recipient)
      case 'amount':
        return b.amount - a.amount
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return results
})
</script>

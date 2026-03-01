<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" @click.self="emit('close')">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')"></div>

        <!-- Search Modal -->
        <div class="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <Search class="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref="globalSearchInput"
              v-model="globalSearchQuery"
              type="text"
              placeholder="Rechercher un colis, client, numéro de suivi..."
              class="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-base"
              @keydown.down.prevent="navigateSearchResults(1)"
              @keydown.up.prevent="navigateSearchResults(-1)"
              @keydown.enter.prevent="selectSearchResult"
              @keydown.escape="emit('close')"
            />
            <kbd class="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">ESC</kbd>
          </div>

          <!-- Search Results -->
          <div class="max-h-[400px] overflow-y-auto">
            <!-- Empty State / Suggestions -->
            <div v-if="!globalSearchQuery" class="p-2">
              <p class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recherche rapide</p>
              <div class="space-y-1">
                <button
                  v-for="(suggestion, idx) in searchSuggestions"
                  :key="suggestion.type"
                  @click="applySearchSuggestion(suggestion)"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    selectedSearchIndex === idx ? 'bg-[#4959b4] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  ]"
                >
                  <component :is="suggestion.icon" :class="['w-4 h-4', selectedSearchIndex === idx ? 'text-white' : 'text-gray-400']" />
                  <div class="flex-1 min-w-0">
                    <p :class="['text-sm font-medium', selectedSearchIndex === idx ? 'text-white' : 'text-gray-900 dark:text-white']">{{ suggestion.label }}</p>
                    <p :class="['text-xs', selectedSearchIndex === idx ? 'text-white/70' : 'text-gray-500']">{{ suggestion.hint }}</p>
                  </div>
                </button>
              </div>

              <!-- Recent Searches -->
              <div v-if="recentSearches.length > 0" class="mt-4">
                <p class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recherches récentes</p>
                <div class="space-y-1">
                  <button
                    v-for="recent in recentSearches"
                    :key="recent"
                    @click="globalSearchQuery = recent"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <History class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ recent }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Search Results -->
            <div v-else class="p-2">
              <!-- Results -->
              <div v-if="globalSearchResults.length > 0">
                <p class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {{ globalSearchResults.length }} résultat{{ globalSearchResults.length > 1 ? 's' : '' }}
                </p>
                <div class="space-y-1">
                  <button
                    v-for="(result, idx) in globalSearchResults"
                    :key="result.id"
                    @click="openSearchResult(result)"
                    :class="[
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors',
                      selectedSearchIndex === idx ? 'bg-[#4959b4] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    ]"
                  >
                    <div :class="[
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      selectedSearchIndex === idx ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                    ]">
                      <Package :class="['w-5 h-5', selectedSearchIndex === idx ? 'text-white' : 'text-gray-500']" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p :class="['text-sm font-semibold font-mono', selectedSearchIndex === idx ? 'text-white' : 'text-gray-900 dark:text-white']">
                          {{ result.trackingNumber }}
                        </p>
                        <span :class="[
                          'px-1.5 py-0.5 text-xs rounded-full font-medium',
                          selectedSearchIndex === idx ? 'bg-white/20 text-white' :
                          result.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          result.status === 'Out for delivery' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          result.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600'
                        ]">
                          {{ result.status === 'Delivered' ? 'Livré' : result.status === 'Out for delivery' ? 'En livraison' : result.status === 'Pending' ? 'En attente' : result.status }}
                        </span>
                      </div>
                      <p :class="['text-xs mt-0.5 truncate', selectedSearchIndex === idx ? 'text-white/70' : 'text-gray-500']">
                        {{ result.recipient }} • {{ result.recipientAddress }}
                      </p>
                    </div>
                    <div :class="['text-right flex-shrink-0', selectedSearchIndex === idx ? 'text-white/70' : 'text-gray-400']">
                      <p class="text-xs">{{ result.carrier }}</p>
                      <p class="text-xs font-medium">{{ result.amount }} TND</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- No Results -->
              <div v-else class="py-12 text-center">
                <SearchX class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">Aucun résultat pour "{{ globalSearchQuery }}"</p>
                <p class="text-sm text-gray-400 mt-1">Essayez un numéro de suivi, nom de client ou téléphone</p>
              </div>

              <!-- View All Results Button -->
              <div v-if="globalSearchQuery && globalSearchResults.length > 0" class="px-3 pb-2">
                <button
                  @click="openSearchResultsPage"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4959b4] hover:bg-[#3d4a9e] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink class="w-4 h-4" />
                  Voir tous les résultats
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">↑</kbd>
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">↓</kbd>
                <span class="ml-1">Naviguer</span>
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">↵</kbd>
                <span class="ml-1">Ouvrir</span>
              </span>
            </div>
            <span class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">ESC</kbd>
              <span class="ml-1">Fermer</span>
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, markRaw } from 'vue'
import {
  Search,
  SearchX,
  Package,
  History,
  ExternalLink,
  User,
  Phone as PhoneIcon
} from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  shipments: any[]
  clients: any[]
}>()

const emit = defineEmits<{
  close: []
  'select-result': [result: any]
  navigate: [query: string]
}>()

const globalSearchQuery = ref('')
const globalSearchInput = ref<HTMLInputElement | null>(null)
const selectedSearchIndex = ref(0)
const recentSearches = ref<string[]>([])

const searchSuggestions = [
  { type: 'tracking', label: 'Rechercher par numéro de suivi', hint: 'Ex: TN-2026-0001', icon: markRaw(Package) },
  { type: 'phone', label: 'Rechercher par téléphone', hint: 'Ex: +216 22 333 444', icon: markRaw(PhoneIcon) },
  { type: 'name', label: 'Rechercher par nom', hint: 'Nom du destinataire ou client', icon: markRaw(User) },
  { type: 'barcode', label: 'Scanner un code-barres', hint: 'Utiliser le scanner', icon: markRaw(Search) },
]

const globalSearchResults = computed(() => {
  if (!globalSearchQuery.value || globalSearchQuery.value.length < 2) return []

  const query = globalSearchQuery.value.toLowerCase().trim()

  return props.shipments.filter(shipment => {
    return (
      shipment.trackingNumber.toLowerCase().includes(query) ||
      shipment.recipient.toLowerCase().includes(query) ||
      shipment.recipientPhone.toLowerCase().includes(query) ||
      shipment.recipientAddress.toLowerCase().includes(query) ||
      (shipment.orderId && shipment.orderId.toLowerCase().includes(query))
    )
  }).slice(0, 10)
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    globalSearchQuery.value = ''
    selectedSearchIndex.value = 0
    nextTick(() => {
      globalSearchInput.value?.focus()
    })
  }
})

function navigateSearchResults(direction: number) {
  const items = globalSearchQuery.value ? globalSearchResults.value : searchSuggestions
  const maxIndex = items.length - 1

  selectedSearchIndex.value += direction
  if (selectedSearchIndex.value < 0) selectedSearchIndex.value = maxIndex
  if (selectedSearchIndex.value > maxIndex) selectedSearchIndex.value = 0
}

function selectSearchResult() {
  if (!globalSearchQuery.value) {
    const suggestion = searchSuggestions[selectedSearchIndex.value]
    if (suggestion) {
      applySearchSuggestion(suggestion)
    }
  } else if (globalSearchResults.value.length > 0) {
    const result = globalSearchResults.value[selectedSearchIndex.value]
    if (result) {
      openSearchResult(result)
    }
  }
}

function applySearchSuggestion(_suggestion: any) {
  globalSearchInput.value?.focus()
}

function openSearchResult(result: any) {
  if (!recentSearches.value.includes(result.trackingNumber)) {
    recentSearches.value.unshift(result.trackingNumber)
    if (recentSearches.value.length > 5) recentSearches.value.pop()
  }

  emit('select-result', result)
}

function openSearchResultsPage() {
  emit('navigate', globalSearchQuery.value)
}
</script>

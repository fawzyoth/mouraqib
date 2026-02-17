<template>
  <div>
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Bordereaux</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gerez et imprimez vos etiquettes d'envoi</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center space-x-3">
          <button
            @click="$emit('print-selected', selectedLabels)"
            :disabled="selectedLabels.length === 0"
            :class="[
              'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedLabels.length > 0
                ? 'bg-primary-blue hover:bg-primary-blue-hover text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            ]"
          >
            <Printer class="w-4 h-4" />
            <span>Imprimer ({{ selectedLabels.length }})</span>
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ shipments.length }}</p>
              <p class="text-sm text-gray-500">Total bordereaux</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Printer class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ printedLabelsCount }}</p>
              <p class="text-sm text-gray-500">Imprimes</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock class="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ unprintedLabelsCount }}</p>
              <p class="text-sm text-gray-500">A imprimer</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Banknote class="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalCOD.toLocaleString() }} TND</p>
              <p class="text-sm text-gray-500">Total COD</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <div class="p-4 flex items-center space-x-4">
          <div class="flex-1 relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              v-model="labelSearchQuery"
              type="text"
              placeholder="Rechercher par N bordereau, client, telephone..."
              class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <select
            v-model="labelFilterPrinted"
            class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="all">Tous les bordereaux</option>
            <option value="printed">Imprimes</option>
            <option value="unprinted">Non imprimes</option>
          </select>
          <button
            @click="selectAllLabels"
            class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {{ selectedLabels.length === filteredLabels.length && filteredLabels.length > 0 ? 'Tout deselectionner' : 'Tout selectionner' }}
          </button>
        </div>
      </div>

      <!-- Labels Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="shipment in filteredLabels"
          :key="shipment.id"
          :class="[
            'bg-white dark:bg-gray-900 rounded-xl border-2 p-4 transition-all cursor-pointer hover:shadow-lg',
            selectedLabels.includes(shipment.id) ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-200 dark:border-gray-800'
          ]"
          @click="toggleLabelSelection(shipment.id)"
        >
          <!-- Label Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                :checked="selectedLabels.includes(shipment.id)"
                @click.stop
                @change="toggleLabelSelection(shipment.id)"
                class="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
              />
              <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ shipment.labelNumber }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'px-2 py-0.5 text-xs rounded font-medium',
                  shipment.labelPrinted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                ]"
              >
                {{ shipment.labelPrinted ? 'Imprime' : 'A imprimer' }}
              </span>
              <button
                @click.stop="$emit('open-label-preview', shipment)"
                class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <Printer class="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <!-- Carrier Badge -->
          <div class="flex items-center space-x-2 mb-3">
            <span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded font-medium">
              {{ shipment.carrier }}
            </span>
            <span v-if="shipment.fragile" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
              Fragile
            </span>
          </div>

          <!-- Recipient Info -->
          <div class="space-y-2 text-sm">
            <div class="flex items-start space-x-2">
              <User class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ shipment.customerName }}</p>
                <p class="text-gray-500">{{ shipment.recipientPhone }}</p>
              </div>
            </div>
            <div class="flex items-start space-x-2">
              <MapPin class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p class="text-gray-600 dark:text-gray-400 line-clamp-2">{{ shipment.recipientAddress }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-3 text-xs text-gray-500">
              <span>{{ shipment.weight }} kg</span>
              <span>{{ shipment.dimensions }} cm</span>
            </div>
            <span class="font-semibold text-orange-600">{{ shipment.cod?.toLocaleString() }} TND</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredLabels.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 dark:text-gray-400">Aucun bordereau trouve</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter,
  Printer,
  FileText,
  Clock,
  Banknote,
  Search,
  User,
  MapPin
} from 'lucide-vue-next'

interface LabelShipment {
  id: number
  labelNumber: string
  labelPrinted: boolean
  carrier: string
  fragile?: boolean
  customerName: string
  recipientPhone: string
  recipientAddress: string
  weight: number
  dimensions: string
  cod?: number
  trackingNumber?: string
  [key: string]: any
}

const props = defineProps<{
  shipments: LabelShipment[]
}>()

defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'print-selected', ids: number[]): void
  (e: 'open-label-preview', shipment: LabelShipment): void
}>()

const selectedLabels = ref<number[]>([])
const labelSearchQuery = ref('')
const labelFilterPrinted = ref('all')

const printedLabelsCount = computed(() => {
  return props.shipments.filter(s => s.labelPrinted).length
})

const unprintedLabelsCount = computed(() => {
  return props.shipments.filter(s => !s.labelPrinted).length
})

const totalCOD = computed(() => {
  return props.shipments.reduce((sum, s) => sum + (s.cod || 0), 0)
})

const filteredLabels = computed(() => {
  let result = props.shipments

  if (labelFilterPrinted.value === 'printed') {
    result = result.filter(s => s.labelPrinted)
  } else if (labelFilterPrinted.value === 'unprinted') {
    result = result.filter(s => !s.labelPrinted)
  }

  if (labelSearchQuery.value) {
    const query = labelSearchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.labelNumber?.toLowerCase().includes(query) ||
      s.customerName?.toLowerCase().includes(query) ||
      s.recipientPhone?.toLowerCase().includes(query) ||
      s.trackingNumber?.toLowerCase().includes(query)
    )
  }

  return result
})

function toggleLabelSelection(id: number) {
  const index = selectedLabels.value.indexOf(id)
  if (index === -1) {
    selectedLabels.value.push(id)
  } else {
    selectedLabels.value.splice(index, 1)
  }
}

function selectAllLabels() {
  if (selectedLabels.value.length === filteredLabels.value.length && filteredLabels.value.length > 0) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = filteredLabels.value.map(s => s.id)
  }
}
</script>

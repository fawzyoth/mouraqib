<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Colis en retard</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{{ dateFilteredShipments.length }} colis nécessitent votre attention</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <button class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Exporter
        </button>
        <button class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
          <MessageCircle class="w-4 h-4" />
          <span>WhatsApp tous</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Date Filter -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer par période:</span>
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="dateFilter = 'today'"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              dateFilter === 'today'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            Aujourd'hui
          </button>
          <button
            @click="dateFilter = '48h'"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              dateFilter === '48h'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            48 heures
          </button>
          <button
            @click="dateFilter = 'week'"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              dateFilter === 'week'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            Cette semaine
          </button>
          <button
            @click="dateFilter = 'month'"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              dateFilter === 'month'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            Ce mois
          </button>
          <button
            @click="dateFilter = 'custom'"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              dateFilter === 'custom'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            Personnalisé
          </button>
          <button
            @click="dateFilter = 'all'"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              dateFilter === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            Tous
          </button>
        </div>
        <!-- Custom Date Range -->
        <Transition name="fade">
          <div v-if="dateFilter === 'custom'" class="flex items-center space-x-2 ml-auto">
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-500">Du:</label>
              <input
                type="date"
                v-model="dateRangeStart"
                class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-500">Au:</label>
              <input
                type="date"
                v-model="dateRangeEnd"
                class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Severity Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <button @click="severityFilter = 'all'" :class="['rounded-xl p-4 border transition-colors text-left', severityFilter === 'all' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dateFilteredShipments.length }}</p>
        <p class="text-sm text-gray-500">Tous les retards</p>
      </button>
      <button @click="severityFilter = '24h'" :class="['rounded-xl p-4 border transition-colors text-left', severityFilter === '24h' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
        <p class="text-2xl font-bold text-yellow-600">{{ dateFilteredShipments.filter(s => s.delayDays === 1).length }}</p>
        <p class="text-sm text-gray-500">Retard 24h</p>
      </button>
      <button @click="severityFilter = '48h'" :class="['rounded-xl p-4 border transition-colors text-left', severityFilter === '48h' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
        <p class="text-2xl font-bold text-orange-600">{{ dateFilteredShipments.filter(s => s.delayDays >= 2 && s.delayDays <= 3).length }}</p>
        <p class="text-sm text-gray-500">Retard 48-72h</p>
      </button>
      <button @click="severityFilter = 'critical'" :class="['rounded-xl p-4 border transition-colors text-left', severityFilter === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
        <p class="text-2xl font-bold text-red-600">{{ dateFilteredShipments.filter(s => s.delayDays > 3).length }}</p>
        <p class="text-sm text-gray-500">Critique (+72h)</p>
      </button>
    </div>

    <!-- Pattern Detection Alert -->
    <div v-if="delayedPatterns.length > 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
      <div class="flex items-start space-x-3">
        <Lightbulb class="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <p class="font-medium text-yellow-800 dark:text-yellow-200">Patterns détectés</p>
          <ul class="mt-2 space-y-1">
            <li v-for="pattern in delayedPatterns" :key="pattern.id" class="text-sm text-yellow-700 dark:text-yellow-300">
              &bull; {{ pattern.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Delayed Shipments List -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <input type="checkbox" class="w-4 h-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue" />
          <span class="text-sm text-gray-500">Sélectionner tout</span>
        </div>
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Changer transporteur
          </button>
          <button class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Contacter clients
          </button>
        </div>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div v-for="shipment in finalFilteredShipments" :key="shipment.id" class="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <input type="checkbox" class="w-4 h-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue" />
              <div :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center',
                shipment.delayDays > 3 ? 'bg-red-100 dark:bg-red-900/30' :
                shipment.delayDays >= 2 ? 'bg-orange-100 dark:bg-orange-900/30' :
                'bg-yellow-100 dark:bg-yellow-900/30'
              ]">
                <AlertTriangle :class="[
                  'w-5 h-5',
                  shipment.delayDays > 3 ? 'text-red-600' :
                  shipment.delayDays >= 2 ? 'text-orange-600' :
                  'text-yellow-600'
                ]" />
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.tracking }}</p>
                  <span :class="[
                    'px-2 py-0.5 text-xs rounded-full font-medium',
                    shipment.delayDays > 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    shipment.delayDays >= 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  ]">+{{ shipment.delayDays }} jour{{ shipment.delayDays > 1 ? 's' : '' }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">{{ shipment.client }} &middot; {{ shipment.destination }}</p>
                <p class="text-xs text-gray-400 mt-0.5">Transporteur: {{ shipment.carrier }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="WhatsApp">
                <MessageCircle class="w-4 h-4" />
              </button>
              <button class="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Contacter transporteur">
                <Truck class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter,
  MessageCircle,
  Lightbulb,
  AlertTriangle,
  Truck
} from 'lucide-vue-next'

interface DelayedShipment {
  id: string | number
  tracking: string
  client: string
  destination: string
  carrier: string
  delayDays: number
  createdAt: string
}

interface DelayedPattern {
  id: string | number
  message: string
}

interface Props {
  shipments: DelayedShipment[]
  delayedPatterns: DelayedPattern[]
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'toggle-sub-menu'): void
}>()

const dateFilter = ref<'all' | 'today' | '48h' | 'week' | 'month' | 'custom'>('all')
const severityFilter = ref<'all' | '24h' | '48h' | 'critical'>('all')
const dateRangeStart = ref('')
const dateRangeEnd = ref('')

const dateFilteredShipments = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return props.shipments.filter(shipment => {
    const shipmentDate = new Date(shipment.createdAt)
    shipmentDate.setHours(0, 0, 0, 0)

    switch (dateFilter.value) {
      case 'today':
        return shipmentDate.getTime() === today.getTime()
      case '48h': {
        const twoDaysAgo = new Date(today)
        twoDaysAgo.setDate(today.getDate() - 2)
        return shipmentDate >= twoDaysAgo
      }
      case 'week': {
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return shipmentDate >= weekAgo
      }
      case 'month': {
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return shipmentDate >= monthAgo
      }
      case 'custom':
        if (dateRangeStart.value && dateRangeEnd.value) {
          const startDate = new Date(dateRangeStart.value)
          const endDate = new Date(dateRangeEnd.value)
          endDate.setHours(23, 59, 59, 999)
          return shipmentDate >= startDate && shipmentDate <= endDate
        }
        return true
      default:
        return true
    }
  })
})

const finalFilteredShipments = computed(() => {
  const dateFiltered = dateFilteredShipments.value
  if (severityFilter.value === 'all') return dateFiltered
  if (severityFilter.value === '24h') return dateFiltered.filter(s => s.delayDays === 1)
  if (severityFilter.value === '48h') return dateFiltered.filter(s => s.delayDays >= 2 && s.delayDays <= 3)
  if (severityFilter.value === 'critical') return dateFiltered.filter(s => s.delayDays > 3)
  return dateFiltered
})
</script>

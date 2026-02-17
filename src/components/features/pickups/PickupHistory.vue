<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Historique des enlevements</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Consultez l'historique de tous vos enlevements</p>
        </div>
      </div>
    </div>
  </header>

  <main class="flex-1 overflow-y-auto p-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-[#4959b4]/10 rounded-lg">
            <History class="w-5 h-5 text-[#4959b4]" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ pickupHistory.length }}</p>
            <p class="text-sm text-gray-500">Total enlevements</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ completedCount }}</p>
            <p class="text-sm text-gray-500">Ce mois-ci</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <TrendingUp class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">98%</p>
            <p class="text-sm text-gray-500">Taux de succes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Historique complet</h3>
      </div>

      <div v-if="pickupHistory.length === 0" class="p-8 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <History class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 dark:text-gray-400">Aucun historique disponible</p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <div v-for="pickup in pickupHistory" :key="pickup.id" @click="$emit('view-pickup-detail', pickup)" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-semibold text-gray-900 dark:text-white">{{ pickup.shipmentCount }} colis</p>
                  <span class="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">{{ pickup.deliveredCount || 0 }} livres</span>
                  <span v-if="pickup.returnedCount > 0" class="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">{{ pickup.returnedCount }} retournes</span>
                </div>
                <p class="text-sm text-gray-500">{{ pickup.date }} - {{ pickup.timeSlot }} - {{ pickup.carrier }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ListFilter, History, CheckCircle, TrendingUp, Eye } from 'lucide-vue-next'

interface PickupHistoryItem {
  id: string | number
  shipmentCount: number
  deliveredCount?: number
  returnedCount?: number
  date: string
  timeSlot: string
  carrier: string
  status: string
}

const props = defineProps<{
  pickupHistory: PickupHistoryItem[]
}>()

defineEmits<{
  'toggle-submenu': []
  'view-pickup-detail': [pickup: PickupHistoryItem]
}>()

const completedCount = computed(() => {
  return props.pickupHistory.filter(p => p.status === 'completed').length
})
</script>

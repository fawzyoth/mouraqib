<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Historique des enlevements</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Tous les colis scannes et marques comme enleves</p>
        </div>
      </div>
    </div>
  </header>

  <main class="flex-1 overflow-y-auto p-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ scannedShipments.length }}</p>
            <p class="text-sm text-gray-500">Total enleves</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ todayCount }}</p>
            <p class="text-sm text-gray-500">Aujourd'hui</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Wallet class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalCOD.toLocaleString() }}</p>
            <p class="text-sm text-gray-500">COD Total (TND)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Shipments Table -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Colis enleves</h3>
      </div>

      <div v-if="scannedShipments.length === 0" class="p-8 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <ScanBarcode class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 dark:text-gray-400">Aucun colis enleve</p>
        <p class="text-sm text-gray-400 mt-1">Scannez des colis dans l'onglet Scan pour les marquer comme enleves</p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <div v-for="shipment in scannedShipments" :key="shipment.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                  <span class="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">Enleve</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ shipment.customerName }} — {{ shipment.carrier }}</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  <span v-if="shipment.scannedAt">Enlevé le {{ formatDateTime(shipment.scannedAt) }}</span>
                  <span v-else>—</span>
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ (shipment.cod || shipment.totalPrice || 0).toLocaleString() }} TND</p>
              <p class="text-xs text-gray-400">{{ shipment.destination }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ListFilter, CheckCircle, Clock, Wallet, ScanBarcode } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  scannedShipments?: any[]
}>(), {
  scannedShipments: () => [],
})

defineEmits<{
  'toggle-submenu': []
}>()

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return props.scannedShipments.filter(s => {
    const date = s.scannedAt || s.createdAt
    return date && new Date(date).toDateString() === today
  }).length
})

const totalCOD = computed(() =>
  props.scannedShipments.reduce((sum: number, s: any) => sum + (s.cod || s.totalPrice || 0), 0)
)

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' a ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

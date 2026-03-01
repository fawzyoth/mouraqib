<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ajouter un colis</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Creer une nouvelle expedition</p>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-lg mx-auto pt-8">
        <!-- Success Card -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <!-- Green header band -->
          <div class="bg-green-50 dark:bg-green-900/20 px-6 py-6 text-center border-b border-green-100 dark:border-green-800/30">
            <div class="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-3">
              <CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Colis cree avec succes</h2>
          </div>

          <!-- Tracking number -->
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Numero de suivi</p>
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
              <span class="text-lg font-mono font-bold text-gray-900 dark:text-white tracking-wide">
                {{ shipment.trackingNumber }}
              </span>
              <button
                @click="copyTracking"
                class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                :title="copied ? 'Copie !' : 'Copier'"
              >
                <Check v-if="copied" class="w-4 h-4 text-green-600" />
                <Copy v-else class="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- Summary grid -->
          <div class="px-6 py-5 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Client</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ shipment.customerName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Destination</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ shipment.destination }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Transporteur</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ shipment.carrier }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Montant COD</p>
              <p class="text-sm font-bold text-orange-600">{{ formatAmount(shipment.cod ?? shipment.totalPrice) }} DT</p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="px-6 pb-6 space-y-3">
            <button
              @click="$emit('print-label')"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Printer class="w-4 h-4" />
              Imprimer le bordereau
            </button>
            <button
              @click="$emit('create-another')"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus class="w-4 h-4" />
              Creer un autre colis
            </button>
            <button
              @click="$emit('view-shipments')"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Voir les expeditions
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle, Copy, Check, Printer, Plus, ArrowRight, ListFilter } from 'lucide-vue-next'

defineProps<{
  shipment: {
    trackingNumber: string
    customerName: string
    destination: string
    carrier: string
    cod?: number
    totalPrice?: number
    [key: string]: any
  }
}>()

defineEmits<{
  (e: 'print-label'): void
  (e: 'create-another'): void
  (e: 'view-shipments'): void
  (e: 'toggle-submenu'): void
}>()

const copied = ref(false)

function copyTracking() {
  const tracking = document.querySelector('.font-mono')?.textContent?.trim()
  if (tracking) {
    navigator.clipboard.writeText(tracking)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function formatAmount(val: number | undefined) {
  if (val == null) return '0.00'
  return Number(val).toFixed(2)
}
</script>

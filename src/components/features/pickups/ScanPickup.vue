<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Scan pickup</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Scannez chaque bordereau pour confirmer les colis prets au ramassage</p>
        </div>
      </div>
    </div>
  </header>

  <main class="flex-1 overflow-y-auto p-4 sm:p-6">
    <!-- Scan Input -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          <ScanBarcode class="w-5 h-5 text-orange-600" />
        </div>
        <input
          ref="scanInputRef"
          :value="scanInput"
          @input="$emit('update:scanInput', ($event.target as HTMLInputElement).value)"
          @keydown.enter.prevent="$emit('handle-scan')"
          type="text"
          placeholder="Scanner ou saisir le N de suivi..."
          class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
          autofocus
        />
        <button @click="$emit('handle-scan')" class="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors text-sm whitespace-nowrap">
          OK
        </button>
        <button
          @click="openCamera"
          class="px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm whitespace-nowrap flex items-center gap-2"
        >
          <Camera class="w-4 h-4" />
          <span class="hidden sm:inline">Camera</span>
        </button>
      </div>
      <!-- Scan Feedback -->
      <transition name="fade">
        <div v-if="scanFeedback" class="mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg" :class="{
          'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400': scanFeedback.type === 'success',
          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400': scanFeedback.type === 'error',
          'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400': scanFeedback.type === 'warning'
        }">
          <CheckCircle v-if="scanFeedback.type === 'success'" class="w-4 h-4 flex-shrink-0" />
          <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
          <span>{{ scanFeedback.message }}</span>
        </div>
      </transition>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{{ confirmedShipments.length }}<span class="text-sm font-normal text-gray-400">/{{ pickupCandidates.length }}</span></p>
            <p class="text-xs sm:text-sm text-gray-500">Confirmes</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Truck class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{{ confirmedByCarrier.length }}</p>
            <p class="text-xs sm:text-sm text-gray-500">Transporteurs</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Wallet class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{{ confirmedTotalCOD.toLocaleString() }}</p>
            <p class="text-xs sm:text-sm text-gray-500">COD (TND)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State: No candidates at all -->
    <div v-if="pickupCandidates.length === 0" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package class="w-8 h-8 text-gray-400" />
      </div>
      <p class="text-gray-500 dark:text-gray-400 font-medium">Aucun colis pret pour l'enlevement</p>
      <p class="text-sm text-gray-400 mt-1">Les colis avec bordereaux imprimes apparaitront ici automatiquement</p>
      <p v-if="pendingPickupsCount > 0" class="text-sm text-orange-500 mt-3">
        {{ pendingPickupsCount }} colis en attente --
        <a href="#/shipments/labels?filter=unprinted" @click.prevent="$emit('navigate-to-labels')" class="underline hover:text-orange-600 cursor-pointer font-medium">imprimez les bordereaux d'abord</a>
      </p>
    </div>

    <!-- Shipments Grouped by Carrier -->
    <div v-else class="space-y-4">
      <div v-for="group in pickupByCarrier" :key="group.carrier" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <!-- Carrier Group Header -->
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Truck class="w-4 h-4 text-gray-500" />
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ group.carrier }}</h3>
              <span :class="[
                'px-2 py-0.5 text-xs rounded-full font-medium',
                group.confirmedCount === group.shipments.length
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
              ]">{{ group.confirmedCount }}/{{ group.shipments.length }} confirmes</span>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="$emit('confirm-all-carrier', group.carrier)"
                v-if="group.confirmedCount < group.shipments.length"
                class="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >Tout confirmer</button>
              <span class="text-sm font-medium text-gray-500">{{ group.shipments.reduce((sum: number, s: any) => sum + (s.cod || s.totalPrice || 0), 0).toLocaleString() }} TND</span>
            </div>
          </div>
        </div>
        <!-- Shipments List -->
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div
            v-for="shipment in group.shipments"
            :key="shipment.trackingNumber"
            :class="[
              'px-4 py-3 flex items-center justify-between transition-colors',
              shipment.confirmed
                ? 'bg-green-50/50 dark:bg-green-900/10'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
            ]"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- Confirmed/Unconfirmed indicator -->
              <div :class="[
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                shipment.confirmed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              ]">
                <CheckCircle v-if="shipment.confirmed" class="w-4 h-4" />
                <span v-else class="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"></span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span :class="[
                    'font-mono text-sm font-semibold',
                    shipment.confirmed
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-gray-900 dark:text-white'
                  ]">{{ shipment.trackingNumber }}</span>
                  <span v-if="shipment.confirmed" class="text-xs text-green-600 dark:text-green-500 font-medium">Enleve</span>
                </div>
                <p class="text-xs text-gray-500 truncate">{{ shipment.customerName }} - {{ shipment.recipientPhone }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ (shipment.cod || shipment.totalPrice || 0).toLocaleString() }} TND</span>
              <button
                v-if="shipment.confirmed"
                @click="$emit('unconfirm-shipment', shipment.trackingNumber)"
                class="p-1.5 text-green-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Retirer la confirmation"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="flex items-center justify-end bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <button @click="$emit('clear-scan-session')" class="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5">
          <Trash2 class="w-4 h-4" />
          Reinitialiser
        </button>
      </div>
    </div>
  </main>

  <!-- Camera Scanner Overlay -->
  <teleport to="body">
    <transition name="fade">
      <div v-if="cameraOpen" class="fixed inset-0 z-50 flex flex-col bg-black">
        <!-- Camera Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-black/80">
          <div class="flex items-center gap-2 text-white">
            <Camera class="w-5 h-5" />
            <span class="font-medium text-sm">Scanner un code-barres</span>
          </div>
          <button @click="closeCamera" class="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <!-- Camera Viewfinder -->
        <div class="flex-1 relative overflow-hidden">
          <div id="barcode-scanner" class="scanner-container"></div>
          <!-- Camera error -->
          <div v-if="cameraError" class="absolute inset-0 flex items-center justify-center bg-black/80">
            <div class="text-center px-6">
              <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p class="text-white font-medium mb-1">Camera inaccessible</p>
              <p class="text-gray-400 text-sm">{{ cameraError }}</p>
              <button @click="closeCamera" class="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
        <!-- Last scan result -->
        <div v-if="lastCameraScan" class="px-4 py-3 bg-green-600 text-white text-center text-sm font-medium">
          {{ lastCameraScan }}
        </div>
      </div>
    </transition>
  </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import {
  ListFilter, Truck, ScanBarcode, CheckCircle, AlertCircle,
  Wallet, Package, X, Trash2, ArrowRight, Camera
} from 'lucide-vue-next'

interface ScanFeedback {
  type: 'success' | 'error' | 'warning'
  message: string
}

interface PickupShipment {
  trackingNumber: string
  customerName: string
  recipientPhone: string
  carrier: string
  cod?: number
  totalPrice?: number
  confirmed: boolean
}

interface CarrierGroup {
  carrier: string
  shipments: PickupShipment[]
  confirmedCount: number
}

interface ConfirmedCarrierGroup {
  carrier: string
  shipments: any[]
}

defineProps<{
  scanInput: string
  scanFeedback: ScanFeedback | null
  confirmedShipments: any[]
  pickupCandidates: any[]
  confirmedByCarrier: ConfirmedCarrierGroup[]
  confirmedTotalCOD: number
  pickupByCarrier: CarrierGroup[]
  pendingPickupsCount: number
}>()

const emit = defineEmits<{
  'toggle-submenu': []
  'update:scanInput': [value: string]
  'handle-scan': []
  'open-pickup-confirmation': []
  'confirm-all-carrier': [carrier: string]
  'unconfirm-shipment': [trackingNumber: string]
  'confirm-shipment-manual': [trackingNumber: string]
  'clear-scan-session': []
  'navigate-to-labels': []
}>()

// Camera scanner state
const scanInputRef = ref<HTMLInputElement | null>(null)
const cameraOpen = ref(false)
const cameraError = ref<string | null>(null)
const lastCameraScan = ref<string | null>(null)
let html5Qrcode: Html5Qrcode | null = null

async function openCamera() {
  cameraOpen.value = true
  cameraError.value = null
  lastCameraScan.value = null

  await nextTick()

  try {
    html5Qrcode = new Html5Qrcode('barcode-scanner')
    await html5Qrcode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const w = Math.floor(viewfinderWidth * 0.8)
          const h = Math.floor(viewfinderHeight * 0.4)
          return { width: Math.max(w, 200), height: Math.max(h, 100) }
        },
      },
      (decodedText) => {
        lastCameraScan.value = decodedText
        // Set the input and trigger scan
        emit('update:scanInput', decodedText)
        nextTick(() => emit('handle-scan'))
        // Close camera after a short delay so user sees the result
        setTimeout(() => closeCamera(), 600)
      },
      () => {
        // Ignore scan failures (no barcode found in frame)
      }
    )
  } catch (err: any) {
    cameraError.value = err?.message || 'Veuillez autoriser l\'acces a la camera'
  }
}

async function closeCamera() {
  if (html5Qrcode) {
    try {
      const state = html5Qrcode.getState()
      if (state === 2) { // SCANNING
        await html5Qrcode.stop()
      }
    } catch {
      // ignore stop errors
    }
    html5Qrcode = null
  }
  cameraOpen.value = false
  cameraError.value = null
  lastCameraScan.value = null
  // Re-focus the text input
  nextTick(() => scanInputRef.value?.focus())
}

onBeforeUnmount(() => {
  if (html5Qrcode) {
    try {
      html5Qrcode.stop()
    } catch {
      // ignore
    }
  }
})
</script>

<style scoped>
.scanner-container {
  width: 100%;
  height: 100%;
}
.scanner-container :deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  min-height: 100% !important;
}
.scanner-container :deep(#barcode-scanner__scan_region) {
  min-height: 100% !important;
}
.scanner-container :deep(#barcode-scanner__scan_region > img) {
  display: none !important;
}
.scanner-container :deep(#barcode-scanner__dashboard_section) {
  display: none !important;
}
.scanner-container :deep(#barcode-scanner__header_message) {
  display: none !important;
}
</style>

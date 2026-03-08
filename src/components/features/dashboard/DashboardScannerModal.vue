<template>
  <ModalShell :show="show" :title="title" size="lg" @close="$emit('close')">
    <!-- Barcode scanner -->
    <div class="mb-4 space-y-3">
      <div class="relative rounded-xl overflow-hidden bg-black" style="height: 160px">
        <!-- Native BarcodeDetector mode -->
        <template v-if="useNative">
          <video
            ref="videoRef"
            autoplay
            playsinline
            muted
            class="w-full h-full object-cover"
          />
        </template>
        <!-- html5-qrcode fallback mode -->
        <template v-else>
          <div id="dashboard-barcode-scanner" class="dashboard-scanner-container"></div>
        </template>
        <div v-if="!scannerActive" class="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <Loader2 class="w-6 h-6 text-white animate-spin" />
        </div>
        <div v-if="scannerActive" class="absolute inset-0 pointer-events-none">
          <div class="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-green-400/60 rounded-full animate-pulse"></div>
        </div>
        <div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
          {{ scannedCount }}/{{ shipmentList.length }} scannes
        </div>
      </div>
      <div class="flex gap-2">
        <input
          v-model="manualCode"
          @keydown.enter="handleManualScan"
          type="text"
          placeholder="Saisir un code-barres manuellement..."
          class="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="handleManualScan"
          :disabled="!manualCode.trim()"
          class="btn-primary btn-primary-sm whitespace-nowrap"
        >
          OK
        </button>
      </div>
      <p v-if="scanFeedback" class="text-xs text-center" :class="scanFeedbackIsError ? 'text-red-500' : 'text-green-600 dark:text-green-400'">
        {{ scanFeedback }}
      </p>
    </div>

    <!-- Shipment list -->
    <div class="space-y-2">
      <div
        v-for="s in shipmentList"
        :key="s.id"
        class="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50"
      >
        <div class="flex-shrink-0">
          <CheckCircle v-if="isShipmentScanned(s)" class="w-5 h-5 text-green-500" />
          <Package v-else class="w-5 h-5 text-gray-300 dark:text-gray-600" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ s.trackingNumber }}</span>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ s.customerName }} &mdash; {{ s.destination }}
          </div>
        </div>
        <div v-if="processingIds.has(s.id)" class="flex-shrink-0">
          <Loader2 class="w-4 h-4 text-blue-500 animate-spin" />
        </div>
        <div v-else-if="isShipmentScanned(s)" class="flex-shrink-0">
          <Check class="w-4 h-4 text-green-500" />
        </div>
      </div>
      <div v-if="shipmentList.length === 0" class="py-8 text-center">
        <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p class="text-gray-500">Aucun colis a scanner.</p>
      </div>
    </div>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch, onUnmounted } from 'vue'
import { CheckCircle, Loader2, Check, Package } from 'lucide-vue-next'
import { Html5Qrcode } from 'html5-qrcode'
import ModalShell from '@/components/shared/ModalShell.vue'
import { useAppStore } from '@/stores/app'
import type { UIShipment } from '@/mappers/shipments'

const props = defineProps<{
  show: boolean
  title: string
  scanType: 'out' | 'in'
  shipmentIds: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const appStore = useAppStore()
const processingIds = reactive(new Set<string>())

// Barcode scanner state
const scannedIds = reactive(new Set<string>())
const videoRef = ref<HTMLVideoElement>()
const stream = ref<MediaStream | null>(null)
const scannerActive = ref(false)
const manualCode = ref('')
const scanFeedback = ref('')
const scanFeedbackIsError = ref(false)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const useNative = ref(!isIOS)
let animFrameId: number | null = null
let lastDetectTime = 0
let html5Qrcode: Html5Qrcode | null = null

function showFeedback(message: string, isError = false) {
  scanFeedback.value = message
  scanFeedbackIsError.value = isError
  setTimeout(() => { scanFeedback.value = '' }, 2000)
}

function isShipmentScanned(s: UIShipment) {
  if (scannedIds.has(s.id)) return true
  if (props.scanType === 'out') return !!s.outScannedAt
  if (props.scanType === 'in') return !!s.inScannedAt
  return false
}

const shipmentList = computed(() => {
  const idSet = new Set(props.shipmentIds)
  const matches = appStore.shipments.filter((s: UIShipment) => idSet.has(s.id))
  return matches.sort((a: UIShipment, b: UIShipment) => {
    const aScanned = isShipmentScanned(a)
    const bScanned = isShipmentScanned(b)
    if (aScanned === bScanned) return 0
    return aScanned ? 1 : -1
  })
})

const scannedCount = computed(() => {
  return shipmentList.value.filter((s: UIShipment) => isShipmentScanned(s)).length
})

async function markScanned(shipment: UIShipment) {
  processingIds.add(shipment.id)
  try {
    if (props.scanType === 'in') {
      await appStore.shipmentsData.markAsInScanned([shipment.id])
    } else {
      await appStore.shipmentsData.markAsOutScanned([shipment.id])
    }
  } finally {
    processingIds.delete(shipment.id)
  }
}

async function onBarcodeDetected(code: string) {
  const shipment = shipmentList.value.find((s: UIShipment) => s.trackingNumber === code)
  if (!shipment) return
  if (scannedIds.has(shipment.id)) return
  scannedIds.add(shipment.id)
  showFeedback(`${code} scanne !`)
  await markScanned(shipment)
}

// --- Native BarcodeDetector path ---
function detectionLoop() {
  if (!scannerActive.value || !videoRef.value) return
  const now = performance.now()
  if (now - lastDetectTime >= 250) {
    lastDetectTime = now
    const detector = new (window as any).BarcodeDetector({ formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code'] })
    detector.detect(videoRef.value).then((barcodes: any[]) => {
      for (const barcode of barcodes) {
        onBarcodeDetected(barcode.rawValue)
      }
    }).catch(() => {})
  }
  animFrameId = requestAnimationFrame(detectionLoop)
}

async function startNativeScanner() {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    stream.value = mediaStream
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
    scannerActive.value = true
    lastDetectTime = 0
    animFrameId = requestAnimationFrame(detectionLoop)
  } catch {
    showFeedback('Impossible d\'acceder a la camera', true)
  }
}

function stopNativeScanner() {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }
}

// --- html5-qrcode fallback path ---
async function startFallbackScanner() {
  await nextTick()
  try {
    html5Qrcode = new Html5Qrcode('dashboard-barcode-scanner')
    await html5Qrcode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const w = Math.floor(viewfinderWidth * 0.8)
          const h = Math.floor(viewfinderHeight * 0.4)
          return { width: Math.max(w, 200), height: Math.max(h, 80) }
        },
      },
      (decodedText) => {
        onBarcodeDetected(decodedText)
      },
      () => {},
    )
    scannerActive.value = true
  } catch {
    showFeedback('Impossible d\'acceder a la camera', true)
  }
}

async function stopFallbackScanner() {
  if (html5Qrcode) {
    try {
      const state = html5Qrcode.getState()
      if (state === 2) {
        await html5Qrcode.stop()
      }
    } catch {
      // ignore stop errors
    }
    html5Qrcode = null
  }
}

// --- Unified start/stop ---
async function startScanner() {
  if (useNative.value) {
    await startNativeScanner()
  } else {
    await startFallbackScanner()
  }
}

async function stopScanner() {
  scannerActive.value = false
  if (useNative.value) {
    stopNativeScanner()
  } else {
    await stopFallbackScanner()
  }
}

async function handleManualScan() {
  const code = manualCode.value.trim()
  if (!code) return
  const shipment = shipmentList.value.find((s: UIShipment) => s.trackingNumber === code)
  if (shipment) {
    if (scannedIds.has(shipment.id)) {
      showFeedback('Deja scanne', true)
    } else {
      scannedIds.add(shipment.id)
      showFeedback(`${code} scanne !`)
      await markScanned(shipment)
    }
  } else {
    showFeedback('Aucun colis correspondant', true)
  }
  manualCode.value = ''
}

// Start/stop scanner based on modal visibility
watch(() => props.show, (visible) => {
  if (visible) {
    scannedIds.clear()
    scanFeedback.value = ''
    startScanner()
  } else {
    stopScanner()
  }
})

onUnmounted(() => {
  stopScanner()
})
</script>

<style scoped>
.dashboard-scanner-container {
  width: 100%;
  height: 100%;
}
.dashboard-scanner-container :deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  min-height: 100% !important;
}
.dashboard-scanner-container :deep(#dashboard-barcode-scanner__scan_region) {
  min-height: 100% !important;
}
.dashboard-scanner-container :deep(#dashboard-barcode-scanner__scan_region > img) {
  display: none !important;
}
.dashboard-scanner-container :deep(#dashboard-barcode-scanner__dashboard_section) {
  display: none !important;
}
.dashboard-scanner-container :deep(#dashboard-barcode-scanner__header_message) {
  display: none !important;
}
</style>

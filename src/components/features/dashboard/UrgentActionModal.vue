<template>
  <ModalShell :show="show" :title="modalTitle" size="lg" @close="$emit('close')">
    <!-- Grouped view (tout traiter) -->
    <template v-if="!action">
      <div v-for="group in groupedShipments" :key="group.type" class="mb-6 last:mb-0">
        <div class="flex items-center gap-2 mb-3">
          <span :class="[
            'w-2 h-2 rounded-full',
            group.type === 'confirm' ? 'bg-blue-500' :
            group.type === 'print' ? 'bg-purple-500' :
            group.type === 'delayed' ? 'bg-red-500' :
            'bg-yellow-500'
          ]"></span>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">{{ group.label }}</h4>
          <span class="text-xs text-gray-400">({{ group.shipments.length }})</span>
          <button v-if="group.type === 'print' && group.shipments.length > 0" @click="handlePrintAll(group.shipments)" class="btn-primary btn-primary-sm flex items-center space-x-1 ml-auto">
            <Printer class="w-3 h-3" />
            <span>Imprimer tout</span>
          </button>
        </div>
        <div class="space-y-2">
          <ShipmentRow
            v-for="s in group.shipments"
            :key="s.id"
            :shipment="s"
            :action-type="group.type"
            :processing="processingIds.has(s.id)"
            @confirm="handleConfirm(s)"
            @print="handlePrint(s)"
            @view="handleView(s)"
            @row-click="openDetailPanel(s)"
          />
        </div>
      </div>
      <div v-if="groupedShipments.length === 0" class="py-8 text-center">
        <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p class="text-gray-500">Toutes les actions ont été traitées !</p>
      </div>
    </template>

    <!-- Single action view -->
    <template v-else>
      <!-- Barcode scanner for confirm/return actions -->
      <div v-if="action.type === 'confirm' || action.type === 'return'" class="mb-4 space-y-3">
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
          <!-- html5-qrcode fallback mode (iOS) -->
          <template v-else>
            <div id="urgent-barcode-scanner" class="urgent-scanner-container"></div>
          </template>
          <div v-if="!scannerActive" class="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <Loader2 class="w-6 h-6 text-white animate-spin" />
          </div>
          <div v-if="scannerActive" class="absolute inset-0 pointer-events-none">
            <div class="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-green-400/60 rounded-full animate-pulse"></div>
          </div>
          <div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
            {{ scannedCount }}/{{ filteredShipments.length }} scannés
          </div>
        </div>
        <div class="flex gap-2">
          <input
            v-model="manualCode"
            @keydown.enter="handleManualScan"
            type="text"
            placeholder="Saisir un code-barres manuellement…"
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

      <div v-if="action.type === 'print' && filteredShipments.length > 0" class="mb-3 flex justify-end">
        <button @click="handlePrintAll(filteredShipments)" class="btn-primary btn-primary-sm flex items-center space-x-1">
          <Printer class="w-3 h-3" />
          <span>Imprimer tout</span>
        </button>
      </div>

      <div class="space-y-2">
        <ShipmentRow
          v-for="s in filteredShipments"
          :key="s.id"
          :shipment="s"
          :action-type="action.type"
          :processing="processingIds.has(s.id)"
          :scanned="isShipmentScanned(s)"
          @confirm="handleConfirm(s)"
          @print="handlePrint(s)"
          @view="handleView(s)"
          @row-click="openDetailPanel(s)"
        />
      </div>
      <div v-if="filteredShipments.length === 0" class="py-8 text-center">
        <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p class="text-gray-500">Toutes les actions ont été traitées !</p>
      </div>
    </template>
  </ModalShell>

  <!-- Shipment detail drawer (above modal z-index) -->
  <Teleport to="body">
    <div v-if="showDetailPanel" class="relative" style="z-index: 60;">
      <ShipmentDetailPanel
        :show="showDetailPanel"
        :shipment="selectedShipment"
        @close="closeDetailPanel"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, Loader2, Printer } from 'lucide-vue-next'
import { Html5Qrcode } from 'html5-qrcode'
import ModalShell from '@/components/shared/ModalShell.vue'
import { useAppStore } from '@/stores/app'
import { getStatusLabel, getStatusDotClass } from '@/composables/useStatusFormatting'
import ShipmentRow from './UrgentActionShipmentRow.vue'
import ShipmentDetailPanel from '@/components/features/shipments/ShipmentDetailPanel.vue'
import type { UIShipment } from '@/mappers/shipments'

interface UrgentAction {
  id: string | number
  type: string
  title: string
  actionLabel: string
  shipmentIds: string[]
}

const props = defineProps<{
  show: boolean
  action: UrgentAction | null
  allActions: UrgentAction[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const appStore = useAppStore()
const processingIds = reactive(new Set<string>())

// Shipment detail panel state
const showDetailPanel = ref(false)
const selectedShipment = ref<UIShipment | null>(null)

function openDetailPanel(shipment: UIShipment) {
  selectedShipment.value = shipment
  showDetailPanel.value = true
}

function closeDetailPanel() {
  showDetailPanel.value = false
  selectedShipment.value = null
}

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
  if (props.action?.type === 'confirm') return !!s.outScannedAt
  if (props.action?.type === 'return') return !!s.inScannedAt
  return false
}

async function markScanned(shipment: UIShipment) {
  processingIds.add(shipment.id)
  try {
    if (props.action?.type === 'return') {
      await appStore.shipmentsData.markAsInScanned([shipment.id])
    } else {
      await appStore.shipmentsData.markAsOutScanned([shipment.id])
    }
  } finally {
    processingIds.delete(shipment.id)
  }
}

async function onBarcodeDetected(code: string) {
  const shipment = filteredShipments.value.find(s => s.trackingNumber === code)
  if (!shipment) return
  if (scannedIds.has(shipment.id)) return
  scannedIds.add(shipment.id)
  showFeedback(`${code} scanné !`)
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
    showFeedback('Impossible d\'accéder à la caméra', true)
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

// --- html5-qrcode fallback path (iOS) ---
async function startFallbackScanner() {
  await nextTick()
  try {
    html5Qrcode = new Html5Qrcode('urgent-barcode-scanner')
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
    showFeedback('Impossible d\'accéder à la caméra', true)
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
  const shipment = filteredShipments.value.find(s => s.trackingNumber === code)
  if (shipment) {
    if (scannedIds.has(shipment.id)) {
      showFeedback('Déjà scanné', true)
    } else {
      scannedIds.add(shipment.id)
      showFeedback(`${code} scanné !`)
      await markScanned(shipment)
    }
  } else {
    showFeedback('Aucun colis correspondant', true)
  }
  manualCode.value = ''
}

// Start/stop scanner based on modal visibility
watch(() => props.show, (visible) => {
  const type = props.action?.type
  if (visible && (type === 'confirm' || type === 'return')) {
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

const modalTitle = computed(() => {
  if (props.action) return props.action.title
  return 'Toutes les actions urgentes'
})

// For single-action mode: filter shipments that still match
const filteredShipments = computed(() => {
  if (!props.action) return []
  const idSet = new Set(props.action.shipmentIds)
  const matches = appStore.shipments.filter(s => idSet.has(s.id))
  
  if (props.action.type === 'confirm' || props.action.type === 'return') {
    return matches.sort((a, b) => {
      const aScanned = isShipmentScanned(a)
      const bScanned = isShipmentScanned(b)
      if (aScanned === bScanned) return 0
      return aScanned ? 1 : -1
    })
  }

  return matches
})

const scannedCount = computed(() => {
  return filteredShipments.value.filter(s => isShipmentScanned(s)).length
})

// For tout-traiter mode: group by action type
const groupedShipments = computed(() => {
  if (props.action) return []
  const groups: { type: string; label: string; shipments: UIShipment[] }[] = []
  for (const act of props.allActions) {
    if (!act.shipmentIds?.length) continue
    const idSet = new Set(act.shipmentIds)
    const shipments = appStore.shipments.filter(s => idSet.has(s.id))
    if (shipments.length > 0) {
      groups.push({
        type: act.type,
        label: act.title,
        shipments,
      })
    }
  }
  return groups
})

// Auto-close when all shipments are processed
watch(
  () => props.action ? filteredShipments.value.length : groupedShipments.value.reduce((sum, g) => sum + g.shipments.length, 0),
  (count) => {
    if (props.show && count === 0) {
      setTimeout(() => emit('close'), 1200)
    }
  }
)

function handleConfirm(_shipment: UIShipment) {
  emit('close')
  router.push('/pickups')
}

async function handlePrint(shipment: UIShipment) {
  if (shipment.labelUrl) {
    window.open(shipment.labelUrl, '_blank', 'noopener,noreferrer')
  }
  processingIds.add(shipment.id)
  try {
    await appStore.shipmentsData.markAsPrinted([shipment.id])
  } finally {
    processingIds.delete(shipment.id)
  }
}

async function handlePrintAll(shipments: UIShipment[]) {
  for (const s of shipments) {
    if (s.labelUrl) {
      window.open(s.labelUrl, '_blank', 'noopener,noreferrer')
    }
  }
  const ids = shipments.map(s => s.id)
  ids.forEach(id => processingIds.add(id))
  try {
    await appStore.shipmentsData.markAsPrinted(ids)
  } finally {
    ids.forEach(id => processingIds.delete(id))
  }
}

function handleView(shipment: UIShipment) {
  const route = router.resolve(`/shipments?f_trackingNumber=${shipment.trackingNumber}`)
  window.open(route.href, '_blank')
}
</script>

<style scoped>
.urgent-scanner-container {
  width: 100%;
  height: 100%;
}
.urgent-scanner-container :deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  min-height: 100% !important;
}
.urgent-scanner-container :deep(#urgent-barcode-scanner__scan_region) {
  min-height: 100% !important;
}
.urgent-scanner-container :deep(#urgent-barcode-scanner__scan_region > img) {
  display: none !important;
}
.urgent-scanner-container :deep(#urgent-barcode-scanner__dashboard_section) {
  display: none !important;
}
.urgent-scanner-container :deep(#urgent-barcode-scanner__header_message) {
  display: none !important;
}
</style>

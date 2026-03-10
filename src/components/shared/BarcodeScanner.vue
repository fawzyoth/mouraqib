<template>
  <div class="barcode-scanner-wrapper">
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
      <div :id="containerId" class="barcode-scanner-container"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  active: boolean
  containerId?: string
  beepOnScan?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  containerId: 'barcode-scanner-fallback',
  beepOnScan: true
})

const emit = defineEmits<{
  (e: 'scan', code: string): void
  (e: 'error', message: string): void
}>()

// Use the passed containerId or a default one
const containerId = props.containerId

function playBeep() {
  if (!props.beepOnScan) return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    // Supermarket POS sounds are typically high-pitched square or sawtooth waves
    // around 2000-2400 Hz that play for about 0.08 - 0.12 seconds
    osc.type = 'square'
    osc.frequency.setValueAtTime(2200, ctx.currentTime)
    
    // Quick attack and release for that sharp, instantaneous "BEEP"
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1)
    
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch (e)
  {
    console.log(e)
  }
}

function playErrorBeep() {
  if (!props.beepOnScan) return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    
    // POS error sounds are usually a jarring low-pitched square wave (like a buzz)
    const createErrorBzzt = (startTime: number) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      // A low square wave sounds like a harsh buzz
      osc.type = 'square'
      osc.frequency.setValueAtTime(150, startTime)
      
      // Sharp attack, hold, then sharp release
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
      gainNode.gain.setValueAtTime(0.2, startTime + 0.2)
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.25)
      
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + 0.25)
    }
    
    // Play two quick buzzes
    createErrorBzzt(ctx.currentTime)
    createErrorBzzt(ctx.currentTime + 0.3)
  } catch (err) {
    // Ignore audio errors
  }
}

defineExpose({
  playErrorBeep
})

const lastScanned = new Map<string, number>()

function handleScan(code: string) {
  const now = Date.now()
  const lastTime = lastScanned.get(code)
  
  // Throttle identical scans to once per 1.5 seconds to avoid repeated beeps
  if (!lastTime || now - lastTime > 1500) {
    lastScanned.set(code, now)
    playBeep()
    emit('scan', code)
  }
}

// Determine if we should use Native BarcodeDetector
// It's generally better, but iOS Safari often struggles or lacks full support
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const useNative = ref(!isIOS && 'BarcodeDetector' in window)

const videoRef = ref<HTMLVideoElement>()
const stream = ref<MediaStream | null>(null)
let animFrameId: number | null = null
let lastDetectTime = 0
let html5Qrcode: Html5Qrcode | null = null

// --- Native BarcodeDetector path ---
function detectionLoop() {
  if (!props.active || !videoRef.value) return
  const now = performance.now()
  if (now - lastDetectTime >= 250) {
    lastDetectTime = now
    const detector = new (window as any).BarcodeDetector({ formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code'] })
    detector.detect(videoRef.value).then((barcodes: any[]) => {
      for (const barcode of barcodes) {
        handleScan(barcode.rawValue)
      }
    }).catch(() => {})
  }
  animFrameId = requestAnimationFrame(detectionLoop)
}

async function startNativeScanner() {
  await nextTick()
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    stream.value = mediaStream
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
    lastDetectTime = 0
    animFrameId = requestAnimationFrame(detectionLoop)
  } catch {
    emit('error', 'Impossible d\'accéder à la caméra')
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
  await nextTick() // Ensure the DOM element exists
  try {
    html5Qrcode = new Html5Qrcode(containerId)
    await html5Qrcode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const w = Math.floor(viewfinderWidth * 0.8)
          const h = Math.floor(viewfinderHeight * 0.4)
          // Make sure qrbox width/height doesn't exceed the viewfinder
          const maxW = Math.min(Math.max(w, 200), viewfinderWidth)
          const maxH = Math.min(Math.max(h, 80), viewfinderHeight)
          return { width: maxW, height: maxH }
        },
      },
      (decodedText) => {
        handleScan(decodedText)
      },
      () => {
        // Ignore scan frame failures
      },
    )
  } catch {
    emit('error', 'Impossible d\'accéder à la caméra')
  }
}

async function stopFallbackScanner() {
  if (html5Qrcode) {
    try {
      const state = html5Qrcode.getState()
      if (state === 2) { // 2 = SCANNING
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
  if (useNative.value) {
    stopNativeScanner()
  } else {
    await stopFallbackScanner()
  }
}

watch(() => props.active, (isActive) => {
  if (isActive) {
    startScanner()
  } else {
    stopScanner()
  }
}, { immediate: true })

onUnmounted(() => {
  stopScanner()
})
</script>

<style scoped>
.barcode-scanner-wrapper {
  width: 100%;
  height: 100%;
}

.barcode-scanner-container {
  width: 100%;
  height: 100%;
}

.barcode-scanner-wrapper :deep(video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  min-height: 100% !important;
}

/* html5-qrcode specific overrides */
.barcode-scanner-container :deep(div[id$="__scan_region"]) {
  min-height: 100% !important;
}

.barcode-scanner-container :deep(div[id$="__scan_region"] > img) {
  display: none !important;
}

.barcode-scanner-container :deep(div[id$="__dashboard_section"]) {
  display: none !important;
}

.barcode-scanner-container :deep(div[id$="__header_message"]) {
  display: none !important;
}
</style>

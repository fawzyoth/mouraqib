<template>
  <div ref="container" class="relative select-none" @mouseleave="hovered = null">
    <svg
      viewBox="0 0 430 700"
      class="w-full h-auto"
      style="max-height: 540px"
      @mousemove="onMove"
    >
      <polygon
        v-for="s in shapes"
        :key="s.id"
        :points="s.points"
        :fill="getColor(s.id)"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linejoin="round"
        class="cursor-pointer transition-opacity duration-150"
        :opacity="hovered && hovered !== s.id ? 0.6 : 1"
        @mouseenter="hovered = s.id"
        @mouseleave.stop
      />
      <!-- Labels for governorates with enough space -->
      <text
        v-for="s in labeledShapes"
        :key="'lbl-' + s.id"
        :x="s.lx"
        :y="s.ly"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="8.5"
        font-weight="600"
        fill="#1e293b"
        class="pointer-events-none"
      >{{ shortLabel(s.id) }}</text>
    </svg>

    <!-- Tooltip -->
    <Transition name="fade">
      <div
        v-if="hovered"
        class="absolute z-30 pointer-events-none bg-gray-900 text-white rounded-xl shadow-2xl px-3 py-2.5 text-xs min-w-[148px]"
        :style="{ top: `${ty - 10}px`, left: `${tx}px`, transform: 'translate(-50%, -100%)' }"
      >
        <p class="font-bold text-sm leading-tight mb-1.5">{{ hovered }}</p>
        <template v-if="dataFor(hovered)">
          <div class="flex justify-between gap-3 text-gray-400">
            <span>Retours</span>
            <span class="font-semibold text-white">{{ dataFor(hovered)!.returns }}</span>
          </div>
          <div class="flex justify-between gap-3 text-gray-400">
            <span>Expéditions</span>
            <span class="font-semibold text-white">{{ dataFor(hovered)!.total }}</span>
          </div>
          <div class="flex justify-between gap-3 mt-1.5 pt-1.5 border-t border-gray-700">
            <span class="text-gray-400">Taux retour</span>
            <span class="font-bold text-base" :style="{ color: rateColor(dataFor(hovered)!.returnRate) }">
              {{ dataFor(hovered)!.returnRate }}%
            </span>
          </div>
        </template>
        <p v-else class="text-gray-500 mt-0.5">Aucune donnée</p>
      </div>
    </Transition>

    <!-- Legend -->
    <div class="absolute bottom-3 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2.5 py-2 text-xs border border-gray-100 dark:border-gray-700 space-y-1.5">
      <div v-for="entry in legend" :key="entry.label" class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-sm flex-shrink-0" :style="{ background: entry.color }"></div>
        <span class="text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ entry.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface GovData {
  region: string
  returns: number
  total: number
  returnRate: number
}

const props = defineProps<{
  byGovernorate: GovData[]
}>()

const container = ref<HTMLElement | null>(null)
const hovered = ref<string | null>(null)
const tx = ref(0)
const ty = ref(0)

function onMove(e: MouseEvent) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  tx.value = e.clientX - rect.left
  ty.value = e.clientY - rect.top
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const dataMap = computed(() => {
  const m = new Map<string, GovData>()
  for (const d of props.byGovernorate) {
    m.set(normalize(d.region), d)
  }
  return m
})

function dataFor(govId: string): GovData | undefined {
  return dataMap.value.get(normalize(govId))
}

function rateColor(rate: number): string {
  if (rate >= 20) return '#ef4444'
  if (rate >= 15) return '#f97316'
  if (rate >= 10) return '#fb923c'
  if (rate >= 5)  return '#4ade80'
  if (rate > 0)   return '#86efac'
  return '#dcfce7'
}

function getColor(govId: string): string {
  const d = dataFor(govId)
  if (!d) return '#e5e7eb'
  return rateColor(d.returnRate)
}

const legend = [
  { color: '#86efac', label: '< 5%'     },
  { color: '#4ade80', label: '5 – 10%'  },
  { color: '#fb923c', label: '10 – 20%' },
  { color: '#ef4444', label: '> 20%'    },
  { color: '#e5e7eb', label: 'Aucune donnée' },
]

const SHORT_LABELS: Record<string, string> = {
  'Jendouba':    'Jendouba',
  'Béja':        'Béja',
  'Bizerte':     'Bizerte',
  'Le Kef':      'Le Kef',
  'Siliana':     'Siliana',
  'Nabeul':      'Nabeul',
  'Kairouan':    'Kairouan',
  'Kasserine':   'Kasserine',
  'Sidi Bouzid': 'Sidi Bouzid',
  'Sfax':        'Sfax',
  'Mahdia':      'Mahdia',
  'Sousse':      'Sousse',
  'Monastir':    'Monastir',
  'Gafsa':       'Gafsa',
  'Tozeur':      'Tozeur',
  'Kébili':      'Kébili',
  'Gabès':       'Gabès',
  'Médenine':    'Médenine',
  'Tataouine':   'Tataouine',
}

function shortLabel(id: string) {
  return SHORT_LABELS[id] ?? id
}

// Governorates large enough to carry a label
const LABELED = new Set(Object.keys(SHORT_LABELS))

interface Shape {
  id: string
  lx: number
  ly: number
  points: string
}

const shapes: Shape[] = [
  // ─── North ──────────────────────────────────────────────────────────────────
  { id: 'Bizerte',     lx: 240, ly: 38,  points: '175,2 305,2 305,30 282,52 258,68 232,72 205,68 180,52 175,30' },
  { id: 'Jendouba',   lx: 102, ly: 108, points: '30,58 175,55 175,140 148,152 108,150 48,140 30,100' },
  { id: 'Béja',       lx: 215, ly: 72,  points: '175,52 238,45 260,58 258,78 238,92 218,95 185,95 175,78' },
  { id: 'Ariana',     lx: 283, ly: 62,  points: '258,52 305,45 315,68 305,82 280,82 258,72' },
  { id: 'Manouba',    lx: 240, ly: 98,  points: '218,92 258,78 262,96 248,106 220,106' },
  { id: 'Tunis',      lx: 285, ly: 97,  points: '258,78 305,80 312,98 308,112 282,115 262,108 260,96' },
  { id: 'Ben Arous',  lx: 290, ly: 132, points: '262,108 295,110 315,132 305,150 280,150 268,138' },
  { id: 'Nabeul',     lx: 385, ly: 148, points: '305,44 430,65 430,218 385,235 355,222 332,202 322,172 318,150 315,110 318,82 305,68' },
  { id: 'Zaghouan',   lx: 292, ly: 155, points: '295,108 310,108 320,150 312,172 285,175 268,162 265,135 265,108' },
  { id: 'Siliana',    lx: 215, ly: 138, points: '175,78 218,92 220,106 255,106 265,108 265,162 248,172 215,175 185,168 175,152 175,98' },
  { id: 'Le Kef',     lx: 98,  ly: 178, points: '30,100 175,100 175,152 168,232 145,248 102,248 42,238 28,195' },
  // ─── Centre ─────────────────────────────────────────────────────────────────
  { id: 'Kairouan',   lx: 295, ly: 205, points: '248,162 265,162 285,170 320,150 338,158 342,180 342,232 308,242 285,242 265,242 248,228 240,200 248,172' },
  { id: 'Sousse',     lx: 360, ly: 178, points: '320,150 378,150 398,172 398,192 358,210 335,205 322,172' },
  { id: 'Monastir',   lx: 390, ly: 220, points: '355,208 398,192 420,215 420,238 390,242 360,235 352,220' },
  { id: 'Mahdia',     lx: 385, ly: 265, points: '335,232 362,228 390,240 428,248 428,282 408,298 382,295 342,280 332,262' },
  { id: 'Kasserine',  lx: 98,  ly: 285, points: '28,238 145,235 168,238 168,320 148,342 105,342 45,328 28,288' },
  { id: 'Sidi Bouzid',lx: 202, ly: 218, points: '168,175 248,175 252,232 218,252 175,252 152,242 150,205 158,182' },
  { id: 'Sfax',       lx: 335, ly: 320, points: '265,242 342,232 345,260 385,260 428,278 428,362 395,378 328,378 285,378 248,362 242,308 265,285 265,260' },
  // ─── Sud ────────────────────────────────────────────────────────────────────
  { id: 'Gafsa',      lx: 100, ly: 352, points: '28,288 145,285 168,290 168,322 170,398 148,418 105,415 45,402 28,352' },
  { id: 'Tozeur',     lx: 62,  ly: 432, points: '0,395 120,390 132,422 120,468 68,472 0,448' },
  { id: 'Kébili',     lx: 188, ly: 452, points: '120,390 168,395 248,390 265,442 265,492 218,512 175,516 130,506 120,465' },
  { id: 'Gabès',      lx: 330, ly: 408, points: '248,362 395,362 412,388 415,420 395,452 362,460 330,456 295,450 268,444 248,428' },
  { id: 'Médenine',   lx: 368, ly: 498, points: '308,452 395,452 420,472 428,516 408,544 368,550 332,542 305,520' },
  { id: 'Tataouine',  lx: 338, ly: 598, points: '265,442 308,442 308,512 338,524 372,530 428,522 428,700 248,700 248,512 265,494' },
]

const labeledShapes = computed(() => shapes.filter(s => LABELED.has(s.id)))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.1s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-wrap">
      <CalendarDays class="w-4 h-4 text-blue-500 flex-shrink-0" />
      <h3 class="font-semibold text-gray-900 dark:text-white">Retours par période</h3>
      <div class="ml-auto flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
        <button
          v-for="p in PERIODS"
          :key="p.value"
          @click="period = p.value"
          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
          :class="period === p.value
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        >{{ p.label }}</button>
      </div>
    </div>

    <!-- Custom range picker -->
    <div v-if="period === 'custom'" class="px-6 pt-4 flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500 dark:text-gray-400">Du</label>
        <input
          type="date"
          v-model="customStart"
          :max="customEnd || undefined"
          class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500 dark:text-gray-400">Au</label>
        <input
          type="date"
          v-model="customEnd"
          :min="customStart || undefined"
          class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <span v-if="customRangeLabel" class="text-xs text-gray-400">{{ customRangeLabel }}</span>
    </div>

    <div class="p-6">
      <!-- Bar chart -->
      <div v-if="maxCount > 0" class="flex items-end justify-between gap-1 h-40 mb-3">
        <div
          v-for="bar in chartBars"
          :key="bar.key"
          class="flex-1 flex flex-col items-center justify-end gap-1 group relative min-w-0"
        >
          <!-- Tooltip -->
          <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            <div class="font-semibold">{{ bar.count }} retour{{ bar.count !== 1 ? 's' : '' }}</div>
            <div class="text-gray-400">{{ bar.fullLabel }}</div>
          </div>
          <div
            class="w-full min-w-[3px] rounded-t-sm transition-all duration-300 bg-orange-400 dark:bg-orange-500 group-hover:bg-orange-500 dark:group-hover:bg-orange-400"
            :style="{ height: barHeight(bar.count) }"
          ></div>
        </div>
      </div>
      <div v-else-if="period === 'custom' && (!customStart || !customEnd)" class="flex items-center justify-center h-40 mb-3">
        <p class="text-sm text-gray-400">Sélectionnez une plage de dates</p>
      </div>
      <div v-else class="flex items-center justify-center h-40 mb-3">
        <div class="text-center">
          <BarChart3 class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p class="text-sm text-gray-500">Aucun retour sur la période</p>
        </div>
      </div>

      <!-- X-axis labels -->
      <div v-if="chartBars.length > 0" class="flex justify-between gap-1">
        <div v-for="bar in chartBars" :key="bar.key" class="flex-1 text-center min-w-0 overflow-hidden">
          <span v-if="bar.showLabel" class="text-xs text-gray-400 truncate block">{{ bar.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDays, BarChart3 } from 'lucide-vue-next'

const props = defineProps<{
  shipments?: string[]
}>()

type Period = 'day' | 'week' | 'month' | 'custom'

interface ChartBar {
  key: string
  label: string
  fullLabel: string
  count: number
  showLabel: boolean
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'custom', label: 'Personnalisé' },
]

const period = ref<Period>('month')

// Default custom range: last 30 days
const todayStr = new Date().toISOString().slice(0, 10)
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
const customStart = ref(thirtyDaysAgo.toISOString().slice(0, 10))
const customEnd = ref(todayStr)

// ---- helpers ----

function parseDate(str: string): Date | null {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMondayOf(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(monday.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const FR_MONTHS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Aoû', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

function frDate(d: Date, opts: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString('fr-FR', opts)
}

// ---- aggregation functions ----

function computeByDay(): ChartBar[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const counts: Record<string, number> = {}
  const days: Date[] = []

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    counts[toKey(d)] = 0
    days.push(new Date(d))
  }

  for (const s of props.shipments ?? []) {
    const d = parseDate(s)
    if (!d) continue
    const k = toKey(d)
    if (k in counts) counts[k]++
  }

  return days.map((d, idx) => {
    const k = toKey(d)
    // Show label on 1st of month, first bar, last bar, multiples of 5
    const showLabel = d.getDate() === 1 || idx === 0 || idx === 29 || d.getDate() % 5 === 0
    const label = d.getDate() === 1
      ? `${d.getDate()} ${FR_MONTHS[String(d.getMonth() + 1).padStart(2, '0')]}`
      : String(d.getDate())
    return {
      key: k,
      label,
      fullLabel: frDate(d, { weekday: 'long', day: 'numeric', month: 'long' }),
      count: counts[k],
      showLabel,
    }
  })
}

function computeByWeek(): ChartBar[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thisMonday = getMondayOf(today)
  const weekStarts: Date[] = []

  for (let i = 11; i >= 0; i--) {
    const monday = new Date(thisMonday)
    monday.setDate(monday.getDate() - i * 7)
    weekStarts.push(monday)
  }

  const counts: Record<string, number> = {}
  for (const w of weekStarts) counts[toKey(w)] = 0

  for (const s of props.shipments ?? []) {
    const d = parseDate(s)
    if (!d) continue
    const monday = getMondayOf(d)
    const k = toKey(monday)
    if (k in counts) counts[k]++
  }

  return weekStarts.map((monday) => {
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    const k = toKey(monday)
    const mm = String(monday.getMonth() + 1).padStart(2, '0')
    return {
      key: k,
      label: `${monday.getDate()} ${FR_MONTHS[mm]}`,
      fullLabel: `${frDate(monday, { day: 'numeric', month: 'long' })} – ${frDate(sunday, { day: 'numeric', month: 'long' })}`,
      count: counts[k],
      showLabel: true,
    }
  })
}

function computeByMonth(): ChartBar[] {
  const now = new Date()
  const months: string[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const counts: Record<string, number> = {}
  for (const m of months) counts[m] = 0

  for (const s of props.shipments ?? []) {
    const d = parseDate(s)
    if (!d) continue
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (m in counts) counts[m]++
  }

  return months.map((m) => {
    const mm = m.slice(5, 7)
    const fullDate = new Date(`${m}-01`)
    return {
      key: m,
      label: FR_MONTHS[mm] || mm,
      fullLabel: frDate(fullDate, { month: 'long', year: 'numeric' }),
      count: counts[m],
      showLabel: true,
    }
  })
}

function computeCustom(): ChartBar[] {
  if (!customStart.value || !customEnd.value) return []

  const start = new Date(customStart.value)
  const end = new Date(customEnd.value)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  if (start > end) return []

  const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86_400_000)

  if (diffDays <= 60) {
    // by day
    const days: Date[] = []
    const cur = new Date(start)
    while (cur <= end) {
      days.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    const counts: Record<string, number> = {}
    for (const d of days) counts[toKey(d)] = 0

    for (const s of props.shipments ?? []) {
      const d = parseDate(s)
      if (!d || d < start || d > end) continue
      const k = toKey(d)
      if (k in counts) counts[k]++
    }

    const step = Math.max(1, Math.ceil(days.length / 10))
    return days.map((d, idx) => {
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      return {
        key: toKey(d),
        label: d.getDate() === 1
          ? `${d.getDate()} ${FR_MONTHS[mm]}`
          : String(d.getDate()),
        fullLabel: frDate(d, { weekday: 'long', day: 'numeric', month: 'long' }),
        count: counts[toKey(d)],
        showLabel: idx === 0 || idx === days.length - 1 || d.getDate() === 1 || idx % step === 0,
      }
    })
  }

  if (diffDays <= 91) {
    // by week
    const weekStarts: Date[] = []
    const cur = new Date(getMondayOf(start))
    const endMonday = getMondayOf(end)
    while (cur <= endMonday) {
      weekStarts.push(new Date(cur))
      cur.setDate(cur.getDate() + 7)
    }
    const counts: Record<string, number> = {}
    for (const w of weekStarts) counts[toKey(w)] = 0

    for (const s of props.shipments ?? []) {
      const d = parseDate(s)
      if (!d || d < start || d > end) continue
      const monday = getMondayOf(d)
      const k = toKey(monday)
      if (k in counts) counts[k]++
    }

    return weekStarts.map((monday) => {
      const sunday = new Date(monday)
      sunday.setDate(sunday.getDate() + 6)
      const mm = String(monday.getMonth() + 1).padStart(2, '0')
      return {
        key: toKey(monday),
        label: `${monday.getDate()} ${FR_MONTHS[mm]}`,
        fullLabel: `${frDate(monday, { day: 'numeric', month: 'long' })} – ${frDate(sunday, { day: 'numeric', month: 'long' })}`,
        count: counts[toKey(monday)],
        showLabel: true,
      }
    })
  }

  // by month
  const months: string[] = []
  const cur2 = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`
  while (true) {
    const m = `${cur2.getFullYear()}-${String(cur2.getMonth() + 1).padStart(2, '0')}`
    months.push(m)
    if (m >= endMonth) break
    cur2.setMonth(cur2.getMonth() + 1)
  }

  const counts2: Record<string, number> = {}
  for (const m of months) counts2[m] = 0

  for (const s of props.shipments ?? []) {
    const d = parseDate(s)
    if (!d || d < start || d > end) continue
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (m in counts2) counts2[m]++
  }

  return months.map((m) => {
    const mm = m.slice(5, 7)
    const fullDate = new Date(`${m}-01`)
    return {
      key: m,
      label: FR_MONTHS[mm] || mm,
      fullLabel: frDate(fullDate, { month: 'long', year: 'numeric' }),
      count: counts2[m],
      showLabel: true,
    }
  })
}

// ---- computed chart data ----

const chartBars = computed<ChartBar[]>(() => {
  if (period.value === 'day') return computeByDay()
  if (period.value === 'week') return computeByWeek()
  if (period.value === 'custom') return computeCustom()
  return computeByMonth()
})

const maxCount = computed(() => Math.max(...chartBars.value.map(b => b.count), 0))

function barHeight(value: number): string {
  if (maxCount.value === 0) return '0px'
  const px = (value / maxCount.value) * 152
  return Math.round(Math.max(px > 0 ? px : 0, value > 0 ? 4 : 0)) + 'px'
}

const customRangeLabel = computed(() => {
  if (!customStart.value || !customEnd.value) return ''
  const start = new Date(customStart.value)
  const end = new Date(customEnd.value)
  if (start > end) return ''
  const days = Math.ceil((end.getTime() - start.getTime()) / 86_400_000) + 1
  if (days <= 60) return `${days} jour${days > 1 ? 's' : ''}`
  if (days <= 91) return `${Math.ceil(days / 7)} semaine${Math.ceil(days / 7) > 1 ? 's' : ''}`
  return `${Math.ceil(days / 30)} mois`
})
</script>

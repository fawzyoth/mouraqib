<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Statistiques des retours</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analyse par gouvernorat, mois et transporteur</p>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950 space-y-6">

      <!-- Section 1: Par gouvernorat -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <MapPin class="w-4 h-4 text-orange-500" />
          <h3 class="font-semibold text-gray-900 dark:text-white">Retours par gouvernorat</h3>
          <span class="ml-auto text-xs text-gray-400">Top {{ statsData.byGovernorate.length }}</span>
        </div>
        <div v-if="statsData.byGovernorate.length > 0" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div
            v-for="row in statsData.byGovernorate"
            :key="row.region"
            class="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="w-32 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ row.region }}</div>
            <div class="w-14 text-right text-sm font-semibold text-gray-900 dark:text-white">{{ row.returns }}</div>
            <div class="w-20 text-right">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="row.returnRate >= 20 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        row.returnRate >= 10 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'"
              >{{ row.returnRate }}%</span>
            </div>
            <div class="flex-1">
              <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="row.returnRate >= 20 ? 'bg-red-500' : row.returnRate >= 10 ? 'bg-orange-400' : 'bg-green-500'"
                  :style="{ width: barWidthGov(row.returns) }"
                ></div>
              </div>
            </div>
            <div class="w-20 text-right text-xs text-gray-400">{{ row.total }} total</div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-32 text-sm text-gray-400">
          Aucune donnée disponible
        </div>
      </div>

      <!-- Section 2: Par mois -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <CalendarDays class="w-4 h-4 text-blue-500" />
          <h3 class="font-semibold text-gray-900 dark:text-white">Retours par mois</h3>
          <span class="ml-auto text-xs text-gray-400">12 derniers mois</span>
        </div>
        <div class="p-6">
          <div v-if="maxMonthCount > 0" class="flex items-end justify-between gap-2 h-40 mb-3">
            <div
              v-for="m in statsData.byMonth"
              :key="m.month"
              class="flex-1 flex flex-col items-center justify-end gap-1 group relative"
            >
              <!-- Tooltip -->
              <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                <div class="font-semibold">{{ m.count }} retour{{ m.count !== 1 ? 's' : '' }}</div>
                <div class="text-gray-400">{{ m.month }}</div>
              </div>
              <div
                class="w-full rounded-t-sm transition-all duration-300 bg-orange-400 dark:bg-orange-500 group-hover:bg-orange-500 dark:group-hover:bg-orange-400"
                :style="{ height: barHeightMonth(m.count) }"
              ></div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-40 mb-3">
            <div class="text-center">
              <BarChart3 class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p class="text-sm text-gray-500">Aucun retour sur 12 mois</p>
            </div>
          </div>
          <!-- Month labels -->
          <div class="flex justify-between gap-2">
            <div v-for="m in statsData.byMonth" :key="m.month" class="flex-1 text-center">
              <span class="text-xs text-gray-400">{{ m.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Par transporteur -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Truck class="w-4 h-4 text-purple-500" />
          <h3 class="font-semibold text-gray-900 dark:text-white">Retours par transporteur</h3>
        </div>
        <div v-if="statsData.byCarrier.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800">
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Transporteur</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Récupérés</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Perdus</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Taux retour</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Taux récup.</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="c in statsData.byCarrier"
                :key="c.name"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Building2 class="w-4 h-4 text-gray-500" />
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">{{ c.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">{{ c.totalReturns }}</td>
                <td class="px-4 py-4 text-right text-green-600 font-medium">{{ c.recovered }}</td>
                <td class="px-4 py-4 text-right text-red-500 font-medium">{{ c.totalReturns - c.recovered }}</td>
                <td class="px-4 py-4 text-right">
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="c.returnRate >= 15 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            c.returnRate >= 8 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'"
                  >{{ c.returnRate }}%</span>
                </td>
                <td class="px-4 py-4 text-right">
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="c.recoveryRate >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            c.recoveryRate >= 50 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                  >{{ c.recoveryRate }}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex items-center justify-center h-32 text-sm text-gray-400">
          Aucune donnée disponible
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ListFilter, MapPin, CalendarDays, Truck, Building2, BarChart3 } from 'lucide-vue-next'

interface GovernorateRow {
  region: string
  returns: number
  total: number
  returnRate: number
}

interface MonthRow {
  month: string
  label: string
  count: number
}

interface CarrierRow {
  name: string
  totalReturns: number
  returnRate: number
  recovered: number
  recoveryRate: number
}

interface ReturnStatsData {
  byGovernorate: GovernorateRow[]
  byMonth: MonthRow[]
  byCarrier: CarrierRow[]
}

const props = defineProps<{
  statsData?: ReturnStatsData
}>()

const statsData = computed<ReturnStatsData>(() => props.statsData ?? { byGovernorate: [], byMonth: [], byCarrier: [] })

const maxGovReturns = computed(() =>
  Math.max(...statsData.value.byGovernorate.map(r => r.returns), 1)
)

const maxMonthCount = computed(() =>
  Math.max(...statsData.value.byMonth.map(m => m.count), 0)
)

function barWidthGov(value: number): string {
  const pct = (value / maxGovReturns.value) * 100
  return Math.max(pct, value > 0 ? 4 : 0) + '%'
}

function barHeightMonth(value: number): string {
  if (maxMonthCount.value === 0) return '0%'
  const pct = (value / maxMonthCount.value) * 100
  return Math.max(pct > 0 ? pct : 0, value > 0 ? 4 : 0) + '%'
}

defineEmits<{
  'toggle-submenu': []
}>()
</script>

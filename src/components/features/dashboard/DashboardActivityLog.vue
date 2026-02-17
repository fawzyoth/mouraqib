<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Journal d'activité</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Historique de toutes les actions et événements</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <button class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2">
          <Download class="w-4 h-4" />
          <span>Exporter CSV</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Filters -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center space-x-2">
          <Filter class="w-4 h-4 text-gray-400" />
          <span class="text-sm text-gray-500">Filtres:</span>
        </div>
        <select v-model="localFilters.type" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <option value="all">Tous les types</option>
          <option value="status">Changements de statut</option>
          <option value="payment">Paiements</option>
          <option value="return">Retours</option>
          <option value="system">Système</option>
        </select>
        <select v-model="localFilters.period" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <option value="today">Aujourd'hui</option>
          <option value="yesterday">Hier</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
        <input v-model="localFilters.search" type="text" placeholder="Rechercher (tracking, client...)" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-64" />
      </div>
    </div>

    <!-- Activity Timeline -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div v-for="(group, date) in groupedLogs" :key="date">
          <div class="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 sticky top-0">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ date }}</span>
          </div>
          <div class="divide-y divide-gray-50 dark:divide-gray-800/50">
            <div v-for="log in group" :key="log.id" class="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <div class="flex items-start space-x-3">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
                  log.type === 'status' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  log.type === 'payment' ? 'bg-green-100 dark:bg-green-900/30' :
                  log.type === 'return' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  log.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-gray-100 dark:bg-gray-800'
                ]">
                  <component :is="log.icon" :class="[
                    'w-4 h-4',
                    log.type === 'status' ? 'text-blue-600' :
                    log.type === 'payment' ? 'text-green-600' :
                    log.type === 'return' ? 'text-yellow-600' :
                    log.type === 'error' ? 'text-red-600' :
                    'text-gray-500'
                  ]" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-white">{{ log.message }}</p>
                  <div class="flex items-center space-x-3 mt-1">
                    <span class="text-xs text-gray-400">{{ log.time }}</span>
                    <span v-if="log.tracking" class="text-xs text-blue-600 font-mono">{{ log.tracking }}</span>
                    <span v-if="log.user" class="text-xs text-gray-500">par {{ log.user }}</span>
                  </div>
                </div>
                <button v-if="log.tracking" class="text-xs text-orange-500 hover:text-orange-600 font-medium">
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import {
  ListFilter,
  Download,
  Filter
} from 'lucide-vue-next'

interface ActivityLog {
  id: string | number
  type: string
  message: string
  time: string
  date: string
  tracking?: string
  user?: string
  icon: any
}

interface Props {
  logs: ActivityLog[]
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'toggle-sub-menu'): void
}>()

const localFilters = reactive({
  type: 'all',
  period: 'today',
  search: ''
})

const groupedLogs = computed(() => {
  const filtered = props.logs.filter(log => {
    if (localFilters.type !== 'all' && log.type !== localFilters.type) return false
    if (localFilters.search && !log.message.toLowerCase().includes(localFilters.search.toLowerCase()) &&
        (!log.tracking || !log.tracking.toLowerCase().includes(localFilters.search.toLowerCase()))) return false
    return true
  })

  return filtered.reduce((groups: Record<string, ActivityLog[]>, log) => {
    const date = log.date
    if (!groups[date]) groups[date] = []
    groups[date].push(log)
    return groups
  }, {})
})
</script>

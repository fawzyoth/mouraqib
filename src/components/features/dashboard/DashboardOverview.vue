<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Vue d'ensemble</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{{ new Date().toLocaleDateString('fr-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="emit('add-pickup', '')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Truck class="w-4 h-4" />
          <span class="hidden sm:inline">Déclarer pickup</span>
        </button>
        <button
          @click="router.push('/shipments/create')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus class="w-4 h-4" />
          <span class="hidden sm:inline">Créer colis</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Performance Score & Weather -->

    <!-- Urgent Actions -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <AlertTriangle class="w-5 h-5 text-orange-500" />
          <h3 class="font-semibold text-gray-900 dark:text-white">Actions urgentes</h3>
          <span class="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">{{ urgentActions.length }}</span>
        </div>
        <button @click="emit('handle-all-actions')" class="text-sm text-orange-500 hover:text-orange-600 font-medium">Tout traiter</button>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div v-for="action in urgentActions" :key="action.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div class="flex items-center space-x-3">
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center',
              action.type === 'confirm' ? 'bg-blue-100 dark:bg-blue-900/30' :
              action.type === 'delayed' ? 'bg-red-100 dark:bg-red-900/30' :
              action.type === 'return' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-gray-100 dark:bg-gray-800'
            ]">
              <component :is="action.icon" :class="[
                'w-5 h-5',
                action.type === 'confirm' ? 'text-blue-600' :
                action.type === 'delayed' ? 'text-red-600' :
                action.type === 'return' ? 'text-yellow-600' :
                'text-gray-500'
              ]" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ action.title }}</p>
              <p class="text-xs text-gray-500">{{ action.description }}</p>
            </div>
          </div>
          <button @click="emit('handle-action', action)" class="btn-primary btn-primary-sm">
            Traiter
          </button>
        </div>
        <div v-if="urgentActions.length === 0" class="px-5 py-8 text-center">
          <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p class="text-gray-500">Aucune action urgente. Tout est sous contrôle !</p>
        </div>
      </div>
    </div>

    <!-- Colis En Retard -->
    <div v-if="overdueGroups && overdueGroups.some(g => g.count > 0)" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <Clock class="w-5 h-5 text-red-500" />
        <h3 class="font-semibold text-gray-900 dark:text-white">Colis En Retard</h3>
        <span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
          {{ overdueGroups.reduce((s, g) => s + g.count, 0) }}
        </span>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="group in overdueGroups"
          :key="group.level"
          :class="[
            'px-5 py-3 flex items-center justify-between transition-colors',
            group.count > 0
              ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'
              : 'opacity-40 pointer-events-none'
          ]"
          @click="group.count > 0 && emit('handle-action', group)"
        >
          <div class="flex items-center gap-3">
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center',
              group.level === 1 ? 'bg-red-100 dark:bg-red-900/30' :
              group.level === 2 ? 'bg-red-200 dark:bg-red-900/50' :
              'bg-red-300 dark:bg-red-900/70'
            ]">
              <AlertTriangle :class="[
                'w-5 h-5',
                group.level === 1 ? 'text-red-500' :
                group.level === 2 ? 'text-red-700 dark:text-red-400' :
                'text-red-950 dark:text-red-200'
              ]" />
            </div>
            <div>
              <p :class="[
                'text-sm font-semibold',
                group.level === 1 ? 'text-red-600 dark:text-red-400' :
                group.level === 2 ? 'text-red-800 dark:text-red-300' :
                'text-red-950 dark:text-red-200'
              ]">
                Retard +{{ group.level === 1 ? '24' : group.level === 2 ? '48' : '72' }}h{{ group.level === 3 ? ' !!!' : group.level === 2 ? ' !!' : ' !' }}
              </p>
              <p class="text-xs text-gray-500">{{ group.count }} colis en attente</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span :class="[
              'text-sm font-bold tabular-nums',
              group.level === 1 ? 'text-red-600 dark:text-red-400' :
              group.level === 2 ? 'text-red-800 dark:text-red-300' :
              'text-red-950 dark:text-red-200 animate-pulse'
            ]">{{ group.count }}</span>
            <ChevronRight class="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <!-- Today vs Yesterday Comparison -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Aujourd'hui vs Hier</h3>
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-400">Commandes</span>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-900 dark:text-white">{{ dashboardStats.todayOrders }}</span>
                <span :class="dashboardStats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs">
                  {{ dashboardStats.ordersChange >= 0 ? '+' : '' }}{{ dashboardStats.ordersChange }}%
                </span>
              </div>
            </div>
            <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-orange-500 rounded-full transition-all" :style="{ width: Math.min(100, (dashboardStats.todayOrders / dashboardStats.yesterdayOrders) * 100) + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-400">Livraisons réussies</span>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-900 dark:text-white">{{ dashboardStats.todayDelivered }}</span>
                <span :class="dashboardStats.deliveredChange >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs">
                  {{ dashboardStats.deliveredChange >= 0 ? '+' : '' }}{{ dashboardStats.deliveredChange }}%
                </span>
              </div>
            </div>
            <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full transition-all" :style="{ width: Math.min(100, (dashboardStats.todayDelivered / dashboardStats.yesterdayDelivered) * 100) + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-400">Retours</span>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-gray-900 dark:text-white">{{ dashboardStats.todayReturns }}</span>
                <span :class="dashboardStats.returnsChange <= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs">
                  {{ dashboardStats.returnsChange >= 0 ? '+' : '' }}{{ dashboardStats.returnsChange }}%
                </span>
              </div>
            </div>
            <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full transition-all" :style="{ width: Math.min(100, dashboardStats.todayReturns * 10) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  ListFilter,
  Package,
  CheckCircle,
  Banknote,
  AlertTriangle,
  Plus,
  ChevronRight,
  Clock,
  Truck
} from 'lucide-vue-next'

const router = useRouter()

interface DashboardStats {
  todayDeliveries: number
  todayDelivered: number
  successRate: number
  lastWeekSuccessRate: number
  expectedCOD: number
  pendingConfirmations: number
  todayOrders: number
  yesterdayOrders: number
  ordersChange: number
  deliveredChange: number
  todayReturns: number
  returnsChange: number
  yesterdayDelivered: number
}

interface UrgentAction {
  id: string | number
  type: string
  icon: any
  title: string
  description: string
  time: string
  actionLabel: string
  shipmentIds?: string[]
}

interface OverdueGroup {
  level: 1 | 2 | 3
  count: number
  type: string
  icon: any
  title: string
  description: string
  shipmentIds: string[]
}

interface Props {
  dashboardStats: DashboardStats
  urgentActions: UrgentAction[]
  overdueGroups?: OverdueGroup[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle-sub-menu'): void
  (e: 'handle-action', action: any): void
  (e: 'handle-all-actions'): void
  (e: 'add-pickup', carrierId: string): void
}>()
</script>

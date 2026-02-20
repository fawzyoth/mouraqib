<template>
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
        <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
          <Bell class="w-5 h-5 text-gray-500" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Performance Score & Weather -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <!-- Quick Stats -->
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">Livraisons aujourd'hui</span>
          <Package class="w-4 h-4 text-gray-400" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats.todayDeliveries }}</p>
        <p class="text-xs text-green-600 mt-1">{{ dashboardStats.todayDelivered }} livrés</p>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">Taux de succès</span>
          <CheckCircle class="w-4 h-4 text-gray-400" />
        </div>
        <p class="text-2xl font-bold text-green-600">{{ dashboardStats.successRate }}%</p>
        <p class="text-xs text-gray-500 mt-1">vs {{ dashboardStats.lastWeekSuccessRate }}% semaine dernière</p>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">COD attendu</span>
          <Banknote class="w-4 h-4 text-gray-400" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats.expectedCOD }} <span class="text-sm font-normal">TND</span></p>
        <p class="text-xs text-blue-600 mt-1">{{ dashboardStats.pendingConfirmations }} à confirmer</p>
      </div>
    </div>

    <!-- Urgent Actions -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <AlertTriangle class="w-5 h-5 text-orange-500" />
          <h3 class="font-semibold text-gray-900 dark:text-white">Actions urgentes</h3>
          <span class="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">{{ urgentActions.length }}</span>
        </div>
        <button class="text-sm text-orange-500 hover:text-orange-600 font-medium">Tout traiter</button>
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
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-400">{{ action.time }}</span>
            <button class="btn-primary btn-primary-sm">
              {{ action.actionLabel }}
            </button>
          </div>
        </div>
        <div v-if="urgentActions.length === 0" class="px-5 py-8 text-center">
          <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p class="text-gray-500">Aucune action urgente. Tout est sous contrôle !</p>
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
</template>

<script setup lang="ts">
import {
  ListFilter,
  Bell,
  Package,
  CheckCircle,
  Banknote,
  AlertTriangle
} from 'lucide-vue-next'

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
}

interface Props {
  dashboardStats: DashboardStats
  urgentActions: UrgentAction[]
}

defineProps<Props>()

defineEmits<{
  (e: 'toggle-sub-menu'): void
}>()
</script>

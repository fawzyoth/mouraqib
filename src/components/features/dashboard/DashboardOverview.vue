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
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      <!-- Performance Score -->
      <div class="lg:col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">Score du jour</span>
          <Target class="w-5 h-5 opacity-80" />
        </div>
        <div class="flex items-end space-x-2">
          <span class="text-4xl font-bold">{{ dashboardStats.performanceScore }}</span>
          <span class="text-lg opacity-80">/100</span>
        </div>
        <div class="mt-3 flex items-center space-x-2 text-sm">
          <TrendingUp class="w-4 h-4" />
          <span>+5 vs hier</span>
        </div>
      </div>

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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

      <!-- Weather Impact -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">Météo & Impact</h3>
          <span class="text-xs text-gray-500">Tunisie</span>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="region in weatherRegions" :key="region.name" class="text-center p-3 rounded-lg" :class="region.impact === 'high' ? 'bg-red-50 dark:bg-red-900/20' : region.impact === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'">
            <span class="text-2xl">{{ region.icon }}</span>
            <p class="text-xs font-medium text-gray-900 dark:text-white mt-1">{{ region.name }}</p>
            <p class="text-xs text-gray-500">{{ region.temp }}°C</p>
            <p :class="[
              'text-xs font-medium mt-1',
              region.impact === 'high' ? 'text-red-600' :
              region.impact === 'medium' ? 'text-yellow-600' : 'text-green-600'
            ]">{{ region.impact === 'high' ? 'Retards possibles' : region.impact === 'medium' ? 'Attention' : 'Normal' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button @click="$emit('navigate', 'today-shipments')" class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 transition-all text-center group">
          <CalendarClock class="w-8 h-8 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p class="text-sm font-medium text-gray-900 dark:text-white">Colis du jour</p>
          <p class="text-xs text-gray-500 mt-1">{{ dashboardStats.todayDeliveries }} colis</p>
        </button>
        <button @click="$emit('navigate', 'delayed-shipments')" class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 transition-all text-center group">
          <AlertTriangle class="w-8 h-8 text-red-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p class="text-sm font-medium text-gray-900 dark:text-white">En retard</p>
          <p class="text-xs text-red-500 mt-1">{{ delayedShipmentsCount }} colis</p>
        </button>
        <button @click="$emit('navigate', 'returns-alerts')" class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:border-yellow-200 transition-all text-center group">
          <RotateCcw class="w-8 h-8 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p class="text-sm font-medium text-gray-900 dark:text-white">Alertes retours</p>
          <p class="text-xs text-yellow-500 mt-1">{{ returnAlertsCount }} alertes</p>
        </button>
        <button @click="$emit('navigate', 'financial-snapshot')" class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-200 transition-all text-center group">
          <Wallet class="w-8 h-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p class="text-sm font-medium text-gray-900 dark:text-white">Finances</p>
          <p class="text-xs text-green-500 mt-1">{{ dashboardStats.expectedCOD }} TND</p>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ListFilter,
  Bell,
  Target,
  TrendingUp,
  Package,
  CheckCircle,
  Banknote,
  AlertTriangle,
  CalendarClock,
  RotateCcw,
  Wallet
} from 'lucide-vue-next'

interface DashboardStats {
  performanceScore: number
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

interface WeatherRegion {
  name: string
  icon: string
  temp: number
  impact: 'high' | 'medium' | 'low'
}

interface Props {
  dashboardStats: DashboardStats
  urgentActions: UrgentAction[]
  weatherRegions: WeatherRegion[]
  delayedShipmentsCount: number
  returnAlertsCount: number
}

defineProps<Props>()

defineEmits<{
  (e: 'toggle-sub-menu'): void
  (e: 'navigate', section: string): void
}>()
</script>

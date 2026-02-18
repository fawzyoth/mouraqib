<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Aperçu financier</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Suivi de votre trésorerie et paiements</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <option>Aujourd'hui</option>
          <option>Cette semaine</option>
          <option>Ce mois</option>
        </select>
        <button class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2">
          <Download class="w-4 h-4" />
          <span>Exporter</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Financial Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">COD à récupérer</span>
          <Banknote class="w-5 h-5 opacity-80" />
        </div>
        <p class="text-3xl font-bold">{{ financialStats.pendingCOD }} <span class="text-lg font-normal">TND</span></p>
        <p class="text-sm opacity-80 mt-1">{{ financialStats.pendingCODCount }} colis</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">Paiements en attente</span>
          <Clock class="w-4 h-4 text-gray-400" />
        </div>
        <p class="text-2xl font-bold text-yellow-600">{{ financialStats.pendingPayments }} <span class="text-sm font-normal">TND</span></p>
        <p class="text-xs text-gray-500 mt-1">De {{ financialStats.pendingCarriersCount }} transporteurs</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">Frais de livraison</span>
          <Truck class="w-4 h-4 text-gray-400" />
        </div>
        <p class="text-2xl font-bold text-red-600">-{{ financialStats.deliveryFees }} <span class="text-sm font-normal">TND</span></p>
        <p class="text-xs text-gray-500 mt-1">Ce mois</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">Marge nette</span>
          <TrendingUp class="w-4 h-4 text-gray-400" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ financialStats.netMargin }} <span class="text-sm font-normal">TND</span></p>
        <p class="text-xs text-green-600 mt-1">+{{ financialStats.marginPercent }}% du CA</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- COD by Carrier -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-white">COD à récupérer par transporteur</h3>
        </div>
        <div class="p-5 space-y-4">
          <div v-for="carrier in financialStats.codByCarrier" :key="carrier.name" class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', carrier.colorClass]">
                <Building2 class="w-5 h-5" :class="carrier.iconColor" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
                <p class="text-xs text-gray-500">{{ carrier.count }} colis</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ carrier.amount }} TND</p>
              <p v-if="carrier.overdue > 0" class="text-xs text-red-500">{{ carrier.overdue }} TND en retard</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overdue Payments -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">Paiements en retard</h3>
            <span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">{{ financialStats.overduePayments.length }}</span>
          </div>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="payment in financialStats.overduePayments" :key="payment.id" class="px-5 py-3 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ payment.carrier }}</p>
              <p class="text-xs text-red-500">En retard de {{ payment.daysOverdue }} jours</p>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ payment.amount }} TND</span>
              <button class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">
                Relancer
              </button>
            </div>
          </div>
          <div v-if="financialStats.overduePayments.length === 0" class="px-5 py-8 text-center">
            <CheckCircle class="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Aucun paiement en retard</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Flow Projection -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Prévision de trésorerie (7 jours)</h3>
      </div>
      <div class="p-5">
        <div class="flex items-end justify-between h-40 mb-4">
          <div v-for="(day, index) in financialStats.cashFlowProjection" :key="index" class="flex-1 flex flex-col items-center mx-1">
            <div class="w-full flex flex-col items-center justify-end h-32">
              <div v-if="day.incoming > 0" class="w-full bg-green-400 rounded-t" :style="{ height: (day.incoming / 2000 * 100) + '%' }"></div>
              <div v-if="day.outgoing > 0" class="w-full bg-red-400 rounded-b mt-0.5" :style="{ height: (day.outgoing / 2000 * 100) + '%' }"></div>
            </div>
            <span class="text-xs text-gray-500 mt-2">{{ day.label }}</span>
          </div>
        </div>
        <div class="flex items-center justify-center space-x-6 text-xs">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-400 rounded"></div>
            <span class="text-gray-500">Entrées (COD)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-red-400 rounded"></div>
            <span class="text-gray-500">Sorties (Frais)</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ListFilter,
  Download,
  Banknote,
  Clock,
  Truck,
  TrendingUp,
  Building2,
  CheckCircle
} from 'lucide-vue-next'

interface CarrierCOD {
  name: string
  count: number
  amount: number
  overdue: number
  colorClass: string
  iconColor: string
}

interface OverduePayment {
  id: string | number
  carrier: string
  daysOverdue: number
  amount: number
}

interface CashFlowDay {
  label: string
  incoming: number
  outgoing: number
}

interface FinancialStats {
  pendingCOD: number
  pendingCODCount: number
  pendingPayments: number
  pendingCarriersCount: number
  deliveryFees: number
  netMargin: number
  marginPercent: number
  codByCarrier: CarrierCOD[]
  overduePayments: OverduePayment[]
  cashFlowProjection: CashFlowDay[]
}

interface Props {
  financialStats: FinancialStats
}

const { financialStats } = withDefaults(defineProps<Props>(), {
  financialStats: () => ({
    pendingCOD: 0,
    pendingCODCount: 0,
    pendingPayments: 0,
    pendingCarriersCount: 0,
    deliveryFees: 0,
    netMargin: 0,
    marginPercent: 0,
    codByCarrier: [],
    overduePayments: [],
    cashFlowProjection: [],
  }),
})

defineEmits<{
  (e: 'toggle-sub-menu'): void
}>()
</script>

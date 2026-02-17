<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Historique de paiement</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Consultez vos transactions et factures</p>
          </div>
        </div>
        <button class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          <Download class="w-4 h-4" />
          <span class="hidden sm:inline">Exporter</span>
        </button>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-5xl space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ paymentStats.totalPaid }} TND</p>
                <p class="text-xs text-gray-500">Total payé</p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock class="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ paymentStats.pending }} TND</p>
                <p class="text-xs text-gray-500">En attente</p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ paymentStats.invoiceCount }}</p>
                <p class="text-xs text-gray-500">Factures</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment History Table -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Transactions récentes</h3>
              <select v-model="paymentFilter" class="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="all">Toutes</option>
                <option value="paid">Payées</option>
                <option value="pending">En attente</option>
                <option value="failed">Échouées</option>
              </select>
            </div>
          </div>
          <div class="table-responsive">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Facture</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in filteredPayments" :key="payment.id" class="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="px-4 py-3 text-sm text-gray-900 dark:text-white" data-label="Date">{{ payment.date }}</td>
                  <td class="px-4 py-3" data-label="Description">
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ payment.description }}</p>
                      <p class="text-xs text-gray-500">{{ payment.reference }}</p>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Montant">{{ payment.amount }} TND</td>
                  <td class="px-4 py-3" data-label="Statut">
                    <span :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      payment.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      payment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    ]">
                      {{ payment.status === 'paid' ? 'Payé' : payment.status === 'pending' ? 'En attente' : 'Échoué' }}
                    </span>
                  </td>
                  <td class="px-4 py-3" data-label="Facture">
                    <button class="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1">
                      <Download class="w-4 h-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter,
  Download,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-vue-next'

interface Payment {
  id: string | number
  date: string
  description: string
  reference: string
  amount: number | string
  status: 'paid' | 'pending' | 'failed'
}

interface PaymentStats {
  totalPaid: number
  pending: number
  invoiceCount: number
}

interface Props {
  payments?: Payment[]
  paymentStats?: PaymentStats
}

const props = withDefaults(defineProps<Props>(), {
  payments: () => [],
  paymentStats: () => ({
    totalPaid: 0,
    pending: 0,
    invoiceCount: 0
  })
})

const emit = defineEmits<{
  'toggle-submenu': []
}>()

const paymentFilter = ref('all')

const filteredPayments = computed(() => {
  if (paymentFilter.value === 'all') return props.payments
  return props.payments.filter(p => p.status === paymentFilter.value)
})
</script>

<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Facturation comptes</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez les soldes et les paiements des utilisateurs</p>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp class="w-6 h-6 text-green-600" />
            </div>
            <span class="text-xs text-gray-500">Ce mois</span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalCredits }} TND</p>
          <p class="text-sm text-gray-500">Total crédits</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <TrendingDown class="w-6 h-6 text-red-600" />
            </div>
            <span class="text-xs text-gray-500">Ce mois</span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalDebits }} TND</p>
          <p class="text-sm text-gray-500">Total débits</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-[#4959b4]/10 rounded-xl">
              <Receipt class="w-6 h-6 text-[#4959b4]" />
            </div>
            <span class="text-xs text-gray-500">Ce mois</span>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminTransactions.length }}</p>
          <p class="text-sm text-gray-500">Transactions</p>
        </div>
      </div>

      <!-- Users with Balances -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-white">Soldes des comptes</h3>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="user in adminUsers" :key="user.id" class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm">
                {{ user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) }}
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                <p class="text-sm text-gray-500">{{ user.company }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p :class="[
                  'text-lg font-semibold',
                  user.balance > 0 ? 'text-green-600' : user.balance < 0 ? 'text-red-600' : 'text-gray-500'
                ]">
                  {{ user.balance >= 0 ? '+' : '' }}{{ user.balance.toFixed(2) }} TND
                </p>
                <p class="text-xs text-gray-400">{{ user.shipmentsCount }} colis</p>
              </div>
              <button @click="$emit('open-charge-modal', user)" class="px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white text-sm font-medium rounded-lg flex items-center gap-2">
                <Plus class="w-4 h-4" />
                Charger
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ListFilter,
  TrendingUp,
  TrendingDown,
  Receipt,
  Plus
} from 'lucide-vue-next'

interface AdminUser {
  id: string
  name: string
  email: string
  company: string
  phone: string
  shipmentsCount: number
  balance: number
  status: string
}

interface AdminTransaction {
  id: string
  userId: string
  userName: string
  company: string
  type: 'credit' | 'debit'
  amount: number
  note: string
  date: string
  createdBy: string
}

interface Props {
  adminUsers: AdminUser[]
  adminTransactions: AdminTransaction[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggle-submenu': []
  'open-charge-modal': [user: AdminUser]
}>()

const totalCredits = computed(() => {
  return props.adminTransactions
    .filter(t => t.type === 'credit')
    .reduce((s, t) => s + t.amount, 0)
    .toFixed(2)
})

const totalDebits = computed(() => {
  return props.adminTransactions
    .filter(t => t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0)
    .toFixed(2)
})
</script>

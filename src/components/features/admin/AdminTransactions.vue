<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Historique des transactions</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Consultez toutes les transactions de facturation</p>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Note</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="tx in adminTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-4 py-3">
                  <span class="font-mono text-sm text-gray-600 dark:text-gray-400">{{ tx.id }}</span>
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-white">{{ tx.userName }}</p>
                  <p class="text-xs text-gray-500">{{ tx.company }}</p>
                </td>
                <td class="px-4 py-3 hidden md:table-cell">
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ tx.note }}</p>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="[
                    'px-2 py-1 text-xs rounded-full font-medium',
                    tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  ]">
                    {{ tx.type === 'credit' ? 'Crédit' : 'Débit' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span :class="[
                    'font-semibold',
                    tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  ]">
                    {{ tx.type === 'credit' ? '+' : '-' }}{{ tx.amount.toFixed(2) }} TND
                  </span>
                </td>
                <td class="px-4 py-3 text-right hidden sm:table-cell">
                  <span class="text-sm text-gray-500">{{ tx.date }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="adminTransactions.length === 0" class="p-8 text-center">
          <Receipt class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">Aucune transaction</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  ListFilter,
  Receipt
} from 'lucide-vue-next'

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
  adminTransactions: AdminTransaction[]
}

defineProps<Props>()

defineEmits<{
  'toggle-submenu': []
}>()
</script>

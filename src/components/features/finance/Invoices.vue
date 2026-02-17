<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Factures</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">G&eacute;rez vos factures transporteurs et clients</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <button
          v-for="tab in (['received', 'sent'] as const)"
          :key="tab"
          @click="$emit('update:invoicesTab', tab)"
          :class="['px-4 py-2 text-sm font-medium rounded-lg transition-colors', invoicesTab === tab ? 'bg-primary-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          {{ tab === 'received' ? 'Factures re\u00e7ues' : 'Factures \u00e9mises' }}
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Receipt class="w-5 h-5 text-blue-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totalInvoices }}</p><p class="text-sm text-gray-500">Total factures</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"><Clock class="w-5 h-5 text-yellow-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.pendingAmount.toLocaleString() }} TND</p><p class="text-sm text-gray-500">En attente</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><CheckCircle class="w-5 h-5 text-green-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.paidAmount.toLocaleString() }} TND</p><p class="text-sm text-gray-500">Pay&eacute;es ce mois</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><AlertCircle class="w-5 h-5 text-red-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.overdueCount }}</p><p class="text-sm text-gray-500">En retard</p></div>
        </div>
      </div>
    </div>

    <!-- Invoices List -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <input type="text" :value="search" @input="$emit('update:search', ($event.target as HTMLInputElement).value)" placeholder="Rechercher une facture..." class="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-orange-500" />
          <select :value="statusFilter" @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="paid">Pay&eacute;e</option>
            <option value="overdue">En retard</option>
          </select>
        </div>
        <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
          <Plus class="w-4 h-4" /><span>Nouvelle facture</span>
        </button>
      </div>
      <div class="table-responsive">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N&deg; Facture</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ invoicesTab === 'received' ? '\u00c9metteur' : 'Client' }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">&Eacute;ch&eacute;ance</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3" data-label="N&deg; Facture"><span class="text-sm font-medium text-gray-900 dark:text-white">{{ invoice.number }}</span></td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Client">{{ invoice.party }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Date">{{ invoice.date }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="&Eacute;ch&eacute;ance">{{ invoice.dueDate }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white" data-label="Montant">{{ invoice.amount.toLocaleString() }} TND</td>
              <td class="px-4 py-3" data-label="Statut">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                ]">{{ invoice.status === 'paid' ? 'Pay\u00e9e' : invoice.status === 'overdue' ? 'En retard' : 'En attente' }}</span>
              </td>
              <td class="px-4 py-3" data-label="Actions">
                <div class="flex items-center space-x-2">
                  <button class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Voir"><Eye class="w-4 h-4 text-gray-500" /></button>
                  <button class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="T&eacute;l&eacute;charger"><FileDown class="w-4 h-4 text-gray-500" /></button>
                  <button v-if="invoice.status !== 'paid'" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Marquer pay&eacute;e"><CheckCircle class="w-4 h-4 text-green-500" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, Receipt, Clock, CheckCircle, AlertCircle, Plus, Eye, FileDown } from 'lucide-vue-next'

interface InvoicesStats {
  totalInvoices: number; pendingAmount: number; paidAmount: number; overdueCount: number
}

interface Props {
  invoicesTab: 'received' | 'sent'
  search: string
  statusFilter: string
  stats: InvoicesStats
  filteredInvoices: any[]
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'update:invoicesTab': [tab: 'received' | 'sent']
  'update:search': [value: string]
  'update:statusFilter': [value: string]
}>()
</script>

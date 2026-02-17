<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Exports financiers</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Exportez vos donn&eacute;es financi&egrave;res pour la comptabilit&eacute;</p>
        </div>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Quick Export Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform"><FileSpreadsheet class="w-6 h-6 text-green-600" /></div>
          <div class="flex-1"><h3 class="font-semibold text-gray-900 dark:text-white">Export Excel</h3><p class="text-sm text-gray-500">Donn&eacute;es format&eacute;es pour Excel</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform"><FileText class="w-6 h-6 text-blue-600" /></div>
          <div class="flex-1"><h3 class="font-semibold text-gray-900 dark:text-white">Export CSV</h3><p class="text-sm text-gray-500">Format universel</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform"><FileText class="w-6 h-6 text-red-600" /></div>
          <div class="flex-1"><h3 class="font-semibold text-gray-900 dark:text-white">Export PDF</h3><p class="text-sm text-gray-500">Rapports imprimables</p></div>
        </div>
      </div>
    </div>

    <!-- Export Configuration -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800"><h3 class="font-semibold text-gray-900 dark:text-white">Configurer l'export</h3></div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de donn&eacute;es</label>
            <select :value="config.dataType" @change="$emit('update:configField', 'dataType', ($event.target as HTMLSelectElement).value)" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <option value="all">Toutes les donn&eacute;es</option>
              <option value="payments">Paiements uniquement</option>
              <option value="invoices">Factures uniquement</option>
              <option value="revenue">Revenus uniquement</option>
              <option value="losses">Pertes/Retours</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">P&eacute;riode</label>
            <select :value="config.period" @change="$emit('update:configField', 'period', ($event.target as HTMLSelectElement).value)" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <option value="thisMonth">Ce mois</option>
              <option value="lastMonth">Mois dernier</option>
              <option value="thisQuarter">Ce trimestre</option>
              <option value="thisYear">Cette ann&eacute;e</option>
              <option value="custom">Personnalis&eacute;</option>
            </select>
          </div>
          <div v-if="config.period === 'custom'" class="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date d&eacute;but</label>
              <input type="date" :value="config.startDate" @input="$emit('update:configField', 'startDate', ($event.target as HTMLInputElement).value)" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date fin</label>
              <input type="date" :value="config.endDate" @input="$emit('update:configField', 'endDate', ($event.target as HTMLInputElement).value)" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
            <div class="flex space-x-3">
              <button
                v-for="format in ['excel', 'csv', 'pdf']"
                :key="format"
                @click="$emit('update:configField', 'format', format)"
                :class="['flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors', config.format === format ? 'bg-primary-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']"
              >
                {{ format.toUpperCase() }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transporteur</label>
            <select :value="config.carrier" @change="$emit('update:configField', 'carrier', ($event.target as HTMLSelectElement).value)" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <option value="all">Tous les transporteurs</option>
              <option value="aramex">Aramex</option>
              <option value="express">Express Delivery</option>
              <option value="rapid">Rapid Post</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button class="flex items-center space-x-2 px-6 py-2.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg font-medium transition-colors">
            <FileDown class="w-5 h-5" /><span>G&eacute;n&eacute;rer l'export</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Exports -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800"><h3 class="font-semibold text-gray-900 dark:text-white">Exports r&eacute;cents</h3></div>
      <div class="divide-y divide-gray-200 dark:divide-gray-800">
        <div v-for="exp in recentExports" :key="exp.id" class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <div class="flex items-center space-x-4">
            <div :class="['p-2 rounded-lg', exp.format === 'excel' ? 'bg-green-100 dark:bg-green-900/30' : exp.format === 'csv' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30']">
              <FileSpreadsheet v-if="exp.format === 'excel'" class="w-5 h-5 text-green-600" />
              <FileText v-else class="w-5 h-5" :class="exp.format === 'csv' ? 'text-blue-600' : 'text-red-600'" />
            </div>
            <div><p class="font-medium text-gray-900 dark:text-white">{{ exp.name }}</p><p class="text-sm text-gray-500">{{ exp.date }} &middot; {{ exp.size }}</p></div>
          </div>
          <div class="flex items-center space-x-2">
            <span :class="['px-2 py-1 text-xs font-medium rounded-full', exp.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">{{ exp.status === 'ready' ? 'Pr\u00eat' : 'En cours' }}</span>
            <button v-if="exp.status === 'ready'" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><FileDown class="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, FileSpreadsheet, FileText, FileDown } from 'lucide-vue-next'

interface ExportConfig {
  dataType: string; period: string; startDate: string; endDate: string; format: string; carrier: string
}

interface Props {
  config: ExportConfig
  recentExports: any[]
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'update:configField': [field: string, value: string]
}>()
</script>

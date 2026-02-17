<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Pertes retours</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Impact financier des retours et colis perdus</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <input type="month" :value="month" @input="$emit('update:month', ($event.target as HTMLInputElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
        <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
          <FileDown class="w-4 h-4" /><span>Exporter</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-red-200 dark:border-red-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><XCircle class="w-5 h-5 text-red-600" /></div>
          <div><p class="text-2xl font-semibold text-red-600">{{ stats.totalLoss.toLocaleString() }} TND</p><p class="text-sm text-gray-500">Pertes totales</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><RotateCcw class="w-5 h-5 text-orange-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.returnedCount }}</p><p class="text-sm text-gray-500">Colis retourn&eacute;s</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><PackageX class="w-5 h-5 text-gray-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.lostCount }}</p><p class="text-sm text-gray-500">Colis perdus</p></div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"><Truck class="w-5 h-5 text-yellow-600" /></div>
          <div><p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.shippingLoss.toLocaleString() }} TND</p><p class="text-sm text-gray-500">Frais de port perdus</p></div>
        </div>
      </div>
    </div>

    <!-- Loss Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800"><h3 class="font-semibold text-gray-900 dark:text-white">Par motif de retour</h3></div>
        <div class="p-4 space-y-3">
          <div v-for="reason in byReason" :key="reason.name" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex items-center space-x-3">
              <component :is="reason.icon" class="w-5 h-5" :class="reason.iconColor" />
              <div><p class="text-sm font-medium text-gray-900 dark:text-white">{{ reason.name }}</p><p class="text-xs text-gray-500">{{ reason.count }} colis</p></div>
            </div>
            <div class="text-right"><p class="text-sm font-semibold text-red-600">-{{ reason.amount.toLocaleString() }} TND</p><p class="text-xs text-gray-500">{{ reason.percent }}%</p></div>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800"><h3 class="font-semibold text-gray-900 dark:text-white">Par transporteur</h3></div>
        <div class="p-4 space-y-3">
          <div v-for="carrier in byCarrier" :key="carrier.name" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"><Truck class="w-4 h-4 text-gray-600" /></div>
              <div><p class="text-sm font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p><p class="text-xs text-gray-500">Taux retour: {{ carrier.returnRate }}%</p></div>
            </div>
            <div class="text-right"><p class="text-sm font-semibold text-red-600">-{{ carrier.amount.toLocaleString() }} TND</p><p class="text-xs text-gray-500">{{ carrier.count }} retours</p></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed List -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800"><h3 class="font-semibold text-gray-900 dark:text-white">D&eacute;tail des pertes</h3></div>
      <div class="table-responsive">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">R&eacute;f&eacute;rence</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transporteur</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur colis</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frais port</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perte totale</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="loss in details" :key="loss.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="R&eacute;f&eacute;rence">{{ loss.reference }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Client">{{ loss.customer }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Transporteur">{{ loss.carrier }}</td>
              <td class="px-4 py-3" data-label="Motif">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  loss.reason === 'Refus\u00e9' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  loss.reason === 'Perdu' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                ]">{{ loss.reason }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Valeur colis">{{ loss.value.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Frais port">{{ loss.shippingFee.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-sm font-semibold text-red-600" data-label="Perte totale">-{{ loss.totalLoss.toLocaleString() }} TND</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, FileDown, XCircle, RotateCcw, PackageX, Truck } from 'lucide-vue-next'

interface ReturnLossesStats {
  totalLoss: number; returnedCount: number; lostCount: number; shippingLoss: number
}

interface Props {
  month: string
  stats: ReturnLossesStats
  byReason: any[]
  byCarrier: any[]
  details: any[]
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'update:month': [value: string]
}>()
</script>

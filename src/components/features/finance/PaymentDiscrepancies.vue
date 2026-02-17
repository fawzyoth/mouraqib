<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">&Eacute;carts de paiement</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Comparaison entre nos calculs et les paiements re&ccedil;us des transporteurs</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select :value="carrierFilter" @change="$emit('update:carrierFilter', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="all">Tous les transporteurs</option>
          <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
        </select>
        <button
          v-for="status in ['all', 'pending', 'disputed', 'resolved']"
          :key="status"
          @click="$emit('update:discrepancyFilter', status)"
          :class="['px-3 py-1.5 text-sm rounded-lg transition-colors', discrepancyFilter === status ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800']"
        >
          {{ status === 'all' ? 'Tous' : status === 'pending' ? 'Non r\u00e9solus' : status === 'disputed' ? 'Contest\u00e9s' : 'R\u00e9solus' }}
        </button>
        <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
          <FileDown class="w-4 h-4" /><span>Rapport r&eacute;conciliation</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Alert Banner -->
    <div v-if="stats.totalPending > 0" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
      <div class="flex items-start space-x-3">
        <AlertTriangle class="w-5 h-5 text-red-600 mt-0.5" />
        <div class="flex-1">
          <p class="font-medium text-red-800 dark:text-red-300">{{ stats.pendingCount }} &eacute;carts non r&eacute;solus repr&eacute;sentant {{ stats.totalPending.toLocaleString() }} TND de manque &agrave; gagner</p>
          <p class="text-sm text-red-600 dark:text-red-400 mt-1">Ces montants sont calcul&eacute;s en comparant nos donn&eacute;es avec les versements des transporteurs.</p>
        </div>
        <button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Contester tous</button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">Notre calcul</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.ourTotal.toLocaleString() }} TND</p>
        <p class="text-xs text-gray-400 mt-1">Ce que nous devions recevoir</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">Re&ccedil;u des transporteurs</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.theirTotal.toLocaleString() }} TND</p>
        <p class="text-xs text-gray-400 mt-1">Ce qu'ils ont vers&eacute;</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-red-200 dark:border-red-800">
        <p class="text-sm text-gray-500 mb-1">&Eacute;cart total</p>
        <p class="text-2xl font-bold text-red-600">-{{ stats.totalDifference.toLocaleString() }} TND</p>
        <p class="text-xs text-red-500 mt-1">{{ stats.differencePercent }}% de diff&eacute;rence</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">Frais non pr&eacute;vus</p>
        <p class="text-2xl font-bold text-orange-600">{{ stats.unexpectedFees.toLocaleString() }} TND</p>
        <p class="text-xs text-gray-400 mt-1">{{ stats.unexpectedFeesCount }} colis</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">R&eacute;cup&eacute;r&eacute; apr&egrave;s contestation</p>
        <p class="text-2xl font-bold text-green-600">{{ stats.recovered.toLocaleString() }} TND</p>
        <p class="text-xs text-gray-400 mt-1">Ce mois</p>
      </div>
    </div>

    <!-- Reconciliation by Carrier -->
    <div v-for="carrier in reconciliationByCarrier" :key="carrier.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800" :class="carrier.totalDifference > 0 ? 'bg-red-50 dark:bg-red-900/10' : 'bg-green-50 dark:bg-green-900/10'">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', carrier.totalDifference > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30']">
              <Truck :class="['w-6 h-6', carrier.totalDifference > 0 ? 'text-red-600' : 'text-green-600']" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h3>
              <p class="text-sm text-gray-500">{{ carrier.shipmentsWithDiscrepancy }} colis avec &eacute;cart sur {{ carrier.totalShipments }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-8">
            <div class="text-center"><p class="text-xs text-gray-500 uppercase">Notre calcul</p><p class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.ourCalculation.toLocaleString() }} TND</p></div>
            <div class="text-2xl text-gray-300">vs</div>
            <div class="text-center"><p class="text-xs text-gray-500 uppercase">Leur versement</p><p class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.theirPayment.toLocaleString() }} TND</p></div>
            <div class="text-center px-4 py-2 rounded-lg" :class="carrier.totalDifference > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'">
              <p class="text-xs" :class="carrier.totalDifference > 0 ? 'text-red-600' : 'text-green-600'">&Eacute;cart</p>
              <p class="text-xl font-bold" :class="carrier.totalDifference > 0 ? 'text-red-600' : 'text-green-600'">{{ carrier.totalDifference > 0 ? '-' : '+' }}{{ Math.abs(carrier.totalDifference).toLocaleString() }} TND</p>
            </div>
            <button v-if="carrier.totalDifference > 0" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">Contester</button>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N&deg; Tracking</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">COD Client</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Notre calcul net</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Leur versement</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">&Eacute;cart</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Raison transporteur</th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="shipment in carrier.discrepancies" :key="shipment.id" :class="shipment.difference !== 0 ? 'bg-red-50/50 dark:bg-red-900/5' : ''">
              <td class="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white">{{ shipment.tracking }}</td>
              <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ shipment.client }}</td>
              <td class="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">{{ shipment.codCollected.toLocaleString() }} TND</td>
              <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{{ shipment.ourNet.toLocaleString() }} TND</td>
              <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{{ shipment.theirNet.toLocaleString() }} TND</td>
              <td class="px-4 py-2.5 text-right">
                <span v-if="shipment.difference !== 0" class="font-semibold text-red-600">-{{ shipment.difference.toLocaleString() }} TND</span>
                <span v-else class="text-green-600">OK</span>
              </td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs">{{ shipment.carrierReason || '-' }}</td>
              <td class="px-4 py-2.5 text-center">
                <span v-if="shipment.difference !== 0" :class="['px-2 py-0.5 text-xs font-medium rounded-full', shipment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : shipment.status === 'disputed' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700']">
                  {{ shipment.status === 'pending' ? 'Non r\u00e9solu' : shipment.status === 'disputed' ? 'Contest\u00e9' : 'R\u00e9solu' }}
                </span>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>
              <td class="px-4 py-2.5 text-center">
                <button v-if="shipment.difference !== 0 && shipment.status !== 'resolved'" class="text-xs text-orange-600 hover:text-orange-700 font-medium">Contester</button>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 dark:bg-gray-800 font-semibold">
            <tr>
              <td colspan="3" class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">TOTAL</td>
              <td class="px-4 py-3 text-right text-gray-900 dark:text-white">{{ carrier.ourCalculation.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-right text-gray-900 dark:text-white">{{ carrier.theirPayment.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-right" :class="carrier.totalDifference > 0 ? 'text-red-600' : 'text-green-600'">{{ carrier.totalDifference > 0 ? '-' : '' }}{{ Math.abs(carrier.totalDifference).toLocaleString() }} TND</td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Comparaison des frais</h4>
        <div class="grid grid-cols-4 gap-4 text-sm">
          <div><p class="text-xs text-gray-500">Frais livraison</p><div class="flex items-center space-x-2"><span class="text-gray-600">Pr&eacute;vu: {{ carrier.fees.deliveryExpected.toLocaleString() }}</span><span class="text-gray-400">&rarr;</span><span :class="carrier.fees.deliveryActual > carrier.fees.deliveryExpected ? 'text-red-600 font-medium' : 'text-gray-600'">R&eacute;el: {{ carrier.fees.deliveryActual.toLocaleString() }} TND</span></div></div>
          <div><p class="text-xs text-gray-500">Frais COD</p><div class="flex items-center space-x-2"><span class="text-gray-600">Pr&eacute;vu: {{ carrier.fees.codExpected.toLocaleString() }}</span><span class="text-gray-400">&rarr;</span><span :class="carrier.fees.codActual > carrier.fees.codExpected ? 'text-red-600 font-medium' : 'text-gray-600'">R&eacute;el: {{ carrier.fees.codActual.toLocaleString() }} TND</span></div></div>
          <div><p class="text-xs text-gray-500">Frais retour</p><div class="flex items-center space-x-2"><span class="text-gray-600">Pr&eacute;vu: {{ carrier.fees.returnExpected.toLocaleString() }}</span><span class="text-gray-400">&rarr;</span><span :class="carrier.fees.returnActual > carrier.fees.returnExpected ? 'text-red-600 font-medium' : 'text-gray-600'">R&eacute;el: {{ carrier.fees.returnActual.toLocaleString() }} TND</span></div></div>
          <div><p class="text-xs text-gray-500">Autres frais</p><div class="flex items-center space-x-2"><span class="text-gray-600">Pr&eacute;vu: {{ carrier.fees.otherExpected.toLocaleString() }}</span><span class="text-gray-400">&rarr;</span><span :class="carrier.fees.otherActual > carrier.fees.otherExpected ? 'text-red-600 font-medium' : 'text-gray-600'">R&eacute;el: {{ carrier.fees.otherActual.toLocaleString() }} TND</span></div></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, FileDown, Truck, AlertTriangle } from 'lucide-vue-next'

interface DiscrepancyStats {
  ourTotal: number; theirTotal: number; totalDifference: number; differencePercent: number
  totalPending: number; pendingCount: number; unexpectedFees: number; unexpectedFeesCount: number; recovered: number
}

interface Props {
  carrierFilter: string
  discrepancyFilter: string
  carriersList: { id: string; name: string }[]
  stats: DiscrepancyStats
  reconciliationByCarrier: any[]
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'update:carrierFilter': [value: string]
  'update:discrepancyFilter': [value: string]
}>()
</script>

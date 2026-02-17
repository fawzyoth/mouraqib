<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Paiements re&ccedil;us</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Historique des versements re&ccedil;us avec d&eacute;tail par colis</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <input type="month" :value="month" @input="$emit('update:month', ($event.target as HTMLInputElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
        <select :value="carrierFilter" @change="$emit('update:carrierFilter', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="all">Tous les transporteurs</option>
          <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
        </select>
        <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
          <FileDown class="w-4 h-4" /><span>Exporter</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
        <p class="text-sm text-green-100 mb-1">Total Re&ccedil;u</p>
        <p class="text-2xl font-bold">{{ stats.totalReceived.toLocaleString() }} TND</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">COD Collect&eacute;</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalCOD.toLocaleString() }} TND</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">Frais Pr&eacute;lev&eacute;s</p>
        <p class="text-2xl font-bold text-red-600">-{{ stats.totalFees.toLocaleString() }} TND</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">Versements</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.paymentsCount }}</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">Colis Pay&eacute;s</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.shipmentsCount }}</p>
      </div>
    </div>

    <!-- Payments List -->
    <div v-for="payment in filteredPayments" :key="payment.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-green-50 dark:bg-green-900/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"><CheckCircle class="w-6 h-6 text-green-600" /></div>
            <div>
              <div class="flex items-center space-x-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ payment.carrier }}</h3>
                <span class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Pay&eacute;</span>
              </div>
              <p class="text-sm text-gray-500">R&eacute;f: {{ payment.reference }} &middot; {{ payment.paymentDate }} &middot; {{ payment.shipments.length }} colis</p>
            </div>
          </div>
          <div class="flex items-center space-x-6">
            <div class="text-right"><p class="text-sm text-gray-500">COD Total</p><p class="text-lg font-medium text-gray-900 dark:text-white">{{ payment.totalCOD.toLocaleString() }} TND</p></div>
            <div class="text-right"><p class="text-sm text-gray-500">Frais Total</p><p class="text-lg font-medium text-red-600">-{{ payment.totalFees.toLocaleString() }} TND</p></div>
            <div class="text-right bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg"><p class="text-sm text-green-600">Net Re&ccedil;u</p><p class="text-xl font-bold text-green-600">+{{ payment.netReceived.toLocaleString() }} TND</p></div>
            <button @click="$emit('toggle-expanded', payment.id)" class="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
              <ChevronDown :class="['w-5 h-5 text-gray-500 transition-transform', payment.expanded ? 'rotate-180' : '']" />
            </button>
          </div>
        </div>
      </div>
      <div v-show="payment.expanded" class="table-responsive">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N&deg; Tracking</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date Livraison</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">COD</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Frais Livr.</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Autres Frais</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="shipment in payment.shipments" :key="shipment.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
              <td class="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white" data-label="N&deg; Tracking">{{ shipment.tracking }}</td>
              <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300" data-label="Client">{{ shipment.client }}</td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400" data-label="Destination">{{ shipment.destination }}</td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400" data-label="Date Livraison">{{ shipment.deliveryDate }}</td>
              <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white" data-label="COD">{{ shipment.cod.toLocaleString() }} TND</td>
              <td class="px-4 py-2.5 text-right text-red-600" data-label="Frais Livr.">-{{ shipment.deliveryFee.toLocaleString() }} TND</td>
              <td class="px-4 py-2.5 text-right text-red-600" data-label="Autres Frais">{{ shipment.otherFees > 0 ? '-' + shipment.otherFees.toLocaleString() : '0' }} TND</td>
              <td class="px-4 py-2.5 text-right font-semibold text-green-600" data-label="Net">{{ shipment.net.toLocaleString() }} TND</td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 dark:bg-gray-800 font-semibold">
            <tr>
              <td colspan="4" class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">TOTAL</td>
              <td class="px-4 py-3 text-right text-gray-900 dark:text-white">{{ payment.totalCOD.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-right text-red-600">-{{ payment.totalDeliveryFees.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-right text-red-600">-{{ payment.totalOtherFees.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-right text-green-600">{{ payment.netReceived.toLocaleString() }} TND</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div v-show="payment.expanded" class="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">D&eacute;tail des frais pr&eacute;lev&eacute;s par {{ payment.carrier }}</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-900 rounded-lg p-3"><p class="text-xs text-gray-500">Frais de livraison</p><p class="text-lg font-semibold text-red-600">-{{ payment.totalDeliveryFees.toLocaleString() }} TND</p><p class="text-xs text-gray-400">{{ payment.shipments.length }} x {{ (payment.totalDeliveryFees / payment.shipments.length).toFixed(2) }} TND/colis</p></div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-3"><p class="text-xs text-gray-500">Frais COD</p><p class="text-lg font-semibold text-red-600">-{{ payment.codFees.toLocaleString() }} TND</p><p class="text-xs text-gray-400">{{ payment.codFeePercent }}% du COD</p></div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-3"><p class="text-xs text-gray-500">Frais retour</p><p class="text-lg font-semibold text-red-600">-{{ payment.returnFees.toLocaleString() }} TND</p><p class="text-xs text-gray-400">{{ payment.returnCount }} retours</p></div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-3"><p class="text-xs text-gray-500">TVA</p><p class="text-lg font-semibold text-red-600">-{{ payment.tva.toLocaleString() }} TND</p><p class="text-xs text-gray-400">19% sur frais</p></div>
        </div>
      </div>
    </div>

    <div v-if="filteredPayments.length === 0" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
      <Wallet class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">Aucun paiement re&ccedil;u pour cette p&eacute;riode</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, FileDown, CheckCircle, ChevronDown, Wallet } from 'lucide-vue-next'

interface Props {
  month: string
  carrierFilter: string
  carriersList: { id: string; name: string }[]
  stats: { totalReceived: number; totalCOD: number; totalFees: number; paymentsCount: number; shipmentsCount: number }
  filteredPayments: any[]
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'update:month': [value: string]
  'update:carrierFilter': [value: string]
  'toggle-expanded': [paymentId: string]
}>()
</script>

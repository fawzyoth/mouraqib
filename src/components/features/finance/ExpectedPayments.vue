<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Paiements attendus</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Montants que les transporteurs vous doivent (COD collect&eacute; - Frais)</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select :value="carrierFilter" @change="$emit('update:carrierFilter', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="all">Tous les transporteurs</option>
          <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
        </select>
        <select :value="statusFilter" @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="all">Tous les statuts</option>
          <option value="pending">Non pay&eacute;</option>
          <option value="overdue">En retard</option>
        </select>
        <button @click="$emit('show-reconciliation')" class="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
          <CheckCircle class="w-4 h-4" />
          <span>V&eacute;rifier</span>
        </button>
        <button class="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
          <FileDown class="w-4 h-4" />
          <span>Exporter</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">COD Total Collect&eacute;</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ manifestStats.totalCOD.toLocaleString() }} TND</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">Frais Livraison</p>
        <p class="text-2xl font-bold text-red-600">-{{ manifestStats.totalDeliveryFees.toLocaleString() }} TND</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500 mb-1">Autres Frais</p>
        <p class="text-2xl font-bold text-red-600">-{{ manifestStats.totalOtherFees.toLocaleString() }} TND</p>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
        <p class="text-sm text-green-100 mb-1">Net &agrave; Recevoir</p>
        <p class="text-2xl font-bold">{{ manifestStats.netToReceive.toLocaleString() }} TND</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-red-200 dark:border-red-800">
        <p class="text-sm text-gray-500 mb-1">En retard (+7j)</p>
        <p class="text-2xl font-bold text-red-600">{{ manifestStats.overdueAmount.toLocaleString() }} TND</p>
        <p class="text-xs text-red-500">{{ manifestStats.overdueCount }} colis</p>
      </div>
    </div>

    <!-- Grouped by Carrier -->
    <div v-for="carrier in filteredManifestByCarrier" :key="carrier.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <Truck class="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h3>
              <p class="text-sm text-gray-500">{{ carrier.shipments.length }} colis &middot; &Eacute;ch&eacute;ance: {{ carrier.dueDate }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-6">
            <div class="text-right">
              <p class="text-sm text-gray-500">COD Collect&eacute;</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.totalCOD.toLocaleString() }} TND</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Frais Total</p>
              <p class="text-lg font-semibold text-red-600">-{{ carrier.totalFees.toLocaleString() }} TND</p>
            </div>
            <div class="text-right bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
              <p class="text-sm text-green-600">Net &agrave; recevoir</p>
              <p class="text-xl font-bold text-green-600">{{ carrier.netAmount.toLocaleString() }} TND</p>
            </div>
            <button v-if="carrier.isOverdue" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">Relancer</button>
          </div>
        </div>
      </div>
      <div class="table-responsive">
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
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="shipment in carrier.shipments" :key="shipment.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
              <td class="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white" data-label="N&deg; Tracking">{{ shipment.tracking }}</td>
              <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300" data-label="Client">{{ shipment.client }}</td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400" data-label="Destination">{{ shipment.destination }}</td>
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400" data-label="Date Livraison">{{ shipment.deliveryDate }}</td>
              <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white" data-label="COD">{{ shipment.cod.toLocaleString() }} TND</td>
              <td class="px-4 py-2.5 text-right text-red-600" data-label="Frais Livr.">-{{ shipment.deliveryFee.toLocaleString() }} TND</td>
              <td class="px-4 py-2.5 text-right text-red-600" data-label="Autres Frais">{{ shipment.otherFees > 0 ? '-' + shipment.otherFees.toLocaleString() : '0' }} TND</td>
              <td class="px-4 py-2.5 text-right font-semibold text-green-600" data-label="Net">{{ shipment.net.toLocaleString() }} TND</td>
              <td class="px-4 py-2.5 text-center" data-label="Statut">
                <span :class="[
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  shipment.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                  shipment.paymentStatus === 'overdue' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                ]">
                  {{ shipment.paymentStatus === 'paid' ? 'Pay\u00e9' : shipment.paymentStatus === 'overdue' ? 'En retard' : 'En attente' }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 dark:bg-gray-800 font-semibold">
            <tr>
              <td colspan="4" class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">TOTAL {{ carrier.name }}</td>
              <td class="px-4 py-3 text-right text-gray-900 dark:text-white">{{ carrier.totalCOD.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-right text-red-600">-{{ carrier.totalDeliveryFees.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-right text-red-600">-{{ carrier.totalOtherFees.toLocaleString() }} TND</td>
              <td class="px-4 py-3 text-right text-green-600">{{ carrier.netAmount.toLocaleString() }} TND</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredManifestByCarrier.length === 0" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
      <Package class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">Aucun paiement en attente</p>
    </div>
  </main>

  <!-- Payment Reconciliation Modal -->
  <Teleport to="body">
    <div v-if="showReconciliationModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close-reconciliation')"></div>
      <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">V&eacute;rification des paiements</h2>
            <p class="text-sm text-gray-500">R&eacute;conciliez vos paiements avec vos relev&eacute;s</p>
          </div>
          <button @click="$emit('close-reconciliation')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><X class="w-5 h-5 text-gray-500" /></button>
        </div>
        <div class="flex border-b border-gray-200 dark:border-gray-800">
          <button @click="$emit('update:reconciliationTab', 'bank')" :class="['flex-1 px-4 py-3 text-sm font-medium transition-colors', reconciliationActiveTab === 'bank' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700']">Relev&eacute; bancaire</button>
          <button @click="$emit('update:reconciliationTab', 'manual')" :class="['flex-1 px-4 py-3 text-sm font-medium transition-colors', reconciliationActiveTab === 'manual' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700']">Saisie manuelle</button>
          <button @click="$emit('update:reconciliationTab', 'results')" :class="['flex-1 px-4 py-3 text-sm font-medium transition-colors', reconciliationActiveTab === 'results' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700']">
            R&eacute;sultats
            <span v-if="matchingResults.length > 0" class="ml-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">{{ matchingResults.length }}</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-5">
          <!-- Bank Tab -->
          <div v-if="reconciliationActiveTab === 'bank'" class="space-y-5">
            <div class="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <Upload class="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Importer un relev&eacute; bancaire (CSV, Excel)</p>
              <label class="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Upload class="w-4 h-4" /><span>Choisir un fichier</span>
                <input type="file" accept=".csv,.xlsx" class="hidden" @change="$emit('bank-file-upload', $event)" />
              </label>
              <p v-if="bankTransactionsFile" class="mt-2 text-sm text-green-600">{{ bankTransactionsFile.name }}</p>
            </div>
            <div v-if="bankTransactions.length > 0" class="space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Transactions ({{ bankTransactions.length }})</p>
                <button @click="$emit('run-auto-matching')" class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">Lancer le rapprochement</button>
              </div>
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                <div v-for="tx in bankTransactions" :key="tx.id" class="p-3 flex items-center justify-between">
                  <div><p class="text-sm text-gray-900 dark:text-white">{{ tx.description }}</p><p class="text-xs text-gray-500">{{ tx.date }}</p></div>
                  <div class="text-right"><p class="text-sm font-medium text-green-600">+{{ tx.amount.toLocaleString() }} TND</p><span v-if="tx.matched" class="text-xs text-green-600">Rapproch&eacute;</span></div>
                </div>
              </div>
            </div>
          </div>
          <!-- Manual Tab -->
          <div v-if="reconciliationActiveTab === 'manual'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transporteur</label>
                <select :value="manualPaymentData.carrierId" @change="$emit('update:manualPaymentField', 'carrierId', ($event.target as HTMLSelectElement).value)" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                  <option value="">S&eacute;lectionner...</option>
                  <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant re&ccedil;u (TND)</label>
                <input type="number" :value="manualPaymentData.amount" @input="$emit('update:manualPaymentField', 'amount', Number(($event.target as HTMLInputElement).value))" placeholder="0.00" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" :value="manualPaymentData.date" @input="$emit('update:manualPaymentField', 'date', ($event.target as HTMLInputElement).value)" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">R&eacute;f&eacute;rence</label>
                <input type="text" :value="manualPaymentData.reference" @input="$emit('update:manualPaymentField', 'reference', ($event.target as HTMLInputElement).value)" placeholder="Ex: VIR-2026-001" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
            </div>
            <div v-if="manualPaymentData.carrierId" class="space-y-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Paiements attendus</p>
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                <div v-for="carrier in manifestByCarrier.filter(c => c.id === manualPaymentData.carrierId)" :key="carrier.id" class="p-3 flex items-center justify-between">
                  <div><p class="text-sm text-gray-900 dark:text-white">{{ carrier.name }}</p><p class="text-xs text-gray-500">{{ carrier.shipments.length }} colis</p></div>
                  <p :class="['text-sm font-medium', manualPaymentData.amount && Math.abs(carrier.netAmount - manualPaymentData.amount) < 10 ? 'text-green-600' : 'text-gray-900 dark:text-white']">{{ carrier.netAmount.toLocaleString() }} TND</p>
                </div>
              </div>
            </div>
            <button @click="$emit('submit-manual-payment')" :disabled="!manualPaymentData.carrierId || !manualPaymentData.amount" :class="['w-full py-2.5 rounded-lg text-sm font-medium transition-colors', manualPaymentData.carrierId && manualPaymentData.amount ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed']">Enregistrer le paiement</button>
          </div>
          <!-- Results Tab -->
          <div v-if="reconciliationActiveTab === 'results'" class="space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"><p class="text-xl font-bold text-green-600">{{ matchingStats.totalMatched }}</p><p class="text-xs text-gray-500">Rapproch&eacute;s</p></div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"><p class="text-xl font-bold text-orange-600">{{ matchingStats.totalUnmatched }}</p><p class="text-xs text-gray-500">Non rapproch&eacute;s</p></div>
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"><p class="text-xl font-bold text-gray-900 dark:text-white">{{ matchingStats.totalExpected }}</p><p class="text-xs text-gray-500">Total</p></div>
            </div>
            <div v-if="matchingResults.length > 0" class="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="result in matchingResults" :key="result.carrier.id" class="p-3 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div :class="['w-8 h-8 rounded-full flex items-center justify-center', result.status === 'matched' ? 'bg-green-100 dark:bg-green-900/30' : result.status === 'confirmed' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-orange-100 dark:bg-orange-900/30']">
                    <CheckCircle :class="['w-4 h-4', result.status === 'matched' ? 'text-green-600' : result.status === 'confirmed' ? 'text-gray-400' : 'text-orange-600']" />
                  </div>
                  <div><p class="text-sm font-medium text-gray-900 dark:text-white">{{ result.carrier.name }}</p><p class="text-xs text-gray-500">{{ result.carrier.shipments.length }} colis</p></div>
                </div>
                <div class="flex items-center space-x-3">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ result.carrier.netAmount.toLocaleString() }} TND</p>
                  <button v-if="result.status === 'matched'" @click="$emit('confirm-matched', result)" class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors">Confirmer</button>
                  <span v-else-if="result.status === 'confirmed'" class="text-xs text-gray-400">Confirm&eacute;</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8"><Search class="w-10 h-10 text-gray-300 mx-auto mb-3" /><p class="text-sm text-gray-500">Importez un relev&eacute; pour commencer</p></div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end">
          <button @click="$emit('close-reconciliation')" class="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ListFilter,
  CheckCircle,
  FileDown,
  Truck,
  Package,
  X,
  Upload,
  Search
} from 'lucide-vue-next'

interface ManifestStats {
  totalCOD: number
  totalDeliveryFees: number
  totalOtherFees: number
  netToReceive: number
  overdueAmount: number
  overdueCount: number
}

interface ManualPaymentData {
  carrierId: string
  amount: number | null
  date: string
  reference: string
}

interface MatchingStats {
  totalExpected: number
  totalMatched: number
  totalUnmatched: number
  matchedAmount: number
  unmatchedAmount: number
}

interface Props {
  carrierFilter: string
  statusFilter: string
  carriersList: { id: string; name: string }[]
  manifestStats: ManifestStats
  filteredManifestByCarrier: any[]
  manifestByCarrier: any[]
  showReconciliationModal: boolean
  reconciliationActiveTab: string
  bankTransactionsFile: File | null
  bankTransactions: any[]
  manualPaymentData: ManualPaymentData
  matchingResults: any[]
  matchingStats: MatchingStats
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'update:carrierFilter': [value: string]
  'update:statusFilter': [value: string]
  'show-reconciliation': []
  'close-reconciliation': []
  'update:reconciliationTab': [tab: string]
  'bank-file-upload': [event: Event]
  'run-auto-matching': []
  'update:manualPaymentField': [field: string, value: string | number]
  'submit-manual-payment': []
  'confirm-matched': [result: any]
}>()
</script>

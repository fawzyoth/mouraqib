<template>
  <!-- Finance: Expected Payments -->
  <ExpectedPayments
    v-if="activeSection === 'expected-payments'"
    :carrier-filter="expectedPaymentsCarrierFilter"
    :status-filter="expectedPaymentsStatusFilter"
    :carriers-list="carriersList"
    :manifest-stats="manifestStats"
    :filtered-manifest-by-carrier="filteredManifestByCarrier"
    :manifest-by-carrier="manifestByCarrier"
    :show-reconciliation-modal="showReconciliationModal"
    :reconciliation-active-tab="reconciliationActiveTab"
    :bank-transactions-file="bankTransactionsFile"
    :bank-transactions="bankTransactions"
    :manual-payment-data="manualPaymentData"
    :matching-results="matchingResults"
    :matching-stats="matchingStats"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @update:carrierFilter="expectedPaymentsCarrierFilter = $event"
    @update:statusFilter="expectedPaymentsStatusFilter = $event"
    @show-reconciliation="showReconciliationModal = true"
    @close-reconciliation="closeReconciliationModal"
    @update:reconciliationTab="reconciliationActiveTab = $event"
    @bank-file-upload="handleBankFileUpload"
    @run-auto-matching="runAutoMatching"
    @update:manualPaymentField="(field: string, value: any) => ((manualPaymentData as any)[field] = value)"
    @submit-manual-payment="submitManualPayment"
    @confirm-matched="confirmMatchedPayment"
  />

  <!-- Finance: Received Payments -->
  <ReceivedPayments
    v-else-if="activeSection === 'received-payments'"
    :filtered-payments="filteredReceivedPayments"
    :carriers-list="carriersList"
    :stats="receivedPaymentsStats"
    :month="receivedPaymentsMonth"
    :carrier-filter="receivedPaymentsCarrierFilter"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @update:month="receivedPaymentsMonth = $event"
    @update:carrierFilter="receivedPaymentsCarrierFilter = $event"
    @toggle-expanded="toggleReceivedPaymentExpanded"
  />

  <!-- Finance: Payment Discrepancies -->
  <PaymentDiscrepancies
    v-else-if="activeSection === 'payment-discrepancies'"
    :stats="discrepancyStats"
    :carrier-filter="discrepancyCarrierFilter"
    :discrepancy-filter="discrepancyFilter"
    :carriers-list="carriersList"
    :reconciliation-by-carrier="reconciliationByCarrier"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @update:carrierFilter="discrepancyCarrierFilter = $event"
    @update:discrepancyFilter="discrepancyFilter = $event"
  />

  <!-- Finance: Revenue -->
  <Revenue
    v-else-if="activeSection === 'revenue'"
    :period="revenuePeriod"
    :stats="revenueStats"
    :by-category="revenueByCategory"
    :by-region="revenueByRegion"
    :chart-data="revenueChartData"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @update:period="revenuePeriod = $event"
  />

  <!-- Finance: Return Losses -->
  <ReturnLosses
    v-else-if="activeSection === 'return-losses'"
    :month="returnLossesMonth"
    :stats="returnLossesStats"
    :by-reason="returnLossesByReason"
    :by-carrier="returnLossesByCarrier"
    :details="returnLossesDetails"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @update:month="returnLossesMonth = $event"
  />

  <!-- Finance: Invoices -->
  <Invoices
    v-else-if="activeSection === 'invoices'"
    :invoices-tab="invoicesTab"
    :stats="invoicesStats"
    :filtered-invoices="filteredInvoices"
    :search="invoiceSearch"
    :status-filter="invoiceStatusFilter"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @update:invoices-tab="invoicesTab = $event"
    @update:search="invoiceSearch = $event"
    @update:statusFilter="invoiceStatusFilter = $event"
  />

  <!-- Finance: Exports -->
  <Exports
    v-else-if="activeSection === 'exports'"
    :config="exportConfig"
    :recent-exports="recentExports"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @update:configField="(field: string, value: any) => { (exportConfig as any)[field] = value }"
  />
</template>

<script setup lang="ts">
import { computed, ref, reactive, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

// Feature components
import ExpectedPayments from '@/components/features/finance/ExpectedPayments.vue'
import ReceivedPayments from '@/components/features/finance/ReceivedPayments.vue'
import PaymentDiscrepancies from '@/components/features/finance/PaymentDiscrepancies.vue'
import Revenue from '@/components/features/finance/Revenue.vue'
import ReturnLosses from '@/components/features/finance/ReturnLosses.vue'
import Invoices from '@/components/features/finance/Invoices.vue'
import Exports from '@/components/features/finance/Exports.vue'

const route = useRoute()
const appStore = useAppStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

// Shared carrier list
const carriersList = ref<any[]>([])

// Expected Payments
const expectedPaymentsCarrierFilter = ref('all')
const expectedPaymentsStatusFilter = ref('all')
const manifestStats = ref({ total: 0, pending: 0, confirmed: 0, amount: 0 })
const filteredManifestByCarrier = ref<any[]>([])
const manifestByCarrier = ref<any[]>([])
const showReconciliationModal = ref(false)
const reconciliationActiveTab = ref('auto')
const bankTransactionsFile = ref<any>(null)
const bankTransactions = ref<any[]>([])
const manualPaymentData = reactive({
  carrier: '',
  amount: 0,
  reference: '',
  date: '',
})
const matchingResults = ref<any[]>([])
const matchingStats = ref({ matched: 0, unmatched: 0, total: 0 })

function closeReconciliationModal() { showReconciliationModal.value = false }
function handleBankFileUpload(_file: any) { /* stub */ }
function runAutoMatching() { /* stub */ }
function submitManualPayment() { /* stub */ }
function confirmMatchedPayment(_payment: any) { /* stub */ }

// Received Payments
const filteredReceivedPayments = ref<any[]>([])
const receivedPaymentsStats = ref({ total: 0, amount: 0 })
const receivedPaymentsMonth = ref('')
const receivedPaymentsCarrierFilter = ref('all')

function toggleReceivedPaymentExpanded(_paymentId: string) { /* stub */ }

// Payment Discrepancies
const discrepancyStats = ref({ total: 0, resolved: 0, pending: 0, amount: 0 })
const discrepancyCarrierFilter = ref('all')
const discrepancyFilter = ref('all')
const reconciliationByCarrier = ref<any[]>([])

// Revenue
const revenuePeriod = ref('month')
const revenueStats = ref({ total: 0, growth: 0 })
const revenueByCategory = ref<any[]>([])
const revenueByRegion = ref<any[]>([])
const revenueChartData = ref<any[]>([])

// Return Losses
const returnLossesMonth = ref('')
const returnLossesStats = ref({ total: 0, amount: 0 })
const returnLossesByReason = ref<any[]>([])
const returnLossesByCarrier = ref<any[]>([])
const returnLossesDetails = ref<any[]>([])

// Invoices
const invoicesTab = ref('all')
const invoicesStats = ref({ total: 0, paid: 0, pending: 0, overdue: 0 })
const filteredInvoices = ref<any[]>([])
const invoiceSearch = ref('')
const invoiceStatusFilter = ref('all')

// Exports
const exportConfig = reactive({
  format: 'csv',
  dateRange: 'month',
  includeHeaders: true,
})
const recentExports = ref<any[]>([])
</script>

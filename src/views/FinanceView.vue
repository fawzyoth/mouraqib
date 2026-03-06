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
import { computed, ref, reactive, inject, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { carrierPaymentsService } from '@/services/carrierPayments'
import { parseBankFile } from '@/utils/bankFileParser'
import type { BankTransaction } from '@/utils/bankFileParser'
import { markRaw } from 'vue'
import { UserX, Ban, MapPinOff, PackageX } from 'lucide-vue-next'
import {
  demoCarriers
} from '@/data/demo/carriers'
import {
  demoReceivedPaymentsData, demoReceivedPaymentsStats,
  demoDiscrepancyStats, demoReconciliationByCarrier,
  demoRevenueStats, demoRevenueByCategory, demoRevenueByRegion, demoRevenueChartData,
  demoReturnLossesStats, demoReturnLossesByReason, demoReturnLossesByCarrier,
  demoReturnLossesDetails, demoInvoicesStats, demoInvoices
} from '@/data/demo/finance'

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
const authStore = useAuthStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

// Shared carrier list — reactively derived from appStore.carriers
const carriersList = computed(() => {
  if (authStore.isDemoMode) {
    return demoCarriers.map(c => ({ id: c.id, name: c.name }))
  }
  return appStore.carriers.map((c: any) => ({ id: c.id, name: c.name }))
})

// Expected Payments
const expectedPaymentsCarrierFilter = ref('all')
const expectedPaymentsStatusFilter = ref('all')
const showReconciliationModal = ref(false)
const reconciliationActiveTab = ref('auto')
const bankTransactionsFile = ref<any>(null)
const bankTransactions = ref<any[]>([])
const manualPaymentData = reactive({
  carrierId: '',
  amount: 0,
  reference: '',
  date: '',
})
const matchingResults = ref<any[]>([])
const matchingStats = ref({ totalMatched: 0, totalUnmatched: 0, totalExpected: 0, matchedAmount: 0, unmatchedAmount: 0 })

// Track carriers that have been manually confirmed as paid (local UI state)
const paidCarrierIds = ref<Set<string>>(new Set())

// ---------------------------------------------------------------------------
// manifestByCarrier — group delivered shipments by carrier for expected payments
// ---------------------------------------------------------------------------
const manifestByCarrier = computed(() => {
  const shipments = appStore.shipments.filter((s: any) => s.status === 'Livré')
  const result = buildManifestByCarrier(shipments)

  // Apply local paid overrides
  for (const carrier of result) {
    if (paidCarrierIds.value.has(carrier.id)) {
      carrier.shipments.forEach((s: any) => { s.paymentStatus = 'paid' })
    }
  }

  return result
})

function buildManifestByCarrier(deliveredShipments: any[]) {
  const carrierMap = new Map<string, any>()
  const OVERDUE_DAYS = 7

  for (const s of deliveredShipments) {
    const carrierId = s.carrierId || s.carrier_id || ''
    const carrierName = s.carrierName || s.carrier || ''
    if (!carrierId && !carrierName) continue

    const key = carrierId || carrierName
    if (!carrierMap.has(key)) {
      carrierMap.set(key, {
        id: carrierId,
        name: carrierName,
        shipments: [],
        totalCOD: 0,
        totalDeliveryFees: 0,
        totalOtherFees: 0,
        totalFees: 0,
        netAmount: 0,
        dueDate: '',
        isOverdue: false,
      })
    }

    const entry = carrierMap.get(key)!
    const cod = s.codAmount || s.cod_amount || s.totalPrice || 0
    const deliveryFee = s.deliveryFee || s.delivery_fee || 0
    const otherFees = s.otherFees || s.other_fees || 0
    const net = cod - deliveryFee - otherFees

    // Check overdue: delivered more than 7 days ago and not yet paid
    const deliveryDate = s.deliveryDate || s.delivery_date || s.updatedAt || ''
    const daysSinceDelivery = deliveryDate
      ? Math.floor((Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    const isOverdue = daysSinceDelivery > OVERDUE_DAYS
    const paymentStatus = s.paymentStatus || (isOverdue ? 'overdue' : 'pending')

    entry.shipments.push({
      id: s.id,
      tracking: s.trackingNumber || s.tracking_number || '',
      client: s.recipientName || s.recipient_name || '',
      destination: s.destination || s.recipientCity || '',
      deliveryDate: deliveryDate
        ? new Date(deliveryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        : '',
      cod,
      deliveryFee,
      otherFees,
      net,
      paymentStatus,
    })

    entry.totalCOD += cod
    entry.totalDeliveryFees += deliveryFee
    entry.totalOtherFees += otherFees
    entry.totalFees += deliveryFee + otherFees
    entry.netAmount += net
    if (isOverdue) entry.isOverdue = true
  }

  // Set due dates (7 days after latest delivery in group)
  for (const entry of carrierMap.values()) {
    const dates = entry.shipments
      .map((s: any) => s.deliveryDate)
      .filter(Boolean)
    if (dates.length > 0) {
      entry.dueDate = dates[dates.length - 1]
    }
  }

  return Array.from(carrierMap.values())
}

// ---------------------------------------------------------------------------
// manifestStats — summary stats for expected payments
// ---------------------------------------------------------------------------
const manifestStats = computed(() => {
  const carriers = manifestByCarrier.value
  let totalCOD = 0
  let totalDeliveryFees = 0
  let totalOtherFees = 0
  let netToReceive = 0
  let overdueAmount = 0
  let overdueCount = 0

  for (const c of carriers) {
    totalCOD += c.totalCOD
    totalDeliveryFees += c.totalDeliveryFees
    totalOtherFees += c.totalOtherFees
    netToReceive += c.netAmount
    for (const s of c.shipments) {
      if (s.paymentStatus === 'overdue') {
        overdueAmount += s.net
        overdueCount++
      }
    }
  }

  return { totalCOD, totalDeliveryFees, totalOtherFees, netToReceive, overdueAmount, overdueCount }
})

// ---------------------------------------------------------------------------
// filteredManifestByCarrier — apply carrier + status filters
// ---------------------------------------------------------------------------
const filteredManifestByCarrier = computed(() => {
  let result = manifestByCarrier.value

  if (expectedPaymentsCarrierFilter.value !== 'all') {
    result = result.filter(c => c.id === expectedPaymentsCarrierFilter.value)
  }

  if (expectedPaymentsStatusFilter.value !== 'all') {
    result = result
      .map(c => ({
        ...c,
        shipments: c.shipments.filter((s: any) => s.paymentStatus === expectedPaymentsStatusFilter.value),
      }))
      .filter(c => c.shipments.length > 0)
  }

  return result
})

function closeReconciliationModal() { showReconciliationModal.value = false }
async function handleBankFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  try {
    const result = await parseBankFile(file)
    bankTransactionsFile.value = file
    bankTransactions.value = result.transactions
  } catch (error) {
    console.error('Failed to parse bank file:', error)
  }
}

function runAutoMatching() {
  const transactions = bankTransactions.value as BankTransaction[]
  const carriers = manifestByCarrier.value as any[]

  if (transactions.length === 0 || carriers.length === 0) return

  // Amount tolerance for fuzzy matching (absolute difference in TND)
  const AMOUNT_TOLERANCE = 5

  const results: any[] = []
  let totalMatchedAmount = 0
  let totalUnmatchedAmount = 0

  for (const carrier of carriers) {
    const carrierNet: number = carrier.netAmount ?? 0
    const carrierRef: string = (carrier.reference ?? carrier.name ?? '').toLowerCase().trim()

    let bestMatch: BankTransaction | null = null
    let matchType: 'reference' | 'amount' | null = null

    // First pass: try exact reference match
    for (const tx of transactions) {
      if (tx.matched) continue
      const txRef = tx.reference.toLowerCase().trim()
      const txDesc = tx.description.toLowerCase().trim()

      if (
        txRef && carrierRef &&
        (txRef.includes(carrierRef) || carrierRef.includes(txRef) ||
         txDesc.includes(carrierRef) || carrierRef.includes(txDesc))
      ) {
        bestMatch = tx
        matchType = 'reference'
        break
      }
    }

    // Second pass: try fuzzy amount match if no reference match found
    if (!bestMatch) {
      let closestDelta = Infinity

      for (const tx of transactions) {
        if (tx.matched) continue
        const delta = Math.abs(tx.amount - carrierNet)
        if (delta <= AMOUNT_TOLERANCE && delta < closestDelta) {
          closestDelta = delta
          bestMatch = tx
          matchType = 'amount'
        }
      }
    }

    if (bestMatch && matchType) {
      bestMatch.matched = true
      totalMatchedAmount += carrierNet
      results.push({
        carrier,
        transaction: bestMatch,
        matchType,
        delta: Math.abs(bestMatch.amount - carrierNet),
        status: 'matched',
      })
    } else {
      totalUnmatchedAmount += carrierNet
      results.push({
        carrier,
        transaction: null,
        matchType: null,
        delta: null,
        status: 'unmatched',
      })
    }
  }

  matchingResults.value = results.filter((r) => r.status === 'matched')
  matchingStats.value = {
    totalMatched: results.filter((r) => r.status === 'matched').length,
    totalUnmatched: results.filter((r) => r.status === 'unmatched').length,
    totalExpected: carriers.length,
    matchedAmount: totalMatchedAmount,
    unmatchedAmount: totalUnmatchedAmount,
  }
}
async function submitManualPayment() {
  // Validate required fields
  if (!manualPaymentData.carrierId || !manualPaymentData.amount || !manualPaymentData.reference || !manualPaymentData.date) {
    return
  }

  const orgId = appStore.orgId
  if (!orgId) return

  // Find the carrier entry to get COD / fee totals for the payment record
  const carrierEntry = manifestByCarrier.value.find(
    (c: any) => c.id === manualPaymentData.carrierId,
  )

  try {
    await carrierPaymentsService.create({
      organization_id: orgId,
      carrier_id: manualPaymentData.carrierId,
      reference: manualPaymentData.reference,
      payment_date: manualPaymentData.date,
      total_cod: carrierEntry?.totalCOD ?? 0,
      total_fees: carrierEntry?.totalFees ?? 0,
      net_received: manualPaymentData.amount,
      status: 'confirmed',
    })

    // Mark this carrier as paid (triggers computed re-evaluation)
    paidCarrierIds.value = new Set([...paidCarrierIds.value, manualPaymentData.carrierId])

    // Reset the form
    manualPaymentData.carrierId = ''
    manualPaymentData.amount = 0
    manualPaymentData.reference = ''
    manualPaymentData.date = ''
  } catch (error) {
    console.error('Failed to submit manual payment:', error)
  }
}
async function confirmMatchedPayment(_payment: any) {
  try {
    await carrierPaymentsService.updateStatus(_payment.carrier.id, 'confirmed')

    // Remove the confirmed result from matchingResults
    matchingResults.value = matchingResults.value.filter(
      (r: any) => r.carrier.id !== _payment.carrier.id
    )

    // Update matchingStats counts
    const stats = matchingStats.value
    stats.totalMatched = Math.max(0, stats.totalMatched - 1)

    // Mark this carrier as paid (triggers computed re-evaluation)
    paidCarrierIds.value = new Set([...paidCarrierIds.value, _payment.carrier.id])
  } catch (error) {
    console.error('Failed to confirm matched payment:', error)
  }
}

// ---------------------------------------------------------------------------
// Received Payments
// ---------------------------------------------------------------------------
const receivedPaymentsMonth = ref('')
const receivedPaymentsCarrierFilter = ref('all')

// All received payments data source
const allReceivedPayments = ref<any[]>([])

// Populate source data reactively
watchEffect(() => {
  if (authStore.isDemoMode) {
    allReceivedPayments.value = demoReceivedPaymentsData.map(p => ({
      ...p,
      totalDeliveryFees: p.shipments.reduce((sum: number, s: any) => sum + (s.fee || 0), 0),
      totalOtherFees: 0,
      codFees: Math.round(p.totalCOD * 0.01),
      codFeePercent: 1,
      returnFees: 0,
      returnCount: 0,
      tva: Math.round(p.totalFees * 0.19),
    }))
  } else {
    // Live mode: derive from carrierPaymentsService data loaded into appStore
    const payments = appStore.payments as any[]
    allReceivedPayments.value = payments
      .filter((p: any) => p.status === 'paid')
      .map((p: any) => ({
        id: p.id,
        carrier: p.carrier?.name || p.description || '',
        reference: p.reference || '',
        paymentDate: p.date || '',
        totalCOD: p.amount || 0,
        totalFees: 0,
        netReceived: p.amount || 0,
        expanded: false,
        shipments: [],
        totalDeliveryFees: 0,
        totalOtherFees: 0,
        codFees: 0,
        codFeePercent: 0,
        returnFees: 0,
        returnCount: 0,
        tva: 0,
      }))
  }
})

// Filtered received payments (by month and carrier)
const filteredReceivedPayments = computed(() => {
  let result = allReceivedPayments.value
  if (receivedPaymentsCarrierFilter.value !== 'all') {
    result = result.filter(p => {
      const carrierEntry = carriersList.value.find(c => c.id === receivedPaymentsCarrierFilter.value)
      return carrierEntry ? p.carrier === carrierEntry.name : false
    })
  }
  // Month filter is informational; demo data uses fixed dates
  return result
})

// Received payments stats
const receivedPaymentsStats = computed(() => {
  if (authStore.isDemoMode) {
    return demoReceivedPaymentsStats
  }
  const payments = filteredReceivedPayments.value
  const totalReceived = payments.reduce((sum, p) => sum + (p.netReceived || 0), 0)
  const totalCOD = payments.reduce((sum, p) => sum + (p.totalCOD || 0), 0)
  const totalFees = payments.reduce((sum, p) => sum + (p.totalFees || 0), 0)
  const shipmentsCount = payments.reduce((sum, p) => sum + (p.shipments?.length || 0), 0)
  return { totalReceived, totalCOD, totalFees, paymentsCount: payments.length, shipmentsCount }
})

async function toggleReceivedPaymentExpanded(_paymentId: string) {
  const payment = filteredReceivedPayments.value.find((p: any) => p.id === _paymentId)
  if (!payment) return

  payment.expanded = !payment.expanded

  // Lazy-load shipment details if expanding and not yet loaded (live mode only)
  if (payment.expanded && (!payment.shipments || payment.shipments.length === 0) && !authStore.isDemoMode) {
    try {
      const shipments = await carrierPaymentsService.getShipments(_paymentId)
      payment.shipments = shipments.map((s: any) => ({
        id: s.shipment?.id ?? s.id,
        tracking: s.shipment?.tracking_number ?? '',
        client: s.shipment?.recipient_name ?? '',
        destination: s.shipment?.destination ?? '',
        deliveryDate: s.shipment?.delivery_date ?? '',
        cod: s.shipment?.cod_amount ?? 0,
        deliveryFee: s.shipment?.delivery_fee ?? 0,
        otherFees: s.other_fees ?? 0,
        net: (s.shipment?.cod_amount ?? 0) - (s.shipment?.delivery_fee ?? 0) - (s.other_fees ?? 0),
      }))
    } catch (error) {
      console.error('Failed to load payment shipments:', error)
    }
  }
}

// ---------------------------------------------------------------------------
// Payment Discrepancies
// ---------------------------------------------------------------------------
const discrepancyCarrierFilter = ref('all')
const discrepancyFilter = ref('all')

const discrepancyStats = computed(() => {
  if (authStore.isDemoMode) {
    return demoDiscrepancyStats
  }
  // Live mode: compute from reconciliation data
  const carriers = reconciliationByCarrier.value
  const ourTotal = carriers.reduce((sum, c) => sum + (c.ourCalculation || 0), 0)
  const theirTotal = carriers.reduce((sum, c) => sum + (c.theirPayment || 0), 0)
  const totalDifference = ourTotal - theirTotal
  const differencePercent = ourTotal > 0 ? Math.round((totalDifference / ourTotal) * 1000) / 10 : 0
  const allDiscrepancies = carriers.flatMap(c => c.discrepancies || [])
  const pendingCount = allDiscrepancies.filter(d => d.status === 'pending').length
  const totalPending = allDiscrepancies.filter(d => d.status === 'pending').reduce((sum, d) => sum + (d.difference || 0), 0)
  const unexpectedFees = 0
  const unexpectedFeesCount = 0
  const recovered = allDiscrepancies.filter(d => d.status === 'resolved').reduce((sum, d) => sum + (d.difference || 0), 0)
  return { ourTotal, theirTotal, totalDifference, differencePercent, totalPending, pendingCount, unexpectedFees, unexpectedFeesCount, recovered }
})

const reconciliationByCarrier = computed(() => {
  if (authStore.isDemoMode) {
    // Transform demo data to match the expected shape for PaymentDiscrepancies template
    return demoReconciliationByCarrier.map(c => ({
      id: c.id,
      name: c.name,
      ourCalculation: c.ourTotal,
      theirPayment: c.theirTotal,
      totalDifference: c.difference,
      shipmentsWithDiscrepancy: c.shipments.filter(s => s.difference !== 0).length,
      totalShipments: c.shipments.length,
      discrepancies: c.shipments.map((s, idx) => ({
        id: idx,
        tracking: s.tracking,
        client: '',
        codCollected: s.ourAmount,
        ourNet: s.ourAmount,
        theirNet: s.theirAmount,
        difference: s.difference,
        carrierReason: s.difference > 0 ? 'Frais supplémentaires' : '',
        status: s.status,
      })),
      fees: {
        deliveryExpected: Math.round(c.ourTotal * 0.06),
        deliveryActual: Math.round(c.theirTotal * 0.06 + c.difference * 0.3),
        codExpected: Math.round(c.ourTotal * 0.01),
        codActual: Math.round(c.ourTotal * 0.01),
        returnExpected: 0,
        returnActual: 0,
        otherExpected: 0,
        otherActual: Math.round(c.difference * 0.2),
      },
    }))
  }
  // Live mode: would be built from comparing expected vs actual carrier payments
  return []
})

// ---------------------------------------------------------------------------
// Revenue
// ---------------------------------------------------------------------------
const revenuePeriod = ref('month')

const revenueStats = computed(() => {
  if (authStore.isDemoMode) {
    return demoRevenueStats
  }
  const shipments = appStore.shipments
  const delivered = shipments.filter((s: any) => s.status === 'Livré')
  const grossRevenue = delivered.reduce((sum, s: any) => sum + (s.totalPrice || s.codAmount || 0), 0)
  const shippingCosts = delivered.reduce((sum, s: any) => sum + (s.deliveryFee || 0), 0)
  const netRevenue = grossRevenue - shippingCosts
  const marginPercent = grossRevenue > 0 ? Math.round((netRevenue / grossRevenue) * 1000) / 10 : 0
  const avgOrderValue = delivered.length > 0 ? Math.round(grossRevenue / delivered.length) : 0
  return { grossRevenue, netRevenue, marginPercent, shippingCosts, avgOrderValue, grossGrowth: 0 }
})

const revenueByCategory = computed(() => {
  if (authStore.isDemoMode) {
    // Add percent field expected by template
    return demoRevenueByCategory.map(c => ({
      ...c,
      percent: c.percentage,
    }))
  }
  return []
})

const revenueByRegion = computed(() => {
  if (authStore.isDemoMode) {
    const total = demoRevenueByRegion.reduce((sum, r) => sum + r.amount, 0)
    return demoRevenueByRegion.map(r => ({
      ...r,
      percent: total > 0 ? Math.round((r.amount / total) * 100) : 0,
    }))
  }
  // Live mode: group delivered shipments by destination
  const delivered = appStore.shipments.filter((s: any) => s.status === 'Livré')
  const regionMap = new Map<string, { amount: number; orders: number }>()
  for (const s of delivered) {
    const region = (s as any).destination || (s as any).recipientCity || 'Autre'
    const entry = regionMap.get(region) || { amount: 0, orders: 0 }
    entry.amount += (s as any).totalPrice || (s as any).codAmount || 0
    entry.orders++
    regionMap.set(region, entry)
  }
  const total = Array.from(regionMap.values()).reduce((sum, r) => sum + r.amount, 0)
  return Array.from(regionMap.entries())
    .map(([name, data]) => ({ name, ...data, percent: total > 0 ? Math.round((data.amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
})

const revenueChartData = computed(() => {
  if (authStore.isDemoMode) {
    return demoRevenueChartData.map(d => ({
      label: d.label,
      gross: d.revenue,
      net: Math.round(d.revenue * 0.88),
    }))
  }
  return []
})

// ---------------------------------------------------------------------------
// Return Losses
// ---------------------------------------------------------------------------
const returnLossesMonth = ref('')

const returnLossesStats = computed(() => {
  if (authStore.isDemoMode) {
    return demoReturnLossesStats
  }
  const shipments = appStore.shipments
  const returnStatuses = new Set([
    'Retour Expéditeur', 'Rtn client/agence', 'Rtn dépôt',
    'Retour reçu', 'Rtn définitif', 'Retour assigné',
    "Retour en cours d'expédition", 'Retour enlevé', 'Retour Annulé',
  ])
  const returned = shipments.filter((s: any) => returnStatuses.has(s.status))
  const lost = shipments.filter((s: any) => s.status === 'Lost')
  const totalLoss = [...returned, ...lost].reduce((sum, s: any) => sum + (s.deliveryFee || 0) + (s.totalPrice || 0) * 0, 0)
  const shippingLoss = [...returned, ...lost].reduce((sum, s: any) => sum + (s.deliveryFee || 0), 0)
  return { totalLoss: shippingLoss, returnedCount: returned.length, lostCount: lost.length, shippingLoss }
})

const returnLossesByReason = computed(() => {
  if (authStore.isDemoMode) {
    const reasonIcons: Record<string, { icon: any; iconColor: string }> = {
      'Client absent': { icon: markRaw(UserX), iconColor: 'text-yellow-600' },
      'Refus client': { icon: markRaw(Ban), iconColor: 'text-red-600' },
      'Adresse incorrecte': { icon: markRaw(MapPinOff), iconColor: 'text-orange-600' },
      'Colis endommagé': { icon: markRaw(PackageX), iconColor: 'text-gray-600' },
    }
    const total = demoReturnLossesByReason.reduce((sum, r) => sum + r.amount, 0)
    return demoReturnLossesByReason.map(r => ({
      ...r,
      icon: reasonIcons[r.name]?.icon || markRaw(PackageX),
      iconColor: reasonIcons[r.name]?.iconColor || 'text-gray-600',
      percent: total > 0 ? Math.round((r.amount / total) * 100) : 0,
    }))
  }
  return []
})

const returnLossesByCarrier = computed(() => {
  if (authStore.isDemoMode) {
    return demoReturnLossesByCarrier.map(c => ({
      ...c,
      returnRate: c.count > 0 ? Math.round((c.count / (c.count + 10)) * 100) : 0,
    }))
  }
  return []
})

const returnLossesDetails = computed(() => {
  if (authStore.isDemoMode) {
    return demoReturnLossesDetails.map(d => ({
      id: d.id,
      reference: d.trackingNumber,
      customer: d.client,
      carrier: d.carrier,
      reason: d.reason === 'Perdu en transit' ? 'Perdu' : d.reason === 'Refus client' ? 'Refusé' : d.reason,
      value: d.originalAmount,
      shippingFee: d.returnFee,
      totalLoss: d.lostAmount,
    }))
  }
  return []
})

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------
const invoicesTab = ref<'received' | 'sent'>('received')
const invoiceSearch = ref('')
const invoiceStatusFilter = ref('all')

// All invoices source
const allInvoices = computed(() => {
  if (authStore.isDemoMode) {
    return demoInvoices
  }
  return appStore.invoices || []
})

const invoicesStats = computed(() => {
  if (authStore.isDemoMode) {
    return demoInvoicesStats
  }
  const invs = allInvoices.value
  const totalInvoices = invs.length
  const pendingAmount = invs.filter((i: any) => i.status === 'pending').reduce((sum, i: any) => sum + (i.amount || 0), 0)
  const paidAmount = invs.filter((i: any) => i.status === 'paid').reduce((sum, i: any) => sum + (i.amount || 0), 0)
  const overdueCount = invs.filter((i: any) => i.status === 'overdue').length
  return { totalInvoices, pendingAmount, paidAmount, overdueCount }
})

const filteredInvoices = computed(() => {
  let result = allInvoices.value as any[]

  // Filter by tab (received vs sent)
  if (invoicesTab.value !== 'all') {
    result = result.filter(i => i.type === invoicesTab.value)
  }

  // Filter by status
  if (invoiceStatusFilter.value !== 'all') {
    result = result.filter(i => i.status === invoiceStatusFilter.value)
  }

  // Filter by search
  if (invoiceSearch.value.trim()) {
    const q = invoiceSearch.value.toLowerCase().trim()
    result = result.filter(i =>
      (i.number || '').toLowerCase().includes(q) ||
      (i.party || '').toLowerCase().includes(q) ||
      (i.reference || '').toLowerCase().includes(q)
    )
  }

  return result
})

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
const exportConfig = reactive({
  dataType: 'all',
  period: 'thisMonth',
  startDate: '',
  endDate: '',
  format: 'csv',
  carrier: 'all',
})

const recentExports = computed(() => {
  // Static demo data for recent exports
  return [
    { id: 1, name: 'Paiements_Fev2026.xlsx', format: 'excel', date: '15 fév. 2026', size: '245 Ko', status: 'ready' },
    { id: 2, name: 'Factures_Fev2026.csv', format: 'csv', date: '12 fév. 2026', size: '128 Ko', status: 'ready' },
    { id: 3, name: 'Rapport_Revenus_Jan2026.pdf', format: 'pdf', date: '01 fév. 2026', size: '1.2 Mo', status: 'ready' },
    { id: 4, name: 'Reconciliation_Fev2026.xlsx', format: 'excel', date: '10 fév. 2026', size: '312 Ko', status: 'ready' },
  ]
})
</script>

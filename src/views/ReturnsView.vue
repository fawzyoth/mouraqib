<template>
  <!-- Returns: Active / Recovered / Lost -->
  <ReturnsList
    v-if="activeSection === 'active-returns' || activeSection === 'recovered-returns' || activeSection === 'lost-returns'"
    :mode="activeSection === 'active-returns' ? 'active' : activeSection === 'recovered-returns' ? 'recovered' : 'lost'"
    :section-title="activeSection === 'active-returns' ? 'Retours actifs' : activeSection === 'recovered-returns' ? 'Retours récupérés' : 'Retours perdus'"
    :filtered-returns="filteredReturns"
    :active-returns-stats="activeReturnsStats"
    :is-syncing-returns="isSyncingReturns"
    :carriers="returnCarriers"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @sync-returns="syncReturns"
    @select-return="handleSelectReturn"
  />

  <!-- Returns: Value -->
  <ReturnValue
    v-else-if="activeSection === 'return-value'"
    :returns-data="returnsData"
    :carriers-return-stats="carriersReturnStats"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Returns: Reports -->
  <ReturnReports
    v-else-if="activeSection === 'return-reports'"
    :report-period="reportPeriod"
    :report-analytics="reportAnalytics"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @update:report-period="reportPeriod = $event"
  />

  <!-- Returns: Stats -->
  <ReturnStats
    v-else-if="activeSection === 'return-stats'"
    :stats-data="returnStatsData"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { shipmentsService } from '@/services/shipments'
import {
  demoReturnsList,
  demoReturnsData,
  demoCarriersReturnStats,
  demoReportAnalytics,
} from '@/data/demo/returns'

// Feature components
import ReturnsList from '@/components/features/returns/ReturnsList.vue'
import ReturnValue from '@/components/features/returns/ReturnValue.vue'
import ReturnReports from '@/components/features/returns/ReturnReports.vue'
import ReturnStats from '@/components/features/returns/ReturnStats.vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))
const openShipmentDetail = inject<((shipment: any) => void) | undefined>('openShipmentDetail')

function handleSelectReturn(ret: any) {
  if (openShipmentDetail) {
    const originalShipment = appStore.shipments.find((s: any) => s.id === ret.id)
    if (originalShipment) {
      openShipmentDetail(originalShipment)
    } else {
      openShipmentDetail(ret)
    }
  }
}

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

// ReturnsList props
const filteredReturns = ref<any[]>([])
const activeReturnsStats = ref({ total: 0, delayed: 0, onTime: 0, delayedPercent: 0, onTimePercent: 0 })
const isSyncingReturns = ref(false)
const returnCarriers = ref<any[]>([])

// ReturnValue props
const returnsData = ref<any>({})
const carriersReturnStats = ref<any[]>([])

// ReturnReports props
const reportPeriod = ref('month')
const reportAnalytics = ref<any>({})

// ReturnStats props
const returnStatsData = ref<any>({ byGovernorate: [], byMonth: [], byCarrier: [] })

// ---------------------------------------------------------------------------
// Filtering helpers
// ---------------------------------------------------------------------------
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
const returnStatuses = new Set([
  'Retour Expéditeur', 'Rtn client/agence',
  'Retour reçu', 'Rtn définitif', 'Retour assigné',
  "Retour en cours d'expédition", 'Retour enlevé', 'Retour Annulé',
])

function populateDemoReturns() {
  const section = activeSection.value
  // Demo: recovered = status 'Récupéré', lost = status 'Perdu', active = 'En transit'
  const all = demoReturnsList.map((r) => ({
    id: r.id,
    trackingNumber: r.trackingNumber,
    status: r.status,
    isDelayed: r.isDelayed,
    daysDelayed: r.daysDelayed,
    originalOrder: r.originalOrder,
    customerName: r.customerName,
    destination: r.destination,
    expectedArrival: r.expectedArrival || '',
    value: r.value,
    inScannedAt: r.status === 'Récupéré' ? r.returnDate : null,
    lastStatusAt: r.returnDate || null,
    lastEventLabel: r.status || null,
    carrier: r.carrier,
    reason: r.reason,
  }))

  if (section === 'recovered-returns') {
    filteredReturns.value = all.filter(r => r.inScannedAt)
  } else if (section === 'lost-returns') {
    filteredReturns.value = all.filter(r => !r.inScannedAt && r.status === 'Perdu')
  } else {
    filteredReturns.value = all.filter(r => !r.inScannedAt && r.status !== 'Perdu')
  }

  updateStats(filteredReturns.value)
}

function applyModeFilter(rows: any[], section: string, getInScannedAt: (r: any) => string | null, getUpdatedAt: (r: any) => string | null) {
  const now = Date.now()
  if (section === 'recovered-returns') {
    return rows.filter(r => !!getInScannedAt(r))
  }
  const withReturnStatus = rows.filter(r => returnStatuses.has(r.status))
  if (section === 'lost-returns') {
    return withReturnStatus.filter(r => {
      if (getInScannedAt(r)) return false
      const updated = getUpdatedAt(r)
      return updated ? (now - new Date(updated).getTime()) > ONE_WEEK_MS : false
    })
  }
  // active-returns
  return withReturnStatus.filter(r => {
    if (getInScannedAt(r)) return false
    const updated = getUpdatedAt(r)
    return updated ? (now - new Date(updated).getTime()) <= ONE_WEEK_MS : true
  })
}

function updateStats(items: any[]) {
  const total = items.length
  activeReturnsStats.value = { total, delayed: 0, onTime: total, delayedPercent: 0, onTimePercent: 100 }
  const carrierMap = new Map<string, { id: string; name: string }>()
  for (const r of items) {
    if (r.carrier && !carrierMap.has(r.carrier)) {
      carrierMap.set(r.carrier, { id: r.carrier, name: r.carrier })
    }
  }
  returnCarriers.value = Array.from(carrierMap.values())
}

// ---------------------------------------------------------------------------
// syncReturns – re-fetch from API and repopulate based on current mode
// ---------------------------------------------------------------------------
async function syncReturns() {
  isSyncingReturns.value = true
  try {
    if (authStore.isDemoMode) {
      populateDemoReturns()
    } else {
      // Fetch all shipments (no status filter) so all modes can be computed
      const rows = await shipmentsService.getAll(appStore.orgId)
      const section = activeSection.value

      const filtered = applyModeFilter(
        rows,
        section,
        (r) => r.in_scanned_at || null,
        (r) => r.updated_at || null,
      )

      filteredReturns.value = filtered.map((row: any) => ({
        id: row.id,
        trackingNumber: row.carrier_tracking_number || row.tracking_number || '-',
        status: row.status || '-',
        isDelayed: false,
        daysDelayed: 0,
        originalOrder: row.reference || '-',
        customerName: row.recipient_name || '-',
        destination: [row.locality, row.delegation, row.governorate].filter(Boolean).join(', ') || '-',
        expectedArrival: '',
        value: row.cod_amount || 0,
        inScannedAt: row.in_scanned_at || null,
        lastStatusAt: (() => {
          const events: any[] = row.shipment_events ?? []
          if (events.length === 0) return row.updated_at || null
          return events.reduce((latest: any, e: any) =>
            new Date(e.created_at) > new Date(latest.created_at) ? e : latest
          ).created_at
        })(),
        lastEventLabel: (() => {
          const events: any[] = row.shipment_events ?? []
          if (events.length === 0) return row.status || null
          return events.reduce((latest: any, e: any) =>
            new Date(e.created_at) > new Date(latest.created_at) ? e : latest
          ).status
        })(),
        carrier: typeof row.carrier === 'string' ? row.carrier : row.carrier?.name || row.old_carrier_name || 'Non assigné',
        reason: row.return_reason || 'Non specifie',
      }))

      updateStats(filteredReturns.value)
    }
  } finally {
    isSyncingReturns.value = false
  }
}

// ---------------------------------------------------------------------------
// Reactive population of ALL refs (initial + live updates)
// ---------------------------------------------------------------------------
watchEffect(() => {
  // ---- filteredReturns, activeReturnsStats, returnCarriers ----
  // These are handled by syncReturns() when the user clicks "Actualiser".
  // Provide initial data here so the view is not empty on first render.

  if (authStore.isDemoMode) {
    populateDemoReturns()

    // ---- returnsData (ReturnValue summary cards) ----
    returnsData.value = { ...demoReturnsData }

    // ---- carriersReturnStats (ReturnValue per-carrier breakdown) ----
    carriersReturnStats.value = demoCarriersReturnStats.map((c) => ({
      ...c,
      avgReturnDays: c.name === 'Yalidine' ? 2.1 : c.name === 'ZR Express' ? 1.8 : 2.8,
      recoveryRate: c.totalReturns > 0
        ? Math.round((c.recovered / c.totalReturns) * 100)
        : 0,
    }))

    // ---- returnStatsData ----
    const demoGovMap: Record<string, { returns: number; total: number }> = {}
    for (const r of demoReturnsList) {
      const gov = r.destination
      if (!demoGovMap[gov]) demoGovMap[gov] = { returns: 0, total: 0 }
      demoGovMap[gov].returns++
      demoGovMap[gov].total++
    }
    // add a few total-only to make rates meaningful
    const demoGovExtra: Record<string, number> = { Tunis: 5, Ariana: 3, Nabeul: 2, Sfax: 2, Sousse: 2 }
    for (const [gov, extra] of Object.entries(demoGovExtra)) {
      if (!demoGovMap[gov]) demoGovMap[gov] = { returns: 0, total: 0 }
      demoGovMap[gov].total += extra
    }
    const byGovernorate = Object.entries(demoGovMap)
      .map(([region, v]) => ({
        region,
        returns: v.returns,
        total: v.total,
        returnRate: Math.round((v.returns / Math.max(v.total, 1)) * 100),
      }))
      .sort((a, b) => b.returns - a.returns)
      .slice(0, 10)

    // last 12 months ending Feb 2026
    const demoMonths = [
      { month: '2025-03', label: 'Mar', count: 2 },
      { month: '2025-04', label: 'Avr', count: 3 },
      { month: '2025-05', label: 'Mai', count: 1 },
      { month: '2025-06', label: 'Jun', count: 4 },
      { month: '2025-07', label: 'Jul', count: 2 },
      { month: '2025-08', label: 'Aoû', count: 5 },
      { month: '2025-09', label: 'Sep', count: 3 },
      { month: '2025-10', label: 'Oct', count: 6 },
      { month: '2025-11', label: 'Nov', count: 4 },
      { month: '2025-12', label: 'Déc', count: 7 },
      { month: '2026-01', label: 'Jan', count: 5 },
      { month: '2026-02', label: 'Fév', count: 8 },
    ]

    returnStatsData.value = {
      byGovernorate,
      byMonth: demoMonths,
      byCarrier: demoCarriersReturnStats.map((c) => ({
        name: c.name,
        totalReturns: c.totalReturns,
        returnRate: c.returnRate,
        recovered: c.recovered,
        recoveryRate: c.totalReturns > 0 ? Math.round((c.recovered / c.totalReturns) * 100) : 0,
      })),
    }

    // ---- reportAnalytics (ReturnReports) ----
    const suggestions: Record<string, string> = {
      'Client absent': 'Contactez les clients par telephone avant livraison',
      'Refus client': 'Confirmez la commande par SMS ou WhatsApp',
      'Adresse incorrecte': 'Verifiez l\'adresse avec le client avant expedition',
      'Colis endommagé': 'Ameliorez l\'emballage des produits fragiles',
      'Erreur produit': 'Implementez un double controle qualite avant expedition',
    }

    reportAnalytics.value = {
      totalReturns: demoReportAnalytics.totalReturns,
      avgAttempts: demoReportAnalytics.avgAttempts,
      multipleAttemptsCost: demoReportAnalytics.multipleAttemptsCost,
      reasonsBreakdown: demoReportAnalytics.reasonsBreakdown.map((r) => ({
        name: r.reason,
        count: r.count,
        percentage: r.percentage,
        suggestion: suggestions[r.reason] || 'Analysez les cas individuellement',
      })),
      attemptsBreakdown: demoReportAnalytics.attemptsBreakdown.map((a) => ({
        attempts: parseInt(a.attempts) || 3,
        label: a.attempts,
        count: a.count,
        percentage: a.percentage,
      })),
      carrierComparison: demoReportAnalytics.carrierComparison.map((c) => ({
        name: c.name,
        totalShipments: Math.round(c.returns / (c.rate / 100)),
        returnRate: c.rate,
        avgAttempts: c.avgTime,
        recoveryRate: c.name === 'Yalidine' ? 92 : c.name === 'ZR Express' ? 85 : 68,
        avgReturnDays: c.avgTime,
        score: c.rate <= 10 ? 8 : c.rate <= 15 ? 6 : 4,
        recommendation: c.rate <= 10 ? 'Bon' : c.rate <= 15 ? 'A surveiller' : 'A ameliorer',
      })),
      productIssues: demoReportAnalytics.productIssues.map((p) => ({
        product: p.product,
        returns: p.returns,
        returnRate: p.product === 'Vêtements' ? 15 : p.product === 'Électronique' ? 10 : 5,
        reason: p.reason === 'Taille incorrecte' ? 'Taille' : p.reason === 'Défaut produit' ? 'Qualite' : 'Couleur',
      })),
      problematicZones: demoReportAnalytics.problematicZones.map((z) => ({
        region: z.zone,
        returns: z.returns,
        total: Math.round(z.returns / (z.rate / 100)),
        returnRate: z.rate,
      })),
      carrierAdvice: demoReportAnalytics.carrierAdvice,
      carrierImpact: demoReportAnalytics.carrierImpact,
      productAdvice: demoReportAnalytics.productAdvice,
      productImpact: demoReportAnalytics.productImpact,
      processAdvice: demoReportAnalytics.processAdvice,
      processImpact: demoReportAnalytics.processImpact,
    }
  } else {
    // ---- Live mode: derive from appStore.shipments ----
    const allShipments = appStore.shipments as any[]
    const allReturnShipments = allShipments.filter(
      (s: any) => returnStatuses.has(s.status)
    )

    // Re-compute whenever activeSection or shipments change
    const section = activeSection.value
    const filtered = applyModeFilter(
      allShipments,
      section,
      (r) => r.inScannedAt || null,
      (r) => r.updatedAt || null,
    )

    filteredReturns.value = filtered.map((row: any) => ({
      id: row.id,
      trackingNumber: row.trackingNumber || '-',
      status: row.status || '-',
      isDelayed: false,
      daysDelayed: 0,
      originalOrder: row.reference || row.orderNumber || '-',
      customerName: row.customerName || '-',
      destination: row.destination || '-',
      expectedArrival: '',
      value: row.amount || 0,
      inScannedAt: row.inScannedAt || null,
      lastStatusAt: row.lastEventAt || row.updatedAt || null,
      lastEventLabel: row.lastEventStatus || row.status || null,
      carrier: row.carrier || 'Non assigné',
      reason: 'Non specifie',
    }))

    updateStats(filteredReturns.value)

    // ---- returnsData ----
    const recoveredShipments = allShipments.filter((s: any) => !!s.inScannedAt)
    const lostShipments = allReturnShipments.filter((s: any) => !s.inScannedAt && s.updatedAt && (Date.now() - new Date(s.updatedAt).getTime()) > ONE_WEEK_MS)
    const activeShipments = allReturnShipments.filter((s: any) => !s.inScannedAt && s.updatedAt && (Date.now() - new Date(s.updatedAt).getTime()) <= ONE_WEEK_MS)
    const totalValue = allReturnShipments.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)
    const recoveredValue = recoveredShipments.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)
    const lostValue = lostShipments.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

    returnsData.value = {
      active: activeShipments.length,
      recovered: recoveredShipments.length,
      lost: lostShipments.length,
      total: allReturnShipments.length,
      totalValue,
      recoveredValue,
      pendingValue: totalValue - recoveredValue - lostValue,
      lostValue,
    }

    // ---- carriersReturnStats ----
    const carrierGroups: Record<string, any[]> = {}
    for (const s of allReturnShipments) {
      const name = s.carrier || 'Non assigne'
      if (!carrierGroups[name]) carrierGroups[name] = []
      carrierGroups[name].push(s)
    }

    carriersReturnStats.value = Object.entries(carrierGroups).map(([name, items]) => {
      const carrierTotal = allShipments.filter((s: any) => (s.carrier || 'Non assigne') === name).length || 1
      const recoveredItems = items.filter((s: any) => !!s.inScannedAt)
      const lostItems = items.filter((s: any) => !s.inScannedAt && s.updatedAt && (Date.now() - new Date(s.updatedAt).getTime()) > ONE_WEEK_MS)
      const inTransitItems = items.filter((s: any) => !s.inScannedAt && (!s.updatedAt || (Date.now() - new Date(s.updatedAt).getTime()) <= ONE_WEEK_MS))

      return {
        name,
        totalReturns: items.length,
        returnRate: Math.round((items.length / carrierTotal) * 100),
        totalValue: items.reduce((sum: number, s: any) => sum + (s.amount || 0), 0),
        recovered: recoveredItems.length,
        recoveredValue: recoveredItems.reduce((sum: number, s: any) => sum + (s.amount || 0), 0),
        inTransit: inTransitItems.length,
        inTransitValue: inTransitItems.reduce((sum: number, s: any) => sum + (s.amount || 0), 0),
        lost: lostItems.length,
        lostValue: lostItems.reduce((sum: number, s: any) => sum + (s.amount || 0), 0),
        returnFees: Math.round(items.length * 5),
        reasons: {},
        avgReturnDays: 3,
        recoveryRate: items.length > 0 ? Math.round((recoveredItems.length / items.length) * 100) : 0,
      }
    })

    // ---- returnStatsData ----
    const govMap: Record<string, { returns: number; total: number }> = {}
    for (const s of allShipments) {
      const gov = (s.destination || '').split(', ').pop() || 'Inconnu'
      if (!govMap[gov]) govMap[gov] = { returns: 0, total: 0 }
      govMap[gov].total++
      if (returnStatuses.has(s.status)) govMap[gov].returns++
    }
    const liveByGov = Object.entries(govMap)
      .filter(([, v]) => v.returns > 0)
      .map(([region, v]) => ({
        region,
        returns: v.returns,
        total: v.total,
        returnRate: Math.round((v.returns / Math.max(v.total, 1)) * 100),
      }))
      .sort((a, b) => b.returns - a.returns)
      .slice(0, 10)

    // by month: last 12 months
    const monthLabels: Record<string, string> = {
      '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Jun',
      '07': 'Jul', '08': 'Aoû', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
    }
    const monthCounts: Record<string, number> = {}
    for (const s of allReturnShipments) {
      const m = (s.createdAt || s.updatedAt || '').substring(0, 7)
      if (m) monthCounts[m] = (monthCounts[m] || 0) + 1
    }
    const now = new Date()
    const liveByMonth = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      return { month, label: monthLabels[mm] || mm, count: monthCounts[month] || 0 }
    })

    returnStatsData.value = {
      byGovernorate: liveByGov,
      byMonth: liveByMonth,
      byCarrier: carriersReturnStats.value.map((c: any) => ({
        name: c.name,
        totalReturns: c.totalReturns,
        returnRate: c.returnRate,
        recovered: c.recovered,
        recoveryRate: c.recoveryRate,
      })),
    }

    // ---- reportAnalytics ----
    const reasonCounts: Record<string, number> = {}
    for (const s of allReturnShipments) {
      const reason = s.return_reason || 'Non specifie'
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    }
    const totalReturns = allReturnShipments.length || 1

    const liveSuggestions: Record<string, string> = {
      'Client absent': 'Contactez les clients par telephone avant livraison',
      'Refus client': 'Confirmez la commande par SMS ou WhatsApp',
      'Adresse incorrecte': 'Verifiez l\'adresse avec le client avant expedition',
      'Colis endommage': 'Ameliorez l\'emballage des produits fragiles',
      'Non specifie': 'Demandez aux transporteurs de preciser la raison du retour',
    }

    reportAnalytics.value = {
      totalReturns: allReturnShipments.length,
      avgAttempts: 1.5,
      multipleAttemptsCost: Math.round(allReturnShipments.length * 3),
      reasonsBreakdown: Object.entries(reasonCounts)
        .map(([reason, count]) => ({
          name: reason,
          count,
          percentage: Math.round((count / totalReturns) * 100),
          suggestion: liveSuggestions[reason] || 'Analysez les cas individuellement',
        }))
        .sort((a, b) => b.count - a.count),
      attemptsBreakdown: [
        { attempts: 1, label: '1 tentative', count: Math.round(totalReturns * 0.4), percentage: 40 },
        { attempts: 2, label: '2 tentatives', count: Math.round(totalReturns * 0.35), percentage: 35 },
        { attempts: 3, label: '3+ tentatives', count: Math.round(totalReturns * 0.25), percentage: 25 },
      ],
      carrierComparison: Object.entries(carrierGroups).map(([name, items]) => {
        const carrierAllCount = allShipments.filter((s: any) => (s.carrier || 'Non assigne') === name).length || 1
        const rate = Math.round((items.length / carrierAllCount) * 100)
        const recoveredCount = items.filter((s: any) => !!s.inScannedAt).length
        return {
          name,
          totalShipments: carrierAllCount,
          returnRate: rate,
          avgAttempts: 1.5,
          recoveryRate: items.length > 0 ? Math.round((recoveredCount / items.length) * 100) : 0,
          avgReturnDays: 3,
          score: rate <= 5 ? 9 : rate <= 10 ? 7 : rate <= 15 ? 5 : 3,
          recommendation: rate <= 5 ? 'Excellent' : rate <= 10 ? 'Bon' : rate <= 15 ? 'A surveiller' : 'A ameliorer',
        }
      }),
      productIssues: [],
      problematicZones: (() => {
        const zoneCounts: Record<string, { returns: number; total: number }> = {}
        for (const s of allReturnShipments) {
          const region = (s.destination || '').split(', ').pop() || 'Inconnu'
          if (!zoneCounts[region]) zoneCounts[region] = { returns: 0, total: 0 }
          zoneCounts[region].returns++
        }
        for (const s of allShipments) {
          const region = (s.destination || '').split(', ').pop() || 'Inconnu'
          if (!zoneCounts[region]) zoneCounts[region] = { returns: 0, total: 0 }
          zoneCounts[region].total++
        }
        return Object.entries(zoneCounts)
          .filter(([, v]) => v.returns > 0)
          .map(([region, v]) => ({
            region,
            returns: v.returns,
            total: v.total || 1,
            returnRate: Math.round((v.returns / (v.total || 1)) * 100),
          }))
          .sort((a, b) => b.returnRate - a.returnRate)
          .slice(0, 5)
      })(),
      carrierAdvice: 'Analysez les transporteurs avec un taux de retour eleve',
      carrierImpact: 10,
      productAdvice: 'Ameliorez les descriptions produits pour reduire les retours',
      productImpact: 8,
      processAdvice: 'Appelez les clients avant livraison dans les zones a risque',
      processImpact: 15,
    }
  }
})
</script>

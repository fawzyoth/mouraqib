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

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

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

// ---------------------------------------------------------------------------
// syncReturns – fetch returned shipments and populate list + stats + carriers
// ---------------------------------------------------------------------------
async function syncReturns() {
  isSyncingReturns.value = true
  try {
    // Demo mode: use static demo data
    if (authStore.isDemoMode) {
      filteredReturns.value = demoReturnsList.map((r) => ({
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
        returnDate: r.returnDate,
        carrier: r.carrier,
        reason: r.reason,
      }))
    } else {
      // Live mode: fetch returned shipments from the database
      const rows = await shipmentsService.getAll(appStore.orgId, { status: 'Retour Expéditeur' })

      filteredReturns.value = rows.map((row: any) => {
        const createdDate = new Date(row.created_at)
        const returnedDate = row.returned_at ? new Date(row.returned_at) : createdDate
        // Estimate: a return is "delayed" if it has been more than 5 days since returned_at
        // without being recovered (status still 'returned' in transit back to sender)
        const daysSinceReturn = Math.floor(
          (Date.now() - returnedDate.getTime()) / 86_400_000
        )
        const isDelayed = daysSinceReturn > 5

        return {
          id: row.id,
          trackingNumber: row.carrier_tracking_number || row.tracking_number,
          status: row.returned_at ? 'En transit' : 'En transit',
          isDelayed,
          daysDelayed: isDelayed ? daysSinceReturn - 5 : 0,
          originalOrder: row.reference || '-',
          customerName: row.recipient_name,
          destination: [row.locality, row.delegation, row.governorate].filter(Boolean).join(', ') || row.governorate,
          expectedArrival: row.returned_at
            ? new Date(returnedDate.getTime() + 5 * 86_400_000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
            : '',
          value: row.cod_amount || 0,
          returnDate: returnedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          carrier: row.carrier?.name || 'Non assigne',
          reason: row.return_reason || 'Non specifie',
        }
      })
    }

    // Recalculate stats
    const total = filteredReturns.value.length
    const delayed = filteredReturns.value.filter((r: any) => r.isDelayed).length
    const onTime = total - delayed

    activeReturnsStats.value = {
      total,
      delayed,
      onTime,
      delayedPercent: total > 0 ? Math.round((delayed / total) * 100) : 0,
      onTimePercent: total > 0 ? Math.round((onTime / total) * 100) : 0,
    }

    // Extract distinct carriers
    const carrierMap = new Map<string, { id: string; name: string }>()
    for (const r of filteredReturns.value) {
      if (r.carrier && !carrierMap.has(r.carrier)) {
        carrierMap.set(r.carrier, { id: r.carrier, name: r.carrier })
      }
    }
    returnCarriers.value = Array.from(carrierMap.values())
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
    // Initial list data (same mapping as syncReturns demo branch)
    if (filteredReturns.value.length === 0) {
      filteredReturns.value = demoReturnsList.map((r) => ({
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
        returnDate: r.returnDate,
        carrier: r.carrier,
        reason: r.reason,
      }))

      // Stats
      const total = filteredReturns.value.length
      const delayed = filteredReturns.value.filter((r: any) => r.isDelayed).length
      const onTime = total - delayed
      activeReturnsStats.value = {
        total,
        delayed,
        onTime,
        delayedPercent: total > 0 ? Math.round((delayed / total) * 100) : 0,
        onTimePercent: total > 0 ? Math.round((onTime / total) * 100) : 0,
      }

      // Carriers
      const carrierMap = new Map<string, { id: string; name: string }>()
      for (const r of filteredReturns.value) {
        if (r.carrier && !carrierMap.has(r.carrier)) {
          carrierMap.set(r.carrier, { id: r.carrier, name: r.carrier })
        }
      }
      returnCarriers.value = Array.from(carrierMap.values())
    }

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
    const returnStatuses = new Set([
      'Retour Expéditeur', 'Rtn client/agence', 'Rtn dépôt',
      'Retour reçu', 'Rtn définitif', 'Retour assigné',
      "Retour en cours d'expédition", 'Retour enlevé', 'Retour Annulé',
    ])
    const returnedShipments = allShipments.filter(
      (s: any) => returnStatuses.has(s.status)
    )

    // Initial list population (if syncReturns hasn't run yet)
    if (filteredReturns.value.length === 0 && returnedShipments.length > 0) {
      filteredReturns.value = returnedShipments.map((row: any) => {
        const createdDate = new Date(row.created_at)
        const returnedDate = row.returned_at ? new Date(row.returned_at) : createdDate
        const daysSinceReturn = Math.floor(
          (Date.now() - returnedDate.getTime()) / 86_400_000
        )
        const isDelayed = daysSinceReturn > 5

        return {
          id: row.id,
          trackingNumber: row.carrier_tracking_number || row.tracking_number,
          status: 'En transit',
          isDelayed,
          daysDelayed: isDelayed ? daysSinceReturn - 5 : 0,
          originalOrder: row.reference || '-',
          customerName: row.recipient_name,
          destination: [row.locality, row.delegation, row.governorate].filter(Boolean).join(', ') || row.governorate || '',
          expectedArrival: row.returned_at
            ? new Date(new Date(row.returned_at).getTime() + 5 * 86_400_000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
            : '',
          value: row.cod_amount || 0,
          returnDate: returnedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          carrier: row.carrier?.name || 'Non assigne',
          reason: row.return_reason || 'Non specifie',
        }
      })

      const total = filteredReturns.value.length
      const delayed = filteredReturns.value.filter((r: any) => r.isDelayed).length
      const onTime = total - delayed
      activeReturnsStats.value = {
        total,
        delayed,
        onTime,
        delayedPercent: total > 0 ? Math.round((delayed / total) * 100) : 0,
        onTimePercent: total > 0 ? Math.round((onTime / total) * 100) : 0,
      }

      const carrierMap = new Map<string, { id: string; name: string }>()
      for (const r of filteredReturns.value) {
        if (r.carrier && !carrierMap.has(r.carrier)) {
          carrierMap.set(r.carrier, { id: r.carrier, name: r.carrier })
        }
      }
      returnCarriers.value = Array.from(carrierMap.values())
    }

    // ---- returnsData ----
    const active = returnedShipments.filter((s: any) => !s.recovered_at && !s.lost_at).length
    const recovered = returnedShipments.filter((s: any) => s.recovered_at).length
    const lost = returnedShipments.filter((s: any) => s.lost_at).length
    const totalValue = returnedShipments.reduce((sum: number, s: any) => sum + (s.cod_amount || 0), 0)
    const recoveredValue = returnedShipments.filter((s: any) => s.recovered_at)
      .reduce((sum: number, s: any) => sum + (s.cod_amount || 0), 0)
    const lostValue = returnedShipments.filter((s: any) => s.lost_at)
      .reduce((sum: number, s: any) => sum + (s.cod_amount || 0), 0)
    const pendingValue = totalValue - recoveredValue - lostValue

    returnsData.value = {
      active,
      recovered,
      lost,
      total: returnedShipments.length,
      totalValue,
      recoveredValue,
      pendingValue,
      lostValue,
    }

    // ---- carriersReturnStats ----
    const carrierGroups: Record<string, any[]> = {}
    for (const s of returnedShipments) {
      const name = s.carrier?.name || 'Non assigne'
      if (!carrierGroups[name]) carrierGroups[name] = []
      carrierGroups[name].push(s)
    }

    carriersReturnStats.value = Object.entries(carrierGroups).map(([name, items]) => {
      const carrierTotal = allShipments.filter((s: any) => (s.carrier?.name || 'Non assigne') === name).length || 1
      const recoveredItems = items.filter((s: any) => s.recovered_at)
      const lostItems = items.filter((s: any) => s.lost_at)
      const inTransitItems = items.filter((s: any) => !s.recovered_at && !s.lost_at)

      const reasons: Record<string, number> = {}
      for (const s of items) {
        const reason = s.return_reason || 'Non specifie'
        reasons[reason] = (reasons[reason] || 0) + 1
      }

      return {
        name,
        totalReturns: items.length,
        returnRate: Math.round((items.length / carrierTotal) * 100),
        totalValue: items.reduce((sum: number, s: any) => sum + (s.cod_amount || 0), 0),
        recovered: recoveredItems.length,
        recoveredValue: recoveredItems.reduce((sum: number, s: any) => sum + (s.cod_amount || 0), 0),
        inTransit: inTransitItems.length,
        inTransitValue: inTransitItems.reduce((sum: number, s: any) => sum + (s.cod_amount || 0), 0),
        lost: lostItems.length,
        lostValue: lostItems.reduce((sum: number, s: any) => sum + (s.cod_amount || 0), 0),
        returnFees: Math.round(items.length * 5),
        reasons,
        avgReturnDays: 3,
        recoveryRate: items.length > 0
          ? Math.round((recoveredItems.length / items.length) * 100)
          : 0,
      }
    })

    // ---- reportAnalytics ----
    const reasonCounts: Record<string, number> = {}
    for (const s of returnedShipments) {
      const reason = s.return_reason || 'Non specifie'
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    }
    const totalReturns = returnedShipments.length || 1

    const liveSuggestions: Record<string, string> = {
      'Client absent': 'Contactez les clients par telephone avant livraison',
      'Refus client': 'Confirmez la commande par SMS ou WhatsApp',
      'Adresse incorrecte': 'Verifiez l\'adresse avec le client avant expedition',
      'Colis endommage': 'Ameliorez l\'emballage des produits fragiles',
      'Non specifie': 'Demandez aux transporteurs de preciser la raison du retour',
    }

    reportAnalytics.value = {
      totalReturns: returnedShipments.length,
      avgAttempts: 1.5,
      multipleAttemptsCost: Math.round(returnedShipments.length * 3),
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
        const carrierAllCount = allShipments.filter((s: any) => (s.carrier?.name || 'Non assigne') === name).length || 1
        const rate = Math.round((items.length / carrierAllCount) * 100)
        const recoveredCount = items.filter((s: any) => s.recovered_at).length
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
        for (const s of returnedShipments) {
          const region = s.governorate || 'Inconnu'
          if (!zoneCounts[region]) zoneCounts[region] = { returns: 0, total: 0 }
          zoneCounts[region].returns++
        }
        for (const s of allShipments) {
          const region = s.governorate || 'Inconnu'
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

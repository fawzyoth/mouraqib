<template>
  <!-- Analytics: Global KPIs -->
  <GlobalKpis
    v-if="activeSection === 'global-kpis'"
    :analytics-date-range="analyticsDateRange"
    :analytics-kpis="analyticsKpis"
    :analytics-kpi-comparison="analyticsKpiComparison"
    :chart-data="chartData"
    :chart-labels="chartLabels"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @update:analytics-date-range="analyticsDateRange = $event"
  />

  <!-- Analytics: Delivery Performance -->
  <DeliveryPerformance
    v-else-if="activeSection === 'delivery-performance'"
    :analytics-date-range="analyticsDateRange"
    :delivery-performance="deliveryPerformance"
    :carriers="appStore.carriers"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @update:analytics-date-range="analyticsDateRange = $event"
  />

  <!-- Analytics: Return Intelligence -->
  <ReturnIntelligence
    v-else-if="activeSection === 'return-intelligence'"
    :analytics-date-range="analyticsDateRange"
    :return-intelligence="returnIntelligence"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @update:analytics-date-range="analyticsDateRange = $event"
  />

  <!-- Analytics: Risk Zones -->
  <RiskZones
    v-else-if="activeSection === 'risk-zones'"
    :risk-zones="riskZones"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Analytics: Anomaly Detection -->
  <AnomalyDetection
    v-else-if="activeSection === 'anomaly-detection'"
    :anomaly-detection="anomalyDetection"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Analytics: Trends -->
  <Trends
    v-else-if="activeSection === 'trends'"
    :trends-period="trendsPeriod"
    :trends="trends"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @update:trends-period="trendsPeriod = $event"
  />

  <!-- Analytics: Reports -->
  <AnalyticsReports
    v-else-if="activeSection === 'reports'"
    :reports="reports"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { FileText, BarChart3, TrendingUp, PieChart } from 'lucide-vue-next'

// Demo data
import {
  demoAnalyticsKpis,
  demoAnalyticsKpiComparison,
  demoChartData,
  demoDeliveryPerformance,
  demoReturnIntelligence,
  demoRiskZones,
  demoAnomalyDetection,
  demoTrends,
} from '@/data/demo/analytics'

// Feature components
import GlobalKpis from '@/components/features/analytics/GlobalKpis.vue'
import DeliveryPerformance from '@/components/features/analytics/DeliveryPerformance.vue'
import ReturnIntelligence from '@/components/features/analytics/ReturnIntelligence.vue'
import RiskZones from '@/components/features/analytics/RiskZones.vue'
import AnomalyDetection from '@/components/features/analytics/AnomalyDetection.vue'
import Trends from '@/components/features/analytics/Trends.vue'
import AnalyticsReports from '@/components/features/analytics/AnalyticsReports.vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

// Shared analytics date range (values: '7', '30', '90')
const analyticsDateRange = ref('30')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the date N days ago (start of day) */
function daysAgo(n: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

/** Parse the analyticsDateRange select value into a number of days */
function rangeDays(): number {
  return parseInt(analyticsDateRange.value) || 30
}

/** Get the first gouvernorat token from a destination string like "Locality, Delegation, Gouvernorat" */
function extractGouvernorat(destination: string): string {
  if (!destination) return 'Inconnu'
  const parts = destination.split(',').map(s => s.trim())
  // The gouvernorat is typically the last part
  return parts[parts.length - 1] || 'Inconnu'
}

/** Format a Date as short French label */
function formatDateShort(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/** Round to one decimal */
function r1(n: number): number {
  return Math.round(n * 10) / 10
}

// ---------------------------------------------------------------------------
// 1. Global KPIs
// ---------------------------------------------------------------------------

const analyticsKpis = computed(() => {
  if (authStore.isDemoMode) {
    return demoAnalyticsKpis
  }
  const all = appStore.shipments
  const days = rangeDays()
  const cutoff = daysAgo(days)
  const inRange = all.filter(s => new Date(s.createdAt) >= cutoff)

  const total = inRange.length
  const delivered = inRange.filter(s => s.status === 'Delivered').length
  const returned = inRange.filter(s => s.status === 'Returned').length
  const cancelled = inRange.filter(s => s.status === 'Cancelled').length
  const deliveryRate = total > 0 ? r1((delivered / total) * 100) : 0
  const returnRate = total > 0 ? r1((returned / total) * 100) : 0
  const exceptionRate = total > 0 ? r1(((returned + cancelled) / total) * 100) : 0

  // Average transit time for delivered shipments
  const deliveredShipments = inRange.filter(s => s.status === 'Delivered' && s.transitDays > 0)
  const avgTransitTime = deliveredShipments.length > 0
    ? r1(deliveredShipments.reduce((sum, s) => sum + s.transitDays, 0) / deliveredShipments.length)
    : 0

  // Revenue = sum of totalPrice for delivered shipments
  const totalRevenue = delivered > 0
    ? inRange.filter(s => s.status === 'Delivered').reduce((sum, s) => sum + (s.totalPrice || 0), 0)
    : 0

  // Customer satisfaction estimate: based on delivery rate + on-time factor
  const customerSatisfaction = total > 0 ? Math.min(100, Math.round(deliveryRate * 1.1 + (avgTransitTime <= 2 ? 10 : 0))) : 0

  return {
    totalShipments: total,
    deliveryRate,
    avgTransitTime,
    totalRevenue,
    returnRate,
    exceptionRate,
    customerSatisfaction,
  }
})

// ---------------------------------------------------------------------------
// KPI Comparison (current period vs previous period)
// ---------------------------------------------------------------------------

const analyticsKpiComparison = computed(() => {
  if (authStore.isDemoMode) {
    return demoAnalyticsKpiComparison.map(item => ({
      name: item.label,
      current: String(item.current),
      previous: String(item.previous),
      change: item.change,
    }))
  }

  const all = appStore.shipments
  const days = rangeDays()
  const currentCutoff = daysAgo(days)
  const previousCutoff = daysAgo(days * 2)

  const current = all.filter(s => new Date(s.createdAt) >= currentCutoff)
  const previous = all.filter(s => {
    const d = new Date(s.createdAt)
    return d >= previousCutoff && d < currentCutoff
  })

  function stats(list: typeof all) {
    const total = list.length
    const delivered = list.filter(s => s.status === 'Delivered').length
    const returned = list.filter(s => s.status === 'Returned').length
    const deliveredWithTransit = list.filter(s => s.status === 'Delivered' && s.transitDays > 0)
    const avgTransit = deliveredWithTransit.length > 0
      ? r1(deliveredWithTransit.reduce((sum, s) => sum + s.transitDays, 0) / deliveredWithTransit.length)
      : 0
    const revenue = list.filter(s => s.status === 'Delivered').reduce((sum, s) => sum + (s.totalPrice || 0), 0)
    return {
      total,
      deliveryRate: total > 0 ? r1((delivered / total) * 100) : 0,
      returnRate: total > 0 ? r1((returned / total) * 100) : 0,
      avgTransit,
      revenue,
    }
  }

  const cur = stats(current)
  const prev = stats(previous)

  return [
    { name: 'Total Colis', current: String(cur.total), previous: String(prev.total), change: prev.total > 0 ? r1(((cur.total - prev.total) / prev.total) * 100) : 0 },
    { name: 'Taux Livraison', current: cur.deliveryRate + '%', previous: prev.deliveryRate + '%', change: r1(cur.deliveryRate - prev.deliveryRate) },
    { name: 'Transit Moyen', current: cur.avgTransit + 'j', previous: prev.avgTransit + 'j', change: r1(cur.avgTransit - prev.avgTransit) },
    { name: 'Taux Retour', current: cur.returnRate + '%', previous: prev.returnRate + '%', change: r1(cur.returnRate - prev.returnRate) },
    { name: 'Revenus', current: cur.revenue + ' DT', previous: prev.revenue + ' DT', change: prev.revenue > 0 ? r1(((cur.revenue - prev.revenue) / prev.revenue) * 100) : 0 },
  ]
})

// ---------------------------------------------------------------------------
// 2. Chart Data / Labels (shipment volume over time)
// ---------------------------------------------------------------------------

const chartData = computed(() => {
  if (authStore.isDemoMode) {
    return demoChartData
  }
  const all = appStore.shipments
  const days = rangeDays()
  // Group by day for 7d, by week for 30d, by month for 90d
  if (days <= 7) {
    // Daily for last 7 days
    const counts: number[] = []
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = daysAgo(i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      counts.push(all.filter(s => {
        const d = new Date(s.createdAt)
        return d >= dayStart && d < dayEnd
      }).length)
    }
    return counts
  } else if (days <= 30) {
    // Weekly for last 30 days (approx 4-5 weeks)
    const weeks = Math.ceil(days / 7)
    const counts: number[] = []
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = daysAgo((i + 1) * 7)
      const weekEnd = daysAgo(i * 7)
      counts.push(all.filter(s => {
        const d = new Date(s.createdAt)
        return d >= weekStart && d < weekEnd
      }).length)
    }
    return counts
  } else {
    // Monthly for 90 days (3 months)
    const months = Math.ceil(days / 30)
    const counts: number[] = []
    for (let i = months - 1; i >= 0; i--) {
      const mStart = daysAgo((i + 1) * 30)
      const mEnd = daysAgo(i * 30)
      counts.push(all.filter(s => {
        const d = new Date(s.createdAt)
        return d >= mStart && d < mEnd
      }).length)
    }
    return counts
  }
})

const chartLabels = computed(() => {
  if (authStore.isDemoMode) {
    return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  }
  const days = rangeDays()
  if (days <= 7) {
    const labels: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      labels.push(formatDateShort(daysAgo(i)))
    }
    return labels
  } else if (days <= 30) {
    const weeks = Math.ceil(days / 7)
    return Array.from({ length: weeks }, (_, i) => `S${i + 1}`)
  } else {
    const months = Math.ceil(days / 30)
    const labels: string[] = []
    for (let i = months - 1; i >= 0; i--) {
      const d = daysAgo(i * 30)
      labels.push(d.toLocaleDateString('fr-FR', { month: 'short' }))
    }
    return labels
  }
})

// ---------------------------------------------------------------------------
// 3. Delivery Performance
// ---------------------------------------------------------------------------

const deliveryPerformance = computed(() => {
  if (authStore.isDemoMode) {
    return {
      successfulDeliveries: demoDeliveryPerformance.successfulDeliveries,
      totalAttempts: demoDeliveryPerformance.totalAttempts,
      firstAttemptRate: demoDeliveryPerformance.firstAttemptRate,
      avgDeliveryTime: demoDeliveryPerformance.avgDeliveryTime,
      onTimeRate: demoDeliveryPerformance.onTimeRate,
      regionalPerformance: demoDeliveryPerformance.regionalPerformance.map(r => ({
        name: r.region,
        rate: r.rate,
        shipments: r.count,
        avgTime: 2.0,
      })),
    }
  }

  const all = appStore.shipments
  const days = rangeDays()
  const cutoff = daysAgo(days)
  const inRange = all.filter(s => new Date(s.createdAt) >= cutoff)

  const delivered = inRange.filter(s => s.status === 'Delivered')
  const returned = inRange.filter(s => s.status === 'Returned')
  const totalAttempts = delivered.length + returned.length
  const successfulDeliveries = delivered.length

  // First attempt rate: delivered shipments with transitDays <= 2 as a proxy
  const firstAttempt = delivered.filter(s => s.transitDays <= 2).length
  const firstAttemptRate = delivered.length > 0 ? Math.round((firstAttempt / delivered.length) * 100) : 0

  // Average delivery time (in days, shown as hours in component but label says "h" so convert)
  const deliveredWithTransit = delivered.filter(s => s.transitDays > 0)
  const avgDeliveryTime = deliveredWithTransit.length > 0
    ? r1(deliveredWithTransit.reduce((sum, s) => sum + s.transitDays * 24, 0) / deliveredWithTransit.length)
    : 0

  // On-time rate: delivered within 3 days
  const onTime = delivered.filter(s => s.transitDays <= 3).length
  const onTimeRate = delivered.length > 0 ? Math.round((onTime / delivered.length) * 100) : 0

  // Regional performance
  const regionMap = new Map<string, { total: number; delivered: number; transitSum: number; deliveredCount: number }>()
  for (const s of inRange) {
    const region = extractGouvernorat(s.destination)
    if (!regionMap.has(region)) regionMap.set(region, { total: 0, delivered: 0, transitSum: 0, deliveredCount: 0 })
    const r = regionMap.get(region)!
    r.total++
    if (s.status === 'Delivered') {
      r.delivered++
      if (s.transitDays > 0) {
        r.transitSum += s.transitDays
        r.deliveredCount++
      }
    }
  }

  const regionalPerformance = Array.from(regionMap.entries())
    .map(([name, data]) => ({
      name,
      rate: data.total > 0 ? Math.round((data.delivered / data.total) * 100) : 0,
      shipments: data.total,
      avgTime: data.deliveredCount > 0 ? r1(data.transitSum / data.deliveredCount) : 0,
    }))
    .sort((a, b) => b.shipments - a.shipments)

  return {
    successfulDeliveries,
    totalAttempts,
    firstAttemptRate,
    avgDeliveryTime,
    onTimeRate,
    regionalPerformance,
  }
})

// ---------------------------------------------------------------------------
// 4. Return Intelligence
// ---------------------------------------------------------------------------

const RETURN_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899']

const returnIntelligence = computed(() => {
  if (authStore.isDemoMode) {
    return {
      totalReturns: demoReturnIntelligence.totalReturns,
      lostRevenue: demoReturnIntelligence.lostRevenue,
      recoveredReturns: demoReturnIntelligence.recoveredReturns,
      recoveryRate: demoReturnIntelligence.recoveryRate,
      returnReasons: demoReturnIntelligence.returnReasons.map((r, i) => ({
        name: r.reason,
        percentage: r.percentage,
        color: RETURN_COLORS[i % RETURN_COLORS.length],
      })),
      returnTrend: demoReturnIntelligence.returnTrend,
      recommendations: demoReturnIntelligence.recommendations.map(r => ({
        title: r.text,
        description: r.impact,
        priority: r.priority as 'high' | 'medium' | 'low',
        impact: r.impact,
      })),
    }
  }

  const all = appStore.shipments
  const days = rangeDays()
  const cutoff = daysAgo(days)
  const inRange = all.filter(s => new Date(s.createdAt) >= cutoff)

  const returned = inRange.filter(s => s.status === 'Returned')
  const totalReturns = returned.length
  const lostRevenue = returned.reduce((sum, s) => sum + (s.totalPrice || 0), 0)

  // "Recovered" returns: we don't have a direct field, estimate ~30% recovery
  const recoveredReturns = Math.round(totalReturns * 0.3)
  const recoveryRate = totalReturns > 0 ? Math.round((recoveredReturns / totalReturns) * 100) : 0

  // Return reasons from events or return_reason field
  const reasonMap = new Map<string, number>()
  for (const s of returned) {
    const reason = (s as any).return_reason || 'Non specifie'
    reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1)
  }
  const returnReasons = Array.from(reasonMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      name,
      percentage: totalReturns > 0 ? Math.round((count / totalReturns) * 100) : 0,
      color: RETURN_COLORS[i % RETURN_COLORS.length],
    }))

  // Return trend: returns per week for last 6 weeks
  const returnTrend: number[] = []
  for (let i = 5; i >= 0; i--) {
    const weekStart = daysAgo((i + 1) * 7)
    const weekEnd = daysAgo(i * 7)
    returnTrend.push(all.filter(s => {
      if (s.status !== 'Returned') return false
      const d = new Date(s.createdAt)
      return d >= weekStart && d < weekEnd
    }).length)
  }

  // Recommendations based on data patterns
  const recommendations: { title: string; description: string; priority: 'high' | 'medium' | 'low'; impact: string }[] = []
  const topReason = returnReasons[0]
  if (topReason && topReason.name === 'Client absent') {
    recommendations.push({
      title: 'Appeler le client avant livraison',
      description: 'Les clients absents representent la majorite des retours. Un appel prealable reduirait significativement ce taux.',
      priority: 'high',
      impact: 'Reduction estimee: 20% des retours',
    })
  }
  if (returnReasons.find(r => r.name === 'Adresse incorrecte')) {
    recommendations.push({
      title: 'Verifier les adresses avant expedition',
      description: 'Implementer une validation d\'adresse au moment de la creation du colis.',
      priority: 'medium',
      impact: 'Reduction estimee: 10% des retours',
    })
  }
  if (returnReasons.find(r => r.name === 'Refus client')) {
    recommendations.push({
      title: 'Confirmer la commande par SMS',
      description: 'Envoyer un SMS de confirmation au client avant l\'expedition pour reduire les refus.',
      priority: 'medium',
      impact: 'Reduction estimee: 15% des retours',
    })
  }
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintenir la qualite actuelle',
      description: 'Le taux de retour est dans une fourchette acceptable. Continuez les bonnes pratiques.',
      priority: 'low',
      impact: 'Maintien du taux actuel',
    })
  }

  return {
    totalReturns,
    lostRevenue,
    recoveredReturns,
    recoveryRate,
    returnReasons,
    returnTrend,
    recommendations,
  }
})

// ---------------------------------------------------------------------------
// 5. Risk Zones
// ---------------------------------------------------------------------------

const riskZones = computed(() => {
  if (authStore.isDemoMode) {
    return {
      highRiskCount: demoRiskZones.highRiskCount,
      mediumRiskCount: demoRiskZones.mediumRiskCount,
      lowRiskCount: demoRiskZones.lowRiskCount,
      zones: demoRiskZones.zones.map(z => ({
        name: z.name,
        risk: z.risk as 'high' | 'medium' | 'low',
        failureRate: 100 - z.deliveryRate,
        returnRate: z.returnRate,
        affectedShipments: z.shipments,
        mainReason: z.issues || '-',
      })),
    }
  }

  const all = appStore.shipments
  // Group all shipments by gouvernorat
  const zoneMap = new Map<string, { total: number; delivered: number; returned: number; cancelled: number }>()
  for (const s of all) {
    const zone = extractGouvernorat(s.destination)
    if (!zoneMap.has(zone)) zoneMap.set(zone, { total: 0, delivered: 0, returned: 0, cancelled: 0 })
    const z = zoneMap.get(zone)!
    z.total++
    if (s.status === 'Delivered') z.delivered++
    if (s.status === 'Returned') z.returned++
    if (s.status === 'Cancelled') z.cancelled++
  }

  const zones = Array.from(zoneMap.entries())
    .filter(([_, data]) => data.total >= 1)
    .map(([name, data]) => {
      const failureRate = data.total > 0 ? Math.round(((data.returned + data.cancelled) / data.total) * 100) : 0
      const returnRate = data.total > 0 ? Math.round((data.returned / data.total) * 100) : 0
      let risk: 'high' | 'medium' | 'low' = 'low'
      if (returnRate >= 20 || failureRate >= 30) risk = 'high'
      else if (returnRate >= 10 || failureRate >= 15) risk = 'medium'

      let mainReason = '-'
      if (data.returned > data.cancelled) mainReason = 'Retours frequents'
      else if (data.cancelled > 0) mainReason = 'Annulations frequentes'
      else if (failureRate > 0) mainReason = 'Taux d\'echec eleve'

      return { name, risk, failureRate, returnRate, affectedShipments: data.total, mainReason }
    })
    .sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 }
      return riskOrder[a.risk] - riskOrder[b.risk] || b.failureRate - a.failureRate
    })

  const highRiskCount = zones.filter(z => z.risk === 'high').length
  const mediumRiskCount = zones.filter(z => z.risk === 'medium').length
  const lowRiskCount = zones.filter(z => z.risk === 'low').length

  return { highRiskCount, mediumRiskCount, lowRiskCount, zones }
})

// ---------------------------------------------------------------------------
// 6. Anomaly Detection
// ---------------------------------------------------------------------------

const anomalyDetection = computed(() => {
  if (authStore.isDemoMode) {
    return {
      criticalAnomalies: demoAnomalyDetection.criticalAnomalies,
      warningAnomalies: demoAnomalyDetection.warningAnomalies,
      infoAnomalies: demoAnomalyDetection.infoAnomalies,
      resolvedAnomalies: demoAnomalyDetection.resolvedAnomalies,
      activeAnomalies: demoAnomalyDetection.activeAnomalies.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        severity: a.severity as 'critical' | 'warning' | 'info',
        detectedAt: a.detectedAt,
        affectedItems: a.severity === 'critical' ? 8 : a.severity === 'warning' ? 5 : 3,
      })),
    }
  }

  const all = appStore.shipments
  const days = rangeDays()
  const cutoff = daysAgo(days)
  const inRange = all.filter(s => new Date(s.createdAt) >= cutoff)

  const anomalies: { id: number; title: string; description: string; severity: 'critical' | 'warning' | 'info'; detectedAt: string; affectedItems: number }[] = []
  let anomalyId = 1
  const now = new Date()

  // Check for high return rates by carrier
  const carrierMap = new Map<string, { total: number; returned: number }>()
  for (const s of inRange) {
    if (!carrierMap.has(s.carrier)) carrierMap.set(s.carrier, { total: 0, returned: 0 })
    const c = carrierMap.get(s.carrier)!
    c.total++
    if (s.status === 'Returned') c.returned++
  }
  for (const [carrier, data] of carrierMap) {
    if (data.total >= 3) {
      const returnRate = (data.returned / data.total) * 100
      if (returnRate > 25) {
        anomalies.push({
          id: anomalyId++,
          title: `Taux de retour anormal via ${carrier}`,
          description: `${Math.round(returnRate)}% de retours sur ${data.total} colis`,
          severity: 'critical',
          detectedAt: formatDateShort(now),
          affectedItems: data.returned,
        })
      } else if (returnRate > 15) {
        anomalies.push({
          id: anomalyId++,
          title: `Taux de retour eleve via ${carrier}`,
          description: `${Math.round(returnRate)}% de retours`,
          severity: 'warning',
          detectedAt: formatDateShort(now),
          affectedItems: data.returned,
        })
      }
    }
  }

  // Check for regions with high failure rates
  const regionStats = new Map<string, { total: number; failed: number }>()
  for (const s of inRange) {
    const region = extractGouvernorat(s.destination)
    if (!regionStats.has(region)) regionStats.set(region, { total: 0, failed: 0 })
    const r = regionStats.get(region)!
    r.total++
    if (s.status === 'Returned' || s.status === 'Cancelled') r.failed++
  }
  for (const [region, data] of regionStats) {
    if (data.total >= 3 && (data.failed / data.total) > 0.3) {
      anomalies.push({
        id: anomalyId++,
        title: `Zone a risque detectee: ${region}`,
        description: `${Math.round((data.failed / data.total) * 100)}% d'echec sur ${data.total} colis`,
        severity: 'warning',
        detectedAt: formatDateShort(now),
        affectedItems: data.failed,
      })
    }
  }

  // Check for volume spike / drop in last week vs prior week
  const lastWeek = all.filter(s => {
    const d = new Date(s.createdAt)
    return d >= daysAgo(7) && d < daysAgo(0)
  }).length
  const priorWeek = all.filter(s => {
    const d = new Date(s.createdAt)
    return d >= daysAgo(14) && d < daysAgo(7)
  }).length
  if (priorWeek > 0) {
    const changePercent = ((lastWeek - priorWeek) / priorWeek) * 100
    if (changePercent > 50) {
      anomalies.push({
        id: anomalyId++,
        title: 'Pic de volume de commandes',
        description: `+${Math.round(changePercent)}% vs semaine precedente`,
        severity: 'info',
        detectedAt: formatDateShort(now),
        affectedItems: lastWeek,
      })
    } else if (changePercent < -30) {
      anomalies.push({
        id: anomalyId++,
        title: 'Baisse de volume de commandes',
        description: `${Math.round(changePercent)}% vs semaine precedente`,
        severity: 'warning',
        detectedAt: formatDateShort(now),
        affectedItems: lastWeek,
      })
    }
  }

  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length
  const warningAnomalies = anomalies.filter(a => a.severity === 'warning').length
  const infoAnomalies = anomalies.filter(a => a.severity === 'info').length

  return {
    criticalAnomalies,
    warningAnomalies,
    infoAnomalies,
    resolvedAnomalies: 0,
    activeAnomalies: anomalies,
  }
})

// ---------------------------------------------------------------------------
// 7. Trends
// ---------------------------------------------------------------------------

const trendsPeriod = ref('weekly')

const trends = computed(() => {
  if (authStore.isDemoMode) {
    return {
      labels: demoTrends.labels,
      volumeTrend: demoTrends.volumeTrend,
      deliveryRateTrend: demoTrends.deliveryRateTrend,
      volumeForecast: demoTrends.volumeForecast,
      deliveryForecast: demoTrends.deliveryForecast,
      insights: demoTrends.insights.map(ins => ({
        title: ins.text,
        description: ins.text,
        trend: ins.type === 'positive' ? 'up' as const : 'down' as const,
        period: `Derniere periode`,
      })),
    }
  }

  const all = appStore.shipments
  const period = trendsPeriod.value
  let buckets: number
  let bucketDays: number
  let labelFn: (i: number) => string

  if (period === 'weekly') {
    buckets = 6
    bucketDays = 7
    labelFn = (i) => `S${i + 1}`
  } else if (period === 'monthly') {
    buckets = 6
    bucketDays = 30
    labelFn = (i) => {
      const d = daysAgo((buckets - 1 - i) * bucketDays)
      return d.toLocaleDateString('fr-FR', { month: 'short' })
    }
  } else {
    // quarterly
    buckets = 4
    bucketDays = 90
    labelFn = (i) => `T${i + 1}`
  }

  const labels: string[] = []
  const volumeTrend: number[] = []
  const deliveryRateTrend: number[] = []

  for (let i = 0; i < buckets; i++) {
    const bucketStart = daysAgo((buckets - i) * bucketDays)
    const bucketEnd = daysAgo((buckets - i - 1) * bucketDays)
    labels.push(labelFn(i))

    const bucketShipments = all.filter(s => {
      const d = new Date(s.createdAt)
      return d >= bucketStart && d < bucketEnd
    })
    volumeTrend.push(bucketShipments.length)

    const delivered = bucketShipments.filter(s => s.status === 'Delivered').length
    deliveryRateTrend.push(bucketShipments.length > 0 ? Math.round((delivered / bucketShipments.length) * 100) : 0)
  }

  // Simple forecast: average of last 2 buckets + trend
  const lastTwo = volumeTrend.slice(-2)
  const volAvg = lastTwo.length > 0 ? lastTwo.reduce((a, b) => a + b, 0) / lastTwo.length : 0
  const volTrend = lastTwo.length === 2 ? lastTwo[1] - lastTwo[0] : 0
  const volumeForecast = volAvg > 0 ? Math.round(((volTrend / volAvg) * 100)) : 0

  const lastTwoRates = deliveryRateTrend.slice(-2)
  const rateAvg = lastTwoRates.length > 0 ? lastTwoRates.reduce((a, b) => a + b, 0) / lastTwoRates.length : 0
  const deliveryForecast = Math.round(rateAvg + (lastTwoRates.length === 2 ? (lastTwoRates[1] - lastTwoRates[0]) * 0.5 : 0))

  // Insights
  const insights: { title: string; description: string; trend: 'up' | 'down'; period: string }[] = []
  if (volumeTrend.length >= 2) {
    const first = volumeTrend[0]
    const last = volumeTrend[volumeTrend.length - 1]
    if (last > first) {
      insights.push({
        title: 'Volume en hausse',
        description: `+${last - first} colis entre la premiere et la derniere periode`,
        trend: 'up',
        period: `${buckets} dernieres periodes`,
      })
    } else if (last < first) {
      insights.push({
        title: 'Volume en baisse',
        description: `${last - first} colis entre la premiere et la derniere periode`,
        trend: 'down',
        period: `${buckets} dernieres periodes`,
      })
    }
  }
  if (deliveryRateTrend.length >= 2) {
    const first = deliveryRateTrend[0]
    const last = deliveryRateTrend[deliveryRateTrend.length - 1]
    if (last >= first) {
      insights.push({
        title: 'Taux de livraison stable/en hausse',
        description: `De ${first}% a ${last}% sur la periode`,
        trend: 'up',
        period: `${buckets} dernieres periodes`,
      })
    } else {
      insights.push({
        title: 'Taux de livraison en baisse',
        description: `De ${first}% a ${last}% sur la periode`,
        trend: 'down',
        period: `${buckets} dernieres periodes`,
      })
    }
  }
  if (volumeForecast > 0) {
    insights.push({
      title: 'Prevision positive',
      description: `+${volumeForecast}% de volume prevu pour la prochaine periode`,
      trend: 'up',
      period: 'Prochaine periode',
    })
  } else if (volumeForecast < 0) {
    insights.push({
      title: 'Prevision en baisse',
      description: `${volumeForecast}% de volume prevu pour la prochaine periode`,
      trend: 'down',
      period: 'Prochaine periode',
    })
  }

  return { labels, volumeTrend, deliveryRateTrend, volumeForecast, deliveryForecast, insights }
})

// ---------------------------------------------------------------------------
// 8. Reports
// ---------------------------------------------------------------------------

const reports = computed(() => {
  const templates = [
    {
      id: 1,
      name: 'Rapport Global',
      description: 'Vue d\'ensemble de toutes les metriques cles',
      icon: markRaw(FileText),
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
    },
    {
      id: 2,
      name: 'Performance Livraison',
      description: 'Analyse detaillee des taux de livraison par transporteur et region',
      icon: markRaw(BarChart3),
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600',
    },
    {
      id: 3,
      name: 'Analyse Retours',
      description: 'Motifs de retour, tendances et recommandations',
      icon: markRaw(TrendingUp),
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600',
    },
    {
      id: 4,
      name: 'Rapport Financier',
      description: 'Revenus, couts de livraison et marges par periode',
      icon: markRaw(PieChart),
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
    },
  ]

  const now = new Date()
  const recentReports = [
    {
      id: 'rpt-001',
      name: 'Rapport Mensuel - ' + now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      type: 'Global',
      period: '30 derniers jours',
      generatedAt: formatDateShort(now),
      size: '2.4 MB',
    },
    {
      id: 'rpt-002',
      name: 'Performance Transporteurs',
      type: 'Livraison',
      period: '7 derniers jours',
      generatedAt: formatDateShort(daysAgo(3)),
      size: '1.1 MB',
    },
    {
      id: 'rpt-003',
      name: 'Analyse Retours Hebdo',
      type: 'Retours',
      period: 'Semaine derniere',
      generatedAt: formatDateShort(daysAgo(7)),
      size: '850 KB',
    },
  ]

  return { templates, recentReports }
})
</script>

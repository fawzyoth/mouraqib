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
import { computed, ref, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

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
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

// Shared analytics date range
const analyticsDateRange = ref('30d')

// Global KPIs
const analyticsKpis = ref({
  totalShipments: 0,
  deliveryRate: 0,
  avgDeliveryTime: 0,
  returnRate: 0,
  revenue: 0,
  activeCarriers: 0,
})
const analyticsKpiComparison = ref({
  totalShipments: 0,
  deliveryRate: 0,
  avgDeliveryTime: 0,
  returnRate: 0,
  revenue: 0,
  activeCarriers: 0,
})
const chartData = ref<number[]>([])
const chartLabels = ref<string[]>([])

// Delivery Performance
const deliveryPerformance = ref({
  byCarrier: [] as any[],
  byRegion: [] as any[],
  byDay: [] as any[],
})

// Return Intelligence
const returnIntelligence = ref({
  byReason: [] as any[],
  byCarrier: [] as any[],
  trends: [] as any[],
})

// Risk Zones
const riskZones = ref<any[]>([])

// Anomaly Detection
const anomalyDetection = ref({
  anomalies: [] as any[],
  summary: { total: 0, critical: 0, warning: 0 },
})

// Trends
const trendsPeriod = ref('6m')
const trends = ref({
  shipmentVolume: [] as any[],
  deliveryRate: [] as any[],
  revenue: [] as any[],
})

// Reports
const reports = ref<any[]>([])
</script>

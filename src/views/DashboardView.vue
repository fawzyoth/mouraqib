<template>
  <!-- Dashboard: Overview -->
  <DashboardOverview
    v-if="activeSection === 'overview'"
    :dashboard-stats="dashboardStats"
    :urgent-actions="urgentActions"
    :weather-regions="weatherRegions"
    :delayed-shipments-count="delayedShipmentsCount"
    :return-alerts-count="returnAlertsCount"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @navigate="navigateTo"
  />

  <!-- Dashboard: Today's Tasks -->
  <DashboardTodayTasks
    v-else-if="activeSection === 'today-shipments'"
    :categories="filteredTaskCategories"
    :stats="dailyTasksStats"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    @toggle-task="toggleDailyTask"
    @complete-all-in-category="completeAllInCategory"
    @execute-task-action="executeTaskAction"
  />

  <!-- Dashboard: Delayed Shipments -->
  <DashboardDelayed
    v-else-if="activeSection === 'delayed-shipments'"
    :shipments="delayedShipments"
    :delayed-patterns="delayedPatterns"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
  />

  <!-- Dashboard: Return Alerts -->
  <DashboardReturnAlerts
    v-else-if="activeSection === 'returns-alerts'"
    :return-alerts="returnAlerts"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
  />

  <!-- Dashboard: Financial Snapshot -->
  <DashboardFinancialSnapshot
    v-else-if="activeSection === 'financial-snapshot'"
    :financial-data="financialSnapshot"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
  />

  <!-- Dashboard: Activity Log -->
  <DashboardActivityLog
    v-else-if="activeSection === 'activity-log'"
    :logs="activityLogs"
    @toggle-sub-menu="subMenuOpen = !subMenuOpen"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { subSectionRoutes } from '@/composables/useNavigation'

// Feature components
import DashboardOverview from '@/components/features/dashboard/DashboardOverview.vue'
import DashboardTodayTasks from '@/components/features/dashboard/DashboardTodayTasks.vue'
import DashboardDelayed from '@/components/features/dashboard/DashboardDelayed.vue'
import DashboardReturnAlerts from '@/components/features/dashboard/DashboardReturnAlerts.vue'
import DashboardFinancialSnapshot from '@/components/features/dashboard/DashboardFinancialSnapshot.vue'
import DashboardActivityLog from '@/components/features/dashboard/DashboardActivityLog.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

function navigateTo(subSection: string) {
  const routeInfo = subSectionRoutes[subSection]
  if (routeInfo) router.push(routeInfo.path)
}

// ---------------------------------------------------------------------------
// Section-local state (defaults — will be migrated from DTV later)
// ---------------------------------------------------------------------------

// Overview props
const dashboardStats = ref({
  totalShipments: 0,
  delivered: 0,
  inTransit: 0,
  returned: 0,
  deliveryRate: 0,
  revenue: 0,
})
const urgentActions = ref<any[]>([])
const weatherRegions = ref<any[]>([])
const delayedShipmentsCount = ref(0)
const returnAlertsCount = ref(0)

// Today's Tasks props
const filteredTaskCategories = ref<any[]>([])
const dailyTasksStats = ref({ total: 0, completed: 0, pending: 0, completionRate: 0 })

function toggleDailyTask(_taskId: string) { /* stub */ }
function completeAllInCategory(_categoryId: string) { /* stub */ }
function executeTaskAction(_action: any) { /* stub */ }

// Delayed props
const delayedShipments = ref<any[]>([])
const delayedPatterns = ref<any[]>([])

// Return Alerts props
const returnAlerts = ref<any[]>([])

// Financial Snapshot props
const financialSnapshot = ref({
  totalExpected: 0,
  totalReceived: 0,
  totalPending: 0,
  discrepancies: 0,
})

// Activity Log props
const activityLogs = ref<any[]>([])
</script>

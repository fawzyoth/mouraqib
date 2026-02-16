import { markRaw } from 'vue'
import type { Component } from 'vue'

import { demoBoutiques } from './boutiques'
import { demoCarriers } from './carriers'
import { demoClientStats, demoClientsList } from './clients'
import { demoShipments } from './shipments'
import {
  demoDashboardStats, demoTodayStats, demoUserBalance,
  demoUrgentActions, demoDailyTasks
} from './dashboard'
import { demoActivityLogs } from './activity'
import {
  demoReturnsData, demoReturnsList, demoCarriersReturnStats,
  demoReturnAlerts, demoReportAnalytics
} from './returns'
import {
  demoPickupRequests, demoPickupHistory,
  demoFailedPickupsData, demoScheduledPickups
} from './pickups'
import {
  demoFinancialStats, demoPaymentStats, demoPayments,
  demoReceivedPaymentsData, demoReceivedPaymentsStats, demoDiscrepancyStats, demoReconciliationByCarrier,
  demoRevenueStats, demoRevenueByCategory, demoRevenueByRegion, demoRevenueChartData,
  demoReturnLossesStats, demoReturnLossesByReason, demoReturnLossesByCarrier,
  demoReturnLossesDetails, demoInvoicesStats, demoInvoices
} from './finance'
import {
  demoChartData, demoAnalyticsKpis, demoAnalyticsKpiComparison,
  demoDeliveryPerformance, demoReturnIntelligence, demoRiskZones,
  demoAnomalyDetection, demoTrends, demoCarrierPerformance
} from './analytics'
import { demoTeamMembers, demoActiveSessions } from './team'
import { demoFailedSearches, demoDelayedShipments, demoDelayedPatterns } from './search'

/**
 * Seed all demo data into the component refs/reactives.
 *
 * @param refs - object containing all the component's ref() and reactive() variables
 * @param icons - map of string keys to Lucide Vue icon components
 */
export function seedDemoData(
  refs: Record<string, any>,
  icons: Record<string, Component>
) {
  // Helper: map iconType string keys to real Vue components
  function mapIcons<T extends { iconType: string }>(items: T[]) {
    return items.map(item => ({
      ...item,
      icon: markRaw(icons[item.iconType])
    }))
  }

  // --- ref types: refs.x.value = data ---

  // Part 1: Boutiques
  refs.boutiques.value = demoBoutiques

  // Part 2: Carriers (configured)
  refs.carriers.value = demoCarriers

  // Part 3: Clients
  refs.clientsList.value = demoClientsList

  // Part 4: Client Stats
  refs.clientStats.value = demoClientStats

  // Part 5: Shipments
  refs.shipments.value = demoShipments

  // Part 8: User Balance
  refs.userBalance.value = demoUserBalance

  // Part 9: Urgent Actions (with icon mapping)
  refs.urgentActions.value = mapIcons(demoUrgentActions)

  // Part 11: Activity Logs (with icon mapping)
  refs.activityLogs.value = mapIcons(demoActivityLogs)

  // Part 12: Delayed Shipments
  refs.delayedShipments.value = demoDelayedShipments

  // Part 13: Delayed Patterns
  refs.delayedPatterns.value = demoDelayedPatterns

  // Part 14: Return Alerts
  refs.returnAlerts.value = demoReturnAlerts

  // Part 16: Payments
  refs.payments.value = demoPayments

  // Part 18: Returns List
  refs.returnsList.value = demoReturnsList

  // Part 19: Carriers Return Stats
  refs.carriersReturnStats.value = demoCarriersReturnStats

  // Part 21: Pickup Requests
  refs.pickupRequests.value = demoPickupRequests

  // Part 22: Pickup History
  refs.pickupHistory.value = demoPickupHistory

  // Part 23: Failed Pickups
  refs.failedPickupsData.value = demoFailedPickupsData

  // Part 24: Scheduled Pickups
  refs.scheduledPickups.value = demoScheduledPickups

  // Part 25: Team Members
  refs.teamMembers.value = demoTeamMembers

  // Part 26: Active Sessions
  refs.activeSessions.value = demoActiveSessions

  // Part 27: Chart Data
  refs.chartData.value = demoChartData

  // Part 29: Analytics KPI Comparison
  refs.analyticsKpiComparison.value = demoAnalyticsKpiComparison

  // Part 35: Failed Searches
  refs.failedSearches.value = demoFailedSearches

  // Part 36: Received Payments
  refs.receivedPaymentsData.value = demoReceivedPaymentsData

  // Part 38: Reconciliation by Carrier
  refs.reconciliationByCarrier.value = demoReconciliationByCarrier

  // Part 40: Revenue breakdowns
  refs.revenueByCategory.value = demoRevenueByCategory
  refs.revenueByRegion.value = demoRevenueByRegion
  refs.revenueChartData.value = demoRevenueChartData

  // Part 41: Return Losses
  refs.returnLossesByReason.value = demoReturnLossesByReason
  refs.returnLossesByCarrier.value = demoReturnLossesByCarrier
  refs.returnLossesDetails.value = demoReturnLossesDetails

  // Part 42: Invoices
  refs.invoices.value = demoInvoices

  // Part 43: Carrier Performance
  refs.carrierPerformance.value = demoCarrierPerformance

  // --- reactive types: Object.assign(refs.x, data) ---

  // Part 6: Dashboard Stats
  Object.assign(refs.dashboardStats, demoDashboardStats)

  // Part 7: Today Stats
  Object.assign(refs.todayStats, demoTodayStats)

  // Part 15: Financial Stats
  Object.assign(refs.financialStats, demoFinancialStats)

  // Part 16: Payment Stats
  refs.paymentStats.value = demoPaymentStats

  // Part 17: Returns Data
  Object.assign(refs.returnsData, demoReturnsData)

  // Part 20: Report Analytics
  Object.assign(refs.reportAnalytics, demoReportAnalytics)

  // Part 28: Analytics KPIs
  Object.assign(refs.analyticsKpis, demoAnalyticsKpis)

  // Part 30: Delivery Performance
  Object.assign(refs.deliveryPerformance, demoDeliveryPerformance)

  // Part 31: Return Intelligence
  Object.assign(refs.returnIntelligence, demoReturnIntelligence)

  // Part 32: Risk Zones
  Object.assign(refs.riskZones, demoRiskZones)

  // Part 33: Anomaly Detection
  Object.assign(refs.anomalyDetection, demoAnomalyDetection)

  // Part 34: Trends
  Object.assign(refs.trends, demoTrends)

  // Part 36b: Received Payments Stats
  Object.assign(refs.receivedPaymentsStats, demoReceivedPaymentsStats)

  // Part 37: Discrepancy Stats
  Object.assign(refs.discrepancyStats, demoDiscrepancyStats)

  // Part 39: Revenue Stats
  Object.assign(refs.revenueStats, demoRevenueStats)

  // Part 41: Return Losses Stats
  Object.assign(refs.returnLossesStats, demoReturnLossesStats)

  // Part 42: Invoices Stats
  Object.assign(refs.invoicesStats, demoInvoicesStats)

  // --- Part 10: Daily Tasks (only fill .tasks arrays, category structure exists) ---
  const taskMap = demoDailyTasks
  refs.dailyTasksCategories.value.forEach((category: any) => {
    const tasks = taskMap[category.id as keyof typeof taskMap]
    if (tasks) {
      category.tasks = tasks
    }
  })
}

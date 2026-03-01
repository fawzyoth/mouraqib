import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

file_path = r'C:\Users\Super\PycharmProjects\mouraqib\src\views\DeliveryTrackerView.vue'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines 1-24 are the AppShell opening tag (keep as-is, 0-indexed: 0-23)
# Lines 25-8749 are the feature sections to replace (0-indexed: 24-8748)
# Lines 8750-end are modals + script (keep as-is, 0-indexed: 8749+)

new_section = '''
    <!-- ============================================ -->
    <!-- Feature Sections (extracted components)      -->
    <!-- ============================================ -->

    <!-- Search Results Page -->
    <SearchResultsPage
      v-if="showSearchResultsPage"
      :shipments="shipments"
      :initial-query="searchResultsQuery"
      @close="closeSearchResultsPage"
      @select-result="(result) => { selectedShipment = result; showShipmentDetail = true; closeSearchResultsPage() }"
    />

    <!-- Shipments: All Shipments -->
    <ShipmentsList
      v-else-if="activeSection === 'all-shipments'"
      :shipments="shipments"
      :status-tabs="statusTabs"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @open-bulk-import="openBulkImport"
      @open-add-shipment="showAddShipmentModal = true"
      @select-shipment="(s) => { selectedShipment = s; showShipmentDetail = true }"
    />

    <!-- Clients: All Clients -->
    <ClientsList
      v-else-if="activeSection === 'all-clients'"
      :clients="clients"
      :client-stats="clientStats"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @open-add-client="activeSection = 'add-client'"
      @view-client="(c) => { selectedClient = c; showClientDetail = true }"
      @edit-client="(c) => { selectedClient = c }"
      @toggle-vip="toggleClientVip"
      @toggle-blocked="toggleClientBlocked"
    />

    <!-- Clients: Add Client -->
    <AddClientForm
      v-else-if="activeSection === 'add-client'"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @submit="addClient"
      @cancel="activeSection = 'all-clients'"
    />

    <!-- Clients: VIP -->
    <VipClients
      v-else-if="activeSection === 'vip-clients'"
      :clients="clients"
      :total-revenue="totalVipRevenue"
      :average-delivery-rate="avgVipDeliveryRate"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @view-client="(c) => { selectedClient = c; showClientDetail = true }"
      @remove-vip="toggleClientVip"
    />

    <!-- Clients: Blocked -->
    <BlockedClients
      v-else-if="activeSection === 'blocked-clients'"
      :clients="clients"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @view-client="(c) => { selectedClient = c; showClientDetail = true }"
      @unblock-client="toggleClientBlocked"
    />

    <!-- Clients: Statistics -->
    <ClientStatistics
      v-else-if="activeSection === 'client-stats'"
      :clients="clients"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Dashboard: Overview -->
    <DashboardOverview
      v-else-if="activeSection === 'overview'"
      :stats="dashboardStats"
      :recent-shipments="recentShipments"
      :urgent-actions="urgentActions"
      :delivery-chart-data="deliveryChartData"
      :delivery-chart-labels="deliveryChartLabels"
      :revenue-chart-data="revenueChartData"
      :revenue-chart-labels="revenueChartLabels"
      :today-date="todayDate"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @navigate="(section) => { activeSection = section }"
    />

    <!-- Dashboard: Today's Tasks -->
    <DashboardTodayTasks
      v-else-if="activeSection === 'today-shipments'"
      :categories="dailyTaskCategories"
      :summary-stats="tasksSummaryStats"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @toggle-task="toggleDailyTask"
      @complete-all-in-category="completeAllInCategory"
      @execute-task-action="executeTaskAction"
    />

    <!-- Dashboard: Delayed Shipments -->
    <DashboardDelayed
      v-else-if="activeSection === 'delayed-shipments'"
      :shipments="delayedShipments"
      :stats="delayedStats"
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

    <!-- Shipments: Create Shipment -->
    <CreateShipment
      v-else-if="activeSection === 'create-shipment'"
      :clients="clients"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @submit="handleCreateShipment"
      @reset="resetShipmentForm"
    />

    <!-- Settings: Notifications -->
    <NotificationSettings
      v-else-if="activeSection === 'notifications'"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Analytics: Global KPIs -->
    <GlobalKpis
      v-else-if="activeSection === 'global-kpis'"
      :analytics-date-range="analyticsDateRange"
      :analytics-kpis="analyticsKpis"
      :analytics-kpi-comparison="analyticsKpiComparison"
      :chart-data="analyticsChartData"
      :chart-labels="analyticsChartLabels"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @update:analytics-date-range="analyticsDateRange = $event"
    />

    <!-- Analytics: Delivery Performance -->
    <DeliveryPerformance
      v-else-if="activeSection === 'delivery-performance'"
      :analytics-date-range="analyticsDateRange"
      :delivery-performance="deliveryPerformanceData"
      :carriers="configuredCarriers"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @update:analytics-date-range="analyticsDateRange = $event"
    />

    <!-- Analytics: Return Intelligence -->
    <ReturnIntelligence
      v-else-if="activeSection === 'return-intelligence'"
      :analytics-date-range="analyticsDateRange"
      :return-intelligence="returnIntelligenceData"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @update:analytics-date-range="analyticsDateRange = $event"
    />

    <!-- Analytics: Risk Zones -->
    <RiskZones
      v-else-if="activeSection === 'risk-zones'"
      :risk-zones="riskZonesData"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Analytics: Anomaly Detection -->
    <AnomalyDetection
      v-else-if="activeSection === 'anomaly-detection'"
      :anomaly-detection="anomalyDetectionData"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Analytics: Trends -->
    <Trends
      v-else-if="activeSection === 'trends'"
      :trends-period="trendsPeriod"
      :trends="trendsData"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @update:trends-period="trendsPeriod = $event"
    />

    <!-- Analytics: Reports -->
    <AnalyticsReports
      v-else-if="activeSection === 'reports'"
      :reports="analyticsReports"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Pickups: Scan Pickup -->
    <ScanPickup
      v-else-if="activeSection === 'schedule-pickup'"
      :scan-input="scanInput"
      :scan-feedback="scanFeedback"
      :confirmed-shipments="confirmedShipments"
      :pickup-candidates="pickupCandidates"
      :confirmed-by-carrier="confirmedByCarrier"
      :confirmed-total-c-o-d="confirmedTotalCOD"
      :pickup-by-carrier="pickupByCarrier"
      :pending-pickups-count="pendingPickupsCount"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @update:scan-input="scanInput = $event"
      @handle-scan="handleScan"
      @open-pickup-confirmation="showPickupConfirmModal = true"
    />

    <!-- Pickups: History -->
    <PickupHistory
      v-else-if="activeSection === 'pickup-history'"
      :pickup-history="pickupHistoryData"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Shipments: Labels -->
    <ShipmentLabels
      v-else-if="activeSection === 'labels'"
      :shipments="shipments"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @print-selected="printSelectedLabels"
    />

    <!-- Returns: Active / Recovered / Lost -->
    <ReturnsList
      v-else-if="activeSection === 'active-returns' || activeSection === 'recovered-returns' || activeSection === 'lost-returns'"
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
      :returns-data="returnsValueData"
      :carriers-return-stats="carriersReturnStats"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Returns: Reports -->
    <ReturnReports
      v-else-if="activeSection === 'return-reports'"
      :report-period="returnReportPeriod"
      :report-analytics="returnReportAnalytics"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @update:report-period="returnReportPeriod = $event"
    />

    <!-- Carriers: Connected -->
    <ConnectedCarriers
      v-else-if="activeSection === 'connected-carriers'"
      :carriers="configuredCarriers"
      :carrier-stats="carrierStats"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @navigate="(section) => { activeSection = section }"
      @select-carrier="selectCarrier"
      @edit-carrier="editCarrier"
      @delete-carrier="deleteCarrier"
    />

    <!-- Carriers: Add Carrier -->
    <AddCarrier
      v-else-if="activeSection === 'add-carrier'"
      :carriers="deliveryCarriers"
      :carrier-wizard-step="carrierWizardStep"
      :modal-carrier-search-query="modalCarrierSearchQuery"
      :selected-carrier-for-modal="selectedCarrierForModal"
      :show-api-key="showApiKey"
      :new-carrier="newCarrier"
      :governorates="governorates"
      :is-testing-connection="isTestingConnection"
      :test-connection-result="testConnectionResult"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @close="activeSection = 'connected-carriers'"
      @save="saveNewCarrier"
    />

    <!-- Tracking Pages -->
    <TrackingPages
      v-else-if="activeSection === 'page-templates' || activeSection === 'my-tracking-page' || activeSection === 'page-branding' || activeSection === 'page-analytics' || activeSection === 'failed-searches'"
      :active-section="activeSection"
      :tracking-page="trackingPage"
      :page-templates="pageTemplates"
      :page-analytics="pageAnalyticsData"
      :failed-searches="failedSearches"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
    />

    <!-- Finance: Expected Payments -->
    <ExpectedPayments
      v-else-if="activeSection === 'expected-payments'"
      :payments="expectedPayments"
      :stats="expectedPaymentsStats"
      :carrier-filter="expectedCarrierFilter"
      :status-filter="expectedStatusFilter"
      :reconciliation="reconciliationData"
      :show-reconciliation="showReconciliation"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @update:carrier-filter="expectedCarrierFilter = $event"
      @update:status-filter="expectedStatusFilter = $event"
      @show-reconciliation="showReconciliation = true"
      @close-reconciliation="showReconciliation = false"
    />

    <!-- Finance: Received Payments -->
    <ReceivedPayments
      v-else-if="activeSection === 'received-payments'"
      :payments="receivedPayments"
      :stats="receivedPaymentsStats"
      :month="receivedPaymentsMonth"
      :carrier-filter="receivedCarrierFilter"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @update:month="receivedPaymentsMonth = $event"
      @update:carrier-filter="receivedCarrierFilter = $event"
    />

    <!-- Finance: Payment Discrepancies -->
    <PaymentDiscrepancies
      v-else-if="activeSection === 'payment-discrepancies'"
      :discrepancies="paymentDiscrepancies"
      :stats="discrepancyStats"
      :carrier-filter="discrepancyCarrierFilter"
      :discrepancy-filter="discrepancyTypeFilter"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @update:carrier-filter="discrepancyCarrierFilter = $event"
      @update:discrepancy-filter="discrepancyTypeFilter = $event"
    />

    <!-- Finance: Revenue -->
    <Revenue
      v-else-if="activeSection === 'revenue'"
      :revenue-data="revenueData"
      :period="revenuePeriod"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @update:period="revenuePeriod = $event"
    />

    <!-- Finance: Return Losses -->
    <ReturnLosses
      v-else-if="activeSection === 'return-losses'"
      :losses-data="returnLossesData"
      :month="returnLossesMonth"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @update:month="returnLossesMonth = $event"
    />

    <!-- Finance: Invoices -->
    <Invoices
      v-else-if="activeSection === 'invoices'"
      :invoices="invoices"
      :invoice-stats="invoiceStats"
      :invoices-tab="invoicesTab"
      :search="invoiceSearch"
      :status-filter="invoiceStatusFilter"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @update:invoices-tab="invoicesTab = $event"
      @update:search="invoiceSearch = $event"
      @update:status-filter="invoiceStatusFilter = $event"
    />

    <!-- Finance: Exports -->
    <Exports
      v-else-if="activeSection === 'exports'"
      :export-config="exportConfig"
      :recent-exports="recentExports"
      @toggle-sub-menu="subMenuOpen = !subMenuOpen"
      @update:config-field="(field, value) => { exportConfig[field] = value }"
    />

    <!-- Settings: Users & Roles -->
    <UsersRoles
      v-else-if="activeSection === 'users-roles'"
      :members="teamMembers"
      :roles="teamRoles"
      :boutiques="boutiques"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @update-members="teamMembers = $event"
    />

    <!-- Admin: Users -->
    <AdminUsers
      v-else-if="activeSection === 'admin-users'"
      :admin-users="adminUsers"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @open-charge-modal="openChargeModal"
    />

    <!-- Admin: Billing -->
    <AdminBilling
      v-else-if="activeSection === 'admin-billing'"
      :admin-users="adminUsers"
      :admin-transactions="adminTransactions"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @open-charge-modal="openChargeModal"
    />

    <!-- Admin: Transactions -->
    <AdminTransactions
      v-else-if="activeSection === 'admin-transactions'"
      :admin-transactions="adminTransactions"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Settings: Company Profile -->
    <CompanyProfile
      v-else-if="activeSection === 'company-profile'"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
      @save="saveCompanyProfile"
    />

    <!-- Settings: Security -->
    <SecuritySettings
      v-else-if="activeSection === 'security'"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Settings: Payment History -->
    <PaymentHistory
      v-else-if="activeSection === 'payment-history'"
      :payments="paymentHistory"
      :payment-stats="paymentHistoryStats"
      @toggle-submenu="subMenuOpen = !subMenuOpen"
    />

    <!-- Shipment Detail Panel (keep inline for now - will extract in Phase 5) -->
    <div
      v-if="showShipmentDetail && selectedShipment"
      class="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto"
    >
      <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Détails du colis</h3>
          <button @click="selectedShipment = null; showShipmentDetail = false" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div class="p-4 space-y-4">
        <div class="text-center py-4">
          <p class="text-lg font-mono font-bold text-gray-900 dark:text-white">{{ selectedShipment.trackingNumber }}</p>
          <span :class="[
            'mt-2 inline-block px-3 py-1 text-xs rounded-full font-medium',
            getStatusTextClass(selectedShipment.status)
          ]">{{ getStatusLabel(selectedShipment.status) }}</span>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Destinataire</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ selectedShipment.recipient }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Transporteur</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ selectedShipment.carrier }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Montant</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ selectedShipment.amount }} TND</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Date</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ new Date(selectedShipment.createdAt).toLocaleDateString('fr-FR') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Client Detail Panel -->
    <div
      v-if="showClientDetail && selectedClient"
      class="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto"
    >
      <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Détails du client</h3>
          <button @click="selectedClient = null; showClientDetail = false" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div class="p-4 space-y-4">
        <div class="text-center py-4">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2" :class="selectedClient.status === 'vip' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'">
            {{ selectedClient.name.charAt(0) }}
          </div>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedClient.name }}</p>
          <p class="text-sm text-gray-500">{{ selectedClient.phone }}</p>
        </div>
      </div>
    </div>

'''

before = lines[:24]  # Lines 1-24 (0-indexed: 0-23)
after = lines[8749:]  # Lines 8750+ (0-indexed: 8749+)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(before)
    f.write(new_section)
    f.writelines(after)

print(f"Done. Before: {len(lines)} lines")
with open(file_path, 'r', encoding='utf-8') as f:
    new_count = len(f.readlines())
print(f"After: {new_count} lines")

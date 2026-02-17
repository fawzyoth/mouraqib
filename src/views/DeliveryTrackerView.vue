<template>
  <AppShell
    :main-section="mainSection"
    :active-section="activeSection"
    :section-label="getMainSectionLabel(mainSection)"
    :nav-items="filteredMainNavigation"
    :sub-nav-items="currentSubNavigation"
    :user-name="authStore.user?.name || organization.name"
    :user-email="authStore.user?.email || organization.email"
    :user-initial="(authStore.user?.name || organization.name).charAt(0)"
    :balance="userBalance"
    :sidebar-open="sidebarOpen"
    :sub-menu-open="subMenuOpen"
    :shipments-count="shipments.length"
    :delivered-count="deliveredCount"
    @select-main="selectMainSection"
    @select-sub="(id) => { activeSection = id; showSearchResultsPage = false }"
    @toggle-menu="sidebarOpen = true"
    @close-menu="sidebarOpen = false"
    @close-submenu="subMenuOpen = false"
    @open-search="openGlobalSearch"
    @logout="handleLogout"
    @recharge="showRechargeModal = true"
  >

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

    <!-- Overlay for detail panel -->
    <div
      v-if="selectedShipment"
      @click="selectedShipment = null"
      class="fixed inset-0 bg-black/30 z-40"
    ></div>


    <!-- ============================================ -->
    <!-- Modal Components                             -->
    <!-- ============================================ -->

    <PickupConfirmModal
      :show="showPickupConfirmModal"
      :confirmed-shipments="confirmedShipments"
      :confirmed-by-carrier="confirmedByCarrier"
      @close="showPickupConfirmModal = false"
      @confirm="confirmScanPickup"
    />

    <AddShipmentModal
      :show="showAddShipmentModal"
      :clients="clients"
      :carriers="deliveryCarriers"
      @close="closeAddShipmentModal"
      @submit="addShipment"
      @open-new-client="openNewClientFromShipment"
    />

    <AddCarrierModal
      :show="showAddCarrierModal"
      :editing-carrier="editingCarrier"
      :available-carriers="deliveryCarriers"
      :governorats="governorates"
      @close="closeCarrierModal"
      @save="saveCarrier"
    />

    <PrintLabelModal
      :show="showPrintLabelModal"
      :shipment="labelToPrint"
      @close="closePrintModal"
      @print="printLabel"
    />

    <OrganizationModal
      :show="showOrganizationModal"
      @close="showOrganizationModal = false"
      @save="saveOrganization"
    />

    <RechargeModal
      :show="showRechargeModal"
      @close="showRechargeModal = false"
      @recharge="processRecharge"
    />

  </AppShell>


  <GlobalSearchModal
    :show="showGlobalSearch"
    :shipments="shipments"
    :clients="clients"
    @close="closeGlobalSearch"
    @select-result="(result) => { selectedShipment = result; showShipmentDetail = true; closeGlobalSearch() }"
    @navigate="(section) => { activeSection = section; closeGlobalSearch() }"
  />

  <BulkImportModal
    :show="showBulkImportModal"
    @close="showBulkImportModal = false"
    @import="processBulkImport"
  />

  <AddBoutiqueModal
    :show="showAddBoutiqueModal"
    :carriers="deliveryCarriers"
    :governorats="governorates"
    @close="showAddBoutiqueModal = false"
    @save="saveBoutique"
  />

  <ChargeAccountModal
    :show="showChargeModal"
    :user="selectedUserForCharge"
    :delivery-fees="deliveryFees"
    @close="closeChargeModal"
    @credit="processAccountCredit"
    @debit="processAccountCharge"
  />

</template>


<script setup lang="ts">
import { ref, computed, reactive, markRaw, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Home,
  Radar,
  Shield,
  FileText,
  Mail,
  BarChart3,
  RefreshCw,
  Grid3x3,
  Clock,
  Leaf,
  Smartphone,
  Lightbulb,
  HelpCircle,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Camera,
  Plus,
  Minus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowRight,
  FileSpreadsheet,
  LayoutGrid,
  Bell,
  Package,
  X,
  MessageSquare,
  Webhook,
  Truck,
  RotateCcw,
  Sparkles,
  Rss,
  MessageCircle,
  LayoutTemplate,
  Star,
  PanelLeft,
  Gift,
  Code,
  PanelLeftClose,
  Eye,
  EyeOff,
  Check,
  PackageOpen,
  AlertCircle,
  Printer,
  Banknote,
  User,
  MapPin,
  // New icons for restructured navigation
  LayoutDashboard,
  CalendarClock,
  Calendar,
  ArrowLeftRight,
  ArrowLeft,
  Building2,
  Wallet,
  TrendingUp,
  Activity,
  History,
  Filter,
  FileUp,
  FileCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Receipt,
  FileDown,
  Target,
  Brain,
  MapPinned,
  LineChart,
  FileBarChart,
  Building,
  Users,
  Plug,
  CreditCard,
  Key,
  Lock,
  CircleDot,
  PackageX,
  PackageCheck,
  Timer,
  MoreHorizontal,
  Globe,
  Palette,
  Layout,
  MousePointerClick,
  SearchX,
  Phone as PhoneIcon,
  Ban,
  BarChart2,
  TrendingDown,
  Gem,
  ShoppingBag,
  UserX,
  LogOut,
  Menu,
  ListFilter,
  Trash2,
  Save,
  Monitor,
  ScanBarcode,
  Loader2
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  shipmentsService,
  clientsService,
  boutiquesService,
  carriersService,
  pickupsService,
  transactionsService
} from '@/services'
import { seedDemoData } from '@/data/demo'
import type { Boutique, CarrierConfigField, DeliveryCarrier, TeamMember, ConfiguredCarrier, NewBoutiqueForm } from '@/types/delivery-tracker'
import { deliveryCarriers, standardConfigFields, carrierDeliveryFees } from '@/data/carriers-catalog'
import { governorates as governoratesData, boutiqueColors, tunisiaLocations, type DelegationData, type GouvernoratData } from '@/data/tunisia-locations'
import { useModal } from '@/composables/useModal'
import { toggleInArray } from '@/composables/useArrayToggle'
import { useLocalStorageRef } from '@/composables/useLocalStorage'
import { getStatusLabel, getStatusTextClass, getStatusDotClass, getRoleClass, getRoleLabel } from '@/composables/useStatusFormatting'
import { useNavigation, mainNavigation, subNavigation } from '@/composables/useNavigation'
import AppShell from '@/components/layout/AppShell.vue'

// Feature components
import SearchResultsPage from '@/components/features/shipments/SearchResultsPage.vue'
import ShipmentsList from '@/components/features/shipments/ShipmentsList.vue'
import CreateShipment from '@/components/features/shipments/CreateShipment.vue'
import ShipmentLabels from '@/components/features/shipments/ShipmentLabels.vue'
import ClientsList from '@/components/features/clients/ClientsList.vue'
import AddClientForm from '@/components/features/clients/AddClientForm.vue'
import VipClients from '@/components/features/clients/VipClients.vue'
import BlockedClients from '@/components/features/clients/BlockedClients.vue'
import ClientStatistics from '@/components/features/clients/ClientStatistics.vue'
import DashboardOverview from '@/components/features/dashboard/DashboardOverview.vue'
import DashboardTodayTasks from '@/components/features/dashboard/DashboardTodayTasks.vue'
import DashboardDelayed from '@/components/features/dashboard/DashboardDelayed.vue'
import DashboardReturnAlerts from '@/components/features/dashboard/DashboardReturnAlerts.vue'
import DashboardFinancialSnapshot from '@/components/features/dashboard/DashboardFinancialSnapshot.vue'
import DashboardActivityLog from '@/components/features/dashboard/DashboardActivityLog.vue'
import NotificationSettings from '@/components/features/settings/NotificationSettings.vue'
import GlobalKpis from '@/components/features/analytics/GlobalKpis.vue'
import DeliveryPerformance from '@/components/features/analytics/DeliveryPerformance.vue'
import ReturnIntelligence from '@/components/features/analytics/ReturnIntelligence.vue'
import RiskZones from '@/components/features/analytics/RiskZones.vue'
import AnomalyDetection from '@/components/features/analytics/AnomalyDetection.vue'
import Trends from '@/components/features/analytics/Trends.vue'
import AnalyticsReports from '@/components/features/analytics/AnalyticsReports.vue'
import ScanPickup from '@/components/features/pickups/ScanPickup.vue'
import PickupHistory from '@/components/features/pickups/PickupHistory.vue'
import ReturnsList from '@/components/features/returns/ReturnsList.vue'
import ReturnValue from '@/components/features/returns/ReturnValue.vue'
import ReturnReports from '@/components/features/returns/ReturnReports.vue'
import ConnectedCarriers from '@/components/features/carriers/ConnectedCarriers.vue'
import AddCarrier from '@/components/features/carriers/AddCarrier.vue'
import TrackingPages from '@/components/features/tracking/TrackingPages.vue'
import ExpectedPayments from '@/components/features/finance/ExpectedPayments.vue'
import ReceivedPayments from '@/components/features/finance/ReceivedPayments.vue'
import PaymentDiscrepancies from '@/components/features/finance/PaymentDiscrepancies.vue'
import Revenue from '@/components/features/finance/Revenue.vue'
import ReturnLosses from '@/components/features/finance/ReturnLosses.vue'
import Invoices from '@/components/features/finance/Invoices.vue'
import Exports from '@/components/features/finance/Exports.vue'
import UsersRoles from '@/components/features/settings/UsersRoles.vue'
import CompanyProfile from '@/components/features/settings/CompanyProfile.vue'
import SecuritySettings from '@/components/features/settings/SecuritySettings.vue'
import PaymentHistory from '@/components/features/settings/PaymentHistory.vue'
import AdminUsers from '@/components/features/admin/AdminUsers.vue'
import AdminBilling from '@/components/features/admin/AdminBilling.vue'
import AdminTransactions from '@/components/features/admin/AdminTransactions.vue'

// Modal components
import PickupConfirmModal from '@/components/modals/PickupConfirmModal.vue'
import AddShipmentModal from '@/components/modals/AddShipmentModal.vue'
import AddCarrierModal from '@/components/modals/AddCarrierModal.vue'
import PrintLabelModal from '@/components/modals/PrintLabelModal.vue'
import OrganizationModal from '@/components/modals/OrganizationModal.vue'
import RechargeModal from '@/components/modals/RechargeModal.vue'
import GlobalSearchModal from '@/components/modals/GlobalSearchModal.vue'
import BulkImportModal from '@/components/modals/BulkImportModal.vue'
import AddBoutiqueModal from '@/components/modals/AddBoutiqueModal.vue'
import ChargeAccountModal from '@/components/modals/ChargeAccountModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// Loading state
const isLoadingData = ref(false)

function handleLogout() {
  authStore.signOut()
  router.push('/signin')
}

// Admin role check - uses auth store's isPlatformAdmin
const isAdmin = computed(() => authStore.isPlatformAdmin)

// Navigation state (from composable - includes localStorage persistence)
const {
  mainSection,
  activeSection,
  showSearchResultsPage,
  filteredMainNavigation,
  currentSubNavigation,
  getMainSectionLabel,
  getSectionTitle,
  selectMainSection,
} = useNavigation(isAdmin)

// Mobile menu state
const sidebarOpen = ref(false)
const subMenuOpen = ref(false)

// Boutiques management (Boutique type imported from @/types/delivery-tracker)
const boutiques = ref<Boutique[]>([])

// User balance for package credits - starts at 0 for new accounts
const userBalance = ref({
  delivered: 0,
  returned: 0
})

// Recharge modal
const showRechargeModal = ref(false)
const rechargeForm = ref({
  delivered: 500,
  returned: 100,
  paymentMethod: 'card' as 'card' | 'bank' | 'd17'
})

const rechargeTotalPrice = computed(() => {
  return (rechargeForm.value.delivered * 0.150) + (rechargeForm.value.returned * 0.050)
})

function processRecharge() {
  const deliveredAdded = rechargeForm.value.delivered
  const returnedAdded = rechargeForm.value.returned

  // Add the purchased credits to balance
  userBalance.value.delivered += deliveredAdded
  userBalance.value.returned += returnedAdded

  // Close modal and reset form
  showRechargeModal.value = false
  rechargeForm.value = { delivered: 500, returned: 100, paymentMethod: 'card' }
}

const savedBoutiqueId = localStorage.getItem('deliveryTracker_currentBoutique')
const currentBoutiqueId = ref(savedBoutiqueId || '1')
const showBoutiqueDropdown = ref(false)
const showAddBoutiqueModal = ref(false)

const currentBoutique = computed(() => {
  return boutiques.value.find(b => b.id === currentBoutiqueId.value) || boutiques.value[0]
})

function selectBoutique(boutique: Boutique) {
  currentBoutiqueId.value = boutique.id
  localStorage.setItem('deliveryTracker_currentBoutique', boutique.id)
  showBoutiqueDropdown.value = false
}

// Boutique form data (governorates and boutiqueColors imported from @/data/tunisia-locations)
const governorates = [...governoratesData]

// Boutique form state
const boutiqueFormStep = ref(1)
const expandedCarrierConfig = ref<string | null>(null)
const testingConnection = ref<string | null>(null)
const connectionTestResults = ref<Record<string, { success: boolean; message: string }>>({})
const showPassword = ref<Record<string, boolean>>({})

const newBoutiqueForm = reactive<NewBoutiqueForm>({
  name: '',
  email: '',
  phone: '',
  address: '',
  governorate: '',
  color: '#f97316',
  selectedCarriers: [],
  carrierConfigs: {},
  assignedMembers: []
})

// Organization management (types imported from @/types/delivery-tracker)

const showOrganizationModal = ref(false)
const activeOrgTab = ref('general')
const showAddMemberForm = ref(false)
const showAddCarrierForm = ref(false)
const selectedCarrierToAdd = ref<DeliveryCarrier | null>(null)
const carrierConfigForm = ref<Record<string, string>>({})
const expandedConfiguredCarrier = ref<string | null>(null)

const organizationTabs = [
  { id: 'general', label: 'Général', icon: markRaw(Building) },
  { id: 'team', label: 'Équipe', icon: markRaw(Users) },
  { id: 'carriers', label: 'Transporteurs', icon: markRaw(Truck) },
]

// Organization - computed from auth store, with defaults for new users
const organization = computed(() => ({
  name: authStore.organization?.name || authStore.user?.name || 'Mon Organisation',
  email: authStore.organization?.email || authStore.user?.email || '',
  phone: authStore.organization?.phone || '',
  address: authStore.organization?.address || '',
  taxId: authStore.organization?.tax_id || '',
  rcNumber: authStore.organization?.rc_number || ''
}))

// Team members - empty by default, loaded from Supabase
const teamMembers = ref<any[]>([])

// Configured carriers - empty by default
const configuredCarriers = ref<ConfiguredCarrier[]>([])

const newMemberForm = reactive({
  name: '',
  email: '',
  role: '' as string,
  boutiques: [] as string[]
})

const availableCarriers = computed(() => {
  const configuredIds = configuredCarriers.value.map(c => c.id)
  return deliveryCarriers.filter(c => !configuredIds.includes(c.id))
})

// Organization carrier search
const orgCarrierSearchQuery = ref('')

const filteredAvailableCarriers = computed(() => {
  if (!orgCarrierSearchQuery.value) return availableCarriers.value
  const search = orgCarrierSearchQuery.value.toLowerCase()
  return availableCarriers.value.filter(carrier =>
    carrier.name.toLowerCase().includes(search) ||
    carrier.description.toLowerCase().includes(search)
  )
})

const canCreateBoutiqueSimple = computed(() => {
  return newBoutiqueForm.name.trim() && newBoutiqueForm.email.trim() && newBoutiqueForm.phone.trim()
})

function toggleMemberAssignment(memberId: string) {
  const index = newBoutiqueForm.assignedMembers.indexOf(memberId)
  if (index === -1) {
    newBoutiqueForm.assignedMembers.push(memberId)
  } else {
    newBoutiqueForm.assignedMembers.splice(index, 1)
  }
}

function goToTeamSettings() {
  closeAddBoutiqueModal()
  showOrganizationModal.value = true
  activeOrgTab.value = 'team'
}

function createBoutiqueSimple() {
  if (!canCreateBoutiqueSimple.value) return

  const initials = newBoutiqueForm.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  const newBoutique: Boutique = {
    id: Date.now().toString(),
    name: newBoutiqueForm.name,
    email: newBoutiqueForm.email,
    initials: initials || 'NB',
    color: newBoutiqueForm.color
  }

  boutiques.value.push(newBoutique)

  // Assign members to this boutique
  newBoutiqueForm.assignedMembers.forEach(memberId => {
    const member = teamMembers.value.find(m => m.id === memberId)
    if (member && !member.boutiques.includes(newBoutique.id)) {
      member.boutiques.push(newBoutique.id)
    }
  })

  selectBoutique(newBoutique)
  closeAddBoutiqueModal()
}

function closeOrganizationModal() {
  showOrganizationModal.value = false
  showAddMemberForm.value = false
  showAddCarrierForm.value = false
  selectedCarrierToAdd.value = null
  carrierConfigForm.value = {}
}

function toggleBoutiqueForMember(boutiqueId: string) {
  const index = newMemberForm.boutiques.indexOf(boutiqueId)
  if (index === -1) {
    newMemberForm.boutiques.push(boutiqueId)
  } else {
    newMemberForm.boutiques.splice(index, 1)
  }
}

function addTeamMember() {
  if (!newMemberForm.name || !newMemberForm.email || !newMemberForm.role) return

  const initials = newMemberForm.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#ec4899', '#6366f1']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  teamMembers.value.push({
    id: Date.now().toString(),
    name: newMemberForm.name,
    email: newMemberForm.email,
    initials,
    color: randomColor,
    role: newMemberForm.role as TeamMember['role'],
    boutiques: [...newMemberForm.boutiques]
  })

  // Reset form
  newMemberForm.name = ''
  newMemberForm.email = ''
  newMemberForm.role = ''
  newMemberForm.boutiques = []
  showAddMemberForm.value = false
}

function removeMember(memberId: string) {
  const index = teamMembers.value.findIndex(m => m.id === memberId)
  if (index !== -1) {
    teamMembers.value.splice(index, 1)
  }
}

// getRoleClass and getRoleLabel imported from @/composables/useStatusFormatting

function getBoutiqueById(boutiqueId: string): Boutique | undefined {
  return boutiques.value.find(b => b.id === boutiqueId)
}

function selectCarrierToAdd(carrier: DeliveryCarrier) {
  selectedCarrierToAdd.value = carrier
  carrierConfigForm.value = {}
}

function cancelAddCarrier() {
  showAddCarrierForm.value = false
  selectedCarrierToAdd.value = null
  carrierConfigForm.value = {}
}

async function testAndAddCarrier() {
  if (!selectedCarrierToAdd.value) return

  testingConnection.value = 'new'
  await new Promise(resolve => setTimeout(resolve, 1500))
  testingConnection.value = null

  // Add carrier
  configuredCarriers.value.push({
    ...selectedCarrierToAdd.value,
    config: { ...carrierConfigForm.value },
    zones: []
  })

  cancelAddCarrier()
}

function removeConfiguredCarrier(carrierId: string) {
  const index = configuredCarriers.value.findIndex(c => c.id === carrierId)
  if (index !== -1) {
    configuredCarriers.value.splice(index, 1)
  }
}

function toggleCarrierZone(carrierId: string, zone: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (!carrier) return

  if (!carrier.zones) carrier.zones = []

  const index = carrier.zones.indexOf(zone)
  if (index === -1) {
    carrier.zones.push(zone)
  } else {
    carrier.zones.splice(index, 1)
  }
}

function selectAllZones(carrierId: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (carrier) {
    carrier.zones = [...governorates]
  }
}

function clearAllZones(carrierId: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (carrier) {
    carrier.zones = []
  }
}

function saveOrganization() {
  // Save organization data (in real app, this would call an API)
  closeOrganizationModal()
}

// Initialize carrier configs when carriers are selected
watch(() => newBoutiqueForm.selectedCarriers, (carriers) => {
  carriers.forEach(carrierId => {
    if (!newBoutiqueForm.carrierConfigs[carrierId]) {
      newBoutiqueForm.carrierConfigs[carrierId] = {}
    }
  })
}, { deep: true })

function toggleCarrierSelection(carrierId: string) {
  const index = newBoutiqueForm.selectedCarriers.indexOf(carrierId)
  if (index === -1) {
    newBoutiqueForm.selectedCarriers.push(carrierId)
    newBoutiqueForm.carrierConfigs[carrierId] = {}
  } else {
    newBoutiqueForm.selectedCarriers.splice(index, 1)
    delete newBoutiqueForm.carrierConfigs[carrierId]
  }
}

function toggleCarrierConfig(carrierId: string) {
  expandedCarrierConfig.value = expandedCarrierConfig.value === carrierId ? null : carrierId
}

function getCarrierById(carrierId: string): DeliveryCarrier | undefined {
  return deliveryCarriers.find(c => c.id === carrierId)
}

function getCarrierConfigStatus(carrierId: string): string {
  const carrier = getCarrierById(carrierId)
  if (!carrier) return ''

  const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
  const requiredFields = carrier.configFields.filter(f => f.required)
  const filledRequired = requiredFields.filter(f => config[f.key]?.trim())

  if (filledRequired.length === 0) return 'Non configuré'
  if (filledRequired.length < requiredFields.length) return `${filledRequired.length}/${requiredFields.length} champs requis`
  return 'Configuré'
}

function togglePasswordVisibility(fieldKey: string) {
  showPassword.value[fieldKey] = !showPassword.value[fieldKey]
}

async function testCarrierConnection(carrierId: string) {
  testingConnection.value = carrierId
  // Simulate API test
  await new Promise(resolve => setTimeout(resolve, 1500))

  const carrier = getCarrierById(carrierId)
  const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
  const requiredFields = carrier?.configFields.filter(f => f.required) || []
  const allFilled = requiredFields.every(f => config[f.key]?.trim())

  connectionTestResults.value[carrierId] = {
    success: allFilled,
    message: allFilled ? 'Connexion réussie!' : 'Échec: Vérifiez vos identifiants'
  }
  testingConnection.value = null
}

const canProceedToNextStep = computed(() => {
  if (boutiqueFormStep.value === 1) {
    return newBoutiqueForm.name.trim() && newBoutiqueForm.email.trim() && newBoutiqueForm.phone.trim()
  }
  if (boutiqueFormStep.value === 2) {
    return newBoutiqueForm.selectedCarriers.length > 0
  }
  return true
})

const canCreateBoutique = computed(() => {
  // Check if all required fields for selected carriers are filled
  return newBoutiqueForm.selectedCarriers.every(carrierId => {
    const carrier = getCarrierById(carrierId)
    if (!carrier) return false

    const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
    return carrier.configFields
      .filter(f => f.required)
      .every(f => config[f.key]?.trim())
  })
})

function nextBoutiqueFormStep() {
  if (canProceedToNextStep.value && boutiqueFormStep.value < 3) {
    boutiqueFormStep.value++
  }
}

function closeAddBoutiqueModal() {
  showAddBoutiqueModal.value = false
  // Reset form
  boutiqueFormStep.value = 1
  newBoutiqueForm.name = ''
  newBoutiqueForm.email = ''
  newBoutiqueForm.phone = ''
  newBoutiqueForm.address = ''
  newBoutiqueForm.governorate = ''
  newBoutiqueForm.color = '#f97316'
  newBoutiqueForm.selectedCarriers = []
  newBoutiqueForm.carrierConfigs = {}
  newBoutiqueForm.assignedMembers = []
  connectionTestResults.value = {}
  expandedCarrierConfig.value = null
}

function createBoutique() {
  if (!canCreateBoutique.value) return

  // Generate initials from name
  const initials = newBoutiqueForm.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  // Create new boutique
  const newBoutique: Boutique = {
    id: Date.now().toString(),
    name: newBoutiqueForm.name,
    email: newBoutiqueForm.email,
    initials: initials || 'NB',
    color: newBoutiqueForm.color
  }

  boutiques.value.push(newBoutique)

  // Select the new boutique
  selectBoutique(newBoutique)

  // Close modal
  closeAddBoutiqueModal()
}

// Computed for delivered count
const deliveredCount = computed(() => {
  return shipments.value.filter(s => s.status === 'Delivered').length
})

// ==================== CLIENTS DATA ====================
const showAddClientModal = ref(false)
const showClientDetailsDrawer = ref(false)
const clientSearchQuery = ref('')
const clientFilterStatus = ref('all')
const selectedClientDetails = ref<any>(null)

// Client stats - starts at 0 for new accounts
const clientStats = ref({
  totalClients: 0,
  activeClients: 0,
  newThisMonth: 0,
  deliveryRate: 0,
  totalRevenue: 0
})

// Clients list - empty by default
const clientsList = ref<any[]>([])

const filteredClients = computed(() => {
  return clientsList.value.filter(client => {
    const matchesSearch = clientSearchQuery.value === '' ||
      client.name.toLowerCase().includes(clientSearchQuery.value.toLowerCase()) ||
      client.phone.includes(clientSearchQuery.value) ||
      client.address.toLowerCase().includes(clientSearchQuery.value.toLowerCase())
    const matchesStatus = clientFilterStatus.value === 'all' || client.status === clientFilterStatus.value
    return matchesSearch && matchesStatus
  })
})

function viewClientDetails(client: any) {
  selectedClientDetails.value = client
  showClientDetailsDrawer.value = true
}

function closeClientDetails() {
  showClientDetailsDrawer.value = false
}

function editClientData(client: any) {
  console.log('Edit client:', client)
}

// New Client Form
const newClientForm = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  region: '',
  postalCode: '',
  notes: '',
  status: 'active'
})

const statsTimeRange = ref('30d')

// Tunisian Governorates
const tunisianGovernorates = governorates

// VIP Clients computed
const vipClients = computed(() => {
  return clientsList.value.filter(client => client.status === 'vip')
})

const vipTotalRevenue = computed(() => {
  return vipClients.value.reduce((sum, client) => sum + client.totalSpent, 0)
})

const vipAverageDeliveryRate = computed(() => {
  if (vipClients.value.length === 0) return 0
  const total = vipClients.value.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / vipClients.value.length)
})

// Blocked Clients computed
const blockedClients = computed(() => {
  return clientsList.value.filter(client => client.status === 'blocked')
})

const blockedReturnsSaved = computed(() => {
  return blockedClients.value.reduce((sum, client) => sum + (client.totalOrders - client.deliveredOrders), 0) * 3
})

const blockedAverageDeliveryRate = computed(() => {
  if (blockedClients.value.length === 0) return 0
  const total = blockedClients.value.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / blockedClients.value.length)
})

// Active clients delivery rate
const activeClientsDeliveryRate = computed(() => {
  const activeClients = clientsList.value.filter(c => c.status === 'active')
  if (activeClients.length === 0) return 0
  const total = activeClients.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / activeClients.length)
})

// Statistics computed properties
const averageOrderValue = computed(() => {
  const totalSpent = clientsList.value.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOrders = clientsList.value.reduce((sum, c) => sum + c.totalOrders, 0)
  return totalOrders > 0 ? totalSpent / totalOrders : 0
})

const retentionRate = computed(() => {
  const repeatingClients = clientsList.value.filter(c => c.totalOrders > 1).length
  return clientsList.value.length > 0 ? Math.round((repeatingClients / clientsList.value.length) * 100) : 0
})

const lifetimeValue = computed(() => {
  return clientsList.value.length > 0
    ? clientsList.value.reduce((sum, c) => sum + c.totalSpent, 0) / clientsList.value.length
    : 0
})

const topClientsByRevenue = computed(() => {
  return [...clientsList.value].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)
})

const clientStatusDistribution = computed(() => {
  const statusMap: Record<string, { label: string; color: string; count: number }> = {
    active: { label: 'Actifs', color: 'bg-green-500', count: 0 },
    vip: { label: 'VIP', color: 'bg-purple-500', count: 0 },
    inactive: { label: 'Inactifs', color: 'bg-gray-400', count: 0 },
    blocked: { label: 'Bloqués', color: 'bg-red-500', count: 0 }
  }

  clientsList.value.forEach(client => {
    if (statusMap[client.status]) {
      statusMap[client.status].count++
    }
  })

  return Object.values(statusMap).map(s => ({
    ...s,
    percentage: clientsList.value.length > 0 ? (s.count / clientsList.value.length) * 100 : 0
  }))
})

const clientRegionDistribution = computed(() => {
  const regionMap: Record<string, number> = {}
  clientsList.value.forEach(client => {
    regionMap[client.region] = (regionMap[client.region] || 0) + 1
  })

  const colors = ['bg-primary-blue', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500']
  const bgColors = ['bg-primary-blue', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500']

  return Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      name,
      count,
      percentage: clientsList.value.length > 0 ? (count / clientsList.value.length) * 100 : 0,
      color: colors[index % colors.length],
      bgColor: bgColors[index % bgColors.length]
    }))
})

// Client management functions
function submitNewClient() {
  const newClient = {
    id: Date.now(),
    name: newClientForm.name,
    phone: newClientForm.phone,
    email: newClientForm.email,
    address: newClientForm.address,
    region: newClientForm.region,
    totalOrders: 0,
    deliveredOrders: 0,
    deliveryRate: 0,
    totalSpent: 0,
    status: newClientForm.status,
    memberSince: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  }
  clientsList.value.push(newClient)
  resetNewClientForm()
  activeSection.value = 'all-clients'
}

function submitNewClientFromModal() {
  const newClient = {
    id: Date.now(),
    name: newClientForm.name,
    phone: newClientForm.phone,
    email: newClientForm.email,
    address: newClientForm.address,
    region: newClientForm.region,
    totalOrders: 0,
    deliveredOrders: 0,
    deliveryRate: 0,
    totalSpent: 0,
    status: 'active',
    memberSince: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  }
  clientsList.value.push(newClient)
  resetNewClientForm()
  showAddClientModal.value = false
}

function resetNewClientForm() {
  newClientForm.name = ''
  newClientForm.phone = ''
  newClientForm.email = ''
  newClientForm.address = ''
  newClientForm.region = ''
  newClientForm.postalCode = ''
  newClientForm.notes = ''
  newClientForm.status = 'active'
}

function toggleClientVIP(client: any) {
  const idx = clientsList.value.findIndex(c => c.id === client.id)
  if (idx !== -1) {
    clientsList.value[idx].status = client.status === 'vip' ? 'active' : 'vip'
  }
}

function toggleClientBlocked(client: any) {
  const idx = clientsList.value.findIndex(c => c.id === client.id)
  if (idx !== -1) {
    clientsList.value[idx].status = client.status === 'blocked' ? 'active' : 'blocked'
  }
}

function removeFromVIP(client: any) {
  const idx = clientsList.value.findIndex(c => c.id === client.id)
  if (idx !== -1) {
    clientsList.value[idx].status = 'active'
  }
}

function unblockClient(client: any) {
  const idx = clientsList.value.findIndex(c => c.id === client.id)
  if (idx !== -1) {
    clientsList.value[idx].status = 'active'
  }
}

// Client Colis Data - empty by default
const clientColisData = ref<any[]>([])

function getClientColis(clientId: number) {
  return clientColisData.value.filter(c => c.clientId === clientId)
}

// Other state variables
const activeStatusTab = ref('all')
const searchQuery = ref('')
const showAddShipmentModal = ref(false)
const selectedShipment = ref<any>(null)
// Scan-based pickup workflow
const scanInput = ref('')
const scanLoading = ref(false)
const scanFeedback = ref<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)
const confirmedTrackingNumbers = ref<Set<string>>(new Set())
const showPickupConfirmModal = ref(false)
const pickupSchedule = reactive({ date: '', timeSlot: '', address: '123 Avenue Habib Bourguiba, Tunis, Tunisie' })
const confirmingPickup = ref(false)
const selectedLabels = ref<number[]>([])
const showPrintLabelModal = ref(false)
const labelToPrint = ref<any>(null)
const labelSearchQuery = ref('')
const labelFilterPrinted = ref('all')

// ==================== DASHBOARD DATA ====================

// Dashboard Stats
const dashboardStats = reactive({
  performanceScore: 0,
  todayDeliveries: 0,
  todayDelivered: 0,
  successRate: 0,
  lastWeekSuccessRate: 0,
  expectedCOD: 0,
  pendingConfirmations: 0,
  todayOrders: 0,
  yesterdayOrders: 0,
  ordersChange: 0,
  deliveredChange: 0,
  todayReturns: 0,
  returnsChange: 0,
  yesterdayDelivered: 0
})

// Urgent Actions
const urgentActions = ref<any[]>([])

// Weather Regions
const weatherRegions = ref<any[]>([])

// Today Stats
const todayStats = reactive({
  toConfirm: 0,
  inDelivery: 0,
  delivered: 0,
  toPrint: 0
})

// Orders to Confirm
const ordersToConfirm = ref<any[]>([])

// Delivery Timeline Data
const deliveryTimelineData = ref<any[]>([])

// Today's Shipments List
const todayShipmentsList = ref<any[]>([])

// ==================== DAILY TASKS ====================
const dailyTasksFilter = ref<'all' | 'pending' | 'completed'>('all')

const dailyTasksCategories = ref([
  {
    id: 'orders',
    name: 'Commandes à confirmer',
    icon: markRaw(FileCheck),
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600',
    tasks: [] as any[]
  },
  {
    id: 'labels',
    name: 'Bordereaux à imprimer',
    icon: markRaw(Printer),
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600',
    tasks: [] as any[]
  },
  {
    id: 'packages',
    name: 'Colis à préparer',
    icon: markRaw(Package),
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600',
    tasks: [] as any[]
  },
  {
    id: 'returns',
    name: 'Retours à traiter',
    icon: markRaw(RotateCcw),
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600',
    tasks: [] as any[]
  },
  {
    id: 'finance',
    name: 'Paiements',
    icon: markRaw(Banknote),
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600',
    tasks: [] as any[]
  }
])

// Computed stats for daily tasks
const dailyTasksStats = computed(() => {
  let total = 0
  let completed = 0
  dailyTasksCategories.value.forEach(cat => {
    total += cat.tasks.length
    completed += cat.tasks.filter(t => t.completed).length
  })
  return {
    total,
    completed,
    pending: total - completed,
    progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0
  }
})

// Filtered task categories
const filteredTaskCategories = computed(() => {
  if (dailyTasksFilter.value === 'all') {
    return dailyTasksCategories.value
  }

  return dailyTasksCategories.value.map(cat => ({
    ...cat,
    tasks: cat.tasks.filter(t =>
      dailyTasksFilter.value === 'completed' ? t.completed : !t.completed
    )
  })).filter(cat => cat.tasks.length > 0)
})

// Toggle task completion
function toggleTask(categoryId: string, taskId: number) {
  const category = dailyTasksCategories.value.find(c => c.id === categoryId)
  if (category) {
    const task = category.tasks.find(t => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      task.completedAt = task.completed ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
    }
  }
}

// Complete all tasks in category
function completeAllInCategory(categoryId: string) {
  const category = dailyTasksCategories.value.find(c => c.id === categoryId)
  if (category) {
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    category.tasks.forEach(task => {
      if (!task.completed) {
        task.completed = true
        task.completedAt = now
      }
    })
  }
}

// Execute task action (placeholder)
function executeTaskAction(task: any) {
  // In real implementation, this would open modals or navigate to appropriate pages
  alert(`Action: ${task.actionLabel} pour "${task.title}"`)
}

// ==================== END DAILY TASKS ====================

// Delayed Shipments
const delayedFilter = ref<'all' | '24h' | '48h' | 'critical'>('all')
const delayedDateFilter = ref<'all' | 'today' | '48h' | 'week' | 'month' | 'custom'>('all')
const delayedDateRangeStart = ref('')
const delayedDateRangeEnd = ref('')

const delayedShipments = ref<any[]>([])

// Delayed Patterns
const delayedPatterns = ref<any[]>([])

// Computed filtered delayed shipments by date
const filteredDelayedShipmentsByDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return delayedShipments.value.filter(shipment => {
    const shipmentDate = new Date(shipment.createdAt)
    shipmentDate.setHours(0, 0, 0, 0)

    switch (delayedDateFilter.value) {
      case 'today':
        return shipmentDate.getTime() === today.getTime()
      case '48h':
        const twoDaysAgo = new Date(today)
        twoDaysAgo.setDate(today.getDate() - 2)
        return shipmentDate >= twoDaysAgo
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return shipmentDate >= weekAgo
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return shipmentDate >= monthAgo
      case 'custom':
        if (delayedDateRangeStart.value && delayedDateRangeEnd.value) {
          const startDate = new Date(delayedDateRangeStart.value)
          const endDate = new Date(delayedDateRangeEnd.value)
          endDate.setHours(23, 59, 59, 999)
          return shipmentDate >= startDate && shipmentDate <= endDate
        }
        return true
      default:
        return true
    }
  })
})

// Computed filtered delayed shipments by severity (applied after date filter)
const filteredDelayedShipments = computed(() => {
  const dateFiltered = filteredDelayedShipmentsByDate.value
  if (delayedFilter.value === 'all') return dateFiltered
  if (delayedFilter.value === '24h') return dateFiltered.filter(s => s.delayDays === 1)
  if (delayedFilter.value === '48h') return dateFiltered.filter(s => s.delayDays >= 2 && s.delayDays <= 3)
  if (delayedFilter.value === 'critical') return dateFiltered.filter(s => s.delayDays > 3)
  return dateFiltered
})

// Final filtered list (combines both filters)
const filteredDelayedShipmentsFinal = computed(() => {
  return filteredDelayedShipments.value
})

// Return Alerts
const returnAlerts = ref<any[]>([])

// Financial Stats
const financialStats = reactive({
  pendingCOD: 0,
  pendingCODCount: 0,
  pendingPayments: 0,
  pendingCarriersCount: 0,
  deliveryFees: 0,
  netMargin: 0,
  marginPercent: 0,
  codByCarrier: [] as any[],
  overduePayments: [] as any[],
  cashFlowProjection: [] as any[]
})

// Activity Log
const activityFilters = reactive({
  type: 'all',
  period: 'today',
  search: ''
})

const activityLogs = ref<any[]>([])

// Grouped Activity Logs
const groupedActivityLogs = computed(() => {
  const filtered = activityLogs.value.filter(log => {
    if (activityFilters.type !== 'all' && log.type !== activityFilters.type) return false
    if (activityFilters.search && !log.message.toLowerCase().includes(activityFilters.search.toLowerCase()) &&
        (!log.tracking || !log.tracking.toLowerCase().includes(activityFilters.search.toLowerCase()))) return false
    return true
  })

  return filtered.reduce((groups: Record<string, typeof activityLogs.value>, log) => {
    const date = log.date
    if (!groups[date]) groups[date] = []
    groups[date].push(log)
    return groups
  }, {})
})

// ==================== END DASHBOARD DATA ====================

// Notification Flows
const notificationFlows = ref([
  { name: 'When shipment updates to info received', enabled: false, disabledAt: 'Jan 26, 2026 at 11:37 PM', emailsSent: 0, smsSent: 0 },
  { name: 'When shipment updates to in transit', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to out for delivery', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to available for pickup', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to delivered', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to exception', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to failed attempt', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
])

function toggleFlow(index: number) {
  notificationFlows.value[index].enabled = !notificationFlows.value[index].enabled
  if (!notificationFlows.value[index].enabled) {
    notificationFlows.value[index].disabledAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } else {
    notificationFlows.value[index].disabledAt = null
  }
}

// Members & Roles Management
const membersTab = ref('members')
const memberSearchQuery = ref('')
const showRoleFilter = ref(false)
const selectedRoleFilters = ref<string[]>([])
const showMemberModal = ref(false)
const showRoleModal = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')
const deleteTarget = ref<{ type: 'member' | 'role', id: number | string } | null>(null)
const editingMember = ref<any>(null)
const editingRole = ref<any>(null)

const memberForm = ref({
  name: '',
  email: '',
  role: '',
  status: 'active'
})

const roleForm = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

const availableRoles = ref([
  { id: 'owner', name: 'Owner', description: 'Propriétaire de l\'organisation. Toutes les permissions.', memberCount: 1, isDefault: true, isOwner: true, permissions: ['all'] },
  { id: 'admin', name: 'Admin', description: 'Peut gérer l\'organisation, les paramètres et la facturation.', memberCount: 2, isDefault: true, isOwner: false, permissions: ['users.manage', 'settings.manage', 'billing.view', 'shipments.all', 'reports.view'] },
  { id: 'manager', name: 'Manager', description: 'Peut gérer les colis et les clients.', memberCount: 3, isDefault: true, isOwner: false, permissions: ['shipments.all', 'clients.manage', 'reports.view'] },
  { id: 'support', name: 'Support Agent', description: 'Peut voir et mettre à jour les colis.', memberCount: 1, isDefault: true, isOwner: false, permissions: ['shipments.view', 'shipments.update', 'clients.view'] },
])

const permissionCategories = [
  {
    name: 'Colis',
    permissions: [
      { id: 'shipments.view', label: 'Voir les colis' },
      { id: 'shipments.create', label: 'Créer des colis' },
      { id: 'shipments.update', label: 'Modifier les colis' },
      { id: 'shipments.delete', label: 'Supprimer les colis' },
      { id: 'shipments.all', label: 'Toutes permissions colis' }
    ]
  },
  {
    name: 'Clients',
    permissions: [
      { id: 'clients.view', label: 'Voir les clients' },
      { id: 'clients.manage', label: 'Gérer les clients' }
    ]
  },
  {
    name: 'Utilisateurs',
    permissions: [
      { id: 'users.view', label: 'Voir les utilisateurs' },
      { id: 'users.manage', label: 'Gérer les utilisateurs' }
    ]
  },
  {
    name: 'Paramètres',
    permissions: [
      { id: 'settings.view', label: 'Voir les paramètres' },
      { id: 'settings.manage', label: 'Modifier les paramètres' },
      { id: 'billing.view', label: 'Voir la facturation' }
    ]
  },
  {
    name: 'Rapports',
    permissions: [
      { id: 'reports.view', label: 'Voir les rapports' },
      { id: 'reports.export', label: 'Exporter les rapports' }
    ]
  }
]

const filteredMembers = computed(() => {
  let members = teamMembers.value

  if (memberSearchQuery.value) {
    const query = memberSearchQuery.value.toLowerCase()
    members = members.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query)
    )
  }

  if (selectedRoleFilters.value.length > 0) {
    members = members.filter(m =>
      selectedRoleFilters.value.some(roleId => {
        const role = availableRoles.value.find(r => r.id === roleId)
        return role && m.role === role.name
      })
    )
  }

  return members
})

function openAddMemberModal() {
  editingMember.value = null
  memberForm.value = { name: '', email: '', role: '', status: 'active' }
  showMemberModal.value = true
}

function editMember(member: any) {
  editingMember.value = member
  memberForm.value = {
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status || 'active'
  }
  showMemberModal.value = true
}

function closeMemberModal() {
  showMemberModal.value = false
  editingMember.value = null
}

function saveMember() {
  if (!memberForm.value.name || !memberForm.value.email || !memberForm.value.role) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }

  if (editingMember.value) {
    const index = teamMembers.value.findIndex(m => m.id === editingMember.value.id)
    if (index !== -1) {
      teamMembers.value[index] = {
        ...teamMembers.value[index],
        name: memberForm.value.name,
        email: memberForm.value.email,
        role: memberForm.value.role,
        status: memberForm.value.status,
        initials: memberForm.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      }
    }
  } else {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
    teamMembers.value.push({
      id: Date.now(),
      name: memberForm.value.name,
      email: memberForm.value.email,
      role: memberForm.value.role,
      status: 'invited',
      lastLogin: 'Jamais',
      initials: memberForm.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    })
    updateRoleCounts()
  }

  closeMemberModal()
}

function confirmDeleteMember(member: any) {
  deleteTarget.value = { type: 'member', id: member.id }
  deleteConfirmMessage.value = `Êtes-vous sûr de vouloir supprimer ${member.name} ? Cette action est irréversible.`
  showDeleteConfirm.value = true
}

function openAddRoleModal() {
  editingRole.value = null
  roleForm.value = { name: '', description: '', permissions: [] }
  showRoleModal.value = true
}

function editRole(role: any) {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description || '',
    permissions: [...(role.permissions || [])]
  }
  showRoleModal.value = true
}

function closeRoleModal() {
  showRoleModal.value = false
  editingRole.value = null
}

function saveRole() {
  if (!roleForm.value.name) {
    alert('Veuillez entrer un nom de rôle')
    return
  }

  if (editingRole.value) {
    const index = availableRoles.value.findIndex(r => r.id === editingRole.value.id)
    if (index !== -1) {
      availableRoles.value[index] = {
        ...availableRoles.value[index],
        name: roleForm.value.name,
        description: roleForm.value.description,
        permissions: roleForm.value.permissions
      }
    }
  } else {
    availableRoles.value.push({
      id: 'custom-' + Date.now(),
      name: roleForm.value.name,
      description: roleForm.value.description,
      memberCount: 0,
      isDefault: false,
      isOwner: false,
      permissions: roleForm.value.permissions
    })
  }

  closeRoleModal()
}

function confirmDeleteRole(role: any) {
  deleteTarget.value = { type: 'role', id: role.id }
  deleteConfirmMessage.value = `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ? Les membres avec ce rôle seront déplacés vers le rôle par défaut.`
  showDeleteConfirm.value = true
}

function executeDelete() {
  if (!deleteTarget.value) return

  if (deleteTarget.value.type === 'member') {
    const index = teamMembers.value.findIndex(m => m.id === deleteTarget.value!.id)
    if (index !== -1) {
      teamMembers.value.splice(index, 1)
      updateRoleCounts()
    }
  } else if (deleteTarget.value.type === 'role') {
    const index = availableRoles.value.findIndex(r => r.id === deleteTarget.value!.id)
    if (index !== -1) {
      availableRoles.value.splice(index, 1)
    }
  }

  showDeleteConfirm.value = false
  deleteTarget.value = null
}

function updateRoleCounts() {
  availableRoles.value.forEach(role => {
    role.memberCount = teamMembers.value.filter(m => m.role === role.name).length
  })
}

function exportMembers() {
  const data = teamMembers.value.map(m => ({
    Nom: m.name,
    Email: m.email,
    Rôle: m.role,
    Statut: m.status || 'active',
    'Dernière connexion': m.lastLogin
  }))
  console.log('Export members:', data)
  alert('Export des membres en cours...')
}

// Company Profile
const companyProfile = ref({
  name: 'Ma Société SARL',
  taxId: '1234567ABC',
  email: 'contact@masociete.tn',
  phone: '+216 71 234 567',
  address: '123 Rue de la Liberté',
  city: 'Tunis',
  postalCode: '1000',
  currency: 'TND',
  timezone: 'Africa/Tunis'
})

function saveCompanyProfile() {
  // Save company profile logic
  alert('Profil entreprise enregistré avec succès!')
}

// Security Settings
const securitySettings = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false
})

const activeSessions = ref<any[]>([])

function changePassword() {
  if (securitySettings.value.newPassword !== securitySettings.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }
  if (securitySettings.value.newPassword.length < 8) {
    alert('Le mot de passe doit contenir au moins 8 caractères')
    return
  }
  alert('Mot de passe modifié avec succès!')
  securitySettings.value.currentPassword = ''
  securitySettings.value.newPassword = ''
  securitySettings.value.confirmPassword = ''
}

// Payment History
const paymentFilter = ref('all')
const paymentStats = ref({
  totalPaid: 0,
  pending: 0,
  invoiceCount: 0
})

const payments = ref<any[]>([])

const filteredPayments = computed(() => {
  if (paymentFilter.value === 'all') return payments.value
  return payments.value.filter(p => p.status === paymentFilter.value)
})

// ==========================================
// Global Search (Notion-style Command Palette)
// ==========================================
const showGlobalSearch = ref(false)
const globalSearchQuery = ref('')
const globalSearchInput = ref<HTMLInputElement | null>(null)
const selectedSearchIndex = ref(0)
const recentSearches = ref<string[]>([])

// Full Search Results Page (showSearchResultsPage from useNavigation)
const searchResultsQuery = ref('')
const searchResultsFilter = ref<'all' | 'pending' | 'delivered' | 'in-transit' | 'returned'>('all')
const searchResultsSort = ref<'date' | 'tracking' | 'recipient' | 'amount'>('date')

const searchSuggestions = [
  { type: 'tracking', label: 'Rechercher par numéro de suivi', hint: 'Ex: TN-2026-0001', icon: markRaw(Package) },
  { type: 'phone', label: 'Rechercher par téléphone', hint: 'Ex: +216 22 333 444', icon: markRaw(PhoneIcon) },
  { type: 'name', label: 'Rechercher par nom', hint: 'Nom du destinataire ou client', icon: markRaw(User) },
  { type: 'barcode', label: 'Scanner un code-barres', hint: 'Utiliser le scanner', icon: markRaw(Search) },
]

const globalSearchResults = computed(() => {
  if (!globalSearchQuery.value || globalSearchQuery.value.length < 2) return []

  const query = globalSearchQuery.value.toLowerCase().trim()

  return shipments.value.filter(shipment => {
    return (
      shipment.trackingNumber.toLowerCase().includes(query) ||
      shipment.recipient.toLowerCase().includes(query) ||
      shipment.recipientPhone.toLowerCase().includes(query) ||
      shipment.recipientAddress.toLowerCase().includes(query) ||
      (shipment.orderId && shipment.orderId.toLowerCase().includes(query))
    )
  }).slice(0, 10)
})

// Full search results (no limit, with filters)
const fullSearchResults = computed(() => {
  if (!searchResultsQuery.value || searchResultsQuery.value.length < 2) return []

  const query = searchResultsQuery.value.toLowerCase().trim()

  let results = shipments.value.filter(shipment => {
    return (
      shipment.trackingNumber.toLowerCase().includes(query) ||
      shipment.recipient.toLowerCase().includes(query) ||
      shipment.recipientPhone.toLowerCase().includes(query) ||
      shipment.recipientAddress.toLowerCase().includes(query) ||
      (shipment.orderId && shipment.orderId.toLowerCase().includes(query))
    )
  })

  // Apply status filter
  if (searchResultsFilter.value !== 'all') {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'delivered': 'Delivered',
      'in-transit': 'Out for delivery',
      'returned': 'Returned'
    }
    results = results.filter(s => s.status === statusMap[searchResultsFilter.value])
  }

  // Apply sorting
  results = [...results].sort((a, b) => {
    switch (searchResultsSort.value) {
      case 'tracking':
        return a.trackingNumber.localeCompare(b.trackingNumber)
      case 'recipient':
        return a.recipient.localeCompare(b.recipient)
      case 'amount':
        return b.amount - a.amount
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return results
})

// Open full search results page
function openSearchResultsPage() {
  searchResultsQuery.value = globalSearchQuery.value
  searchResultsFilter.value = 'all'
  closeGlobalSearch()
  showSearchResultsPage.value = true
}

// Close search results page
function closeSearchResultsPage() {
  showSearchResultsPage.value = false
  searchResultsQuery.value = ''
}

function openGlobalSearch() {
  showGlobalSearch.value = true
  globalSearchQuery.value = ''
  selectedSearchIndex.value = 0
  nextTick(() => {
    globalSearchInput.value?.focus()
  })
}

function closeGlobalSearch() {
  showGlobalSearch.value = false
  globalSearchQuery.value = ''
  selectedSearchIndex.value = 0
}

function navigateSearchResults(direction: number) {
  const items = globalSearchQuery.value ? globalSearchResults.value : searchSuggestions
  const maxIndex = items.length - 1

  selectedSearchIndex.value += direction
  if (selectedSearchIndex.value < 0) selectedSearchIndex.value = maxIndex
  if (selectedSearchIndex.value > maxIndex) selectedSearchIndex.value = 0
}

function selectSearchResult() {
  if (!globalSearchQuery.value) {
    // Select a suggestion
    const suggestion = searchSuggestions[selectedSearchIndex.value]
    if (suggestion) {
      applySearchSuggestion(suggestion)
    }
  } else if (globalSearchResults.value.length > 0) {
    // Select a result
    const result = globalSearchResults.value[selectedSearchIndex.value]
    if (result) {
      openSearchResult(result)
    }
  }
}

function applySearchSuggestion(suggestion: any) {
  // Focus input and maybe add a prefix based on suggestion type
  globalSearchInput.value?.focus()
}

function openSearchResult(result: any) {
  // Add to recent searches
  if (!recentSearches.value.includes(result.trackingNumber)) {
    recentSearches.value.unshift(result.trackingNumber)
    if (recentSearches.value.length > 5) recentSearches.value.pop()
  }

  // Close search and navigate to shipment details
  closeGlobalSearch()

  // Open shipment detail (reuse existing viewShipmentDetail function if available)
  selectedShipment.value = result
  showShipmentDetail.value = true
}

// Keyboard shortcut for global search (Cmd+K / Ctrl+K)
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (showGlobalSearch.value) {
      closeGlobalSearch()
    } else {
      openGlobalSearch()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)

  if (authStore.isDemoMode) {
    seedDemoData(
      {
        boutiques, configuredCarriers, clientsList, clientStats,
        shipments, carriers, dashboardStats, todayStats, userBalance,
        urgentActions, dailyTasksCategories, activityLogs,
        delayedShipments, delayedPatterns, returnAlerts, financialStats,
        payments, paymentStats, returnsData, returnsList, carriersReturnStats,
        reportAnalytics, pickupRequests, pickupHistory, failedPickupsData,
        scheduledPickups, teamMembers, activeSessions,
        chartData, analyticsKpis, analyticsKpiComparison,
        deliveryPerformance, returnIntelligence, riskZones,
        anomalyDetection, trends, failedSearches,
        receivedPaymentsData, receivedPaymentsStats, discrepancyStats, reconciliationByCarrier,
        revenueStats, revenueByCategory, revenueByRegion, revenueChartData,
        returnLossesStats, returnLossesByReason, returnLossesByCarrier,
        returnLossesDetails, invoicesStats, invoices, carrierPerformance
      },
      { FileCheck, AlertTriangle, RotateCcw, Clock, Package, Truck, Banknote, CheckCircle }
    )
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

// ==========================================
// Bulk Import
// ==========================================
const showBulkImportModal = ref(false)
const bulkImportTab = ref<'excel' | 'manual'>('excel')
const isDragging = ref(false)
const importedFile = ref<File | null>(null)
const importedFileRows = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)

const bulkShipmentRows = ref([
  { recipient: '', phone: '', address: '', amount: null },
  { recipient: '', phone: '', address: '', amount: null },
  { recipient: '', phone: '', address: '', amount: null },
])

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function processFile(file: File) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]

  if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    alert('Format de fichier non supporté. Veuillez utiliser un fichier Excel (.xlsx, .xls) ou CSV.')
    return
  }

  importedFile.value = file
  // Simulate detecting rows (in real app, you'd parse the file)
  importedFileRows.value = Math.floor(Math.random() * 50) + 10
}

function downloadImportTemplate() {
  // Create a simple CSV template
  const headers = ['Destinataire', 'Téléphone', 'Adresse', 'Ville', 'Montant', 'Notes']
  const exampleRow = ['Ahmed Ben Ali', '+216 22 333 444', '15 Rue de la Liberté', 'Tunis', '45.00', 'Livraison express']

  const csvContent = [
    headers.join(','),
    exampleRow.join(','),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'modele_import_colis.csv'
  link.click()
}

function addBulkShipmentRow() {
  bulkShipmentRows.value.push({ recipient: '', phone: '', address: '', amount: null })
}

function removeBulkShipmentRow(index: number) {
  if (bulkShipmentRows.value.length > 1) {
    bulkShipmentRows.value.splice(index, 1)
  }
}

function processBulkImport() {
  if (bulkImportTab.value === 'excel') {
    if (!importedFile.value) return

    // In a real app, you would parse the Excel file here
    alert(`Import de ${importedFileRows.value} colis depuis ${importedFile.value.name} réussi!`)
    importedFile.value = null
    importedFileRows.value = 0
    showBulkImportModal.value = false
  } else {
    // Manual multi-creation
    const validRows = bulkShipmentRows.value.filter(r => r.recipient && r.phone)
    if (validRows.length === 0) return

    // In a real app, you would create the shipments here
    alert(`${validRows.length} colis créés avec succès!`)

    // Reset the form
    bulkShipmentRows.value = [
      { recipient: '', phone: '', address: '', amount: null },
      { recipient: '', phone: '', address: '', amount: null },
      { recipient: '', phone: '', address: '', amount: null },
    ]
    showBulkImportModal.value = false
  }
}

function openBulkImport() {
  showBulkImportModal.value = true
  bulkImportTab.value = 'excel'
  importedFile.value = null
  importedFileRows.value = 0
}

// Tracking Page Templates
const trackingPageTemplates = ref([
  {
    id: 1,
    name: 'Moderne Minimaliste',
    description: 'Design épuré avec focus sur les informations essentielles',
    gradientClass: 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
    accentClass: 'bg-orange-500',
    isPopular: true
  },
  {
    id: 2,
    name: 'Professionnel',
    description: 'Style corporate avec timeline détaillée',
    gradientClass: 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
    accentClass: 'bg-blue-500',
    isPopular: false
  },
  {
    id: 3,
    name: 'Coloré & Dynamique',
    description: 'Design vibrant avec animations et icônes',
    gradientClass: 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
    accentClass: 'bg-purple-500',
    isPopular: false
  },
  {
    id: 4,
    name: 'E-commerce',
    description: 'Optimisé pour les boutiques en ligne',
    gradientClass: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
    accentClass: 'bg-green-500',
    isPopular: true
  },
  {
    id: 5,
    name: 'Dark Mode',
    description: 'Thème sombre élégant',
    gradientClass: 'from-gray-800 to-gray-900',
    accentClass: 'bg-orange-500',
    isPopular: false
  },
  {
    id: 6,
    name: 'Carte Interactive',
    description: 'Avec suivi géographique en temps réel',
    gradientClass: 'from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30',
    accentClass: 'bg-cyan-500',
    isPopular: false
  },
])

// Failed Searches (customers who couldn't find their order)
const failedSearches = ref<any[]>([])

const newShipment = reactive({
  // Section 1: Expédition
  trackingNumber: '',
  carrier: '',
  type: 'normal' as 'normal' | 'exchange',
  // Exchange fields
  exchangeReason: '',
  exchangeItemCount: 1,
  exchangeImage: null as string | null,
  exchangeDescription: '',
  // Section 2: Destination
  customerName: '',
  phone: '',
  phoneSecondary: '',
  address: '',
  gouvernorat: '',
  delegation: '',
  locality: '',
  postalCode: '',
  // Section 3: Produit
  productName: '',
  isFragile: false,
  description: '',
  productPrice: 0,
  deliveryFee: 7,
  reference: '',
  amount: 0,
  clientId: null as number | null
})

// Shipment Client Autocomplete
const shipmentClientSearch = ref('')
const showClientSuggestions = ref(false)
const selectedShipmentClient = ref<any>(null)

const filteredShipmentClients = computed(() => {
  if (shipmentClientSearch.value.length < 1) return []
  const search = shipmentClientSearch.value.toLowerCase()
  return clientsList.value.filter(client =>
    client.name.toLowerCase().includes(search) ||
    client.phone.includes(search) ||
    client.address.toLowerCase().includes(search)
  ).slice(0, 5)
})

// Carrier Search
const carrierSearchQuery = ref('')

const filteredCarriers = computed(() => {
  if (!carrierSearchQuery.value) return deliveryCarriers
  const search = carrierSearchQuery.value.toLowerCase()
  return deliveryCarriers.filter(carrier =>
    carrier.name.toLowerCase().includes(search) ||
    carrier.description.toLowerCase().includes(search)
  )
})

function getCarrierInitials(name: string): string {
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const canAddShipment = computed(() => {
  return (selectedShipmentClient.value || newShipment.customerName) &&
    newShipment.address &&
    newShipment.phone &&
    newShipment.amount > 0 &&
    newShipment.carrier
})

function onShipmentClientSearch() {
  showClientSuggestions.value = true
  selectedShipmentClient.value = null
}

function selectClientForShipment(client: any) {
  selectedShipmentClient.value = client
  shipmentClientSearch.value = client.name
  showClientSuggestions.value = false
  // Auto-fill fields
  newShipment.customerName = client.name
  newShipment.phone = client.phone
  newShipment.address = client.address
  newShipment.gouvernorat = client.region
  newShipment.clientId = client.id
}

function clearSelectedClient() {
  selectedShipmentClient.value = null
  shipmentClientSearch.value = ''
  newShipment.customerName = ''
  newShipment.phone = ''
  newShipment.address = ''
  newShipment.clientId = null
}

function handleExchangeImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newShipment.exchangeImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function closeAddShipmentModal() {
  showAddShipmentModal.value = false
  clearSelectedClient()
  // Reset form
  newShipment.trackingNumber = ''
  newShipment.carrier = ''
  newShipment.description = ''
  newShipment.amount = 0
  newShipment.gouvernorat = ''
}

function openNewClientFromShipment() {
  // Pre-fill new client form with searched name
  newClientForm.name = shipmentClientSearch.value
  showAddClientModal.value = true
  showClientSuggestions.value = false
}

function useNewClientName() {
  // Use the searched text as new client name without selecting existing
  newShipment.customerName = shipmentClientSearch.value
  selectedShipmentClient.value = null
  showClientSuggestions.value = false
}

// tunisiaLocations, DelegationData, GouvernoratData imported from @/data/tunisia-locations

// Computed: Available gouvernorats
const gouvernorats = computed(() => Object.keys(tunisiaLocations))

// Computed: Available delegations based on selected gouvernorat
const availableDelegations = computed(() => {
  if (!newShipment.gouvernorat || !tunisiaLocations[newShipment.gouvernorat]) return []
  return Object.keys(tunisiaLocations[newShipment.gouvernorat].delegations)
})

// Computed: Available localities based on selected delegation
const availableLocalities = computed(() => {
  if (!newShipment.gouvernorat || !newShipment.delegation) return []
  const delegations = tunisiaLocations[newShipment.gouvernorat]?.delegations
  if (!delegations || !delegations[newShipment.delegation]) return []
  return delegations[newShipment.delegation].localities
})

// Watch gouvernorat to reset delegation and locality
watch(() => newShipment.gouvernorat, () => {
  newShipment.delegation = ''
  newShipment.locality = ''
  newShipment.postalCode = ''
})

// Watch delegation to reset locality and update postal code
watch(() => newShipment.delegation, () => {
  newShipment.locality = ''
  if (newShipment.gouvernorat && newShipment.delegation) {
    const delegations = tunisiaLocations[newShipment.gouvernorat]?.delegations
    if (delegations && delegations[newShipment.delegation]) {
      newShipment.postalCode = delegations[newShipment.delegation].postalCode
    }
  }
})

// Computed: Total price
const totalPrice = computed(() => {
  return (newShipment.productPrice || 0) + (newShipment.deliveryFee || 0)
})

// Generate reference number
function generateReference() {
  const prefix = 'REF'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Status tabs - counts computed from actual shipments
const statusTabs = computed(() => [
  { id: 'all', label: 'Tous', count: shipments.value.length },
  { id: 'exception', label: 'Exception', count: shipments.value.filter(s => s.status === 'exception').length },
  { id: 'failed', label: 'Tentative échouée', count: shipments.value.filter(s => s.status === 'failed').length },
  { id: 'expired', label: 'Expiré', count: shipments.value.filter(s => s.status === 'expired').length },
  { id: 'out-for-delivery', label: 'En livraison', count: shipments.value.filter(s => s.status === 'out_for_delivery').length },
  { id: 'delivered', label: 'Livré', count: shipments.value.filter(s => s.status === 'delivered').length },
  { id: 'pending', label: 'En attente', count: shipments.value.filter(s => s.status === 'pending').length },
])

// Shipments - empty by default, loaded from Supabase or seeded in demo mode
const shipments = ref<any[]>([])

// Carriers - empty by default, loaded from Supabase
const carriers = ref<any[]>([])

// New carrier form
const newCarrier = reactive({
  name: '',
  apiId: '',
  apiKey: '',
  fraisColisLivres: 7.00,
  fraisColisRetour: 5.00,
  fraisColisEchange: 8.00,
  fraisColisBig: 12.00,
  fraisColisPickup: 3.00,
  totalFraisLivraison: 7.00,
  fraisPaiement: 1.5,
  retenuPassage: 0.00,
  allRegions: true,
  regions: [] as string[]
})

const showAddCarrierModal = ref(false)
const editingCarrier = ref<number | null>(null)
const selectedCarrier = ref<typeof carriers.value[0] | null>(null)

// Carrier wizard state
const carrierWizardStep = ref(1)
const showApiKey = ref(false)

// Modal carrier selection
const modalCarrierSearchQuery = ref('')
const selectedModalCarrier = ref<typeof deliveryCarriers[0] | null>(null)

const filteredModalCarriers = computed(() => {
  if (!modalCarrierSearchQuery.value) return deliveryCarriers
  const search = modalCarrierSearchQuery.value.toLowerCase()
  return deliveryCarriers.filter(carrier =>
    carrier.name.toLowerCase().includes(search) ||
    carrier.description.toLowerCase().includes(search)
  )
})

function selectCarrierFromList(carrier: typeof deliveryCarriers[0]) {
  selectedModalCarrier.value = carrier
  newCarrier.name = carrier.name
  // Set default delivery fee based on carrier
  const fee = carrierDeliveryFees[carrier.name] || 7
  newCarrier.fraisColisLivres = fee
}

// Returns tracking data (synced from carriers)
const isSyncingReturns = ref(false)
const activeReturnsFilter = ref<'all' | 'on-time' | 'delayed'>('all')
// Returns data - starts at 0 for new accounts
const returnsData = reactive({
  active: 0,
  recovered: 0,
  lost: 0,
  total: 0,
  totalValue: 0,
  recoveredValue: 0,
  pendingValue: 0,
  lostValue: 0
})

// Active returns statistics (on-time vs delayed)
const activeReturnsStats = computed(() => {
  const activeRetours = returnsList.value.filter(r => r.status === 'En transit')
  const delayed = activeRetours.filter(r => r.isDelayed)
  const onTime = activeRetours.filter(r => !r.isDelayed)
  return {
    total: activeRetours.length,
    delayed: delayed.length,
    onTime: onTime.length,
    delayedPercent: activeRetours.length > 0 ? Math.round((delayed.length / activeRetours.length) * 100) : 0,
    onTimePercent: activeRetours.length > 0 ? Math.round((onTime.length / activeRetours.length) * 100) : 0
  }
})

// Statistics per carrier for return value page - empty by default
const carriersReturnStats = ref<any[]>([])

// Report analytics data - empty by default
const reportPeriod = ref('month')
const reportAnalytics = reactive({
  totalReturns: 0,
  avgAttempts: 0,
  multipleAttemptsCost: 0,
  reasonsBreakdown: [] as any[],
  attemptsBreakdown: [] as any[],
  carrierComparison: [] as any[],
  productIssues: [] as any[],
  problematicZones: [] as any[],
  carrierAdvice: '',
  carrierImpact: 0,
  productAdvice: '',
  productImpact: 0,
  processAdvice: '',
  processImpact: 0
})

// Returns list - empty by default
const returnsList = ref<any[]>([])

// Computed: Filtered returns based on active section
const filteredReturns = computed(() => {
  const statusMap: Record<string, string> = {
    'active-returns': 'En transit',
    'recovered-returns': 'Récupéré',
    'lost-returns': 'Perdu'
  }

  const targetStatus = statusMap[activeSection.value]
  if (targetStatus) {
    let filtered = returnsList.value.filter(r => r.status === targetStatus)

    // Apply on-time/delayed filter for active returns
    if (activeSection.value === 'active-returns' && activeReturnsFilter.value !== 'all') {
      if (activeReturnsFilter.value === 'delayed') {
        filtered = filtered.filter(r => r.isDelayed)
      } else if (activeReturnsFilter.value === 'on-time') {
        filtered = filtered.filter(r => !r.isDelayed)
      }
    }

    return filtered
  }

  // For other sections, return all
  return returnsList.value
})

// Computed: Section title for returns
const returnsSectionTitle = computed(() => {
  const titles: Record<string, string> = {
    'active-returns': 'Retours en transit',
    'recovered-returns': 'Retours récupérés',
    'lost-returns': 'Retours perdus',
    'return-value': 'Valeur des retours',
    'return-reports': 'Rapports de retours'
  }
  return titles[activeSection.value] || 'Suivi des Retours'
})

const chartData = ref<number[]>([])
const chartLabels = ref(['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'])

// ==================== ANALYTICS DATA ====================
const analyticsDateRange = ref('30')
const trendsPeriod = ref('monthly')
const riskZoneFilter = ref('all')

// Global KPIs
const analyticsKpis = reactive({
  totalShipments: 0,
  deliveryRate: 0,
  avgTransitTime: 0,
  totalRevenue: 0,
  returnRate: 0,
  exceptionRate: 0,
  customerSatisfaction: 0
})

const analyticsKpiComparison = ref<any[]>([])

// Delivery Performance
const deliveryPerformance = reactive({
  successfulDeliveries: 0,
  totalAttempts: 0,
  firstAttemptRate: 0,
  avgDeliveryTime: 0,
  onTimeRate: 0,
  regionalPerformance: [] as any[]
})

// Return Intelligence
const returnIntelligence = reactive({
  totalReturns: 0,
  lostRevenue: 0,
  recoveredReturns: 0,
  recoveryRate: 0,
  returnReasons: [] as any[],
  returnTrend: [] as number[],
  recommendations: [] as any[]
})

// Risk Zones
const riskZones = reactive({
  highRiskCount: 0,
  mediumRiskCount: 0,
  lowRiskCount: 0,
  zones: [] as any[]
})

const filteredRiskZones = computed(() => {
  if (riskZoneFilter.value === 'all') return riskZones.zones
  return riskZones.zones.filter(z => z.risk === riskZoneFilter.value)
})

// Anomaly Detection
const anomalyDetection = reactive({
  criticalAnomalies: 0,
  warningAnomalies: 0,
  infoAnomalies: 0,
  resolvedAnomalies: 0,
  activeAnomalies: [] as any[]
})

// Trends
const trends = reactive({
  labels: [] as string[],
  volumeTrend: [] as number[],
  deliveryRateTrend: [] as number[],
  volumeForecast: 0,
  deliveryForecast: 0,
  insights: [] as any[]
})

// Reports
const reports = reactive({
  templates: [
    { id: 1, name: 'Performance Globale', description: 'Vue d\'ensemble de tous les KPIs', icon: markRaw(BarChart2), bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { id: 2, name: 'Analyse Retours', description: 'Détail des motifs et tendances', icon: markRaw(RotateCcw), bgColor: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600' },
    { id: 3, name: 'Performance Transporteurs', description: 'Comparatif des transporteurs', icon: markRaw(Truck), bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600' },
    { id: 4, name: 'Analyse Régionale', description: 'Performance par zone', icon: markRaw(MapPinned), bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' }
  ],
  recentReports: [] as any[]
})

const filteredShipments = computed(() => {
  let result = shipments.value

  if (activeStatusTab.value !== 'all') {
    const statusMap: Record<string, string> = {
      'exception': 'Exception',
      'failed': 'Failed attempt',
      'expired': 'Expired',
      'out-for-delivery': 'Out for delivery',
      'delivered': 'Delivered',
      'pending': 'Pending'
    }
    result = result.filter(s => s.status === statusMap[activeStatusTab.value])
  }

  if (searchQuery.value) {
    result = result.filter(s =>
      s.trackingNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return result
})

// Pickup related computed properties
const pendingPickups = computed(() => {
  return shipments.value.filter(s => s.status === 'Pending')
})

const scheduledPickups = ref<any[]>([])

const completedPickupsCount = computed(() => {
  return shipments.value.filter(s => s.status !== 'Pending').length
})

// Pickup Requests
const pickupRequestFilter = ref('all')
const showPickupDetailModal = ref(false)
const selectedPickupDetail = ref<any>(null)

const pickupRequests = ref<any[]>([])

const filteredPickupRequests = computed(() => {
  if (pickupRequestFilter.value === 'all') return pickupRequests.value
  return pickupRequests.value.filter(r => r.status === pickupRequestFilter.value)
})

function viewPickupDetail(pickup: any) {
  selectedPickupDetail.value = pickup
  showPickupDetailModal.value = true
}

function closePickupDetail() {
  showPickupDetailModal.value = false
  selectedPickupDetail.value = null
}

// Pickup History
const pickupHistory = ref<any[]>([])

// Failed Pickups
const failedPickupsData = ref<any[]>([])

// Scan-based pickup computed properties

// All pending shipments with printed labels = candidates for pickup
const pickupCandidates = computed(() => {
  return shipments.value.filter(s => s.status === 'Pending' && s.labelPrinted)
})

// Group candidates by carrier, with confirmed status per shipment
const pickupByCarrier = computed(() => {
  const groups: Record<string, { carrier: string; shipments: any[]; confirmedCount: number }> = {}
  pickupCandidates.value.forEach(s => {
    const carrier = s.carrier || 'Non assigné'
    if (!groups[carrier]) {
      groups[carrier] = { carrier, shipments: [], confirmedCount: 0 }
    }
    const isConfirmed = confirmedTrackingNumbers.value.has(s.trackingNumber)
    groups[carrier].shipments.push({ ...s, confirmed: isConfirmed })
    if (isConfirmed) groups[carrier].confirmedCount++
  })
  return Object.values(groups).sort((a, b) => a.carrier.localeCompare(b.carrier))
})

// Only confirmed shipments (for pickup request)
const confirmedShipments = computed(() => {
  return pickupCandidates.value.filter(s => confirmedTrackingNumbers.value.has(s.trackingNumber))
})

// Confirmed grouped by carrier (for confirmation modal)
const confirmedByCarrier = computed(() => {
  const groups: Record<string, { carrier: string; shipments: any[] }> = {}
  confirmedShipments.value.forEach(s => {
    const carrier = s.carrier || 'Non assigné'
    if (!groups[carrier]) {
      groups[carrier] = { carrier, shipments: [] }
    }
    groups[carrier].shipments.push(s)
  })
  return Object.values(groups).sort((a, b) => a.carrier.localeCompare(b.carrier))
})

const confirmedTotalCOD = computed(() => {
  return confirmedShipments.value.reduce((sum, s) => sum + (s.cod || s.totalPrice || 0), 0)
})

// Carrier Performance
const carrierPerformance = ref<any[]>([])

// Administration - Users Management
// Fee configuration per shipment type (in TND)
const deliveryFees = ref({
  delivered: 3.00,  // Fee per delivered shipment
  returned: 2.00    // Fee per returned shipment
})

// Admin users - empty by default, loaded from Supabase (only visible to platform admins)
const adminUsers = ref<any[]>([])

const adminUserSearch = ref('')
const adminUserFilter = ref('all')
const showChargeAccountModal = ref(false)
const selectedUserForCharge = ref<any>(null)
const chargeNote = ref('')
const chargeMode = ref<'credit' | 'debit'>('credit')
const creditAmount = ref<number | null>(null)
const paymentMethod = ref<'cash' | 'transfer' | 'cheque'>('cash')
const purchaseDelivered = ref<number | null>(null)
const purchaseReturned = ref<number | null>(null)

// Computed property for calculating total charge based on unbilled shipments
const calculateChargeTotal = computed(() => {
  if (!selectedUserForCharge.value) return 0
  const deliveredTotal = selectedUserForCharge.value.unbilledDelivered * deliveryFees.value.delivered
  const returnedTotal = selectedUserForCharge.value.unbilledReturned * deliveryFees.value.returned
  return deliveredTotal + returnedTotal
})

// Computed property for calculating total credit based on purchased colis
const calculateCreditTotal = computed(() => {
  const deliveredTotal = (purchaseDelivered.value || 0) * deliveryFees.value.delivered
  const returnedTotal = (purchaseReturned.value || 0) * deliveryFees.value.returned
  return deliveredTotal + returnedTotal
})

// Admin transactions - empty by default, loaded from Supabase
const adminTransactions = ref<any[]>([])

const filteredAdminUsers = computed(() => {
  let result = adminUsers.value

  if (adminUserSearch.value) {
    const query = adminUserSearch.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.company.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query)
    )
  }

  if (adminUserFilter.value !== 'all') {
    result = result.filter(u => u.status === adminUserFilter.value)
  }

  return result
})

const adminStats = computed(() => ({
  totalUsers: adminUsers.value.length,
  activeUsers: adminUsers.value.filter(u => u.status === 'active').length,
  totalBalance: adminUsers.value.reduce((sum, u) => sum + u.balance, 0),
  negativeBalances: adminUsers.value.filter(u => u.balance < 0).length,
}))

function openChargeModal(user: any) {
  selectedUserForCharge.value = user
  chargeNote.value = ''
  chargeMode.value = 'credit'
  creditAmount.value = null
  paymentMethod.value = 'cash'
  purchaseDelivered.value = null
  purchaseReturned.value = null
  showChargeAccountModal.value = true
}

function closeChargeModal() {
  showChargeAccountModal.value = false
  selectedUserForCharge.value = null
  chargeNote.value = ''
  chargeMode.value = 'credit'
  creditAmount.value = null
  paymentMethod.value = 'cash'
  purchaseDelivered.value = null
  purchaseReturned.value = null
}

function processAccountCharge() {
  if (!selectedUserForCharge.value || calculateChargeTotal.value === 0) return

  const user = adminUsers.value.find(u => u.id === selectedUserForCharge.value.id)
  if (user) {
    const totalAmount = calculateChargeTotal.value
    const deliveredCount = user.unbilledDelivered
    const returnedCount = user.unbilledReturned

    // Debit the account
    user.balance -= totalAmount

    // Reset unbilled counts
    user.unbilledDelivered = 0
    user.unbilledReturned = 0

    // Add transaction
    adminTransactions.value.unshift({
      id: `TRX-${String(adminTransactions.value.length + 1).padStart(3, '0')}`,
      userId: user.id,
      userName: user.name,
      company: user.company,
      type: 'debit',
      amount: totalAmount,
      note: chargeNote.value || `Facturation: ${deliveredCount} livrés (${deliveryFees.value.delivered} TND) + ${returnedCount} retours (${deliveryFees.value.returned} TND)`,
      date: new Date().toLocaleString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      createdBy: 'Admin',
      deliveredCount,
      returnedCount
    })
  }

  closeChargeModal()
}

function processAccountCredit() {
  if (!selectedUserForCharge.value || calculateCreditTotal.value <= 0) return

  const user = adminUsers.value.find(u => u.id === selectedUserForCharge.value.id)
  if (user) {
    const amount = calculateCreditTotal.value
    const deliveredPurchased = purchaseDelivered.value || 0
    const returnedPurchased = purchaseReturned.value || 0

    // Add credits to user account
    user.deliveredCount = (user.deliveredCount || 0) + deliveredPurchased
    user.returnedCount = (user.returnedCount || 0) + returnedPurchased

    // Get payment method label
    const paymentLabels = {
      cash: 'Espèces',
      transfer: 'Virement',
      cheque: 'Chèque'
    }

    // Add transaction
    adminTransactions.value.unshift({
      id: `TRX-${String(adminTransactions.value.length + 1).padStart(3, '0')}`,
      userId: user.id,
      userName: user.name,
      company: user.company,
      type: 'credit',
      amount: amount,
      note: chargeNote.value || `Achat: ${deliveredPurchased} livrés + ${returnedPurchased} retour (${paymentLabels[paymentMethod.value]})`,
      date: new Date().toLocaleString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      createdBy: 'Admin',
      paymentMethod: paymentMethod.value,
      purchasedDelivered: deliveredPurchased,
      purchasedReturned: returnedPurchased
    })
  }

  closeChargeModal()
}

const minPickupDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Label-related computed properties
const printedLabelsCount = computed(() => {
  return shipments.value.filter(s => s.labelPrinted).length
})

const unprintedLabelsCount = computed(() => {
  return shipments.value.filter(s => !s.labelPrinted).length
})

const totalCOD = computed(() => {
  return shipments.value.reduce((sum, s) => sum + (s.cod || 0), 0)
})

const filteredLabels = computed(() => {
  let result = shipments.value

  // Filter by print status
  if (labelFilterPrinted.value === 'printed') {
    result = result.filter(s => s.labelPrinted)
  } else if (labelFilterPrinted.value === 'unprinted') {
    result = result.filter(s => !s.labelPrinted)
  }

  // Filter by search query
  if (labelSearchQuery.value) {
    const query = labelSearchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.labelNumber?.toLowerCase().includes(query) ||
      s.customerName?.toLowerCase().includes(query) ||
      s.recipientPhone?.toLowerCase().includes(query) ||
      s.trackingNumber?.toLowerCase().includes(query)
    )
  }

  return result
})

// Status formatting functions imported from @/composables/useStatusFormatting
// carrierDeliveryFees imported from @/data/carriers-catalog

function selectShipmentCarrier(carrier: any) {
  newShipment.carrier = carrier.name
  // Set delivery fee based on carrier
  newShipment.deliveryFee = carrierDeliveryFees[carrier.name] || 7
}

function resetShipmentForm() {
  newShipment.trackingNumber = ''
  newShipment.carrier = ''
  newShipment.customerName = ''
  newShipment.phone = ''
  newShipment.phoneSecondary = ''
  newShipment.address = ''
  newShipment.gouvernorat = ''
  newShipment.delegation = ''
  newShipment.locality = ''
  newShipment.postalCode = ''
  newShipment.productName = ''
  newShipment.isFragile = false
  newShipment.description = ''
  newShipment.productPrice = 0
  newShipment.deliveryFee = 7
  newShipment.reference = ''
}

function addShipment() {
  // Validate required fields
  if (!newShipment.customerName || !newShipment.phone || !newShipment.address || !newShipment.gouvernorat || !newShipment.delegation || !newShipment.productName) {
    return
  }

  const timestamp = Date.now()
  const labelNumber = `BRD-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`
  const reference = newShipment.reference || generateReference()
  const trackingNumber = newShipment.trackingNumber || `TN-${new Date().getFullYear()}-${String(timestamp).slice(-8)}`

  // Build full destination address
  const fullDestination = [
    newShipment.locality,
    newShipment.delegation,
    newShipment.gouvernorat
  ].filter(Boolean).join(', ')

  shipments.value.unshift({
    id: timestamp,
    trackingNumber: trackingNumber,
    carrier: newShipment.carrier || 'À assigner',
    service: '-',
    status: 'Pending',
    latestEvent: `${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} : Colis créé`,
    originFlag: '🇹🇳',
    origin: 'Tunisie',
    destination: fullDestination || newShipment.gouvernorat,
    deliveryDate: null,
    transitDays: 0,
    orderNumber: `CMD-${timestamp}`,
    customerName: newShipment.customerName,
    // Auto-generated label data
    labelNumber: labelNumber,
    labelPrinted: false,
    labelPrintedAt: null,
    weight: 1.0,
    dimensions: '20x15x10',
    cod: totalPrice.value,
    senderName: 'Ma Boutique',
    senderAddress: 'Tunisie',
    senderPhone: '+216 00 000 000',
    recipientPhone: `+216 ${newShipment.phone}`,
    recipientPhoneSecondary: newShipment.phoneSecondary ? `+216 ${newShipment.phoneSecondary}` : '',
    recipientAddress: `${newShipment.address}, ${newShipment.postalCode} ${fullDestination}`,
    productDescription: newShipment.productName + (newShipment.description ? ` - ${newShipment.description}` : ''),
    fragile: newShipment.isFragile,
    reference: reference,
    productPrice: newShipment.productPrice,
    deliveryFee: newShipment.deliveryFee,
    totalPrice: totalPrice.value,
    events: [
      { status: 'Informations reçues', description: 'Commande en attente de ramassage', location: 'Tunisie', date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), completed: true },
    ]
  })

  resetShipmentForm()
  showAddShipmentModal.value = false
}

// Carrier functions
function openAddCarrierModal() {
  editingCarrier.value = null
  resetCarrierForm()
  modalCarrierSearchQuery.value = ''
  selectedModalCarrier.value = null
  showAddCarrierModal.value = true
}

function editCarrier(carrier: typeof carriers.value[0]) {
  editingCarrier.value = carrier.id
  newCarrier.name = carrier.name
  newCarrier.apiId = carrier.apiId
  newCarrier.apiKey = carrier.apiKey
  newCarrier.fraisColisLivres = carrier.fraisColisLivres
  newCarrier.fraisColisRetour = carrier.fraisColisRetour
  newCarrier.fraisColisEchange = carrier.fraisColisEchange
  newCarrier.fraisColisBig = carrier.fraisColisBig
  newCarrier.fraisColisPickup = carrier.fraisColisPickup
  newCarrier.totalFraisLivraison = carrier.totalFraisLivraison
  newCarrier.fraisPaiement = carrier.fraisPaiement
  newCarrier.retenuPassage = carrier.retenuPassage
  newCarrier.allRegions = carrier.allRegions
  newCarrier.regions = [...carrier.regions]
  activeSection.value = 'add-carrier'
}

function closeCarrierModal() {
  showAddCarrierModal.value = false
  editingCarrier.value = null
  resetCarrierForm()
  modalCarrierSearchQuery.value = ''
  selectedModalCarrier.value = null
}

function resetCarrierForm() {
  newCarrier.name = ''
  newCarrier.apiId = ''
  newCarrier.apiKey = ''
  newCarrier.fraisColisLivres = 7.00
  newCarrier.fraisColisRetour = 5.00
  newCarrier.fraisColisEchange = 8.00
  newCarrier.fraisColisBig = 12.00
  newCarrier.fraisColisPickup = 3.00
  newCarrier.totalFraisLivraison = 7.00
  newCarrier.fraisPaiement = 1.5
  newCarrier.retenuPassage = 0.00
  newCarrier.allRegions = true
  newCarrier.regions = []
  carrierWizardStep.value = 1
  showApiKey.value = false
}

// Region selection helpers
function handleAllRegionsToggle() {
  if (newCarrier.allRegions) {
    newCarrier.regions = []
  }
}

function selectAllRegions() {
  newCarrier.regions = [...gouvernorats.value]
}

function clearAllRegions() {
  newCarrier.regions = []
}

function saveCarrier() {
  if (!newCarrier.name || !newCarrier.apiId || !newCarrier.apiKey) {
    return
  }

  // Validate regions if not all regions
  if (!newCarrier.allRegions && newCarrier.regions.length === 0) {
    return // At least one region must be selected
  }

  if (editingCarrier.value) {
    // Update existing carrier
    const index = carriers.value.findIndex(c => c.id === editingCarrier.value)
    if (index !== -1) {
      carriers.value[index] = {
        ...carriers.value[index],
        name: newCarrier.name,
        apiId: newCarrier.apiId,
        apiKey: newCarrier.apiKey,
        fraisColisLivres: newCarrier.fraisColisLivres,
        fraisColisRetour: newCarrier.fraisColisRetour,
        fraisColisEchange: newCarrier.fraisColisEchange,
        fraisColisBig: newCarrier.fraisColisBig,
        fraisColisPickup: newCarrier.fraisColisPickup,
        totalFraisLivraison: newCarrier.totalFraisLivraison,
        fraisPaiement: newCarrier.fraisPaiement,
        retenuPassage: newCarrier.retenuPassage,
        allRegions: newCarrier.allRegions,
        regions: [...newCarrier.regions]
      }
      // Update selected carrier if it's the one being edited
      if (selectedCarrier.value?.id === editingCarrier.value) {
        selectedCarrier.value = carriers.value[index]
      }
    }
  } else {
    // Add new carrier
    const newId = Math.max(...carriers.value.map(c => c.id)) + 1
    carriers.value.push({
      id: newId,
      name: newCarrier.name,
      apiId: newCarrier.apiId,
      apiKey: newCarrier.apiKey,
      apiStatus: 'disconnected',
      shipments: 0,
      delivered: 0,
      deliveryRate: 0,
      avgTime: 0,
      fraisColisLivres: newCarrier.fraisColisLivres,
      fraisColisRetour: newCarrier.fraisColisRetour,
      fraisColisEchange: newCarrier.fraisColisEchange,
      fraisColisBig: newCarrier.fraisColisBig,
      fraisColisPickup: newCarrier.fraisColisPickup,
      totalFraisLivraison: newCarrier.totalFraisLivraison,
      fraisPaiement: newCarrier.fraisPaiement,
      retenuPassage: newCarrier.retenuPassage,
      allRegions: newCarrier.allRegions,
      regions: [...newCarrier.regions]
    })
  }

  closeCarrierModal()
}

function saveCarrierFromPage() {
  if (!newCarrier.name || !newCarrier.apiId || !newCarrier.apiKey) {
    return
  }

  // Validate regions if not all regions
  if (!newCarrier.allRegions && newCarrier.regions.length === 0) {
    return // At least one region must be selected
  }

  if (editingCarrier.value) {
    // Update existing carrier
    const index = carriers.value.findIndex(c => c.id === editingCarrier.value)
    if (index !== -1) {
      carriers.value[index] = {
        ...carriers.value[index],
        name: newCarrier.name,
        apiId: newCarrier.apiId,
        apiKey: newCarrier.apiKey,
        fraisColisLivres: newCarrier.fraisColisLivres,
        fraisColisRetour: newCarrier.fraisColisRetour,
        fraisColisEchange: newCarrier.fraisColisEchange,
        fraisColisBig: newCarrier.fraisColisBig,
        fraisColisPickup: newCarrier.fraisColisPickup,
        totalFraisLivraison: newCarrier.totalFraisLivraison,
        fraisPaiement: newCarrier.fraisPaiement,
        retenuPassage: newCarrier.retenuPassage,
        allRegions: newCarrier.allRegions,
        regions: [...newCarrier.regions]
      }
      // Update selected carrier if it's the one being edited
      if (selectedCarrier.value?.id === editingCarrier.value) {
        selectedCarrier.value = carriers.value[index]
      }
    }
  } else {
    // Add new carrier
    const newId = carriers.value.length > 0 ? Math.max(...carriers.value.map(c => c.id)) + 1 : 1
    carriers.value.push({
      id: newId,
      name: newCarrier.name,
      apiId: newCarrier.apiId,
      apiKey: newCarrier.apiKey,
      apiStatus: 'disconnected',
      shipments: 0,
      delivered: 0,
      deliveryRate: 0,
      avgTime: 0,
      fraisColisLivres: newCarrier.fraisColisLivres,
      fraisColisRetour: newCarrier.fraisColisRetour,
      fraisColisEchange: newCarrier.fraisColisEchange,
      fraisColisBig: newCarrier.fraisColisBig,
      fraisColisPickup: newCarrier.fraisColisPickup,
      totalFraisLivraison: newCarrier.totalFraisLivraison,
      fraisPaiement: newCarrier.fraisPaiement,
      retenuPassage: newCarrier.retenuPassage,
      allRegions: newCarrier.allRegions,
      regions: [...newCarrier.regions]
    })
  }

  // Reset form and navigate back
  editingCarrier.value = null
  resetCarrierForm()
  modalCarrierSearchQuery.value = ''
  selectedModalCarrier.value = null
  activeSection.value = 'connected-carriers'
}

function deleteCarrier(carrierId: number) {
  const index = carriers.value.findIndex(c => c.id === carrierId)
  if (index !== -1) {
    carriers.value.splice(index, 1)
    if (selectedCarrier.value?.id === carrierId) {
      selectedCarrier.value = null
    }
  }
}

function selectCarrier(carrier: typeof carriers.value[0]) {
  selectedCarrier.value = carrier
}

// Returns functions
function syncReturns() {
  isSyncingReturns.value = true
  // Simulate API sync
  setTimeout(() => {
    isSyncingReturns.value = false
  }, 2000)
}

function getReturnStatusClass(status: string) {
  switch (status) {
    case 'En transit':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    case 'Récupéré':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    case 'Perdu':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
  }
}


// Label functions
function toggleLabelSelection(id: number) {
  const index = selectedLabels.value.indexOf(id)
  if (index === -1) {
    selectedLabels.value.push(id)
  } else {
    selectedLabels.value.splice(index, 1)
  }
}

function selectAllLabels() {
  if (selectedLabels.value.length === filteredLabels.value.length && filteredLabels.value.length > 0) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = filteredLabels.value.map(s => s.id)
  }
}

function openLabelPreview(shipment: any) {
  labelToPrint.value = shipment
  showPrintLabelModal.value = true
}

function printSelectedLabels() {
  if (selectedLabels.value.length > 0) {
    // If multiple labels selected, open the modal with the first one
    // In a real app, you might want to print all at once
    const firstShipment = shipments.value.find(s => selectedLabels.value.includes(s.id))
    if (firstShipment) {
      labelToPrint.value = firstShipment
      showPrintLabelModal.value = true
    }
  }
}

function printLabel() {
  if (labelToPrint.value) {
    // Mark label as printed
    const shipment = shipments.value.find(s => s.id === labelToPrint.value.id)
    if (shipment) {
      shipment.labelPrinted = true
      shipment.labelPrintedAt = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }

    // Trigger browser print
    window.print()

    // Remove from selection if it was selected
    const index = selectedLabels.value.indexOf(labelToPrint.value.id)
    if (index !== -1) {
      selectedLabels.value.splice(index, 1)
    }
  }
}

function closePrintModal() {
  showPrintLabelModal.value = false
  labelToPrint.value = null
}


// ==================== SCAN-BASED PICKUP METHODS ====================

function playScanSound(type: 'success' | 'error') {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    oscillator.frequency.value = type === 'success' ? 800 : 300
    oscillator.type = 'sine'
    gainNode.gain.value = 0.15
    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.15)
    if (navigator.vibrate) navigator.vibrate(type === 'success' ? 100 : [100, 50, 100])
  } catch {}
}

function showScanFeedbackMsg(type: 'success' | 'error' | 'warning', message: string) {
  scanFeedback.value = { type, message }
  setTimeout(() => { scanFeedback.value = null }, 3000)
}

function handleScan() {
  const input = scanInput.value.trim()
  scanInput.value = ''
  if (!input) return

  // Check if already confirmed
  if (confirmedTrackingNumbers.value.has(input)) {
    playScanSound('error')
    showScanFeedbackMsg('warning', `Colis ${input} déjà confirmé`)
    return
  }

  // Lookup in local shipments
  const shipment = shipments.value.find(s => s.trackingNumber === input)
  if (!shipment) {
    playScanSound('error')
    showScanFeedbackMsg('error', `Colis ${input} introuvable`)
    return
  }

  // Validate status
  if (shipment.status !== 'Pending') {
    playScanSound('error')
    showScanFeedbackMsg('error', `Colis ${input} n'est pas en attente (${shipment.status})`)
    return
  }

  // Validate label is printed
  if (!shipment.labelPrinted) {
    playScanSound('error')
    showScanFeedbackMsg('error', `Bordereau ${input} non imprimé — imprimez-le d'abord`)
    return
  }

  // Confirm the shipment for pickup
  confirmedTrackingNumbers.value = new Set([...confirmedTrackingNumbers.value, input])
  playScanSound('success')
  showScanFeedbackMsg('success', `Colis ${input} confirmé (${shipment.carrier || 'Non assigné'})`)
}

function confirmShipmentManual(trackingNumber: string) {
  confirmedTrackingNumbers.value = new Set([...confirmedTrackingNumbers.value, trackingNumber])
}

function unconfirmShipment(trackingNumber: string) {
  const newSet = new Set(confirmedTrackingNumbers.value)
  newSet.delete(trackingNumber)
  confirmedTrackingNumbers.value = newSet
}

function confirmAllCarrier(carrier: string) {
  const group = pickupByCarrier.value.find(g => g.carrier === carrier)
  if (!group) return
  const newSet = new Set(confirmedTrackingNumbers.value)
  group.shipments.forEach(s => newSet.add(s.trackingNumber))
  confirmedTrackingNumbers.value = newSet
}

function clearScanSession() {
  confirmedTrackingNumbers.value = new Set()
  scanInput.value = ''
  scanFeedback.value = null
}

function openPickupConfirmation() {
  if (confirmedShipments.value.length === 0) return
  pickupSchedule.date = ''
  pickupSchedule.timeSlot = ''
  showPickupConfirmModal.value = true
}

function confirmScanPickup() {
  if (!pickupSchedule.date || !pickupSchedule.timeSlot || confirmedShipments.value.length === 0) return
  confirmingPickup.value = true

  const dateFormatted = new Date(pickupSchedule.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const now = new Date()
  const nowFormatted = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  // Create one pickup request per carrier group (only confirmed colis)
  confirmedByCarrier.value.forEach(group => {
    const pickupId = Date.now() + Math.random()

    // Add to pickup requests list
    pickupRequests.value.unshift({
      id: pickupId,
      carrier: group.carrier,
      shipmentCount: group.shipments.length,
      shipmentIds: group.shipments.map(s => s.id),
      date: dateFormatted,
      timeSlot: pickupSchedule.timeSlot,
      address: pickupSchedule.address,
      status: 'pending',
      createdAt: nowFormatted
    })

    // Add to scheduled pickups
    scheduledPickups.value.push({
      id: pickupId,
      shipmentIds: group.shipments.map(s => s.id),
      shipmentCount: group.shipments.length,
      date: dateFormatted,
      timeSlot: pickupSchedule.timeSlot,
      address: pickupSchedule.address,
      carrier: group.carrier,
      status: 'scheduled'
    })

    // Update shipment statuses
    group.shipments.forEach(confirmed => {
      const shipment = shipments.value.find(s => s.id === confirmed.id)
      if (shipment) {
        shipment.status = 'Out for delivery'
        shipment.latestEvent = `${now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} : Enlèvement programmé`
        shipment.events.unshift({
          status: 'En transit',
          description: `Enlèvement programmé pour le ${dateFormatted} (${pickupSchedule.timeSlot}) - ${group.carrier}`,
          location: pickupSchedule.address,
          date: nowFormatted,
          completed: true
        })
      }
    })
  })

  // Reset
  confirmedTrackingNumbers.value = new Set()
  scanInput.value = ''
  scanFeedback.value = null
  confirmingPickup.value = false
  showPickupConfirmModal.value = false
}

// ==================== FINANCE DATA STRUCTURES ====================

// Carriers List
const carriersList = ref([
  { id: 'yalidine', name: 'Yalidine' },
  { id: 'zr-express', name: 'ZR Express' },
  { id: 'maystro', name: 'Maystro' },
  { id: 'ecotrack', name: 'Ecotrack' }
])

// ==================== PAIEMENTS ATTENDUS (Expected Payments) ====================
const expectedPaymentsCarrierFilter = ref('all')
const expectedPaymentsStatusFilter = ref('all')

// Manifest stats
const manifestStats = reactive({
  totalCOD: 0,
  totalDeliveryFees: 0,
  totalOtherFees: 0,
  netToReceive: 0,
  overdueAmount: 0,
  overdueCount: 0
})

// Manifest by carrier with detailed shipments
const manifestByCarrier = ref<any[]>([])

// Filtered manifest by carrier
const filteredManifestByCarrier = computed(() => {
  let result = manifestByCarrier.value
  if (expectedPaymentsCarrierFilter.value !== 'all') {
    result = result.filter(c => c.id === expectedPaymentsCarrierFilter.value)
  }
  if (expectedPaymentsStatusFilter.value === 'pending') {
    result = result.map(c => ({
      ...c,
      shipments: c.shipments.filter(s => s.paymentStatus !== 'paid')
    })).filter(c => c.shipments.length > 0)
  } else if (expectedPaymentsStatusFilter.value === 'overdue') {
    result = result.filter(c => c.isOverdue)
  }
  return result
})

// ==================== PAYMENT VERIFICATION / RECONCILIATION ====================
const showReconciliationModal = ref(false)
const reconciliationActiveTab = ref<'bank' | 'manual' | 'results'>('bank')

// Bank transactions data
const bankTransactionsFile = ref<File | null>(null)
const bankTransactions = ref([
  { id: 'bank-001', date: '28 Jan 2026', description: 'VIR YALIDINE REF YAL-BATCH-2026-078', amount: 1875, matched: false },
  { id: 'bank-002', date: '25 Jan 2026', description: 'VIREMENT ZR EXPRESS 2026-045', amount: 3690, matched: false },
  { id: 'bank-003', date: '22 Jan 2026', description: 'MAYSTRO DELIVERY PAIEMENT', amount: 2850, matched: false },
  { id: 'bank-004', date: '20 Jan 2026', description: 'VIR YALIDINE BATCH 2026', amount: 5000, matched: false }
])

// Manual entry
const manualPaymentData = ref({
  carrierId: '',
  amount: null as number | null,
  date: new Date().toISOString().split('T')[0],
  reference: ''
})

// Matching results
const matchingResults = ref<any[]>([])
const matchingStats = reactive({
  totalExpected: 0,
  totalMatched: 0,
  totalUnmatched: 0,
  matchedAmount: 0,
  unmatchedAmount: 0
})

// Run auto-matching
function runAutoMatching() {
  const results: any[] = []
  const carriers = manifestByCarrier.value

  carriers.forEach(carrier => {
    const matchedTx = bankTransactions.value.find(tx => {
      if (tx.matched) return false
      if (Math.abs(tx.amount - carrier.netAmount) < 10) {
        const descLower = tx.description.toLowerCase()
        if (descLower.includes(carrier.name.toLowerCase())) return true
      }
      return false
    })

    results.push({
      carrier,
      transaction: matchedTx,
      status: matchedTx ? 'matched' : 'unmatched'
    })

    if (matchedTx) matchedTx.matched = true
  })

  matchingStats.totalExpected = results.length
  matchingStats.totalMatched = results.filter(r => r.status === 'matched').length
  matchingStats.totalUnmatched = results.filter(r => r.status === 'unmatched').length
  matchingStats.matchedAmount = results.filter(r => r.status === 'matched').reduce((sum, r) => sum + r.carrier.netAmount, 0)
  matchingStats.unmatchedAmount = results.filter(r => r.status === 'unmatched').reduce((sum, r) => sum + r.carrier.netAmount, 0)

  matchingResults.value = results
  reconciliationActiveTab.value = 'results'
}

// Confirm matched payment
function confirmMatchedPayment(result: any) {
  const idx = matchingResults.value.findIndex(r => r.carrier.id === result.carrier.id)
  if (idx > -1) {
    matchingResults.value[idx].status = 'confirmed'
    matchingStats.totalMatched--
  }
}

// Submit manual payment
function submitManualPayment() {
  if (!manualPaymentData.value.carrierId || !manualPaymentData.value.amount) return
  alert(`Paiement de ${manualPaymentData.value.amount?.toLocaleString()} TND enregistré`)
  manualPaymentData.value = { carrierId: '', amount: null, date: new Date().toISOString().split('T')[0], reference: '' }
}

// Handle bank file upload
function handleBankFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    bankTransactionsFile.value = target.files[0]
  }
}

// Close modal
function closeReconciliationModal() {
  showReconciliationModal.value = false
  reconciliationActiveTab.value = 'bank'
}

// ==================== PAIEMENTS REÇUS (Received Payments) ====================
const receivedPaymentsMonth = ref('2026-01')
const receivedPaymentsCarrierFilter = ref('all')

const receivedPaymentsStats = reactive({
  totalReceived: 0,
  totalCOD: 0,
  totalFees: 0,
  paymentsCount: 0,
  shipmentsCount: 0
})

// Received payments with detailed shipments
const receivedPaymentsData = ref<any[]>([])

// Filtered received payments
const filteredReceivedPayments = computed(() => {
  if (receivedPaymentsCarrierFilter.value === 'all') return receivedPaymentsData.value
  return receivedPaymentsData.value.filter(p => p.carrier.toLowerCase().includes(receivedPaymentsCarrierFilter.value))
})

// ==================== ÉCARTS DE PAIEMENT (Payment Discrepancies) ====================
const discrepancyFilter = ref('all')
const discrepancyCarrierFilter = ref('all')

const discrepancyStats = reactive({
  ourTotal: 0,
  theirTotal: 0,
  totalDifference: 0,
  differencePercent: 0,
  totalPending: 0,
  pendingCount: 0,
  unexpectedFees: 0,
  unexpectedFeesCount: 0,
  recovered: 0
})

// Reconciliation by carrier with per-shipment comparison
const reconciliationByCarrier = ref<any[]>([])

// Revenue
const revenuePeriod = ref('month')

const revenueStats = reactive({
  grossRevenue: 0,
  netRevenue: 0,
  marginPercent: 0,
  shippingCosts: 0,
  avgOrderValue: 0,
  grossGrowth: 0
})

const revenueByCategory = ref<any[]>([])

const revenueByRegion = ref<any[]>([])

const revenueChartData = ref<any[]>([])

// Return Losses
const returnLossesMonth = ref('2026-01')

const returnLossesStats = reactive({
  totalLoss: 0,
  returnedCount: 0,
  lostCount: 0,
  shippingLoss: 0
})

const returnLossesByReason = ref<any[]>([])

const returnLossesByCarrier = ref<any[]>([])

const returnLossesDetails = ref<any[]>([])

// Invoices
const invoicesTab = ref<'received' | 'sent'>('received')
const invoiceSearch = ref('')
const invoiceStatusFilter = ref('all')

const invoicesStats = reactive({
  totalInvoices: 0,
  pendingAmount: 0,
  paidAmount: 0,
  overdueCount: 0
})

const invoices = ref<any[]>([])

// Filtered Invoices
const filteredInvoices = computed(() => {
  let result = invoices.value.filter(i => i.type === invoicesTab.value)
  if (invoiceStatusFilter.value !== 'all') {
    result = result.filter(i => i.status === invoiceStatusFilter.value)
  }
  if (invoiceSearch.value) {
    const search = invoiceSearch.value.toLowerCase()
    result = result.filter(i =>
      i.number.toLowerCase().includes(search) ||
      i.party.toLowerCase().includes(search)
    )
  }
  return result
})

// Exports
const exportConfig = reactive({
  dataType: 'all',
  period: 'thisMonth',
  startDate: '',
  endDate: '',
  format: 'excel',
  carrier: 'all'
})

const recentExports = ref<any[]>([])

// ==================== END FINANCE DATA STRUCTURES ====================
</script>

<style scoped>
/* Slide right transition for side drawer */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.slide-right-enter-from > div:last-child,
.slide-right-leave-to > div:last-child {
  transform: translateX(100%);
}

.slide-right-enter-to > div:last-child,
.slide-right-leave-from > div:last-child {
  transform: translateX(0);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Print styles for label */
@media print {
  body * {
    visibility: hidden;
  }

  #printable-label,
  #printable-label * {
    visibility: visible;
  }

  #printable-label {
    position: absolute;
    left: 0;
    top: 0;
    width: 100mm;
    padding: 5mm;
    margin: 0;
    border: 1px solid #000 !important;
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>

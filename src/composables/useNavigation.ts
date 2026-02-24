import { ref, computed, markRaw, type Ref, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  RotateCcw,
  Building2,
  Wallet,
  BarChart3,
  Shield,
  Settings,
  CalendarClock,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Activity,
  Plus,
  Star,
  XCircle,
  TrendingUp,
  FileCheck,
  ScanBarcode,
  History,
  PackageCheck,
  PackageX,
  FileBarChart,
  Clock,
  CheckCircle,
  Receipt,
  FileDown,
  Target,
  Brain,
  MapPinned,
  LineChart,
  Building,
  Bell,
  Lock,
  CreditCard,
  ToggleLeft,
} from 'lucide-vue-next'

export interface NavItem {
  id: string
  label: string
  icon: Component
  badge?: string
  badgeClass?: string
}

// Route map: subSection ID → { path, mainSection }
export const subSectionRoutes: Record<string, { path: string; mainSection: string }> = {
  // Dashboard
  'overview': { path: '/dashboard', mainSection: 'dashboard' },
  'today-shipments': { path: '/dashboard/today', mainSection: 'dashboard' },
  'delayed-shipments': { path: '/dashboard/delayed', mainSection: 'dashboard' },
  'returns-alerts': { path: '/dashboard/return-alerts', mainSection: 'dashboard' },
  'financial-snapshot': { path: '/dashboard/financial-snapshot', mainSection: 'dashboard' },
  'activity-log': { path: '/dashboard/activity-log', mainSection: 'dashboard' },

  // Clients
  'all-clients': { path: '/clients', mainSection: 'clients' },
  'add-client': { path: '/clients/add', mainSection: 'clients' },
  'vip-clients': { path: '/clients/vip', mainSection: 'clients' },
  'blocked-clients': { path: '/clients/blocked', mainSection: 'clients' },
  'client-stats': { path: '/clients/statistics', mainSection: 'clients' },

  // Shipments
  'all-shipments': { path: '/shipments', mainSection: 'shipments' },
  'create-shipment': { path: '/shipments/create', mainSection: 'shipments' },
  'labels': { path: '/shipments/labels', mainSection: 'shipments' },

  // Pickups
  'schedule-pickup': { path: '/pickups', mainSection: 'pickups' },
  'pickup-history': { path: '/pickups/history', mainSection: 'pickups' },

  // Returns
  'active-returns': { path: '/returns', mainSection: 'returns' },
  'recovered-returns': { path: '/returns/recovered', mainSection: 'returns' },
  'lost-returns': { path: '/returns/lost', mainSection: 'returns' },
  'return-value': { path: '/returns/value', mainSection: 'returns' },
  'return-reports': { path: '/returns/reports', mainSection: 'returns' },

  // Carriers
  'connected-carriers': { path: '/carriers', mainSection: 'carriers' },
  'add-carrier': { path: '/carriers/add', mainSection: 'carriers' },

  // Finance
  'expected-payments': { path: '/finance', mainSection: 'finance' },
  'received-payments': { path: '/finance/received', mainSection: 'finance' },
  'payment-discrepancies': { path: '/finance/discrepancies', mainSection: 'finance' },
  'revenue': { path: '/finance/revenue', mainSection: 'finance' },
  'return-losses': { path: '/finance/return-losses', mainSection: 'finance' },
  'invoices': { path: '/finance/invoices', mainSection: 'finance' },
  'exports': { path: '/finance/exports', mainSection: 'finance' },

  // Analytics
  'global-kpis': { path: '/analytics', mainSection: 'analytics' },
  'delivery-performance': { path: '/analytics/performance', mainSection: 'analytics' },
  'return-intelligence': { path: '/analytics/returns', mainSection: 'analytics' },
  'risk-zones': { path: '/analytics/risk-zones', mainSection: 'analytics' },
  'anomaly-detection': { path: '/analytics/anomalies', mainSection: 'analytics' },
  'trends': { path: '/analytics/trends', mainSection: 'analytics' },
  'reports': { path: '/analytics/reports', mainSection: 'analytics' },

  // Settings
  'company-profile': { path: '/settings', mainSection: 'settings' },
  'users-roles': { path: '/settings/users', mainSection: 'settings' },
  'notifications': { path: '/settings/notifications', mainSection: 'settings' },
  'security': { path: '/settings/security', mainSection: 'settings' },
  'payment-history': { path: '/settings/payment-history', mainSection: 'settings' },

  // Administration
  'admin-users': { path: '/admin', mainSection: 'administration' },
  'admin-billing': { path: '/admin/billing', mainSection: 'administration' },
  'admin-transactions': { path: '/admin/transactions', mainSection: 'administration' },
  'admin-features': { path: '/admin/features', mainSection: 'administration' },
}

export const mainNavigation: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: markRaw(LayoutDashboard) },
  { id: 'clients', label: 'Clients', icon: markRaw(Users) },
  { id: 'shipments', label: 'Colis', icon: markRaw(Package) },
  { id: 'pickups', label: 'Enlèvements', icon: markRaw(Truck) },
  { id: 'returns', label: 'Retours', icon: markRaw(RotateCcw) },
  { id: 'carriers', label: 'Transporteurs', icon: markRaw(Building2) },
  { id: 'finance', label: 'Finance', icon: markRaw(Wallet) },
  { id: 'analytics', label: 'Analytiques', icon: markRaw(BarChart3) },
  { id: 'administration', label: 'Administration', icon: markRaw(Shield) },
  { id: 'settings', label: 'Paramètres', icon: markRaw(Settings) },
]

export const subNavigation: Record<string, NavItem[]> = {
  dashboard: [
    { id: 'overview', label: 'Vue d\'ensemble', icon: markRaw(LayoutDashboard) },
    { id: 'today-shipments', label: 'Tâches du jour', icon: markRaw(CalendarClock) },
    { id: 'delayed-shipments', label: 'Colis en retard', icon: markRaw(AlertTriangle) },
    { id: 'returns-alerts', label: 'Alertes retours', icon: markRaw(AlertCircle) },
    { id: 'financial-snapshot', label: 'Aperçu financier', icon: markRaw(DollarSign) },
    { id: 'activity-log', label: 'Journal d\'activité', icon: markRaw(Activity) },
  ],
  clients: [
    { id: 'all-clients', label: 'Tous les clients', icon: markRaw(Users) },
    { id: 'add-client', label: 'Ajouter client', icon: markRaw(Plus) },
    { id: 'vip-clients', label: 'Clients VIP', icon: markRaw(Star) },
    { id: 'blocked-clients', label: 'Clients bloqués', icon: markRaw(XCircle) },
    { id: 'client-stats', label: 'Statistiques', icon: markRaw(TrendingUp) },
  ],
  shipments: [
    { id: 'all-shipments', label: 'Tous les colis', icon: markRaw(Package) },
    { id: 'create-shipment', label: 'Créer un colis', icon: markRaw(Plus) },
    { id: 'labels', label: 'Bordereaux', icon: markRaw(FileCheck) },
  ],
  pickups: [
    { id: 'schedule-pickup', label: 'Scan pickup', icon: markRaw(ScanBarcode) },
    { id: 'pickup-history', label: 'Historique', icon: markRaw(History) },
  ],
  returns: [
    { id: 'active-returns', label: 'Retours actifs', icon: markRaw(RotateCcw) },
    { id: 'recovered-returns', label: 'Retours récupérés', icon: markRaw(PackageCheck) },
    { id: 'lost-returns', label: 'Retours perdus', icon: markRaw(PackageX) },
    { id: 'return-value', label: 'Valeur des retours', icon: markRaw(DollarSign) },
    { id: 'return-reports', label: 'Rapports', icon: markRaw(FileBarChart) },
  ],
  carriers: [
    { id: 'connected-carriers', label: 'Transporteurs connectés', icon: markRaw(Building2) },
    { id: 'add-carrier', label: 'Ajouter transporteur', icon: markRaw(Plus) },
  ],
  finance: [
    { id: 'expected-payments', label: 'Paiements attendus', icon: markRaw(Clock) },
    { id: 'received-payments', label: 'Paiements reçus', icon: markRaw(CheckCircle) },
    { id: 'payment-discrepancies', label: 'Écarts de paiement', icon: markRaw(AlertTriangle) },
    { id: 'revenue', label: 'Revenus', icon: markRaw(TrendingUp) },
    { id: 'return-losses', label: 'Pertes retours', icon: markRaw(XCircle) },
    { id: 'invoices', label: 'Factures', icon: markRaw(Receipt) },
    { id: 'exports', label: 'Exports', icon: markRaw(FileDown) },
  ],
  analytics: [
    { id: 'global-kpis', label: 'KPIs globaux', icon: markRaw(Target) },
    { id: 'delivery-performance', label: 'Performance livraison', icon: markRaw(TrendingUp) },
    { id: 'return-intelligence', label: 'Intelligence retours', icon: markRaw(Brain) },
    { id: 'risk-zones', label: 'Zones à risque', icon: markRaw(MapPinned) },
    { id: 'anomaly-detection', label: 'Détection d\'anomalies', icon: markRaw(AlertCircle) },
    { id: 'trends', label: 'Tendances', icon: markRaw(LineChart) },
    { id: 'reports', label: 'Rapports', icon: markRaw(FileBarChart) },
  ],
  settings: [
    { id: 'company-profile', label: 'Profil entreprise', icon: markRaw(Building) },
    { id: 'users-roles', label: 'Utilisateurs & Rôles', icon: markRaw(Users) },
    { id: 'notifications', label: 'Notifications', icon: markRaw(Bell) },
    { id: 'security', label: 'Sécurité', icon: markRaw(Lock) },
    { id: 'payment-history', label: 'Historique de paiement', icon: markRaw(CreditCard) },
  ],
  administration: [
    { id: 'admin-users', label: 'Liste des utilisateurs', icon: markRaw(Users) },
    { id: 'admin-billing', label: 'Facturation comptes', icon: markRaw(Wallet) },
    { id: 'admin-transactions', label: 'Transactions', icon: markRaw(Receipt) },
    { id: 'admin-features', label: 'Feature Flags', icon: markRaw(ToggleLeft) },
  ],
}

export interface UseNavigationOptions {
  isAdmin: Ref<boolean>
  isFeatureEnabled?: (feature: string) => boolean
  isSuperAdmin?: Ref<boolean>
}

export function useNavigation(isAdminOrOptions: Ref<boolean> | UseNavigationOptions) {
  const router = useRouter()
  const route = useRoute()

  // Support both old signature (Ref<boolean>) and new options object
  const options: UseNavigationOptions = 'value' in isAdminOrOptions
    ? { isAdmin: isAdminOrOptions }
    : isAdminOrOptions
  const { isAdmin, isFeatureEnabled, isSuperAdmin } = options

  const mainSection = computed(() => (route.meta.mainSection as string) || 'dashboard')
  const activeSection = computed(() => (route.meta.subSection as string) || 'overview')
  const showSearchResultsPage = ref(false)

  const filteredMainNavigation = computed(() => {
    let items = mainNavigation
    // Hide administration for non-admins
    if (!isAdmin.value) {
      items = items.filter(item => item.id !== 'administration')
    }
    // Filter by feature flags
    if (isFeatureEnabled) {
      items = items.filter(item => isFeatureEnabled(item.id))
    }
    return items
  })

  const currentSubNavigation = computed(() => {
    let items = subNavigation[mainSection.value] || []
    // Hide Feature Flags sub-nav item for non-superadmins
    if (!isSuperAdmin?.value) {
      items = items.filter(item => item.id !== 'admin-features')
    }
    if (!isFeatureEnabled) return items
    return items.filter(item => isFeatureEnabled(`${mainSection.value}.${item.id}`))
  })

  function getMainSectionLabel(section: string): string {
    const item = mainNavigation.find(n => n.id === section)
    return item?.label || section
  }

  function getSectionTitle(section: string): string {
    for (const key in subNavigation) {
      const item = subNavigation[key].find(s => s.id === section)
      if (item) return item.label
    }
    return section
  }

  function selectMainSection(section: string) {
    const firstSubItem = subNavigation[section]?.[0]
    if (firstSubItem) {
      navigateTo(firstSubItem.id)
    }
    showSearchResultsPage.value = false
  }

  function navigateTo(subSection: string) {
    const routeInfo = subSectionRoutes[subSection]
    if (routeInfo) {
      router.push(routeInfo.path)
    }
    showSearchResultsPage.value = false
  }

  return {
    mainSection,
    activeSection,
    showSearchResultsPage,
    filteredMainNavigation,
    currentSubNavigation,
    getMainSectionLabel,
    getSectionTitle,
    selectMainSection,
    navigateTo,
  }
}

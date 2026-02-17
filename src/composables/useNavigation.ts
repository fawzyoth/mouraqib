import { ref, computed, markRaw, type Ref, type Component } from 'vue'
import { useLocalStorageRef } from './useLocalStorage'
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
  Layout,
  Globe,
  Palette,
  SearchX,
} from 'lucide-vue-next'

export interface NavItem {
  id: string
  label: string
  icon: Component
  badge?: string
  badgeClass?: string
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
    { id: 'delayed-shipments', label: 'Colis en retard', icon: markRaw(AlertTriangle), badge: '3', badgeClass: 'bg-red-100 text-red-600' },
    { id: 'returns-alerts', label: 'Alertes retours', icon: markRaw(AlertCircle), badge: '2', badgeClass: 'bg-yellow-100 text-yellow-600' },
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
  'tracking-page': [
    { id: 'page-templates', label: 'Modèles de page', icon: markRaw(Layout) },
    { id: 'my-tracking-page', label: 'Ma page de suivi', icon: markRaw(Globe) },
    { id: 'page-branding', label: 'Personnalisation', icon: markRaw(Palette) },
    { id: 'page-analytics', label: 'Analytiques', icon: markRaw(BarChart3) },
    { id: 'failed-searches', label: 'Recherches échouées', icon: markRaw(SearchX), badge: '5', badgeClass: 'bg-red-100 text-red-600' },
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
  ],
}

export function useNavigation(isAdmin: Ref<boolean>) {
  const mainSection = useLocalStorageRef('deliveryTracker_mainSection', 'dashboard')
  const activeSection = useLocalStorageRef('deliveryTracker_activeSection', 'overview')
  const showSearchResultsPage = ref(false)

  const filteredMainNavigation = computed(() => {
    if (isAdmin.value) {
      return mainNavigation
    }
    return mainNavigation.filter(item => item.id !== 'administration')
  })

  const currentSubNavigation = computed(() => {
    return subNavigation[mainSection.value] || []
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
    mainSection.value = section
    const firstSubItem = subNavigation[section]?.[0]
    if (firstSubItem) {
      activeSection.value = firstSubItem.id
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
  }
}

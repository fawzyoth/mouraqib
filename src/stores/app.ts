import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useShipmentsData } from '@/composables/useShipmentsData'
import { useClientsData } from '@/composables/useClientsData'
import { useCarriersData } from '@/composables/useCarriersData'
import { useBoutiquesData } from '@/composables/useBoutiquesData'
import { usePickupsData } from '@/composables/usePickupsData'
import { useOrganizationData } from '@/composables/useOrganizationData'
import { useFinanceData } from '@/composables/useFinanceData'

export const useAppStore = defineStore('app', () => {
  const authStore = useAuthStore()
  const orgId = computed(() => authStore.user?.organizationId || '')

  // Delegate to existing composables — refs are shared, not copied
  const shipmentsData = useShipmentsData(orgId)
  const clientsData = useClientsData(orgId)
  const carriersData = useCarriersData(orgId)
  const boutiquesData = useBoutiquesData(orgId)
  const pickupsData = usePickupsData(orgId)
  const orgData = useOrganizationData(orgId)
  const financeData = useFinanceData(orgId)

  // Direct ref access (no copy anti-pattern)
  const shipments = shipmentsData.shipments
  const clients = clientsData.clientsList
  const clientStats = clientsData.clientStats
  const carriers = carriersData.carriers
  const boutiques = boutiquesData.boutiques
  const pickupRequests = pickupsData.pickupRequests
  const pickupHistory = pickupsData.pickupHistory
  const scheduledPickups = pickupsData.scheduledPickups
  const teamMembers = orgData.teamMembers
  const availableRoles = orgData.availableRoles
  const companyProfile = orgData.companyProfile
  const userBalance = financeData.userBalance
  const invoices = financeData.invoices
  const payments = financeData.payments

  // Derived counts for AppShell sidebar
  const deliveredCount = computed(() =>
    shipments.value.filter((s: any) => s.status === 'Livré').length
  )

  // Loading state
  const isLoading = ref(false)

  // Organization context for shipment mapping
  const orgContext = computed(() => ({
    name: companyProfile.value.name || authStore.organization?.name || '',
    address: companyProfile.value.address || '',
    phone: companyProfile.value.phone || '',
  }))

  async function loadAll() {
    if (!orgId.value && !authStore.isDemoMode) return
    isLoading.value = true
    try {
      await Promise.all([
        shipmentsData.load(orgContext.value),
        clientsData.load(),
        carriersData.load(),
        boutiquesData.load(),
        pickupsData.load(),
        orgData.load(),
        financeData.load(),
      ])
    } finally {
      isLoading.value = false
    }
  }

  function subscribe() {
    if (!authStore.isDemoMode) {
      shipmentsData.subscribe(orgContext.value, carriersData.carriers, clientsData.clientsList)
      financeData.subscribeToCredits()
    }
  }

  function unsubscribe() {
    if (!authStore.isDemoMode) {
      shipmentsData.unsubscribe()
      financeData.unsubscribe()
    }
  }

  return {
    // Composable instances (for mutations: .create(), .update(), etc.)
    shipmentsData,
    clientsData,
    carriersData,
    boutiquesData,
    pickupsData,
    orgData,
    financeData,

    // Direct refs (for reading)
    shipments,
    clients,
    clientStats,
    carriers,
    boutiques,
    pickupRequests,
    pickupHistory,
    scheduledPickups,
    teamMembers,
    availableRoles,
    companyProfile,
    userBalance,
    invoices,
    payments,

    // Computed
    orgId,
    orgContext,
    deliveredCount,
    isLoading,

    // Actions
    loadAll,
    subscribe,
    unsubscribe,
  }
})

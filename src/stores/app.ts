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
import { useProductsData } from '@/composables/useProductsData'
import { pickupEventsService } from '@/services/pickup-events'
import type { PickupEvent, PickupEventInsert } from '@/types/database'

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
  const productsData = useProductsData(orgId)

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
  const products = productsData.products

  // Pickup events (direct ref — no sub-composable needed)
  const pickupEvents = ref<PickupEvent[]>([])

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
        productsData.load(),
        pickupEventsService.getAll(orgId.value).then(d => { pickupEvents.value = d }).catch(() => {}),
      ])
    } finally {
      isLoading.value = false
    }
  }

  async function createPickupEvent(payload: PickupEventInsert) {
    const created = await pickupEventsService.create(payload)
    pickupEvents.value = [created, ...pickupEvents.value]
    return created
  }

  async function deletePickupEvent(id: string) {
    await pickupEventsService.delete(id)
    pickupEvents.value = pickupEvents.value.filter(e => e.id !== id)
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
    productsData,

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
    products,

    // Pickup events
    pickupEvents,
    createPickupEvent,
    deletePickupEvent,

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

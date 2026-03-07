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
    @handle-action="onHandleAction"
    @handle-all-actions="onHandleAllActions"
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
    @print-all-labels="printAllLabels"
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

  <!-- Urgent Action Modal -->
  <UrgentActionModal
    :show="urgentModal.isOpen.value"
    :action="selectedUrgentAction"
    :all-actions="urgentActions"
    @close="urgentModal.close()"
  />

  <!-- Dashboard Scanner Modal (pickups / returns) -->
  <DashboardScannerModal
    :show="scannerModal.show"
    :title="scannerModal.title"
    :scan-type="scannerModal.scanType"
    :shipment-ids="scannerModal.shipmentIds"
    @close="closeScannerModal"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject, markRaw, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { isReturnStatus, CANCELLED_STATUSES } from '@/utils/shipment-statuses'
import { useAuthStore } from '@/stores/auth'
import { subSectionRoutes } from '@/composables/useNavigation'

// Lucide icons for icon mapping
import {
  FileCheck, AlertTriangle, RotateCcw, Clock, Package,
  Truck, Banknote, CheckCircle
} from 'lucide-vue-next'

// Demo data
import {
  demoDashboardStats, demoUrgentActions, demoDailyTasks
} from '@/data/demo/dashboard'
import { demoActivityLogs } from '@/data/demo/activity'
import { demoDelayedShipments, demoDelayedPatterns } from '@/data/demo/search'
import { demoReturnAlerts } from '@/data/demo/returns'

// Feature components
import DashboardOverview from '@/components/features/dashboard/DashboardOverview.vue'
import DashboardTodayTasks from '@/components/features/dashboard/DashboardTodayTasks.vue'
import DashboardDelayed from '@/components/features/dashboard/DashboardDelayed.vue'
import DashboardReturnAlerts from '@/components/features/dashboard/DashboardReturnAlerts.vue'
import DashboardFinancialSnapshot from '@/components/features/dashboard/DashboardFinancialSnapshot.vue'
import DashboardActivityLog from '@/components/features/dashboard/DashboardActivityLog.vue'
import UrgentActionModal from '@/components/features/dashboard/UrgentActionModal.vue'
import DashboardScannerModal from '@/components/features/dashboard/DashboardScannerModal.vue'
import { useModal } from '@/composables/useModal'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

function navigateTo(subSection: string) {
  const routeInfo = subSectionRoutes[subSection]
  if (routeInfo) router.push(routeInfo.path)
}

// ---------------------------------------------------------------------------
// Urgent Action Modal
// ---------------------------------------------------------------------------

const selectedUrgentAction = ref<any>(null)
const urgentModal = useModal(() => { selectedUrgentAction.value = null })

function onHandleAction(action: any) {
  selectedUrgentAction.value = action
  urgentModal.open()
}

function onHandleAllActions() {
  selectedUrgentAction.value = null
  urgentModal.open()
}

// ---------------------------------------------------------------------------
// Dashboard Scanner Modal (for today tasks: pickups + returns)
// ---------------------------------------------------------------------------

const scannerModal = ref({ show: false, title: '', scanType: 'out' as 'out' | 'in', shipmentIds: [] as string[] })

function openScannerModal(title: string, scanType: 'out' | 'in', shipmentIds: string[]) {
  scannerModal.value = { show: true, title, scanType, shipmentIds }
}

function closeScannerModal() {
  scannerModal.value.show = false
}

const toast = useToast()
const printingAll = ref(false)

async function printAllLabels() {
  const labelsCategory = filteredTaskCategories.value.find(c => c.id === 'labels')
  if (!labelsCategory) return

  const urls = labelsCategory.tasks
    .map((t: any) => t.labelUrl)
    .filter((url: string | null | undefined) => !!url)

  if (urls.length === 0) {
    toast.error('Aucun bordereau avec URL disponible')
    return
  }

  printingAll.value = true
  try {
    const { data, error } = await supabase.functions.invoke('merge-multiple-labels', {
      body: { urls },
    })

    if (error) throw error

    // Detect response type from the blob
    const text = data instanceof Blob ? await data.text() : typeof data === 'string' ? data : JSON.stringify(data)

    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      // HTML response (Navex labels) — open in new tab with print dialog
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(text)
        printWindow.document.close()
        printWindow.onload = () => printWindow.print()
      }
    } else if (text.startsWith('{') && text.includes('"pdf"')) {
      // Mixed response — open both PDF and HTML
      const json = JSON.parse(text)
      if (json.pdf) {
        const pdfBytes = Uint8Array.from(atob(json.pdf), c => c.charCodeAt(0))
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })
        window.open(URL.createObjectURL(pdfBlob), '_blank')
      }
      if (json.html) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(json.html)
          printWindow.document.close()
          printWindow.onload = () => printWindow.print()
        }
      }
    } else {
      // PDF response
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' })
      window.open(URL.createObjectURL(blob), '_blank')
    }
  } catch (e: any) {
    toast.error('Erreur fusion PDF: ' + (e.message || e))
  } finally {
    printingAll.value = false
  }
}

// ---------------------------------------------------------------------------
// Icon mapping helper
// ---------------------------------------------------------------------------

const iconMap: Record<string, any> = {
  FileCheck: markRaw(FileCheck),
  AlertTriangle: markRaw(AlertTriangle),
  RotateCcw: markRaw(RotateCcw),
  Clock: markRaw(Clock),
  Package: markRaw(Package),
  Truck: markRaw(Truck),
  Banknote: markRaw(Banknote),
  CheckCircle: markRaw(CheckCircle),
}

function mapIcons<T extends { iconType: string }>(items: T[]) {
  return items.map(item => ({
    ...item,
    icon: iconMap[item.iconType] || markRaw(Package),
  }))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Start of today */
function todayStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Start of yesterday */
function yesterdayStart(): Date {
  const d = todayStart()
  d.setDate(d.getDate() - 1)
  return d
}

/** Date N days ago (start of day) */
function daysAgo(n: number): Date {
  const d = todayStart()
  d.setDate(d.getDate() - n)
  return d
}

// ---------------------------------------------------------------------------
// 1. Dashboard Overview Stats
// ---------------------------------------------------------------------------

const dashboardStats = computed(() => {
  if (authStore.isDemoMode) {
    return demoDashboardStats
  }

  const all = appStore.shipments
  const today = todayStart()
  const yesterday = yesterdayStart()
  const tomorrowStart = new Date(today)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  // Today's shipments: created today OR still active (in transit / out for delivery)
  const todayCreated = all.filter(s => new Date(s.createdAt) >= today)
  const todayDelivered = all.filter(s => s.status === 'Livré' && s.deliveryDate && new Date(s.deliveryDate) >= today)
  const todayReturns = all.filter(s => isReturnStatus(s.status) && s.events?.[0]?.date && new Date(s.events[0].date) >= today)

  // Active deliveries today = out for delivery + in transit
  const todayDeliveries = all.filter(s =>
    s.status === 'En cours' || (s.status === 'Livré' && s.deliveryDate && new Date(s.deliveryDate) >= today)
  ).length

  // Yesterday's stats
  const yesterdayCreated = all.filter(s => {
    const d = new Date(s.createdAt)
    return d >= yesterday && d < today
  })
  const yesterdayDelivered = all.filter(s => {
    if (s.status !== 'Livré' || !s.deliveryDate) return false
    const d = new Date(s.deliveryDate)
    return d >= yesterday && d < today
  })

  // Success rate: delivered / (delivered + returned) over last 30 days
  const last30 = all.filter(s => new Date(s.createdAt) >= daysAgo(30))
  const last30Delivered = last30.filter(s => s.status === 'Livré').length
  const last30Terminal = last30.filter(s => s.status === 'Livré' || isReturnStatus(s.status)).length
  const successRate = last30Terminal > 0 ? Math.round((last30Delivered / last30Terminal) * 100) : 0

  // Last week success rate
  const lastWeek = all.filter(s => {
    const d = new Date(s.createdAt)
    return d >= daysAgo(14) && d < daysAgo(7)
  })
  const lwDelivered = lastWeek.filter(s => s.status === 'Livré').length
  const lwTerminal = lastWeek.filter(s => s.status === 'Livré' || isReturnStatus(s.status)).length
  const lastWeekSuccessRate = lwTerminal > 0 ? Math.round((lwDelivered / lwTerminal) * 100) : 0

  // Expected COD: sum of cod for shipments not yet delivered/returned/cancelled
  const pendingShipments = all.filter(s => s.status !== 'Livré' && !isReturnStatus(s.status) && !CANCELLED_STATUSES.includes(s.status))
  const expectedCOD = pendingShipments.reduce((sum, s) => sum + (s.cod || 0), 0)
  const pendingConfirmations = all.filter(s => s.status === 'En attente').length

  // Orders change
  const todayOrdersCount = todayCreated.length
  const yesterdayOrdersCount = yesterdayCreated.length
  const ordersChange = yesterdayOrdersCount > 0
    ? Math.round(((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) * 100)
    : 0

  // Delivered change
  const todayDeliveredCount = todayDelivered.length
  const yesterdayDeliveredCount = yesterdayDelivered.length
  const deliveredChange = yesterdayDeliveredCount > 0
    ? Math.round(((todayDeliveredCount - yesterdayDeliveredCount) / yesterdayDeliveredCount) * 100)
    : 0

  // Returns change (negative is good)
  const todayReturnsCount = todayReturns.length
  const yesterdayReturns = all.filter(s => {
    if (!isReturnStatus(s.status)) return false
    const ev = s.events?.[0]
    if (!ev?.date) return false
    const d = new Date(ev.date)
    return d >= yesterday && d < today
  })
  const yesterdayReturnsCount = yesterdayReturns.length
  const returnsChange = yesterdayReturnsCount > 0
    ? Math.round(((todayReturnsCount - yesterdayReturnsCount) / yesterdayReturnsCount) * 100)
    : 0

  return {
    todayDeliveries,
    todayDelivered: todayDeliveredCount,
    successRate,
    lastWeekSuccessRate,
    expectedCOD,
    pendingConfirmations,
    todayOrders: todayOrdersCount,
    yesterdayOrders: yesterdayOrdersCount || 1, // avoid division by 0 in template
    ordersChange,
    deliveredChange,
    todayReturns: todayReturnsCount,
    returnsChange,
    yesterdayDelivered: yesterdayDeliveredCount || 1, // avoid division by 0 in template
  }
})

// ---------------------------------------------------------------------------
// 2. Urgent Actions
// ---------------------------------------------------------------------------

const urgentActions = computed(() => {
  if (authStore.isDemoMode) {
    return mapIcons(demoUrgentActions)
  }

  const all = appStore.shipments
  const actions: any[] = []
  let id = 1

  // Pending confirmations (not yet out_scanned)
  const allPendingPickup = all.filter(s =>
    s.status === 'En attente' || s.status === "Demande d'enlèvement" || s.status === "Demande d'enlèvement assignée"
  )
  const pendingScans = allPendingPickup.filter(s => !s.outScannedAt)

  if (pendingScans.length > 0) {
    actions.push({
      id: id++,
      type: 'confirm',
      icon: markRaw(FileCheck),
      title: `${allPendingPickup.length} colis en attente de pickup`,
      description: `${pendingScans.length} à scanner`,
      time: 'Maintenant',
      actionLabel: 'Scanner',
      shipmentIds: allPendingPickup.map(s => s.id),
    })
  }

  // Delayed in transit (transitDays >= 3)
  const delayed = all.filter(s => s.status === 'En cours' && s.transitDays >= 3)
  if (delayed.length > 0) {
    // Show the most delayed one specifically
    const worst = delayed.sort((a, b) => b.transitDays - a.transitDays)[0]
    actions.push({
      id: id++,
      type: 'delayed',
      icon: markRaw(AlertTriangle),
      title: `Colis ${worst.trackingNumber} en retard +${worst.transitDays} jours`,
      description: 'Retard de livraison',
      time: `+${worst.transitDays}j`,
      actionLabel: 'Voir',
      shipmentIds: delayed.map(s => s.id),
    })
  }

  // Stuck in transit >= 2 days
  const stuck = all.filter(s => s.status === 'En cours' && s.transitDays >= 2)
  if (stuck.length > 0 && stuck.length !== delayed.length) {
    actions.push({
      id: id++,
      type: 'delayed',
      icon: markRaw(Clock),
      title: `${stuck.length} colis bloqués en transit depuis 48h+`,
      description: 'Colis bloqués',
      time: 'Récent',
      actionLabel: 'Voir',
      shipmentIds: stuck.map(s => s.id),
    })
  }

  // Returns to process
  const returned = all.filter(s => isReturnStatus(s.status))
  if (returned.length > 0) {
    actions.push({
      id: id++,
      type: 'return',
      icon: markRaw(RotateCcw),
      title: `${returned.length} retour${returned.length > 1 ? 's' : ''} a verifier`,
      description: 'Retours a verifier',
      time: 'Récent',
      actionLabel: 'Traiter',
      shipmentIds: returned.map(s => s.id),
    })
  }

  // Labels not printed
  const unprinted = all.filter(s => s.status === 'En attente' && !s.labelPrinted)
  if (unprinted.length > 0) {
    actions.push({
      id: id++,
      type: 'print',
      icon: markRaw(Package),
      title: `${unprinted.length} bordereau${unprinted.length > 1 ? 'x' : ''} a imprimer`,
      description: 'Bordereaux a imprimer',
      time: 'Récent',
      actionLabel: 'Imprimer',
      shipmentIds: unprinted.map(s => s.id),
    })
  }

  return actions
})

// Weather regions (static / not derived from shipments)
const weatherRegions = ref<any[]>([])

// Derived counts for overview badges
const delayedShipmentsCount = computed(() => delayedShipments.value.length)
const returnAlertsCount = computed(() => returnAlerts.value.length)

// ---------------------------------------------------------------------------
// 3. Today's Tasks (filteredTaskCategories + dailyTasksStats)
// ---------------------------------------------------------------------------

// filteredTaskCategories must remain a ref because toggle/complete mutate tasks
const filteredTaskCategories = ref<any[]>([])
const dailyTasksStats = ref({ total: 0, completed: 0, pending: 0, progressPercent: 0 })

/** Recompute dailyTasksStats from the current filteredTaskCategories. */
function recalcDailyTasksStats() {
  let total = 0
  let completed = 0
  for (const cat of filteredTaskCategories.value) {
    for (const t of cat.tasks) {
      total++
      if (t.completed) completed++
    }
  }
  const pending = total - completed
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0
  dailyTasksStats.value = { total, completed, pending, progressPercent }
}

// Populate task categories reactively from shipments
watchEffect(() => {
  if (authStore.isDemoMode) {
    const taskMap = demoDailyTasks
    filteredTaskCategories.value = [
      {
        id: 'orders',
        name: 'Pickups à scanner',
        icon: markRaw(FileCheck),
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600',
        tasks: (taskMap.orders || []).map(t => ({ ...t })),
      },
      {
        id: 'labels',
        name: 'Impressions',
        icon: markRaw(Package),
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600',
        tasks: (taskMap.labels || []).map(t => ({ ...t })),
      },
      {
        id: 'packages',
        name: 'Préparation colis',
        icon: markRaw(Package),
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600',
        tasks: (taskMap.packages || []).map(t => ({ ...t })),
      },
      {
        id: 'returns',
        name: 'Retours',
        icon: markRaw(RotateCcw),
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600',
        tasks: (taskMap.returns || []).map(t => ({ ...t })),
      },
      {
        id: 'finance',
        name: 'Finance',
        icon: markRaw(Banknote),
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600',
        tasks: (taskMap.finance || []).map(t => ({ ...t })),
      },
    ]
    recalcDailyTasksStats()
    return
  }

  // Live mode: derive tasks from real shipments
  const all = appStore.shipments
  const categories: any[] = []

  // Orders to confirm
  const pendingOrders = all.filter(s => s.status === 'En attente')
  if (pendingOrders.length > 0) {
    categories.push({
      id: 'orders',
      name: 'Pickups à scanner',
      icon: markRaw(FileCheck),
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      tasks: pendingOrders.map((s, i) => ({
        id: 100 + i,
        shipmentId: s.id,
        title: `${s.orderNumber} - ${s.customerName} - ${s.destination}`,
        completed: false,
        completedAt: '',
        actionLabel: 'Scanner',
        action: true,
      })),
    })
  }

  // Labels to print
  const toPrint = all.filter(s => s.status === 'En attente' && !s.labelPrinted)
  if (toPrint.length > 0) {
    categories.push({
      id: 'labels',
      name: 'Impressions',
      icon: markRaw(Package),
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
      tasks: toPrint.map((s, i) => ({
        id: 200 + i,
        shipmentId: s.id,
        labelUrl: s.labelUrl,
        title: `${s.trackingNumber} - Imprimer bordereau`,
        completed: false,
        completedAt: '',
        actionLabel: 'Imprimer',
        action: true,
      })),
    })
  }

  // Packages to prepare (picked up shipments grouped by carrier)
  const pickedUp = all.filter(s => s.status === 'Enlevé')
  if (pickedUp.length > 0) {
    const byCarrier = new Map<string, number>()
    for (const s of pickedUp) {
      byCarrier.set(s.carrier, (byCarrier.get(s.carrier) || 0) + 1)
    }
    const packageTasks = Array.from(byCarrier.entries()).map(([carrier, count], i) => ({
      id: 300 + i,
      title: `Préparer ${count} colis pour ${carrier}`,
      completed: false,
      completedAt: '',
      actionLabel: 'Marquer prêt',
      action: true,
    }))
    categories.push({
      id: 'packages',
      name: 'Préparation colis',
      icon: markRaw(Package),
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600',
      tasks: packageTasks,
    })
  }

  // Returns to process
  const returned = all.filter(s => isReturnStatus(s.status))
  if (returned.length > 0) {
    categories.push({
      id: 'returns',
      name: 'Retours',
      icon: markRaw(RotateCcw),
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600',
      tasks: returned.map((s, i) => ({
        id: 400 + i,
        shipmentId: s.id,
        title: `Retour ${s.trackingNumber} - ${(s as any).return_reason || 'À vérifier'}`,
        completed: false,
        completedAt: '',
        actionLabel: 'Scanner',
        action: true,
      })),
    })
  }

  filteredTaskCategories.value = categories
  recalcDailyTasksStats()
})

/** Toggle a single task's completed state within a category. */
function toggleDailyTask(_categoryId: string, _taskId: number) {
  for (const cat of filteredTaskCategories.value) {
    if (cat.id !== _categoryId) continue
    const task = cat.tasks.find((t: any) => t.id === _taskId)
    if (task) {
      task.completed = !task.completed
      task.completedAt = task.completed
        ? new Date().toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })
        : ''
    }
    break
  }
  recalcDailyTasksStats()
}

/** Mark every task in a given category as completed. */
function completeAllInCategory(_categoryId: string) {
  const category = filteredTaskCategories.value.find((c: any) => c.id === _categoryId)
  if (!category) return
  const now = new Date().toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })
  for (const task of category.tasks) {
    if (!task.completed) {
      task.completed = true
      task.completedAt = now
    }
  }
  recalcDailyTasksStats()
}

/**
 * Execute the quick-action associated with a task.
 * Dispatches based on the task's category (derived from its id range)
 * and actionLabel to determine the correct behaviour.
 */
function executeTaskAction(task: any) {
  const label: string = (task.actionLabel || '').toLowerCase()

  if (label === 'scanner') {
    // Determine scan type based on category (id range: 100s = orders/pickups, 400s = returns)
    const category = filteredTaskCategories.value.find(c => c.tasks.some((t: any) => t.id === task.id))
    if (category?.id === 'returns') {
      const ids = category.tasks.map((t: any) => t.shipmentId).filter(Boolean)
      openScannerModal('Scanner retours', 'in', ids)
    } else {
      const cat = filteredTaskCategories.value.find(c => c.id === 'orders')
      const ids = cat ? cat.tasks.map((t: any) => t.shipmentId).filter(Boolean) : []
      openScannerModal('Scanner pickups', 'out', ids)
    }
    return
  }

  if (label === 'imprimer') {
    // Open the label directly in a new tab
    if (task.labelUrl) {
      window.open(task.labelUrl, '_blank')
    }
    return
  }

  if (label === 'vérifier' || label === 'relancer') {
    router.push('/finance')
    return
  }

  if (label === 'marquer prêt') {
    router.push('/pickups/scan')
    return
  }

  router.push('/shipments')
}

// ---------------------------------------------------------------------------
// 4. Delayed Shipments
// ---------------------------------------------------------------------------

const delayedShipments = computed(() => {
  if (authStore.isDemoMode) {
    return demoDelayedShipments
  }

  const all = appStore.shipments
  // Shipments in transit with transitDays >= 1 (overdue)
  return all
    .filter(s => s.status === 'En cours' && s.transitDays >= 1)
    .map(s => ({
      id: s.id,
      tracking: s.trackingNumber,
      client: s.customerName,
      destination: s.destination,
      carrier: s.carrier,
      delayDays: s.transitDays,
      createdAt: s.createdAt || s.events?.[s.events.length - 1]?.date || '',
      lastUpdate: `En transit depuis ${s.transitDays} jour${s.transitDays > 1 ? 's' : ''}`,
    }))
    .sort((a, b) => b.delayDays - a.delayDays)
})

// ---------------------------------------------------------------------------
// 5. Delayed Patterns
// ---------------------------------------------------------------------------

const delayedPatterns = computed(() => {
  if (authStore.isDemoMode) {
    return demoDelayedPatterns
  }

  const delayed = delayedShipments.value
  if (delayed.length === 0) return []

  const patterns: { id: number; message: string }[] = []
  let patternId = 1

  // Pattern: repeated delays per carrier
  const carrierCounts = new Map<string, number>()
  for (const s of delayed) {
    carrierCounts.set(s.carrier, (carrierCounts.get(s.carrier) || 0) + 1)
  }
  for (const [carrier, count] of carrierCounts) {
    if (count >= 2) {
      patterns.push({
        id: patternId++,
        message: `${count} retards consécutifs via ${carrier} cette semaine`,
      })
    }
  }

  // Pattern: region clustering
  const regionCounts = new Map<string, number>()
  for (const s of delayed) {
    regionCounts.set(s.destination, (regionCounts.get(s.destination) || 0) + 1)
  }
  for (const [region, count] of regionCounts) {
    if (count >= 2) {
      patterns.push({
        id: patternId++,
        message: `${count} colis en retard vers ${region}`,
      })
    }
  }

  // Pattern: critical delays (> 3 days)
  const critical = delayed.filter(s => s.delayDays > 3)
  if (critical.length > 0) {
    patterns.push({
      id: patternId++,
      message: `${critical.length} colis en retard critique (+3 jours)`,
    })
  }

  return patterns
})

// ---------------------------------------------------------------------------
// 6. Return Alerts
// ---------------------------------------------------------------------------

const returnAlerts = computed(() => {
  if (authStore.isDemoMode) {
    return demoReturnAlerts
  }

  const all = appStore.shipments
  const returned = all.filter(s => isReturnStatus(s.status))
  const alerts: any[] = []
  let id = 1

  // Build a map of customer names to return counts (for recidivist detection)
  const customerReturnCounts = new Map<string, number>()
  for (const s of returned) {
    customerReturnCounts.set(s.customerName, (customerReturnCounts.get(s.customerName) || 0) + 1)
  }

  // Failed attempts: returned shipments
  for (const s of returned) {
    const reason = (s as any).return_reason || ''
    const isAbsent = reason.toLowerCase().includes('absent')
    const isRefusal = reason.toLowerCase().includes('refus')

    // Count events with "Tentative" in the status as attempts
    const attempts = (s.events || []).filter((e: any) =>
      e.status?.toLowerCase().includes('tentative')
    ).length + 1 // +1 for the return itself

    const lastEvent = s.events?.[0]

    alerts.push({
      id: id++,
      type: 'failed-attempt' as const,
      client: s.customerName,
      tracking: s.trackingNumber,
      destination: s.destination,
      attempts,
      lastAttempt: lastEvent?.date || '',
      amount: s.cod || s.totalPrice || 0,
      isRecidivist: (customerReturnCounts.get(s.customerName) || 0) > 1,
    })
  }

  // Risk alerts: in-transit shipments with high transit days
  const atRisk = all.filter(s => s.status === 'En cours' && s.transitDays >= 2)
  for (const s of atRisk) {
    const prevReturns = customerReturnCounts.get(s.customerName) || 0
    let riskScore = 30 + s.transitDays * 10
    let riskReason = `En transit depuis ${s.transitDays} jours`
    if (prevReturns > 0) {
      riskScore += 20
      riskReason = `Historique: ${prevReturns} retour${prevReturns > 1 ? 's' : ''} précédent${prevReturns > 1 ? 's' : ''}`
    }
    if ((s.cod || 0) > 5000) {
      riskScore += 10
      riskReason += ' + COD élevé'
    }
    riskScore = Math.min(99, riskScore)

    alerts.push({
      id: id++,
      type: 'risk' as const,
      client: s.customerName,
      tracking: s.trackingNumber,
      riskScore,
      riskReason,
    })
  }

  return alerts
})

// ---------------------------------------------------------------------------
// 7. Financial Snapshot
// ---------------------------------------------------------------------------

const financialSnapshot = computed(() => {
  const all = appStore.shipments

  // Pending COD: shipments not yet delivered/returned/cancelled
  const activeShipments = all.filter(s => s.status !== 'Livré' && !isReturnStatus(s.status) && !CANCELLED_STATUSES.includes(s.status))
  const pendingCOD = activeShipments.reduce((sum, s) => sum + (s.cod || 0), 0)
  const pendingCODCount = activeShipments.length

  // Delivery fees this month
  const delivered = all.filter(s => s.status === 'Livré')
  const deliveryFees = delivered.reduce((sum, s) => sum + (s.deliveryFee || 0), 0)

  // Revenue from delivered
  const revenue = delivered.reduce((sum, s) => sum + (s.totalPrice || 0), 0)
  const netMargin = revenue - deliveryFees

  // Carriers with pending payments
  const carrierSet = new Set(activeShipments.map(s => s.carrier))
  const pendingCarriersCount = carrierSet.size

  // COD by carrier
  const carrierCODMap = new Map<string, { count: number; amount: number }>()
  for (const s of activeShipments) {
    const c = carrierCODMap.get(s.carrier) || { count: 0, amount: 0 }
    c.count++
    c.amount += s.cod || 0
    carrierCODMap.set(s.carrier, c)
  }

  const carrierColors: Record<string, { colorClass: string; iconColor: string }> = {
    'Yalidine': { colorClass: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    'ZR Express': { colorClass: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600' },
    'Maystro Delivery': { colorClass: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' },
  }
  const defaultColor = { colorClass: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-600' }

  const codByCarrier = Array.from(carrierCODMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    amount: data.amount,
    overdue: 0,
    ...(carrierColors[name] || defaultColor),
  }))

  // Cash flow projection (7 days)
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const today = new Date()
  const cashFlowProjection = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return {
      label: dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1],
      incoming: Math.round(pendingCOD / 7 * (0.8 + Math.random() * 0.4)),
      outgoing: Math.round(deliveryFees / 7 * (0.8 + Math.random() * 0.4)),
    }
  })

  return {
    pendingCOD,
    pendingCODCount,
    pendingPayments: pendingCOD,
    pendingCarriersCount,
    deliveryFees,
    netMargin,
    marginPercent: revenue > 0 ? Math.round((netMargin / revenue) * 100) : 0,
    codByCarrier,
    overduePayments: [] as any[],
    cashFlowProjection,
  }
})

// ---------------------------------------------------------------------------
// 8. Activity Logs
// ---------------------------------------------------------------------------

const activityLogs = computed(() => {
  if (authStore.isDemoMode) {
    return mapIcons(demoActivityLogs)
  }

  const all = appStore.shipments
  const logs: any[] = []
  let id = 1

  // Generate activity logs from shipment events
  for (const s of all) {
    if (!s.events) continue
    for (const ev of s.events) {
      let type = 'status'
      let iconType = 'Package'

      const statusLower = (ev.status || '').toLowerCase()
      if (statusLower.includes('livré')) {
        type = 'status'
        iconType = 'CheckCircle'
      } else if (statusLower.includes('transit') || statusLower.includes('livraison')) {
        type = 'status'
        iconType = 'Truck'
      } else if (statusLower.includes('ramassé')) {
        type = 'status'
        iconType = 'Package'
      } else if (statusLower.includes('retourné') || statusLower.includes('retour')) {
        type = 'return'
        iconType = 'RotateCcw'
      } else if (statusLower.includes('tentative') || statusLower.includes('échouée')) {
        type = 'error'
        iconType = 'AlertTriangle'
      }

      // Parse date string to extract time and date label
      const dateStr = ev.date || ''
      const timeMatch = dateStr.match(/(\d{2}:\d{2})/)
      const time = timeMatch ? timeMatch[1] : ''

      // Determine if today/yesterday/other
      let dateLabel = dateStr.split(' à ')[0] || dateStr
      const today = new Date()
      const todayStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      if (dateLabel.includes(todayStr.split(' ')[0]) && dateLabel.includes(todayStr.split(' ')[1])) {
        dateLabel = "Aujourd'hui"
      }

      logs.push({
        id: id++,
        type,
        icon: iconMap[iconType] || markRaw(Package),
        message: ev.description || ev.status || '',
        time,
        date: dateLabel,
        tracking: s.trackingNumber,
        user: 'Système',
      })
    }
  }

  // Sort by most recent first (by id descending, since we process oldest first)
  return logs.reverse().slice(0, 30)
})</script>

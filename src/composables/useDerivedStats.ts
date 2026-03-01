import { computed, type Ref } from 'vue'
import type { UIShipment } from '@/mappers/shipments'
import type { UICarrier } from '@/mappers/carriers'
import type { UIClient } from '@/mappers/clients'

export function useDerivedStats(
  shipments: Ref<UIShipment[]>,
  carriers: Ref<UICarrier[]>,
  clientsList: Ref<UIClient[]>,
  userBalance: Ref<{ delivered: number; returned: number }>
) {
  const today = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today().getTime()
  }

  const isYesterday = (dateStr: string) => {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    const y = today()
    y.setDate(y.getDate() - 1)
    return d.getTime() === y.getTime()
  }

  // ==================== Dashboard Stats ====================
  const dashboardStats = computed(() => {
    const all = shipments.value
    const todayShipments = all.filter(s => isToday(s.createdAt))
    const yesterdayShipments = all.filter(s => isYesterday(s.createdAt))
    const delivered = all.filter(s => s.status === 'Delivered')
    const todayDelivered = delivered.filter(s => s.deliveryDate && isToday(s.deliveryDate))
    const yesterdayDelivered = delivered.filter(s => s.deliveryDate && isYesterday(s.deliveryDate))
    const returned = all.filter(s => s.status === 'Returned')
    const todayReturns = returned.filter(s => isToday(s.createdAt))
    const successRate = all.length > 0 ? Math.round((delivered.length / all.length) * 100) : 0
    const pendingCOD = all.filter(s => s.status !== 'Delivered' && s.status !== 'Returned' && s.status !== 'Cancelled')
      .reduce((sum, s) => sum + s.cod, 0)

    return {
      performanceScore: successRate,
      todayDeliveries: todayShipments.length,
      todayDelivered: todayDelivered.length,
      successRate,
      lastWeekSuccessRate: successRate,
      expectedCOD: pendingCOD,
      pendingConfirmations: all.filter(s => s.status === 'Pending').length,
      todayOrders: todayShipments.length,
      yesterdayOrders: yesterdayShipments.length,
      ordersChange: yesterdayShipments.length > 0 ? Math.round(((todayShipments.length - yesterdayShipments.length) / yesterdayShipments.length) * 100) : 0,
      deliveredChange: yesterdayDelivered.length > 0 ? Math.round(((todayDelivered.length - yesterdayDelivered.length) / yesterdayDelivered.length) * 100) : 0,
      todayReturns: todayReturns.length,
      returnsChange: 0,
      yesterdayDelivered: yesterdayDelivered.length,
    }
  })

  // ==================== Financial Stats ====================
  const financialSnapshot = computed(() => {
    const all = shipments.value
    const pendingShipments = all.filter(s => s.status !== 'Delivered' && s.status !== 'Returned' && s.status !== 'Cancelled')
    const pendingCOD = pendingShipments.reduce((sum, s) => sum + s.cod, 0)
    const deliveredCOD = all.filter(s => s.status === 'Delivered').reduce((sum, s) => sum + s.cod, 0)
    const totalFees = all.reduce((sum, s) => sum + s.deliveryFee, 0)

    return {
      pendingCOD,
      pendingCODCount: pendingShipments.length,
      deliveredCOD,
      totalFees,
      balance: {
        delivered: userBalance.value.delivered,
        returned: userBalance.value.returned,
      },
    }
  })

  // ==================== Returns Data ====================
  const returnsData = computed(() => {
    const returned = shipments.value.filter(s => s.status === 'Returned')
    const totalValue = returned.reduce((sum, s) => sum + s.cod, 0)
    return {
      active: returned.length,
      recovered: 0,
      lost: 0,
      total: returned.length,
      totalValue,
      recoveredValue: 0,
      pendingValue: totalValue,
      lostValue: 0,
    }
  })

  const carriersReturnStats = computed(() => {
    const returned = shipments.value.filter(s => s.status === 'Returned')
    const byCarrier: Record<string, { count: number; value: number }> = {}
    returned.forEach(s => {
      const c = s.carrier
      if (!byCarrier[c]) byCarrier[c] = { count: 0, value: 0 }
      byCarrier[c].count++
      byCarrier[c].value += s.cod
    })
    return Object.entries(byCarrier).map(([name, stats]) => ({
      carrier: name,
      returns: stats.count,
      value: stats.value,
      rate: shipments.value.filter(s => s.carrier === name).length > 0
        ? Math.round((stats.count / shipments.value.filter(s => s.carrier === name).length) * 100)
        : 0,
    }))
  })

  // ==================== Analytics KPIs ====================
  const analyticsKpis = computed(() => {
    const all = shipments.value
    const delivered = all.filter(s => s.status === 'Delivered')
    const returned = all.filter(s => s.status === 'Returned')
    const totalRevenue = delivered.reduce((sum, s) => sum + s.cod, 0)
    const avgTransit = delivered.length > 0
      ? Math.round(delivered.reduce((sum, s) => sum + s.transitDays, 0) / delivered.length * 10) / 10
      : 0

    return {
      totalShipments: all.length,
      deliveryRate: all.length > 0 ? Math.round((delivered.length / all.length) * 100) : 0,
      avgTransitTime: avgTransit,
      totalRevenue,
      returnRate: all.length > 0 ? Math.round((returned.length / all.length) * 100) : 0,
      exceptionRate: 0,
      customerSatisfaction: 0,
    }
  })

  // ==================== Delivery Performance ====================
  const deliveryPerformance = computed(() => {
    const all = shipments.value
    const delivered = all.filter(s => s.status === 'Delivered')
    return {
      successfulDeliveries: delivered.length,
      totalAttempts: all.length,
      firstAttemptRate: 0, // Would need attempt data
      avgDeliveryTime: delivered.length > 0
        ? Math.round(delivered.reduce((sum, s) => sum + s.transitDays, 0) / delivered.length * 10) / 10
        : 0,
      onTimeRate: 0, // Would need SLA data
      regionalPerformance: [],
    }
  })

  // ==================== Carrier Stats (cross-reference) ====================
  function computeCarrierStats() {
    carriers.value.forEach(carrier => {
      const carrierShipments = shipments.value.filter(s => s.carrier === carrier.name)
      const delivered = carrierShipments.filter(s => s.status === 'Delivered')
      carrier.shipments = carrierShipments.length
      carrier.delivered = delivered.length
      carrier.deliveryRate = carrierShipments.length > 0
        ? Math.round((delivered.length / carrierShipments.length) * 100)
        : 0
      carrier.avgTime = delivered.length > 0
        ? Math.round(delivered.reduce((sum, s) => sum + s.transitDays, 0) / delivered.length * 10) / 10
        : 0
    })
  }

  // ==================== Delayed Shipments ====================
  const delayedShipments = computed(() => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    return shipments.value
      .filter(s => {
        if (s.status === 'Delivered' || s.status === 'Returned' || s.status === 'Cancelled') return false
        const created = new Date(s.createdAt)
        return created < threeDaysAgo
      })
      .map(s => {
        const delayDays = Math.ceil((Date.now() - new Date(s.createdAt).getTime()) / 86400000)
        return { ...s, delayDays, severity: delayDays > 5 ? 'critical' : delayDays > 3 ? 'warning' : 'info' }
      })
  })

  // ==================== Chart Data ====================
  const chartData = computed(() => {
    const months = new Array(12).fill(0)
    shipments.value.forEach(s => {
      const month = new Date(s.createdAt).getMonth()
      months[month]++
    })
    return months
  })

  return {
    dashboardStats,
    financialSnapshot,
    returnsData,
    carriersReturnStats,
    analyticsKpis,
    deliveryPerformance,
    delayedShipments,
    chartData,
    computeCarrierStats,
  }
}

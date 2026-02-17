<template>
  <div>
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart2 class="w-6 h-6 mr-2 text-primary-blue" />
              Statistiques Clients
            </h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analyse detaillee de votre base clients</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center space-x-2">
          <select v-model="statsTimeRange" class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="1y">Cette annee</option>
          </select>
        </div>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Clients</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clients.length }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center">
              <Users class="w-6 h-6 text-primary-blue" />
            </div>
          </div>
          <div class="flex items-center mt-2 text-xs">
            <span class="text-green-600 flex items-center"><TrendingUp class="w-3 h-3 mr-1" />+12%</span>
            <span class="text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Commande Moyenne</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ averageOrderValue.toFixed(0) }} TND</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <ShoppingBag class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div class="flex items-center mt-2 text-xs">
            <span class="text-green-600 flex items-center"><TrendingUp class="w-3 h-3 mr-1" />+5%</span>
            <span class="text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Taux de Retention</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ retentionRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <RefreshCw class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="flex items-center mt-2 text-xs">
            <span class="text-green-600 flex items-center"><TrendingUp class="w-3 h-3 mr-1" />+3%</span>
            <span class="text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Valeur Client (LTV)</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ lifetimeValue.toFixed(0) }} TND</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Gem class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div class="flex items-center mt-2 text-xs">
            <span class="text-green-600 flex items-center"><TrendingUp class="w-3 h-3 mr-1" />+8%</span>
            <span class="text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Client Distribution by Status -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Repartition par Statut</h3>
          <div class="space-y-4">
            <div v-for="status in clientStatusDistribution" :key="status.label" class="flex items-center">
              <div class="w-32 text-sm text-gray-600 dark:text-gray-400">{{ status.label }}</div>
              <div class="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                <div :style="{ width: status.percentage + '%' }" :class="status.color" class="h-full rounded-lg transition-all duration-500"></div>
                <span class="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">{{ status.count }} ({{ status.percentage.toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Client Distribution by Region -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Repartition par Region</h3>
          <div class="space-y-3">
            <div v-for="region in clientRegionDistribution" :key="region.name" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :class="region.color"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ region.name }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div :style="{ width: region.percentage + '%' }" :class="region.bgColor" class="h-full rounded-full"></div>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{{ region.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Clients -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Top 5 Clients par Chiffre d'Affaires</h3>
        <div class="table-responsive">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rang</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Commandes</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taux Livraison</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Depense</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="(client, index) in topClientsByRevenue" :key="client.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-4 py-4" data-label="Rang">
                  <span :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  ]">{{ index + 1 }}</span>
                </td>
                <td class="px-4 py-4" data-label="Client">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                      <span class="text-sm font-semibold text-primary-blue">{{ client.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.name }}</p>
                      <p class="text-xs text-gray-500">{{ client.region }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4" data-label="Commandes">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.totalOrders }}</p>
                </td>
                <td class="px-4 py-4" data-label="Taux Livraison">
                  <span class="text-sm font-medium" :class="client.deliveryRate >= 80 ? 'text-green-600' : client.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">
                    {{ client.deliveryRate }}%
                  </span>
                </td>
                <td class="px-4 py-4" data-label="Total Depense">
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ client.totalSpent.toLocaleString() }} TND</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delivery Performance by Client Segment -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Performance de Livraison par Segment</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-purple-700 dark:text-purple-300">Clients VIP</span>
              <Star class="w-4 h-4 text-purple-600 fill-purple-600" />
            </div>
            <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">{{ vipAverageDeliveryRate }}%</p>
            <p class="text-xs text-purple-600 dark:text-purple-400 mt-1">Taux de livraison moyen</p>
          </div>
          <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-green-700 dark:text-green-300">Clients Actifs</span>
              <CheckCircle class="w-4 h-4 text-green-600" />
            </div>
            <p class="text-2xl font-bold text-green-700 dark:text-green-300">{{ activeClientsDeliveryRate }}%</p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-1">Taux de livraison moyen</p>
          </div>
          <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-red-700 dark:text-red-300">Clients Bloques</span>
              <Ban class="w-4 h-4 text-red-600" />
            </div>
            <p class="text-2xl font-bold text-red-700 dark:text-red-300">{{ blockedAverageDeliveryRate }}%</p>
            <p class="text-xs text-red-600 dark:text-red-400 mt-1">Taux avant blocage</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter,
  BarChart2,
  Users,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  Gem,
  Star,
  CheckCircle,
  Ban
} from 'lucide-vue-next'

interface Client {
  id: number
  name: string
  phone: string
  region: string
  totalOrders: number
  deliveredOrders: number
  deliveryRate: number
  totalSpent: number
  status: string
  [key: string]: any
}

const props = defineProps<{
  clients: Client[]
}>()

defineEmits<{
  (e: 'toggle-submenu'): void
}>()

const statsTimeRange = ref('30d')

// Statistics computed properties
const averageOrderValue = computed(() => {
  const totalSpent = props.clients.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOrders = props.clients.reduce((sum, c) => sum + c.totalOrders, 0)
  return totalOrders > 0 ? totalSpent / totalOrders : 0
})

const retentionRate = computed(() => {
  const repeatingClients = props.clients.filter(c => c.totalOrders > 1).length
  return props.clients.length > 0 ? Math.round((repeatingClients / props.clients.length) * 100) : 0
})

const lifetimeValue = computed(() => {
  return props.clients.length > 0
    ? props.clients.reduce((sum, c) => sum + c.totalSpent, 0) / props.clients.length
    : 0
})

const topClientsByRevenue = computed(() => {
  return [...props.clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)
})

const clientStatusDistribution = computed(() => {
  const statusMap: Record<string, { label: string; color: string; count: number }> = {
    active: { label: 'Actifs', color: 'bg-green-500', count: 0 },
    vip: { label: 'VIP', color: 'bg-purple-500', count: 0 },
    inactive: { label: 'Inactifs', color: 'bg-gray-400', count: 0 },
    blocked: { label: 'Bloques', color: 'bg-red-500', count: 0 }
  }

  props.clients.forEach(client => {
    if (statusMap[client.status]) {
      statusMap[client.status].count++
    }
  })

  return Object.values(statusMap).map(s => ({
    ...s,
    percentage: props.clients.length > 0 ? (s.count / props.clients.length) * 100 : 0
  }))
})

const clientRegionDistribution = computed(() => {
  const regionMap: Record<string, number> = {}
  props.clients.forEach(client => {
    regionMap[client.region] = (regionMap[client.region] || 0) + 1
  })

  const colors = ['bg-primary-blue', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500']
  const bgColors = ['bg-primary-blue', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500']

  return Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      name,
      count,
      percentage: props.clients.length > 0 ? (count / props.clients.length) * 100 : 0,
      color: colors[index % colors.length],
      bgColor: bgColors[index % bgColors.length]
    }))
})

// Segment delivery rates
const vipAverageDeliveryRate = computed(() => {
  const vipClients = props.clients.filter(c => c.status === 'vip')
  if (vipClients.length === 0) return 0
  const total = vipClients.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / vipClients.length)
})

const activeClientsDeliveryRate = computed(() => {
  const activeClients = props.clients.filter(c => c.status === 'active')
  if (activeClients.length === 0) return 0
  const total = activeClients.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / activeClients.length)
})

const blockedAverageDeliveryRate = computed(() => {
  const blockedClients = props.clients.filter(c => c.status === 'blocked')
  if (blockedClients.length === 0) return 0
  const total = blockedClients.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / blockedClients.length)
})
</script>

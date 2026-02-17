<template>
  <div>
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Tous les Clients</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gerez votre base de clients</p>
          </div>
        </div>
        <button @click="$emit('open-add-client')" class="btn-primary">
          <Plus class="w-4 h-4" />
          <span>Ajouter un client</span>
        </button>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Clients</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientStats.totalClients }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center">
              <Users class="w-6 h-6 text-primary-blue" />
            </div>
          </div>
          <p class="text-xs text-green-600 mt-2">+{{ clientStats.newThisMonth }} ce mois</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Clients Actifs</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientStats.activeClients }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Commande dans les 30 jours</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Taux de Livraison</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientStats.deliveryRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Moyenne globale</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Chiffre d'affaires</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientStats.totalRevenue.toLocaleString() }} TND</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Banknote class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Total des commandes</p>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex-1 min-w-[200px] relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                v-model="clientSearchQuery"
                type="text"
                placeholder="Rechercher par nom, telephone, adresse..."
                class="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>
            <select v-model="clientFilterStatus" class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="vip">VIP</option>
              <option value="blocked">Bloques</option>
            </select>
          </div>
        </div>

        <!-- Clients Table -->
        <div class="table-responsive">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Adresse</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Commandes</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taux</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="client in filteredClients" :key="client.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-4 py-4" data-label="Client">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                      <span class="text-sm font-semibold text-primary-blue">{{ client.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.name }}</p>
                      <p class="text-xs text-gray-500">Depuis {{ client.memberSince }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4" data-label="Contact">
                  <p class="text-sm text-gray-900 dark:text-white">{{ client.phone }}</p>
                </td>
                <td class="px-4 py-4" data-label="Adresse">
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ client.address }}</p>
                  <p class="text-xs text-gray-500">{{ client.region }}</p>
                </td>
                <td class="px-4 py-4" data-label="Commandes">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.totalOrders }}</p>
                </td>
                <td class="px-4 py-4" data-label="Taux">
                  <span class="text-sm font-medium" :class="client.deliveryRate >= 80 ? 'text-green-600' : client.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">
                    {{ client.deliveryRate }}%
                  </span>
                </td>
                <td class="px-4 py-4" data-label="Total">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.totalSpent.toLocaleString() }} TND</p>
                </td>
                <td class="px-4 py-4" data-label="Statut">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    client.status === 'active' ? 'bg-green-100 text-green-700' :
                    client.status === 'vip' ? 'bg-purple-100 text-purple-700' :
                    client.status === 'blocked' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  ]">
                    {{ client.status === 'active' ? 'Actif' : client.status === 'vip' ? 'VIP' : client.status === 'blocked' ? 'Bloque' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-4 py-4" data-label="Actions">
                  <div class="flex items-center space-x-2">
                    <button @click="$emit('view-client', client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button @click="$emit('edit-client', client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                      <Settings class="w-4 h-4" />
                    </button>
                    <button @click="$emit('toggle-vip', client)" class="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg" :title="client.status === 'vip' ? 'Retirer VIP' : 'Marquer VIP'">
                      <Star class="w-4 h-4" :class="client.status === 'vip' ? 'fill-purple-600 text-purple-600' : ''" />
                    </button>
                    <button @click="$emit('toggle-blocked', client)" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg" :title="client.status === 'blocked' ? 'Debloquer' : 'Bloquer'">
                      <Ban class="w-4 h-4" :class="client.status === 'blocked' ? 'text-red-600' : ''" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter,
  Plus,
  Users,
  CheckCircle,
  TrendingUp,
  Banknote,
  Search,
  Eye,
  Settings,
  Star,
  Ban
} from 'lucide-vue-next'

interface ClientStats {
  totalClients: number
  activeClients: number
  newThisMonth: number
  deliveryRate: number
  totalRevenue: number
}

interface Client {
  id: number
  name: string
  phone: string
  address: string
  region: string
  totalOrders: number
  deliveryRate: number
  totalSpent: number
  status: string
  memberSince: string
  [key: string]: any
}

const props = defineProps<{
  clients: Client[]
  clientStats: ClientStats
}>()

defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'open-add-client'): void
  (e: 'view-client', client: Client): void
  (e: 'edit-client', client: Client): void
  (e: 'toggle-vip', client: Client): void
  (e: 'toggle-blocked', client: Client): void
}>()

const clientSearchQuery = ref('')
const clientFilterStatus = ref('all')

const filteredClients = computed(() => {
  return props.clients.filter(client => {
    const matchesSearch = clientSearchQuery.value === '' ||
      client.name.toLowerCase().includes(clientSearchQuery.value.toLowerCase()) ||
      client.phone.includes(clientSearchQuery.value) ||
      client.address.toLowerCase().includes(clientSearchQuery.value.toLowerCase())
    const matchesStatus = clientFilterStatus.value === 'all' || client.status === clientFilterStatus.value
    return matchesSearch && matchesStatus
  })
})
</script>

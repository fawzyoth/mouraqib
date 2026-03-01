<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Liste des utilisateurs</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez les comptes utilisateurs et leurs soldes</p>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ adminStats.totalUsers }}</p>
              <p class="text-sm text-gray-500">Total utilisateurs</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ adminStats.activeUsers }}</p>
              <p class="text-sm text-gray-500">Utilisateurs actifs</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-[#4959b4]/10 rounded-lg">
              <Wallet class="w-5 h-5 text-[#4959b4]" />
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ adminStats.totalBalance.toFixed(2) }} TND</p>
              <p class="text-sm text-gray-500">Solde total</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle class="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ adminStats.negativeBalances }}</p>
              <p class="text-sm text-gray-500">Soldes négatifs</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <div class="p-4 flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="adminUserSearch"
              type="text"
              placeholder="Rechercher par nom, email ou entreprise..."
              class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
          <select v-model="adminUserFilter" class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Entreprise</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Colis</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in filteredAdminUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#4959b4] flex items-center justify-center text-white font-medium text-sm">
                      {{ user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                      <p class="text-sm text-gray-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 hidden md:table-cell">
                  <p class="text-gray-900 dark:text-white">{{ user.company }}</p>
                  <p class="text-xs text-gray-500">{{ user.phone }}</p>
                </td>
                <td class="px-4 py-4 hidden lg:table-cell">
                  <span class="text-gray-900 dark:text-white font-medium">{{ user.shipmentsCount }}</span>
                </td>
                <td class="px-4 py-4 text-right">
                  <span :class="[
                    'font-semibold',
                    user.balance > 0 ? 'text-green-600' : user.balance < 0 ? 'text-red-600' : 'text-gray-500'
                  ]">
                    {{ user.balance >= 0 ? '+' : '' }}{{ user.balance.toFixed(2) }} TND
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
                  <span :class="[
                    'px-2 py-1 text-xs rounded-full font-medium',
                    user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    user.status === 'suspended' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  ]">
                    {{ user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-4 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="$emit('open-charge-modal', user)" class="px-3 py-1.5 bg-[#4959b4] hover:bg-[#3a4791] text-white text-xs font-medium rounded-lg flex items-center gap-1">
                      <Wallet class="w-3.5 h-3.5" />
                      Charger
                    </button>
                    <button class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <Eye class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredAdminUsers.length === 0" class="p-8 text-center">
          <Users class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListFilter,
  Users,
  CheckCircle,
  Wallet,
  AlertTriangle,
  Search,
  Eye
} from 'lucide-vue-next'

interface AdminUser {
  id: string
  name: string
  email: string
  company: string
  phone: string
  shipmentsCount: number
  balance: number
  status: 'active' | 'suspended' | 'inactive'
  unbilledDelivered?: number
  unbilledReturned?: number
  deliveredCount?: number
  returnedCount?: number
}

interface Props {
  adminUsers: AdminUser[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggle-submenu': []
  'open-charge-modal': [user: AdminUser]
}>()

const adminUserSearch = ref('')
const adminUserFilter = ref('all')

const filteredAdminUsers = computed(() => {
  let result = props.adminUsers

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
  totalUsers: props.adminUsers.length,
  activeUsers: props.adminUsers.filter(u => u.status === 'active').length,
  totalBalance: props.adminUsers.reduce((sum, u) => sum + u.balance, 0),
  negativeBalances: props.adminUsers.filter(u => u.balance < 0).length,
}))
</script>

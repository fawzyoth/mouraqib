<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950">
    <!-- Top Navigation -->
    <nav class="bg-[#1a1f36] text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#4959b4] rounded-lg flex items-center justify-center">
              <Shield class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-lg font-bold">Mouraqib Admin</h1>
              <p class="text-xs text-gray-400">Plateforme de gestion</p>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-300">admin@mouraqib.com</span>
            <button @click="logout" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sub Navigation Tabs -->
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === tab.id
                ? 'border-[#4959b4] text-[#4959b4]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Dashboard Tab -->
      <template v-if="activeTab === 'dashboard'">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Total Organisations</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ adminUsers.length }}</p>
              </div>
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Building2 class="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p class="text-xs text-green-600 mt-2">+2 ce mois</p>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Organisations Actives</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ adminStats.activeUsers }}</p>
              </div>
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle class="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ ((adminStats.activeUsers / adminUsers.length) * 100).toFixed(0) }}% du total</p>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Revenus ce mois</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalCredits.toFixed(2) }} <span class="text-lg">TND</span></p>
              </div>
              <div class="p-3 bg-[#4959b4]/10 rounded-xl">
                <TrendingUp class="w-6 h-6 text-[#4959b4]" />
              </div>
            </div>
            <p class="text-xs text-green-600 mt-2">+12% vs mois dernier</p>
          </div>

          <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">Soldes Négatifs</p>
                <p class="text-3xl font-bold text-red-600">{{ adminStats.negativeBalances }}</p>
              </div>
              <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertTriangle class="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p class="text-xs text-red-600 mt-2">Nécessite attention</p>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Transactions -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Dernières Transactions</h3>
              <button @click="activeTab = 'transactions'" class="text-sm text-[#4959b4] hover:underline">Voir tout</button>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div v-for="tx in adminTransactions.slice(0, 5)" :key="tx.id" class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div :class="[
                    'p-2 rounded-lg',
                    tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  ]">
                    <component :is="tx.type === 'credit' ? Plus : Minus" :class="[
                      'w-4 h-4',
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    ]" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">{{ tx.company }}</p>
                    <p class="text-xs text-gray-500">{{ tx.date }}</p>
                  </div>
                </div>
                <span :class="[
                  'font-semibold',
                  tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ tx.type === 'credit' ? '+' : '-' }}{{ tx.amount.toFixed(2) }} TND
                </span>
              </div>
            </div>
          </div>

          <!-- Accounts Needing Attention -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Comptes à surveiller</h3>
              <button @click="activeTab = 'users'" class="text-sm text-[#4959b4] hover:underline">Voir tout</button>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div v-for="user in accountsNeedingAttention" :key="user.id" class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm">
                    {{ user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">{{ user.company }}</p>
                    <p class="text-xs text-gray-500">{{ user.unbilledDelivered + user.unbilledReturned }} colis non facturés</p>
                  </div>
                </div>
                <div class="text-right">
                  <p :class="[
                    'font-semibold text-sm',
                    user.balance < 0 ? 'text-red-600' : 'text-gray-500'
                  ]">
                    {{ user.balance.toFixed(2) }} TND
                  </p>
                  <span v-if="user.status === 'suspended'" class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Suspendu</span>
                </div>
              </div>
              <div v-if="accountsNeedingAttention.length === 0" class="p-8 text-center text-gray-500">
                Tous les comptes sont en règle
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Users Tab -->
      <template v-if="activeTab === 'users'">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Liste des Organisations</h2>
            <p class="text-gray-500">Gérez vos clients et leurs comptes</p>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="userSearch"
              type="text"
              placeholder="Rechercher par nom, email ou entreprise..."
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
          <select v-model="userFilter" class="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>

        <!-- Users Table -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisation</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Colis</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Non Facturés</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Solde</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-[#4959b4] flex items-center justify-center text-white font-medium text-sm">
                        {{ user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ user.company }}</p>
                        <p class="text-sm text-gray-500">{{ user.name }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 hidden lg:table-cell">
                    <p class="text-sm text-gray-900 dark:text-white">{{ user.email }}</p>
                    <p class="text-xs text-gray-500">{{ user.phone }}</p>
                  </td>
                  <td class="px-6 py-4 text-center hidden md:table-cell">
                    <span class="text-gray-900 dark:text-white font-medium">{{ user.shipmentsCount }}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                        {{ user.unbilledDelivered }} L
                      </span>
                      <span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium">
                        {{ user.unbilledReturned }} R
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span :class="[
                      'font-semibold',
                      user.balance > 0 ? 'text-green-600' : user.balance < 0 ? 'text-red-600' : 'text-gray-500'
                    ]">
                      {{ user.balance >= 0 ? '+' : '' }}{{ user.balance.toFixed(2) }} TND
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span :class="[
                      'px-3 py-1 text-xs rounded-full font-medium',
                      user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      user.status === 'suspended' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    ]">
                      {{ user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="openChargeModal(user)" class="px-3 py-1.5 bg-[#4959b4] hover:bg-[#3a4791] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors">
                        <Wallet class="w-3.5 h-3.5" />
                        Gérer
                      </button>
                      <button class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <MoreVertical class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredUsers.length === 0" class="p-12 text-center">
            <Building2 class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">Aucune organisation trouvée</p>
          </div>
        </div>
      </template>

      <!-- Transactions Tab -->
      <template v-if="activeTab === 'transactions'">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Historique des Transactions</h2>
            <p class="text-gray-500">Toutes les opérations de facturation et paiements</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">{{ totalCredits.toFixed(2) }} TND</p>
                <p class="text-sm text-gray-500">Total Crédits</p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-red-600">{{ totalDebits.toFixed(2) }} TND</p>
                <p class="text-sm text-gray-500">Total Débits</p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-[#4959b4]/10 rounded-lg">
                <Receipt class="w-5 h-5 text-[#4959b4]" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminTransactions.length }}</p>
                <p class="text-sm text-gray-500">Total Transactions</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisation</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Note</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="tx in adminTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td class="px-6 py-4">
                    <span class="font-mono text-sm text-gray-600 dark:text-gray-400">{{ tx.id }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <p class="font-medium text-gray-900 dark:text-white">{{ tx.company }}</p>
                    <p class="text-xs text-gray-500">{{ tx.userName }}</p>
                  </td>
                  <td class="px-6 py-4 hidden md:table-cell">
                    <p class="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{{ tx.note }}</p>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span :class="[
                      'px-3 py-1 text-xs rounded-full font-medium',
                      tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    ]">
                      {{ tx.type === 'credit' ? 'Crédit' : 'Débit' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span :class="[
                      'font-semibold',
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    ]">
                      {{ tx.type === 'credit' ? '+' : '-' }}{{ tx.amount.toFixed(2) }} TND
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right hidden sm:table-cell">
                    <span class="text-sm text-gray-500">{{ tx.date }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="adminTransactions.length === 0" class="p-12 text-center">
            <Receipt class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">Aucune transaction</p>
          </div>
        </div>
      </template>

      <!-- Settings Tab -->
      <template v-if="activeTab === 'settings'">
        <div class="max-w-2xl">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Paramètres de Facturation</h2>

          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tarifs par défaut</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frais par colis livré (TND)
                </label>
                <input
                  v-model.number="deliveryFees.delivered"
                  type="number"
                  step="0.5"
                  min="0"
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frais par colis retourné (TND)
                </label>
                <input
                  v-model.number="deliveryFees.returned"
                  type="number"
                  step="0.5"
                  min="0"
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
              </div>

              <button class="w-full mt-4 px-4 py-2.5 bg-[#4959b4] hover:bg-[#3a4791] text-white font-medium rounded-lg transition-colors">
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Charge/Credit Modal -->
    <Teleport to="body">
      <div v-if="showChargeModal && selectedUser" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="closeChargeModal"></div>
        <div class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Gestion du compte</h2>
              <p class="text-sm text-gray-500">{{ selectedUser.company }}</p>
            </div>
            <button @click="closeChargeModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Mode Toggle -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-800">
            <div class="flex gap-2">
              <button
                @click="chargeMode = 'credit'"
                :class="[
                  'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  chargeMode === 'credit'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                ]"
              >
                <Plus class="w-4 h-4" />
                Créditer
              </button>
              <button
                @click="chargeMode = 'debit'"
                :class="[
                  'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  chargeMode === 'debit'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-500'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent'
                ]"
              >
                <Minus class="w-4 h-4" />
                Facturer
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto flex-1">
            <!-- Current Balance -->
            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Solde actuel</p>
                  <p :class="[
                    'text-2xl font-bold',
                    selectedUser.balance > 0 ? 'text-green-600' : selectedUser.balance < 0 ? 'text-red-600' : 'text-gray-500'
                  ]">
                    {{ selectedUser.balance >= 0 ? '+' : '' }}{{ selectedUser.balance.toFixed(2) }} TND
                  </p>
                </div>
                <div class="p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <Wallet class="w-6 h-6 text-[#4959b4]" />
                </div>
              </div>
            </div>

            <!-- Credit Mode -->
            <template v-if="chargeMode === 'credit'">
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quantité à acheter</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div class="flex items-center gap-2 mb-3">
                      <Package class="w-5 h-5 text-green-600" />
                      <span class="text-sm font-medium text-green-700 dark:text-green-400">Colis Livrés</span>
                    </div>
                    <input
                      v-model.number="purchaseDelivered"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg text-lg font-semibold text-center"
                    />
                    <p class="text-xs text-green-600 mt-2 text-center">{{ deliveryFees.delivered.toFixed(2) }} TND / colis</p>
                  </div>
                  <div class="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div class="flex items-center gap-2 mb-3">
                      <RotateCcw class="w-5 h-5 text-orange-600" />
                      <span class="text-sm font-medium text-orange-700 dark:text-orange-400">Colis Retour</span>
                    </div>
                    <input
                      v-model.number="purchaseReturned"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 rounded-lg text-lg font-semibold text-center"
                    />
                    <p class="text-xs text-orange-600 mt-2 text-center">{{ deliveryFees.returned.toFixed(2) }} TND / colis</p>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode de paiement</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="method in paymentMethods"
                    :key="method.id"
                    @click="paymentMethod = method.id"
                    :class="[
                      'py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                      paymentMethod === method.id
                        ? 'bg-[#4959b4] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    ]"
                  >
                    {{ method.label }}
                  </button>
                </div>
              </div>

              <!-- Total -->
              <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-green-800 dark:text-green-300">Total à payer</span>
                  <span class="text-xl font-bold text-green-600">{{ creditTotal.toFixed(2) }} TND</span>
                </div>
              </div>
            </template>

            <!-- Debit Mode -->
            <template v-else>
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Colis non facturés</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                    <p class="text-3xl font-bold text-green-600">{{ selectedUser.unbilledDelivered }}</p>
                    <p class="text-sm text-green-700 dark:text-green-400">Livrés</p>
                    <p class="text-xs text-green-600 mt-1">{{ deliveryFees.delivered.toFixed(2) }} TND / colis</p>
                  </div>
                  <div class="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-center">
                    <p class="text-3xl font-bold text-orange-600">{{ selectedUser.unbilledReturned }}</p>
                    <p class="text-sm text-orange-700 dark:text-orange-400">Retours</p>
                    <p class="text-xs text-orange-600 mt-1">{{ deliveryFees.returned.toFixed(2) }} TND / colis</p>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-red-800 dark:text-red-300">Total à facturer</span>
                  <span class="text-xl font-bold text-red-600">{{ debitTotal.toFixed(2) }} TND</span>
                </div>
              </div>
            </template>

            <!-- Note -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note (optionnel)</label>
              <textarea
                v-model="chargeNote"
                rows="2"
                placeholder="Ajouter une note..."
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
            <button @click="closeChargeModal" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              Annuler
            </button>
            <button
              v-if="chargeMode === 'credit'"
              @click="processCredit"
              :disabled="creditTotal <= 0"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors',
                creditTotal <= 0 && 'opacity-50 cursor-not-allowed'
              ]"
            >
              <Plus class="w-4 h-4" />
              Créditer {{ creditTotal.toFixed(2) }} TND
            </button>
            <button
              v-else
              @click="processDebit"
              :disabled="debitTotal <= 0"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white transition-colors',
                debitTotal <= 0 && 'opacity-50 cursor-not-allowed'
              ]"
            >
              <Minus class="w-4 h-4" />
              Facturer {{ debitTotal.toFixed(2) }} TND
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import {
  Shield,
  Building2,
  Users,
  Receipt,
  Settings,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Search,
  Wallet,
  MoreVertical,
  Plus,
  Minus,
  X,
  Package,
  RotateCcw,
  BarChart3
} from 'lucide-vue-next'

const router = useRouter()

// Tabs
const tabs = [
  { id: 'dashboard', label: 'Tableau de bord', icon: markRaw(BarChart3) },
  { id: 'users', label: 'Organisations', icon: markRaw(Building2) },
  { id: 'transactions', label: 'Transactions', icon: markRaw(Receipt) },
  { id: 'settings', label: 'Paramètres', icon: markRaw(Settings) },
]
const activeTab = ref('dashboard')

// Delivery fees
const deliveryFees = ref({
  delivered: 3.00,
  returned: 2.00
})

// Mock data - Organizations
const adminUsers = ref([
  {
    id: 'ORG-001',
    name: 'Mohamed Ben Ali',
    email: 'mohamed@fashionstore.tn',
    phone: '+216 98 123 456',
    company: 'Fashion Store SARL',
    status: 'active',
    balance: 245.500,
    shipmentsCount: 1250,
    unbilledDelivered: 45,
    unbilledReturned: 8,
    createdAt: '2024-01-15'
  },
  {
    id: 'ORG-002',
    name: 'Fatma Trabelsi',
    email: 'fatma@beautyshop.tn',
    phone: '+216 55 789 012',
    company: 'Beauty Shop',
    status: 'active',
    balance: -32.000,
    shipmentsCount: 456,
    unbilledDelivered: 12,
    unbilledReturned: 3,
    createdAt: '2024-02-20'
  },
  {
    id: 'ORG-003',
    name: 'Ahmed Mejri',
    email: 'ahmed@techzone.tn',
    phone: '+216 22 456 789',
    company: 'Tech Zone',
    status: 'active',
    balance: 890.000,
    shipmentsCount: 2340,
    unbilledDelivered: 78,
    unbilledReturned: 15,
    createdAt: '2023-11-05'
  },
  {
    id: 'ORG-004',
    name: 'Sarra Hamdi',
    email: 'sarra@homestyle.tn',
    phone: '+216 97 321 654',
    company: 'Home Style Déco',
    status: 'suspended',
    balance: -156.500,
    shipmentsCount: 189,
    unbilledDelivered: 0,
    unbilledReturned: 0,
    createdAt: '2024-03-10'
  },
  {
    id: 'ORG-005',
    name: 'Youssef Bouazizi',
    email: 'youssef@sportplus.tn',
    phone: '+216 50 987 654',
    company: 'Sport Plus',
    status: 'active',
    balance: 0,
    shipmentsCount: 567,
    unbilledDelivered: 23,
    unbilledReturned: 5,
    createdAt: '2024-01-28'
  },
  {
    id: 'ORG-006',
    name: 'Amira Chebbi',
    email: 'amira@kidswear.tn',
    phone: '+216 29 147 258',
    company: 'Kids Wear Tunisia',
    status: 'active',
    balance: 67.500,
    shipmentsCount: 890,
    unbilledDelivered: 34,
    unbilledReturned: 6,
    createdAt: '2024-02-05'
  },
  {
    id: 'ORG-007',
    name: 'Karim Jebali',
    email: 'karim@electroplus.tn',
    phone: '+216 92 369 147',
    company: 'Electro Plus',
    status: 'inactive',
    balance: 0,
    shipmentsCount: 45,
    unbilledDelivered: 0,
    unbilledReturned: 0,
    createdAt: '2024-04-01'
  }
])

// Mock data - Transactions
const adminTransactions = ref([
  {
    id: 'TRX-001',
    userId: 'ORG-001',
    userName: 'Mohamed Ben Ali',
    company: 'Fashion Store SARL',
    type: 'credit',
    amount: 300.000,
    note: 'Achat: 100 livrés (Virement)',
    date: '04 Fév 2026, 10:30'
  },
  {
    id: 'TRX-002',
    userId: 'ORG-001',
    userName: 'Mohamed Ben Ali',
    company: 'Fashion Store SARL',
    type: 'debit',
    amount: 54.500,
    note: 'Facturation: 15 livrés + 5 retours',
    date: '03 Fév 2026, 15:45'
  },
  {
    id: 'TRX-003',
    userId: 'ORG-003',
    userName: 'Ahmed Mejri',
    company: 'Tech Zone',
    type: 'credit',
    amount: 500.000,
    note: 'Achat: 150 livrés + 25 retour (Espèces)',
    date: '02 Fév 2026, 09:15'
  },
  {
    id: 'TRX-004',
    userId: 'ORG-002',
    userName: 'Fatma Trabelsi',
    company: 'Beauty Shop',
    type: 'debit',
    amount: 42.000,
    note: 'Facturation: 12 livrés + 3 retours',
    date: '01 Fév 2026, 14:20'
  },
  {
    id: 'TRX-005',
    userId: 'ORG-006',
    userName: 'Amira Chebbi',
    company: 'Kids Wear Tunisia',
    type: 'credit',
    amount: 150.000,
    note: 'Achat: 50 livrés (Chèque)',
    date: '31 Jan 2026, 11:00'
  }
])

// Filters
const userSearch = ref('')
const userFilter = ref('all')

// Computed
const adminStats = computed(() => ({
  activeUsers: adminUsers.value.filter(u => u.status === 'active').length,
  negativeBalances: adminUsers.value.filter(u => u.balance < 0).length,
}))

const totalCredits = computed(() =>
  adminTransactions.value.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
)

const totalDebits = computed(() =>
  adminTransactions.value.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
)

const filteredUsers = computed(() => {
  let result = adminUsers.value

  if (userSearch.value) {
    const query = userSearch.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.company.toLowerCase().includes(query)
    )
  }

  if (userFilter.value !== 'all') {
    result = result.filter(u => u.status === userFilter.value)
  }

  return result
})

const accountsNeedingAttention = computed(() =>
  adminUsers.value.filter(u => u.balance < 0 || u.status === 'suspended' || (u.unbilledDelivered + u.unbilledReturned) > 50)
)

// Charge Modal
const showChargeModal = ref(false)
const selectedUser = ref<any>(null)
const chargeMode = ref<'credit' | 'debit'>('credit')
const chargeNote = ref('')
const purchaseDelivered = ref<number>(0)
const purchaseReturned = ref<number>(0)
const paymentMethod = ref('cash')

const paymentMethods = [
  { id: 'cash', label: 'Espèces' },
  { id: 'transfer', label: 'Virement' },
  { id: 'cheque', label: 'Chèque' }
]

const creditTotal = computed(() =>
  (purchaseDelivered.value || 0) * deliveryFees.value.delivered +
  (purchaseReturned.value || 0) * deliveryFees.value.returned
)

const debitTotal = computed(() => {
  if (!selectedUser.value) return 0
  return selectedUser.value.unbilledDelivered * deliveryFees.value.delivered +
         selectedUser.value.unbilledReturned * deliveryFees.value.returned
})

function openChargeModal(user: any) {
  selectedUser.value = user
  chargeMode.value = 'credit'
  chargeNote.value = ''
  purchaseDelivered.value = 0
  purchaseReturned.value = 0
  paymentMethod.value = 'cash'
  showChargeModal.value = true
}

function closeChargeModal() {
  showChargeModal.value = false
  selectedUser.value = null
}

function processCredit() {
  if (!selectedUser.value || creditTotal.value <= 0) return

  const user = adminUsers.value.find(u => u.id === selectedUser.value.id)
  if (user) {
    // Add transaction
    adminTransactions.value.unshift({
      id: `TRX-${String(adminTransactions.value.length + 1).padStart(3, '0')}`,
      userId: user.id,
      userName: user.name,
      company: user.company,
      type: 'credit',
      amount: creditTotal.value,
      note: chargeNote.value || `Achat: ${purchaseDelivered.value} livrés + ${purchaseReturned.value} retour (${paymentMethods.find(m => m.id === paymentMethod.value)?.label})`,
      date: new Date().toLocaleString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    })
  }

  closeChargeModal()
}

function processDebit() {
  if (!selectedUser.value || debitTotal.value <= 0) return

  const user = adminUsers.value.find(u => u.id === selectedUser.value.id)
  if (user) {
    const deliveredCount = user.unbilledDelivered
    const returnedCount = user.unbilledReturned

    // Debit the account
    user.balance -= debitTotal.value
    user.unbilledDelivered = 0
    user.unbilledReturned = 0

    // Add transaction
    adminTransactions.value.unshift({
      id: `TRX-${String(adminTransactions.value.length + 1).padStart(3, '0')}`,
      userId: user.id,
      userName: user.name,
      company: user.company,
      type: 'debit',
      amount: debitTotal.value,
      note: chargeNote.value || `Facturation: ${deliveredCount} livrés + ${returnedCount} retours`,
      date: new Date().toLocaleString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    })
  }

  closeChargeModal()
}

function logout() {
  router.push('/signin')
}
</script>

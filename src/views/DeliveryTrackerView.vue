<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-950">
    <!-- Sidebar 1 - Main Sections -->
    <aside class="w-56 text-white flex flex-col" style="background-color: #222628;">
      <!-- Logo -->
      <div class="p-4">
        <img src="@/logo/Group 14.svg" alt="Logo" class="h-8 w-auto" />
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 py-2 overflow-y-auto">
        <ul class="space-y-1 px-3">
          <li v-for="item in mainNavigation" :key="item.id">
            <button
              @click="selectMainSection(item.id)"
              :class="[
                'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                mainSection === item.id
                  ? 'text-orange-500'
                  : 'text-gray-300 hover:text-white'
              ]"
              :style="mainSection === item.id ? { backgroundColor: '#111314' } : {}"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Usage Balance -->
      <div class="px-3 pb-2">
        <div class="bg-gray-800/50 rounded-xl p-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400">Mon solde</span>
            <button @click="showRechargeModal = true" class="text-xs text-orange-500 hover:text-orange-400 font-medium">Recharger</button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-900/50 rounded-lg p-2">
              <div class="flex items-center gap-1.5 mb-1">
                <Package class="w-3.5 h-3.5 text-orange-500" />
                <span class="text-xs text-gray-400">Livré</span>
              </div>
              <p class="text-lg font-bold text-white">{{ userBalance.delivered }}</p>
              <div class="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-orange-500 rounded-full" :style="{ width: Math.min((userBalance.delivered / 1000) * 100, 100) + '%' }"></div>
              </div>
            </div>
            <div class="bg-gray-900/50 rounded-lg p-2">
              <div class="flex items-center gap-1.5 mb-1">
                <RefreshCw class="w-3.5 h-3.5 text-gray-400" />
                <span class="text-xs text-gray-400">Retour</span>
              </div>
              <p class="text-lg font-bold text-white">{{ userBalance.returned }}</p>
              <div class="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-gray-500 rounded-full" :style="{ width: Math.min((userBalance.returned / 500) * 100, 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User/Organization Section -->
      <div class="border-t border-gray-800 p-3">
        <div class="flex items-center space-x-3 px-3 py-2">
          <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold text-white">{{ authStore.user?.name?.charAt(0) || organization.name.charAt(0) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ authStore.user?.name || organization.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ authStore.user?.email || organization.email }}</p>
          </div>
          <button
            @click="handleLogout"
            class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Déconnexion"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Sidebar 2 - Sub-sections (dynamic based on mainSection) -->
    <aside class="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <!-- Section Title -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ getMainSectionLabel(mainSection) }}</h2>
      </div>

      <!-- Sub Navigation -->
      <nav class="flex-1 py-3 overflow-y-auto">
        <ul class="space-y-0.5">
          <li v-for="item in currentSubNavigation" :key="item.id">
            <button
              @click="activeSection = item.id"
              :class="[
                'w-full flex items-center space-x-3 py-2.5 pl-4 pr-4 text-sm font-medium transition-colors border-l-4',
                activeSection === item.id
                  ? 'bg-gray-100 text-orange-500 border-orange-500 rounded-r-lg dark:bg-gray-800 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span>{{ item.label }}</span>
              <span v-if="item.badge" class="ml-auto px-2 py-0.5 text-xs rounded-full" :class="item.badgeClass">{{ item.badge }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Quick Stats (contextual) -->
      <div v-if="mainSection === 'dashboard'" class="border-t border-gray-200 dark:border-gray-800 p-4">
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ shipments.length }}</p>
            <p class="text-xs text-gray-500">Colis</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-green-600">{{ deliveredCount }}</p>
            <p class="text-xs text-gray-500">Livrés</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Shipments Section -->
      <template v-if="activeSection === 'all-shipments' || activeSection === 'shipment-status' || activeSection === 'search-filters' || activeSection === 'shipment-history'">
        <!-- Header -->
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Colis</h1>
              <p class="text-sm text-gray-500 mt-1">Gérez tous vos colis et expéditions</p>
            </div>
            <div class="flex items-center space-x-3">
              <button class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Download class="w-4 h-4" />
                <span>Import CSV</span>
              </button>
              <button class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Upload class="w-4 h-4" />
                <span>Import application</span>
              </button>
              <button class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Upload class="w-4 h-4" />
                <span>Exporter</span>
              </button>
              <button class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <span>Plus d'actions</span>
                <ChevronDown class="w-4 h-4" />
              </button>
              <button
                @click="showAddShipmentModal = true"
                class="btn-primary"
              >
                <Plus class="w-4 h-4" />
                <span>Ajouter un colis</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-6">
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <!-- Status Tabs -->
            <div class="border-b border-gray-200 dark:border-gray-800 px-4">
              <div class="flex items-center space-x-1 overflow-x-auto">
                <button
                  v-for="tab in statusTabs"
                  :key="tab.id"
                  @click="activeStatusTab = tab.id"
                  :class="[
                    'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                    activeStatusTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  ]"
                >
                  {{ tab.label }}
                  <span v-if="tab.count !== undefined" class="ml-1 text-gray-400">({{ tab.count }})</span>
                </button>
                <button class="px-3 py-3 text-gray-400 hover:text-gray-600">
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Search & Filters -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="flex-1 relative">
                  <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Rechercher des colis"
                    class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <button class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Recherche groupée
                </button>
                <button class="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <SlidersHorizontal class="w-4 h-4" />
                  <span>Ajouter des filtres</span>
                </button>
                <button class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ArrowUpDown class="w-4 h-4" />
                </button>
                <button class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <LayoutGrid class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Bulk Select -->
            <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-3">
              <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Affichage de {{ filteredShipments.length }} colis</span>
            </div>

            <!-- Table -->
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="w-10 px-4 py-3"></th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Numéro de suivi</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transporteur</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider underline decoration-dotted cursor-help">Dernier événement</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Origine</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="shipment in filteredShipments" :key="shipment.id" @click="selectedShipment = shipment" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <td class="px-4 py-3" @click.stop>
                    <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Exemple</span>
                      <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.carrier }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.service || '-' }}</td>
                  <td class="px-4 py-3">
                    <span :class="['inline-flex items-center space-x-1 text-sm font-medium', getStatusTextClass(shipment.status)]">
                      <span :class="['w-2 h-2 rounded-full', getStatusDotClass(shipment.status)]"></span>
                      <span>{{ getStatusLabel(shipment.status) }}</span>
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ shipment.latestEvent }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">{{ shipment.originFlag }}</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ shipment.origin }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Affichage de {{ filteredShipments.length }} sur {{ shipments.length }} résultats</span>
              <div class="flex items-center space-x-1">
                <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-50" disabled>
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <span class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm">1</span>
                <span class="text-sm text-gray-500">/ 1</span>
                <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-50" disabled>
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== CLIENTS SECTION: ALL CLIENTS ==================== -->
      <template v-if="activeSection === 'all-clients'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Tous les Clients</h1>
              <p class="text-sm text-gray-500 mt-1">Gérez votre base de clients</p>
            </div>
            <button @click="showAddClientModal = true" class="btn-primary">
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
                    placeholder="Rechercher par nom, téléphone, adresse..."
                    class="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>
                <select v-model="clientFilterStatus" class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                  <option value="vip">VIP</option>
                  <option value="blocked">Bloqués</option>
                </select>
              </div>
            </div>

            <!-- Clients Table -->
            <div class="overflow-x-auto">
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
                    <td class="px-4 py-4">
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
                    <td class="px-4 py-4">
                      <p class="text-sm text-gray-900 dark:text-white">{{ client.phone }}</p>
                    </td>
                    <td class="px-4 py-4">
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ client.address }}</p>
                      <p class="text-xs text-gray-500">{{ client.region }}</p>
                    </td>
                    <td class="px-4 py-4">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.totalOrders }}</p>
                    </td>
                    <td class="px-4 py-4">
                      <span class="text-sm font-medium" :class="client.deliveryRate >= 80 ? 'text-green-600' : client.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">
                        {{ client.deliveryRate }}%
                      </span>
                    </td>
                    <td class="px-4 py-4">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.totalSpent.toLocaleString() }} TND</p>
                    </td>
                    <td class="px-4 py-4">
                      <span :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        client.status === 'active' ? 'bg-green-100 text-green-700' :
                        client.status === 'vip' ? 'bg-purple-100 text-purple-700' :
                        client.status === 'blocked' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      ]">
                        {{ client.status === 'active' ? 'Actif' : client.status === 'vip' ? 'VIP' : client.status === 'blocked' ? 'Bloqué' : 'Inactif' }}
                      </span>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center space-x-2">
                        <button @click="viewClientDetails(client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                          <Eye class="w-4 h-4" />
                        </button>
                        <button @click="editClientData(client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                          <Settings class="w-4 h-4" />
                        </button>
                        <button @click="toggleClientVIP(client)" class="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg" :title="client.status === 'vip' ? 'Retirer VIP' : 'Marquer VIP'">
                          <Star class="w-4 h-4" :class="client.status === 'vip' ? 'fill-purple-600 text-purple-600' : ''" />
                        </button>
                        <button @click="toggleClientBlocked(client)" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg" :title="client.status === 'blocked' ? 'Débloquer' : 'Bloquer'">
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
      </template>

      <!-- ==================== CLIENTS SECTION: ADD CLIENT ==================== -->
      <template v-if="activeSection === 'add-client'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Ajouter un Client</h1>
              <p class="text-sm text-gray-500 mt-1">Créer un nouveau profil client</p>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-2xl mx-auto">
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <form @submit.prevent="submitNewClient" class="space-y-6">
                <!-- Informations Personnelles -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User class="w-5 h-5 mr-2 text-primary-blue" />
                    Informations Personnelles
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet *</label>
                      <input v-model="newClientForm.name" type="text" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: Ahmed Ben Ali" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone *</label>
                      <input v-model="newClientForm.phone" type="tel" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: 98 123 456" />
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input v-model="newClientForm.email" type="email" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: client@email.com" />
                    </div>
                  </div>
                </div>

                <!-- Adresse -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MapPin class="w-5 h-5 mr-2 text-primary-blue" />
                    Adresse de Livraison
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse complète *</label>
                      <input v-model="newClientForm.address" type="text" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: 15 Rue de la Liberté" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gouvernorat *</label>
                      <select v-model="newClientForm.region" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent">
                        <option value="">Sélectionner</option>
                        <option v-for="gov in tunisianGovernorates" :key="gov" :value="gov">{{ gov }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code Postal</label>
                      <input v-model="newClientForm.postalCode" type="text" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: 1002" />
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText class="w-5 h-5 mr-2 text-primary-blue" />
                    Notes Additionnelles
                  </h3>
                  <textarea v-model="newClientForm.notes" rows="3" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Notes sur le client (préférences de livraison, etc.)"></textarea>
                </div>

                <!-- Statut -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statut Initial</h3>
                  <div class="flex flex-wrap gap-3">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" v-model="newClientForm.status" value="active" class="w-4 h-4" />
                      <span class="text-sm text-gray-700 dark:text-gray-300">Actif</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" v-model="newClientForm.status" value="vip" class="w-4 h-4" />
                      <span class="text-sm text-gray-700 dark:text-gray-300">VIP</span>
                    </label>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button type="button" @click="resetNewClientForm" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                    Réinitialiser
                  </button>
                  <button type="submit" class="btn-primary">
                    <Plus class="w-4 h-4" />
                    <span>Créer le Client</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== CLIENTS SECTION: VIP CLIENTS ==================== -->
      <template v-if="activeSection === 'vip-clients'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Star class="w-6 h-6 mr-2 text-purple-600 fill-purple-600" />
                Clients VIP
              </h1>
              <p class="text-sm text-gray-500 mt-1">Vos meilleurs clients avec privilèges spéciaux</p>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- VIP Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm opacity-90">Clients VIP</p>
                  <p class="text-3xl font-bold">{{ vipClients.length }}</p>
                </div>
                <Star class="w-10 h-10 opacity-80" />
              </div>
              <p class="text-sm opacity-80 mt-2">{{ ((vipClients.length / clientsList.length) * 100).toFixed(1) }}% de la base</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">CA VIP Total</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ vipTotalRevenue.toLocaleString() }} TND</p>
                </div>
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Banknote class="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">{{ ((vipTotalRevenue / clientStats.totalRevenue) * 100).toFixed(1) }}% du CA total</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Taux Livraison VIP</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ vipAverageDeliveryRate }}%</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <TrendingUp class="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p class="text-xs text-green-600 mt-2">+{{ (vipAverageDeliveryRate - clientStats.deliveryRate).toFixed(1) }}% vs moyenne</p>
            </div>
          </div>

          <!-- VIP Clients List -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Liste des Clients VIP</h3>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-800">
              <div v-for="client in vipClients" :key="client.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span class="text-lg font-bold text-purple-600">{{ client.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white flex items-center">
                        {{ client.name }}
                        <Star class="w-4 h-4 ml-2 text-purple-600 fill-purple-600" />
                      </p>
                      <p class="text-sm text-gray-500">{{ client.phone }} • {{ client.region }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-900 dark:text-white">{{ client.totalSpent.toLocaleString() }} TND</p>
                    <p class="text-sm text-gray-500">{{ client.totalOrders }} commandes • {{ client.deliveryRate }}% livraison</p>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <button @click="viewClientDetails(client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button @click="removeFromVIP(client)" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg" title="Retirer du statut VIP">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="vipClients.length === 0" class="p-8 text-center">
                <Star class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p class="text-gray-500">Aucun client VIP pour le moment</p>
                <p class="text-sm text-gray-400 mt-1">Les clients VIP bénéficient de privilèges spéciaux</p>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== CLIENTS SECTION: BLOCKED CLIENTS ==================== -->
      <template v-if="activeSection === 'blocked-clients'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Ban class="w-6 h-6 mr-2 text-red-600" />
                Clients Bloqués
              </h1>
              <p class="text-sm text-gray-500 mt-1">Clients avec des problèmes récurrents</p>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Blocked Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm opacity-90">Clients Bloqués</p>
                  <p class="text-3xl font-bold">{{ blockedClients.length }}</p>
                </div>
                <Ban class="w-10 h-10 opacity-80" />
              </div>
              <p class="text-sm opacity-80 mt-2">{{ ((blockedClients.length / clientsList.length) * 100).toFixed(1) }}% de la base</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Retours Évités</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ blockedReturnsSaved }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <RotateCcw class="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">Depuis le blocage</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500">Taux Moyen Avant Blocage</p>
                  <p class="text-2xl font-bold text-red-600">{{ blockedAverageDeliveryRate }}%</p>
                </div>
                <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <TrendingDown class="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">Raison principale du blocage</p>
            </div>
          </div>

          <!-- Blocked Clients List -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Liste des Clients Bloqués</h3>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-800">
              <div v-for="client in blockedClients" :key="client.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <span class="text-lg font-bold text-red-600">{{ client.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white flex items-center">
                        {{ client.name }}
                        <span class="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Bloqué</span>
                      </p>
                      <p class="text-sm text-gray-500">{{ client.phone }} • {{ client.region }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-red-600">{{ client.deliveryRate }}% livraison</p>
                    <p class="text-sm text-gray-500">{{ client.totalOrders }} commandes • {{ client.totalOrders - client.deliveredOrders }} retours</p>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <button @click="viewClientDetails(client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button @click="unblockClient(client)" class="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-100 rounded-lg flex items-center space-x-1" title="Débloquer ce client">
                      <CheckCircle class="w-4 h-4" />
                      <span>Débloquer</span>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="blockedClients.length === 0" class="p-8 text-center">
                <CheckCircle class="w-12 h-12 mx-auto text-green-300 dark:text-green-600 mb-3" />
                <p class="text-gray-500">Aucun client bloqué</p>
                <p class="text-sm text-gray-400 mt-1">Tous vos clients sont en règle</p>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== CLIENTS SECTION: STATISTICS ==================== -->
      <template v-if="activeSection === 'client-stats'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart2 class="w-6 h-6 mr-2 text-primary-blue" />
                Statistiques Clients
              </h1>
              <p class="text-sm text-gray-500 mt-1">Analyse détaillée de votre base clients</p>
            </div>
            <div class="flex items-center space-x-2">
              <select v-model="statsTimeRange" class="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">3 derniers mois</option>
                <option value="1y">Cette année</option>
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
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ clientsList.length }}</p>
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
                  <p class="text-sm text-gray-500">Taux de Rétention</p>
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
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par Statut</h3>
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
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Répartition par Région</h3>
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
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rang</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Commandes</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taux Livraison</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Dépensé</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr v-for="(client, index) in topClientsByRevenue" :key="client.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="px-4 py-4">
                      <span :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      ]">{{ index + 1 }}</span>
                    </td>
                    <td class="px-4 py-4">
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
                    <td class="px-4 py-4">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.totalOrders }}</p>
                    </td>
                    <td class="px-4 py-4">
                      <span class="text-sm font-medium" :class="client.deliveryRate >= 80 ? 'text-green-600' : client.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">
                        {{ client.deliveryRate }}%
                      </span>
                    </td>
                    <td class="px-4 py-4">
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
                  <span class="text-sm font-medium text-red-700 dark:text-red-300">Clients Bloqués</span>
                  <Ban class="w-4 h-4 text-red-600" />
                </div>
                <p class="text-2xl font-bold text-red-700 dark:text-red-300">{{ blockedAverageDeliveryRate }}%</p>
                <p class="text-xs text-red-600 dark:text-red-400 mt-1">Taux avant blocage</p>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Add Client Modal -->
      <div v-if="showAddClientModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">Ajouter un Nouveau Client</h3>
            <button @click="showAddClientModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form @submit.prevent="submitNewClientFromModal" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet *</label>
              <input v-model="newClientForm.name" type="text" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: Ahmed Ben Ali" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone *</label>
              <input v-model="newClientForm.phone" type="tel" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: 98 123 456" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input v-model="newClientForm.email" type="email" class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: client@email.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse *</label>
              <input v-model="newClientForm.address" type="text" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Ex: 15 Rue de la Liberté" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gouvernorat *</label>
              <select v-model="newClientForm.region" required class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent">
                <option value="">Sélectionner</option>
                <option v-for="gov in tunisianGovernorates" :key="gov" :value="gov">{{ gov }}</option>
              </select>
            </div>
            <div class="flex items-center justify-end space-x-3 pt-4">
              <button type="button" @click="showAddClientModal = false" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium">
                Annuler
              </button>
              <button type="submit" class="btn-primary">
                <Plus class="w-4 h-4" />
                <span>Créer</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Client Details Side Drawer -->
      <Transition name="slide-right">
        <div v-if="showClientDetailsDrawer && selectedClientDetails" class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-black/30" @click="closeClientDetails"></div>
          <div class="relative w-full max-w-sm bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-xl">
            <!-- Header -->
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" :class="selectedClientDetails.status === 'vip' ? 'bg-purple-100 text-purple-600' : selectedClientDetails.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-primary-blue/10 text-primary-blue'">
                    {{ selectedClientDetails.name.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedClientDetails.name }}</h3>
                    <span :class="[
                      'text-xs',
                      selectedClientDetails.status === 'active' ? 'text-green-600' :
                      selectedClientDetails.status === 'vip' ? 'text-purple-600' :
                      selectedClientDetails.status === 'blocked' ? 'text-red-600' : 'text-gray-500'
                    ]">{{ selectedClientDetails.status === 'active' ? 'Actif' : selectedClientDetails.status === 'vip' ? 'VIP' : selectedClientDetails.status === 'blocked' ? 'Bloqué' : 'Inactif' }}</span>
                  </div>
                </div>
                <button @click="closeClientDetails" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X class="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div class="p-4 space-y-4">
              <!-- Quick Stats -->
              <div class="grid grid-cols-4 gap-2">
                <div class="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedClientDetails.totalOrders }}</p>
                  <p class="text-[10px] text-gray-500">Colis</p>
                </div>
                <div class="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p class="text-lg font-bold text-green-600">{{ selectedClientDetails.deliveredOrders }}</p>
                  <p class="text-[10px] text-gray-500">Livrés</p>
                </div>
                <div class="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p class="text-lg font-bold text-red-600">{{ selectedClientDetails.totalOrders - selectedClientDetails.deliveredOrders }}</p>
                  <p class="text-[10px] text-gray-500">Retours</p>
                </div>
                <div class="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p class="text-lg font-bold" :class="selectedClientDetails.deliveryRate >= 80 ? 'text-green-600' : selectedClientDetails.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">{{ selectedClientDetails.deliveryRate }}%</p>
                  <p class="text-[10px] text-gray-500">Taux</p>
                </div>
              </div>

              <!-- Contact & Address -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                <div class="flex items-center text-sm">
                  <PhoneIcon class="w-3.5 h-3.5 text-gray-400 mr-2" />
                  <span class="text-gray-900 dark:text-white">{{ selectedClientDetails.phone }}</span>
                </div>
                <div v-if="selectedClientDetails.email" class="flex items-center text-sm">
                  <MessageSquare class="w-3.5 h-3.5 text-gray-400 mr-2" />
                  <span class="text-gray-900 dark:text-white">{{ selectedClientDetails.email }}</span>
                </div>
                <div class="flex items-start text-sm">
                  <MapPin class="w-3.5 h-3.5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span class="text-gray-900 dark:text-white">{{ selectedClientDetails.address }}</span>
                    <span class="text-gray-500 block text-xs">{{ selectedClientDetails.region }}</span>
                  </div>
                </div>
              </div>

              <!-- Financial -->
              <div class="flex items-center justify-between p-3 bg-primary-blue/5 rounded-lg">
                <div>
                  <p class="text-xs text-gray-500">Total dépensé</p>
                  <p class="text-base font-bold text-gray-900 dark:text-white">{{ selectedClientDetails.totalSpent.toLocaleString() }} TND</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">Panier moyen</p>
                  <p class="text-base font-semibold text-gray-700 dark:text-gray-300">{{ selectedClientDetails.totalOrders > 0 ? Math.round(selectedClientDetails.totalSpent / selectedClientDetails.totalOrders) : 0 }} TND</p>
                </div>
              </div>

              <!-- Colis List -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Historique des colis</h4>
                  <span class="text-xs text-gray-500">{{ getClientColis(selectedClientDetails.id).length }} colis</span>
                </div>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  <div v-for="colis in getClientColis(selectedClientDetails.id)" :key="colis.id" class="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div class="flex items-center space-x-2.5 min-w-0">
                      <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" :class="colis.status === 'Delivered' ? 'bg-green-100' : colis.status === 'In Transit' ? 'bg-blue-100' : colis.status === 'Returned' ? 'bg-red-100' : 'bg-yellow-100'">
                        <Package class="w-3.5 h-3.5" :class="colis.status === 'Delivered' ? 'text-green-600' : colis.status === 'In Transit' ? 'text-blue-600' : colis.status === 'Returned' ? 'text-red-600' : 'text-yellow-600'" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ colis.tracking }}</p>
                        <p class="text-[10px] text-gray-500">{{ colis.date }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 flex-shrink-0">
                      <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ colis.amount }} TND</span>
                      <span :class="[
                        'px-1.5 py-0.5 text-[10px] font-medium rounded',
                        colis.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        colis.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                        colis.status === 'Returned' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      ]">{{ colis.status === 'Delivered' ? 'Livré' : colis.status === 'In Transit' ? 'En cours' : colis.status === 'Returned' ? 'Retour' : 'En attente' }}</span>
                    </div>
                  </div>
                  <div v-if="getClientColis(selectedClientDetails.id).length === 0" class="text-center py-6 text-gray-400">
                    <Package class="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p class="text-xs">Aucun colis trouvé</p>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  @click="toggleClientVIP(selectedClientDetails)"
                  class="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                  :class="selectedClientDetails.status === 'vip' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'"
                >
                  <Star class="w-3.5 h-3.5" :class="selectedClientDetails.status === 'vip' ? '' : ''" />
                  <span>{{ selectedClientDetails.status === 'vip' ? 'Retirer VIP' : 'VIP' }}</span>
                </button>
                <button
                  @click="selectedClientDetails.status === 'blocked' ? unblockClient(selectedClientDetails) : toggleClientBlocked(selectedClientDetails)"
                  class="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                  :class="selectedClientDetails.status === 'blocked' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'"
                >
                  <component :is="selectedClientDetails.status === 'blocked' ? CheckCircle : Ban" class="w-3.5 h-3.5" />
                  <span>{{ selectedClientDetails.status === 'blocked' ? 'Débloquer' : 'Bloquer' }}</span>
                </button>
                <button
                  @click="editClientData(selectedClientDetails)"
                  class="p-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors"
                >
                  <Settings class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ==================== DASHBOARD: VUE D'ENSEMBLE ==================== -->
      <template v-if="activeSection === 'overview'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Vue d'ensemble</h1>
              <p class="text-sm text-gray-500 mt-1">{{ new Date().toLocaleDateString('fr-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
            </div>
            <div class="flex items-center space-x-3">
              <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
                <Bell class="w-5 h-5 text-gray-500" />
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Performance Score & Weather -->
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <!-- Performance Score -->
            <div class="lg:col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium opacity-90">Score du jour</span>
                <Target class="w-5 h-5 opacity-80" />
              </div>
              <div class="flex items-end space-x-2">
                <span class="text-4xl font-bold">{{ dashboardStats.performanceScore }}</span>
                <span class="text-lg opacity-80">/100</span>
              </div>
              <div class="mt-3 flex items-center space-x-2 text-sm">
                <TrendingUp class="w-4 h-4" />
                <span>+5 vs hier</span>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500">Livraisons aujourd'hui</span>
                <Package class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats.todayDeliveries }}</p>
              <p class="text-xs text-green-600 mt-1">{{ dashboardStats.todayDelivered }} livrés</p>
            </div>

            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500">Taux de succès</span>
                <CheckCircle class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-2xl font-bold text-green-600">{{ dashboardStats.successRate }}%</p>
              <p class="text-xs text-gray-500 mt-1">vs {{ dashboardStats.lastWeekSuccessRate }}% semaine dernière</p>
            </div>

            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500">COD attendu</span>
                <Banknote class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ dashboardStats.expectedCOD }} <span class="text-sm font-normal">TND</span></p>
              <p class="text-xs text-blue-600 mt-1">{{ dashboardStats.pendingConfirmations }} à confirmer</p>
            </div>
          </div>

          <!-- Urgent Actions -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <AlertTriangle class="w-5 h-5 text-orange-500" />
                <h3 class="font-semibold text-gray-900 dark:text-white">Actions urgentes</h3>
                <span class="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">{{ urgentActions.length }}</span>
              </div>
              <button class="text-sm text-orange-500 hover:text-orange-600 font-medium">Tout traiter</button>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="action in urgentActions" :key="action.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex items-center space-x-3">
                  <div :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    action.type === 'confirm' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    action.type === 'delayed' ? 'bg-red-100 dark:bg-red-900/30' :
                    action.type === 'return' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-gray-100 dark:bg-gray-800'
                  ]">
                    <component :is="action.icon" :class="[
                      'w-5 h-5',
                      action.type === 'confirm' ? 'text-blue-600' :
                      action.type === 'delayed' ? 'text-red-600' :
                      action.type === 'return' ? 'text-yellow-600' :
                      'text-gray-500'
                    ]" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ action.title }}</p>
                    <p class="text-xs text-gray-500">{{ action.description }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-400">{{ action.time }}</span>
                  <button class="btn-primary btn-primary-sm">
                    {{ action.actionLabel }}
                  </button>
                </div>
              </div>
              <div v-if="urgentActions.length === 0" class="px-5 py-8 text-center">
                <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p class="text-gray-500">Aucune action urgente. Tout est sous contrôle !</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Today vs Yesterday Comparison -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Aujourd'hui vs Hier</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-gray-600 dark:text-gray-400">Commandes</span>
                    <div class="flex items-center space-x-2">
                      <span class="font-semibold text-gray-900 dark:text-white">{{ dashboardStats.todayOrders }}</span>
                      <span :class="dashboardStats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs">
                        {{ dashboardStats.ordersChange >= 0 ? '+' : '' }}{{ dashboardStats.ordersChange }}%
                      </span>
                    </div>
                  </div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-orange-500 rounded-full transition-all" :style="{ width: Math.min(100, (dashboardStats.todayOrders / dashboardStats.yesterdayOrders) * 100) + '%' }"></div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-gray-600 dark:text-gray-400">Livraisons réussies</span>
                    <div class="flex items-center space-x-2">
                      <span class="font-semibold text-gray-900 dark:text-white">{{ dashboardStats.todayDelivered }}</span>
                      <span :class="dashboardStats.deliveredChange >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs">
                        {{ dashboardStats.deliveredChange >= 0 ? '+' : '' }}{{ dashboardStats.deliveredChange }}%
                      </span>
                    </div>
                  </div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full transition-all" :style="{ width: Math.min(100, (dashboardStats.todayDelivered / dashboardStats.yesterdayDelivered) * 100) + '%' }"></div>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-gray-600 dark:text-gray-400">Retours</span>
                    <div class="flex items-center space-x-2">
                      <span class="font-semibold text-gray-900 dark:text-white">{{ dashboardStats.todayReturns }}</span>
                      <span :class="dashboardStats.returnsChange <= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs">
                        {{ dashboardStats.returnsChange >= 0 ? '+' : '' }}{{ dashboardStats.returnsChange }}%
                      </span>
                    </div>
                  </div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-red-500 rounded-full transition-all" :style="{ width: Math.min(100, dashboardStats.todayReturns * 10) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Weather Impact -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white">Météo & Impact</h3>
                <span class="text-xs text-gray-500">Tunisie</span>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div v-for="region in weatherRegions" :key="region.name" class="text-center p-3 rounded-lg" :class="region.impact === 'high' ? 'bg-red-50 dark:bg-red-900/20' : region.impact === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'">
                  <span class="text-2xl">{{ region.icon }}</span>
                  <p class="text-xs font-medium text-gray-900 dark:text-white mt-1">{{ region.name }}</p>
                  <p class="text-xs text-gray-500">{{ region.temp }}°C</p>
                  <p :class="[
                    'text-xs font-medium mt-1',
                    region.impact === 'high' ? 'text-red-600' :
                    region.impact === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  ]">{{ region.impact === 'high' ? 'Retards possibles' : region.impact === 'medium' ? 'Attention' : 'Normal' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions Grid -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button @click="activeSection = 'today-shipments'" class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 transition-all text-center group">
                <CalendarClock class="w-8 h-8 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p class="text-sm font-medium text-gray-900 dark:text-white">Colis du jour</p>
                <p class="text-xs text-gray-500 mt-1">{{ dashboardStats.todayDeliveries }} colis</p>
              </button>
              <button @click="activeSection = 'delayed-shipments'" class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 transition-all text-center group">
                <AlertTriangle class="w-8 h-8 text-red-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p class="text-sm font-medium text-gray-900 dark:text-white">En retard</p>
                <p class="text-xs text-red-500 mt-1">{{ delayedShipments.length }} colis</p>
              </button>
              <button @click="activeSection = 'returns-alerts'" class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:border-yellow-200 transition-all text-center group">
                <RotateCcw class="w-8 h-8 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p class="text-sm font-medium text-gray-900 dark:text-white">Alertes retours</p>
                <p class="text-xs text-yellow-500 mt-1">{{ returnAlerts.length }} alertes</p>
              </button>
              <button @click="activeSection = 'financial-snapshot'" class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-200 transition-all text-center group">
                <Wallet class="w-8 h-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p class="text-sm font-medium text-gray-900 dark:text-white">Finances</p>
                <p class="text-xs text-green-500 mt-1">{{ dashboardStats.expectedCOD }} TND</p>
              </button>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== DASHBOARD: TÂCHES DU JOUR ==================== -->
      <template v-if="activeSection === 'today-shipments'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Tâches du jour</h1>
              <p class="text-sm text-gray-500 mt-1">{{ new Date().toLocaleDateString('fr-TN', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-500">
                <span class="font-semibold text-green-600">{{ dailyTasksStats.completed }}</span> / {{ dailyTasksStats.total }} terminées
              </span>
              <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 rounded-full transition-all" :style="{ width: dailyTasksStats.progressPercent + '%' }"></div>
              </div>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Progress Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button @click="dailyTasksFilter = 'all'" :class="['rounded-xl p-5 border transition-all text-left', dailyTasksFilter === 'all' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 ring-2 ring-orange-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ dailyTasksStats.total }}</p>
                  <p class="text-sm text-gray-500 mt-1">Toutes les tâches</p>
                </div>
                <div class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <FileCheck class="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </button>
            <button @click="dailyTasksFilter = 'pending'" :class="['rounded-xl p-5 border transition-all text-left', dailyTasksFilter === 'pending' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-3xl font-bold text-blue-600">{{ dailyTasksStats.pending }}</p>
                  <p class="text-sm text-gray-500 mt-1">À faire</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Clock class="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </button>
            <button @click="dailyTasksFilter = 'completed'" :class="['rounded-xl p-5 border transition-all text-left', dailyTasksFilter === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 ring-2 ring-green-500/20' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-3xl font-bold text-green-600">{{ dailyTasksStats.completed }}</p>
                  <p class="text-sm text-gray-500 mt-1">Terminées</p>
                </div>
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle class="w-6 h-6 text-green-600" />
                </div>
              </div>
            </button>
          </div>

          <!-- Tasks by Category -->
          <div class="space-y-4">
            <!-- Loop through task categories -->
            <div v-for="category in filteredTaskCategories" :key="category.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <!-- Category Header -->
              <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', category.bgColor]">
                    <component :is="category.icon" :class="['w-5 h-5', category.iconColor]" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ category.name }}</h3>
                    <p class="text-xs text-gray-500">{{ category.tasks.filter(t => t.completed).length }}/{{ category.tasks.length }} terminées</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full transition-all" :style="{ width: (category.tasks.filter(t => t.completed).length / category.tasks.length * 100) + '%' }"></div>
                  </div>
                  <button v-if="category.tasks.some(t => !t.completed)" @click="completeAllInCategory(category.id)" class="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    Tout terminer
                  </button>
                </div>
              </div>

              <!-- Tasks List -->
              <div class="divide-y divide-gray-100 dark:divide-gray-800">
                <div v-for="task in category.tasks" :key="task.id"
                  :class="['px-5 py-3 flex items-center justify-between transition-colors', task.completed ? 'bg-gray-50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']">
                  <div class="flex items-center space-x-4">
                    <!-- Checkbox -->
                    <button @click="toggleTask(category.id, task.id)" :class="[
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-500'
                    ]">
                      <Check v-if="task.completed" class="w-4 h-4 text-white" />
                    </button>

                    <!-- Task Info -->
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <p :class="['text-sm font-medium', task.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white']">
                          {{ task.title }}
                        </p>
                        <span v-if="task.priority === 'high'" class="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">Urgent</span>
                        <span v-if="task.count" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">{{ task.count }}</span>
                      </div>
                      <p v-if="task.description" class="text-xs text-gray-500 mt-0.5">{{ task.description }}</p>
                    </div>
                  </div>

                  <!-- Task Actions -->
                  <div class="flex items-center space-x-2">
                    <!-- Quick Action Button -->
                    <button v-if="task.action && !task.completed" @click="executeTaskAction(task)" class="btn-primary btn-primary-sm flex items-center space-x-1">
                      <component :is="task.actionIcon" class="w-3 h-3" />
                      <span>{{ task.actionLabel }}</span>
                    </button>
                    <!-- Completed Time -->
                    <span v-if="task.completed && task.completedAt" class="text-xs text-gray-400">
                      {{ task.completedAt }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- All Completed Message -->
            <div v-if="dailyTasksStats.pending === 0" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle class="w-8 h-8 text-green-600" />
              </div>
              <h3 class="text-lg font-semibold text-green-800 dark:text-green-200">Félicitations !</h3>
              <p class="text-sm text-green-600 dark:text-green-400 mt-1">Toutes vos tâches du jour sont terminées.</p>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== DASHBOARD: COLIS EN RETARD ==================== -->
      <template v-if="activeSection === 'delayed-shipments'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Colis en retard</h1>
              <p class="text-sm text-gray-500 mt-1">{{ filteredDelayedShipmentsByDate.length }} colis nécessitent votre attention</p>
            </div>
            <div class="flex items-center space-x-3">
              <button class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Exporter
              </button>
              <button class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                <MessageCircle class="w-4 h-4" />
                <span>WhatsApp tous</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Date Filter -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer par période:</span>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  @click="delayedDateFilter = 'today'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    delayedDateFilter === 'today'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  Aujourd'hui
                </button>
                <button
                  @click="delayedDateFilter = '48h'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    delayedDateFilter === '48h'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  48 heures
                </button>
                <button
                  @click="delayedDateFilter = 'week'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    delayedDateFilter === 'week'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  Cette semaine
                </button>
                <button
                  @click="delayedDateFilter = 'month'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    delayedDateFilter === 'month'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  Ce mois
                </button>
                <button
                  @click="delayedDateFilter = 'custom'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    delayedDateFilter === 'custom'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  Personnalisé
                </button>
                <button
                  @click="delayedDateFilter = 'all'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    delayedDateFilter === 'all'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  Tous
                </button>
              </div>
              <!-- Custom Date Range -->
              <Transition name="fade">
                <div v-if="delayedDateFilter === 'custom'" class="flex items-center space-x-2 ml-auto">
                  <div class="flex items-center space-x-2">
                    <label class="text-sm text-gray-500">Du:</label>
                    <input
                      type="date"
                      v-model="delayedDateRangeStart"
                      class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div class="flex items-center space-x-2">
                    <label class="text-sm text-gray-500">Au:</label>
                    <input
                      type="date"
                      v-model="delayedDateRangeEnd"
                      class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Severity Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button @click="delayedFilter = 'all'" :class="['rounded-xl p-4 border transition-colors text-left', delayedFilter === 'all' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ filteredDelayedShipmentsByDate.length }}</p>
              <p class="text-sm text-gray-500">Tous les retards</p>
            </button>
            <button @click="delayedFilter = '24h'" :class="['rounded-xl p-4 border transition-colors text-left', delayedFilter === '24h' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
              <p class="text-2xl font-bold text-yellow-600">{{ filteredDelayedShipmentsByDate.filter(s => s.delayDays === 1).length }}</p>
              <p class="text-sm text-gray-500">Retard 24h</p>
            </button>
            <button @click="delayedFilter = '48h'" :class="['rounded-xl p-4 border transition-colors text-left', delayedFilter === '48h' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
              <p class="text-2xl font-bold text-orange-600">{{ filteredDelayedShipmentsByDate.filter(s => s.delayDays >= 2 && s.delayDays <= 3).length }}</p>
              <p class="text-sm text-gray-500">Retard 48-72h</p>
            </button>
            <button @click="delayedFilter = 'critical'" :class="['rounded-xl p-4 border transition-colors text-left', delayedFilter === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800']">
              <p class="text-2xl font-bold text-red-600">{{ filteredDelayedShipmentsByDate.filter(s => s.delayDays > 3).length }}</p>
              <p class="text-sm text-gray-500">Critique (+72h)</p>
            </button>
          </div>

          <!-- Pattern Detection Alert -->
          <div v-if="delayedPatterns.length > 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <div class="flex items-start space-x-3">
              <Lightbulb class="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p class="font-medium text-yellow-800 dark:text-yellow-200">Patterns détectés</p>
                <ul class="mt-2 space-y-1">
                  <li v-for="pattern in delayedPatterns" :key="pattern.id" class="text-sm text-yellow-700 dark:text-yellow-300">
                    • {{ pattern.message }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Delayed Shipments List -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <input type="checkbox" class="w-4 h-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue" />
                <span class="text-sm text-gray-500">Sélectionner tout</span>
              </div>
              <div class="flex items-center space-x-2">
                <button class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Changer transporteur
                </button>
                <button class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Contacter clients
                </button>
              </div>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="shipment in filteredDelayedShipmentsFinal" :key="shipment.id" class="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <input type="checkbox" class="w-4 h-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue" />
                    <div :class="[
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      shipment.delayDays > 3 ? 'bg-red-100 dark:bg-red-900/30' :
                      shipment.delayDays >= 2 ? 'bg-orange-100 dark:bg-orange-900/30' :
                      'bg-yellow-100 dark:bg-yellow-900/30'
                    ]">
                      <AlertTriangle :class="[
                        'w-5 h-5',
                        shipment.delayDays > 3 ? 'text-red-600' :
                        shipment.delayDays >= 2 ? 'text-orange-600' :
                        'text-yellow-600'
                      ]" />
                    </div>
                    <div>
                      <div class="flex items-center space-x-2">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.tracking }}</p>
                        <span :class="[
                          'px-2 py-0.5 text-xs rounded-full font-medium',
                          shipment.delayDays > 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          shipment.delayDays >= 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        ]">+{{ shipment.delayDays }} jour{{ shipment.delayDays > 1 ? 's' : '' }}</span>
                      </div>
                      <p class="text-xs text-gray-500 mt-0.5">{{ shipment.client }} · {{ shipment.destination }}</p>
                      <p class="text-xs text-gray-400 mt-0.5">Transporteur: {{ shipment.carrier }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="WhatsApp">
                      <MessageCircle class="w-4 h-4" />
                    </button>
                    <button class="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Contacter transporteur">
                      <Truck class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== DASHBOARD: ALERTES RETOURS ==================== -->
      <template v-if="activeSection === 'returns-alerts'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Alertes retours</h1>
              <p class="text-sm text-gray-500 mt-1">Intervenez avant qu'il ne soit trop tard</p>
            </div>
            <button class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
              <MessageCircle class="w-4 h-4" />
              <span>WhatsApp groupé</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Alert Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-red-600">{{ returnAlerts.filter(a => a.type === 'failed-attempt').length }}</p>
                  <p class="text-xs text-gray-500">Tentatives échouées</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <UserX class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-yellow-600">{{ returnAlerts.filter(a => a.type === 'unreachable').length }}</p>
                  <p class="text-xs text-gray-500">Clients injoignables</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-orange-600">{{ returnAlerts.filter(a => a.type === 'risk').length }}</p>
                  <p class="text-xs text-gray-500">Risque de retour</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <User class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-purple-600">{{ returnAlerts.filter(a => a.isRecidivist).length }}</p>
                  <p class="text-xs text-gray-500">Clients récidivistes</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Failed Attempts Section -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <XCircle class="w-5 h-5 text-red-500" />
                <h3 class="font-semibold text-gray-900 dark:text-white">Tentatives de livraison échouées</h3>
                <span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">Urgent</span>
              </div>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="alert in returnAlerts.filter(a => a.type === 'failed-attempt')" :key="alert.id" class="px-5 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span class="text-sm font-bold text-red-600">{{ alert.attempts }}</span>
                    </div>
                    <div>
                      <div class="flex items-center space-x-2">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ alert.client }}</p>
                        <span v-if="alert.isRecidivist" class="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">Récidiviste</span>
                      </div>
                      <p class="text-xs text-gray-500 mt-0.5">{{ alert.tracking }} · {{ alert.destination }}</p>
                      <p class="text-xs text-red-500 mt-0.5">{{ alert.attempts }} tentative{{ alert.attempts > 1 ? 's' : '' }} · Dernière: {{ alert.lastAttempt }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ alert.amount }} TND</span>
                    <button class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1">
                      <MessageCircle class="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Unreachable Clients -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-2">
                <UserX class="w-5 h-5 text-yellow-500" />
                <h3 class="font-semibold text-gray-900 dark:text-white">Clients injoignables</h3>
              </div>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="alert in returnAlerts.filter(a => a.type === 'unreachable')" :key="alert.id" class="px-5 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                      <UserX class="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ alert.client }}</p>
                      <p class="text-xs text-gray-500">{{ alert.phone }} · {{ alert.destination }}</p>
                      <p class="text-xs text-yellow-600 mt-0.5">Dernier contact: {{ alert.lastContact }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1">
                      <MessageCircle class="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                    <button class="btn-primary btn-primary-sm">
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Return Risk Prediction -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-2">
                <Brain class="w-5 h-5 text-purple-500" />
                <h3 class="font-semibold text-gray-900 dark:text-white">Prédiction de retours</h3>
                <span class="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">IA</span>
              </div>
            </div>
            <div class="p-5">
              <div class="space-y-3">
                <div v-for="alert in returnAlerts.filter(a => a.type === 'risk')" :key="alert.id" class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <span class="text-lg font-bold text-orange-600">{{ alert.riskScore }}%</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ alert.client }}</p>
                      <p class="text-xs text-gray-500">{{ alert.tracking }}</p>
                      <p class="text-xs text-orange-600 mt-0.5">{{ alert.riskReason }}</p>
                    </div>
                  </div>
                  <button class="btn-primary btn-primary-sm">
                    Intervenir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== DASHBOARD: APERÇU FINANCIER ==================== -->
      <template v-if="activeSection === 'financial-snapshot'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Aperçu financier</h1>
              <p class="text-sm text-gray-500 mt-1">Suivi de votre trésorerie et paiements</p>
            </div>
            <div class="flex items-center space-x-3">
              <select class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <option>Aujourd'hui</option>
                <option>Cette semaine</option>
                <option>Ce mois</option>
              </select>
              <button class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2">
                <Download class="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Financial Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm opacity-90">COD à récupérer</span>
                <Banknote class="w-5 h-5 opacity-80" />
              </div>
              <p class="text-3xl font-bold">{{ financialStats.pendingCOD }} <span class="text-lg font-normal">TND</span></p>
              <p class="text-sm opacity-80 mt-1">{{ financialStats.pendingCODCount }} colis</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500">Paiements en attente</span>
                <Clock class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-2xl font-bold text-yellow-600">{{ financialStats.pendingPayments }} <span class="text-sm font-normal">TND</span></p>
              <p class="text-xs text-gray-500 mt-1">De {{ financialStats.pendingCarriersCount }} transporteurs</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500">Frais de livraison</span>
                <Truck class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-2xl font-bold text-red-600">-{{ financialStats.deliveryFees }} <span class="text-sm font-normal">TND</span></p>
              <p class="text-xs text-gray-500 mt-1">Ce mois</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500">Marge nette</span>
                <TrendingUp class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ financialStats.netMargin }} <span class="text-sm font-normal">TND</span></p>
              <p class="text-xs text-green-600 mt-1">+{{ financialStats.marginPercent }}% du CA</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- COD by Carrier -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 class="font-semibold text-gray-900 dark:text-white">COD à récupérer par transporteur</h3>
              </div>
              <div class="p-5 space-y-4">
                <div v-for="carrier in financialStats.codByCarrier" :key="carrier.name" class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', carrier.colorClass]">
                      <Building2 class="w-5 h-5" :class="carrier.iconColor" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
                      <p class="text-xs text-gray-500">{{ carrier.count }} colis</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-gray-900 dark:text-white">{{ carrier.amount }} TND</p>
                    <p v-if="carrier.overdue > 0" class="text-xs text-red-500">{{ carrier.overdue }} TND en retard</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Overdue Payments -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Paiements en retard</h3>
                  <span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">{{ financialStats.overduePayments.length }}</span>
                </div>
              </div>
              <div class="divide-y divide-gray-100 dark:divide-gray-800">
                <div v-for="payment in financialStats.overduePayments" :key="payment.id" class="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ payment.carrier }}</p>
                    <p class="text-xs text-red-500">En retard de {{ payment.daysOverdue }} jours</p>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">{{ payment.amount }} TND</span>
                    <button class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">
                      Relancer
                    </button>
                  </div>
                </div>
                <div v-if="financialStats.overduePayments.length === 0" class="px-5 py-8 text-center">
                  <CheckCircle class="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p class="text-sm text-gray-500">Aucun paiement en retard</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Cash Flow Projection -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Prévision de trésorerie (7 jours)</h3>
            </div>
            <div class="p-5">
              <div class="flex items-end justify-between h-40 mb-4">
                <div v-for="(day, index) in financialStats.cashFlowProjection" :key="index" class="flex-1 flex flex-col items-center mx-1">
                  <div class="w-full flex flex-col items-center justify-end h-32">
                    <div v-if="day.incoming > 0" class="w-full bg-green-400 rounded-t" :style="{ height: (day.incoming / 2000 * 100) + '%' }"></div>
                    <div v-if="day.outgoing > 0" class="w-full bg-red-400 rounded-b mt-0.5" :style="{ height: (day.outgoing / 2000 * 100) + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500 mt-2">{{ day.label }}</span>
                </div>
              </div>
              <div class="flex items-center justify-center space-x-6 text-xs">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-green-400 rounded"></div>
                  <span class="text-gray-500">Entrées (COD)</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-red-400 rounded"></div>
                  <span class="text-gray-500">Sorties (Frais)</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== DASHBOARD: JOURNAL D'ACTIVITÉ ==================== -->
      <template v-if="activeSection === 'activity-log'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Journal d'activité</h1>
              <p class="text-sm text-gray-500 mt-1">Historique de toutes les actions et événements</p>
            </div>
            <div class="flex items-center space-x-3">
              <button class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2">
                <Download class="w-4 h-4" />
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Filters -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center space-x-2">
                <Filter class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-500">Filtres:</span>
              </div>
              <select v-model="activityFilters.type" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <option value="all">Tous les types</option>
                <option value="status">Changements de statut</option>
                <option value="payment">Paiements</option>
                <option value="return">Retours</option>
                <option value="system">Système</option>
              </select>
              <select v-model="activityFilters.period" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <option value="today">Aujourd'hui</option>
                <option value="yesterday">Hier</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
              <input v-model="activityFilters.search" type="text" placeholder="Rechercher (tracking, client...)" class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-64" />
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="(group, date) in groupedActivityLogs" :key="date">
                <div class="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ date }}</span>
                </div>
                <div class="divide-y divide-gray-50 dark:divide-gray-800/50">
                  <div v-for="log in group" :key="log.id" class="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div class="flex items-start space-x-3">
                      <div :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
                        log.type === 'status' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        log.type === 'payment' ? 'bg-green-100 dark:bg-green-900/30' :
                        log.type === 'return' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        log.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      ]">
                        <component :is="log.icon" :class="[
                          'w-4 h-4',
                          log.type === 'status' ? 'text-blue-600' :
                          log.type === 'payment' ? 'text-green-600' :
                          log.type === 'return' ? 'text-yellow-600' :
                          log.type === 'error' ? 'text-red-600' :
                          'text-gray-500'
                        ]" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-900 dark:text-white">{{ log.message }}</p>
                        <div class="flex items-center space-x-3 mt-1">
                          <span class="text-xs text-gray-400">{{ log.time }}</span>
                          <span v-if="log.tracking" class="text-xs text-blue-600 font-mono">{{ log.tracking }}</span>
                          <span v-if="log.user" class="text-xs text-gray-500">par {{ log.user }}</span>
                        </div>
                      </div>
                      <button v-if="log.tracking" class="text-xs text-orange-500 hover:text-orange-600 font-medium">
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Create Shipment Section -->
      <template v-if="activeSection === 'create-shipment'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Ajouter un colis</h1>
              <p class="text-sm text-gray-500 mt-1">Créer une nouvelle expédition</p>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-3xl mx-auto space-y-6">

            <!-- Section 1: Type de colis -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span class="text-sm font-bold text-orange-600">1</span>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Type de colis</h2>
                </div>
              </div>
              <div class="p-6">
                <!-- Type Selection -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    @click="newShipment.type = 'normal'"
                    :class="[
                      'p-5 rounded-xl border-2 text-left transition-all',
                      newShipment.type === 'normal'
                        ? 'border-primary-blue bg-primary-blue/5 dark:bg-primary-blue/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    ]"
                  >
                    <div class="flex items-center gap-3 mb-2">
                      <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', newShipment.type === 'normal' ? 'bg-primary-blue/10' : 'bg-gray-100 dark:bg-gray-800']">
                        <Package class="w-5 h-5" :class="newShipment.type === 'normal' ? 'text-primary-blue' : 'text-gray-400'" />
                      </div>
                      <div>
                        <span class="font-semibold" :class="newShipment.type === 'normal' ? 'text-primary-blue' : 'text-gray-700 dark:text-gray-300'">Livraison normale</span>
                      </div>
                    </div>
                    <p class="text-sm text-gray-500">Envoi standard d'un colis au client</p>
                  </button>
                  <button
                    type="button"
                    @click="newShipment.type = 'exchange'"
                    :class="[
                      'p-5 rounded-xl border-2 text-left transition-all',
                      newShipment.type === 'exchange'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    ]"
                  >
                    <div class="flex items-center gap-3 mb-2">
                      <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', newShipment.type === 'exchange' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-800']">
                        <RefreshCw class="w-5 h-5" :class="newShipment.type === 'exchange' ? 'text-orange-500' : 'text-gray-400'" />
                      </div>
                      <div>
                        <span class="font-semibold" :class="newShipment.type === 'exchange' ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'">Échange</span>
                      </div>
                    </div>
                    <p class="text-sm text-gray-500">Livrer un colis et récupérer un article</p>
                  </button>
                </div>

                <!-- Exchange Details (only shown when exchange is selected) -->
                <div v-if="newShipment.type === 'exchange'" class="p-5 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800/30 space-y-4">
                  <div class="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                    <RefreshCw class="w-4 h-4" />
                    <span class="text-sm font-semibold">Détails de l'échange</span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Reason for exchange -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raison de l'échange <span class="text-red-500">*</span></label>
                      <select v-model="newShipment.exchangeReason" class="w-full px-3 py-2 border border-orange-200 dark:border-orange-800 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <option value="">Sélectionner une raison</option>
                        <option value="wrong_size">Mauvaise taille</option>
                        <option value="wrong_color">Mauvaise couleur</option>
                        <option value="defective">Produit défectueux</option>
                        <option value="wrong_product">Mauvais produit</option>
                        <option value="customer_changed_mind">Client a changé d'avis</option>
                        <option value="other">Autre raison</option>
                      </select>
                    </div>

                    <!-- Number of items to collect -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre d'articles à récupérer <span class="text-red-500">*</span></label>
                      <input v-model.number="newShipment.exchangeItemCount" type="number" min="1" placeholder="1" class="w-full px-3 py-2 border border-orange-200 dark:border-orange-800 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    </div>
                  </div>

                  <!-- Description of items to collect -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description des articles à récupérer</label>
                    <textarea v-model="newShipment.exchangeDescription" rows="2" placeholder="Ex: T-shirt bleu taille L à retourner" class="w-full px-3 py-2 border border-orange-200 dark:border-orange-800 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"></textarea>
                  </div>

                  <!-- Image upload -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo de l'article (optionnel)</label>
                    <div class="flex items-center gap-4">
                      <label class="flex-1 cursor-pointer">
                        <div class="border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                          <input type="file" accept="image/*" @change="handleExchangeImageUpload" class="hidden" />
                          <Camera class="w-8 h-8 text-orange-400 mx-auto mb-2" />
                          <p class="text-sm text-gray-500">Cliquez pour ajouter une photo</p>
                        </div>
                      </label>
                      <div v-if="newShipment.exchangeImage" class="w-24 h-24 relative">
                        <img :src="newShipment.exchangeImage" alt="Preview" class="w-full h-full object-cover rounded-lg" />
                        <button @click="newShipment.exchangeImage = null" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                          <X class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Informations de Destination -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span class="text-sm font-bold text-orange-600">2</span>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Informations de Destination</h2>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <!-- Client Search with Autocomplete -->
                <div class="relative">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      v-model="shipmentClientSearch"
                      @input="onShipmentClientSearch"
                      @focus="showClientSuggestions = true"
                      type="text"
                      placeholder="Rechercher ou saisir un nouveau client..."
                      class="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <!-- Client Suggestions Dropdown -->
                  <div v-if="showClientSuggestions && filteredShipmentClients.length > 0" class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    <button
                      v-for="client in filteredShipmentClients"
                      :key="client.id"
                      @click="selectClientForShipment(client)"
                      class="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" :class="client.status === 'vip' ? 'bg-purple-100 text-purple-600' : client.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-primary-blue/10 text-primary-blue'">
                        {{ client.name.charAt(0) }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ client.name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ client.phone }} • {{ client.region }}</p>
                      </div>
                      <div class="flex items-center space-x-2 flex-shrink-0">
                        <span v-if="client.status === 'vip'" class="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">VIP</span>
                        <span v-if="client.status === 'blocked'" class="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded flex items-center"><AlertTriangle class="w-3 h-3 mr-0.5" />Bloqué</span>
                        <span class="text-xs" :class="client.deliveryRate >= 80 ? 'text-green-600' : client.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">{{ client.deliveryRate }}%</span>
                      </div>
                    </button>
                  </div>
                  <!-- No results - option to create new -->
                  <div v-if="showClientSuggestions && shipmentClientSearch.length >= 2 && filteredShipmentClients.length === 0" class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                    <p class="text-sm text-gray-500 text-center mb-2">Aucun client trouvé</p>
                    <button @click="useNewClientName" class="w-full px-3 py-2 text-sm font-medium bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/20 rounded-lg flex items-center justify-center space-x-2">
                      <Plus class="w-4 h-4" />
                      <span>Utiliser "{{ shipmentClientSearch }}" comme nouveau client</span>
                    </button>
                  </div>
                </div>

                <!-- Selected Client Card -->
                <div v-if="selectedShipmentClient" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" :class="selectedShipmentClient.status === 'vip' ? 'bg-purple-100 text-purple-600' : 'bg-primary-blue/10 text-primary-blue'">
                        {{ selectedShipmentClient.name.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                          {{ selectedShipmentClient.name }}
                          <CheckCircle class="w-4 h-4 ml-1.5 text-green-500" />
                        </p>
                        <p class="text-xs text-gray-500">{{ selectedShipmentClient.totalOrders }} commandes • {{ selectedShipmentClient.deliveryRate }}% livraison</p>
                      </div>
                    </div>
                    <button @click="clearSelectedClient" class="p-1.5 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors">
                      <X class="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div v-if="selectedShipmentClient.status === 'blocked'" class="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded flex items-center space-x-2">
                    <AlertTriangle class="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p class="text-xs text-red-600 dark:text-red-400">Attention: Ce client a un faible taux de livraison ({{ selectedShipmentClient.deliveryRate }}%)</p>
                  </div>
                </div>

                <!-- Téléphones -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Téléphone <span class="text-red-500">*</span>
                    </label>
                    <div class="flex">
                      <span class="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                        +216
                      </span>
                      <input v-model="newShipment.phone" type="tel" placeholder="XX XXX XXX" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-r-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone secondaire</label>
                    <div class="flex">
                      <span class="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                        +216
                      </span>
                      <input v-model="newShipment.phoneSecondary" type="tel" placeholder="XX XXX XXX" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-r-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>

                <!-- Adresse -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adresse <span class="text-red-500">*</span>
                  </label>
                  <textarea v-model="newShipment.address" rows="2" placeholder="Entrez l'adresse complète" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"></textarea>
                </div>

                <!-- Gouvernorat, Délégation, Localité -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gouvernorat <span class="text-red-500">*</span>
                    </label>
                    <select v-model="newShipment.gouvernorat" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="">Sélectionner</option>
                      <option v-for="gov in gouvernorats" :key="gov" :value="gov">{{ gov }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Délégation <span class="text-red-500">*</span>
                    </label>
                    <select v-model="newShipment.delegation" :disabled="!newShipment.gouvernorat" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value="">Sélectionner</option>
                      <option v-for="del in availableDelegations" :key="del" :value="del">{{ del }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localité</label>
                    <select v-model="newShipment.locality" :disabled="!newShipment.delegation" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value="">Sélectionner</option>
                      <option v-for="loc in availableLocalities" :key="loc" :value="loc">{{ loc }}</option>
                    </select>
                  </div>
                </div>

                <!-- Code postal -->
                <div class="w-full md:w-1/3">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code postal</label>
                  <input v-model="newShipment.postalCode" type="text" readonly placeholder="Auto-rempli" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed" />
                </div>
              </div>
            </div>

            <!-- Section 3: Transporteur -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span class="text-sm font-bold text-orange-600">3</span>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Transporteur</h2>
                </div>
              </div>
              <div class="p-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choisir le transporteur <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    v-for="carrier in deliveryCarriers"
                    :key="carrier.id"
                    type="button"
                    @click="selectShipmentCarrier(carrier)"
                    :class="[
                      'p-4 rounded-xl border-2 text-center transition-all hover:shadow-md',
                      newShipment.carrier === carrier.name
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    ]"
                  >
                    <div class="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center" :style="{ backgroundColor: carrier.color + '20' }">
                      <Truck class="w-6 h-6" :style="{ color: carrier.color }" />
                    </div>
                    <span class="text-sm font-medium" :class="newShipment.carrier === carrier.name ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'">{{ carrier.name }}</span>
                    <p class="text-xs text-gray-400 mt-1">{{ carrier.deliveryTime }}</p>
                  </button>
                </div>
                <p v-if="!newShipment.carrier" class="text-xs text-red-500 mt-2">Veuillez sélectionner un transporteur</p>
              </div>
            </div>

            <!-- Section 4: Détails du Produit -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span class="text-sm font-bold text-orange-600">4</span>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Détails du Produit</h2>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <!-- Nom du produit + Fragile -->
                <div class="flex flex-col md:flex-row md:items-end gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom du Produit <span class="text-red-500">*</span>
                    </label>
                    <input v-model="newShipment.productName" type="text" placeholder="Entrez le nom du produit" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div class="flex items-center">
                    <label class="flex items-center space-x-2 cursor-pointer px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <input type="checkbox" v-model="newShipment.isFragile" class="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue" />
                      <AlertTriangle class="w-4 h-4 text-yellow-500" />
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Produit Fragile</span>
                    </label>
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea v-model="newShipment.description" rows="3" placeholder="Description du produit (optionnel)" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"></textarea>
                </div>

                <!-- Prix -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Prix</h3>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <label class="text-sm text-gray-600 dark:text-gray-400">Prix produit</label>
                      <div class="flex items-center space-x-2">
                        <input v-model.number="newShipment.productPrice" type="number" min="0" step="0.01" placeholder="0.00" class="w-28 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-right focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                        <span class="text-sm text-gray-500">DT</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <label class="text-sm text-gray-600 dark:text-gray-400">Frais livraison <span class="text-xs text-orange-500">({{ newShipment.carrier || 'Aucun transporteur' }})</span></label>
                      <div class="flex items-center space-x-2">
                        <input v-model.number="newShipment.deliveryFee" type="number" min="0" step="0.01" placeholder="7.00" class="w-28 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-right focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                        <span class="text-sm text-gray-500">DT</span>
                      </div>
                    </div>
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-3 flex items-center justify-between">
                      <label class="text-sm font-semibold text-gray-900 dark:text-white">Prix Total</label>
                      <span class="text-lg font-bold text-orange-600">{{ totalPrice.toFixed(2) }} DT</span>
                    </div>
                  </div>
                </div>

                <!-- Référence -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Référence</label>
                  <div class="flex space-x-2">
                    <input v-model="newShipment.reference" type="text" readonly placeholder="Auto-générée" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed font-mono" />
                    <button @click="newShipment.reference = generateReference()" type="button" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <RefreshCw class="w-4 h-4" />
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">La référence sera générée automatiquement à la création</p>
                </div>
              </div>
            </div>

            <!-- Spacer for sticky footer -->
            <div class="h-32"></div>
          </div>
        </main>

        <!-- Sticky Footer with Price and Actions -->
        <div class="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 shadow-lg">
          <div class="max-w-3xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div>
                <span class="text-sm text-gray-500">Prix produit</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ newShipment.productPrice.toFixed(2) }} DT</p>
              </div>
              <div class="text-gray-300 dark:text-gray-600">+</div>
              <div>
                <span class="text-sm text-gray-500">Livraison</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ newShipment.deliveryFee.toFixed(2) }} DT</p>
              </div>
              <div class="text-gray-300 dark:text-gray-600">=</div>
              <div class="bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl">
                <span class="text-sm text-orange-600">Total</span>
                <p class="text-2xl font-bold text-orange-600">{{ totalPrice.toFixed(2) }} DT</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetShipmentForm" type="button" class="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Annuler
              </button>
              <button @click="addShipment" :disabled="!newShipment.carrier" :class="['px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2', !newShipment.carrier && 'opacity-50 cursor-not-allowed']">
                <Plus class="w-4 h-4" />
                Créer le colis
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Notifications Section (Settings) -->
      <template v-if="activeSection === 'notifications'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Flows de notifications</h1>
              <p class="text-sm text-gray-500 mt-1">Automatisez les notifications pour chaque statut de colis</p>
            </div>
            <button class="btn-primary">
              <Plus class="w-4 h-4" />
              <span>Créer un flow</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Flow Count -->
          <div class="mb-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ notificationFlows.length }} sur {{ notificationFlows.length }} flows sont affichés</p>
          </div>

          <!-- Flows Table -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <!-- Table Header -->
            <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div class="col-span-5">Name</div>
              <div class="col-span-1 text-center">Channel</div>
              <div class="col-span-2 text-center">Recipients</div>
              <div class="col-span-2 text-center">Emails sent</div>
              <div class="col-span-2 text-center">Actions</div>
            </div>

            <!-- Flow Rows -->
            <div v-for="(flow, index) in notificationFlows" :key="index" class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors items-center">
              <!-- Name -->
              <div class="col-span-5">
                <div class="flex items-start space-x-3">
                  <div class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded">
                    <FileText class="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ flow.name }}</p>
                    <p class="text-sm text-gray-500">
                      <span v-if="flow.enabled" class="text-gray-400">Disabled on {{ flow.disabledAt }}</span>
                      <span v-else class="text-gray-400">This flow has not been enabled</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Channel -->
              <div class="col-span-1 flex justify-center space-x-1">
                <Mail class="w-5 h-5 text-gray-400" />
                <MessageSquare class="w-5 h-5 text-gray-400" />
              </div>

              <!-- Recipients -->
              <div class="col-span-2 flex justify-center space-x-2">
                <User class="w-5 h-5 text-gray-400" />
                <FileText class="w-5 h-5 text-gray-400" />
              </div>

              <!-- Emails Sent -->
              <div class="col-span-2 text-center">
                <span class="text-gray-600 dark:text-gray-400 underline decoration-dotted cursor-help">{{ flow.emailsSent }}</span>
              </div>

              <!-- Actions -->
              <div class="col-span-2 flex items-center justify-center space-x-3">
                <!-- Toggle -->
                <button
                  @click="toggleFlow(index)"
                  :class="[
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    flow.enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      flow.enabled ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>

                <!-- More Options -->
                <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <MoreHorizontal class="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Analytics Section - KPIs Globaux -->
      <template v-if="activeSection === 'global-kpis'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">KPIs Globaux</h1>
              <p class="text-sm text-gray-500 mt-1">Vue d'ensemble de vos indicateurs clés de performance</p>
            </div>
            <div class="flex items-center space-x-3">
              <select v-model="analyticsDateRange" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
              </select>
              <button class="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Download class="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Main KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package class="w-5 h-5 text-blue-600" />
                </div>
                <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+12%</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ analyticsKpis.totalShipments }}</p>
              <p class="text-sm text-gray-500 mt-1">Total Colis</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                </div>
                <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+2.3%</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ analyticsKpis.deliveryRate }}%</p>
              <p class="text-sm text-gray-500 mt-1">Taux de Livraison</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Timer class="w-5 h-5 text-orange-600" />
                </div>
                <span class="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">+0.5j</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ analyticsKpis.avgTransitTime }} jours</p>
              <p class="text-sm text-gray-500 mt-1">Transit Moyen</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <DollarSign class="w-5 h-5 text-purple-600" />
                </div>
                <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+8%</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ analyticsKpis.totalRevenue }} DT</p>
              <p class="text-sm text-gray-500 mt-1">Chiffre d'Affaires</p>
            </div>
          </div>

          <!-- Secondary KPIs -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <RotateCcw class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">{{ analyticsKpis.returnRate }}%</p>
                  <p class="text-sm text-gray-500">Taux de Retour</p>
                </div>
              </div>
              <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-red-500 rounded-full" :style="{ width: analyticsKpis.returnRate + '%' }"></div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">{{ analyticsKpis.exceptionRate }}%</p>
                  <p class="text-sm text-gray-500">Taux d'Exception</p>
                </div>
              </div>
              <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-yellow-500 rounded-full" :style="{ width: analyticsKpis.exceptionRate + '%' }"></div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">{{ analyticsKpis.customerSatisfaction }}%</p>
                  <p class="text-sm text-gray-500">Satisfaction Client</p>
                </div>
              </div>
              <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 rounded-full" :style="{ width: analyticsKpis.customerSatisfaction + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Volume Chart -->
          <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Volume de Colis</h3>
            <div class="h-64 flex items-end space-x-2">
              <div v-for="(value, index) in chartData" :key="index" class="flex-1 flex flex-col items-center">
                <div class="w-full bg-orange-500 rounded-t transition-all duration-300" :style="{ height: value + '%' }"></div>
                <span class="text-xs text-gray-500 mt-2">{{ chartLabels[index] }}</span>
              </div>
            </div>
          </div>

          <!-- KPI Comparison Table -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Comparaison par Période</h3>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Indicateur</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cette période</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Période précédente</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Variation</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="kpi in analyticsKpiComparison" :key="kpi.name" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ kpi.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ kpi.current }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ kpi.previous }}</td>
                  <td class="px-4 py-3">
                    <span :class="kpi.change > 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                      {{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </template>

      <!-- Analytics Section - Performance Livraison -->
      <template v-if="activeSection === 'delivery-performance'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Performance Livraison</h1>
              <p class="text-sm text-gray-500 mt-1">Analysez les performances de livraison par transporteur et région</p>
            </div>
            <div class="flex items-center space-x-3">
              <select v-model="analyticsDateRange" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
              </select>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Performance Summary -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500">Livraisons Réussies</p>
              <p class="text-2xl font-bold text-green-600 mt-1">{{ deliveryPerformance.successfulDeliveries }}</p>
              <p class="text-xs text-gray-400 mt-1">sur {{ deliveryPerformance.totalAttempts }} tentatives</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500">Première Tentative</p>
              <p class="text-2xl font-bold text-blue-600 mt-1">{{ deliveryPerformance.firstAttemptRate }}%</p>
              <p class="text-xs text-gray-400 mt-1">taux de réussite</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500">Délai Moyen</p>
              <p class="text-2xl font-bold text-orange-600 mt-1">{{ deliveryPerformance.avgDeliveryTime }}h</p>
              <p class="text-xs text-gray-400 mt-1">après expédition</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500">Ponctualité</p>
              <p class="text-2xl font-bold text-purple-600 mt-1">{{ deliveryPerformance.onTimeRate }}%</p>
              <p class="text-xs text-gray-400 mt-1">dans les délais</p>
            </div>
          </div>

          <!-- Carrier Performance -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Performance par Transporteur</h3>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Transporteur</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Colis</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Livrés</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taux</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Délai Moy.</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="carrier in carriers" :key="carrier.name" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ carrier.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ carrier.shipments }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ carrier.delivered }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-green-500 rounded-full" :style="{ width: carrier.deliveryRate + '%' }"></div>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ carrier.deliveryRate }}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ carrier.avgTime }} jours</td>
                  <td class="px-4 py-3">
                    <span :class="carrier.deliveryRate >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : carrier.deliveryRate >= 80 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ carrier.deliveryRate >= 90 ? 'Excellent' : carrier.deliveryRate >= 80 ? 'Bon' : 'À améliorer' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Regional Performance -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Performance par Région</h3>
            </div>
            <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="region in deliveryPerformance.regionalPerformance" :key="region.name" class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-gray-900 dark:text-white">{{ region.name }}</span>
                  <span :class="region.rate >= 90 ? 'text-green-600' : region.rate >= 80 ? 'text-yellow-600' : 'text-red-600'" class="text-sm font-bold">{{ region.rate }}%</span>
                </div>
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div :class="region.rate >= 90 ? 'bg-green-500' : region.rate >= 80 ? 'bg-yellow-500' : 'bg-red-500'" class="h-full rounded-full" :style="{ width: region.rate + '%' }"></div>
                </div>
                <p class="text-xs text-gray-500 mt-2">{{ region.shipments }} colis • {{ region.avgTime }} jours moy.</p>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Analytics Section - Intelligence Retours -->
      <template v-if="activeSection === 'return-intelligence'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Intelligence Retours</h1>
              <p class="text-sm text-gray-500 mt-1">Analysez les motifs de retour et identifiez les patterns</p>
            </div>
            <div class="flex items-center space-x-3">
              <select v-model="analyticsDateRange" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
              </select>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Return Overview -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <RotateCcw class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ returnIntelligence.totalReturns }}</p>
                  <p class="text-sm text-gray-500">Total Retours</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <DollarSign class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ returnIntelligence.lostRevenue }} DT</p>
                  <p class="text-sm text-gray-500">Pertes Estimées</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ returnIntelligence.recoveredReturns }}</p>
                  <p class="text-sm text-gray-500">Récupérés</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ returnIntelligence.recoveryRate }}%</p>
                  <p class="text-sm text-gray-500">Taux Récupération</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Return Reasons -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 class="font-semibold text-gray-900 dark:text-white">Motifs de Retour</h3>
              </div>
              <div class="p-4 space-y-3">
                <div v-for="reason in returnIntelligence.returnReasons" :key="reason.name" class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: reason.color }"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ reason.name }}</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full rounded-full" :style="{ width: reason.percentage + '%', backgroundColor: reason.color }"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{{ reason.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 class="font-semibold text-gray-900 dark:text-white">Évolution des Retours</h3>
              </div>
              <div class="p-4">
                <div class="h-48 flex items-end space-x-2">
                  <div v-for="(value, index) in returnIntelligence.returnTrend" :key="index" class="flex-1 flex flex-col items-center">
                    <div class="w-full bg-red-400 rounded-t transition-all duration-300" :style="{ height: (value / Math.max(...returnIntelligence.returnTrend) * 100) + '%' }"></div>
                    <span class="text-xs text-gray-500 mt-2">S{{ index + 1 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Recommandations IA</h3>
            </div>
            <div class="p-4 space-y-3">
              <div v-for="rec in returnIntelligence.recommendations" :key="rec.title" class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div class="flex items-start space-x-3">
                  <div :class="rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' : rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'" class="p-2 rounded-lg">
                    <Brain :class="rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'" class="w-5 h-5" />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 dark:text-white">{{ rec.title }}</h4>
                    <p class="text-sm text-gray-500 mt-1">{{ rec.description }}</p>
                    <span class="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full" :class="rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                      Impact: {{ rec.impact }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Analytics Section - Zones à Risque -->
      <template v-if="activeSection === 'risk-zones'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Zones à Risque</h1>
              <p class="text-sm text-gray-500 mt-1">Identifiez les zones géographiques problématiques</p>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Risk Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
              <div class="flex items-center space-x-3">
                <MapPinned class="w-6 h-6 text-red-600" />
                <div>
                  <p class="text-2xl font-bold text-red-700 dark:text-red-400">{{ riskZones.highRiskCount }}</p>
                  <p class="text-sm text-red-600 dark:text-red-400">Zones Haut Risque</p>
                </div>
              </div>
            </div>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800">
              <div class="flex items-center space-x-3">
                <MapPinned class="w-6 h-6 text-yellow-600" />
                <div>
                  <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{{ riskZones.mediumRiskCount }}</p>
                  <p class="text-sm text-yellow-600 dark:text-yellow-400">Zones Risque Moyen</p>
                </div>
              </div>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
              <div class="flex items-center space-x-3">
                <MapPinned class="w-6 h-6 text-green-600" />
                <div>
                  <p class="text-2xl font-bold text-green-700 dark:text-green-400">{{ riskZones.lowRiskCount }}</p>
                  <p class="text-sm text-green-600 dark:text-green-400">Zones Faible Risque</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Risk Zones Table -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Détail par Zone</h3>
              <div class="flex items-center space-x-2">
                <button
                  @click="riskZoneFilter = 'all'"
                  :class="riskZoneFilter === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >Tous</button>
                <button
                  @click="riskZoneFilter = 'high'"
                  :class="riskZoneFilter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >Haut</button>
                <button
                  @click="riskZoneFilter = 'medium'"
                  :class="riskZoneFilter === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >Moyen</button>
              </div>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Zone</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Risque</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taux Échec</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Retours</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Colis Affectés</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Raison Principale</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="zone in filteredRiskZones" :key="zone.name" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ zone.name }}</td>
                  <td class="px-4 py-3">
                    <span :class="zone.risk === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : zone.risk === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ zone.risk === 'high' ? 'Haut' : zone.risk === 'medium' ? 'Moyen' : 'Faible' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ zone.failureRate }}%</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ zone.returnRate }}%</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ zone.affectedShipments }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ zone.mainReason }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </template>

      <!-- Analytics Section - Détection d'Anomalies -->
      <template v-if="activeSection === 'anomaly-detection'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Détection d'Anomalies</h1>
              <p class="text-sm text-gray-500 mt-1">Surveillance automatique des patterns inhabituels</p>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Anomaly Overview -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ anomalyDetection.criticalAnomalies }}</p>
                  <p class="text-sm text-gray-500">Critiques</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ anomalyDetection.warningAnomalies }}</p>
                  <p class="text-sm text-gray-500">Avertissements</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Activity class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ anomalyDetection.infoAnomalies }}</p>
                  <p class="text-sm text-gray-500">Informations</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ anomalyDetection.resolvedAnomalies }}</p>
                  <p class="text-sm text-gray-500">Résolues</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Anomalies -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Anomalies Actives</h3>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-800">
              <div v-for="anomaly in anomalyDetection.activeAnomalies" :key="anomaly.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-3">
                    <div :class="anomaly.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : anomaly.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'" class="p-2 rounded-lg">
                      <AlertCircle :class="anomaly.severity === 'critical' ? 'text-red-600' : anomaly.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'" class="w-5 h-5" />
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 dark:text-white">{{ anomaly.title }}</h4>
                      <p class="text-sm text-gray-500 mt-1">{{ anomaly.description }}</p>
                      <div class="flex items-center space-x-4 mt-2">
                        <span class="text-xs text-gray-400">{{ anomaly.detectedAt }}</span>
                        <span class="text-xs text-gray-400">{{ anomaly.affectedItems }} éléments affectés</span>
                      </div>
                    </div>
                  </div>
                  <button class="px-3 py-1.5 text-sm font-medium text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    Investiguer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Analytics Section - Tendances -->
      <template v-if="activeSection === 'trends'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Tendances</h1>
              <p class="text-sm text-gray-500 mt-1">Analysez les tendances et prévisions</p>
            </div>
            <div class="flex items-center space-x-3">
              <select v-model="trendsPeriod" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
              </select>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Trend Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Volume de Colis</h3>
              <div class="h-48 flex items-end space-x-2">
                <div v-for="(value, index) in trends.volumeTrend" :key="index" class="flex-1 flex flex-col items-center">
                  <div class="w-full bg-blue-500 rounded-t transition-all duration-300" :style="{ height: (value / Math.max(...trends.volumeTrend) * 100) + '%' }"></div>
                  <span class="text-xs text-gray-500 mt-2">{{ trends.labels[index] }}</span>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between text-sm">
                <span class="text-gray-500">Prévision prochaine période:</span>
                <span class="font-semibold text-blue-600">+{{ trends.volumeForecast }}%</span>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Taux de Livraison</h3>
              <div class="h-48 flex items-end space-x-2">
                <div v-for="(value, index) in trends.deliveryRateTrend" :key="index" class="flex-1 flex flex-col items-center">
                  <div class="w-full bg-green-500 rounded-t transition-all duration-300" :style="{ height: value + '%' }"></div>
                  <span class="text-xs text-gray-500 mt-2">{{ trends.labels[index] }}</span>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between text-sm">
                <span class="text-gray-500">Prévision prochaine période:</span>
                <span class="font-semibold text-green-600">{{ trends.deliveryForecast }}%</span>
              </div>
            </div>
          </div>

          <!-- Key Insights -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Insights Clés</h3>
            </div>
            <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="insight in trends.insights" :key="insight.title" class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div class="flex items-center space-x-2 mb-2">
                  <TrendingUp v-if="insight.trend === 'up'" class="w-4 h-4 text-green-600" />
                  <TrendingDown v-else class="w-4 h-4 text-red-600" />
                  <span class="font-medium text-gray-900 dark:text-white">{{ insight.title }}</span>
                </div>
                <p class="text-sm text-gray-500">{{ insight.description }}</p>
                <p class="text-xs text-gray-400 mt-2">{{ insight.period }}</p>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Analytics Section - Rapports -->
      <template v-if="activeSection === 'reports'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Rapports</h1>
              <p class="text-sm text-gray-500 mt-1">Générez et téléchargez des rapports détaillés</p>
            </div>
            <button class="btn-primary btn-primary-sm">
              <Plus class="w-4 h-4 mr-2" />
              Nouveau Rapport
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Report Templates -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Modèles de Rapports</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div v-for="template in reports.templates" :key="template.id" class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-600 transition-colors cursor-pointer">
                <div class="p-2 rounded-lg inline-block mb-3" :class="template.bgColor">
                  <component :is="template.icon" class="w-5 h-5" :class="template.iconColor" />
                </div>
                <h4 class="font-medium text-gray-900 dark:text-white">{{ template.name }}</h4>
                <p class="text-sm text-gray-500 mt-1">{{ template.description }}</p>
                <button class="mt-3 text-sm font-medium text-primary-blue hover:text-primary-blue-hover transition-colors">
                  Générer →
                </button>
              </div>
            </div>
          </div>

          <!-- Recent Reports -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Rapports Récents</h3>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nom</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Période</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Généré le</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taille</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-for="report in reports.recentReports" :key="report.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ report.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ report.type }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ report.period }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ report.generatedAt }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ report.size }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center space-x-2">
                      <button class="p-1.5 text-gray-500 hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                        <Eye class="w-4 h-4" />
                      </button>
                      <button class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                        <Download class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </template>

      <!-- Pickups Section -->
      <template v-if="activeSection === 'schedule-pickup' || activeSection === 'pickup-requests' || activeSection === 'pickup-history' || activeSection === 'failed-pickups' || activeSection === 'pickup-performance'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Enlèvements</h1>
              <p class="text-sm text-gray-500 mt-1">Gérez vos demandes d'enlèvement pour les colis en attente</p>
            </div>
            <button
              @click="requestPickup"
              :disabled="selectedPickups.length === 0"
              :class="[
                'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedPickups.length > 0
                  ? 'bg-primary-blue hover:bg-primary-blue-hover text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              ]"
            >
              <PackageOpen class="w-4 h-4" />
              <span>Demander un enlèvement ({{ selectedPickups.length }})</span>
            </button>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ pendingPickups.length }}</p>
                  <p class="text-sm text-gray-500">En attente d'enlèvement</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Truck class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ scheduledPickups.length }}</p>
                  <p class="text-sm text-gray-500">Enlèvements programmés</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Check class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ completedPickupsCount }}</p>
                  <p class="text-sm text-gray-500">Enlèvements terminés (ce mois)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Pickups List -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-white">Colis en attente d'enlèvement</h3>
                <button
                  @click="selectAllPickups"
                  class="text-sm text-orange-500 hover:underline"
                >
                  {{ selectedPickups.length === pendingPickups.length && pendingPickups.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner' }}
                </button>
              </div>
            </div>

            <div v-if="pendingPickups.length === 0" class="p-8 text-center">
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package class="w-8 h-8 text-gray-400" />
              </div>
              <p class="text-gray-500 dark:text-gray-400">Aucune colis en attente d'enlèvement</p>
              <p class="text-sm text-gray-400 mt-1">Les nouvelles colis créés apparaîtront ici</p>
            </div>

            <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
              <div
                v-for="shipment in pendingPickups"
                :key="shipment.id"
                class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div class="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    :checked="selectedPickups.includes(shipment.id)"
                    @change="togglePickupSelection(shipment.id)"
                    class="mt-1 w-5 h-5 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                  />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <span class="font-mono font-semibold text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                        <span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">En attente</span>
                      </div>
                      <span class="text-sm text-gray-500">{{ shipment.carrier }}</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p class="text-gray-500">Client</p>
                        <p class="text-gray-900 dark:text-white font-medium">{{ shipment.customerName }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Origine</p>
                        <p class="text-gray-900 dark:text-white">{{ shipment.origin }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Destination</p>
                        <p class="text-gray-900 dark:text-white">{{ shipment.destination }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Date de création</p>
                        <p class="text-gray-900 dark:text-white">{{ shipment.events[shipment.events.length - 1]?.date || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scheduled Pickups -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mt-6" v-if="scheduledPickups.length > 0">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Enlèvements programmés</h3>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-800">
              <div
                v-for="pickup in scheduledPickups"
                :key="pickup.id"
                class="p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Truck class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ pickup.shipmentCount }} colis</p>
                      <p class="text-sm text-gray-500">{{ pickup.date }} • {{ pickup.timeSlot }}</p>
                    </div>
                  </div>
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">Programmé</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Bordereaux (Labels) Section -->
      <template v-if="activeSection === 'labels'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Bordereaux</h1>
              <p class="text-sm text-gray-500 mt-1">Gérez et imprimez vos étiquettes d'envoi</p>
            </div>
            <div class="flex items-center space-x-3">
              <button
                @click="printSelectedLabels"
                :disabled="selectedLabels.length === 0"
                :class="[
                  'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedLabels.length > 0
                    ? 'bg-primary-blue hover:bg-primary-blue-hover text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                ]"
              >
                <Printer class="w-4 h-4" />
                <span>Imprimer ({{ selectedLabels.length }})</span>
              </button>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ shipments.length }}</p>
                  <p class="text-sm text-gray-500">Total bordereaux</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Printer class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ printedLabelsCount }}</p>
                  <p class="text-sm text-gray-500">Imprimés</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ unprintedLabelsCount }}</p>
                  <p class="text-sm text-gray-500">À imprimer</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Banknote class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ totalCOD.toLocaleString() }} TND</p>
                  <p class="text-sm text-gray-500">Total COD</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <div class="p-4 flex items-center space-x-4">
              <div class="flex-1 relative">
                <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  v-model="labelSearchQuery"
                  type="text"
                  placeholder="Rechercher par N° bordereau, client, téléphone..."
                  class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <select
                v-model="labelFilterPrinted"
                class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="all">Tous les bordereaux</option>
                <option value="printed">Imprimés</option>
                <option value="unprinted">Non imprimés</option>
              </select>
              <button
                @click="selectAllLabels"
                class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {{ selectedLabels.length === filteredLabels.length && filteredLabels.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner' }}
              </button>
            </div>
          </div>

          <!-- Labels Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="shipment in filteredLabels"
              :key="shipment.id"
              :class="[
                'bg-white dark:bg-gray-900 rounded-xl border-2 p-4 transition-all cursor-pointer hover:shadow-lg',
                selectedLabels.includes(shipment.id) ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-200 dark:border-gray-800'
              ]"
              @click="toggleLabelSelection(shipment.id)"
            >
              <!-- Label Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    :checked="selectedLabels.includes(shipment.id)"
                    @click.stop
                    @change="toggleLabelSelection(shipment.id)"
                    class="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                  />
                  <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ shipment.labelNumber }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    :class="[
                      'px-2 py-0.5 text-xs rounded font-medium',
                      shipment.labelPrinted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    ]"
                  >
                    {{ shipment.labelPrinted ? 'Imprimé' : 'À imprimer' }}
                  </span>
                  <button
                    @click.stop="openLabelPreview(shipment)"
                    class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <Printer class="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <!-- Carrier Badge -->
              <div class="flex items-center space-x-2 mb-3">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded font-medium">
                  {{ shipment.carrier }}
                </span>
                <span v-if="shipment.fragile" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                  Fragile
                </span>
              </div>

              <!-- Recipient Info -->
              <div class="space-y-2 text-sm">
                <div class="flex items-start space-x-2">
                  <User class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ shipment.customerName }}</p>
                    <p class="text-gray-500">{{ shipment.recipientPhone }}</p>
                  </div>
                </div>
                <div class="flex items-start space-x-2">
                  <MapPin class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p class="text-gray-600 dark:text-gray-400 line-clamp-2">{{ shipment.recipientAddress }}</p>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{{ shipment.weight }} kg</span>
                  <span>{{ shipment.dimensions }} cm</span>
                </div>
                <span class="font-semibold text-orange-600">{{ shipment.cod?.toLocaleString() }} TND</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredLabels.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-gray-500 dark:text-gray-400">Aucun bordereau trouvé</p>
          </div>
        </main>
      </template>

      <!-- Returns Section -->
      <template v-if="activeSection === 'active-returns' || activeSection === 'recovered-returns' || activeSection === 'lost-returns'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ returnsSectionTitle }}</h1>
              <p class="text-sm text-gray-500 mt-1">
                {{ activeSection === 'lost-returns' ? 'Colis déclarés perdus par les transporteurs' :
                   activeSection === 'recovered-returns' ? 'Colis retournés et récupérés avec succès' :
                   activeSection === 'active-returns' ? 'Colis en cours de retour vers votre entrepôt' :
                   'Suivez les retours signalés par vos transporteurs' }}
              </p>
            </div>
            <div class="flex items-center space-x-3">
              <!-- Sync Status -->
              <div class="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span class="text-xs font-medium text-green-700 dark:text-green-400">Synchronisé avec transporteurs</span>
              </div>
              <button @click="syncReturns" class="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isSyncingReturns }" />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          <!-- Active Returns Stats (only for active-returns) -->
          <div v-if="activeSection === 'active-returns'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div @click="activeReturnsFilter = 'all'"
              :class="['bg-white dark:bg-gray-900 rounded-xl border p-4 cursor-pointer transition-all',
                activeReturnsFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300']">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <RotateCcw class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeReturnsStats.total }}</p>
                    <p class="text-sm text-gray-500">Tous les retours actifs</p>
                  </div>
                </div>
              </div>
            </div>
            <div @click="activeReturnsFilter = 'on-time'"
              :class="['bg-white dark:bg-gray-900 rounded-xl border p-4 cursor-pointer transition-all',
                activeReturnsFilter === 'on-time' ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300']">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Clock class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-green-600">{{ activeReturnsStats.onTime }}</p>
                    <p class="text-sm text-gray-500">À l'heure</p>
                  </div>
                </div>
                <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  {{ activeReturnsStats.onTimePercent }}%
                </span>
              </div>
            </div>
            <div @click="activeReturnsFilter = 'delayed'"
              :class="['bg-white dark:bg-gray-900 rounded-xl border p-4 cursor-pointer transition-all',
                activeReturnsFilter === 'delayed' ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300']">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertTriangle class="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-red-600">{{ activeReturnsStats.delayed }}</p>
                    <p class="text-sm text-gray-500">En retard</p>
                  </div>
                </div>
                <span class="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                  {{ activeReturnsStats.delayedPercent }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Delayed Alert Banner (only for active-returns with delayed filter) -->
          <div v-if="activeSection === 'active-returns' && activeReturnsStats.delayed > 0 && activeReturnsFilter !== 'on-time'"
            class="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div class="flex items-start space-x-3">
              <AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-red-800 dark:text-red-300">{{ activeReturnsStats.delayed }} retour(s) en retard</p>
                <p class="text-sm text-red-600 dark:text-red-400 mt-1">
                  Ces colis ont dépassé le délai de retour estimé. Contactez le transporteur pour plus d'informations.
                </p>
              </div>
            </div>
          </div>

          <!-- Returns List with Cards -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ returnsSectionTitle }}</h3>
                  <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                    :class="activeSection === 'lost-returns' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            activeSection === 'recovered-returns' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            activeReturnsFilter === 'delayed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            activeReturnsFilter === 'on-time' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                    {{ filteredReturns.length }} colis
                  </span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="relative">
                    <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Rechercher..." class="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white w-48 focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                  <select class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <option value="all">Tous les transporteurs</option>
                    <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.name">{{ carrier.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Returns Cards -->
            <div v-if="filteredReturns.length > 0" class="p-4 space-y-3">
              <div v-for="ret in filteredReturns" :key="ret.id"
                :class="[
                  'group rounded-xl p-4 transition-all cursor-pointer',
                  ret.isDelayed && activeSection === 'active-returns'
                    ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                ]">
                <div class="flex items-start justify-between">
                  <!-- Left: Main Info -->
                  <div class="flex items-start space-x-4">
                    <!-- Status Icon -->
                    <div class="flex-shrink-0 relative">
                      <div :class="[
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        ret.status === 'Perdu' ? 'bg-red-100 dark:bg-red-900/30' :
                        ret.status === 'Récupéré' ? 'bg-green-100 dark:bg-green-900/30' :
                        ret.isDelayed ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      ]">
                        <PackageX v-if="ret.status === 'Perdu'" class="w-6 h-6 text-red-600" />
                        <PackageCheck v-else-if="ret.status === 'Récupéré'" class="w-6 h-6 text-green-600" />
                        <AlertTriangle v-else-if="ret.isDelayed" class="w-6 h-6 text-red-600" />
                        <Truck v-else class="w-6 h-6 text-blue-600" />
                      </div>
                      <!-- Delay indicator badge -->
                      <div v-if="ret.isDelayed && ret.status === 'En transit'" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span class="text-[10px] font-bold text-white">!</span>
                      </div>
                    </div>
                    <!-- Details -->
                    <div>
                      <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                        <p class="font-semibold text-gray-900 dark:text-white">{{ ret.trackingNumber }}</p>
                        <span :class="[
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          ret.status === 'Perdu' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          ret.status === 'Récupéré' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        ]">
                          {{ ret.status }}
                        </span>
                        <!-- Delay badge for active returns -->
                        <span v-if="ret.status === 'En transit' && ret.isDelayed" class="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          En retard +{{ ret.daysDelayed }}j
                        </span>
                        <span v-else-if="ret.status === 'En transit' && !ret.isDelayed" class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          À l'heure
                        </span>
                      </div>
                      <p class="text-sm text-gray-500 mt-0.5">Commande: {{ ret.originalOrder }}</p>
                      <div class="flex items-center space-x-4 mt-2 flex-wrap gap-y-1">
                        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <User class="w-4 h-4 mr-1.5" />
                          {{ ret.customerName }}
                        </div>
                        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin class="w-4 h-4 mr-1.5" />
                          {{ ret.destination }}
                        </div>
                        <!-- Expected arrival for active returns -->
                        <div v-if="ret.status === 'En transit' && ret.expectedArrival"
                          :class="['flex items-center text-sm', ret.isDelayed ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400']">
                          <Calendar class="w-4 h-4 mr-1.5" />
                          {{ ret.isDelayed ? 'Attendu le' : 'Arrivée prévue' }}: {{ ret.expectedArrival }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right: Value & Actions -->
                  <div class="text-right">
                    <p :class="[
                      'text-lg font-bold',
                      ret.status === 'Perdu' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                    ]">
                      {{ ret.value }} DT
                    </p>
                    <p class="text-xs text-gray-500 mt-1">{{ ret.returnDate }}</p>
                  </div>
                </div>

                <!-- Carrier & Reason Section -->
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <!-- Carrier Info -->
                    <div class="flex items-center space-x-3">
                      <div :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        ret.carrier === 'Yalidine' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        ret.carrier === 'ZR Express' ? 'bg-green-100 dark:bg-green-900/30' :
                        ret.carrier === 'Maystro' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        ret.carrier === 'Ecotrack' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      ]">
                        <Building2 :class="[
                          'w-5 h-5',
                          ret.carrier === 'Yalidine' ? 'text-blue-600' :
                          ret.carrier === 'ZR Express' ? 'text-green-600' :
                          ret.carrier === 'Maystro' ? 'text-purple-600' :
                          ret.carrier === 'Ecotrack' ? 'text-orange-600' :
                          'text-gray-500'
                        ]" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white text-sm">{{ ret.carrier }}</p>
                        <p class="text-xs text-gray-500">Transporteur</p>
                      </div>
                    </div>
                    <!-- Reason Badge -->
                    <div class="flex items-center space-x-2">
                      <span :class="[
                        'px-3 py-1.5 text-xs font-medium rounded-lg',
                        ret.reason === 'Refus client' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        ret.reason === 'Client absent' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        ret.reason === 'Adresse incorrecte' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        ret.reason === 'Colis endommagé' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      ]">
                        {{ ret.reason }}
                      </span>
                      <button class="text-sm text-orange-600 hover:text-orange-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Détails →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-16 text-center">
              <div :class="[
                'w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center',
                activeSection === 'lost-returns' ? 'bg-red-100 dark:bg-red-900/20' :
                activeSection === 'recovered-returns' ? 'bg-green-100 dark:bg-green-900/20' :
                'bg-blue-100 dark:bg-blue-900/20'
              ]">
                <PackageX v-if="activeSection === 'lost-returns'" class="w-10 h-10 text-red-400" />
                <PackageCheck v-else-if="activeSection === 'recovered-returns'" class="w-10 h-10 text-green-400" />
                <RotateCcw v-else class="w-10 h-10 text-blue-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ activeSection === 'lost-returns' ? 'Aucun colis perdu' :
                   activeSection === 'recovered-returns' ? 'Aucun colis récupéré' :
                   'Aucun retour en cours' }}
              </h3>
              <p class="text-gray-500 max-w-sm mx-auto">
                {{ activeSection === 'lost-returns' ? 'Bonne nouvelle ! Aucun de vos colis n\'a été déclaré perdu par les transporteurs.' :
                   activeSection === 'recovered-returns' ? 'Les colis retournés avec succès apparaîtront ici une fois récupérés.' :
                   'Tous vos colis ont été livrés avec succès. Les retours apparaîtront ici automatiquement.' }}
              </p>
            </div>
          </div>

          <!-- Insights Section (for active-returns only) -->
          <div v-if="activeSection === 'active-returns'" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Return Reasons Breakdown -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-4">Raisons des retours</h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <div class="w-32 text-sm text-gray-600 dark:text-gray-400">Client absent</div>
                  <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
                    <div class="h-full bg-orange-500 rounded-full" style="width: 45%"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                </div>
                <div class="flex items-center">
                  <div class="w-32 text-sm text-gray-600 dark:text-gray-400">Refus client</div>
                  <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
                    <div class="h-full bg-yellow-500 rounded-full" style="width: 30%"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">30%</span>
                </div>
                <div class="flex items-center">
                  <div class="w-32 text-sm text-gray-600 dark:text-gray-400">Adresse incorrecte</div>
                  <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
                    <div class="h-full bg-purple-500 rounded-full" style="width: 15%"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">15%</span>
                </div>
                <div class="flex items-center">
                  <div class="w-32 text-sm text-gray-600 dark:text-gray-400">Injoignable</div>
                  <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-3">
                    <div class="h-full bg-gray-500 rounded-full" style="width: 10%"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">10%</span>
                </div>
              </div>
            </div>

            <!-- Tips to Reduce Returns -->
            <div class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 p-6">
              <div class="flex items-start space-x-3">
                <div class="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <Lightbulb class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-orange-900 dark:text-orange-300 mb-2">Conseils pour réduire les retours</h4>
                  <ul class="text-sm text-orange-700 dark:text-orange-400 space-y-2">
                    <li class="flex items-start">
                      <CheckCircle class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Confirmez les commandes par téléphone avant expédition</span>
                    </li>
                    <li class="flex items-start">
                      <CheckCircle class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Vérifiez les adresses avec les clients</span>
                    </li>
                    <li class="flex items-start">
                      <CheckCircle class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Proposez des créneaux de livraison flexibles</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Return Value Statistics Section -->
      <template v-if="activeSection === 'return-value'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Valeur des retours</h1>
              <p class="text-sm text-gray-500 mt-1">Statistiques et détails par entreprise de livraison</p>
            </div>
            <div class="flex items-center space-x-3">
              <select class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              <button class="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                <Download class="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          <!-- Global Summary -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <RotateCcw class="w-5 h-5 text-blue-600" />
                </div>
                <span class="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">Total</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ returnsData.total }}</p>
              <p class="text-sm text-gray-500 mt-1">Retours ce mois</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign class="w-5 h-5 text-green-600" />
                </div>
                <span class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Récupéré</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ returnsData.recoveredValue }} DT</p>
              <p class="text-sm text-gray-500 mt-1">Valeur récupérée</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between">
                <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Clock class="w-5 h-5 text-orange-600" />
                </div>
                <span class="text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">En transit</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ returnsData.pendingValue }} DT</p>
              <p class="text-sm text-gray-500 mt-1">Valeur en transit</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle class="w-5 h-5 text-red-600" />
                </div>
                <span class="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">Perdu</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-3">{{ returnsData.lostValue }} DT</p>
              <p class="text-sm text-gray-500 mt-1">Valeur perdue</p>
            </div>
          </div>

          <!-- Statistics per Carrier -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Détails par transporteur</h3>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-800">
              <div v-for="carrier in carriersReturnStats" :key="carrier.name" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <!-- Carrier Header -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Building2 class="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h4>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-sm text-gray-500">{{ carrier.totalReturns }} retours</span>
                        <span class="text-gray-300 dark:text-gray-600">•</span>
                        <span :class="carrier.returnRate > 10 ? 'text-red-600' : carrier.returnRate > 5 ? 'text-orange-600' : 'text-green-600'" class="text-sm font-medium">
                          {{ carrier.returnRate }}% taux de retour
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold text-gray-900 dark:text-white">{{ carrier.totalValue }} DT</p>
                    <p class="text-sm text-gray-500">Valeur totale des retours</p>
                  </div>
                </div>

                <!-- Carrier Stats Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div class="flex items-center space-x-2">
                      <PackageCheck class="w-4 h-4 text-green-600" />
                      <span class="text-xs font-medium text-green-700 dark:text-green-400">Récupérés</span>
                    </div>
                    <p class="text-lg font-bold text-green-700 dark:text-green-400 mt-1">{{ carrier.recovered }}</p>
                    <p class="text-xs text-green-600 dark:text-green-500">{{ carrier.recoveredValue }} DT</p>
                  </div>
                  <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div class="flex items-center space-x-2">
                      <Truck class="w-4 h-4 text-blue-600" />
                      <span class="text-xs font-medium text-blue-700 dark:text-blue-400">En transit</span>
                    </div>
                    <p class="text-lg font-bold text-blue-700 dark:text-blue-400 mt-1">{{ carrier.inTransit }}</p>
                    <p class="text-xs text-blue-600 dark:text-blue-500">{{ carrier.inTransitValue }} DT</p>
                  </div>
                  <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <div class="flex items-center space-x-2">
                      <PackageX class="w-4 h-4 text-red-600" />
                      <span class="text-xs font-medium text-red-700 dark:text-red-400">Perdus</span>
                    </div>
                    <p class="text-lg font-bold text-red-700 dark:text-red-400 mt-1">{{ carrier.lost }}</p>
                    <p class="text-xs text-red-600 dark:text-red-500">{{ carrier.lostValue }} DT</p>
                  </div>
                  <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                    <div class="flex items-center space-x-2">
                      <Receipt class="w-4 h-4 text-purple-600" />
                      <span class="text-xs font-medium text-purple-700 dark:text-purple-400">Frais retour</span>
                    </div>
                    <p class="text-lg font-bold text-purple-700 dark:text-purple-400 mt-1">{{ carrier.returnFees }} DT</p>
                    <p class="text-xs text-purple-600 dark:text-purple-500">Coût total</p>
                  </div>
                </div>

                <!-- Carrier Return Reasons -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p class="text-xs font-medium text-gray-500 mb-3">Raisons des retours</p>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(count, reason) in carrier.reasons" :key="reason"
                      :class="[
                        'px-3 py-1.5 text-xs font-medium rounded-full',
                        reason === 'Refus client' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        reason === 'Client absent' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        reason === 'Adresse incorrecte' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        reason === 'Colis endommagé' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      ]">
                      {{ reason }}: {{ count }}
                    </span>
                  </div>
                </div>

                <!-- Performance indicator -->
                <div class="mt-4 flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">Délai moyen de retour:</span>
                      <span class="text-xs font-semibold text-gray-900 dark:text-white">{{ carrier.avgReturnDays }} jours</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">Taux récupération:</span>
                      <span :class="carrier.recoveryRate >= 90 ? 'text-green-600' : carrier.recoveryRate >= 70 ? 'text-orange-600' : 'text-red-600'" class="text-xs font-semibold">
                        {{ carrier.recoveryRate }}%
                      </span>
                    </div>
                  </div>
                  <button class="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    Voir tous les retours →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Trend Chart Placeholder -->
          <div class="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Évolution des retours</h3>
            <div class="h-48 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <div class="text-center">
                <BarChart3 class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p class="text-sm text-gray-500">Graphique d'évolution mensuelle</p>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Return Reports & Analytics Section -->
      <template v-if="activeSection === 'return-reports'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Rapports & Analyse des retours</h1>
              <p class="text-sm text-gray-500 mt-1">Comprenez les raisons des retours et prenez de meilleures décisions</p>
            </div>
            <div class="flex items-center space-x-3">
              <select v-model="reportPeriod" class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              <button class="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                <Download class="w-4 h-4" />
                <span>Télécharger PDF</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          <!-- Key Insights Alert -->
          <div class="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
            <div class="flex items-start space-x-4">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <Lightbulb class="w-6 h-6 text-amber-600" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-amber-900 dark:text-amber-300">Insight Principal</h3>
                <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  <strong>45% de vos retours</strong> sont dus à des clients absents. Considérez de contacter les clients via WhatsApp avant livraison ou proposer des créneaux de livraison flexibles pour réduire ce taux.
                </p>
              </div>
            </div>
          </div>

          <!-- Return Reasons Analysis -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Reasons Breakdown -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-semibold text-gray-900 dark:text-white">Raisons des retours</h3>
                <span class="text-sm text-gray-500">{{ reportAnalytics.totalReturns }} retours analysés</span>
              </div>
              <div class="space-y-4">
                <div v-for="reason in reportAnalytics.reasonsBreakdown" :key="reason.name" class="group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3">
                      <div :class="[
                        'w-3 h-3 rounded-full',
                        reason.name === 'Client absent' ? 'bg-orange-500' :
                        reason.name === 'Refus client' ? 'bg-yellow-500' :
                        reason.name === 'Adresse incorrecte' ? 'bg-purple-500' :
                        reason.name === 'Colis endommagé' ? 'bg-red-500' :
                        reason.name === 'Hors zone' ? 'bg-blue-500' :
                        'bg-gray-400'
                      ]"></div>
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ reason.name }}</span>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="text-sm text-gray-500">{{ reason.count }} colis</span>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ reason.percentage }}%</span>
                    </div>
                  </div>
                  <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div :class="[
                      'h-full rounded-full transition-all',
                      reason.name === 'Client absent' ? 'bg-orange-500' :
                      reason.name === 'Refus client' ? 'bg-yellow-500' :
                      reason.name === 'Adresse incorrecte' ? 'bg-purple-500' :
                      reason.name === 'Colis endommagé' ? 'bg-red-500' :
                      reason.name === 'Hors zone' ? 'bg-blue-500' :
                      'bg-gray-400'
                    ]" :style="{ width: reason.percentage + '%' }"></div>
                  </div>
                  <!-- Action suggestion -->
                  <p class="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    💡 {{ reason.suggestion }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Delivery Attempts Analysis -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-semibold text-gray-900 dark:text-white">Tentatives de livraison</h3>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-500">Moyenne:</span>
                  <span class="text-sm font-bold text-gray-900 dark:text-white">{{ reportAnalytics.avgAttempts }} tentatives</span>
                </div>
              </div>
              <div class="space-y-4">
                <div v-for="attempt in reportAnalytics.attemptsBreakdown" :key="attempt.attempts" class="flex items-center">
                  <div class="w-24 flex-shrink-0">
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ attempt.label }}</span>
                  </div>
                  <div class="flex-1 mx-4">
                    <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                      <div :class="[
                        'h-full rounded-lg flex items-center justify-end pr-2',
                        attempt.attempts === 1 ? 'bg-green-500' :
                        attempt.attempts === 2 ? 'bg-yellow-500' :
                        attempt.attempts === 3 ? 'bg-orange-500' :
                        'bg-red-500'
                      ]" :style="{ width: attempt.percentage + '%' }">
                        <span v-if="attempt.percentage > 15" class="text-xs font-medium text-white">{{ attempt.count }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="w-16 text-right">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ attempt.percentage }}%</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p class="text-xs text-red-700 dark:text-red-400">
                  <AlertTriangle class="w-3 h-3 inline mr-1" />
                  <strong>{{ reportAnalytics.multipleAttemptsCost }} DT</strong> de frais supplémentaires dus aux tentatives multiples ce mois
                </p>
              </div>
            </div>
          </div>

          <!-- Carrier Comparison -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Comparaison des transporteurs</h3>
                <p class="text-sm text-gray-500 mt-1">Analysez la performance de vos transporteurs pour les retours</p>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Transporteur</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Taux retour</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tentatives moy.</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Taux récup.</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Délai retour</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Score</th>
                    <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Recommandation</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="carrier in reportAnalytics.carrierComparison" :key="carrier.name" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="py-4 px-4">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Building2 class="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
                          <p class="text-xs text-gray-500">{{ carrier.totalShipments }} expéditions</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-4 text-center">
                      <span :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        carrier.returnRate <= 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        carrier.returnRate <= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      ]">
                        {{ carrier.returnRate }}%
                      </span>
                    </td>
                    <td class="py-4 px-4 text-center">
                      <span :class="carrier.avgAttempts <= 1.5 ? 'text-green-600' : carrier.avgAttempts <= 2 ? 'text-yellow-600' : 'text-red-600'" class="font-semibold">
                        {{ carrier.avgAttempts }}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-center">
                      <span :class="carrier.recoveryRate >= 90 ? 'text-green-600' : carrier.recoveryRate >= 80 ? 'text-yellow-600' : 'text-red-600'" class="font-semibold">
                        {{ carrier.recoveryRate }}%
                      </span>
                    </td>
                    <td class="py-4 px-4 text-center">
                      <span class="text-gray-700 dark:text-gray-300">{{ carrier.avgReturnDays }} jours</span>
                    </td>
                    <td class="py-4 px-4 text-center">
                      <div class="flex items-center justify-center space-x-1">
                        <div :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          carrier.score >= 8 ? 'bg-green-100 text-green-700' :
                          carrier.score >= 6 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        ]">
                          {{ carrier.score }}
                        </div>
                        <span class="text-xs text-gray-400">/10</span>
                      </div>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <span :class="[
                        'px-3 py-1.5 text-xs font-medium rounded-lg',
                        carrier.recommendation === 'Excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        carrier.recommendation === 'Bon' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        carrier.recommendation === 'À surveiller' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      ]">
                        {{ carrier.recommendation }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Actionable Recommendations -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Product Issues -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Package class="w-5 h-5 text-purple-600" />
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Problèmes liés aux produits</h3>
              </div>
              <div class="space-y-3">
                <div v-for="issue in reportAnalytics.productIssues" :key="issue.product" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">{{ issue.product }}</p>
                    <p class="text-xs text-gray-500">{{ issue.returns }} retours ({{ issue.returnRate }}% taux retour)</p>
                  </div>
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    issue.reason === 'Qualité' ? 'bg-red-100 text-red-700' :
                    issue.reason === 'Taille' ? 'bg-purple-100 text-purple-700' :
                    issue.reason === 'Couleur' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  ]">
                    {{ issue.reason }}
                  </span>
                </div>
              </div>
              <div class="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p class="text-xs text-purple-700 dark:text-purple-400">
                  💡 <strong>Suggestion:</strong> Améliorez les photos et descriptions de vos produits les plus retournés
                </p>
              </div>
            </div>

            <!-- Geographic Issues -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MapPin class="w-5 h-5 text-blue-600" />
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Zones problématiques</h3>
              </div>
              <div class="space-y-3">
                <div v-for="zone in reportAnalytics.problematicZones" :key="zone.region" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">{{ zone.region }}</p>
                    <p class="text-xs text-gray-500">{{ zone.returns }} retours sur {{ zone.total }} envois</p>
                  </div>
                  <span :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    zone.returnRate > 15 ? 'bg-red-100 text-red-700' :
                    zone.returnRate > 10 ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  ]">
                    {{ zone.returnRate }}%
                  </span>
                </div>
              </div>
              <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-xs text-blue-700 dark:text-blue-400">
                  💡 <strong>Suggestion:</strong> Envisagez un autre transporteur pour ces zones ou confirmez les adresses par téléphone
                </p>
              </div>
            </div>
          </div>

          <!-- Decision Helper -->
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white">
            <div class="flex items-center space-x-3 mb-6">
              <div class="p-2 bg-white/10 rounded-lg">
                <Target class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-semibold text-lg">Aide à la décision</h3>
                <p class="text-sm text-gray-400">Recommandations basées sur vos données</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Change Carrier -->
              <div class="bg-white/10 rounded-xl p-4">
                <div class="flex items-center space-x-2 mb-3">
                  <Building2 class="w-5 h-5 text-orange-400" />
                  <h4 class="font-medium">Transporteurs</h4>
                </div>
                <p class="text-sm text-gray-300 mb-3">
                  {{ reportAnalytics.carrierAdvice }}
                </p>
                <span class="text-xs text-orange-400 font-medium">Impact estimé: -{{ reportAnalytics.carrierImpact }}% retours</span>
              </div>
              <!-- Improve Products -->
              <div class="bg-white/10 rounded-xl p-4">
                <div class="flex items-center space-x-2 mb-3">
                  <Package class="w-5 h-5 text-purple-400" />
                  <h4 class="font-medium">Produits</h4>
                </div>
                <p class="text-sm text-gray-300 mb-3">
                  {{ reportAnalytics.productAdvice }}
                </p>
                <span class="text-xs text-purple-400 font-medium">Impact estimé: -{{ reportAnalytics.productImpact }}% retours</span>
              </div>
              <!-- Process Improvement -->
              <div class="bg-white/10 rounded-xl p-4">
                <div class="flex items-center space-x-2 mb-3">
                  <Phone class="w-5 h-5 text-green-400" />
                  <h4 class="font-medium">Processus</h4>
                </div>
                <p class="text-sm text-gray-300 mb-3">
                  {{ reportAnalytics.processAdvice }}
                </p>
                <span class="text-xs text-green-400 font-medium">Impact estimé: -{{ reportAnalytics.processImpact }}% retours</span>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Carriers Section -->
      <template v-if="activeSection === 'connected-carriers' || activeSection === 'add-carrier' || activeSection === 'api-status' || activeSection === 'carrier-performance' || activeSection === 'sla-metrics' || activeSection === 'carrier-issues'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Transporteurs</h1>
              <p class="text-sm text-gray-500 mt-1">Gérez vos partenaires de livraison et leurs tarifs</p>
            </div>
            <button @click="openAddCarrierModal" class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium transition-colors">
              <Plus class="w-4 h-4" />
              <span>Ajouter un transporteur</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Carrier Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <div v-for="carrier in carriers" :key="carrier.id" @click="selectCarrier(carrier)" class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all cursor-pointer" :class="{ 'ring-2 ring-orange-500': selectedCarrier?.id === carrier.id }">
              <div class="flex items-center justify-between mb-3">
                <span class="font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</span>
                <div class="flex items-center space-x-2">
                  <span :class="carrier.apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></span>
                  <span class="text-xs" :class="carrier.apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'">{{ carrier.apiStatus === 'connected' ? 'Connecté' : 'Déconnecté' }}</span>
                </div>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">API ID</span>
                  <span class="font-mono text-xs text-gray-900 dark:text-white">{{ carrier.apiId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Colis</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ carrier.shipments }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Taux livraison</span>
                  <span class="font-medium text-green-600">{{ carrier.deliveryRate }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Frais livraison</span>
                  <span class="font-medium text-orange-600">{{ carrier.fraisColisLivres.toFixed(2) }} DT</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">Couverture</span>
                  <span v-if="carrier.allRegions" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Tout le pays
                  </span>
                  <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    {{ carrier.regions.length }} région(s)
                  </span>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-2">
                <button @click.stop="editCarrier(carrier)" class="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors">
                  <FileText class="w-4 h-4" />
                </button>
                <button @click.stop="deleteCarrier(carrier.id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Selected Carrier Details -->
          <div v-if="selectedCarrier" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Building2 class="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ selectedCarrier.name }}</h3>
                    <p class="text-sm text-gray-500">Détails et tarification</p>
                  </div>
                </div>
                <button @click="editCarrier(selectedCarrier)" class="flex items-center space-x-2 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
                  <FileText class="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
            <div class="p-6">
              <!-- API Information -->
              <div class="mb-6">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Key class="w-4 h-4 mr-2" />
                  Informations API
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">API ID</p>
                    <p class="font-mono text-sm text-gray-900 dark:text-white">{{ selectedCarrier.apiId }}</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">API Key</p>
                    <p class="font-mono text-sm text-gray-900 dark:text-white">{{ selectedCarrier.apiKey.substring(0, 15) }}...</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">Statut</p>
                    <div class="flex items-center space-x-2">
                      <span :class="selectedCarrier.apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></span>
                      <span class="text-sm" :class="selectedCarrier.apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'">{{ selectedCarrier.apiStatus === 'connected' ? 'Connecté' : 'Déconnecté' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fees Table -->
              <div>
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Receipt class="w-4 h-4 mr-2" />
                  Grille tarifaire
                </h4>
                <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table class="w-full">
                    <thead>
                      <tr class="bg-gray-50 dark:bg-gray-800/50">
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type de frais</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Montant</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis livrés</td>
                        <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisLivres.toFixed(2) }} DT</td>
                      </tr>
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis retour</td>
                        <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisRetour.toFixed(2) }} DT</td>
                      </tr>
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis échange</td>
                        <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisEchange.toFixed(2) }} DT</td>
                      </tr>
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis volumineux (BIG)</td>
                        <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisBig.toFixed(2) }} DT</td>
                      </tr>
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis pickup</td>
                        <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisPickup.toFixed(2) }} DT</td>
                      </tr>
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 bg-orange-50/50 dark:bg-orange-900/10">
                        <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Total frais de livraison</td>
                        <td class="px-4 py-3 text-sm text-right font-bold text-orange-600">{{ selectedCarrier.totalFraisLivraison.toFixed(2) }} DT</td>
                      </tr>
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais de paiement</td>
                        <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisPaiement.toFixed(2) }} %</td>
                      </tr>
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Retenu de passage</td>
                        <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.retenuPassage.toFixed(2) }} DT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Performance Stats -->
              <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-blue-600">{{ selectedCarrier.shipments }}</p>
                  <p class="text-xs text-blue-600/70">Total colis</p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-green-600">{{ selectedCarrier.delivered }}</p>
                  <p class="text-xs text-green-600/70">Livrés</p>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-orange-600">{{ selectedCarrier.deliveryRate }}%</p>
                  <p class="text-xs text-orange-600/70">Taux livraison</p>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <p class="text-2xl font-bold text-purple-600">{{ selectedCarrier.avgTime }}j</p>
                  <p class="text-xs text-purple-600/70">Temps moyen</p>
                </div>
              </div>

              <!-- Region Coverage -->
              <div class="mt-6">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <MapPinned class="w-4 h-4 mr-2" />
                  Zones de couverture
                </h4>
                <div v-if="selectedCarrier.allRegions" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div class="flex items-center space-x-2">
                    <CheckCircle class="w-5 h-5 text-green-600" />
                    <span class="text-sm font-medium text-green-700 dark:text-green-400">Toutes les régions</span>
                  </div>
                  <p class="text-xs text-green-600/70 mt-1">Ce transporteur couvre l'ensemble du territoire tunisien (24 gouvernorats)</p>
                </div>
                <div v-else class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ selectedCarrier.regions.length }} gouvernorat(s) couverts
                    </span>
                    <span class="text-xs text-gray-500">sur 24 total</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="region in selectedCarrier.regions"
                      :key="region"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                    >
                      <MapPinned class="w-3 h-3 mr-1" />
                      {{ region }}
                    </span>
                  </div>
                  <div v-if="selectedCarrier.regions.length === 0" class="text-center py-4">
                    <AlertTriangle class="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p class="text-sm text-gray-500">Aucune région configurée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state when no carrier selected -->
          <div v-else class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Building2 class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Sélectionnez un transporteur</h3>
            <p class="text-sm text-gray-500">Cliquez sur une carte ci-dessus pour voir les détails et la grille tarifaire</p>
          </div>
        </main>
      </template>

      <!-- Tracking Page Section -->
      <template v-if="activeSection === 'page-templates' || activeSection === 'my-tracking-page' || activeSection === 'page-branding' || activeSection === 'page-analytics' || activeSection === 'failed-searches'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ activeSection === 'page-templates' ? 'Modèles de page' : activeSection === 'my-tracking-page' ? 'Ma page de suivi' : activeSection === 'page-branding' ? 'Personnalisation' : activeSection === 'page-analytics' ? 'Analytiques page' : 'Recherches échouées' }}
              </h1>
              <p class="text-sm text-gray-500 mt-1">
                {{ activeSection === 'page-templates' ? 'Choisissez un modèle pour votre page de suivi' : activeSection === 'my-tracking-page' ? 'Prévisualisez et gérez votre page de suivi' : activeSection === 'page-branding' ? 'Personnalisez votre page avec votre branding' : activeSection === 'page-analytics' ? 'Statistiques de votre page de suivi' : 'Clients qui n\'ont pas trouvé leur commande' }}
              </p>
            </div>
            <button v-if="activeSection === 'page-templates'" class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium transition-colors">
              <Plus class="w-4 h-4" />
              <span>Créer une page</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Page Templates -->
          <div v-if="activeSection === 'page-templates'">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="template in trackingPageTemplates" :key="template.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div class="aspect-video bg-gradient-to-br" :class="template.gradientClass">
                  <div class="w-full h-full flex items-center justify-center">
                    <div class="bg-white/90 dark:bg-gray-900/90 rounded-lg p-4 w-4/5">
                      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
                      <div class="flex space-x-2">
                        <div class="h-8 w-8 rounded-full" :class="template.accentClass"></div>
                        <div class="flex-1">
                          <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                          <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-white">{{ template.name }}</h3>
                    <span v-if="template.isPopular" class="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded font-medium">Populaire</span>
                  </div>
                  <p class="text-sm text-gray-500 mb-4">{{ template.description }}</p>
                  <div class="flex items-center space-x-2">
                    <button class="flex-1 px-3 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium transition-colors">
                      Utiliser
                    </button>
                    <button class="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Aperçu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- My Tracking Page -->
          <div v-if="activeSection === 'my-tracking-page'">
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <Globe class="w-5 h-5 text-orange-500" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">track.maboutique.tn</p>
                    <p class="text-sm text-gray-500">Page active</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Modifier
                  </button>
                  <button class="px-3 py-1.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
                    Voir la page
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                    <Globe class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p class="text-gray-500">Prévisualisation de votre page de suivi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Page Branding -->
          <div v-if="activeSection === 'page-branding'">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Logo & Couleurs</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo de l'entreprise</label>
                    <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                      <Upload class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p class="text-sm text-gray-500">Glissez votre logo ici</p>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Couleur principale</label>
                    <div class="flex items-center space-x-3">
                      <input type="color" value="#f97316" class="w-10 h-10 rounded border-0 cursor-pointer" />
                      <input type="text" value="#f97316" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Couleur secondaire</label>
                    <div class="flex items-center space-x-3">
                      <input type="color" value="#1f2937" class="w-10 h-10 rounded border-0 cursor-pointer" />
                      <input type="text" value="#1f2937" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
                <button class="mt-6 w-full px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
                  Enregistrer les modifications
                </button>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Aperçu</h3>
                <div class="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p class="text-gray-500">Prévisualisation en temps réel</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Page Analytics -->
          <div v-if="activeSection === 'page-analytics'">
            <!-- Key Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye class="w-5 h-5 text-blue-600" />
                  </div>
                  <span class="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    <TrendingUp class="w-3 h-3 mr-1" />+18%
                  </span>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
                <p class="text-sm text-gray-500">Visites ce mois</p>
                <div class="mt-3 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full" style="width: 75%"></div>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Search class="w-5 h-5 text-green-600" />
                  </div>
                  <span class="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    <TrendingUp class="w-3 h-3 mr-1" />+12%
                  </span>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">892</p>
                <p class="text-sm text-gray-500">Recherches réussies</p>
                <p class="text-xs text-gray-400 mt-2">72.3% taux de réussite</p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <SearchX class="w-5 h-5 text-red-600" />
                  </div>
                  <span class="flex items-center text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                    <TrendingUp class="w-3 h-3 mr-1" />+5
                  </span>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">45</p>
                <p class="text-sm text-gray-500">Recherches échouées</p>
                <p class="text-xs text-red-500 mt-2">À traiter rapidement</p>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Clock class="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">2m 34s</p>
                <p class="text-sm text-gray-500">Temps moyen sur page</p>
                <p class="text-xs text-green-500 mt-2">+15s vs mois dernier</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <!-- Traffic Sources -->
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Sources de trafic</h3>
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Lien direct (WhatsApp)</span>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">58%</span>
                    </div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500 rounded-full" style="width: 58%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm text-gray-600 dark:text-gray-400">WhatsApp</span>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">25%</span>
                    </div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full bg-green-500 rounded-full" style="width: 25%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Email</span>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">12%</span>
                    </div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full bg-orange-500 rounded-full" style="width: 12%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Recherche directe</span>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">5%</span>
                    </div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full bg-purple-500 rounded-full" style="width: 5%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Device Breakdown -->
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Appareils utilisés</h3>
                <div class="flex items-center justify-center mb-4">
                  <div class="relative w-32 h-32">
                    <svg class="w-full h-full" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" stroke-width="3" stroke-dasharray="78, 100" stroke-linecap="round"/>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-2xl font-bold text-gray-900 dark:text-white">78%</span>
                      <span class="text-xs text-gray-500">Mobile</span>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Mobile</span>
                    </div>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">962</span>
                  </div>
                  <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Desktop</span>
                    </div>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">272</span>
                  </div>
                </div>
              </div>

              <!-- Geographic Distribution -->
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Régions les plus actives</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                    <div class="flex items-center space-x-3">
                      <span class="text-lg">🇹🇳</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Tunis</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full" style="width: 85%"></div>
                      </div>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">342</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                    <div class="flex items-center space-x-3">
                      <span class="text-lg">🇹🇳</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Sousse</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full" style="width: 60%"></div>
                      </div>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">245</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                    <div class="flex items-center space-x-3">
                      <span class="text-lg">🇹🇳</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Sfax</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full" style="width: 45%"></div>
                      </div>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">198</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                    <div class="flex items-center space-x-3">
                      <span class="text-lg">🇹🇳</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Nabeul</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full" style="width: 35%"></div>
                      </div>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">156</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                    <div class="flex items-center space-x-3">
                      <span class="text-lg">🇹🇳</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Autres</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gray-400 rounded-full" style="width: 25%"></div>
                      </div>
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">293</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Visits Over Time -->
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Visites (7 derniers jours)</h3>
                  <select class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <option>7 jours</option>
                    <option>30 jours</option>
                    <option>3 mois</option>
                  </select>
                </div>
                <div class="h-48 flex items-end space-x-2">
                  <div v-for="(day, index) in [{name: 'Lun', value: 145}, {name: 'Mar', value: 178}, {name: 'Mer', value: 165}, {name: 'Jeu', value: 192}, {name: 'Ven', value: 210}, {name: 'Sam', value: 185}, {name: 'Dim', value: 159}]" :key="index" class="flex-1 flex flex-col items-center">
                    <div class="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all hover:from-orange-600 hover:to-orange-500" :style="{ height: (day.value / 210 * 100) + '%' }"></div>
                    <span class="text-xs text-gray-500 mt-2">{{ day.name }}</span>
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ day.value }}</span>
                  </div>
                </div>
              </div>

              <!-- Peak Hours -->
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Heures de pointe</h3>
                <div class="grid grid-cols-6 gap-1">
                  <div v-for="hour in 24" :key="hour" class="text-center">
                    <div :class="[
                      'w-full h-8 rounded transition-colors',
                      hour >= 9 && hour <= 12 ? 'bg-orange-500' :
                      hour >= 14 && hour <= 18 ? 'bg-orange-400' :
                      hour >= 19 && hour <= 21 ? 'bg-orange-300' :
                      'bg-gray-100 dark:bg-gray-800'
                    ]"></div>
                    <span class="text-[10px] text-gray-400">{{ hour }}h</span>
                  </div>
                </div>
                <div class="mt-4 flex items-center justify-center space-x-4 text-xs">
                  <div class="flex items-center space-x-1">
                    <div class="w-3 h-3 bg-orange-500 rounded"></div>
                    <span class="text-gray-500">Pic (9h-12h)</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <div class="w-3 h-3 bg-orange-400 rounded"></div>
                    <span class="text-gray-500">Élevé (14h-18h)</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <div class="w-3 h-3 bg-orange-300 rounded"></div>
                    <span class="text-gray-500">Moyen (19h-21h)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Searches & User Behavior -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Most Searched Tracking Numbers -->
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Recherches les plus fréquentes</h3>
                <div class="space-y-3">
                  <div v-for="(item, index) in [{tracking: 'YAL-2026-001234', searches: 12, status: 'Livré'}, {tracking: 'ZR-2026-005678', searches: 8, status: 'En transit'}, {tracking: 'MAY-2026-009012', searches: 6, status: 'En livraison'}, {tracking: 'ECO-2026-003456', searches: 5, status: 'En attente'}, {tracking: 'YAL-2026-007890', searches: 4, status: 'Livré'}]" :key="index"
                    class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div class="flex items-center space-x-3">
                      <span class="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full bg-orange-100 text-orange-600">{{ index + 1 }}</span>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white text-sm">{{ item.tracking }}</p>
                        <p class="text-xs text-gray-500">{{ item.searches }} recherches</p>
                      </div>
                    </div>
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      item.status === 'Livré' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      item.status === 'En transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      item.status === 'En livraison' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    ]">{{ item.status }}</span>
                  </div>
                </div>
              </div>

              <!-- User Engagement -->
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Comportement utilisateur</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <MousePointerClick class="w-5 h-5 text-blue-600" />
                      <span class="text-sm text-gray-700 dark:text-gray-300">Taux de clics</span>
                    </div>
                    <span class="text-lg font-bold text-blue-600">72%</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <CheckCircle class="w-5 h-5 text-green-600" />
                      <span class="text-sm text-gray-700 dark:text-gray-300">Recherches réussies</span>
                    </div>
                    <span class="text-lg font-bold text-green-600">95.2%</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <RotateCcw class="w-5 h-5 text-purple-600" />
                      <span class="text-sm text-gray-700 dark:text-gray-300">Visiteurs récurrents</span>
                    </div>
                    <span class="text-lg font-bold text-purple-600">34%</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <Activity class="w-5 h-5 text-orange-600" />
                      <span class="text-sm text-gray-700 dark:text-gray-300">Rebonds</span>
                    </div>
                    <span class="text-lg font-bold text-orange-600">12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Failed Searches -->
          <div v-if="activeSection === 'failed-searches'">
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <p class="text-sm text-gray-500">{{ failedSearches.length }} recherches sans résultat</p>
                <button class="text-sm text-orange-500 hover:text-orange-600 font-medium">Exporter CSV</button>
              </div>
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Recherche</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Téléphone</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr v-for="search in failedSearches" :key="search.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td class="px-4 py-3">
                      <span class="font-mono text-sm text-gray-900 dark:text-white">{{ search.query }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span v-if="search.phone" class="text-sm text-gray-600 dark:text-gray-400">{{ search.phone }}</span>
                      <span v-else class="text-sm text-gray-400">Non fourni</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ search.date }}</td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'px-2 py-0.5 text-xs rounded font-medium',
                        search.contacted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      ]">
                        {{ search.contacted ? 'Contacté' : 'À contacter' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end space-x-2">
                        <button v-if="search.phone" class="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="WhatsApp">
                          <MessageCircle class="w-4 h-4" />
                        </button>
                        <button class="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                          <MoreHorizontal class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </template>

      <!-- Finance Section -->
      <!-- ==================== FINANCE - PAIEMENTS ATTENDUS ==================== -->
      <template v-if="activeSection === 'expected-payments'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Paiements attendus</h1>
              <p class="text-sm text-gray-500 mt-1">Montants que les transporteurs vous doivent (COD collecté - Frais)</p>
            </div>
            <div class="flex items-center space-x-3">
              <select v-model="expectedPaymentsCarrierFilter" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="all">Tous les transporteurs</option>
                <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
              </select>
              <select v-model="expectedPaymentsStatusFilter" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="all">Tous les statuts</option>
                <option value="pending">Non payé</option>
                <option value="overdue">En retard</option>
              </select>
              <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
                <FileDown class="w-4 h-4" />
                <span>Exporter manifeste</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">COD Total Collecté</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ manifestStats.totalCOD.toLocaleString() }} TND</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Frais Livraison</p>
              <p class="text-2xl font-bold text-red-600">-{{ manifestStats.totalDeliveryFees.toLocaleString() }} TND</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Autres Frais</p>
              <p class="text-2xl font-bold text-red-600">-{{ manifestStats.totalOtherFees.toLocaleString() }} TND</p>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p class="text-sm text-green-100 mb-1">Net à Recevoir</p>
              <p class="text-2xl font-bold">{{ manifestStats.netToReceive.toLocaleString() }} TND</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <p class="text-sm text-gray-500 mb-1">En retard (+7j)</p>
              <p class="text-2xl font-bold text-red-600">{{ manifestStats.overdueAmount.toLocaleString() }} TND</p>
              <p class="text-xs text-red-500">{{ manifestStats.overdueCount }} colis</p>
            </div>
          </div>

          <!-- Grouped by Carrier -->
          <div v-for="carrier in filteredManifestByCarrier" :key="carrier.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <!-- Carrier Header -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <Truck class="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h3>
                    <p class="text-sm text-gray-500">{{ carrier.shipments.length }} colis · Échéance: {{ carrier.dueDate }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-6">
                  <div class="text-right">
                    <p class="text-sm text-gray-500">COD Collecté</p>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.totalCOD.toLocaleString() }} TND</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-500">Frais Total</p>
                    <p class="text-lg font-semibold text-red-600">-{{ carrier.totalFees.toLocaleString() }} TND</p>
                  </div>
                  <div class="text-right bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                    <p class="text-sm text-green-600">Net à recevoir</p>
                    <p class="text-xl font-bold text-green-600">{{ carrier.netAmount.toLocaleString() }} TND</p>
                  </div>
                  <button
                    v-if="carrier.isOverdue"
                    class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                  >
                    Relancer
                  </button>
                </div>
              </div>
            </div>

            <!-- Shipments Table (Manifest) -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Tracking</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date Livraison</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">COD</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Frais Livr.</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Autres Frais</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                    <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="shipment in carrier.shipments" :key="shipment.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td class="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white">{{ shipment.tracking }}</td>
                    <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ shipment.client }}</td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400">{{ shipment.destination }}</td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400">{{ shipment.deliveryDate }}</td>
                    <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{{ shipment.cod.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right text-red-600">-{{ shipment.deliveryFee.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right text-red-600">{{ shipment.otherFees > 0 ? '-' + shipment.otherFees.toLocaleString() : '0' }} TND</td>
                    <td class="px-4 py-2.5 text-right font-semibold text-green-600">{{ shipment.net.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-center">
                      <span :class="[
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        shipment.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        shipment.paymentStatus === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      ]">
                        {{ shipment.paymentStatus === 'paid' ? 'Payé' : shipment.paymentStatus === 'overdue' ? 'En retard' : 'En attente' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
                <!-- Totals Row -->
                <tfoot class="bg-gray-50 dark:bg-gray-800 font-semibold">
                  <tr>
                    <td colspan="4" class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">TOTAL {{ carrier.name }}</td>
                    <td class="px-4 py-3 text-right text-gray-900 dark:text-white">{{ carrier.totalCOD.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-right text-red-600">-{{ carrier.totalDeliveryFees.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-right text-red-600">-{{ carrier.totalOtherFees.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-right text-green-600">{{ carrier.netAmount.toLocaleString() }} TND</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredManifestByCarrier.length === 0" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Package class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">Aucun paiement en attente</p>
          </div>
        </main>
      </template>

      <!-- ==================== FINANCE - PAIEMENTS REÇUS ==================== -->
      <template v-if="activeSection === 'received-payments'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Paiements reçus</h1>
              <p class="text-sm text-gray-500 mt-1">Historique des versements reçus avec détail par colis</p>
            </div>
            <div class="flex items-center space-x-3">
              <input type="month" v-model="receivedPaymentsMonth" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              <select v-model="receivedPaymentsCarrierFilter" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="all">Tous les transporteurs</option>
                <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
              </select>
              <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
                <FileDown class="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p class="text-sm text-green-100 mb-1">Total Reçu</p>
              <p class="text-2xl font-bold">{{ receivedPaymentsStats.totalReceived.toLocaleString() }} TND</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">COD Collecté</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ receivedPaymentsStats.totalCOD.toLocaleString() }} TND</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Frais Prélevés</p>
              <p class="text-2xl font-bold text-red-600">-{{ receivedPaymentsStats.totalFees.toLocaleString() }} TND</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Versements</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ receivedPaymentsStats.paymentsCount }}</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Colis Payés</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ receivedPaymentsStats.shipmentsCount }}</p>
            </div>
          </div>

          <!-- Payments List with Details -->
          <div v-for="payment in filteredReceivedPayments" :key="payment.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <!-- Payment Header -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-green-50 dark:bg-green-900/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <CheckCircle class="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div class="flex items-center space-x-3">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ payment.carrier }}</h3>
                      <span class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Payé</span>
                    </div>
                    <p class="text-sm text-gray-500">Réf: {{ payment.reference }} · {{ payment.paymentDate }} · {{ payment.shipments.length }} colis</p>
                  </div>
                </div>
                <div class="flex items-center space-x-6">
                  <div class="text-right">
                    <p class="text-sm text-gray-500">COD Total</p>
                    <p class="text-lg font-medium text-gray-900 dark:text-white">{{ payment.totalCOD.toLocaleString() }} TND</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-500">Frais Total</p>
                    <p class="text-lg font-medium text-red-600">-{{ payment.totalFees.toLocaleString() }} TND</p>
                  </div>
                  <div class="text-right bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                    <p class="text-sm text-green-600">Net Reçu</p>
                    <p class="text-xl font-bold text-green-600">+{{ payment.netReceived.toLocaleString() }} TND</p>
                  </div>
                  <button
                    @click="payment.expanded = !payment.expanded"
                    class="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  >
                    <ChevronDown :class="['w-5 h-5 text-gray-500 transition-transform', payment.expanded ? 'rotate-180' : '']" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Detailed Shipments Table (Collapsible) -->
            <div v-show="payment.expanded" class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Tracking</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date Livraison</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">COD</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Frais Livr.</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Autres Frais</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="shipment in payment.shipments" :key="shipment.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td class="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white">{{ shipment.tracking }}</td>
                    <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ shipment.client }}</td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400">{{ shipment.destination }}</td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400">{{ shipment.deliveryDate }}</td>
                    <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{{ shipment.cod.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right text-red-600">-{{ shipment.deliveryFee.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right text-red-600">{{ shipment.otherFees > 0 ? '-' + shipment.otherFees.toLocaleString() : '0' }} TND</td>
                    <td class="px-4 py-2.5 text-right font-semibold text-green-600">{{ shipment.net.toLocaleString() }} TND</td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 dark:bg-gray-800 font-semibold">
                  <tr>
                    <td colspan="4" class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">TOTAL</td>
                    <td class="px-4 py-3 text-right text-gray-900 dark:text-white">{{ payment.totalCOD.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-right text-red-600">-{{ payment.totalDeliveryFees.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-right text-red-600">-{{ payment.totalOtherFees.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-right text-green-600">{{ payment.netReceived.toLocaleString() }} TND</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Fees Breakdown Summary -->
            <div v-show="payment.expanded" class="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Détail des frais prélevés par {{ payment.carrier }}</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <p class="text-xs text-gray-500">Frais de livraison</p>
                  <p class="text-lg font-semibold text-red-600">-{{ payment.totalDeliveryFees.toLocaleString() }} TND</p>
                  <p class="text-xs text-gray-400">{{ payment.shipments.length }} x {{ (payment.totalDeliveryFees / payment.shipments.length).toFixed(2) }} TND/colis</p>
                </div>
                <div class="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <p class="text-xs text-gray-500">Frais COD</p>
                  <p class="text-lg font-semibold text-red-600">-{{ payment.codFees.toLocaleString() }} TND</p>
                  <p class="text-xs text-gray-400">{{ payment.codFeePercent }}% du COD</p>
                </div>
                <div class="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <p class="text-xs text-gray-500">Frais retour</p>
                  <p class="text-lg font-semibold text-red-600">-{{ payment.returnFees.toLocaleString() }} TND</p>
                  <p class="text-xs text-gray-400">{{ payment.returnCount }} retours</p>
                </div>
                <div class="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <p class="text-xs text-gray-500">TVA</p>
                  <p class="text-lg font-semibold text-red-600">-{{ payment.tva.toLocaleString() }} TND</p>
                  <p class="text-xs text-gray-400">19% sur frais</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredReceivedPayments.length === 0" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Wallet class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">Aucun paiement reçu pour cette période</p>
          </div>
        </main>
      </template>

      <!-- ==================== FINANCE - ÉCARTS DE PAIEMENT ==================== -->
      <template v-if="activeSection === 'payment-discrepancies'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Écarts de paiement</h1>
              <p class="text-sm text-gray-500 mt-1">Comparaison entre nos calculs et les paiements reçus des transporteurs</p>
            </div>
            <div class="flex items-center space-x-3">
              <select v-model="discrepancyCarrierFilter" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="all">Tous les transporteurs</option>
                <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
              </select>
              <button
                v-for="status in ['all', 'pending', 'disputed', 'resolved']"
                :key="status"
                @click="discrepancyFilter = status"
                :class="[
                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                  discrepancyFilter === status
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                ]"
              >
                {{ status === 'all' ? 'Tous' : status === 'pending' ? 'Non résolus' : status === 'disputed' ? 'Contestés' : 'Résolus' }}
              </button>
              <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
                <FileDown class="w-4 h-4" />
                <span>Rapport réconciliation</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Alert Banner -->
          <div v-if="discrepancyStats.totalPending > 0" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div class="flex items-start space-x-3">
              <AlertTriangle class="w-5 h-5 text-red-600 mt-0.5" />
              <div class="flex-1">
                <p class="font-medium text-red-800 dark:text-red-300">
                  {{ discrepancyStats.pendingCount }} écarts non résolus représentant {{ discrepancyStats.totalPending.toLocaleString() }} TND de manque à gagner
                </p>
                <p class="text-sm text-red-600 dark:text-red-400 mt-1">
                  Ces montants sont calculés en comparant nos données avec les versements des transporteurs.
                </p>
              </div>
              <button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                Contester tous
              </button>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Notre calcul</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ discrepancyStats.ourTotal.toLocaleString() }} TND</p>
              <p class="text-xs text-gray-400 mt-1">Ce que nous devions recevoir</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Reçu des transporteurs</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ discrepancyStats.theirTotal.toLocaleString() }} TND</p>
              <p class="text-xs text-gray-400 mt-1">Ce qu'ils ont versé</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <p class="text-sm text-gray-500 mb-1">Écart total</p>
              <p class="text-2xl font-bold text-red-600">-{{ discrepancyStats.totalDifference.toLocaleString() }} TND</p>
              <p class="text-xs text-red-500 mt-1">{{ discrepancyStats.differencePercent }}% de différence</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Frais non prévus</p>
              <p class="text-2xl font-bold text-orange-600">{{ discrepancyStats.unexpectedFees.toLocaleString() }} TND</p>
              <p class="text-xs text-gray-400 mt-1">{{ discrepancyStats.unexpectedFeesCount }} colis</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p class="text-sm text-gray-500 mb-1">Récupéré après contestation</p>
              <p class="text-2xl font-bold text-green-600">{{ discrepancyStats.recovered.toLocaleString() }} TND</p>
              <p class="text-xs text-gray-400 mt-1">Ce mois</p>
            </div>
          </div>

          <!-- Reconciliation by Carrier -->
          <div v-for="carrier in reconciliationByCarrier" :key="carrier.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <!-- Carrier Header -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-800" :class="carrier.totalDifference > 0 ? 'bg-red-50 dark:bg-red-900/10' : 'bg-green-50 dark:bg-green-900/10'">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', carrier.totalDifference > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30']">
                    <Truck :class="['w-6 h-6', carrier.totalDifference > 0 ? 'text-red-600' : 'text-green-600']" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h3>
                    <p class="text-sm text-gray-500">{{ carrier.shipmentsWithDiscrepancy }} colis avec écart sur {{ carrier.totalShipments }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-8">
                  <div class="text-center">
                    <p class="text-xs text-gray-500 uppercase">Notre calcul</p>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.ourCalculation.toLocaleString() }} TND</p>
                  </div>
                  <div class="text-2xl text-gray-300">vs</div>
                  <div class="text-center">
                    <p class="text-xs text-gray-500 uppercase">Leur versement</p>
                    <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ carrier.theirPayment.toLocaleString() }} TND</p>
                  </div>
                  <div class="text-center px-4 py-2 rounded-lg" :class="carrier.totalDifference > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'">
                    <p class="text-xs" :class="carrier.totalDifference > 0 ? 'text-red-600' : 'text-green-600'">Écart</p>
                    <p class="text-xl font-bold" :class="carrier.totalDifference > 0 ? 'text-red-600' : 'text-green-600'">
                      {{ carrier.totalDifference > 0 ? '-' : '+' }}{{ Math.abs(carrier.totalDifference).toLocaleString() }} TND
                    </p>
                  </div>
                  <button
                    v-if="carrier.totalDifference > 0"
                    class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                  >
                    Contester
                  </button>
                </div>
              </div>
            </div>

            <!-- Detailed Shipment Reconciliation -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Tracking</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">COD Client</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Notre calcul net</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Leur versement</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Écart</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Raison transporteur</th>
                    <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="shipment in carrier.discrepancies" :key="shipment.id" :class="shipment.difference !== 0 ? 'bg-red-50/50 dark:bg-red-900/5' : ''">
                    <td class="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white">{{ shipment.tracking }}</td>
                    <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ shipment.client }}</td>
                    <td class="px-4 py-2.5 text-right text-gray-600 dark:text-gray-400">{{ shipment.codCollected.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{{ shipment.ourNet.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{{ shipment.theirNet.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right">
                      <span v-if="shipment.difference !== 0" class="font-semibold text-red-600">-{{ shipment.difference.toLocaleString() }} TND</span>
                      <span v-else class="text-green-600">OK</span>
                    </td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs">{{ shipment.carrierReason || '-' }}</td>
                    <td class="px-4 py-2.5 text-center">
                      <span v-if="shipment.difference !== 0" :class="[
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        shipment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        shipment.status === 'disputed' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      ]">
                        {{ shipment.status === 'pending' ? 'Non résolu' : shipment.status === 'disputed' ? 'Contesté' : 'Résolu' }}
                      </span>
                      <span v-else class="text-xs text-gray-400">-</span>
                    </td>
                    <td class="px-4 py-2.5 text-center">
                      <button v-if="shipment.difference !== 0 && shipment.status !== 'resolved'" class="text-xs text-orange-600 hover:text-orange-700 font-medium">
                        Contester
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 dark:bg-gray-800 font-semibold">
                  <tr>
                    <td colspan="3" class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">TOTAL</td>
                    <td class="px-4 py-3 text-right text-gray-900 dark:text-white">{{ carrier.ourCalculation.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-right text-gray-900 dark:text-white">{{ carrier.theirPayment.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-right" :class="carrier.totalDifference > 0 ? 'text-red-600' : 'text-green-600'">
                      {{ carrier.totalDifference > 0 ? '-' : '' }}{{ Math.abs(carrier.totalDifference).toLocaleString() }} TND
                    </td>
                    <td colspan="3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Fee Breakdown Comparison -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Comparaison des frais</h4>
              <div class="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p class="text-xs text-gray-500">Frais livraison</p>
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-600">Prévu: {{ carrier.fees.deliveryExpected.toLocaleString() }}</span>
                    <span class="text-gray-400">→</span>
                    <span :class="carrier.fees.deliveryActual > carrier.fees.deliveryExpected ? 'text-red-600 font-medium' : 'text-gray-600'">
                      Réel: {{ carrier.fees.deliveryActual.toLocaleString() }} TND
                    </span>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Frais COD</p>
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-600">Prévu: {{ carrier.fees.codExpected.toLocaleString() }}</span>
                    <span class="text-gray-400">→</span>
                    <span :class="carrier.fees.codActual > carrier.fees.codExpected ? 'text-red-600 font-medium' : 'text-gray-600'">
                      Réel: {{ carrier.fees.codActual.toLocaleString() }} TND
                    </span>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Frais retour</p>
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-600">Prévu: {{ carrier.fees.returnExpected.toLocaleString() }}</span>
                    <span class="text-gray-400">→</span>
                    <span :class="carrier.fees.returnActual > carrier.fees.returnExpected ? 'text-red-600 font-medium' : 'text-gray-600'">
                      Réel: {{ carrier.fees.returnActual.toLocaleString() }} TND
                    </span>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Autres frais</p>
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-600">Prévu: {{ carrier.fees.otherExpected.toLocaleString() }}</span>
                    <span class="text-gray-400">→</span>
                    <span :class="carrier.fees.otherActual > carrier.fees.otherExpected ? 'text-red-600 font-medium' : 'text-gray-600'">
                      Réel: {{ carrier.fees.otherActual.toLocaleString() }} TND
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== FINANCE - REVENUS ==================== -->
      <template v-if="activeSection === 'revenue'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Revenus</h1>
              <p class="text-sm text-gray-500 mt-1">Vue d'ensemble de vos revenus et marges</p>
            </div>
            <div class="flex items-center space-x-3">
              <select v-model="revenuePeriod" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
                <FileDown class="w-4 h-4" />
                <span>Rapport</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Revenue Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-100 text-sm">Revenu brut</p>
                  <p class="text-3xl font-bold mt-1">{{ revenueStats.grossRevenue.toLocaleString() }} TND</p>
                </div>
                <div class="p-3 bg-white/20 rounded-lg">
                  <TrendingUp class="w-6 h-6" />
                </div>
              </div>
              <div class="mt-3 flex items-center space-x-1 text-sm">
                <ArrowUp class="w-4 h-4" />
                <span>+{{ revenueStats.grossGrowth }}% vs période précédente</span>
              </div>
            </div>
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm">Revenu net</p>
                  <p class="text-3xl font-bold mt-1">{{ revenueStats.netRevenue.toLocaleString() }} TND</p>
                </div>
                <div class="p-3 bg-white/20 rounded-lg">
                  <Wallet class="w-6 h-6" />
                </div>
              </div>
              <div class="mt-3 flex items-center space-x-1 text-sm">
                <span>Marge: {{ revenueStats.marginPercent }}%</span>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Truck class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ revenueStats.shippingCosts.toLocaleString() }} TND</p>
                  <p class="text-sm text-gray-500">Frais livraison</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Package class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ revenueStats.avgOrderValue.toLocaleString() }} TND</p>
                  <p class="text-sm text-gray-500">Panier moyen</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Revenue Breakdown -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- By Product Category -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 class="font-semibold text-gray-900 dark:text-white">Par catégorie de produit</h3>
              </div>
              <div class="p-4 space-y-4">
                <div v-for="cat in revenueByCategory" :key="cat.name" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ cat.name }}</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ cat.amount.toLocaleString() }} TND</span>
                  </div>
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" :class="cat.color" :style="{ width: cat.percent + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- By Region -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 class="font-semibold text-gray-900 dark:text-white">Par région</h3>
              </div>
              <div class="p-4 space-y-4">
                <div v-for="region in revenueByRegion" :key="region.name" class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <MapPin class="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ region.name }}</p>
                      <p class="text-xs text-gray-500">{{ region.orders }} commandes</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ region.amount.toLocaleString() }} TND</p>
                    <p class="text-xs text-gray-500">{{ region.percent }}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Daily Revenue Chart Placeholder -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Évolution des revenus</h3>
              <div class="flex items-center space-x-2 text-sm">
                <span class="flex items-center"><span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>Revenu brut</span>
                <span class="flex items-center"><span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>Revenu net</span>
              </div>
            </div>
            <div class="p-4">
              <!-- Simple bar representation -->
              <div class="flex items-end space-x-2 h-48">
                <div v-for="(day, index) in revenueChartData" :key="index" class="flex-1 flex flex-col items-center space-y-1">
                  <div class="w-full flex space-x-0.5">
                    <div class="flex-1 bg-green-500 rounded-t" :style="{ height: (day.gross / 1000) * 2 + 'px' }"></div>
                    <div class="flex-1 bg-blue-500 rounded-t" :style="{ height: (day.net / 1000) * 2 + 'px' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ day.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== FINANCE - PERTES RETOURS ==================== -->
      <template v-if="activeSection === 'return-losses'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Pertes retours</h1>
              <p class="text-sm text-gray-500 mt-1">Impact financier des retours et colis perdus</p>
            </div>
            <div class="flex items-center space-x-3">
              <input type="month" v-model="returnLossesMonth" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
                <FileDown class="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-red-600">{{ returnLossesStats.totalLoss.toLocaleString() }} TND</p>
                  <p class="text-sm text-gray-500">Pertes totales</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <RotateCcw class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ returnLossesStats.returnedCount }}</p>
                  <p class="text-sm text-gray-500">Colis retournés</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <PackageX class="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ returnLossesStats.lostCount }}</p>
                  <p class="text-sm text-gray-500">Colis perdus</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Truck class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ returnLossesStats.shippingLoss.toLocaleString() }} TND</p>
                  <p class="text-sm text-gray-500">Frais de port perdus</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Loss Breakdown -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- By Reason -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 class="font-semibold text-gray-900 dark:text-white">Par motif de retour</h3>
              </div>
              <div class="p-4 space-y-3">
                <div v-for="reason in returnLossesByReason" :key="reason.name" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <component :is="reason.icon" class="w-5 h-5" :class="reason.iconColor" />
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ reason.name }}</p>
                      <p class="text-xs text-gray-500">{{ reason.count }} colis</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-red-600">-{{ reason.amount.toLocaleString() }} TND</p>
                    <p class="text-xs text-gray-500">{{ reason.percent }}%</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- By Carrier -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 class="font-semibold text-gray-900 dark:text-white">Par transporteur</h3>
              </div>
              <div class="p-4 space-y-3">
                <div v-for="carrier in returnLossesByCarrier" :key="carrier.name" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Truck class="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
                      <p class="text-xs text-gray-500">Taux retour: {{ carrier.returnRate }}%</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-red-600">-{{ carrier.amount.toLocaleString() }} TND</p>
                    <p class="text-xs text-gray-500">{{ carrier.count }} retours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed List -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Détail des pertes</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transporteur</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur colis</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frais port</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perte totale</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr v-for="loss in returnLossesDetails" :key="loss.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ loss.reference }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ loss.customer }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ loss.carrier }}</td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        loss.reason === 'Refusé' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        loss.reason === 'Perdu' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      ]">{{ loss.reason }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ loss.value.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ loss.shippingFee.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-sm font-semibold text-red-600">-{{ loss.totalLoss.toLocaleString() }} TND</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== FINANCE - FACTURES ==================== -->
      <template v-if="activeSection === 'invoices'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Factures</h1>
              <p class="text-sm text-gray-500 mt-1">Gérez vos factures transporteurs et clients</p>
            </div>
            <div class="flex items-center space-x-3">
              <button
                v-for="tab in ['received', 'sent']"
                :key="tab"
                @click="invoicesTab = tab"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  invoicesTab === tab
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
              >
                {{ tab === 'received' ? 'Factures reçues' : 'Factures émises' }}
              </button>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Receipt class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ invoicesStats.totalInvoices }}</p>
                  <p class="text-sm text-gray-500">Total factures</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ invoicesStats.pendingAmount.toLocaleString() }} TND</p>
                  <p class="text-sm text-gray-500">En attente</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ invoicesStats.paidAmount.toLocaleString() }} TND</p>
                  <p class="text-sm text-gray-500">Payées ce mois</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ invoicesStats.overdueCount }}</p>
                  <p class="text-sm text-gray-500">En retard</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Invoices List -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <input
                  type="text"
                  v-model="invoiceSearch"
                  placeholder="Rechercher une facture..."
                  class="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-orange-500"
                />
                <select v-model="invoiceStatusFilter" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payée</option>
                  <option value="overdue">En retard</option>
                </select>
              </div>
              <button class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
                <Plus class="w-4 h-4" />
                <span>Nouvelle facture</span>
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ invoicesTab === 'received' ? 'Émetteur' : 'Client' }}</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="px-4 py-3">
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ invoice.number }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ invoice.party }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ invoice.date }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ invoice.dueDate }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{{ invoice.amount.toLocaleString() }} TND</td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      ]">
                        {{ invoice.status === 'paid' ? 'Payée' : invoice.status === 'overdue' ? 'En retard' : 'En attente' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center space-x-2">
                        <button class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Voir">
                          <Eye class="w-4 h-4 text-gray-500" />
                        </button>
                        <button class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Télécharger">
                          <FileDown class="w-4 h-4 text-gray-500" />
                        </button>
                        <button v-if="invoice.status !== 'paid'" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Marquer payée">
                          <CheckCircle class="w-4 h-4 text-green-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== FINANCE - EXPORTS ==================== -->
      <template v-if="activeSection === 'exports'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Exports financiers</h1>
              <p class="text-sm text-gray-500 mt-1">Exportez vos données financières pour la comptabilité</p>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <!-- Quick Export Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <FileSpreadsheet class="w-6 h-6 text-green-600" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Export Excel</h3>
                  <p class="text-sm text-gray-500">Données formatées pour Excel</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText class="w-6 h-6 text-blue-600" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Export CSV</h3>
                  <p class="text-sm text-gray-500">Format universel</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText class="w-6 h-6 text-red-600" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Export PDF</h3>
                  <p class="text-sm text-gray-500">Rapports imprimables</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Export Configuration -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Configurer l'export</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Data Type -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de données</label>
                  <select v-model="exportConfig.dataType" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <option value="all">Toutes les données</option>
                    <option value="payments">Paiements uniquement</option>
                    <option value="invoices">Factures uniquement</option>
                    <option value="revenue">Revenus uniquement</option>
                    <option value="losses">Pertes/Retours</option>
                  </select>
                </div>
                <!-- Date Range -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Période</label>
                  <select v-model="exportConfig.period" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <option value="thisMonth">Ce mois</option>
                    <option value="lastMonth">Mois dernier</option>
                    <option value="thisQuarter">Ce trimestre</option>
                    <option value="thisYear">Cette année</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
                <!-- Custom Date Range -->
                <div v-if="exportConfig.period === 'custom'" class="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date début</label>
                    <input type="date" v-model="exportConfig.startDate" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date fin</label>
                    <input type="date" v-model="exportConfig.endDate" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
                  </div>
                </div>
                <!-- Format -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
                  <div class="flex space-x-3">
                    <button
                      v-for="format in ['excel', 'csv', 'pdf']"
                      :key="format"
                      @click="exportConfig.format = format"
                      :class="[
                        'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        exportConfig.format === format
                          ? 'bg-primary-blue text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      ]"
                    >
                      {{ format.toUpperCase() }}
                    </button>
                  </div>
                </div>
                <!-- Carrier Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transporteur</label>
                  <select v-model="exportConfig.carrier" class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <option value="all">Tous les transporteurs</option>
                    <option value="aramex">Aramex</option>
                    <option value="express">Express Delivery</option>
                    <option value="rapid">Rapid Post</option>
                  </select>
                </div>
              </div>
              <div class="mt-6 flex justify-end">
                <button class="flex items-center space-x-2 px-6 py-2.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg font-medium transition-colors">
                  <FileDown class="w-5 h-5" />
                  <span>Générer l'export</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Recent Exports -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Exports récents</h3>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-800">
              <div v-for="exp in recentExports" :key="exp.id" class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div class="flex items-center space-x-4">
                  <div :class="[
                    'p-2 rounded-lg',
                    exp.format === 'excel' ? 'bg-green-100 dark:bg-green-900/30' :
                    exp.format === 'csv' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-red-100 dark:bg-red-900/30'
                  ]">
                    <FileSpreadsheet v-if="exp.format === 'excel'" class="w-5 h-5 text-green-600" />
                    <FileText v-else class="w-5 h-5" :class="exp.format === 'csv' ? 'text-blue-600' : 'text-red-600'" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ exp.name }}</p>
                    <p class="text-sm text-gray-500">{{ exp.date }} · {{ exp.size }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    exp.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  ]">
                    {{ exp.status === 'ready' ? 'Prêt' : 'En cours' }}
                  </span>
                  <button v-if="exp.status === 'ready'" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <FileDown class="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Users & Roles Section -->
      <template v-if="activeSection === 'users-roles'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Membres</h1>
              <p class="text-sm text-gray-500 mt-1">
                Ajoutez et gérez des membres et leurs rôles, et consultez l'utilisation des sièges pour votre organisation.
                <a href="#" class="text-blue-600 hover:underline">Voir les sièges</a>
              </p>
            </div>
            <button class="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Lock class="w-4 h-4" />
              <span>Exportation</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <!-- Tabs -->
            <div class="border-b border-gray-200 dark:border-gray-800">
              <nav class="flex space-x-8 px-6">
                <button
                  @click="membersTab = 'members'"
                  :class="[
                    'py-4 text-sm font-medium border-b-2 -mb-px transition-colors',
                    membersTab === 'members'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  ]"
                >
                  Membres
                </button>
                <button
                  @click="membersTab = 'roles'"
                  :class="[
                    'py-4 text-sm font-medium border-b-2 -mb-px transition-colors',
                    membersTab === 'roles'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  ]"
                >
                  Rôles
                </button>
              </nav>
            </div>

            <!-- Members Tab Content -->
            <div v-if="membersTab === 'members'" class="p-6">
              <!-- Add Members Button -->
              <button class="mb-6 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <span>Ajouter des membres</span>
              </button>

              <!-- Search and Filter -->
              <div class="flex items-center space-x-4 mb-6">
                <div class="flex-1 relative">
                  <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="memberSearchQuery"
                    type="text"
                    placeholder="Search by name or email"
                    class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div class="relative">
                  <button
                    @click="showRoleFilter = !showRoleFilter"
                    class="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span>Poste</span>
                    <ChevronDown class="w-4 h-4" />
                  </button>
                  <!-- Role Filter Dropdown -->
                  <div v-if="showRoleFilter" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                    <label v-for="role in availableRoles" :key="role.id" class="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <input type="checkbox" :value="role.id" v-model="selectedRoleFilters" class="mr-3 rounded border-gray-300" />
                      <span class="text-sm text-gray-700 dark:text-gray-300">{{ role.name }}</span>
                    </label>
                    <div class="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-4">
                      <button @click="selectedRoleFilters = []; showRoleFilter = false" class="text-sm text-gray-500 hover:text-gray-700">Effacer</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Members Table -->
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-800">
                    <th class="text-left py-3 text-sm font-semibold text-gray-900 dark:text-white">Nom</th>
                    <th class="text-left py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Dernière connexion
                      <HelpCircle class="w-4 h-4 inline-block ml-1 text-gray-400" />
                    </th>
                    <th class="text-left py-3 text-sm font-semibold text-gray-900 dark:text-white">Poste</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr v-for="member in teamMembers" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td class="py-4">
                      <div class="flex items-center space-x-3">
                        <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold', member.avatarColor]">
                          {{ member.initials }}
                        </div>
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{ member.name }}</p>
                          <p class="text-sm text-gray-500">{{ member.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 text-sm text-gray-600 dark:text-gray-400">{{ member.lastLogin }}</td>
                    <td class="py-4 text-sm text-gray-600 dark:text-gray-400">{{ member.role }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Pagination -->
              <div class="flex items-center justify-center space-x-2 mt-6">
                <button class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <ChevronLeft class="w-4 h-4 text-gray-400" />
                </button>
                <span class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">1</span>
                <span class="text-gray-500">/ 1</span>
                <button class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <ChevronRight class="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <!-- Roles Tab Content -->
            <div v-if="membersTab === 'roles'" class="p-6">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Pour un contrôle plus précis des autorisations, vous pouvez créer des rôles personnalisés avec des autorisations spécifiques.
                <a href="#" class="text-blue-600 hover:underline">Pour en savoir plus</a>
              </p>

              <!-- Create Role Button -->
              <button class="mb-6 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Lock class="w-4 h-4" />
                <span>Créer un rôle</span>
              </button>

              <!-- Roles Table -->
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-800">
                    <th class="text-left py-3 text-sm font-semibold text-gray-500">Poste</th>
                    <th class="text-left py-3 text-sm font-semibold text-gray-500">Member count</th>
                    <th class="text-right py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr v-for="role in availableRoles" :key="role.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td class="py-4">
                      <div>
                        <div class="flex items-center space-x-2">
                          <span class="font-medium text-gray-900 dark:text-white">{{ role.name }}</span>
                          <span v-if="role.isDefault" class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">Faire défaut</span>
                        </div>
                        <p v-if="role.description" class="text-sm text-gray-500 mt-0.5">{{ role.description }}</p>
                      </div>
                    </td>
                    <td class="py-4 text-sm text-gray-600 dark:text-gray-400">{{ role.memberCount }}</td>
                    <td class="py-4 text-right">
                      <div class="flex items-center justify-end space-x-3">
                        <button class="text-sm text-blue-600 hover:underline">Vue</button>
                        <button v-if="!role.isOwner" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                          <MoreHorizontal class="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Pagination -->
              <div class="flex items-center justify-center space-x-2 mt-6">
                <button class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <ChevronLeft class="w-4 h-4 text-gray-400" />
                </button>
                <span class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">1</span>
                <span class="text-gray-500">/ 1</span>
                <button class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <ChevronRight class="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Other Settings Sections -->
      <template v-if="activeSection === 'company-profile' || activeSection === 'integrations' || activeSection === 'billing' || activeSection === 'api-keys' || activeSection === 'security'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Paramètres</h1>
              <p class="text-sm text-gray-500 mt-1">Configurez votre compte et vos préférences</p>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-2xl space-y-6">
            <!-- Organization Configuration Card -->
            <div
              @click="showOrganizationModal = true"
              class="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border-2 border-orange-200 dark:border-orange-800 cursor-pointer hover:shadow-lg transition-all group"
            >
              <div class="flex items-start space-x-4">
                <div class="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building class="w-7 h-7 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">Configuration de l'organisation</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Gérez votre équipe, vos transporteurs et vos zones de livraison</p>
                  <div class="flex items-center space-x-4 mt-3">
                    <span class="flex items-center space-x-1 text-xs text-gray-500">
                      <Users class="w-4 h-4" />
                      <span>{{ teamMembers.length }} membres</span>
                    </span>
                    <span class="flex items-center space-x-1 text-xs text-gray-500">
                      <Truck class="w-4 h-4" />
                      <span>{{ configuredCarriers.length }} transporteurs</span>
                    </span>
                  </div>
                </div>
                <ChevronRight class="w-6 h-6 text-orange-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <!-- Other Settings -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
              <div class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <div class="flex items-center space-x-3">
                  <Bell class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Notifications</p>
                    <p class="text-sm text-gray-500">Email, Push</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-400" />
              </div>
              <div class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <div class="flex items-center space-x-3">
                  <Plug class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Intégrations</p>
                    <p class="text-sm text-gray-500">Connecter vos outils</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-400" />
              </div>
              <div class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <div class="flex items-center space-x-3">
                  <CreditCard class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Facturation</p>
                    <p class="text-sm text-gray-500">Abonnement et paiements</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-400" />
              </div>
              <div class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <div class="flex items-center space-x-3">
                  <Key class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Clés API</p>
                    <p class="text-sm text-gray-500">Gérer vos clés d'accès</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-400" />
              </div>
              <div class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <div class="flex items-center space-x-3">
                  <Lock class="w-5 h-5 text-gray-500" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Sécurité</p>
                    <p class="text-sm text-gray-500">Mot de passe, 2FA</p>
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </main>
      </template>
    </div>

    <!-- Shipment Detail Panel -->
    <div
      v-if="selectedShipment"
      class="fixed inset-y-0 right-0 w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <!-- Panel Header -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <span class="font-mono text-lg font-semibold text-gray-900 dark:text-white">{{ selectedShipment.trackingNumber }}</span>
            <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Échantillon</span>
          </div>
          <button @click="selectedShipment = null" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="flex items-center space-x-4 text-sm">
          <button
            @click="openLabelPreview(selectedShipment)"
            class="flex items-center space-x-1 text-orange-500 hover:text-orange-600 font-medium"
          >
            <Printer class="w-4 h-4" />
            <span>Imprimer le bordereau</span>
          </button>
          <button class="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-orange-500">
            <Eye class="w-4 h-4" />
            <span>Page de suivi</span>
          </button>
        </div>
      </div>

      <!-- Panel Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Delivery Status Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ selectedShipment.status === 'Delivered' ? 'Livrée' : selectedShipment.status === 'Out for delivery' ? 'En livraison' : selectedShipment.status === 'Pending' ? 'En attente' : selectedShipment.status }}
                {{ selectedShipment.deliveryDate ? 'le ' + selectedShipment.deliveryDate : '' }}
              </h3>
            </div>
            <div class="flex items-center space-x-2">
              <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ExternalLink class="w-4 h-4 text-gray-500" />
              </button>
              <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Mail class="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <!-- Transit Time Progress -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Temps de transit : {{ selectedShipment.transitDays }} jour{{ selectedShipment.transitDays !== 1 ? 's' : '' }}</p>
            <div class="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="absolute inset-y-0 left-0 bg-green-500 rounded-full"
                :style="{ width: selectedShipment.status === 'Delivered' ? '100%' : selectedShipment.status === 'Out for delivery' ? '80%' : selectedShipment.status === 'Pending' ? '10%' : '50%' }"
              ></div>
              <div class="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              <div
                class="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
                :class="selectedShipment.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
              ></div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-500">
              <span>Ramassé</span>
              <span>Livré</span>
            </div>
          </div>
        </div>

        <!-- Route -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Route</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedShipment.origin }} → {{ selectedShipment.destination }}</p>
        </div>

        <!-- Events Timeline -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="space-y-4">
            <div v-for="(event, index) in selectedShipment.events" :key="index" class="flex space-x-3">
              <div class="flex flex-col items-center">
                <div
                  :class="[
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    event.status === 'Livrée' ? 'bg-green-500' : event.status === 'En livraison' || event.status === 'En transit' ? 'bg-blue-500' : 'bg-gray-400'
                  ]"
                >
                  <Check v-if="event.completed && event.status === 'Livrée'" class="w-3 h-3 text-white" />
                  <Truck v-else-if="event.status === 'En livraison' || event.status === 'En transit'" class="w-3 h-3 text-white" />
                  <FileText v-else class="w-3 h-3 text-white" />
                </div>
                <div v-if="index < selectedShipment.events.length - 1" class="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1"></div>
              </div>
              <div class="flex-1 pb-4">
                <p class="font-medium text-gray-900 dark:text-white">{{ event.status }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ event.description }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ event.location }} • {{ selectedShipment.carrier }}</p>
                <p class="text-xs text-orange-500 mt-1 underline decoration-dotted cursor-help">{{ event.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipment Information -->
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Informations sur le colis</h4>
            <button class="text-sm text-orange-500 hover:underline">Modifier</button>
          </div>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-gray-500">N° de commande</p>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedShipment.orderNumber || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Nom du client</p>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedShipment.customerName || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Transporteur</p>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedShipment.carrier }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Service</p>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedShipment.service || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for detail panel -->
    <div
      v-if="selectedShipment"
      @click="selectedShipment = null"
      class="fixed inset-0 bg-black/30 z-40"
    ></div>

    <!-- Pickup Request Modal -->
    <Teleport to="body">
      <div v-if="showPickupRequestModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="showPickupRequestModal = false"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Demander un enlèvement</h3>
              <p class="text-sm text-gray-500 mt-1">{{ selectedPickups.length }} colis sélectionné{{ selectedPickups.length > 1 ? 's' : '' }}</p>
            </div>
            <button @click="showPickupRequestModal = false" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div class="space-y-4">
            <!-- Selected Shipments Summary -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colis à enlever</p>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div v-for="id in selectedPickups" :key="id" class="flex items-center justify-between text-sm">
                  <span class="font-mono text-gray-900 dark:text-white">{{ getShipmentById(id)?.trackingNumber }}</span>
                  <span class="text-gray-500">{{ getShipmentById(id)?.carrier }}</span>
                </div>
              </div>
            </div>

            <!-- Pickup Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'enlèvement</label>
              <input
                v-model="pickupDate"
                type="date"
                :min="minPickupDate"
                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <!-- Time Slot -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Créneau horaire</label>
              <select
                v-model="pickupTimeSlot"
                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un créneau</option>
                <option value="08:00 - 10:00">08:00 - 10:00</option>
                <option value="10:00 - 12:00">10:00 - 12:00</option>
                <option value="14:00 - 16:00">14:00 - 16:00</option>
                <option value="16:00 - 18:00">16:00 - 18:00</option>
              </select>
            </div>

            <!-- Pickup Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse d'enlèvement</label>
              <textarea
                v-model="pickupAddress"
                rows="2"
                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <!-- Carrier Info -->
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <AlertCircle class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div class="text-sm">
                  <p class="font-medium text-orange-800 dark:text-orange-200">Information importante</p>
                  <p class="text-orange-700 dark:text-orange-300 mt-1">Le transporteur passera à l'adresse indiquée pendant le créneau sélectionné. Assurez-vous que les colis sont prêts.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showPickupRequestModal = false"
              class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              @click="confirmPickupRequest"
              :disabled="!pickupDate || !pickupTimeSlot"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pickupDate && pickupTimeSlot
                  ? 'bg-primary-blue hover:bg-primary-blue-hover text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              ]"
            >
              Confirmer l'enlèvement
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Shipment Modal -->
    <Teleport to="body">
      <div v-if="showAddShipmentModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="closeAddShipmentModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Ajouter un colis</h3>
            <button @click="closeAddShipmentModal" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div class="p-4 space-y-4">
            <!-- Client Search with Autocomplete -->
            <div class="relative">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Client *</label>
              <div class="relative">
                <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="shipmentClientSearch"
                  @input="onShipmentClientSearch"
                  @focus="showClientSuggestions = true"
                  type="text"
                  placeholder="Rechercher un client..."
                  class="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <!-- Client Suggestions Dropdown -->
              <div v-if="showClientSuggestions && filteredShipmentClients.length > 0" class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <button
                  v-for="client in filteredShipmentClients"
                  :key="client.id"
                  @click="selectClientForShipment(client)"
                  class="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                >
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" :class="client.status === 'vip' ? 'bg-purple-100 text-purple-600' : client.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-primary-blue/10 text-primary-blue'">
                    {{ client.name.charAt(0) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ client.name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ client.phone }} • {{ client.region }}</p>
                  </div>
                  <span v-if="client.status === 'vip'" class="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">VIP</span>
                  <span v-if="client.status === 'blocked'" class="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">Bloqué</span>
                </button>
              </div>
              <!-- No results -->
              <div v-if="showClientSuggestions && shipmentClientSearch.length >= 2 && filteredShipmentClients.length === 0" class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p class="text-sm text-gray-500 text-center">Aucun client trouvé</p>
                <button @click="openNewClientFromShipment" class="w-full mt-2 px-3 py-2 text-sm font-medium text-primary-blue hover:bg-primary-blue/10 rounded-lg flex items-center justify-center space-x-1">
                  <Plus class="w-4 h-4" />
                  <span>Créer "{{ shipmentClientSearch }}"</span>
                </button>
              </div>
            </div>

            <!-- Selected Client Info -->
            <div v-if="selectedShipmentClient" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" :class="selectedShipmentClient.status === 'vip' ? 'bg-purple-100 text-purple-600' : 'bg-primary-blue/10 text-primary-blue'">
                    {{ selectedShipmentClient.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ selectedShipmentClient.name }}</p>
                    <p class="text-xs text-gray-500">{{ selectedShipmentClient.phone }}</p>
                  </div>
                </div>
                <button @click="clearSelectedClient" class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <X class="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p class="text-xs text-gray-500">Commandes</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedShipmentClient.totalOrders }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Taux</p>
                  <p class="text-sm font-semibold" :class="selectedShipmentClient.deliveryRate >= 80 ? 'text-green-600' : selectedShipmentClient.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">{{ selectedShipmentClient.deliveryRate }}%</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Total</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ selectedShipmentClient.totalSpent }} TND</p>
                </div>
              </div>
              <div v-if="selectedShipmentClient.status === 'blocked'" class="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center space-x-2">
                <AlertTriangle class="w-4 h-4 text-red-500 flex-shrink-0" />
                <p class="text-xs text-red-600 dark:text-red-400">Ce client est bloqué - faible taux de livraison</p>
              </div>
            </div>

            <!-- Delivery Address -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse de livraison *</label>
              <div class="relative">
                <MapPin class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="newShipment.address"
                  type="text"
                  :placeholder="selectedShipmentClient ? selectedShipmentClient.address : 'Adresse complète'"
                  class="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <!-- Shipment Type -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Type de colis *</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="newShipment.type = 'normal'"
                  :class="[
                    'p-3 rounded-xl border-2 text-center transition-all',
                    newShipment.type === 'normal'
                      ? 'border-primary-blue bg-primary-blue/10 dark:bg-primary-blue/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <Package class="w-5 h-5 mx-auto mb-1" :class="newShipment.type === 'normal' ? 'text-primary-blue' : 'text-gray-400'" />
                  <span class="text-xs font-medium" :class="newShipment.type === 'normal' ? 'text-primary-blue' : 'text-gray-600 dark:text-gray-400'">Normal</span>
                  <p class="text-[10px] text-gray-400 mt-0.5">Livraison simple</p>
                </button>
                <button
                  type="button"
                  @click="newShipment.type = 'exchange'"
                  :class="[
                    'p-3 rounded-xl border-2 text-center transition-all',
                    newShipment.type === 'exchange'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <RefreshCw class="w-5 h-5 mx-auto mb-1" :class="newShipment.type === 'exchange' ? 'text-orange-500' : 'text-gray-400'" />
                  <span class="text-xs font-medium" :class="newShipment.type === 'exchange' ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'">Échange</span>
                  <p class="text-[10px] text-gray-400 mt-0.5">Envoi + Retour</p>
                </button>
              </div>
            </div>

            <!-- Exchange Details (only for exchange type) -->
            <div v-if="newShipment.type === 'exchange'" class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800/30 space-y-3">
              <div class="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <RefreshCw class="w-3.5 h-3.5" />
                <span class="text-xs font-semibold">Détails de l'échange</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Raison *</label>
                  <select v-model="newShipment.exchangeReason" class="w-full px-2 py-1.5 border border-orange-200 dark:border-orange-800 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="">Sélectionner</option>
                    <option value="wrong_size">Mauvaise taille</option>
                    <option value="wrong_color">Mauvaise couleur</option>
                    <option value="defective">Défectueux</option>
                    <option value="wrong_product">Mauvais produit</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nb. articles *</label>
                  <input v-model.number="newShipment.exchangeItemCount" type="number" min="1" class="w-full px-2 py-1.5 border border-orange-200 dark:border-orange-800 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input v-model="newShipment.exchangeDescription" type="text" placeholder="Articles à récupérer" class="w-full px-2 py-1.5 border border-orange-200 dark:border-orange-800 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone *</label>
              <div class="relative">
                <PhoneIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="newShipment.phone"
                  type="tel"
                  :placeholder="selectedShipmentClient ? selectedShipmentClient.phone : 'Numéro de téléphone'"
                  class="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <!-- Amount -->
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Montant (TND) *</label>
                <div class="relative">
                  <Banknote class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="newShipment.amount"
                    type="number"
                    placeholder="0.00"
                    class="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <!-- Carrier -->
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Transporteur *</label>
                <select
                  v-model="newShipment.carrier"
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Sélectionner</option>
                  <option value="Yalidine">Yalidine</option>
                  <option value="ZR Express">ZR Express</option>
                  <option value="Maystro">Maystro</option>
                  <option value="Ecotrack">Ecotrack</option>
                </select>
              </div>
            </div>

            <!-- Product Description -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description du produit</label>
              <input
                v-model="newShipment.description"
                type="text"
                placeholder="Ex: T-shirt noir taille M"
                class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              @click="closeAddShipmentModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              @click="addShipment"
              :disabled="!canAddShipment"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2',
                canAddShipment ? 'bg-primary-blue hover:bg-primary-blue-hover text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]"
            >
              <Plus class="w-4 h-4" />
              <span>Créer le colis</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add/Edit Carrier Modal -->
    <Teleport to="body">
      <div v-if="showAddCarrierModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
        <div class="absolute inset-0 bg-black/50" @click="closeCarrierModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 z-10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingCarrier ? 'Modifier le transporteur' : 'Ajouter un transporteur' }}
            </h3>
            <button @click="closeCarrierModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- Section 1: Informations générales -->
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <Building2 class="w-4 h-4 mr-2" />
                Informations générales
              </h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du transporteur <span class="text-red-500">*</span>
                  </label>
                  <input v-model="newCarrier.name" type="text" placeholder="Ex: Aramex, DHL, etc." class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API ID <span class="text-red-500">*</span>
                    </label>
                    <input v-model="newCarrier.apiId" type="text" placeholder="Ex: CARRIER-API-001" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Key <span class="text-red-500">*</span>
                    </label>
                    <input v-model="newCarrier.apiKey" type="password" placeholder="Clé API secrète" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Grille tarifaire -->
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <Receipt class="w-4 h-4 mr-2" />
                Grille tarifaire (DT)
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frais colis livrés</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.fraisColisLivres" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frais colis retour</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.fraisColisRetour" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frais colis échange</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.fraisColisEchange" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frais colis volumineux (BIG)</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.fraisColisBig" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frais colis pickup</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.fraisColisPickup" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total frais de livraison</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.totalFraisLivraison" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Frais additionnels -->
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <DollarSign class="w-4 h-4 mr-2" />
                Frais additionnels
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frais de paiement</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.fraisPaiement" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">%</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Pourcentage prélevé sur le montant COD</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retenu de passage</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.retenuPassage" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Montant retenu par passage du livreur</p>
                </div>
              </div>
            </div>

            <!-- Section 4: Zones de couverture -->
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <MapPinned class="w-4 h-4 mr-2" />
                Zones de couverture
              </h4>

              <!-- All regions toggle -->
              <div class="mb-4">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="newCarrier.allRegions"
                    @change="handleAllRegionsToggle"
                    class="w-5 h-5 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
                  />
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Toutes les régions</span>
                  <span class="text-xs text-gray-500">(Activer ce transporteur pour tout le pays)</span>
                </label>
              </div>

              <!-- Region selection grid -->
              <div v-if="!newCarrier.allRegions" class="space-y-3">
                <p class="text-xs text-gray-500 mb-2">Sélectionnez les gouvernorats où ce transporteur est disponible :</p>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <label
                    v-for="gov in gouvernorats"
                    :key="gov"
                    class="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="gov"
                      v-model="newCarrier.regions"
                      class="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ gov }}</span>
                  </label>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ newCarrier.regions.length }} gouvernorat(s) sélectionné(s)</span>
                  <div class="space-x-2">
                    <button @click="selectAllRegions" type="button" class="text-orange-600 hover:text-orange-700">Tout sélectionner</button>
                    <span>|</span>
                    <button @click="clearAllRegions" type="button" class="text-gray-500 hover:text-gray-700">Tout effacer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="sticky bottom-0 bg-white dark:bg-gray-900 flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-800">
            <button @click="closeCarrierModal" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              Annuler
            </button>
            <button @click="saveCarrier" class="px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
              {{ editingCarrier ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Print Label Modal -->
    <Teleport to="body">
      <div v-if="showPrintLabelModal && labelToPrint" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="closePrintModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Aperçu du Bordereau</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="printLabel"
                class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium"
              >
                <Printer class="w-4 h-4" />
                <span>Imprimer</span>
              </button>
              <button @click="closePrintModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X class="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <!-- Label Preview -->
          <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 80px);">
            <div id="printable-label" class="bg-white border-2 border-gray-300 rounded-lg p-6 mx-auto" style="max-width: 400px;">
              <!-- Header with Logo and Barcode -->
              <div class="text-center border-b-2 border-gray-800 pb-4 mb-4">
                <div class="flex items-center justify-center space-x-2 mb-2">
                  <div class="p-1.5 bg-orange-500 rounded">
                    <Truck class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-lg font-bold text-gray-900">DeliveryTrack</span>
                </div>
                <div class="bg-gray-100 px-4 py-2 rounded">
                  <p class="font-mono text-lg font-bold tracking-wider text-gray-900">{{ labelToPrint.labelNumber }}</p>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ labelToPrint.trackingNumber }}</p>
              </div>

              <!-- Carrier Badge -->
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 bg-gray-800 text-white text-sm rounded font-semibold">{{ labelToPrint.carrier }}</span>
                <div class="flex items-center space-x-2">
                  <span v-if="labelToPrint.fragile" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium border border-red-300">⚠️ FRAGILE</span>
                  <span v-if="labelToPrint.cod" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium border border-green-300">COD</span>
                </div>
              </div>

              <!-- Sender Info -->
              <div class="border border-gray-300 rounded p-3 mb-3 bg-gray-50">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Expéditeur</p>
                <p class="font-semibold text-gray-900">{{ labelToPrint.senderName }}</p>
                <p class="text-sm text-gray-600">{{ labelToPrint.senderAddress }}</p>
                <p class="text-sm text-gray-600">Tél: {{ labelToPrint.senderPhone }}</p>
              </div>

              <!-- Recipient Info (Larger) -->
              <div class="border-2 border-gray-800 rounded p-4 mb-4 bg-white">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Destinataire</p>
                <p class="text-xl font-bold text-gray-900">{{ labelToPrint.customerName }}</p>
                <p class="text-sm text-gray-700 mt-1">{{ labelToPrint.recipientAddress }}</p>
                <p class="text-lg font-semibold text-gray-900 mt-2">📞 {{ labelToPrint.recipientPhone }}</p>
              </div>

              <!-- Package Details -->
              <div class="grid grid-cols-3 gap-2 mb-4">
                <div class="text-center p-2 bg-gray-100 rounded">
                  <p class="text-xs text-gray-500">Poids</p>
                  <p class="font-semibold text-gray-900">{{ labelToPrint.weight }} kg</p>
                </div>
                <div class="text-center p-2 bg-gray-100 rounded">
                  <p class="text-xs text-gray-500">Dimensions</p>
                  <p class="font-semibold text-gray-900">{{ labelToPrint.dimensions }}</p>
                </div>
                <div class="text-center p-2 bg-gray-100 rounded">
                  <p class="text-xs text-gray-500">Produit</p>
                  <p class="font-semibold text-gray-900 text-xs">{{ labelToPrint.productDescription }}</p>
                </div>
              </div>

              <!-- COD Amount -->
              <div v-if="labelToPrint.cod" class="border-2 border-green-500 rounded p-3 text-center bg-green-50">
                <p class="text-xs font-semibold text-green-600 uppercase">Montant à collecter (COD)</p>
                <p class="text-2xl font-bold text-green-700">{{ labelToPrint.cod?.toLocaleString() }} TND</p>
              </div>

              <!-- Route -->
              <div class="mt-4 pt-4 border-t border-gray-300">
                <div class="flex items-center justify-between text-sm">
                  <div class="text-center">
                    <p class="font-semibold text-gray-900">{{ labelToPrint.origin }}</p>
                    <p class="text-xs text-gray-500">Origine</p>
                  </div>
                  <div class="flex-1 border-t-2 border-dashed border-gray-400 mx-4"></div>
                  <div class="text-center">
                    <p class="font-semibold text-gray-900">{{ labelToPrint.destination }}</p>
                    <p class="text-xs text-gray-500">Destination</p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-4 pt-3 border-t border-gray-300 text-center">
                <p class="text-xs text-gray-500">Commande: {{ labelToPrint.orderNumber }}</p>
                <p class="text-xs text-gray-400 mt-1">Généré le {{ new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Organization Setup Modal -->
    <Teleport to="body">
      <div v-if="showOrganizationModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="closeOrganizationModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Building class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Configuration de l'organisation</h3>
                <p class="text-sm text-gray-500">Gérez votre équipe et vos transporteurs</p>
              </div>
            </div>
            <button @click="closeOrganizationModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200 dark:border-gray-800">
            <div class="flex space-x-1 px-4">
              <button
                v-for="tab in organizationTabs"
                :key="tab.id"
                @click="activeOrgTab = tab.id"
                class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                :class="activeOrgTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'"
              >
                <div class="flex items-center space-x-2">
                  <component :is="tab.icon" class="w-4 h-4" />
                  <span>{{ tab.label }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- General Tab -->
            <div v-if="activeOrgTab === 'general'" class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'organisation *</label>
                  <input
                    v-model="organization.name"
                    type="text"
                    placeholder="Ex: Mon Enterprise SARL"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email principal</label>
                  <input
                    v-model="organization.email"
                    type="email"
                    placeholder="contact@enterprise.tn"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                  <input
                    v-model="organization.phone"
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse siège</label>
                  <input
                    v-model="organization.address"
                    type="text"
                    placeholder="Adresse complète"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matricule fiscal</label>
                  <input
                    v-model="organization.taxId"
                    type="text"
                    placeholder="000000AAA000"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registre de commerce</label>
                  <input
                    v-model="organization.rcNumber"
                    type="text"
                    placeholder="B0000002020"
                    class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <!-- Team Members Tab -->
            <div v-if="activeOrgTab === 'team'" class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-base font-semibold text-gray-900 dark:text-white">Membres de l'équipe</h4>
                  <p class="text-sm text-gray-500">{{ teamMembers.length }} membre(s) dans votre organisation</p>
                </div>
                <button
                  @click="showAddMemberForm = true"
                  class="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus class="w-4 h-4" />
                  <span>Ajouter un membre</span>
                </button>
              </div>

              <!-- Add Member Form -->
              <div v-if="showAddMemberForm" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Nouveau membre</h5>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom complet *</label>
                    <input
                      v-model="newMemberForm.name"
                      type="text"
                      placeholder="Ahmed Ben Ali"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email *</label>
                    <input
                      v-model="newMemberForm.email"
                      type="email"
                      placeholder="ahmed@enterprise.tn"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rôle *</label>
                    <select
                      v-model="newMemberForm.role"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="admin">Administrateur</option>
                      <option value="manager">Manager</option>
                      <option value="operator">Opérateur</option>
                      <option value="viewer">Lecteur</option>
                    </select>
                  </div>
                </div>
                <div class="flex items-center justify-end space-x-3 mt-4">
                  <button @click="showAddMemberForm = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                  <button
                    @click="addTeamMember"
                    :disabled="!newMemberForm.name || !newMemberForm.email || !newMemberForm.role"
                    class="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <!-- Members List -->
              <div class="space-y-3">
                <div
                  v-for="member in teamMembers"
                  :key="member.id"
                  class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white" :style="{ backgroundColor: member.color }">
                      {{ member.initials }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ member.name }}</p>
                      <p class="text-sm text-gray-500">{{ member.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 text-xs font-medium rounded-full" :class="getRoleClass(member.role)">
                      {{ getRoleLabel(member.role) }}
                    </span>
                    <button @click="removeMember(member.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Carriers Tab -->
            <div v-if="activeOrgTab === 'carriers'" class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-base font-semibold text-gray-900 dark:text-white">Transporteurs configurés</h4>
                  <p class="text-sm text-gray-500">Configurez vos partenaires de livraison</p>
                </div>
                <button
                  @click="showAddCarrierForm = true"
                  class="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus class="w-4 h-4" />
                  <span>Ajouter un transporteur</span>
                </button>
              </div>

              <!-- Carrier Selection -->
              <div v-if="showAddCarrierForm" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sélectionner un transporteur</h5>
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="carrier in availableCarriers"
                    :key="carrier.id"
                    @click="selectCarrierToAdd(carrier)"
                    class="p-4 border-2 rounded-xl text-left transition-all hover:border-orange-300"
                    :class="selectedCarrierToAdd?.id === carrier.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: carrier.bgColor }">
                        <Truck class="w-5 h-5" :style="{ color: carrier.color }" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white text-sm">{{ carrier.name }}</p>
                        <p class="text-xs text-gray-500">{{ carrier.deliveryTime }}</p>
                      </div>
                    </div>
                  </button>
                </div>

                <!-- Carrier Config Form -->
                <div v-if="selectedCarrierToAdd" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div v-for="field in selectedCarrierToAdd.configFields" :key="field.key">
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {{ field.label }}
                      <span v-if="field.required" class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-if="field.type === 'text' || field.type === 'password'"
                        v-model="carrierConfigForm[field.key]"
                        :type="field.type === 'password' && !showPassword['new_' + field.key] ? 'password' : 'text'"
                        :placeholder="field.placeholder"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                      <button
                        v-if="field.type === 'password'"
                        @click="togglePasswordVisibility('new_' + field.key)"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye v-if="!showPassword['new_' + field.key]" class="w-4 h-4" />
                        <EyeOff v-else class="w-4 h-4" />
                      </button>
                      <select
                        v-if="field.type === 'select'"
                        v-model="carrierConfigForm[field.key]"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="">Sélectionner...</option>
                        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-end space-x-3 mt-4">
                  <button @click="cancelAddCarrier" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                  <button
                    @click="testAndAddCarrier"
                    :disabled="!selectedCarrierToAdd || testingConnection === 'new'"
                    class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <RefreshCw v-if="testingConnection === 'new'" class="w-4 h-4 animate-spin" />
                    <span>{{ testingConnection === 'new' ? 'Connexion...' : 'Tester et ajouter' }}</span>
                  </button>
                </div>
              </div>

              <!-- Configured Carriers List -->
              <div class="space-y-3">
                <div
                  v-for="carrier in configuredCarriers"
                  :key="carrier.id"
                  class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 rounded-lg flex items-center justify-center" :style="{ backgroundColor: carrier.bgColor }">
                        <Truck class="w-6 h-6" :style="{ color: carrier.color }" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
                        <p class="text-sm text-gray-500">{{ carrier.description }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Actif</span>
                      <button
                        @click="expandedConfiguredCarrier = expandedConfiguredCarrier === carrier.id ? null : carrier.id"
                        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Settings class="w-4 h-4" />
                      </button>
                      <button @click="removeConfiguredCarrier(carrier.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Zones Configuration -->
                  <div v-if="expandedConfiguredCarrier === carrier.id" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Zones de livraison</h5>
                    <div class="grid grid-cols-4 gap-2">
                      <button
                        v-for="gov in governorates"
                        :key="gov"
                        @click="toggleCarrierZone(carrier.id, gov)"
                        class="px-3 py-2 text-xs rounded-lg border transition-colors"
                        :class="carrier.zones?.includes(gov)
                          ? 'bg-orange-100 border-orange-500 text-orange-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                      >
                        {{ gov }}
                      </button>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                      <p class="text-sm text-gray-500">{{ carrier.zones?.length || 0 }} zone(s) sélectionnée(s)</p>
                      <div class="flex space-x-2">
                        <button @click="selectAllZones(carrier.id)" class="text-xs text-orange-600 hover:underline">Tout sélectionner</button>
                        <button @click="clearAllZones(carrier.id)" class="text-xs text-gray-500 hover:underline">Tout désélectionner</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="configuredCarriers.length === 0" class="text-center py-8">
                  <Truck class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p class="text-gray-500">Aucun transporteur configuré</p>
                  <p class="text-sm text-gray-400">Ajoutez vos partenaires de livraison</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              @click="closeOrganizationModal"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              @click="saveOrganization"
              class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
            >
              <Check class="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Recharge Modal -->
    <div v-if="showRechargeModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showRechargeModal = false"></div>
      <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recharger mon solde</h3>
            <p class="text-sm text-gray-500 mt-0.5">Achetez des crédits pour vos colis</p>
          </div>
          <button @click="showRechargeModal = false" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-5 space-y-5">
          <!-- Current Balance -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
              <div class="flex items-center gap-2 mb-2">
                <Package class="w-5 h-5 text-orange-500" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Colis Livré</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ userBalance.delivered }}</p>
              <p class="text-xs text-gray-500">crédits restants</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-2 mb-2">
                <RefreshCw class="w-5 h-5 text-gray-500" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Colis Retour</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ userBalance.returned }}</p>
              <p class="text-xs text-gray-500">crédits restants</p>
            </div>
          </div>

          <!-- Recharge Options -->
          <div class="space-y-4">
            <!-- Delivered packages -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Colis Livré <span class="text-gray-400 font-normal">(150 millimes/colis)</span>
              </label>
              <div class="flex items-center gap-2">
                <button
                  v-for="amount in [100, 500, 1000, 2000]"
                  :key="'d-' + amount"
                  @click="rechargeForm.delivered = amount"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    rechargeForm.delivered === amount
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  {{ amount }}
                </button>
                <input
                  v-model.number="rechargeForm.delivered"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Autre"
                  class="w-24 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <!-- Returned packages -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Colis Retour <span class="text-gray-400 font-normal">(50 millimes/colis)</span>
              </label>
              <div class="flex items-center gap-2">
                <button
                  v-for="amount in [50, 100, 200, 500]"
                  :key="'r-' + amount"
                  @click="rechargeForm.returned = amount"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    rechargeForm.returned === amount
                      ? 'bg-gray-700 text-white dark:bg-gray-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  {{ amount }}
                </button>
                <input
                  v-model.number="rechargeForm.returned"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="Autre"
                  class="w-24 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ rechargeForm.delivered }} colis livré × 150 mill</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ (rechargeForm.delivered * 0.150).toFixed(3) }} TND</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ rechargeForm.returned }} colis retour × 50 mill</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ (rechargeForm.returned * 0.050).toFixed(3) }} TND</span>
            </div>
            <div class="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span class="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span class="text-xl font-bold text-orange-500">{{ rechargeTotalPrice.toFixed(3) }} TND</span>
            </div>
          </div>

          <!-- Payment Method -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode de paiement</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                @click="rechargeForm.paymentMethod = 'card'"
                :class="[
                  'p-3 rounded-xl border-2 text-center transition-colors',
                  rechargeForm.paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                ]"
              >
                <CreditCard class="w-6 h-6 mx-auto mb-1" :class="rechargeForm.paymentMethod === 'card' ? 'text-orange-500' : 'text-gray-400'" />
                <span class="text-xs font-medium" :class="rechargeForm.paymentMethod === 'card' ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'">Carte</span>
              </button>
              <button
                @click="rechargeForm.paymentMethod = 'bank'"
                :class="[
                  'p-3 rounded-xl border-2 text-center transition-colors',
                  rechargeForm.paymentMethod === 'bank'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                ]"
              >
                <Building class="w-6 h-6 mx-auto mb-1" :class="rechargeForm.paymentMethod === 'bank' ? 'text-orange-500' : 'text-gray-400'" />
                <span class="text-xs font-medium" :class="rechargeForm.paymentMethod === 'bank' ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'">Virement</span>
              </button>
              <button
                @click="rechargeForm.paymentMethod = 'd17'"
                :class="[
                  'p-3 rounded-xl border-2 text-center transition-colors',
                  rechargeForm.paymentMethod === 'd17'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                ]"
              >
                <Smartphone class="w-6 h-6 mx-auto mb-1" :class="rechargeForm.paymentMethod === 'd17' ? 'text-orange-500' : 'text-gray-400'" />
                <span class="text-xs font-medium" :class="rechargeForm.paymentMethod === 'd17' ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'">D17</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-800">
          <button @click="showRechargeModal = false" class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Annuler
          </button>
          <button
            @click="processRecharge"
            :disabled="rechargeTotalPrice === 0"
            :class="[
              'px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2',
              rechargeTotalPrice > 0
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-gray-300 cursor-not-allowed'
            ]"
          >
            <Wallet class="w-4 h-4" />
            Payer {{ rechargeTotalPrice.toFixed(3) }} TND
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, markRaw, watch } from 'vue'
import {
  Home,
  Radar,
  Shield,
  FileText,
  Mail,
  BarChart3,
  RefreshCw,
  Grid3x3,
  Clock,
  Leaf,
  Smartphone,
  Lightbulb,
  HelpCircle,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Camera,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  FileSpreadsheet,
  LayoutGrid,
  Bell,
  Package,
  X,
  MessageSquare,
  Webhook,
  Truck,
  RotateCcw,
  Sparkles,
  Rss,
  MessageCircle,
  LayoutTemplate,
  Star,
  PanelLeft,
  Gift,
  Code,
  PanelLeftClose,
  Eye,
  EyeOff,
  Check,
  PackageOpen,
  AlertCircle,
  Printer,
  Banknote,
  User,
  MapPin,
  // New icons for restructured navigation
  LayoutDashboard,
  CalendarClock,
  Calendar,
  ArrowLeftRight,
  Building2,
  Wallet,
  TrendingUp,
  Activity,
  History,
  Filter,
  FileUp,
  FileCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Receipt,
  FileDown,
  Target,
  Brain,
  MapPinned,
  LineChart,
  FileBarChart,
  Building,
  Users,
  Plug,
  CreditCard,
  Key,
  Lock,
  CircleDot,
  PackageX,
  PackageCheck,
  Timer,
  MoreHorizontal,
  Globe,
  Palette,
  Layout,
  MousePointerClick,
  SearchX,
  Phone as PhoneIcon,
  Ban,
  BarChart2,
  TrendingDown,
  Gem,
  ShoppingBag,
  UserX,
  LogOut
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.signOut()
  router.push('/signin')
}

// Main section state with persistence
const savedMainSection = localStorage.getItem('deliveryTracker_mainSection')
const savedActiveSection = localStorage.getItem('deliveryTracker_activeSection')
const mainSection = ref(savedMainSection || 'dashboard')
const activeSection = ref(savedActiveSection || 'overview')

// Watch and persist state changes
watch(mainSection, (newVal) => {
  localStorage.setItem('deliveryTracker_mainSection', newVal)
})
watch(activeSection, (newVal) => {
  localStorage.setItem('deliveryTracker_activeSection', newVal)
})

// Boutiques management
interface Boutique {
  id: string
  name: string
  email: string
  initials: string
  color: string
}

const boutiques = ref<Boutique[]>([
  { id: '1', name: 'Ma Boutique', email: 'admin@maboutique.tn', initials: 'MB', color: '#f97316' },
  { id: '2', name: 'Shop Express', email: 'contact@shopexpress.tn', initials: 'SE', color: '#3b82f6' },
  { id: '3', name: 'Mode & Style', email: 'info@modestyle.tn', initials: 'MS', color: '#8b5cf6' },
])

// User balance for package credits
const userBalance = ref({
  delivered: 847,
  returned: 156
})

// Recharge modal
const showRechargeModal = ref(false)
const rechargeForm = ref({
  delivered: 500,
  returned: 100,
  paymentMethod: 'card' as 'card' | 'bank' | 'd17'
})

const rechargeTotalPrice = computed(() => {
  return (rechargeForm.value.delivered * 0.150) + (rechargeForm.value.returned * 0.050)
})

function processRecharge() {
  const deliveredAdded = rechargeForm.value.delivered
  const returnedAdded = rechargeForm.value.returned

  // Add the purchased credits to balance
  userBalance.value.delivered += deliveredAdded
  userBalance.value.returned += returnedAdded

  // Close modal and reset form
  showRechargeModal.value = false
  rechargeForm.value = { delivered: 500, returned: 100, paymentMethod: 'card' }
}

const savedBoutiqueId = localStorage.getItem('deliveryTracker_currentBoutique')
const currentBoutiqueId = ref(savedBoutiqueId || '1')
const showBoutiqueDropdown = ref(false)
const showAddBoutiqueModal = ref(false)

const currentBoutique = computed(() => {
  return boutiques.value.find(b => b.id === currentBoutiqueId.value) || boutiques.value[0]
})

function selectBoutique(boutique: Boutique) {
  currentBoutiqueId.value = boutique.id
  localStorage.setItem('deliveryTracker_currentBoutique', boutique.id)
  showBoutiqueDropdown.value = false
}

// Boutique form data
const governorates = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
  'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'
]

const boutiqueColors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6']

interface CarrierConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'select'
  placeholder?: string
  required?: boolean
  hint?: string
  options?: { value: string; label: string }[]
}

interface DeliveryCarrier {
  id: string
  name: string
  description: string
  type: 'express' | 'standard'
  deliveryTime: string
  color: string
  bgColor: string
  logo?: string
  configFields: CarrierConfigField[]
}

const deliveryCarriers: DeliveryCarrier[] = [
  {
    id: 'aramex',
    name: 'Aramex',
    description: 'Livraison express internationale',
    type: 'express',
    deliveryTime: '24-48h',
    color: '#E31837',
    bgColor: '#FEE2E2',
    configFields: [
      { key: 'accountNumber', label: 'Numéro de compte', type: 'text', placeholder: 'Votre numéro de compte Aramex', required: true },
      { key: 'username', label: 'Nom d\'utilisateur API', type: 'text', placeholder: 'Username', required: true },
      { key: 'password', label: 'Mot de passe API', type: 'password', placeholder: '••••••••', required: true },
      { key: 'accountPin', label: 'Code PIN', type: 'password', placeholder: 'PIN à 4 chiffres', required: true },
      { key: 'accountEntity', label: 'Entité', type: 'text', placeholder: 'TUN', required: true },
      { key: 'accountCountryCode', label: 'Code pays', type: 'text', placeholder: 'TN', required: true },
    ]
  },
  {
    id: 'rapid-poste',
    name: 'Rapid Poste',
    description: 'Service postal national rapide',
    type: 'express',
    deliveryTime: '24-72h',
    color: '#FFB800',
    bgColor: '#FEF3C7',
    configFields: [
      { key: 'clientId', label: 'ID Client', type: 'text', placeholder: 'Votre identifiant client', required: true },
      { key: 'apiKey', label: 'Clé API', type: 'password', placeholder: 'Votre clé API', required: true },
      { key: 'contractNumber', label: 'Numéro de contrat', type: 'text', placeholder: 'Numéro de contrat', required: true },
    ]
  },
  {
    id: 'logidis',
    name: 'Logidis',
    description: 'Distribution logistique locale',
    type: 'standard',
    deliveryTime: '48-72h',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    configFields: [
      { key: 'apiToken', label: 'Token API', type: 'password', placeholder: 'Votre token d\'authentification', required: true },
      { key: 'merchantId', label: 'ID Marchand', type: 'text', placeholder: 'Votre ID marchand', required: true },
      { key: 'warehouseCode', label: 'Code entrepôt', type: 'text', placeholder: 'Code de votre entrepôt', required: false, hint: 'Optionnel si vous utilisez l\'entrepôt par défaut' },
    ]
  },
  {
    id: 'sotudis',
    name: 'Sotudis',
    description: 'Distribution nationale Tunisie',
    type: 'standard',
    deliveryTime: '48-96h',
    color: '#059669',
    bgColor: '#D1FAE5',
    configFields: [
      { key: 'companyCode', label: 'Code société', type: 'text', placeholder: 'Code de votre société', required: true },
      { key: 'username', label: 'Utilisateur', type: 'text', placeholder: 'Nom d\'utilisateur', required: true },
      { key: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••', required: true },
      { key: 'pickupAddress', label: 'Adresse d\'enlèvement', type: 'text', placeholder: 'Adresse par défaut pour enlèvements', required: false },
    ]
  },
  {
    id: 'express-post',
    name: 'Express Post',
    description: 'Livraison express premium',
    type: 'express',
    deliveryTime: '24h',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    configFields: [
      { key: 'apiKey', label: 'Clé API', type: 'password', placeholder: 'Clé d\'accès API', required: true },
      { key: 'secretKey', label: 'Clé secrète', type: 'password', placeholder: 'Clé secrète', required: true },
      { key: 'environment', label: 'Environnement', type: 'select', required: true, options: [
        { value: 'sandbox', label: 'Sandbox (Test)' },
        { value: 'production', label: 'Production' }
      ]},
    ]
  },
  {
    id: 'colis-tunisie',
    name: 'Colis Tunisie',
    description: 'Service économique national',
    type: 'standard',
    deliveryTime: '72-96h',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    configFields: [
      { key: 'accountId', label: 'ID Compte', type: 'text', placeholder: 'Identifiant de compte', required: true },
      { key: 'token', label: 'Token d\'accès', type: 'password', placeholder: 'Token d\'authentification', required: true },
    ]
  },
]

// Boutique form state
const boutiqueFormStep = ref(1)
const expandedCarrierConfig = ref<string | null>(null)
const testingConnection = ref<string | null>(null)
const connectionTestResults = ref<Record<string, { success: boolean; message: string }>>({})
const showPassword = ref<Record<string, boolean>>({})

interface NewBoutiqueForm {
  name: string
  email: string
  phone: string
  address: string
  governorate: string
  color: string
  selectedCarriers: string[]
  carrierConfigs: Record<string, Record<string, string>>
  assignedMembers: string[]
}

const newBoutiqueForm = reactive<NewBoutiqueForm>({
  name: '',
  email: '',
  phone: '',
  address: '',
  governorate: '',
  color: '#f97316',
  selectedCarriers: [],
  carrierConfigs: {},
  assignedMembers: []
})

// Organization management
interface TeamMember {
  id: string
  name: string
  email: string
  initials: string
  color: string
  role: 'admin' | 'manager' | 'operator' | 'viewer'
  boutiques: string[]
}

interface ConfiguredCarrier extends DeliveryCarrier {
  config: Record<string, string>
  zones: string[]
}

const showOrganizationModal = ref(false)
const activeOrgTab = ref('general')
const showAddMemberForm = ref(false)
const showAddCarrierForm = ref(false)
const selectedCarrierToAdd = ref<DeliveryCarrier | null>(null)
const carrierConfigForm = ref<Record<string, string>>({})
const expandedConfiguredCarrier = ref<string | null>(null)

const organizationTabs = [
  { id: 'general', label: 'Général', icon: markRaw(Building) },
  { id: 'team', label: 'Équipe', icon: markRaw(Users) },
  { id: 'carriers', label: 'Transporteurs', icon: markRaw(Truck) },
]

const organization = reactive({
  name: 'Mon Organisation',
  email: 'contact@organisation.tn',
  phone: '+216 70 000 000',
  address: 'Tunis, Tunisia',
  taxId: '',
  rcNumber: ''
})

const teamMembers = ref<TeamMember[]>([
  { id: '1', name: 'Ahmed Ben Ali', email: 'ahmed@org.tn', initials: 'AB', color: '#3b82f6', role: 'admin', boutiques: ['1', '2'] },
  { id: '2', name: 'Sarra Mansour', email: 'sarra@org.tn', initials: 'SM', color: '#8b5cf6', role: 'manager', boutiques: ['1'] },
  { id: '3', name: 'Mohamed Trabelsi', email: 'mohamed@org.tn', initials: 'MT', color: '#10b981', role: 'operator', boutiques: ['2', '3'] },
])

const configuredCarriers = ref<ConfiguredCarrier[]>([
  {
    ...deliveryCarriers[0], // Aramex
    config: { accountNumber: '12345', username: 'user', password: '****', accountPin: '1234', accountEntity: 'TUN', accountCountryCode: 'TN' },
    zones: ['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Sousse', 'Sfax']
  },
  {
    ...deliveryCarriers[2], // Logidis
    config: { apiToken: '****', merchantId: 'M001' },
    zones: governorates
  }
])

const newMemberForm = reactive({
  name: '',
  email: '',
  role: '' as string,
  boutiques: [] as string[]
})

const availableCarriers = computed(() => {
  const configuredIds = configuredCarriers.value.map(c => c.id)
  return deliveryCarriers.filter(c => !configuredIds.includes(c.id))
})

const canCreateBoutiqueSimple = computed(() => {
  return newBoutiqueForm.name.trim() && newBoutiqueForm.email.trim() && newBoutiqueForm.phone.trim()
})

function toggleMemberAssignment(memberId: string) {
  const index = newBoutiqueForm.assignedMembers.indexOf(memberId)
  if (index === -1) {
    newBoutiqueForm.assignedMembers.push(memberId)
  } else {
    newBoutiqueForm.assignedMembers.splice(index, 1)
  }
}

function goToTeamSettings() {
  closeAddBoutiqueModal()
  showOrganizationModal.value = true
  activeOrgTab.value = 'team'
}

function createBoutiqueSimple() {
  if (!canCreateBoutiqueSimple.value) return

  const initials = newBoutiqueForm.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  const newBoutique: Boutique = {
    id: Date.now().toString(),
    name: newBoutiqueForm.name,
    email: newBoutiqueForm.email,
    initials: initials || 'NB',
    color: newBoutiqueForm.color
  }

  boutiques.value.push(newBoutique)

  // Assign members to this boutique
  newBoutiqueForm.assignedMembers.forEach(memberId => {
    const member = teamMembers.value.find(m => m.id === memberId)
    if (member && !member.boutiques.includes(newBoutique.id)) {
      member.boutiques.push(newBoutique.id)
    }
  })

  selectBoutique(newBoutique)
  closeAddBoutiqueModal()
}

function closeOrganizationModal() {
  showOrganizationModal.value = false
  showAddMemberForm.value = false
  showAddCarrierForm.value = false
  selectedCarrierToAdd.value = null
  carrierConfigForm.value = {}
}

function toggleBoutiqueForMember(boutiqueId: string) {
  const index = newMemberForm.boutiques.indexOf(boutiqueId)
  if (index === -1) {
    newMemberForm.boutiques.push(boutiqueId)
  } else {
    newMemberForm.boutiques.splice(index, 1)
  }
}

function addTeamMember() {
  if (!newMemberForm.name || !newMemberForm.email || !newMemberForm.role) return

  const initials = newMemberForm.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#ec4899', '#6366f1']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  teamMembers.value.push({
    id: Date.now().toString(),
    name: newMemberForm.name,
    email: newMemberForm.email,
    initials,
    color: randomColor,
    role: newMemberForm.role as TeamMember['role'],
    boutiques: [...newMemberForm.boutiques]
  })

  // Reset form
  newMemberForm.name = ''
  newMemberForm.email = ''
  newMemberForm.role = ''
  newMemberForm.boutiques = []
  showAddMemberForm.value = false
}

function removeMember(memberId: string) {
  const index = teamMembers.value.findIndex(m => m.id === memberId)
  if (index !== -1) {
    teamMembers.value.splice(index, 1)
  }
}

function getRoleClass(role: string): string {
  const classes: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    operator: 'bg-green-100 text-green-700',
    viewer: 'bg-gray-100 text-gray-700'
  }
  return classes[role] || 'bg-gray-100 text-gray-700'
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    manager: 'Manager',
    operator: 'Opérateur',
    viewer: 'Lecteur'
  }
  return labels[role] || role
}

function getBoutiqueById(boutiqueId: string): Boutique | undefined {
  return boutiques.value.find(b => b.id === boutiqueId)
}

function selectCarrierToAdd(carrier: DeliveryCarrier) {
  selectedCarrierToAdd.value = carrier
  carrierConfigForm.value = {}
}

function cancelAddCarrier() {
  showAddCarrierForm.value = false
  selectedCarrierToAdd.value = null
  carrierConfigForm.value = {}
}

async function testAndAddCarrier() {
  if (!selectedCarrierToAdd.value) return

  testingConnection.value = 'new'
  await new Promise(resolve => setTimeout(resolve, 1500))
  testingConnection.value = null

  // Add carrier
  configuredCarriers.value.push({
    ...selectedCarrierToAdd.value,
    config: { ...carrierConfigForm.value },
    zones: []
  })

  cancelAddCarrier()
}

function removeConfiguredCarrier(carrierId: string) {
  const index = configuredCarriers.value.findIndex(c => c.id === carrierId)
  if (index !== -1) {
    configuredCarriers.value.splice(index, 1)
  }
}

function toggleCarrierZone(carrierId: string, zone: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (!carrier) return

  if (!carrier.zones) carrier.zones = []

  const index = carrier.zones.indexOf(zone)
  if (index === -1) {
    carrier.zones.push(zone)
  } else {
    carrier.zones.splice(index, 1)
  }
}

function selectAllZones(carrierId: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (carrier) {
    carrier.zones = [...governorates]
  }
}

function clearAllZones(carrierId: string) {
  const carrier = configuredCarriers.value.find(c => c.id === carrierId)
  if (carrier) {
    carrier.zones = []
  }
}

function saveOrganization() {
  // Save organization data (in real app, this would call an API)
  closeOrganizationModal()
}

// Initialize carrier configs when carriers are selected
watch(() => newBoutiqueForm.selectedCarriers, (carriers) => {
  carriers.forEach(carrierId => {
    if (!newBoutiqueForm.carrierConfigs[carrierId]) {
      newBoutiqueForm.carrierConfigs[carrierId] = {}
    }
  })
}, { deep: true })

function toggleCarrierSelection(carrierId: string) {
  const index = newBoutiqueForm.selectedCarriers.indexOf(carrierId)
  if (index === -1) {
    newBoutiqueForm.selectedCarriers.push(carrierId)
    newBoutiqueForm.carrierConfigs[carrierId] = {}
  } else {
    newBoutiqueForm.selectedCarriers.splice(index, 1)
    delete newBoutiqueForm.carrierConfigs[carrierId]
  }
}

function toggleCarrierConfig(carrierId: string) {
  expandedCarrierConfig.value = expandedCarrierConfig.value === carrierId ? null : carrierId
}

function getCarrierById(carrierId: string): DeliveryCarrier | undefined {
  return deliveryCarriers.find(c => c.id === carrierId)
}

function getCarrierConfigStatus(carrierId: string): string {
  const carrier = getCarrierById(carrierId)
  if (!carrier) return ''

  const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
  const requiredFields = carrier.configFields.filter(f => f.required)
  const filledRequired = requiredFields.filter(f => config[f.key]?.trim())

  if (filledRequired.length === 0) return 'Non configuré'
  if (filledRequired.length < requiredFields.length) return `${filledRequired.length}/${requiredFields.length} champs requis`
  return 'Configuré'
}

function togglePasswordVisibility(fieldKey: string) {
  showPassword.value[fieldKey] = !showPassword.value[fieldKey]
}

async function testCarrierConnection(carrierId: string) {
  testingConnection.value = carrierId
  // Simulate API test
  await new Promise(resolve => setTimeout(resolve, 1500))

  const carrier = getCarrierById(carrierId)
  const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
  const requiredFields = carrier?.configFields.filter(f => f.required) || []
  const allFilled = requiredFields.every(f => config[f.key]?.trim())

  connectionTestResults.value[carrierId] = {
    success: allFilled,
    message: allFilled ? 'Connexion réussie!' : 'Échec: Vérifiez vos identifiants'
  }
  testingConnection.value = null
}

const canProceedToNextStep = computed(() => {
  if (boutiqueFormStep.value === 1) {
    return newBoutiqueForm.name.trim() && newBoutiqueForm.email.trim() && newBoutiqueForm.phone.trim()
  }
  if (boutiqueFormStep.value === 2) {
    return newBoutiqueForm.selectedCarriers.length > 0
  }
  return true
})

const canCreateBoutique = computed(() => {
  // Check if all required fields for selected carriers are filled
  return newBoutiqueForm.selectedCarriers.every(carrierId => {
    const carrier = getCarrierById(carrierId)
    if (!carrier) return false

    const config = newBoutiqueForm.carrierConfigs[carrierId] || {}
    return carrier.configFields
      .filter(f => f.required)
      .every(f => config[f.key]?.trim())
  })
})

function nextBoutiqueFormStep() {
  if (canProceedToNextStep.value && boutiqueFormStep.value < 3) {
    boutiqueFormStep.value++
  }
}

function closeAddBoutiqueModal() {
  showAddBoutiqueModal.value = false
  // Reset form
  boutiqueFormStep.value = 1
  newBoutiqueForm.name = ''
  newBoutiqueForm.email = ''
  newBoutiqueForm.phone = ''
  newBoutiqueForm.address = ''
  newBoutiqueForm.governorate = ''
  newBoutiqueForm.color = '#f97316'
  newBoutiqueForm.selectedCarriers = []
  newBoutiqueForm.carrierConfigs = {}
  newBoutiqueForm.assignedMembers = []
  connectionTestResults.value = {}
  expandedCarrierConfig.value = null
}

function createBoutique() {
  if (!canCreateBoutique.value) return

  // Generate initials from name
  const initials = newBoutiqueForm.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  // Create new boutique
  const newBoutique: Boutique = {
    id: Date.now().toString(),
    name: newBoutiqueForm.name,
    email: newBoutiqueForm.email,
    initials: initials || 'NB',
    color: newBoutiqueForm.color
  }

  boutiques.value.push(newBoutique)

  // Select the new boutique
  selectBoutique(newBoutique)

  // Close modal
  closeAddBoutiqueModal()
}

// Navigation structures
const mainNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: markRaw(LayoutDashboard) },
  { id: 'clients', label: 'Clients', icon: markRaw(Users) },
  { id: 'shipments', label: 'Colis', icon: markRaw(Package) },
  { id: 'pickups', label: 'Enlèvements', icon: markRaw(Truck) },
  { id: 'returns', label: 'Retours', icon: markRaw(RotateCcw) },
  { id: 'carriers', label: 'Transporteurs', icon: markRaw(Building2) },
  { id: 'tracking-page', label: 'Page de suivi', icon: markRaw(Globe) },
  { id: 'finance', label: 'Finance', icon: markRaw(Wallet) },
  { id: 'analytics', label: 'Analytiques', icon: markRaw(BarChart3) },
  { id: 'settings', label: 'Paramètres', icon: markRaw(Settings) },
]

const subNavigation: Record<string, Array<{ id: string; label: string; icon: any; badge?: string; badgeClass?: string }>> = {
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
    { id: 'shipment-status', label: 'Statuts colis', icon: markRaw(CircleDot) },
    { id: 'search-filters', label: 'Recherche & Filtres', icon: markRaw(Filter) },
    { id: 'shipment-history', label: 'Historique', icon: markRaw(History) },
  ],
  pickups: [
    { id: 'schedule-pickup', label: 'Planifier enlèvement', icon: markRaw(CalendarClock) },
    { id: 'pickup-requests', label: 'Demandes d\'enlèvement', icon: markRaw(PackageOpen) },
    { id: 'pickup-history', label: 'Historique', icon: markRaw(History) },
    { id: 'failed-pickups', label: 'Échecs', icon: markRaw(XCircle), badge: '0', badgeClass: 'bg-gray-100 text-gray-500' },
    { id: 'pickup-performance', label: 'Performance', icon: markRaw(TrendingUp) },
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
    { id: 'api-status', label: 'Statut API', icon: markRaw(Webhook) },
    { id: 'carrier-performance', label: 'Performance', icon: markRaw(TrendingUp) },
    { id: 'sla-metrics', label: 'Métriques SLA', icon: markRaw(Target) },
    { id: 'carrier-issues', label: 'Problèmes', icon: markRaw(AlertCircle) },
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
    { id: 'integrations', label: 'Intégrations', icon: markRaw(Plug) },
    { id: 'notifications', label: 'Notifications', icon: markRaw(Bell) },
    { id: 'billing', label: 'Facturation', icon: markRaw(CreditCard) },
    { id: 'api-keys', label: 'Clés API', icon: markRaw(Key) },
    { id: 'security', label: 'Sécurité', icon: markRaw(Lock) },
  ],
}

// Computed for current sub-navigation
const currentSubNavigation = computed(() => {
  return subNavigation[mainSection.value] || []
})

// Function to get main section label
function getMainSectionLabel(section: string) {
  const item = mainNavigation.find(n => n.id === section)
  return item?.label || section
}

// Function to select main section and set default sub-section
function selectMainSection(section: string) {
  mainSection.value = section
  const firstSubItem = subNavigation[section]?.[0]
  if (firstSubItem) {
    activeSection.value = firstSubItem.id
  }
}

// Computed for delivered count
const deliveredCount = computed(() => {
  return shipments.value.filter(s => s.status === 'Delivered').length
})

// ==================== CLIENTS DATA ====================
const showAddClientModal = ref(false)
const showClientDetailsDrawer = ref(false)
const clientSearchQuery = ref('')
const clientFilterStatus = ref('all')
const selectedClientDetails = ref<any>(null)

const clientStats = ref({
  totalClients: 1247,
  activeClients: 892,
  newThisMonth: 67,
  deliveryRate: 87,
  totalRevenue: 456780
})

const clientsList = ref([
  { id: 1, name: 'Sana Bouaziz', phone: '98 123 456', email: 'sana.b@email.com', address: '15 Rue de la Liberté', region: 'Tunis', totalOrders: 23, deliveredOrders: 21, deliveryRate: 91, totalSpent: 4560, status: 'vip', memberSince: 'Jan 2024' },
  { id: 2, name: 'Ahmed Mansour', phone: '55 789 012', email: '', address: '42 Avenue Bourguiba', region: 'Sfax', totalOrders: 8, deliveredOrders: 6, deliveryRate: 75, totalSpent: 1890, status: 'active', memberSince: 'Mar 2024' },
  { id: 3, name: 'Leila Trabelsi', phone: '22 456 789', email: 'leila.t@gmail.com', address: '8 Rue des Oliviers', region: 'Sousse', totalOrders: 45, deliveredOrders: 42, deliveryRate: 93, totalSpent: 8920, status: 'vip', memberSince: 'Sep 2023' },
  { id: 4, name: 'Karim Jebali', phone: '91 234 567', email: '', address: '23 Boulevard 7 Novembre', region: 'Nabeul', totalOrders: 3, deliveredOrders: 1, deliveryRate: 33, totalSpent: 450, status: 'blocked', memberSince: 'Déc 2025' },
  { id: 5, name: 'Nadia Khemiri', phone: '54 321 098', email: 'nadia.k@outlook.com', address: '5 Rue Ibn Khaldoun', region: 'Ariana', totalOrders: 12, deliveredOrders: 11, deliveryRate: 92, totalSpent: 2340, status: 'active', memberSince: 'Juin 2024' },
  { id: 6, name: 'Omar Chahed', phone: '29 876 543', email: '', address: '17 Avenue de la République', region: 'Bizerte', totalOrders: 5, deliveredOrders: 4, deliveryRate: 80, totalSpent: 890, status: 'inactive', memberSince: 'Oct 2024' }
])

const filteredClients = computed(() => {
  return clientsList.value.filter(client => {
    const matchesSearch = clientSearchQuery.value === '' ||
      client.name.toLowerCase().includes(clientSearchQuery.value.toLowerCase()) ||
      client.phone.includes(clientSearchQuery.value) ||
      client.address.toLowerCase().includes(clientSearchQuery.value.toLowerCase())
    const matchesStatus = clientFilterStatus.value === 'all' || client.status === clientFilterStatus.value
    return matchesSearch && matchesStatus
  })
})

function viewClientDetails(client: any) {
  selectedClientDetails.value = client
  showClientDetailsDrawer.value = true
}

function closeClientDetails() {
  showClientDetailsDrawer.value = false
}

function editClientData(client: any) {
  console.log('Edit client:', client)
}

// New Client Form
const newClientForm = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  region: '',
  postalCode: '',
  notes: '',
  status: 'active'
})

const statsTimeRange = ref('30d')

// Tunisian Governorates
const tunisianGovernorates = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
  'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'
]

// VIP Clients computed
const vipClients = computed(() => {
  return clientsList.value.filter(client => client.status === 'vip')
})

const vipTotalRevenue = computed(() => {
  return vipClients.value.reduce((sum, client) => sum + client.totalSpent, 0)
})

const vipAverageDeliveryRate = computed(() => {
  if (vipClients.value.length === 0) return 0
  const total = vipClients.value.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / vipClients.value.length)
})

// Blocked Clients computed
const blockedClients = computed(() => {
  return clientsList.value.filter(client => client.status === 'blocked')
})

const blockedReturnsSaved = computed(() => {
  return blockedClients.value.reduce((sum, client) => sum + (client.totalOrders - client.deliveredOrders), 0) * 3
})

const blockedAverageDeliveryRate = computed(() => {
  if (blockedClients.value.length === 0) return 0
  const total = blockedClients.value.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / blockedClients.value.length)
})

// Active clients delivery rate
const activeClientsDeliveryRate = computed(() => {
  const activeClients = clientsList.value.filter(c => c.status === 'active')
  if (activeClients.length === 0) return 0
  const total = activeClients.reduce((sum, client) => sum + client.deliveryRate, 0)
  return Math.round(total / activeClients.length)
})

// Statistics computed properties
const averageOrderValue = computed(() => {
  const totalSpent = clientsList.value.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOrders = clientsList.value.reduce((sum, c) => sum + c.totalOrders, 0)
  return totalOrders > 0 ? totalSpent / totalOrders : 0
})

const retentionRate = computed(() => {
  const repeatingClients = clientsList.value.filter(c => c.totalOrders > 1).length
  return clientsList.value.length > 0 ? Math.round((repeatingClients / clientsList.value.length) * 100) : 0
})

const lifetimeValue = computed(() => {
  return clientsList.value.length > 0
    ? clientsList.value.reduce((sum, c) => sum + c.totalSpent, 0) / clientsList.value.length
    : 0
})

const topClientsByRevenue = computed(() => {
  return [...clientsList.value].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)
})

const clientStatusDistribution = computed(() => {
  const statusMap: Record<string, { label: string; color: string; count: number }> = {
    active: { label: 'Actifs', color: 'bg-green-500', count: 0 },
    vip: { label: 'VIP', color: 'bg-purple-500', count: 0 },
    inactive: { label: 'Inactifs', color: 'bg-gray-400', count: 0 },
    blocked: { label: 'Bloqués', color: 'bg-red-500', count: 0 }
  }

  clientsList.value.forEach(client => {
    if (statusMap[client.status]) {
      statusMap[client.status].count++
    }
  })

  return Object.values(statusMap).map(s => ({
    ...s,
    percentage: clientsList.value.length > 0 ? (s.count / clientsList.value.length) * 100 : 0
  }))
})

const clientRegionDistribution = computed(() => {
  const regionMap: Record<string, number> = {}
  clientsList.value.forEach(client => {
    regionMap[client.region] = (regionMap[client.region] || 0) + 1
  })

  const colors = ['bg-primary-blue', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500']
  const bgColors = ['bg-primary-blue', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500']

  return Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      name,
      count,
      percentage: clientsList.value.length > 0 ? (count / clientsList.value.length) * 100 : 0,
      color: colors[index % colors.length],
      bgColor: bgColors[index % bgColors.length]
    }))
})

// Client management functions
function submitNewClient() {
  const newClient = {
    id: Date.now(),
    name: newClientForm.name,
    phone: newClientForm.phone,
    email: newClientForm.email,
    address: newClientForm.address,
    region: newClientForm.region,
    totalOrders: 0,
    deliveredOrders: 0,
    deliveryRate: 0,
    totalSpent: 0,
    status: newClientForm.status,
    memberSince: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  }
  clientsList.value.push(newClient)
  resetNewClientForm()
  activeSection.value = 'all-clients'
}

function submitNewClientFromModal() {
  const newClient = {
    id: Date.now(),
    name: newClientForm.name,
    phone: newClientForm.phone,
    email: newClientForm.email,
    address: newClientForm.address,
    region: newClientForm.region,
    totalOrders: 0,
    deliveredOrders: 0,
    deliveryRate: 0,
    totalSpent: 0,
    status: 'active',
    memberSince: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  }
  clientsList.value.push(newClient)
  resetNewClientForm()
  showAddClientModal.value = false
}

function resetNewClientForm() {
  newClientForm.name = ''
  newClientForm.phone = ''
  newClientForm.email = ''
  newClientForm.address = ''
  newClientForm.region = ''
  newClientForm.postalCode = ''
  newClientForm.notes = ''
  newClientForm.status = 'active'
}

function toggleClientVIP(client: any) {
  const idx = clientsList.value.findIndex(c => c.id === client.id)
  if (idx !== -1) {
    clientsList.value[idx].status = client.status === 'vip' ? 'active' : 'vip'
  }
}

function toggleClientBlocked(client: any) {
  const idx = clientsList.value.findIndex(c => c.id === client.id)
  if (idx !== -1) {
    clientsList.value[idx].status = client.status === 'blocked' ? 'active' : 'blocked'
  }
}

function removeFromVIP(client: any) {
  const idx = clientsList.value.findIndex(c => c.id === client.id)
  if (idx !== -1) {
    clientsList.value[idx].status = 'active'
  }
}

function unblockClient(client: any) {
  const idx = clientsList.value.findIndex(c => c.id === client.id)
  if (idx !== -1) {
    clientsList.value[idx].status = 'active'
  }
}

// Client Colis Data
const clientColisData = ref([
  { id: 1, clientId: 1, tracking: 'YAL-2026-001234', date: '25 Jan 2026', amount: 189, status: 'Delivered' },
  { id: 2, clientId: 1, tracking: 'YAL-2026-001456', date: '22 Jan 2026', amount: 245, status: 'Delivered' },
  { id: 3, clientId: 1, tracking: 'ZR-2026-002789', date: '18 Jan 2026', amount: 156, status: 'In Transit' },
  { id: 4, clientId: 1, tracking: 'YAL-2026-003012', date: '15 Jan 2026', amount: 89, status: 'Delivered' },
  { id: 5, clientId: 2, tracking: 'MAY-2026-004567', date: '24 Jan 2026', amount: 320, status: 'In Transit' },
  { id: 6, clientId: 2, tracking: 'YAL-2026-005890', date: '20 Jan 2026', amount: 178, status: 'Delivered' },
  { id: 7, clientId: 2, tracking: 'ECO-2026-006123', date: '12 Jan 2026', amount: 95, status: 'Returned' },
  { id: 8, clientId: 3, tracking: 'YAL-2026-007456', date: '26 Jan 2026', amount: 412, status: 'Pending' },
  { id: 9, clientId: 3, tracking: 'ZR-2026-008789', date: '23 Jan 2026', amount: 267, status: 'Delivered' },
  { id: 10, clientId: 3, tracking: 'YAL-2026-009012', date: '19 Jan 2026', amount: 198, status: 'Delivered' },
  { id: 11, clientId: 3, tracking: 'MAY-2026-010345', date: '14 Jan 2026', amount: 145, status: 'Delivered' },
  { id: 12, clientId: 3, tracking: 'YAL-2026-011678', date: '10 Jan 2026', amount: 89, status: 'Delivered' },
  { id: 13, clientId: 4, tracking: 'ECO-2026-012901', date: '21 Jan 2026', amount: 230, status: 'Returned' },
  { id: 14, clientId: 4, tracking: 'YAL-2026-013234', date: '16 Jan 2026', amount: 156, status: 'Returned' },
  { id: 15, clientId: 5, tracking: 'ZR-2026-014567', date: '25 Jan 2026', amount: 189, status: 'In Transit' },
  { id: 16, clientId: 5, tracking: 'YAL-2026-015890', date: '22 Jan 2026', amount: 278, status: 'Delivered' },
  { id: 17, clientId: 5, tracking: 'MAY-2026-016123', date: '17 Jan 2026', amount: 134, status: 'Delivered' },
  { id: 18, clientId: 6, tracking: 'YAL-2026-017456', date: '20 Jan 2026', amount: 167, status: 'Delivered' },
  { id: 19, clientId: 6, tracking: 'ECO-2026-018789', date: '13 Jan 2026', amount: 98, status: 'Returned' }
])

function getClientColis(clientId: number) {
  return clientColisData.value.filter(c => c.clientId === clientId)
}

// Other state variables
const activeStatusTab = ref('all')
const searchQuery = ref('')
const showAddShipmentModal = ref(false)
const selectedShipment = ref<any>(null)
const selectedPickups = ref<number[]>([])
const showPickupRequestModal = ref(false)
const pickupDate = ref('')
const pickupTimeSlot = ref('')
const pickupAddress = ref('123 Avenue Habib Bourguiba, Tunis, Tunisie')
const selectedLabels = ref<number[]>([])
const showPrintLabelModal = ref(false)
const labelToPrint = ref<any>(null)
const labelSearchQuery = ref('')
const labelFilterPrinted = ref('all')

// ==================== DASHBOARD DATA ====================

// Dashboard Stats
const dashboardStats = reactive({
  performanceScore: 87,
  todayDeliveries: 24,
  todayDelivered: 18,
  successRate: 92,
  lastWeekSuccessRate: 89,
  expectedCOD: 4580,
  pendingConfirmations: 6,
  todayOrders: 28,
  yesterdayOrders: 25,
  ordersChange: 12,
  deliveredChange: 8,
  todayReturns: 2,
  returnsChange: -15,
  yesterdayDelivered: 16
})

// Urgent Actions
const urgentActions = ref([
  { id: 1, type: 'confirm', icon: markRaw(FileCheck), title: '6 commandes à confirmer', description: 'En attente depuis plus de 2h', time: 'Il y a 2h', actionLabel: 'Confirmer' },
  { id: 2, type: 'delayed', icon: markRaw(AlertTriangle), title: '3 colis en retard critique', description: 'Retard de plus de 72h', time: 'Urgent', actionLabel: 'Voir' },
  { id: 3, type: 'return', icon: markRaw(RotateCcw), title: '2 clients injoignables', description: '3 tentatives sans réponse', time: 'Il y a 30min', actionLabel: 'Contacter' },
  { id: 4, type: 'payment', icon: markRaw(Banknote), title: 'Paiement Yalidine en retard', description: '1,250 TND depuis 5 jours', time: 'Il y a 5j', actionLabel: 'Relancer' }
])

// Weather Regions
const weatherRegions = ref([
  { name: 'Tunis', icon: '☀️', temp: 22, impact: 'low' },
  { name: 'Sfax', icon: '⛅', temp: 24, impact: 'low' },
  { name: 'Sousse', icon: '🌧️', temp: 18, impact: 'medium' },
  { name: 'Bizerte', icon: '⛈️', temp: 15, impact: 'high' },
  { name: 'Gabès', icon: '☀️', temp: 26, impact: 'low' },
  { name: 'Kairouan', icon: '🌤️', temp: 23, impact: 'low' }
])

// Today Stats
const todayStats = reactive({
  toConfirm: 6,
  inDelivery: 12,
  delivered: 18,
  toPrint: 4
})

// Orders to Confirm
const ordersToConfirm = ref([
  { id: 1, client: 'Ahmed Ben Ali', tracking: 'YAL-2026-001234', destination: 'Tunis', amount: 89 },
  { id: 2, client: 'Fatma Trabelsi', tracking: 'ZR-2026-005678', destination: 'Sfax', amount: 145 },
  { id: 3, client: 'Mohamed Sassi', tracking: 'MAY-2026-009012', destination: 'Sousse', amount: 67 },
  { id: 4, client: 'Sana Bouaziz', tracking: 'YAL-2026-003456', destination: 'Nabeul', amount: 210 },
  { id: 5, client: 'Karim Hamdi', tracking: 'ECO-2026-007890', destination: 'Monastir', amount: 95 },
  { id: 6, client: 'Leila Mrad', tracking: 'ZR-2026-002345', destination: 'Bizerte', amount: 178 }
])

// Delivery Timeline Data
const deliveryTimelineData = ref([
  { hour: 8, count: 2 },
  { hour: 9, count: 3 },
  { hour: 10, count: 4 },
  { hour: 11, count: 6 },
  { hour: 12, count: 5 },
  { hour: 13, count: 4 },
  { hour: 14, count: 5 },
  { hour: 15, count: 4 },
  { hour: 16, count: 3 },
  { hour: 17, count: 2 },
  { hour: 18, count: 1 },
  { hour: 19, count: 1 }
])

// Today's Shipments List
const todayShipmentsList = ref([
  { id: 1, tracking: 'YAL-2026-001234', client: 'Ahmed Ben Ali', destination: 'Tunis', status: 'Livré', amount: 89, carrier: 'Yalidine' },
  { id: 2, tracking: 'ZR-2026-005678', client: 'Fatma Trabelsi', destination: 'Sfax', status: 'En livraison', amount: 145, carrier: 'ZR Express' },
  { id: 3, tracking: 'MAY-2026-009012', client: 'Mohamed Sassi', destination: 'Sousse', status: 'En transit', amount: 67, carrier: 'Maystro' },
  { id: 4, tracking: 'YAL-2026-003456', client: 'Sana Bouaziz', destination: 'Nabeul', status: 'Livré', amount: 210, carrier: 'Yalidine' },
  { id: 5, tracking: 'ECO-2026-007890', client: 'Karim Hamdi', destination: 'Monastir', status: 'En livraison', amount: 95, carrier: 'Ecotrack' },
  { id: 6, tracking: 'ZR-2026-002345', client: 'Leila Mrad', destination: 'Bizerte', status: 'En attente', amount: 178, carrier: 'ZR Express' },
  { id: 7, tracking: 'YAL-2026-004567', client: 'Omar Chahed', destination: 'Tunis', status: 'Livré', amount: 320, carrier: 'Yalidine' },
  { id: 8, tracking: 'MAY-2026-008901', client: 'Nadia Khemiri', destination: 'Ariana', status: 'En livraison', amount: 55, carrier: 'Maystro' }
])

// ==================== DAILY TASKS ====================
const dailyTasksFilter = ref<'all' | 'pending' | 'completed'>('all')

const dailyTasksCategories = ref([
  {
    id: 'orders',
    name: 'Commandes à confirmer',
    icon: markRaw(FileCheck),
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600',
    tasks: [
      { id: 6, title: 'Confirmer commande #2026-1234', description: 'Sana Bouaziz · 210 TND · En attente depuis 2h', completed: false, priority: 'high', action: 'confirm', actionLabel: 'Confirmer', actionIcon: markRaw(Check), completedAt: '' },
      { id: 7, title: 'Confirmer commande #2026-1235', description: 'Omar Chahed · 320 TND', completed: true, priority: 'normal', action: 'confirm', actionLabel: 'Confirmer', actionIcon: markRaw(Check), completedAt: '08:15' },
      { id: 8, title: 'Confirmer commande #2026-1236', description: 'Nadia Khemiri · 55 TND', completed: true, priority: 'normal', action: 'confirm', actionLabel: 'Confirmer', actionIcon: markRaw(Check), completedAt: '08:20' },
      { id: 9, title: 'Vérifier commande #2026-1237', description: 'Adresse incomplète - contacter client', completed: false, priority: 'high', action: 'verify', actionLabel: 'Vérifier', actionIcon: markRaw(AlertCircle), completedAt: '' }
    ]
  },
  {
    id: 'labels',
    name: 'Bordereaux à imprimer',
    icon: markRaw(Printer),
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600',
    tasks: [
      { id: 10, title: 'Imprimer bordereaux Yalidine', description: '4 colis prêts à expédier', completed: false, priority: 'normal', count: 4, action: 'print', actionLabel: 'Imprimer', actionIcon: markRaw(Printer), completedAt: '' },
      { id: 11, title: 'Imprimer bordereaux ZR Express', description: '2 colis prêts à expédier', completed: true, priority: 'normal', count: 2, action: 'print', actionLabel: 'Imprimer', actionIcon: markRaw(Printer), completedAt: '09:00' },
      { id: 12, title: 'Imprimer bordereaux Maystro', description: '3 colis prêts à expédier', completed: false, priority: 'normal', count: 3, action: 'print', actionLabel: 'Imprimer', actionIcon: markRaw(Printer), completedAt: '' }
    ]
  },
  {
    id: 'packages',
    name: 'Colis à préparer',
    icon: markRaw(Package),
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600',
    tasks: [
      { id: 13, title: 'Emballer commande #2026-1234', description: 'Montre connectée + accessoires', completed: true, priority: 'normal', action: null, actionLabel: '', actionIcon: null, completedAt: '08:45' },
      { id: 14, title: 'Emballer commande #2026-1235', description: 'Parfum importé - emballage fragile', completed: true, priority: 'normal', action: null, actionLabel: '', actionIcon: null, completedAt: '09:10' },
      { id: 15, title: 'Emballer commande #2026-1236', description: 'Coque iPhone', completed: false, priority: 'normal', action: null, actionLabel: '', actionIcon: null, completedAt: '' },
      { id: 16, title: 'Emballer commande #2026-1237', description: 'Bijoux fantaisie x3', completed: false, priority: 'normal', action: null, actionLabel: '', actionIcon: null, completedAt: '' }
    ]
  },
  {
    id: 'returns',
    name: 'Retours à traiter',
    icon: markRaw(RotateCcw),
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600',
    tasks: [
      { id: 17, title: 'Contacter Hichem Mansour', description: '3 tentatives échouées - risque retour', completed: false, priority: 'high', action: 'whatsapp', actionLabel: 'WhatsApp', actionIcon: markRaw(MessageCircle), completedAt: '' },
      { id: 18, title: 'Vérifier retour YAL-2026-000456', description: 'Colis retourné hier - vérifier état', completed: false, priority: 'normal', action: 'verify', actionLabel: 'Vérifier', actionIcon: markRaw(Eye), completedAt: '' }
    ]
  },
  {
    id: 'finance',
    name: 'Paiements',
    icon: markRaw(Banknote),
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600',
    tasks: [
      { id: 19, title: 'Relancer paiement Yalidine', description: '1,250 TND en retard de 5 jours', completed: false, priority: 'high', action: 'contact', actionLabel: 'Relancer', actionIcon: markRaw(MessageCircle), completedAt: '' },
      { id: 20, title: 'Vérifier virement ZR Express', description: '890 TND attendu depuis hier', completed: true, priority: 'normal', action: 'verify', actionLabel: 'Vérifier', actionIcon: markRaw(Eye), completedAt: '11:00' }
    ]
  }
])

// Computed stats for daily tasks
const dailyTasksStats = computed(() => {
  let total = 0
  let completed = 0
  dailyTasksCategories.value.forEach(cat => {
    total += cat.tasks.length
    completed += cat.tasks.filter(t => t.completed).length
  })
  return {
    total,
    completed,
    pending: total - completed,
    progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0
  }
})

// Filtered task categories
const filteredTaskCategories = computed(() => {
  if (dailyTasksFilter.value === 'all') {
    return dailyTasksCategories.value
  }

  return dailyTasksCategories.value.map(cat => ({
    ...cat,
    tasks: cat.tasks.filter(t =>
      dailyTasksFilter.value === 'completed' ? t.completed : !t.completed
    )
  })).filter(cat => cat.tasks.length > 0)
})

// Toggle task completion
function toggleTask(categoryId: string, taskId: number) {
  const category = dailyTasksCategories.value.find(c => c.id === categoryId)
  if (category) {
    const task = category.tasks.find(t => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      task.completedAt = task.completed ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
    }
  }
}

// Complete all tasks in category
function completeAllInCategory(categoryId: string) {
  const category = dailyTasksCategories.value.find(c => c.id === categoryId)
  if (category) {
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    category.tasks.forEach(task => {
      if (!task.completed) {
        task.completed = true
        task.completedAt = now
      }
    })
  }
}

// Execute task action (placeholder)
function executeTaskAction(task: any) {
  // In real implementation, this would open modals or navigate to appropriate pages
  alert(`Action: ${task.actionLabel} pour "${task.title}"`)
}

// ==================== END DAILY TASKS ====================

// Delayed Shipments
const delayedFilter = ref<'all' | '24h' | '48h' | 'critical'>('all')
const delayedDateFilter = ref<'all' | 'today' | '48h' | 'week' | 'month' | 'custom'>('all')
const delayedDateRangeStart = ref('')
const delayedDateRangeEnd = ref('')

const delayedShipments = ref([
  { id: 1, tracking: 'YAL-2026-000123', client: 'Hatem Mejri', destination: 'Gabès', delayDays: 5, carrier: 'Yalidine', phone: '+216 98 123 456', createdAt: '2026-01-24' },
  { id: 2, tracking: 'ZR-2026-000456', client: 'Rim Ayari', destination: 'Tataouine', delayDays: 4, carrier: 'ZR Express', phone: '+216 55 789 012', createdAt: '2026-01-25' },
  { id: 3, tracking: 'MAY-2026-000789', client: 'Youssef Gharbi', destination: 'Tozeur', delayDays: 3, carrier: 'Maystro', phone: '+216 22 345 678', createdAt: '2026-01-26' },
  { id: 4, tracking: 'YAL-2026-001012', client: 'Ines Lahmar', destination: 'Kasserine', delayDays: 2, carrier: 'Yalidine', phone: '+216 97 901 234', createdAt: '2026-01-27' },
  { id: 5, tracking: 'ECO-2026-001345', client: 'Walid Ben Salah', destination: 'Gafsa', delayDays: 2, carrier: 'Ecotrack', phone: '+216 50 567 890', createdAt: '2026-01-28' },
  { id: 6, tracking: 'ZR-2026-001678', client: 'Amira Bouzid', destination: 'Médenine', delayDays: 1, carrier: 'ZR Express', phone: '+216 24 123 456', createdAt: '2026-01-29' },
  { id: 7, tracking: 'MAY-2026-001901', client: 'Sofiane Triki', destination: 'Kébili', delayDays: 1, carrier: 'Maystro', phone: '+216 92 789 012', createdAt: '2026-01-29' },
  { id: 8, tracking: 'YAL-2026-002100', client: 'Nadia Fersi', destination: 'Siliana', delayDays: 6, carrier: 'Yalidine', phone: '+216 91 234 567', createdAt: '2026-01-10' },
  { id: 9, tracking: 'ECO-2026-002200', client: 'Tarek Hamdi', destination: 'Jendouba', delayDays: 4, carrier: 'Ecotrack', phone: '+216 53 456 789', createdAt: '2026-01-15' },
  { id: 10, tracking: 'ZR-2026-002300', client: 'Sarra Khalfi', destination: 'Béja', delayDays: 3, carrier: 'ZR Express', phone: '+216 29 678 901', createdAt: '2026-01-20' }
])

// Delayed Patterns
const delayedPatterns = ref([
  { id: 1, message: '4 colis en retard vers le Sud (Gabès, Tataouine, Tozeur) - Zone éloignée' },
  { id: 2, message: '3 retards avec Yalidine cette semaine - Vérifier la performance' },
  { id: 3, message: 'Région Kasserine: 80% des livraisons en retard ce mois' }
])

// Computed filtered delayed shipments by date
const filteredDelayedShipmentsByDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return delayedShipments.value.filter(shipment => {
    const shipmentDate = new Date(shipment.createdAt)
    shipmentDate.setHours(0, 0, 0, 0)

    switch (delayedDateFilter.value) {
      case 'today':
        return shipmentDate.getTime() === today.getTime()
      case '48h':
        const twoDaysAgo = new Date(today)
        twoDaysAgo.setDate(today.getDate() - 2)
        return shipmentDate >= twoDaysAgo
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return shipmentDate >= weekAgo
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return shipmentDate >= monthAgo
      case 'custom':
        if (delayedDateRangeStart.value && delayedDateRangeEnd.value) {
          const startDate = new Date(delayedDateRangeStart.value)
          const endDate = new Date(delayedDateRangeEnd.value)
          endDate.setHours(23, 59, 59, 999)
          return shipmentDate >= startDate && shipmentDate <= endDate
        }
        return true
      default:
        return true
    }
  })
})

// Computed filtered delayed shipments by severity (applied after date filter)
const filteredDelayedShipments = computed(() => {
  const dateFiltered = filteredDelayedShipmentsByDate.value
  if (delayedFilter.value === 'all') return dateFiltered
  if (delayedFilter.value === '24h') return dateFiltered.filter(s => s.delayDays === 1)
  if (delayedFilter.value === '48h') return dateFiltered.filter(s => s.delayDays >= 2 && s.delayDays <= 3)
  if (delayedFilter.value === 'critical') return dateFiltered.filter(s => s.delayDays > 3)
  return dateFiltered
})

// Final filtered list (combines both filters)
const filteredDelayedShipmentsFinal = computed(() => {
  return filteredDelayedShipments.value
})

// Return Alerts
const returnAlerts = ref([
  { id: 1, type: 'failed-attempt', client: 'Hichem Mansour', tracking: 'YAL-2026-002234', destination: 'Tunis', attempts: 3, lastAttempt: 'Il y a 2h', amount: 156, isRecidivist: true },
  { id: 2, type: 'failed-attempt', client: 'Wafa Jlassi', tracking: 'ZR-2026-002567', destination: 'Sfax', attempts: 2, lastAttempt: 'Hier', amount: 89, isRecidivist: false },
  { id: 3, type: 'unreachable', client: 'Nabil Karray', phone: '+216 98 111 222', tracking: 'MAY-2026-002890', destination: 'Sousse', lastContact: 'Il y a 3 jours', isRecidivist: false },
  { id: 4, type: 'unreachable', client: 'Salma Zouari', phone: '+216 55 333 444', tracking: 'YAL-2026-003123', destination: 'Monastir', lastContact: 'Il y a 2 jours', isRecidivist: true },
  { id: 5, type: 'risk', client: 'Anis Ferchichi', tracking: 'ECO-2026-003456', riskScore: 85, riskReason: 'Client avec 3 retours sur les 5 dernières commandes', isRecidivist: true },
  { id: 6, type: 'risk', client: 'Mounir Ghanmi', tracking: 'ZR-2026-003789', riskScore: 72, riskReason: 'Zone problématique (Tataouine) + 2 tentatives', isRecidivist: false }
])

// Financial Stats
const financialStats = reactive({
  pendingCOD: 4580,
  pendingCODCount: 24,
  pendingPayments: 2850,
  pendingCarriersCount: 3,
  deliveryFees: 1240,
  netMargin: 3340,
  marginPercent: 73,
  codByCarrier: [
    { name: 'Yalidine', amount: 1890, count: 12, overdue: 450, colorClass: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { name: 'ZR Express', amount: 1340, count: 8, overdue: 0, colorClass: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600' },
    { name: 'Maystro', amount: 850, count: 5, overdue: 200, colorClass: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' },
    { name: 'Ecotrack', amount: 500, count: 3, overdue: 0, colorClass: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600' }
  ],
  overduePayments: [
    { id: 1, carrier: 'Yalidine', amount: 1250, daysOverdue: 5 },
    { id: 2, carrier: 'Maystro', amount: 680, daysOverdue: 3 }
  ],
  cashFlowProjection: [
    { label: 'Lun', incoming: 1200, outgoing: 350 },
    { label: 'Mar', incoming: 980, outgoing: 280 },
    { label: 'Mer', incoming: 1450, outgoing: 420 },
    { label: 'Jeu', incoming: 1100, outgoing: 310 },
    { label: 'Ven', incoming: 1680, outgoing: 480 },
    { label: 'Sam', incoming: 890, outgoing: 250 },
    { label: 'Dim', incoming: 450, outgoing: 150 }
  ]
})

// Activity Log
const activityFilters = reactive({
  type: 'all',
  period: 'today',
  search: ''
})

const activityLogs = ref([
  { id: 1, type: 'status', icon: markRaw(Package), message: 'Colis livré avec succès', tracking: 'YAL-2026-001234', time: '14:32', date: "Aujourd'hui", user: 'Système' },
  { id: 2, type: 'payment', icon: markRaw(Banknote), message: 'Paiement COD reçu de ZR Express', tracking: null, time: '14:15', date: "Aujourd'hui", user: 'Système' },
  { id: 3, type: 'status', icon: markRaw(Truck), message: 'Colis pris en charge par le livreur', tracking: 'ZR-2026-005678', time: '13:45', date: "Aujourd'hui", user: 'Système' },
  { id: 4, type: 'return', icon: markRaw(RotateCcw), message: 'Retour déclaré - Client absent', tracking: 'MAY-2026-000456', time: '12:30', date: "Aujourd'hui", user: 'Système' },
  { id: 5, type: 'status', icon: markRaw(FileCheck), message: 'Nouvelle commande confirmée', tracking: 'YAL-2026-004567', time: '11:20', date: "Aujourd'hui", user: 'Admin' },
  { id: 6, type: 'error', icon: markRaw(AlertCircle), message: 'Échec de synchronisation API Yalidine', tracking: null, time: '10:05', date: "Aujourd'hui", user: 'Système' },
  { id: 7, type: 'status', icon: markRaw(Package), message: 'Colis livré avec succès', tracking: 'ECO-2026-003456', time: '18:45', date: 'Hier', user: 'Système' },
  { id: 8, type: 'payment', icon: markRaw(Banknote), message: 'Facture #INV-2026-089 générée', tracking: null, time: '17:30', date: 'Hier', user: 'Admin' },
  { id: 9, type: 'status', icon: markRaw(CheckCircle), message: '15 bordereaux imprimés', tracking: null, time: '09:15', date: 'Hier', user: 'Admin' }
])

// Grouped Activity Logs
const groupedActivityLogs = computed(() => {
  const filtered = activityLogs.value.filter(log => {
    if (activityFilters.type !== 'all' && log.type !== activityFilters.type) return false
    if (activityFilters.search && !log.message.toLowerCase().includes(activityFilters.search.toLowerCase()) &&
        (!log.tracking || !log.tracking.toLowerCase().includes(activityFilters.search.toLowerCase()))) return false
    return true
  })

  return filtered.reduce((groups: Record<string, typeof activityLogs.value>, log) => {
    const date = log.date
    if (!groups[date]) groups[date] = []
    groups[date].push(log)
    return groups
  }, {})
})

// ==================== END DASHBOARD DATA ====================

// Notification Flows
const notificationFlows = ref([
  { name: 'When shipment updates to info received', enabled: false, disabledAt: 'Jan 26, 2026 at 11:37 PM', emailsSent: 0, smsSent: 0 },
  { name: 'When shipment updates to in transit', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to out for delivery', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to available for pickup', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to delivered', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to exception', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to failed attempt', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
])

function toggleFlow(index: number) {
  notificationFlows.value[index].enabled = !notificationFlows.value[index].enabled
  if (!notificationFlows.value[index].enabled) {
    notificationFlows.value[index].disabledAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } else {
    notificationFlows.value[index].disabledAt = null
  }
}

// Members & Roles (UI state only - data is in teamMembers above)
const membersTab = ref('members')
const memberSearchQuery = ref('')
const showRoleFilter = ref(false)
const selectedRoleFilters = ref<string[]>([])

const availableRoles = ref([
  { id: 'owner', name: 'Owner', description: 'Only 1 per organization. All permissions.', memberCount: 1, isDefault: true, isOwner: true },
  { id: 'admin', name: 'Admin', description: 'Can manage basic organization and billing settings, but c...', memberCount: 0, isDefault: true, isOwner: false },
  { id: 'manager', name: 'Manager', description: '', memberCount: 0, isDefault: true, isOwner: false },
  { id: 'support', name: 'Support Agent', description: '', memberCount: 0, isDefault: true, isOwner: false },
])

// Tracking Page Templates
const trackingPageTemplates = ref([
  {
    id: 1,
    name: 'Moderne Minimaliste',
    description: 'Design épuré avec focus sur les informations essentielles',
    gradientClass: 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
    accentClass: 'bg-orange-500',
    isPopular: true
  },
  {
    id: 2,
    name: 'Professionnel',
    description: 'Style corporate avec timeline détaillée',
    gradientClass: 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
    accentClass: 'bg-blue-500',
    isPopular: false
  },
  {
    id: 3,
    name: 'Coloré & Dynamique',
    description: 'Design vibrant avec animations et icônes',
    gradientClass: 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
    accentClass: 'bg-purple-500',
    isPopular: false
  },
  {
    id: 4,
    name: 'E-commerce',
    description: 'Optimisé pour les boutiques en ligne',
    gradientClass: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
    accentClass: 'bg-green-500',
    isPopular: true
  },
  {
    id: 5,
    name: 'Dark Mode',
    description: 'Thème sombre élégant',
    gradientClass: 'from-gray-800 to-gray-900',
    accentClass: 'bg-orange-500',
    isPopular: false
  },
  {
    id: 6,
    name: 'Carte Interactive',
    description: 'Avec suivi géographique en temps réel',
    gradientClass: 'from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30',
    accentClass: 'bg-cyan-500',
    isPopular: false
  },
])

// Failed Searches (customers who couldn't find their order)
const failedSearches = ref([
  { id: 1, query: 'CMD-2024-99999', phone: '+216 55 123 456', date: '27 jan 2026 à 14:32', contacted: false },
  { id: 2, query: 'ABC123XYZ', phone: '+216 98 765 432', date: '27 jan 2026 à 12:15', contacted: true },
  { id: 3, query: 'MA-COMMANDE-001', phone: null, date: '26 jan 2026 à 18:45', contacted: false },
  { id: 4, query: 'TRACK-5678', phone: '+216 22 333 444', date: '26 jan 2026 à 10:20', contacted: false },
  { id: 5, query: 'ORDER-JANVIER', phone: '+216 50 111 222', date: '25 jan 2026 à 16:08', contacted: true },
])

const newShipment = reactive({
  // Section 1: Expédition
  trackingNumber: '',
  carrier: '',
  type: 'normal' as 'normal' | 'exchange',
  // Exchange fields
  exchangeReason: '',
  exchangeItemCount: 1,
  exchangeImage: null as string | null,
  exchangeDescription: '',
  // Section 2: Destination
  customerName: '',
  phone: '',
  phoneSecondary: '',
  address: '',
  gouvernorat: '',
  delegation: '',
  locality: '',
  postalCode: '',
  // Section 3: Produit
  productName: '',
  isFragile: false,
  description: '',
  productPrice: 0,
  deliveryFee: 7,
  reference: '',
  amount: 0,
  clientId: null as number | null
})

// Shipment Client Autocomplete
const shipmentClientSearch = ref('')
const showClientSuggestions = ref(false)
const selectedShipmentClient = ref<any>(null)

const filteredShipmentClients = computed(() => {
  if (shipmentClientSearch.value.length < 1) return []
  const search = shipmentClientSearch.value.toLowerCase()
  return clientsList.value.filter(client =>
    client.name.toLowerCase().includes(search) ||
    client.phone.includes(search) ||
    client.address.toLowerCase().includes(search)
  ).slice(0, 5)
})

const canAddShipment = computed(() => {
  return (selectedShipmentClient.value || newShipment.customerName) &&
    newShipment.address &&
    newShipment.phone &&
    newShipment.amount > 0 &&
    newShipment.carrier
})

function onShipmentClientSearch() {
  showClientSuggestions.value = true
  selectedShipmentClient.value = null
}

function selectClientForShipment(client: any) {
  selectedShipmentClient.value = client
  shipmentClientSearch.value = client.name
  showClientSuggestions.value = false
  // Auto-fill fields
  newShipment.customerName = client.name
  newShipment.phone = client.phone
  newShipment.address = client.address
  newShipment.gouvernorat = client.region
  newShipment.clientId = client.id
}

function clearSelectedClient() {
  selectedShipmentClient.value = null
  shipmentClientSearch.value = ''
  newShipment.customerName = ''
  newShipment.phone = ''
  newShipment.address = ''
  newShipment.clientId = null
}

function handleExchangeImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newShipment.exchangeImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function closeAddShipmentModal() {
  showAddShipmentModal.value = false
  clearSelectedClient()
  // Reset form
  newShipment.trackingNumber = ''
  newShipment.carrier = ''
  newShipment.description = ''
  newShipment.amount = 0
  newShipment.gouvernorat = ''
}

function openNewClientFromShipment() {
  // Pre-fill new client form with searched name
  newClientForm.name = shipmentClientSearch.value
  showAddClientModal.value = true
  showClientSuggestions.value = false
}

function useNewClientName() {
  // Use the searched text as new client name without selecting existing
  newShipment.customerName = shipmentClientSearch.value
  selectedShipmentClient.value = null
  showClientSuggestions.value = false
}

// Tunisia Gouvernorats with their delegations and localities
type DelegationData = { localities: string[]; postalCode: string }
type GouvernoratData = { delegations: Record<string, DelegationData> }
const tunisiaLocations: Record<string, GouvernoratData> = {
  'Tunis': {
    delegations: {
      'Tunis Ville': { localities: ['Centre Ville', 'Bab Bhar', 'Bab Souika'], postalCode: '1000' },
      'Le Bardo': { localities: ['Le Bardo', 'Khaznadar'], postalCode: '2000' },
      'La Marsa': { localities: ['La Marsa', 'Sidi Bou Said', 'Gammarth'], postalCode: '2078' },
      'Carthage': { localities: ['Carthage', 'Carthage Byrsa', 'Carthage Dermech'], postalCode: '2016' },
      'Ariana': { localities: ['Ariana Ville', 'Soukra', 'Raoued'], postalCode: '2080' }
    }
  },
  'Ariana': {
    delegations: {
      'Ariana Ville': { localities: ['Ariana Centre', 'Menzah 5', 'Menzah 6'], postalCode: '2080' },
      'Soukra': { localities: ['Soukra', 'Ain Zaghouan'], postalCode: '2036' },
      'Raoued': { localities: ['Raoued', 'Borj Louzir'], postalCode: '2083' },
      'Mnihla': { localities: ['Mnihla', 'Ettadhamen'], postalCode: '2042' }
    }
  },
  'Ben Arous': {
    delegations: {
      'Ben Arous': { localities: ['Ben Arous Centre', 'Mourouj 1', 'Mourouj 2'], postalCode: '2013' },
      'Hammam Lif': { localities: ['Hammam Lif', 'Hammam Chatt'], postalCode: '2050' },
      'Radès': { localities: ['Radès', 'Radès Plage'], postalCode: '2040' },
      'Mégrine': { localities: ['Mégrine', 'Mégrine Riadh'], postalCode: '2033' }
    }
  },
  'Manouba': {
    delegations: {
      'Manouba': { localities: ['Manouba Centre', 'Denden'], postalCode: '2010' },
      'Oued Ellil': { localities: ['Oued Ellil', 'Cité Ibn Khaldoun'], postalCode: '2021' },
      'Tebourba': { localities: ['Tebourba', 'El Battan'], postalCode: '1130' },
      'Douar Hicher': { localities: ['Douar Hicher'], postalCode: '2086' }
    }
  },
  'Nabeul': {
    delegations: {
      'Nabeul': { localities: ['Nabeul Centre', 'Dar Chaabane'], postalCode: '8000' },
      'Hammamet': { localities: ['Hammamet', 'Hammamet Sud', 'Yasmine Hammamet'], postalCode: '8050' },
      'Korba': { localities: ['Korba', 'Tazerka'], postalCode: '8070' },
      'Kelibia': { localities: ['Kelibia', 'Hammam Ghezaz'], postalCode: '8090' }
    }
  },
  'Zaghouan': {
    delegations: {
      'Zaghouan': { localities: ['Zaghouan Centre', 'Mograne'], postalCode: '1100' },
      'Zriba': { localities: ['Zriba', 'Hammam Zriba'], postalCode: '1121' },
      'Bir Mcherga': { localities: ['Bir Mcherga'], postalCode: '1141' }
    }
  },
  'Bizerte': {
    delegations: {
      'Bizerte Nord': { localities: ['Bizerte', 'Corniche'], postalCode: '7000' },
      'Bizerte Sud': { localities: ['Zarzouna', 'Menzel Jemil'], postalCode: '7003' },
      'Menzel Bourguiba': { localities: ['Menzel Bourguiba', 'Tinja'], postalCode: '7050' },
      'Mateur': { localities: ['Mateur', 'Joumine'], postalCode: '7030' }
    }
  },
  'Béja': {
    delegations: {
      'Béja Nord': { localities: ['Béja Centre', 'Zahret Medien'], postalCode: '9000' },
      'Béja Sud': { localities: ['Béja Sud'], postalCode: '9000' },
      'Medjez el-Bab': { localities: ['Medjez el-Bab', 'Oued Zarga'], postalCode: '9070' },
      'Testour': { localities: ['Testour', 'Slouguia'], postalCode: '9060' }
    }
  },
  'Jendouba': {
    delegations: {
      'Jendouba': { localities: ['Jendouba Centre', 'Bousalem'], postalCode: '8100' },
      'Tabarka': { localities: ['Tabarka', 'Aïn Draham'], postalCode: '8110' },
      'Ghardimaou': { localities: ['Ghardimaou'], postalCode: '8160' }
    }
  },
  'Le Kef': {
    delegations: {
      'Le Kef Ouest': { localities: ['Le Kef', 'Es Sers'], postalCode: '7100' },
      'Le Kef Est': { localities: ['Le Kef Est'], postalCode: '7100' },
      'Dahmani': { localities: ['Dahmani', 'Ksour'], postalCode: '7170' }
    }
  },
  'Siliana': {
    delegations: {
      'Siliana Nord': { localities: ['Siliana', 'Bourouis'], postalCode: '6100' },
      'Siliana Sud': { localities: ['Siliana Sud'], postalCode: '6100' },
      'Makthar': { localities: ['Makthar', 'Kesra'], postalCode: '6140' }
    }
  },
  'Sousse': {
    delegations: {
      'Sousse Ville': { localities: ['Sousse Centre', 'Sousse Médina'], postalCode: '4000' },
      'Sousse Jawhara': { localities: ['Sousse Jawhara', 'Khezama'], postalCode: '4051' },
      'Sousse Riadh': { localities: ['Sousse Riadh', 'Sahloul'], postalCode: '4054' },
      'Hammam Sousse': { localities: ['Hammam Sousse'], postalCode: '4011' },
      'Msaken': { localities: ['Msaken', 'Kalaa Kébira'], postalCode: '4070' }
    }
  },
  'Monastir': {
    delegations: {
      'Monastir': { localities: ['Monastir Centre', 'Skanes'], postalCode: '5000' },
      'Moknine': { localities: ['Moknine', 'Téboulba'], postalCode: '5050' },
      'Ksar Hellal': { localities: ['Ksar Hellal'], postalCode: '5070' },
      'Jemmal': { localities: ['Jemmal', 'Menzel Kamel'], postalCode: '5020' }
    }
  },
  'Mahdia': {
    delegations: {
      'Mahdia': { localities: ['Mahdia Centre', 'Rejiche'], postalCode: '5100' },
      'Ksour Essef': { localities: ['Ksour Essef', 'El Jem'], postalCode: '5180' },
      'Chebba': { localities: ['Chebba', 'Melloulech'], postalCode: '5170' }
    }
  },
  'Sfax': {
    delegations: {
      'Sfax Ville': { localities: ['Sfax Centre', 'Médina'], postalCode: '3000' },
      'Sfax Ouest': { localities: ['Sfax Ouest', 'Sakiet Eddaier'], postalCode: '3002' },
      'Sfax Sud': { localities: ['Sfax Sud', 'Thyna'], postalCode: '3041' },
      'Sakiet Ezzit': { localities: ['Sakiet Ezzit', 'Chihia'], postalCode: '3021' },
      'Bir Ali Ben Khalifa': { localities: ['Bir Ali Ben Khalifa'], postalCode: '3040' }
    }
  },
  'Kairouan': {
    delegations: {
      'Kairouan Nord': { localities: ['Kairouan Centre', 'Médina'], postalCode: '3100' },
      'Kairouan Sud': { localities: ['Kairouan Sud', 'Chbika'], postalCode: '3100' },
      'Sbikha': { localities: ['Sbikha', 'Haffouz'], postalCode: '3160' }
    }
  },
  'Kasserine': {
    delegations: {
      'Kasserine Nord': { localities: ['Kasserine', 'Cité Ezzouhour'], postalCode: '1200' },
      'Kasserine Sud': { localities: ['Kasserine Sud'], postalCode: '1200' },
      'Sbeitla': { localities: ['Sbeitla', 'Jedeliane'], postalCode: '1250' },
      'Thala': { localities: ['Thala', 'Foussana'], postalCode: '1210' }
    }
  },
  'Sidi Bouzid': {
    delegations: {
      'Sidi Bouzid Ouest': { localities: ['Sidi Bouzid', 'Bir El Hafey'], postalCode: '9100' },
      'Sidi Bouzid Est': { localities: ['Sidi Bouzid Est'], postalCode: '9100' },
      'Regueb': { localities: ['Regueb', 'Mezzouna'], postalCode: '9170' }
    }
  },
  'Gabès': {
    delegations: {
      'Gabès Ville': { localities: ['Gabès Centre', 'Jara'], postalCode: '6000' },
      'Gabès Sud': { localities: ['Gabès Sud', 'Chenini'], postalCode: '6011' },
      'El Hamma': { localities: ['El Hamma', 'El Metouia'], postalCode: '6020' },
      'Mareth': { localities: ['Mareth', 'Zarat'], postalCode: '6044' }
    }
  },
  'Médenine': {
    delegations: {
      'Médenine Nord': { localities: ['Médenine', 'Médenine Nord'], postalCode: '4100' },
      'Médenine Sud': { localities: ['Médenine Sud'], postalCode: '4100' },
      'Ben Guerdane': { localities: ['Ben Guerdane'], postalCode: '4160' },
      'Zarzis': { localities: ['Zarzis', 'Souihel'], postalCode: '4170' },
      'Djerba Houmt Souk': { localities: ['Houmt Souk', 'Midoun'], postalCode: '4180' }
    }
  },
  'Tataouine': {
    delegations: {
      'Tataouine Nord': { localities: ['Tataouine', 'Tataouine Nord'], postalCode: '3200' },
      'Tataouine Sud': { localities: ['Tataouine Sud', 'Remada'], postalCode: '3200' },
      'Ghomrassen': { localities: ['Ghomrassen', 'Ksar Ouled Soltane'], postalCode: '3221' }
    }
  },
  'Gafsa': {
    delegations: {
      'Gafsa Nord': { localities: ['Gafsa', 'Gafsa Nord'], postalCode: '2100' },
      'Gafsa Sud': { localities: ['Gafsa Sud', 'El Ksar'], postalCode: '2100' },
      'Métlaoui': { localities: ['Métlaoui', 'Mdhilla'], postalCode: '2130' },
      'Redeyef': { localities: ['Redeyef', 'Moulares'], postalCode: '2120' }
    }
  },
  'Tozeur': {
    delegations: {
      'Tozeur': { localities: ['Tozeur', 'Bled El Hadhar'], postalCode: '2200' },
      'Nefta': { localities: ['Nefta', 'Hazoua'], postalCode: '2240' },
      'Degache': { localities: ['Degache', 'Hamet Jerid'], postalCode: '2260' }
    }
  },
  'Kébili': {
    delegations: {
      'Kébili Nord': { localities: ['Kébili', 'Kébili Nord'], postalCode: '4200' },
      'Kébili Sud': { localities: ['Kébili Sud', 'Jemna'], postalCode: '4200' },
      'Douz': { localities: ['Douz', 'Zaafrane'], postalCode: '4260' },
      'Souk Lahad': { localities: ['Souk Lahad'], postalCode: '4230' }
    }
  }
}

// Computed: Available gouvernorats
const gouvernorats = computed(() => Object.keys(tunisiaLocations))

// Computed: Available delegations based on selected gouvernorat
const availableDelegations = computed(() => {
  if (!newShipment.gouvernorat || !tunisiaLocations[newShipment.gouvernorat]) return []
  return Object.keys(tunisiaLocations[newShipment.gouvernorat].delegations)
})

// Computed: Available localities based on selected delegation
const availableLocalities = computed(() => {
  if (!newShipment.gouvernorat || !newShipment.delegation) return []
  const delegations = tunisiaLocations[newShipment.gouvernorat]?.delegations
  if (!delegations || !delegations[newShipment.delegation]) return []
  return delegations[newShipment.delegation].localities
})

// Watch gouvernorat to reset delegation and locality
watch(() => newShipment.gouvernorat, () => {
  newShipment.delegation = ''
  newShipment.locality = ''
  newShipment.postalCode = ''
})

// Watch delegation to reset locality and update postal code
watch(() => newShipment.delegation, () => {
  newShipment.locality = ''
  if (newShipment.gouvernorat && newShipment.delegation) {
    const delegations = tunisiaLocations[newShipment.gouvernorat]?.delegations
    if (delegations && delegations[newShipment.delegation]) {
      newShipment.postalCode = delegations[newShipment.delegation].postalCode
    }
  }
})

// Computed: Total price
const totalPrice = computed(() => {
  return (newShipment.productPrice || 0) + (newShipment.deliveryFee || 0)
})

// Generate reference number
function generateReference() {
  const prefix = 'REF'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

const statusTabs = [
  { id: 'all', label: 'Tous', count: 5 },
  { id: 'exception', label: 'Exception', count: 0 },
  { id: 'failed', label: 'Tentative échouée', count: 0 },
  { id: 'expired', label: 'Expiré', count: 0 },
  { id: 'out-for-delivery', label: 'En livraison', count: 1 },
  { id: 'delivered', label: 'Livré', count: 3 },
  { id: 'pending', label: 'En attente', count: 1 },
]

const shipments = ref([
  {
    id: 1,
    trackingNumber: 'YAL-2024-001234',
    carrier: 'Yalidine',
    service: 'Express',
    status: 'Delivered',
    latestEvent: '26 jan : Le colis a été livré',
    originFlag: '🇩🇿',
    origin: 'Alger',
    destination: 'Oran',
    deliveryDate: '26 jan 2024',
    transitDays: 2,
    orderNumber: 'CMD-2024-001234',
    customerName: 'Ahmed Benali',
    // Label/Bordereau info
    labelNumber: 'BRD-2024-001234',
    labelPrinted: true,
    labelPrintedAt: '24 jan 2024 à 08:45',
    weight: 2.5,
    dimensions: '30x20x15',
    cod: 3500,
    senderName: 'Ma Boutique',
    senderAddress: '123 Rue Didouche Mourad, Alger',
    senderPhone: '0555123456',
    recipientPhone: '0661234567',
    recipientPhoneSecondary: '',
    recipientAddress: '45 Boulevard de l\'ALN, Oran',
    productDescription: 'Vêtements',
    fragile: false,
    reference: 'REF-20240124-A1B2',
    productPrice: 3000,
    deliveryFee: 500,
    totalPrice: 3500,
    events: [
      { status: 'Livrée', description: 'Le colis a été livré avec succès', location: 'Oran, Algérie', date: '26 jan 2024 à 10:26', completed: true },
      { status: 'En transit', description: 'Le colis est en cours de livraison', location: 'Oran, Algérie', date: '26 jan 2024 à 08:15', completed: true },
      { status: 'En transit', description: 'Arrivée au centre de tri', location: 'Alger, Algérie', date: '25 jan 2024 à 14:30', completed: true },
      { status: 'Informations reçues', description: 'Colis pris en charge par le transporteur', location: 'Alger, Algérie', date: '24 jan 2024 à 09:00', completed: true },
    ]
  },
  {
    id: 2,
    trackingNumber: 'ZR-2024-005678',
    carrier: 'ZR Express',
    service: 'Standard',
    status: 'Out for delivery',
    latestEvent: '26 jan : En cours de livraison',
    originFlag: '🇩🇿',
    origin: 'Oran',
    destination: 'Constantine',
    deliveryDate: null,
    transitDays: 1,
    orderNumber: 'CMD-2024-005678',
    customerName: 'Fatima Zohra',
    labelNumber: 'BRD-2024-005678',
    labelPrinted: true,
    labelPrintedAt: '25 jan 2024 à 07:30',
    weight: 1.2,
    dimensions: '25x15x10',
    cod: 2800,
    senderName: 'Ma Boutique',
    senderAddress: '78 Avenue Ahmed Zabana, Oran',
    senderPhone: '0555123456',
    recipientPhone: '0771234567',
    recipientPhoneSecondary: '',
    recipientAddress: '12 Rue Larbi Ben M\'hidi, Constantine',
    productDescription: 'Accessoires',
    fragile: true,
    reference: 'REF-20240125-C2D3',
    productPrice: 2500,
    deliveryFee: 300,
    totalPrice: 2800,
    events: [
      { status: 'En livraison', description: 'Le colis est en cours de livraison', location: 'Constantine, Algérie', date: '26 jan 2024 à 09:00', completed: false },
      { status: 'En transit', description: 'Arrivée au centre de distribution', location: 'Constantine, Algérie', date: '25 jan 2024 à 18:00', completed: true },
      { status: 'Informations reçues', description: 'Colis pris en charge', location: 'Oran, Algérie', date: '25 jan 2024 à 08:00', completed: true },
    ]
  },
  {
    id: 3,
    trackingNumber: 'MAY-2024-009012',
    carrier: 'Maystro',
    service: 'Express',
    status: 'Delivered',
    latestEvent: '25 jan : Colis livré',
    originFlag: '🇩🇿',
    origin: 'Constantine',
    destination: 'Sétif',
    deliveryDate: '25 jan 2024',
    transitDays: 1,
    orderNumber: 'CMD-2024-009012',
    customerName: 'Karim Messaoudi',
    labelNumber: 'BRD-2024-009012',
    labelPrinted: true,
    labelPrintedAt: '24 jan 2024 à 15:45',
    weight: 0.8,
    dimensions: '20x15x8',
    cod: 1500,
    senderName: 'Ma Boutique',
    senderAddress: '56 Rue de France, Constantine',
    senderPhone: '0555123456',
    recipientPhone: '0551234567',
    recipientPhoneSecondary: '',
    recipientAddress: '23 Cité des Frères Saadane, Sétif',
    productDescription: 'Cosmétiques',
    fragile: true,
    reference: 'REF-20240124-E4F5',
    productPrice: 1200,
    deliveryFee: 300,
    totalPrice: 1500,
    events: [
      { status: 'Livrée', description: 'Le colis a été livré avec succès', location: 'Sétif, Algérie', date: '25 jan 2024 à 14:30', completed: true },
      { status: 'En transit', description: 'En cours de livraison', location: 'Sétif, Algérie', date: '25 jan 2024 à 09:00', completed: true },
      { status: 'Informations reçues', description: 'Colis pris en charge', location: 'Constantine, Algérie', date: '24 jan 2024 à 16:00', completed: true },
    ]
  },
  {
    id: 4,
    trackingNumber: 'ECO-2024-003456',
    carrier: 'Ecotrack',
    service: '-',
    status: 'Pending',
    latestEvent: '24 jan : Colis créé',
    originFlag: '🇩🇿',
    origin: 'Blida',
    destination: 'Alger',
    deliveryDate: null,
    transitDays: 0,
    orderNumber: 'CMD-2024-003456',
    customerName: 'Salim Boudiaf',
    labelNumber: 'BRD-2024-003456',
    labelPrinted: false,
    labelPrintedAt: null,
    weight: 3.0,
    dimensions: '40x30x20',
    cod: 5200,
    senderName: 'Ma Boutique',
    senderAddress: '89 Rue des Martyrs, Blida',
    senderPhone: '0555123456',
    recipientPhone: '0661987654',
    recipientPhoneSecondary: '',
    recipientAddress: '34 Rue Hassiba Ben Bouali, Alger',
    productDescription: 'Électronique',
    fragile: true,
    reference: 'REF-20240124-G6H7',
    productPrice: 4800,
    deliveryFee: 400,
    totalPrice: 5200,
    events: [
      { status: 'Informations reçues', description: 'Commande en attente de ramassage', location: 'Blida, Algérie', date: '24 jan 2024 à 11:00', completed: true },
    ]
  },
  {
    id: 5,
    trackingNumber: 'YAL-2024-007890',
    carrier: 'Yalidine',
    service: 'Standard',
    status: 'Delivered',
    latestEvent: '23 jan : Colis livré',
    originFlag: '🇩🇿',
    origin: 'Sétif',
    destination: 'Annaba',
    deliveryDate: '23 jan 2024',
    transitDays: 3,
    orderNumber: 'CMD-2024-007890',
    customerName: 'Nadia Berkane',
    labelNumber: 'BRD-2024-007890',
    labelPrinted: true,
    labelPrintedAt: '20 jan 2024 à 09:30',
    weight: 1.8,
    dimensions: '35x25x12',
    cod: 4100,
    senderName: 'Ma Boutique',
    senderAddress: '67 Boulevard de la République, Sétif',
    senderPhone: '0555123456',
    recipientPhone: '0791234567',
    recipientAddress: '56 Rue Badji Mokhtar, Annaba',
    productDescription: 'Chaussures',
    fragile: false,
    events: [
      { status: 'Livrée', description: 'Le colis a été livré avec succès', location: 'Annaba, Algérie', date: '23 jan 2024 à 11:45', completed: true },
      { status: 'En transit', description: 'En cours de livraison', location: 'Annaba, Algérie', date: '23 jan 2024 à 08:30', completed: true },
      { status: 'En transit', description: 'Arrivée au centre de tri', location: 'Constantine, Algérie', date: '22 jan 2024 à 15:00', completed: true },
      { status: 'Informations reçues', description: 'Colis pris en charge', location: 'Sétif, Algérie', date: '20 jan 2024 à 10:00', completed: true },
    ]
  },
])

const carriers = ref([
  {
    id: 1,
    name: 'Yalidine',
    apiId: 'YAL-API-001',
    apiKey: 'yal_live_xxxxx',
    apiStatus: 'connected',
    shipments: 156,
    delivered: 148,
    deliveryRate: 94.9,
    avgTime: 2.8,
    // Fees structure
    fraisColisLivres: 7.00,
    fraisColisRetour: 5.00,
    fraisColisEchange: 8.00,
    fraisColisBig: 12.00,
    fraisColisPickup: 3.00,
    totalFraisLivraison: 7.00,
    fraisPaiement: 1.5, // percentage
    retenuPassage: 0.00,
    // Region coverage
    allRegions: true,
    regions: [] as string[]
  },
  {
    id: 2,
    name: 'ZR Express',
    apiId: 'ZR-API-002',
    apiKey: 'zr_live_xxxxx',
    apiStatus: 'connected',
    shipments: 89,
    delivered: 82,
    deliveryRate: 92.1,
    avgTime: 3.2,
    fraisColisLivres: 6.50,
    fraisColisRetour: 4.50,
    fraisColisEchange: 7.50,
    fraisColisBig: 11.00,
    fraisColisPickup: 2.50,
    totalFraisLivraison: 6.50,
    fraisPaiement: 1.0,
    retenuPassage: 0.00,
    allRegions: false,
    regions: ['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Sousse', 'Monastir', 'Sfax']
  },
  {
    id: 3,
    name: 'Maystro',
    apiId: 'MAY-API-003',
    apiKey: 'may_live_xxxxx',
    apiStatus: 'connected',
    shipments: 234,
    delivered: 225,
    deliveryRate: 96.2,
    avgTime: 2.5,
    fraisColisLivres: 7.50,
    fraisColisRetour: 5.50,
    fraisColisEchange: 9.00,
    fraisColisBig: 13.00,
    fraisColisPickup: 3.50,
    totalFraisLivraison: 7.50,
    fraisPaiement: 2.0,
    retenuPassage: 0.00,
    allRegions: true,
    regions: [] as string[]
  },
  {
    id: 4,
    name: 'Ecotrack',
    apiId: 'ECO-API-004',
    apiKey: 'eco_live_xxxxx',
    apiStatus: 'disconnected',
    shipments: 67,
    delivered: 61,
    deliveryRate: 91.0,
    avgTime: 3.8,
    fraisColisLivres: 6.00,
    fraisColisRetour: 4.00,
    fraisColisEchange: 7.00,
    fraisColisBig: 10.00,
    fraisColisPickup: 2.00,
    totalFraisLivraison: 6.00,
    fraisPaiement: 1.5,
    retenuPassage: 0.00,
    allRegions: false,
    regions: ['Tunis', 'Ariana', 'Ben Arous', 'Nabeul', 'Bizerte']
  },
])

// New carrier form
const newCarrier = reactive({
  name: '',
  apiId: '',
  apiKey: '',
  fraisColisLivres: 7.00,
  fraisColisRetour: 5.00,
  fraisColisEchange: 8.00,
  fraisColisBig: 12.00,
  fraisColisPickup: 3.00,
  totalFraisLivraison: 7.00,
  fraisPaiement: 1.5,
  retenuPassage: 0.00,
  allRegions: true,
  regions: [] as string[]
})

const showAddCarrierModal = ref(false)
const editingCarrier = ref<number | null>(null)
const selectedCarrier = ref<typeof carriers.value[0] | null>(null)

// Returns tracking data (synced from carriers)
const isSyncingReturns = ref(false)
const activeReturnsFilter = ref<'all' | 'on-time' | 'delayed'>('all')
const returnsData = reactive({
  active: 12,
  recovered: 45,
  lost: 3,
  total: 60,
  totalValue: 2450,
  recoveredValue: 1850,
  pendingValue: 480,
  lostValue: 120
})

// Active returns statistics (on-time vs delayed)
const activeReturnsStats = computed(() => {
  const activeRetours = returnsList.value.filter(r => r.status === 'En transit')
  const delayed = activeRetours.filter(r => r.isDelayed)
  const onTime = activeRetours.filter(r => !r.isDelayed)
  return {
    total: activeRetours.length,
    delayed: delayed.length,
    onTime: onTime.length,
    delayedPercent: activeRetours.length > 0 ? Math.round((delayed.length / activeRetours.length) * 100) : 0,
    onTimePercent: activeRetours.length > 0 ? Math.round((onTime.length / activeRetours.length) * 100) : 0
  }
})

// Statistics per carrier for return value page
const carriersReturnStats = ref([
  {
    name: 'Yalidine',
    totalReturns: 28,
    returnRate: 4.2,
    totalValue: 1250,
    recovered: 22,
    recoveredValue: 980,
    inTransit: 5,
    inTransitValue: 220,
    lost: 1,
    lostValue: 50,
    returnFees: 140,
    avgReturnDays: 3.5,
    recoveryRate: 92,
    reasons: {
      'Client absent': 12,
      'Refus client': 8,
      'Adresse incorrecte': 5,
      'Autre': 3
    }
  },
  {
    name: 'ZR Express',
    totalReturns: 18,
    returnRate: 6.8,
    totalValue: 720,
    recovered: 14,
    recoveredValue: 560,
    inTransit: 3,
    inTransitValue: 120,
    lost: 1,
    lostValue: 40,
    returnFees: 90,
    avgReturnDays: 4.2,
    recoveryRate: 88,
    reasons: {
      'Refus client': 9,
      'Client absent': 5,
      'Colis endommagé': 2,
      'Adresse incorrecte': 2
    }
  },
  {
    name: 'Maystro',
    totalReturns: 14,
    returnRate: 3.5,
    totalValue: 480,
    recovered: 12,
    recoveredValue: 420,
    inTransit: 2,
    inTransitValue: 60,
    lost: 0,
    lostValue: 0,
    returnFees: 56,
    avgReturnDays: 2.8,
    recoveryRate: 100,
    reasons: {
      'Client absent': 6,
      'Refus client': 5,
      'Autre': 3
    }
  }
])

// Report analytics data
const reportPeriod = ref('month')
const reportAnalytics = reactive({
  totalReturns: 60,
  avgAttempts: 1.8,
  multipleAttemptsCost: 245,
  reasonsBreakdown: [
    { name: 'Client absent', count: 27, percentage: 45, suggestion: 'Contactez les clients via WhatsApp avant livraison pour confirmer leur disponibilité' },
    { name: 'Refus client', count: 18, percentage: 30, suggestion: 'Améliorez les descriptions produits et confirmez les commandes' },
    { name: 'Adresse incorrecte', count: 8, percentage: 13, suggestion: 'Vérifiez les adresses avec les clients lors de la commande' },
    { name: 'Colis endommagé', count: 4, percentage: 7, suggestion: 'Renforcez l\'emballage des produits fragiles' },
    { name: 'Hors zone', count: 3, percentage: 5, suggestion: 'Vérifiez la couverture du transporteur avant expédition' }
  ],
  attemptsBreakdown: [
    { attempts: 1, label: '1 tentative', count: 35, percentage: 58 },
    { attempts: 2, label: '2 tentatives', count: 15, percentage: 25 },
    { attempts: 3, label: '3 tentatives', count: 7, percentage: 12 },
    { attempts: 4, label: '4+ tentatives', count: 3, percentage: 5 }
  ],
  carrierComparison: [
    { name: 'Maystro', totalShipments: 400, returnRate: 3.5, avgAttempts: 1.4, recoveryRate: 100, avgReturnDays: 2.8, score: 9.2, recommendation: 'Excellent' },
    { name: 'Yalidine', totalShipments: 665, returnRate: 4.2, avgAttempts: 1.6, recoveryRate: 92, avgReturnDays: 3.5, score: 8.1, recommendation: 'Bon' },
    { name: 'ZR Express', totalShipments: 265, returnRate: 6.8, avgAttempts: 2.1, recoveryRate: 88, avgReturnDays: 4.2, score: 6.5, recommendation: 'À surveiller' }
  ],
  productIssues: [
    { product: 'Robe été fleurie', returns: 8, returnRate: 18, reason: 'Taille' },
    { product: 'Chaussures sport', returns: 6, returnRate: 15, reason: 'Qualité' },
    { product: 'Sac à main cuir', returns: 4, returnRate: 12, reason: 'Couleur' }
  ],
  problematicZones: [
    { region: 'Kasserine', returns: 12, total: 65, returnRate: 18.5 },
    { region: 'Sidi Bouzid', returns: 8, total: 52, returnRate: 15.4 },
    { region: 'Gafsa', returns: 6, total: 48, returnRate: 12.5 }
  ],
  carrierAdvice: 'Réduisez les expéditions via ZR Express dans les zones à fort taux de retour et privilégiez Maystro',
  carrierImpact: 15,
  productAdvice: 'Ajoutez un guide des tailles détaillé pour la catégorie vêtements et améliorez les photos',
  productImpact: 20,
  processAdvice: 'Implémentez une confirmation WhatsApp avant livraison pour les commandes > 100 DT',
  processImpact: 25
})

const returnsList = ref([
  // En transit (active returns) - À l'heure
  {
    id: 1,
    trackingNumber: 'RET-2026-001234',
    originalOrder: 'CMD-2026-001234',
    customerName: 'Ahmed Benali',
    destination: 'Tunis, Tunis',
    carrier: 'Yalidine',
    reason: 'Client absent',
    status: 'En transit',
    value: 450,
    returnDate: '26 jan 2026',
    isDelayed: false,
    daysDelayed: 0,
    expectedArrival: '29 jan 2026'
  },
  {
    id: 2,
    trackingNumber: 'RET-2026-001235',
    originalOrder: 'CMD-2026-001235',
    customerName: 'Fatima Zohra',
    destination: 'Sousse, Sousse',
    carrier: 'ZR Express',
    reason: 'Adresse incorrecte',
    status: 'En transit',
    value: 320,
    returnDate: '25 jan 2026',
    isDelayed: true,
    daysDelayed: 2,
    expectedArrival: '25 jan 2026'
  },
  {
    id: 5,
    trackingNumber: 'RET-2026-001240',
    originalOrder: 'CMD-2026-001240',
    customerName: 'Karim Mejri',
    destination: 'Bizerte, Bizerte',
    carrier: 'Yalidine',
    reason: 'Client absent',
    status: 'En transit',
    value: 180,
    returnDate: '26 jan 2026',
    isDelayed: false,
    daysDelayed: 0,
    expectedArrival: '30 jan 2026'
  },
  {
    id: 8,
    trackingNumber: 'RET-2026-001241',
    originalOrder: 'CMD-2026-001241',
    customerName: 'Sami Bouaziz',
    destination: 'Nabeul, Nabeul',
    carrier: 'Maystro',
    reason: 'Refus client',
    status: 'En transit',
    value: 290,
    returnDate: '24 jan 2026',
    isDelayed: true,
    daysDelayed: 4,
    expectedArrival: '23 jan 2026'
  },
  {
    id: 9,
    trackingNumber: 'RET-2026-001242',
    originalOrder: 'CMD-2026-001242',
    customerName: 'Leila Khelifi',
    destination: 'Gabès, Gabès',
    carrier: 'ZR Express',
    reason: 'Client absent',
    status: 'En transit',
    value: 520,
    returnDate: '22 jan 2026',
    isDelayed: true,
    daysDelayed: 5,
    expectedArrival: '22 jan 2026'
  },
  {
    id: 10,
    trackingNumber: 'RET-2026-001243',
    originalOrder: 'CMD-2026-001243',
    customerName: 'Youssef Mansour',
    destination: 'Médenine, Médenine',
    carrier: 'Yalidine',
    reason: 'Adresse incorrecte',
    status: 'En transit',
    value: 380,
    returnDate: '26 jan 2026',
    isDelayed: false,
    daysDelayed: 0,
    expectedArrival: '31 jan 2026'
  },
  // Récupérés (recovered)
  {
    id: 3,
    trackingNumber: 'RET-2026-001230',
    originalOrder: 'CMD-2026-001230',
    customerName: 'Mohamed Trabelsi',
    destination: 'Sfax, Sfax',
    carrier: 'Maystro',
    reason: 'Refus client',
    status: 'Récupéré',
    value: 580,
    returnDate: '24 jan 2026',
    isDelayed: false,
    daysDelayed: 0,
    expectedArrival: null
  },
  {
    id: 6,
    trackingNumber: 'RET-2026-001220',
    originalOrder: 'CMD-2026-001220',
    customerName: 'Nadia Hamdi',
    destination: 'Ariana, Ariana',
    carrier: 'ZR Express',
    reason: 'Client absent',
    status: 'Récupéré',
    value: 420,
    returnDate: '22 jan 2026',
    isDelayed: false,
    daysDelayed: 0,
    expectedArrival: null
  },
  {
    id: 7,
    trackingNumber: 'RET-2026-001215',
    originalOrder: 'CMD-2026-001215',
    customerName: 'Ali Saidi',
    destination: 'Monastir, Monastir',
    carrier: 'Maystro',
    reason: 'Injoignable',
    status: 'Récupéré',
    value: 350,
    returnDate: '21 jan 2026',
    isDelayed: false,
    daysDelayed: 0,
    expectedArrival: null
  },
  // Perdus (lost)
  {
    id: 4,
    trackingNumber: 'RET-2026-001228',
    originalOrder: 'CMD-2026-001228',
    customerName: 'Sarra Ben Ali',
    destination: 'Nabeul, Nabeul',
    carrier: 'Ecotrack',
    reason: 'Injoignable',
    status: 'Perdu',
    value: 200,
    returnDate: '23 jan 2026',
    isDelayed: false,
    daysDelayed: 0,
    expectedArrival: null
  },
  {
    id: 11,
    trackingNumber: 'RET-2026-001200',
    originalOrder: 'CMD-2026-001200',
    customerName: 'Rim Gharbi',
    destination: 'Gabès, Gabès',
    carrier: 'Ecotrack',
    reason: 'Colis endommagé',
    status: 'Perdu',
    value: 650,
    returnDate: '18 jan 2026',
    isDelayed: false,
    daysDelayed: 0,
    expectedArrival: null
  }
])

// Computed: Filtered returns based on active section
const filteredReturns = computed(() => {
  const statusMap: Record<string, string> = {
    'active-returns': 'En transit',
    'recovered-returns': 'Récupéré',
    'lost-returns': 'Perdu'
  }

  const targetStatus = statusMap[activeSection.value]
  if (targetStatus) {
    let filtered = returnsList.value.filter(r => r.status === targetStatus)

    // Apply on-time/delayed filter for active returns
    if (activeSection.value === 'active-returns' && activeReturnsFilter.value !== 'all') {
      if (activeReturnsFilter.value === 'delayed') {
        filtered = filtered.filter(r => r.isDelayed)
      } else if (activeReturnsFilter.value === 'on-time') {
        filtered = filtered.filter(r => !r.isDelayed)
      }
    }

    return filtered
  }

  // For other sections, return all
  return returnsList.value
})

// Computed: Section title for returns
const returnsSectionTitle = computed(() => {
  const titles: Record<string, string> = {
    'active-returns': 'Retours en transit',
    'recovered-returns': 'Retours récupérés',
    'lost-returns': 'Retours perdus',
    'return-value': 'Valeur des retours',
    'return-reports': 'Rapports de retours'
  }
  return titles[activeSection.value] || 'Suivi des Retours'
})

const chartData = ref([20, 35, 45, 30, 55, 40, 65, 50, 70, 60, 80, 75])
const chartLabels = ref(['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'])

// ==================== ANALYTICS DATA ====================
const analyticsDateRange = ref('30')
const trendsPeriod = ref('monthly')
const riskZoneFilter = ref('all')

// Global KPIs
const analyticsKpis = reactive({
  totalShipments: 2847,
  deliveryRate: 94.5,
  avgTransitTime: 3.2,
  totalRevenue: 456780,
  returnRate: 8.2,
  exceptionRate: 2.1,
  customerSatisfaction: 92
})

const analyticsKpiComparison = ref([
  { name: 'Volume de colis', current: '2,847', previous: '2,542', change: 12 },
  { name: 'Taux de livraison', current: '94.5%', previous: '92.2%', change: 2.3 },
  { name: 'Temps transit moyen', current: '3.2 jours', previous: '2.7 jours', change: -18.5 },
  { name: 'Taux de retour', current: '8.2%', previous: '9.1%', change: 9.9 },
  { name: 'Chiffre d\'affaires', current: '456,780 DT', previous: '422,945 DT', change: 8 }
])

// Delivery Performance
const deliveryPerformance = reactive({
  successfulDeliveries: 2689,
  totalAttempts: 3142,
  firstAttemptRate: 78,
  avgDeliveryTime: 52,
  onTimeRate: 89,
  regionalPerformance: [
    { name: 'Tunis', rate: 96, shipments: 847, avgTime: '2.1' },
    { name: 'Sfax', rate: 92, shipments: 423, avgTime: '3.5' },
    { name: 'Sousse', rate: 94, shipments: 312, avgTime: '2.8' },
    { name: 'Nabeul', rate: 88, shipments: 256, avgTime: '3.2' },
    { name: 'Bizerte', rate: 85, shipments: 198, avgTime: '4.1' },
    { name: 'Gabès', rate: 79, shipments: 145, avgTime: '5.2' }
  ]
})

// Return Intelligence
const returnIntelligence = reactive({
  totalReturns: 234,
  lostRevenue: 45670,
  recoveredReturns: 89,
  recoveryRate: 38,
  returnReasons: [
    { name: 'Client absent', percentage: 35, color: '#f97316' },
    { name: 'Adresse incorrecte', percentage: 22, color: '#3b82f6' },
    { name: 'Refus de paiement', percentage: 18, color: '#ef4444' },
    { name: 'Produit endommagé', percentage: 12, color: '#8b5cf6' },
    { name: 'Changement d\'avis', percentage: 8, color: '#10b981' },
    { name: 'Autre', percentage: 5, color: '#6b7280' }
  ],
  returnTrend: [45, 52, 38, 41, 56, 48, 35, 42, 38, 44, 40, 36],
  recommendations: [
    { title: 'Confirmation WhatsApp', description: 'Contactez les clients via WhatsApp avant livraison dans les zones à risque pour réduire les absences de 25%', priority: 'high', impact: '-25% retours' },
    { title: 'Validation d\'adresse', description: 'Implémentez une vérification d\'adresse automatique lors de la création des colis', priority: 'medium', impact: '-15% retours' },
    { title: 'Options de paiement', description: 'Proposez le paiement partiel ou différé pour les clients hésitants', priority: 'low', impact: '-10% retours' }
  ]
})

// Risk Zones
const riskZones = reactive({
  highRiskCount: 4,
  mediumRiskCount: 8,
  lowRiskCount: 12,
  zones: [
    { name: 'Kasserine', risk: 'high', failureRate: 28, returnRate: 22, affectedShipments: 67, mainReason: 'Client absent' },
    { name: 'Sidi Bouzid', risk: 'high', failureRate: 25, returnRate: 19, affectedShipments: 45, mainReason: 'Adresse incorrecte' },
    { name: 'Tataouine', risk: 'high', failureRate: 32, returnRate: 24, affectedShipments: 23, mainReason: 'Zone difficile' },
    { name: 'Gafsa', risk: 'high', failureRate: 26, returnRate: 20, affectedShipments: 56, mainReason: 'Client absent' },
    { name: 'Gabès', risk: 'medium', failureRate: 18, returnRate: 14, affectedShipments: 89, mainReason: 'Retard livraison' },
    { name: 'Médenine', risk: 'medium', failureRate: 15, returnRate: 12, affectedShipments: 72, mainReason: 'Client absent' },
    { name: 'Kairouan', risk: 'medium', failureRate: 14, returnRate: 11, affectedShipments: 98, mainReason: 'Adresse incorrecte' },
    { name: 'Jendouba', risk: 'medium', failureRate: 16, returnRate: 13, affectedShipments: 54, mainReason: 'Zone difficile' },
    { name: 'Tunis', risk: 'low', failureRate: 6, returnRate: 4, affectedShipments: 847, mainReason: 'Client absent' },
    { name: 'Sfax', risk: 'low', failureRate: 8, returnRate: 6, affectedShipments: 423, mainReason: 'Changement avis' },
    { name: 'Sousse', risk: 'low', failureRate: 7, returnRate: 5, affectedShipments: 312, mainReason: 'Client absent' }
  ]
})

const filteredRiskZones = computed(() => {
  if (riskZoneFilter.value === 'all') return riskZones.zones
  return riskZones.zones.filter(z => z.risk === riskZoneFilter.value)
})

// Anomaly Detection
const anomalyDetection = reactive({
  criticalAnomalies: 2,
  warningAnomalies: 5,
  infoAnomalies: 8,
  resolvedAnomalies: 23,
  activeAnomalies: [
    { id: 1, severity: 'critical', title: 'Pic de retours à Kasserine', description: 'Augmentation de 45% des retours dans cette zone les 7 derniers jours', detectedAt: 'Il y a 2 heures', affectedItems: 23 },
    { id: 2, severity: 'critical', title: 'Délai anormal transporteur Rapid Poste', description: 'Temps de transit moyen passé de 2.5 à 5.2 jours', detectedAt: 'Il y a 5 heures', affectedItems: 67 },
    { id: 3, severity: 'warning', title: 'Taux d\'échec élevé zone Bizerte', description: 'Taux d\'échec à 18% (normalement 8%)', detectedAt: 'Il y a 1 jour', affectedItems: 34 },
    { id: 4, severity: 'warning', title: 'Augmentation des réclamations', description: '12 réclamations en 24h (moyenne: 4)', detectedAt: 'Il y a 1 jour', affectedItems: 12 },
    { id: 5, severity: 'info', title: 'Volume inhabituel', description: 'Volume de colis 25% supérieur à la normale', detectedAt: 'Il y a 2 jours', affectedItems: 156 }
  ]
})

// Trends
const trends = reactive({
  labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
  volumeTrend: [180, 220, 195, 240, 280, 260, 310, 295],
  deliveryRateTrend: [91, 92, 90, 93, 94, 92, 95, 94],
  volumeForecast: 12,
  deliveryForecast: 95,
  insights: [
    { title: 'Volume en hausse', description: 'Le volume de colis augmente de 8% en moyenne chaque semaine', trend: 'up', period: '8 dernières semaines' },
    { title: 'Amélioration livraison', description: 'Le taux de livraison s\'améliore progressivement', trend: 'up', period: 'Depuis 4 semaines' },
    { title: 'Retours en baisse', description: 'Les retours diminuent grâce aux mesures prises', trend: 'down', period: '2 dernières semaines' },
    { title: 'Pic weekend', description: 'Les commandes augmentent de 35% le weekend', trend: 'up', period: 'Pattern récurrent' },
    { title: 'Zone Sfax', description: 'Performance en amélioration constante', trend: 'up', period: '6 dernières semaines' },
    { title: 'Coûts transport', description: 'Légère augmentation des coûts moyens', trend: 'down', period: 'Ce mois' }
  ]
})

// Reports
const reports = reactive({
  templates: [
    { id: 1, name: 'Performance Globale', description: 'Vue d\'ensemble de tous les KPIs', icon: markRaw(BarChart2), bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { id: 2, name: 'Analyse Retours', description: 'Détail des motifs et tendances', icon: markRaw(RotateCcw), bgColor: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600' },
    { id: 3, name: 'Performance Transporteurs', description: 'Comparatif des transporteurs', icon: markRaw(Truck), bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600' },
    { id: 4, name: 'Analyse Régionale', description: 'Performance par zone', icon: markRaw(MapPinned), bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' }
  ],
  recentReports: [
    { id: 1, name: 'Rapport mensuel Janvier 2026', type: 'Performance Globale', period: '01/01 - 31/01', generatedAt: '28 Jan 2026', size: '2.4 MB' },
    { id: 2, name: 'Analyse retours S4', type: 'Analyse Retours', period: 'Semaine 4', generatedAt: '27 Jan 2026', size: '1.1 MB' },
    { id: 3, name: 'Bilan transporteurs', type: 'Performance Transporteurs', period: '01/01 - 27/01', generatedAt: '27 Jan 2026', size: '890 KB' },
    { id: 4, name: 'Zones à risque - Janvier', type: 'Analyse Régionale', period: 'Janvier 2026', generatedAt: '25 Jan 2026', size: '1.8 MB' }
  ]
})

const filteredShipments = computed(() => {
  let result = shipments.value

  if (activeStatusTab.value !== 'all') {
    const statusMap: Record<string, string> = {
      'exception': 'Exception',
      'failed': 'Failed attempt',
      'expired': 'Expired',
      'out-for-delivery': 'Out for delivery',
      'delivered': 'Delivered',
      'pending': 'Pending'
    }
    result = result.filter(s => s.status === statusMap[activeStatusTab.value])
  }

  if (searchQuery.value) {
    result = result.filter(s =>
      s.trackingNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return result
})

// Pickup related computed properties
const pendingPickups = computed(() => {
  return shipments.value.filter(s => s.status === 'Pending')
})

const scheduledPickups = ref<any[]>([])

const completedPickupsCount = computed(() => {
  return shipments.value.filter(s => s.status !== 'Pending').length
})

const minPickupDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Label-related computed properties
const printedLabelsCount = computed(() => {
  return shipments.value.filter(s => s.labelPrinted).length
})

const unprintedLabelsCount = computed(() => {
  return shipments.value.filter(s => !s.labelPrinted).length
})

const totalCOD = computed(() => {
  return shipments.value.reduce((sum, s) => sum + (s.cod || 0), 0)
})

const filteredLabels = computed(() => {
  let result = shipments.value

  // Filter by print status
  if (labelFilterPrinted.value === 'printed') {
    result = result.filter(s => s.labelPrinted)
  } else if (labelFilterPrinted.value === 'unprinted') {
    result = result.filter(s => !s.labelPrinted)
  }

  // Filter by search query
  if (labelSearchQuery.value) {
    const query = labelSearchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.labelNumber?.toLowerCase().includes(query) ||
      s.customerName?.toLowerCase().includes(query) ||
      s.recipientPhone?.toLowerCase().includes(query) ||
      s.trackingNumber?.toLowerCase().includes(query)
    )
  }

  return result
})

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    'Delivered': 'Livré',
    'Out for delivery': 'En livraison',
    'Pending': 'En attente',
    'Exception': 'Exception',
    'Failed attempt': 'Tentative échouée',
    'Expired': 'Expiré'
  }
  return labels[status] || status
}

function getStatusTextClass(status: string) {
  const classes: Record<string, string> = {
    'Delivered': 'text-green-600',
    'Out for delivery': 'text-blue-600',
    'Pending': 'text-gray-600',
    'Exception': 'text-red-600',
    'Failed attempt': 'text-orange-600',
    'Expired': 'text-gray-500'
  }
  return classes[status] || 'text-gray-600'
}

function getStatusDotClass(status: string) {
  const classes: Record<string, string> = {
    'Delivered': 'bg-green-500',
    'Out for delivery': 'bg-blue-500',
    'Pending': 'bg-gray-400',
    'Exception': 'bg-red-500',
    'Failed attempt': 'bg-orange-500',
    'Expired': 'bg-gray-400'
  }
  return classes[status] || 'bg-gray-400'
}

function getSectionTitle(section: string) {
  // Find the section in sub-navigation
  for (const key in subNavigation) {
    const item = subNavigation[key].find(s => s.id === section)
    if (item) return item.label
  }
  return section
}

// Carrier delivery fees (base prices per carrier)
const carrierDeliveryFees: Record<string, number> = {
  'Aramex': 12,
  'Rapid Poste': 8,
  'Logidis': 7,
  'PosteXpress': 9,
  'Tunisie Colis': 6,
  'DHL Express': 15,
  'FedEx': 18,
  'Sotumag': 7
}

function selectShipmentCarrier(carrier: any) {
  newShipment.carrier = carrier.name
  // Set delivery fee based on carrier
  newShipment.deliveryFee = carrierDeliveryFees[carrier.name] || 7
}

function resetShipmentForm() {
  newShipment.trackingNumber = ''
  newShipment.carrier = ''
  newShipment.customerName = ''
  newShipment.phone = ''
  newShipment.phoneSecondary = ''
  newShipment.address = ''
  newShipment.gouvernorat = ''
  newShipment.delegation = ''
  newShipment.locality = ''
  newShipment.postalCode = ''
  newShipment.productName = ''
  newShipment.isFragile = false
  newShipment.description = ''
  newShipment.productPrice = 0
  newShipment.deliveryFee = 7
  newShipment.reference = ''
}

function addShipment() {
  // Validate required fields
  if (!newShipment.customerName || !newShipment.phone || !newShipment.address || !newShipment.gouvernorat || !newShipment.delegation || !newShipment.productName) {
    return
  }

  const timestamp = Date.now()
  const labelNumber = `BRD-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`
  const reference = newShipment.reference || generateReference()
  const trackingNumber = newShipment.trackingNumber || `TN-${new Date().getFullYear()}-${String(timestamp).slice(-8)}`

  // Build full destination address
  const fullDestination = [
    newShipment.locality,
    newShipment.delegation,
    newShipment.gouvernorat
  ].filter(Boolean).join(', ')

  shipments.value.unshift({
    id: timestamp,
    trackingNumber: trackingNumber,
    carrier: newShipment.carrier || 'À assigner',
    service: '-',
    status: 'Pending',
    latestEvent: `${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} : Colis créé`,
    originFlag: '🇹🇳',
    origin: 'Tunisie',
    destination: fullDestination || newShipment.gouvernorat,
    deliveryDate: null,
    transitDays: 0,
    orderNumber: `CMD-${timestamp}`,
    customerName: newShipment.customerName,
    // Auto-generated label data
    labelNumber: labelNumber,
    labelPrinted: false,
    labelPrintedAt: null,
    weight: 1.0,
    dimensions: '20x15x10',
    cod: totalPrice.value,
    senderName: 'Ma Boutique',
    senderAddress: 'Tunisie',
    senderPhone: '+216 00 000 000',
    recipientPhone: `+216 ${newShipment.phone}`,
    recipientPhoneSecondary: newShipment.phoneSecondary ? `+216 ${newShipment.phoneSecondary}` : '',
    recipientAddress: `${newShipment.address}, ${newShipment.postalCode} ${fullDestination}`,
    productDescription: newShipment.productName + (newShipment.description ? ` - ${newShipment.description}` : ''),
    fragile: newShipment.isFragile,
    reference: reference,
    productPrice: newShipment.productPrice,
    deliveryFee: newShipment.deliveryFee,
    totalPrice: totalPrice.value,
    events: [
      { status: 'Informations reçues', description: 'Commande en attente de ramassage', location: 'Tunisie', date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), completed: true },
    ]
  })

  resetShipmentForm()
  showAddShipmentModal.value = false
}

// Carrier functions
function openAddCarrierModal() {
  editingCarrier.value = null
  resetCarrierForm()
  showAddCarrierModal.value = true
}

function editCarrier(carrier: typeof carriers.value[0]) {
  editingCarrier.value = carrier.id
  newCarrier.name = carrier.name
  newCarrier.apiId = carrier.apiId
  newCarrier.apiKey = carrier.apiKey
  newCarrier.fraisColisLivres = carrier.fraisColisLivres
  newCarrier.fraisColisRetour = carrier.fraisColisRetour
  newCarrier.fraisColisEchange = carrier.fraisColisEchange
  newCarrier.fraisColisBig = carrier.fraisColisBig
  newCarrier.fraisColisPickup = carrier.fraisColisPickup
  newCarrier.totalFraisLivraison = carrier.totalFraisLivraison
  newCarrier.fraisPaiement = carrier.fraisPaiement
  newCarrier.retenuPassage = carrier.retenuPassage
  newCarrier.allRegions = carrier.allRegions
  newCarrier.regions = [...carrier.regions]
  showAddCarrierModal.value = true
}

function closeCarrierModal() {
  showAddCarrierModal.value = false
  editingCarrier.value = null
  resetCarrierForm()
}

function resetCarrierForm() {
  newCarrier.name = ''
  newCarrier.apiId = ''
  newCarrier.apiKey = ''
  newCarrier.fraisColisLivres = 7.00
  newCarrier.fraisColisRetour = 5.00
  newCarrier.fraisColisEchange = 8.00
  newCarrier.fraisColisBig = 12.00
  newCarrier.fraisColisPickup = 3.00
  newCarrier.totalFraisLivraison = 7.00
  newCarrier.fraisPaiement = 1.5
  newCarrier.retenuPassage = 0.00
  newCarrier.allRegions = true
  newCarrier.regions = []
}

// Region selection helpers
function handleAllRegionsToggle() {
  if (newCarrier.allRegions) {
    newCarrier.regions = []
  }
}

function selectAllRegions() {
  newCarrier.regions = [...gouvernorats.value]
}

function clearAllRegions() {
  newCarrier.regions = []
}

function saveCarrier() {
  if (!newCarrier.name || !newCarrier.apiId || !newCarrier.apiKey) {
    return
  }

  // Validate regions if not all regions
  if (!newCarrier.allRegions && newCarrier.regions.length === 0) {
    return // At least one region must be selected
  }

  if (editingCarrier.value) {
    // Update existing carrier
    const index = carriers.value.findIndex(c => c.id === editingCarrier.value)
    if (index !== -1) {
      carriers.value[index] = {
        ...carriers.value[index],
        name: newCarrier.name,
        apiId: newCarrier.apiId,
        apiKey: newCarrier.apiKey,
        fraisColisLivres: newCarrier.fraisColisLivres,
        fraisColisRetour: newCarrier.fraisColisRetour,
        fraisColisEchange: newCarrier.fraisColisEchange,
        fraisColisBig: newCarrier.fraisColisBig,
        fraisColisPickup: newCarrier.fraisColisPickup,
        totalFraisLivraison: newCarrier.totalFraisLivraison,
        fraisPaiement: newCarrier.fraisPaiement,
        retenuPassage: newCarrier.retenuPassage,
        allRegions: newCarrier.allRegions,
        regions: [...newCarrier.regions]
      }
      // Update selected carrier if it's the one being edited
      if (selectedCarrier.value?.id === editingCarrier.value) {
        selectedCarrier.value = carriers.value[index]
      }
    }
  } else {
    // Add new carrier
    const newId = Math.max(...carriers.value.map(c => c.id)) + 1
    carriers.value.push({
      id: newId,
      name: newCarrier.name,
      apiId: newCarrier.apiId,
      apiKey: newCarrier.apiKey,
      apiStatus: 'disconnected',
      shipments: 0,
      delivered: 0,
      deliveryRate: 0,
      avgTime: 0,
      fraisColisLivres: newCarrier.fraisColisLivres,
      fraisColisRetour: newCarrier.fraisColisRetour,
      fraisColisEchange: newCarrier.fraisColisEchange,
      fraisColisBig: newCarrier.fraisColisBig,
      fraisColisPickup: newCarrier.fraisColisPickup,
      totalFraisLivraison: newCarrier.totalFraisLivraison,
      fraisPaiement: newCarrier.fraisPaiement,
      retenuPassage: newCarrier.retenuPassage,
      allRegions: newCarrier.allRegions,
      regions: [...newCarrier.regions]
    })
  }

  closeCarrierModal()
}

function deleteCarrier(carrierId: number) {
  const index = carriers.value.findIndex(c => c.id === carrierId)
  if (index !== -1) {
    carriers.value.splice(index, 1)
    if (selectedCarrier.value?.id === carrierId) {
      selectedCarrier.value = null
    }
  }
}

function selectCarrier(carrier: typeof carriers.value[0]) {
  selectedCarrier.value = carrier
}

// Returns functions
function syncReturns() {
  isSyncingReturns.value = true
  // Simulate API sync
  setTimeout(() => {
    isSyncingReturns.value = false
  }, 2000)
}

function getReturnStatusClass(status: string) {
  switch (status) {
    case 'En transit':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    case 'Récupéré':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    case 'Perdu':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
  }
}

// Pickup functions
function togglePickupSelection(id: number) {
  const index = selectedPickups.value.indexOf(id)
  if (index === -1) {
    selectedPickups.value.push(id)
  } else {
    selectedPickups.value.splice(index, 1)
  }
}

function selectAllPickups() {
  if (selectedPickups.value.length === pendingPickups.value.length) {
    selectedPickups.value = []
  } else {
    selectedPickups.value = pendingPickups.value.map(s => s.id)
  }
}

// Label functions
function toggleLabelSelection(id: number) {
  const index = selectedLabels.value.indexOf(id)
  if (index === -1) {
    selectedLabels.value.push(id)
  } else {
    selectedLabels.value.splice(index, 1)
  }
}

function selectAllLabels() {
  if (selectedLabels.value.length === filteredLabels.value.length && filteredLabels.value.length > 0) {
    selectedLabels.value = []
  } else {
    selectedLabels.value = filteredLabels.value.map(s => s.id)
  }
}

function openLabelPreview(shipment: any) {
  labelToPrint.value = shipment
  showPrintLabelModal.value = true
}

function printSelectedLabels() {
  if (selectedLabels.value.length > 0) {
    // If multiple labels selected, open the modal with the first one
    // In a real app, you might want to print all at once
    const firstShipment = shipments.value.find(s => selectedLabels.value.includes(s.id))
    if (firstShipment) {
      labelToPrint.value = firstShipment
      showPrintLabelModal.value = true
    }
  }
}

function printLabel() {
  if (labelToPrint.value) {
    // Mark label as printed
    const shipment = shipments.value.find(s => s.id === labelToPrint.value.id)
    if (shipment) {
      shipment.labelPrinted = true
      shipment.labelPrintedAt = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }

    // Trigger browser print
    window.print()

    // Remove from selection if it was selected
    const index = selectedLabels.value.indexOf(labelToPrint.value.id)
    if (index !== -1) {
      selectedLabels.value.splice(index, 1)
    }
  }
}

function closePrintModal() {
  showPrintLabelModal.value = false
  labelToPrint.value = null
}

function requestPickup() {
  if (selectedPickups.value.length > 0) {
    showPickupRequestModal.value = true
  }
}

function getShipmentById(id: number) {
  return shipments.value.find(s => s.id === id)
}

function confirmPickupRequest() {
  if (pickupDate.value && pickupTimeSlot.value && selectedPickups.value.length > 0) {
    // Add to scheduled pickups
    scheduledPickups.value.push({
      id: Date.now(),
      shipmentIds: [...selectedPickups.value],
      shipmentCount: selectedPickups.value.length,
      date: new Date(pickupDate.value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      timeSlot: pickupTimeSlot.value,
      address: pickupAddress.value,
      status: 'scheduled'
    })

    // Update shipment statuses to "Pickup Scheduled"
    selectedPickups.value.forEach(id => {
      const shipment = shipments.value.find(s => s.id === id)
      if (shipment) {
        shipment.status = 'Out for delivery'
        shipment.latestEvent = `${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} : Enlèvement programmé`
        shipment.events.unshift({
          status: 'En transit',
          description: `Enlèvement programmé pour le ${new Date(pickupDate.value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} (${pickupTimeSlot.value})`,
          location: pickupAddress.value,
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          completed: true
        })
      }
    })

    // Reset form
    selectedPickups.value = []
    pickupDate.value = ''
    pickupTimeSlot.value = ''
    showPickupRequestModal.value = false
  }
}

// ==================== FINANCE DATA STRUCTURES ====================

// Carriers List
const carriersList = ref([
  { id: 'yalidine', name: 'Yalidine' },
  { id: 'zr-express', name: 'ZR Express' },
  { id: 'maystro', name: 'Maystro' },
  { id: 'ecotrack', name: 'Ecotrack' }
])

// ==================== PAIEMENTS ATTENDUS (Expected Payments) ====================
const expectedPaymentsCarrierFilter = ref('all')
const expectedPaymentsStatusFilter = ref('all')

// Manifest stats
const manifestStats = reactive({
  totalCOD: 15680,
  totalDeliveryFees: 1890,
  totalOtherFees: 340,
  netToReceive: 13450,
  overdueAmount: 4250,
  overdueCount: 18
})

// Manifest by carrier with detailed shipments
const manifestByCarrier = ref([
  {
    id: 'yalidine',
    name: 'Yalidine',
    dueDate: '03 Fév 2026',
    isOverdue: true,
    totalCOD: 5840,
    totalDeliveryFees: 720,
    totalOtherFees: 120,
    totalFees: 840,
    netAmount: 5000,
    shipments: [
      { id: 1, tracking: 'YAL-2026-001234', client: 'Ahmed Ben Ali', destination: 'Tunis', deliveryDate: '20 Jan', cod: 189, deliveryFee: 12, otherFees: 0, net: 177, paymentStatus: 'pending' },
      { id: 2, tracking: 'YAL-2026-001235', client: 'Sana Bouaziz', destination: 'Ariana', deliveryDate: '20 Jan', cod: 245, deliveryFee: 12, otherFees: 5, net: 228, paymentStatus: 'pending' },
      { id: 3, tracking: 'YAL-2026-001236', client: 'Omar Chahed', destination: 'Ben Arous', deliveryDate: '21 Jan', cod: 320, deliveryFee: 12, otherFees: 0, net: 308, paymentStatus: 'overdue' },
      { id: 4, tracking: 'YAL-2026-001237', client: 'Nadia Khemiri', destination: 'Manouba', deliveryDate: '21 Jan', cod: 156, deliveryFee: 12, otherFees: 0, net: 144, paymentStatus: 'pending' },
      { id: 5, tracking: 'YAL-2026-001238', client: 'Karim Hamdi', destination: 'Sfax', deliveryDate: '22 Jan', cod: 478, deliveryFee: 15, otherFees: 8, net: 455, paymentStatus: 'overdue' }
    ]
  },
  {
    id: 'zr-express',
    name: 'ZR Express',
    dueDate: '05 Fév 2026',
    isOverdue: false,
    totalCOD: 4320,
    totalDeliveryFees: 540,
    totalOtherFees: 90,
    totalFees: 630,
    netAmount: 3690,
    shipments: [
      { id: 6, tracking: 'ZR-2026-005678', client: 'Fatma Trabelsi', destination: 'Sousse', deliveryDate: '22 Jan', cod: 145, deliveryFee: 12, otherFees: 0, net: 133, paymentStatus: 'pending' },
      { id: 7, tracking: 'ZR-2026-005679', client: 'Leila Mrad', destination: 'Monastir', deliveryDate: '23 Jan', cod: 267, deliveryFee: 12, otherFees: 5, net: 250, paymentStatus: 'pending' },
      { id: 8, tracking: 'ZR-2026-005680', client: 'Walid Ben Salah', destination: 'Mahdia', deliveryDate: '23 Jan', cod: 198, deliveryFee: 12, otherFees: 0, net: 186, paymentStatus: 'pending' }
    ]
  },
  {
    id: 'maystro',
    name: 'Maystro',
    dueDate: '01 Fév 2026',
    isOverdue: true,
    totalCOD: 3420,
    totalDeliveryFees: 390,
    totalOtherFees: 85,
    totalFees: 475,
    netAmount: 2945,
    shipments: [
      { id: 9, tracking: 'MAY-2026-009012', client: 'Mohamed Sassi', destination: 'Nabeul', deliveryDate: '19 Jan', cod: 210, deliveryFee: 10, otherFees: 0, net: 200, paymentStatus: 'overdue' },
      { id: 10, tracking: 'MAY-2026-009013', client: 'Amira Bouzid', destination: 'Hammamet', deliveryDate: '19 Jan', cod: 178, deliveryFee: 10, otherFees: 5, net: 163, paymentStatus: 'overdue' },
      { id: 11, tracking: 'MAY-2026-009014', client: 'Sofiane Triki', destination: 'Bizerte', deliveryDate: '20 Jan', cod: 95, deliveryFee: 12, otherFees: 0, net: 83, paymentStatus: 'pending' }
    ]
  }
])

// Filtered manifest by carrier
const filteredManifestByCarrier = computed(() => {
  let result = manifestByCarrier.value
  if (expectedPaymentsCarrierFilter.value !== 'all') {
    result = result.filter(c => c.id === expectedPaymentsCarrierFilter.value)
  }
  if (expectedPaymentsStatusFilter.value === 'pending') {
    result = result.map(c => ({
      ...c,
      shipments: c.shipments.filter(s => s.paymentStatus !== 'paid')
    })).filter(c => c.shipments.length > 0)
  } else if (expectedPaymentsStatusFilter.value === 'overdue') {
    result = result.filter(c => c.isOverdue)
  }
  return result
})

// ==================== PAIEMENTS REÇUS (Received Payments) ====================
const receivedPaymentsMonth = ref('2026-01')
const receivedPaymentsCarrierFilter = ref('all')

const receivedPaymentsStats = reactive({
  totalReceived: 8500,
  totalCOD: 9850,
  totalFees: 1350,
  paymentsCount: 4,
  shipmentsCount: 54
})

// Received payments with detailed shipments
const receivedPaymentsData = ref([
  {
    id: 1,
    carrier: 'Yalidine',
    reference: 'PAY-YAL-2026-0012',
    paymentDate: '25 Jan 2026',
    totalCOD: 3450,
    totalDeliveryFees: 288,
    totalOtherFees: 62,
    codFees: 69,
    returnFees: 24,
    tva: 84,
    returnCount: 2,
    codFeePercent: 2,
    totalFees: 527,
    netReceived: 2923,
    expanded: false,
    shipments: [
      { id: 1, tracking: 'YAL-2026-000890', client: 'Hichem Mansour', destination: 'Tunis', deliveryDate: '18 Jan', cod: 189, deliveryFee: 12, otherFees: 0, net: 177 },
      { id: 2, tracking: 'YAL-2026-000891', client: 'Rim Ayari', destination: 'Ariana', deliveryDate: '18 Jan', cod: 256, deliveryFee: 12, otherFees: 5, net: 239 },
      { id: 3, tracking: 'YAL-2026-000892', client: 'Youssef Gharbi', destination: 'Ben Arous', deliveryDate: '19 Jan', cod: 178, deliveryFee: 12, otherFees: 0, net: 166 },
      { id: 4, tracking: 'YAL-2026-000893', client: 'Ines Lahmar', destination: 'Manouba', deliveryDate: '19 Jan', cod: 312, deliveryFee: 12, otherFees: 6, net: 294 }
    ]
  },
  {
    id: 2,
    carrier: 'ZR Express',
    reference: 'PAY-ZR-2026-0045',
    paymentDate: '23 Jan 2026',
    totalCOD: 2680,
    totalDeliveryFees: 216,
    totalOtherFees: 45,
    codFees: 54,
    returnFees: 12,
    tva: 62,
    returnCount: 1,
    codFeePercent: 2,
    totalFees: 389,
    netReceived: 2291,
    expanded: false,
    shipments: [
      { id: 5, tracking: 'ZR-2026-004521', client: 'Anis Ferchichi', destination: 'Sousse', deliveryDate: '17 Jan', cod: 145, deliveryFee: 12, otherFees: 0, net: 133 },
      { id: 6, tracking: 'ZR-2026-004522', client: 'Mounir Ghanmi', destination: 'Monastir', deliveryDate: '17 Jan', cod: 234, deliveryFee: 12, otherFees: 5, net: 217 },
      { id: 7, tracking: 'ZR-2026-004523', client: 'Wafa Jlassi', destination: 'Mahdia', deliveryDate: '18 Jan', cod: 189, deliveryFee: 12, otherFees: 0, net: 177 }
    ]
  },
  {
    id: 3,
    carrier: 'Maystro',
    reference: 'PAY-MAY-2026-0078',
    paymentDate: '20 Jan 2026',
    totalCOD: 1920,
    totalDeliveryFees: 150,
    totalOtherFees: 30,
    codFees: 38,
    returnFees: 0,
    tva: 41,
    returnCount: 0,
    codFeePercent: 2,
    totalFees: 259,
    netReceived: 1661,
    expanded: false,
    shipments: [
      { id: 8, tracking: 'MAY-2026-007845', client: 'Nabil Karray', destination: 'Nabeul', deliveryDate: '15 Jan', cod: 210, deliveryFee: 10, otherFees: 0, net: 200 },
      { id: 9, tracking: 'MAY-2026-007846', client: 'Salma Zouari', destination: 'Hammamet', deliveryDate: '15 Jan', cod: 156, deliveryFee: 10, otherFees: 5, net: 141 }
    ]
  }
])

// Filtered received payments
const filteredReceivedPayments = computed(() => {
  if (receivedPaymentsCarrierFilter.value === 'all') return receivedPaymentsData.value
  return receivedPaymentsData.value.filter(p => p.carrier.toLowerCase().includes(receivedPaymentsCarrierFilter.value))
})

// ==================== ÉCARTS DE PAIEMENT (Payment Discrepancies) ====================
const discrepancyFilter = ref('all')
const discrepancyCarrierFilter = ref('all')

const discrepancyStats = reactive({
  ourTotal: 9850,
  theirTotal: 8500,
  totalDifference: 350,
  differencePercent: 3.6,
  totalPending: 285,
  pendingCount: 8,
  unexpectedFees: 120,
  unexpectedFeesCount: 5,
  recovered: 65
})

// Reconciliation by carrier with per-shipment comparison
const reconciliationByCarrier = ref([
  {
    id: 'yalidine',
    name: 'Yalidine',
    totalShipments: 24,
    shipmentsWithDiscrepancy: 5,
    ourCalculation: 3650,
    theirPayment: 3450,
    totalDifference: 200,
    fees: {
      deliveryExpected: 288,
      deliveryActual: 312,
      codExpected: 73,
      codActual: 69,
      returnExpected: 0,
      returnActual: 24,
      otherExpected: 50,
      otherActual: 72
    },
    discrepancies: [
      { id: 1, tracking: 'YAL-2026-000890', client: 'Hichem Mansour', codCollected: 189, ourNet: 177, theirNet: 165, difference: 12, carrierReason: 'Frais retour appliqué', status: 'pending' },
      { id: 2, tracking: 'YAL-2026-000891', client: 'Rim Ayari', codCollected: 256, ourNet: 239, ourNetActual: 239, theirNet: 239, difference: 0, carrierReason: '', status: '' },
      { id: 3, tracking: 'YAL-2026-000892', client: 'Youssef Gharbi', codCollected: 178, ourNet: 166, theirNet: 154, difference: 12, carrierReason: 'Frais retour appliqué', status: 'disputed' },
      { id: 4, tracking: 'YAL-2026-000893', client: 'Ines Lahmar', codCollected: 312, ourNet: 294, theirNet: 280, difference: 14, carrierReason: 'Supplément zone éloignée', status: 'pending' }
    ]
  },
  {
    id: 'zr-express',
    name: 'ZR Express',
    totalShipments: 18,
    shipmentsWithDiscrepancy: 2,
    ourCalculation: 2380,
    theirPayment: 2291,
    totalDifference: 89,
    fees: {
      deliveryExpected: 216,
      deliveryActual: 228,
      codExpected: 48,
      codActual: 54,
      returnExpected: 0,
      returnActual: 12,
      otherExpected: 30,
      otherActual: 45
    },
    discrepancies: [
      { id: 5, tracking: 'ZR-2026-004521', client: 'Anis Ferchichi', codCollected: 145, ourNet: 133, theirNet: 125, difference: 8, carrierReason: 'Frais COD ajusté', status: 'pending' },
      { id: 6, tracking: 'ZR-2026-004522', client: 'Mounir Ghanmi', codCollected: 234, ourNet: 217, theirNet: 217, difference: 0, carrierReason: '', status: '' },
      { id: 7, tracking: 'ZR-2026-004523', client: 'Wafa Jlassi', codCollected: 189, ourNet: 177, theirNet: 168, difference: 9, carrierReason: 'Taxe supplémentaire', status: 'disputed' }
    ]
  },
  {
    id: 'maystro',
    name: 'Maystro',
    totalShipments: 12,
    shipmentsWithDiscrepancy: 1,
    ourCalculation: 1720,
    theirPayment: 1661,
    totalDifference: 59,
    fees: {
      deliveryExpected: 150,
      deliveryActual: 150,
      codExpected: 34,
      codActual: 38,
      returnExpected: 0,
      returnActual: 0,
      otherExpected: 25,
      otherActual: 46
    },
    discrepancies: [
      { id: 8, tracking: 'MAY-2026-007845', client: 'Nabil Karray', codCollected: 210, ourNet: 200, theirNet: 200, difference: 0, carrierReason: '', status: '' },
      { id: 9, tracking: 'MAY-2026-007846', client: 'Salma Zouari', codCollected: 156, ourNet: 141, theirNet: 132, difference: 9, carrierReason: 'Frais emballage', status: 'resolved' }
    ]
  }
])

// Revenue
const revenuePeriod = ref('month')

const revenueStats = reactive({
  grossRevenue: 24850,
  netRevenue: 18620,
  marginPercent: 75,
  shippingCosts: 4230,
  avgOrderValue: 125,
  grossGrowth: 12
})

const revenueByCategory = ref([
  { name: 'Électronique', amount: 9450, percent: 38, color: 'bg-blue-500' },
  { name: 'Mode & Accessoires', amount: 6240, percent: 25, color: 'bg-purple-500' },
  { name: 'Beauté & Santé', amount: 4970, percent: 20, color: 'bg-pink-500' },
  { name: 'Maison & Jardin', amount: 2490, percent: 10, color: 'bg-green-500' },
  { name: 'Autres', amount: 1700, percent: 7, color: 'bg-gray-500' }
])

const revenueByRegion = ref([
  { name: 'Grand Tunis', orders: 145, amount: 12400, percent: 50 },
  { name: 'Sfax', orders: 52, amount: 4850, percent: 20 },
  { name: 'Sousse', orders: 38, amount: 3720, percent: 15 },
  { name: 'Nabeul', orders: 25, amount: 2380, percent: 10 },
  { name: 'Autres régions', orders: 18, amount: 1500, percent: 5 }
])

const revenueChartData = ref([
  { label: 'Lun', gross: 3200, net: 2400 },
  { label: 'Mar', gross: 2800, net: 2100 },
  { label: 'Mer', gross: 4100, net: 3075 },
  { label: 'Jeu', gross: 3500, net: 2625 },
  { label: 'Ven', gross: 4800, net: 3600 },
  { label: 'Sam', gross: 3950, net: 2960 },
  { label: 'Dim', gross: 2500, net: 1860 }
])

// Return Losses
const returnLossesMonth = ref('2026-01')

const returnLossesStats = reactive({
  totalLoss: 2340,
  returnedCount: 18,
  lostCount: 3,
  shippingLoss: 456
})

const returnLossesByReason = ref([
  { name: 'Client absent', count: 8, amount: 920, percent: 39, icon: markRaw(User), iconColor: 'text-yellow-600' },
  { name: 'Refusé par client', count: 5, amount: 680, percent: 29, icon: markRaw(XCircle), iconColor: 'text-red-600' },
  { name: 'Adresse incorrecte', count: 3, amount: 420, percent: 18, icon: markRaw(MapPin), iconColor: 'text-orange-600' },
  { name: 'Colis perdu', count: 2, amount: 320, percent: 14, icon: markRaw(PackageX), iconColor: 'text-gray-600' }
])

const returnLossesByCarrier = ref([
  { name: 'Aramex', count: 7, amount: 890, returnRate: 8.5 },
  { name: 'Rapid Post', count: 6, amount: 720, returnRate: 12.3 },
  { name: 'Express Delivery', count: 3, amount: 450, returnRate: 4.2 },
  { name: 'Tunisia Express', count: 2, amount: 280, returnRate: 5.8 }
])

const returnLossesDetails = ref([
  { id: 1, reference: 'YAL-2026-001111', customer: 'Ahmed Hamdi', carrier: 'Aramex', reason: 'Refusé', value: 145, shippingFee: 12, totalLoss: 157 },
  { id: 2, reference: 'ZR-2026-002222', customer: 'Salma Trabelsi', carrier: 'Rapid Post', reason: 'Client absent', value: 89, shippingFee: 10, totalLoss: 99 },
  { id: 3, reference: 'MAY-2026-003333', customer: 'Karim Bouaziz', carrier: 'Express Delivery', reason: 'Perdu', value: 210, shippingFee: 15, totalLoss: 225 },
  { id: 4, reference: 'ECO-2026-004444', customer: 'Leila Mrad', carrier: 'Tunisia Express', reason: 'Refusé', value: 178, shippingFee: 12, totalLoss: 190 },
  { id: 5, reference: 'YAL-2026-005555', customer: 'Omar Chahed', carrier: 'Aramex', reason: 'Adresse incorrecte', value: 95, shippingFee: 10, totalLoss: 105 }
])

// Invoices
const invoicesTab = ref<'received' | 'sent'>('received')
const invoiceSearch = ref('')
const invoiceStatusFilter = ref('all')

const invoicesStats = reactive({
  totalInvoices: 24,
  pendingAmount: 3450,
  paidAmount: 8500,
  overdueCount: 2
})

const invoices = ref([
  { id: 1, number: 'INV-2026-0089', party: 'Aramex Tunisia', date: '25 Jan 2026', dueDate: '08 Fév 2026', amount: 1850, status: 'pending', type: 'received' },
  { id: 2, number: 'INV-2026-0088', party: 'Rapid Post', date: '23 Jan 2026', dueDate: '06 Fév 2026', amount: 1350, status: 'pending', type: 'received' },
  { id: 3, number: 'INV-2026-0087', party: 'Express Delivery', date: '20 Jan 2026', dueDate: '03 Fév 2026', amount: 2100, status: 'paid', type: 'received' },
  { id: 4, number: 'INV-2026-0086', party: 'Tunisia Express', date: '18 Jan 2026', dueDate: '01 Fév 2026', amount: 980, status: 'overdue', type: 'received' },
  { id: 5, number: 'FAC-2026-0045', party: 'Client Wholesale A', date: '24 Jan 2026', dueDate: '07 Fév 2026', amount: 4500, status: 'pending', type: 'sent' },
  { id: 6, number: 'FAC-2026-0044', party: 'Client Wholesale B', date: '22 Jan 2026', dueDate: '05 Fév 2026', amount: 3200, status: 'paid', type: 'sent' }
])

// Filtered Invoices
const filteredInvoices = computed(() => {
  let result = invoices.value.filter(i => i.type === invoicesTab.value)
  if (invoiceStatusFilter.value !== 'all') {
    result = result.filter(i => i.status === invoiceStatusFilter.value)
  }
  if (invoiceSearch.value) {
    const search = invoiceSearch.value.toLowerCase()
    result = result.filter(i =>
      i.number.toLowerCase().includes(search) ||
      i.party.toLowerCase().includes(search)
    )
  }
  return result
})

// Exports
const exportConfig = reactive({
  dataType: 'all',
  period: 'thisMonth',
  startDate: '',
  endDate: '',
  format: 'excel',
  carrier: 'all'
})

const recentExports = ref([
  { id: 1, name: 'Finance_Janvier_2026.xlsx', format: 'excel', date: '25 Jan 2026', size: '2.4 MB', status: 'ready' },
  { id: 2, name: 'Paiements_Semaine_04.csv', format: 'csv', date: '24 Jan 2026', size: '856 KB', status: 'ready' },
  { id: 3, name: 'Rapport_Q4_2025.pdf', format: 'pdf', date: '22 Jan 2026', size: '1.8 MB', status: 'ready' },
  { id: 4, name: 'Revenus_Janvier.xlsx', format: 'excel', date: '20 Jan 2026', size: '1.2 MB', status: 'ready' }
])

// ==================== END FINANCE DATA STRUCTURES ====================
</script>

<style scoped>
/* Slide right transition for side drawer */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
}

.slide-right-enter-from > div:last-child,
.slide-right-leave-to > div:last-child {
  transform: translateX(100%);
}

.slide-right-enter-to > div:last-child,
.slide-right-leave-from > div:last-child {
  transform: translateX(0);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Print styles for label */
@media print {
  body * {
    visibility: hidden;
  }

  #printable-label,
  #printable-label * {
    visibility: visible;
  }

  #printable-label {
    position: absolute;
    left: 0;
    top: 0;
    width: 100mm;
    padding: 5mm;
    margin: 0;
    border: 1px solid #000 !important;
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>

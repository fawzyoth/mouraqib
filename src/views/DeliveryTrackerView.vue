<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-950">
    <!-- Mobile Header -->
    <div class="fixed top-0 left-0 right-0 z-40 lg:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
      <button @click="sidebarOpen = true" class="p-2 hover:bg-gray-800 rounded-lg">
        <Menu class="w-6 h-6" />
      </button>
      <span class="text-base font-semibold">{{ getMainSectionLabel(mainSection) }}</span>
      <div class="flex items-center gap-2">
        <button @click="openGlobalSearch" class="p-2 hover:bg-gray-800 rounded-lg">
          <Search class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Full-Screen Main Menu Overlay -->
    <div
      :class="[
        'fixed inset-0 z-50 lg:hidden text-white flex flex-col transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      style="background-color: #222628;"
    >
      <!-- Mobile Menu Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-800">
        <img src="@/logo/Group 14.svg" alt="Logo" class="h-8 w-auto" />
        <button @click="sidebarOpen = false" class="p-2 hover:bg-gray-700 rounded-lg">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile Menu Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-3">
          <li v-for="item in filteredMainNavigation" :key="item.id">
            <button
              @click="selectMainSection(item.id); sidebarOpen = false"
              :class="[
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
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

      <!-- Mobile Menu User Section -->
      <div class="border-t border-gray-800 p-4">
        <div class="flex items-center space-x-3 px-3 py-2">
          <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span class="text-base font-semibold text-white">{{ authStore.user?.name?.charAt(0) || organization.name.charAt(0) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-white truncate">{{ authStore.user?.name || organization.name }}</p>
            <p class="text-sm text-gray-400 truncate">{{ authStore.user?.email || organization.email }}</p>
          </div>
          <button
            @click="handleLogout"
            class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile SubMenu Panel (slides from top) -->
    <div
      :class="[
        'fixed left-0 right-0 z-30 lg:hidden bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden',
        subMenuOpen ? 'translate-y-0' : '-translate-y-full'
      ]"
      style="top: 56px;"
    >
      <nav class="py-2 max-h-64 overflow-y-auto">
        <ul class="space-y-0.5">
          <li v-for="item in currentSubNavigation" :key="item.id">
            <button
              @click="activeSection = item.id; subMenuOpen = false; showSearchResultsPage = false"
              :class="[
                'w-full flex items-center space-x-3 py-2.5 px-4 text-sm font-medium transition-colors',
                activeSection === item.id
                  ? 'bg-gray-100 text-orange-500 dark:bg-gray-800 dark:text-orange-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span>{{ item.label }}</span>
              <span v-if="item.badge" class="ml-auto px-2 py-0.5 text-xs rounded-full" :class="item.badgeClass">{{ item.badge }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Sidebar 1 - Main Sections (Desktop only) -->
    <aside class="hidden lg:flex w-56 text-white flex-col" style="background-color: #222628;">
      <!-- Logo -->
      <div class="p-4">
        <img src="@/logo/Group 14.svg" alt="Logo" class="h-8 w-auto" />
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 py-2 overflow-y-auto">
        <ul class="space-y-1 px-3">
          <li v-for="item in filteredMainNavigation" :key="item.id">
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

    <!-- Sidebar 2 - Sub-sections (Desktop only) -->
    <aside class="hidden lg:flex w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col">
      <!-- Global Search Button -->
      <div class="p-3 border-b border-gray-200 dark:border-gray-800">
        <button
          @click="openGlobalSearch"
          class="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:border-[#4959b4] hover:text-[#4959b4] transition-colors"
        >
          <Search class="w-4 h-4" />
          <span>Rechercher un colis...</span>
          <kbd class="ml-auto hidden sm:inline-flex px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">⌘K</kbd>
        </button>
      </div>
      <!-- Section Title -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ getMainSectionLabel(mainSection) }}</h2>
      </div>

      <!-- Sub Navigation -->
      <nav class="flex-1 py-3 overflow-y-auto">
        <ul class="space-y-0.5">
          <li v-for="item in currentSubNavigation" :key="item.id">
            <button
              @click="activeSection = item.id; showSearchResultsPage = false"
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
    <div class="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
      <!-- Search Results Page (Full Screen) -->
      <template v-if="showSearchResultsPage">
        <!-- Header -->
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="closeSearchResultsPage" class="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ArrowLeft class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Résultats de recherche</h1>
                <p class="text-sm text-gray-500 mt-0.5">{{ fullSearchResults.length }} résultat{{ fullSearchResults.length > 1 ? 's' : '' }} pour "{{ searchResultsQuery }}"</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="closeSearchResultsPage" class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
                <X class="w-4 h-4" />
                <span class="hidden sm:inline">Fermer</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Search Results Content -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div class="max-w-6xl mx-auto">
            <!-- Search Input & Filters -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
              <div class="flex flex-col sm:flex-row gap-4">
                <!-- Search Input -->
                <div class="flex-1 relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="searchResultsQuery"
                    type="text"
                    placeholder="Rechercher un colis, client, numéro de suivi..."
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#4959b4] focus:border-transparent"
                  />
                </div>
                <!-- Status Filter -->
                <select
                  v-model="searchResultsFilter"
                  class="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#4959b4]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in-transit">En livraison</option>
                  <option value="delivered">Livrés</option>
                  <option value="returned">Retournés</option>
                </select>
                <!-- Sort -->
                <select
                  v-model="searchResultsSort"
                  class="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#4959b4]"
                >
                  <option value="date">Date (récent)</option>
                  <option value="tracking">Numéro de suivi</option>
                  <option value="recipient">Destinataire</option>
                  <option value="amount">Montant</option>
                </select>
              </div>
            </div>

            <!-- Results Grid -->
            <div v-if="fullSearchResults.length > 0" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Colis</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinataire</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Transporteur</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                      <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                      <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr
                      v-for="result in fullSearchResults"
                      :key="result.id"
                      class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      @click="selectedShipment = result; showShipmentDetail = true; closeSearchResultsPage()"
                    >
                      <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Package class="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p class="text-sm font-semibold font-mono text-gray-900 dark:text-white">{{ result.trackingNumber }}</p>
                            <p class="text-xs text-gray-500">{{ new Date(result.createdAt).toLocaleDateString('fr-FR') }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-4">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ result.recipient }}</p>
                        <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ result.recipientAddress }}</p>
                      </td>
                      <td class="px-4 py-4 hidden md:table-cell">
                        <p class="text-sm text-gray-700 dark:text-gray-300">{{ result.carrier }}</p>
                      </td>
                      <td class="px-4 py-4">
                        <span :class="[
                          'px-2 py-1 text-xs rounded-full font-medium',
                          result.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          result.status === 'Out for delivery' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          result.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          result.status === 'Returned' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600'
                        ]">
                          {{ result.status === 'Delivered' ? 'Livré' : result.status === 'Out for delivery' ? 'En livraison' : result.status === 'Pending' ? 'En attente' : result.status === 'Returned' ? 'Retourné' : result.status }}
                        </span>
                      </td>
                      <td class="px-4 py-4 text-right">
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ result.amount }} TND</p>
                      </td>
                      <td class="px-4 py-4 text-center">
                        <button
                          @click.stop="selectedShipment = result; showShipmentDetail = true; closeSearchResultsPage()"
                          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye class="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- No Results -->
            <div v-else class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <SearchX class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun résultat trouvé</h3>
              <p class="text-gray-500 mb-4">Aucun colis ne correspond à "{{ searchResultsQuery }}"</p>
              <p class="text-sm text-gray-400">Essayez avec un numéro de suivi, nom de client, ou numéro de téléphone</p>
            </div>
          </div>
        </main>
      </template>

      <!-- Shipments Section -->
      <template v-else-if="activeSection === 'all-shipments'">
        <!-- Header -->
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Colis</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez tous vos colis et expéditions</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 sm:space-x-3">
              <button class="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
                <Upload class="w-4 h-4" />
                <span>Exporter</span>
              </button>
              <button
                @click="openBulkImport"
                class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
              >
                <Download class="w-4 h-4" />
                <span class="hidden sm:inline">Importer</span>
              </button>
              <button
                @click="showAddShipmentModal = true"
                class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <Plus class="w-4 h-4" />
                <span class="hidden sm:inline">Nouveau colis</span>
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
            <div class="table-responsive">
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
                  <td class="px-4 py-3" data-label="N° Suivi">
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Exemple</span>
                      <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Transporteur">{{ shipment.carrier }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Service">{{ shipment.service || '-' }}</td>
                  <td class="px-4 py-3" data-label="Statut">
                    <span :class="['inline-flex items-center space-x-1 text-sm font-medium', getStatusTextClass(shipment.status)]">
                      <span :class="['w-2 h-2 rounded-full', getStatusDotClass(shipment.status)]"></span>
                      <span>{{ getStatusLabel(shipment.status) }}</span>
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Événement">{{ shipment.latestEvent }}</td>
                  <td class="px-4 py-3" data-label="Origine">
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">{{ shipment.originFlag }}</span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ shipment.origin }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>

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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Tous les Clients</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez votre base de clients</p>
              </div>
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
                        {{ client.status === 'active' ? 'Actif' : client.status === 'vip' ? 'VIP' : client.status === 'blocked' ? 'Bloqué' : 'Inactif' }}
                      </span>
                    </td>
                    <td class="px-4 py-4" data-label="Actions">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ajouter un Client</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Créer un nouveau profil client</p>
              </div>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Star class="w-6 h-6 mr-2 text-purple-600 fill-purple-600" />
                  Clients VIP
                </h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Vos meilleurs clients avec privilèges spéciaux</p>
              </div>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Ban class="w-6 h-6 mr-2 text-red-600" />
                  Clients Bloqués
                </h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Clients avec des problèmes récurrents</p>
              </div>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <BarChart2 class="w-6 h-6 mr-2 text-primary-blue" />
                  Statistiques Clients
                </h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analyse détaillée de votre base clients</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-2">
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
            <div class="table-responsive">
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
                    <td class="px-4 py-4" data-label="Total Dépensé">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Vue d'ensemble</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{{ new Date().toLocaleDateString('fr-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
              </div>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Tâches du jour</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{{ new Date().toLocaleDateString('fr-TN', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Colis en retard</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{{ filteredDelayedShipmentsByDate.length }} colis nécessitent votre attention</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Alertes retours</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Intervenez avant qu'il ne soit trop tard</p>
              </div>
            </div>
            <button class="flex px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors items-center space-x-0 sm:space-x-2">
              <MessageCircle class="w-4 h-4" />
              <span class="hidden sm:inline">WhatsApp groupé</span>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Aperçu financier</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Suivi de votre trésorerie et paiements</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Journal d'activité</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Historique de toutes les actions et événements</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ajouter un colis</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Créer une nouvelle expédition</p>
              </div>
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

                <!-- Search input -->
                <div class="relative mb-4">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    v-model="carrierSearchQuery"
                    type="text"
                    placeholder="Rechercher un transporteur..."
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <span v-if="carrierSearchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {{ filteredCarriers.length }} résultats
                  </span>
                </div>

                <!-- Carrier grid with scroll -->
                <div class="max-h-80 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 p-2">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      v-for="carrier in filteredCarriers"
                      :key="carrier.id"
                      type="button"
                      @click="selectShipmentCarrier(carrier)"
                      :class="[
                        'p-3 rounded-xl border-2 text-center transition-all hover:shadow-md',
                        newShipment.carrier === carrier.name
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      ]"
                    >
                      <div class="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center font-bold text-sm" :style="{ backgroundColor: carrier.color + '20', color: carrier.color }">
                        {{ getCarrierInitials(carrier.name) }}
                      </div>
                      <span class="text-xs font-medium block truncate" :class="newShipment.carrier === carrier.name ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'">{{ carrier.name }}</span>
                      <p class="text-[10px] text-gray-400 mt-0.5">{{ carrier.deliveryTime }}</p>
                    </button>
                  </div>
                  <p v-if="filteredCarriers.length === 0" class="text-center text-sm text-gray-500 py-8">Aucun transporteur trouvé</p>
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
              <button @click="addShipment" :disabled="!newShipment.carrier" :class="['px-6 py-2.5 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2', !newShipment.carrier && 'opacity-50 cursor-not-allowed']">
                <Plus class="w-4 h-4" />
                Créer le colis
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Notifications Section (Settings) -->
      <template v-if="activeSection === 'notifications'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Flows de notifications</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Automatisez les notifications pour chaque statut de colis</p>
              </div>
            </div>
            <button class="flex btn-primary px-3 sm:px-4">
              <Plus class="w-4 h-4" />
              <span class="hidden sm:inline ml-2">Créer un flow</span>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">KPIs Globaux</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Vue d'ensemble de vos indicateurs clés de performance</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
            <div class="table-responsive">
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
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Indicateur">{{ kpi.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Cette période">{{ kpi.current }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Précédente">{{ kpi.previous }}</td>
                  <td class="px-4 py-3" data-label="Variation">
                    <span :class="kpi.change > 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                      {{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </main>
      </template>

      <!-- Analytics Section - Performance Livraison -->
      <template v-if="activeSection === 'delivery-performance'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Performance Livraison</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analysez les performances de livraison par transporteur et région</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
            <div class="table-responsive">
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
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Transporteur">{{ carrier.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Colis">{{ carrier.shipments }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Livrés">{{ carrier.delivered }}</td>
                  <td class="px-4 py-3" data-label="Taux">
                    <div class="flex items-center space-x-2">
                      <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-green-500 rounded-full" :style="{ width: carrier.deliveryRate + '%' }"></div>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ carrier.deliveryRate }}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Délai">{{ carrier.avgTime }} jours</td>
                  <td class="px-4 py-3" data-label="Score">
                    <span :class="carrier.deliveryRate >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : carrier.deliveryRate >= 80 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ carrier.deliveryRate >= 90 ? 'Excellent' : carrier.deliveryRate >= 80 ? 'Bon' : 'À améliorer' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Intelligence Retours</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analysez les motifs de retour et identifiez les patterns</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Zones à Risque</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Identifiez les zones géographiques problématiques</p>
              </div>
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
            <div class="table-responsive">
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
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Zone">{{ zone.name }}</td>
                  <td class="px-4 py-3" data-label="Risque">
                    <span :class="zone.risk === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : zone.risk === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ zone.risk === 'high' ? 'Haut' : zone.risk === 'medium' ? 'Moyen' : 'Faible' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Taux Échec">{{ zone.failureRate }}%</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Retours">{{ zone.returnRate }}%</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Colis Affectés">{{ zone.affectedShipments }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Raison Principale">{{ zone.mainReason }}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </main>
      </template>

      <!-- Analytics Section - Détection d'Anomalies -->
      <template v-if="activeSection === 'anomaly-detection'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Détection d'Anomalies</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Surveillance automatique des patterns inhabituels</p>
              </div>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Tendances</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analysez les tendances et prévisions</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Rapports</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Générez et téléchargez des rapports détaillés</p>
              </div>
            </div>
            <button class="flex btn-primary btn-primary-sm px-3 sm:px-4">
              <Plus class="w-4 h-4 sm:mr-2" />
              <span class="hidden sm:inline">Nouveau Rapport</span>
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
            <div class="table-responsive">
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
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Nom">{{ report.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Type">{{ report.type }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Période">{{ report.period }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Généré le">{{ report.generatedAt }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Taille">{{ report.size }}</td>
                  <td class="px-4 py-3" data-label="Actions">
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
          </div>
        </main>
      </template>

      <!-- Schedule Pickup Section -->
      <template v-if="activeSection === 'schedule-pickup'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Planifier un enlèvement</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Sélectionnez les colis à faire enlever par le transporteur</p>
              </div>
            </div>
            <button
              @click="requestPickup"
              :disabled="selectedPickups.length === 0"
              class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <Truck class="w-4 h-4" />
              <span class="hidden sm:inline">Planifier ({{ selectedPickups.length }})</span>
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
                  <p class="text-sm text-gray-500">En attente</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CalendarClock class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ scheduledPickups.length }}</p>
                  <p class="text-sm text-gray-500">Programmés</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ completedPickupsCount }}</p>
                  <p class="text-sm text-gray-500">Terminés ce mois</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Pickups List -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-white">Colis en attente d'enlèvement</h3>
                <button @click="selectAllPickups" class="text-sm text-[#4959b4] hover:underline">
                  {{ selectedPickups.length === pendingPickups.length && pendingPickups.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner' }}
                </button>
              </div>
            </div>

            <div v-if="pendingPickups.length === 0" class="p-8 text-center">
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package class="w-8 h-8 text-gray-400" />
              </div>
              <p class="text-gray-500 dark:text-gray-400">Aucun colis en attente d'enlèvement</p>
              <p class="text-sm text-gray-400 mt-1">Les nouveaux colis apparaîtront ici</p>
            </div>

            <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
              <div v-for="shipment in pendingPickups" :key="shipment.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="flex items-start space-x-4">
                  <input type="checkbox" :checked="selectedPickups.includes(shipment.id)" @change="togglePickupSelection(shipment.id)" class="mt-1 w-5 h-5 rounded" />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <span class="font-mono font-semibold text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                        <span class="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded font-medium">En attente</span>
                      </div>
                      <span class="text-sm text-gray-500">{{ shipment.carrier }}</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p class="text-gray-500">Destinataire</p>
                        <p class="text-gray-900 dark:text-white font-medium">{{ shipment.recipient }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Téléphone</p>
                        <p class="text-gray-900 dark:text-white">{{ shipment.recipientPhone }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Adresse</p>
                        <p class="text-gray-900 dark:text-white">{{ shipment.recipientAddress }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Montant</p>
                        <p class="text-gray-900 dark:text-white font-medium">{{ shipment.amount }} TND</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Pickup Requests Section -->
      <template v-if="activeSection === 'pickup-requests'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Demandes d'enlèvement</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Suivez vos demandes d'enlèvement en cours</p>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <PackageOpen class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ pickupRequests.length }}</p>
                  <p class="text-sm text-gray-500">Total demandes</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ pickupRequests.filter(p => p.status === 'pending').length }}</p>
                  <p class="text-sm text-gray-500">En attente confirmation</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ pickupRequests.filter(p => p.status === 'confirmed').length }}</p>
                  <p class="text-sm text-gray-500">Confirmées aujourd'hui</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pickup Requests Table -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-white">Demandes d'enlèvement</h3>
                <select v-model="pickupRequestFilter" class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>

            <div v-if="filteredPickupRequests.length === 0" class="p-8 text-center">
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageOpen class="w-8 h-8 text-gray-400" />
              </div>
              <p class="text-gray-500 dark:text-gray-400">Aucune demande d'enlèvement</p>
              <p class="text-sm text-gray-400 mt-1">Planifiez un enlèvement pour commencer</p>
            </div>

            <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
              <div v-for="request in filteredPickupRequests" :key="request.id" @click="viewPickupDetail(request)" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="p-2 rounded-lg" :class="request.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' : request.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'">
                      <Truck :class="['w-5 h-5', request.status === 'confirmed' ? 'text-green-600' : request.status === 'pending' ? 'text-yellow-600' : 'text-red-600']" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="font-semibold text-gray-900 dark:text-white">{{ request.id }}</p>
                        <span :class="[
                          'px-2 py-0.5 text-xs rounded-full font-medium',
                          request.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          request.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        ]">
                          {{ request.status === 'confirmed' ? 'Confirmée' : request.status === 'pending' ? 'En attente' : 'Annulée' }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-500">{{ request.date }} • {{ request.timeSlot }} • {{ request.shipmentCount }} colis</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click.stop="viewPickupDetail(request)" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <Eye class="w-4 h-4" />
                    </button>
                    <button v-if="request.status === 'pending'" @click.stop class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Pickup History Section -->
      <template v-if="activeSection === 'pickup-history'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Historique des enlèvements</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Consultez l'historique de tous vos enlèvements</p>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-[#4959b4]/10 rounded-lg">
                  <History class="w-5 h-5 text-[#4959b4]" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ pickupHistory.length }}</p>
                  <p class="text-sm text-gray-500">Total enlèvements</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ pickupHistory.filter(p => p.status === 'completed').length }}</p>
                  <p class="text-sm text-gray-500">Ce mois-ci</p>
                </div>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">98%</p>
                  <p class="text-sm text-gray-500">Taux de succès</p>
                </div>
              </div>
            </div>
          </div>

          <!-- History Table -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Historique complet</h3>
            </div>

            <div v-if="pickupHistory.length === 0" class="p-8 text-center">
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <History class="w-8 h-8 text-gray-400" />
              </div>
              <p class="text-gray-500 dark:text-gray-400">Aucun historique disponible</p>
            </div>

            <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
              <div v-for="pickup in pickupHistory" :key="pickup.id" @click="viewPickupDetail(pickup)" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle class="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <p class="font-semibold text-gray-900 dark:text-white">{{ pickup.shipmentCount }} colis</p>
                        <span class="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">{{ pickup.deliveredCount || 0 }} livrés</span>
                        <span v-if="pickup.returnedCount > 0" class="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">{{ pickup.returnedCount }} retournés</span>
                      </div>
                      <p class="text-sm text-gray-500">{{ pickup.date }} • {{ pickup.timeSlot }} • {{ pickup.carrier }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Eye class="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Bordereaux (Labels) Section -->
      <template v-if="activeSection === 'labels'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Bordereaux</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez et imprimez vos étiquettes d'envoi</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{{ returnsSectionTitle }}</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                  {{ activeSection === 'lost-returns' ? 'Colis déclarés perdus par les transporteurs' :
                     activeSection === 'recovered-returns' ? 'Colis retournés et récupérés avec succès' :
                     activeSection === 'active-returns' ? 'Colis en cours de retour vers votre entrepôt' :
                     'Suivez les retours signalés par vos transporteurs' }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2 sm:space-x-3">
              <!-- Sync Status - hidden on mobile -->
              <div class="hidden sm:flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span class="text-xs font-medium text-green-700 dark:text-green-400">Synchronisé avec transporteurs</span>
              </div>
              <button @click="syncReturns" class="flex items-center space-x-0 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isSyncingReturns }" />
                <span class="hidden sm:inline">Actualiser</span>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Valeur des retours</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Statistiques et détails par entreprise de livraison</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Rapports & Analyse des retours</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Comprenez les raisons des retours et prenez de meilleures décisions</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
            <div class="table-responsive">
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
                    <td class="py-4 px-4" data-label="Transporteur">
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
                    <td class="py-4 px-4 text-center" data-label="Taux retour">
                      <span :class="[
                        'px-2 py-1 text-xs font-semibold rounded-full',
                        carrier.returnRate <= 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        carrier.returnRate <= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      ]">
                        {{ carrier.returnRate }}%
                      </span>
                    </td>
                    <td class="py-4 px-4 text-center" data-label="Tentatives moy.">
                      <span :class="carrier.avgAttempts <= 1.5 ? 'text-green-600' : carrier.avgAttempts <= 2 ? 'text-yellow-600' : 'text-red-600'" class="font-semibold">
                        {{ carrier.avgAttempts }}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-center" data-label="Taux récup.">
                      <span :class="carrier.recoveryRate >= 90 ? 'text-green-600' : carrier.recoveryRate >= 80 ? 'text-yellow-600' : 'text-red-600'" class="font-semibold">
                        {{ carrier.recoveryRate }}%
                      </span>
                    </td>
                    <td class="py-4 px-4 text-center" data-label="Délai retour">
                      <span class="text-gray-700 dark:text-gray-300">{{ carrier.avgReturnDays }} jours</span>
                    </td>
                    <td class="py-4 px-4 text-center" data-label="Score">
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
                    <td class="py-4 px-4 text-right" data-label="Recommandation">
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

      <!-- Carriers Section - Connected Carriers -->
      <template v-if="activeSection === 'connected-carriers'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Transporteurs connectés</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez vos partenaires de livraison</p>
              </div>
            </div>
            <button @click="activeSection = 'add-carrier'" class="flex items-center space-x-2 px-4 py-2.5 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
              <Plus class="w-4 h-4" />
              <span class="hidden sm:inline">Ajouter</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-4 sm:p-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-500 uppercase">Total</span>
                <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building2 class="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ carriers.length }}</p>
              <p class="text-xs text-gray-500 mt-1">transporteurs</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-500 uppercase">Connectés</span>
                <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p class="text-2xl font-bold text-green-600">{{ carriers.filter(c => c.apiStatus === 'connected').length }}</p>
              <p class="text-xs text-gray-500 mt-1">actifs</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-500 uppercase">Colis total</span>
                <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Package class="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ carriers.reduce((sum, c) => sum + c.shipments, 0).toLocaleString() }}</p>
              <p class="text-xs text-gray-500 mt-1">envoyés</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-500 uppercase">Disponibles</span>
                <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Truck class="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p class="text-2xl font-bold text-purple-600">{{ deliveryCarriers.length }}</p>
              <p class="text-xs text-gray-500 mt-1">à ajouter</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="carriers.length === 0" class="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <div class="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
              <Truck class="w-8 h-8 text-orange-500" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun transporteur configuré</h3>
            <p class="text-gray-500 mb-6 max-w-md mx-auto">Ajoutez vos premiers transporteurs pour commencer à gérer vos livraisons. Choisissez parmi plus de 65 transporteurs tunisiens.</p>
            <button @click="activeSection = 'add-carrier'" class="inline-flex items-center space-x-2 px-6 py-3 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md">
              <Plus class="w-5 h-5" />
              <span>Ajouter mon premier transporteur</span>
            </button>
          </div>

          <!-- Carrier Cards Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <!-- Add New Card -->
            <button @click="activeSection = 'add-carrier'" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group flex flex-col items-center justify-center min-h-[200px]">
              <div class="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus class="w-7 h-7 text-orange-500" />
              </div>
              <span class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">Ajouter un transporteur</span>
              <span class="text-xs text-gray-400 mt-1">65+ transporteurs disponibles</span>
            </button>

            <!-- Carrier Cards -->
            <div
              v-for="carrier in carriers"
              :key="carrier.id"
              @click="selectCarrier(carrier)"
              class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all cursor-pointer overflow-hidden"
              :class="{ 'ring-2 ring-orange-500 border-orange-500': selectedCarrier?.id === carrier.id }"
            >
              <!-- Carrier Header with Color Bar -->
              <div class="h-1.5 bg-gradient-to-r" :class="carrier.apiStatus === 'connected' ? 'from-green-400 to-green-500' : 'from-red-400 to-red-500'"></div>

              <div class="p-4">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center font-bold text-orange-600 text-sm">
                      {{ carrier.name.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h3>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span :class="carrier.apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'" class="w-1.5 h-1.5 rounded-full"></span>
                        <span class="text-xs" :class="carrier.apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'">
                          {{ carrier.apiStatus === 'connected' ? 'Connecté' : 'Déconnecté' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1">
                    <button @click.stop="editCarrier(carrier)" class="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="Modifier">
                      <FileText class="w-4 h-4" />
                    </button>
                    <button @click.stop="deleteCarrier(carrier.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-2 mb-4">
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                    <p class="text-lg font-bold text-gray-900 dark:text-white">{{ carrier.shipments }}</p>
                    <p class="text-[10px] text-gray-500 uppercase">Colis</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                    <p class="text-lg font-bold text-green-600">{{ carrier.deliveryRate }}%</p>
                    <p class="text-[10px] text-gray-500 uppercase">Livraison</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                    <p class="text-lg font-bold text-orange-600">{{ carrier.fraisColisLivres.toFixed(0) }}</p>
                    <p class="text-[10px] text-gray-500 uppercase">DT/colis</p>
                  </div>
                </div>

                <!-- Coverage Badge -->
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Couverture</span>
                  <span v-if="carrier.allRegions" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    <MapPin class="w-3 h-3" />
                    Tout le pays
                  </span>
                  <span v-else class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    <MapPin class="w-3 h-3" />
                    {{ carrier.regions.length }} région(s)
                  </span>
                </div>
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

      <!-- Add Carrier Section - Improved Wizard -->
      <template v-if="activeSection === 'add-carrier'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {{ editingCarrier ? 'Modifier le transporteur' : 'Ajouter un transporteur' }}
                </h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                  {{ editingCarrier ? 'Modifiez les informations du transporteur' : 'Configurez votre nouveau partenaire de livraison' }}
                </p>
              </div>
            </div>
            <button @click="activeSection = 'connected-carriers'; resetCarrierForm()" class="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition-all">
              <X class="w-4 h-4" />
              <span class="hidden sm:inline">Fermer</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-950">
          <div class="max-w-5xl mx-auto">
            <!-- Progress Stepper -->
            <div v-if="!editingCarrier" class="mb-8">
              <div class="flex items-center justify-between relative">
                <!-- Progress Line Background -->
                <div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 mx-16"></div>
                <!-- Progress Line Active -->
                <div class="absolute top-5 left-0 h-0.5 bg-orange-500 mx-16 transition-all duration-500" :style="{ width: `${((carrierWizardStep - 1) / 3) * 100}%` }"></div>

                <!-- Step 1 -->
                <div class="relative flex flex-col items-center z-10">
                  <button @click="carrierWizardStep = 1" :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    carrierWizardStep >= 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  ]">
                    <Truck v-if="carrierWizardStep > 1" class="w-5 h-5" />
                    <span v-else>1</span>
                  </button>
                  <span class="mt-2 text-xs font-medium" :class="carrierWizardStep >= 1 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'">Transporteur</span>
                </div>

                <!-- Step 2 -->
                <div class="relative flex flex-col items-center z-10">
                  <button @click="selectedModalCarrier && (carrierWizardStep = 2)" :disabled="!selectedModalCarrier" :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    carrierWizardStep >= 2 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
                    !selectedModalCarrier && 'cursor-not-allowed opacity-50'
                  ]">
                    <Key v-if="carrierWizardStep > 2" class="w-5 h-5" />
                    <span v-else>2</span>
                  </button>
                  <span class="mt-2 text-xs font-medium" :class="carrierWizardStep >= 2 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'">Connexion API</span>
                </div>

                <!-- Step 3 -->
                <div class="relative flex flex-col items-center z-10">
                  <button @click="newCarrier.apiId && newCarrier.apiKey && (carrierWizardStep = 3)" :disabled="!newCarrier.apiId || !newCarrier.apiKey" :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    carrierWizardStep >= 3 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
                    (!newCarrier.apiId || !newCarrier.apiKey) && 'cursor-not-allowed opacity-50'
                  ]">
                    <Receipt v-if="carrierWizardStep > 3" class="w-5 h-5" />
                    <span v-else>3</span>
                  </button>
                  <span class="mt-2 text-xs font-medium" :class="carrierWizardStep >= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'">Tarification</span>
                </div>

                <!-- Step 4 -->
                <div class="relative flex flex-col items-center z-10">
                  <button @click="carrierWizardStep >= 3 && (carrierWizardStep = 4)" :disabled="carrierWizardStep < 3" :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    carrierWizardStep >= 4 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
                    carrierWizardStep < 3 && 'cursor-not-allowed opacity-50'
                  ]">
                    <MapPinned v-if="carrierWizardStep > 4" class="w-5 h-5" />
                    <span v-else>4</span>
                  </button>
                  <span class="mt-2 text-xs font-medium" :class="carrierWizardStep >= 4 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'">Couverture</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Main Form Column -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Step 1: Sélection du transporteur -->
                <div v-if="!editingCarrier && carrierWizardStep === 1" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Truck class="w-5 h-5 mr-2 text-orange-500" />
                      Choisissez votre transporteur
                    </h4>
                    <p class="text-gray-500 text-sm mt-1">Plus de 65 transporteurs tunisiens disponibles</p>
                  </div>
                  <div class="p-6">
                    <!-- Search input -->
                    <div class="relative mb-5">
                      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        v-model="modalCarrierSearchQuery"
                        type="text"
                        placeholder="Rechercher un transporteur..."
                        class="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <span v-if="modalCarrierSearchQuery" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1 rounded-full font-medium">
                        {{ filteredModalCarriers.length }} trouvés
                      </span>
                    </div>

                    <!-- Quick filter chips -->
                    <div class="flex flex-wrap gap-2 mb-5">
                      <button class="px-3 py-1.5 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                        Tous
                      </button>
                      <button class="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200">
                        Express
                      </button>
                      <button class="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200">
                        Standard
                      </button>
                      <button class="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200">
                        Économique
                      </button>
                    </div>

                    <!-- Carrier selection grid -->
                    <div class="max-h-96 overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <button
                          v-for="carrier in filteredModalCarriers"
                          :key="carrier.id"
                          type="button"
                          @click="selectCarrierFromList(carrier)"
                          :class="[
                            'group p-4 rounded-xl border-2 text-left transition-all duration-200',
                            selectedModalCarrier?.id === carrier.id
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10 scale-[1.02]'
                              : 'border-transparent bg-white dark:bg-gray-900 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md'
                          ]"
                        >
                          <div class="flex flex-col items-center text-center gap-3">
                            <div class="relative">
                              <div class="w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110" :style="{ backgroundColor: carrier.color + '15', color: carrier.color }">
                                {{ getCarrierInitials(carrier.name) }}
                              </div>
                              <div v-if="selectedModalCarrier?.id === carrier.id" class="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                <CheckCircle class="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div class="min-w-0 w-full">
                              <p class="font-semibold text-gray-900 dark:text-white text-sm truncate">{{ carrier.name }}</p>
                              <div class="flex items-center justify-center gap-1 mt-1">
                                <Clock class="w-3 h-3 text-gray-400" />
                                <p class="text-xs text-gray-500">{{ carrier.deliveryTime }}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                      <p v-if="filteredModalCarriers.length === 0" class="text-center text-sm text-gray-500 py-12">
                        <Search class="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        Aucun transporteur trouvé
                      </p>
                    </div>
                  </div>

                  <!-- Step 1 Footer -->
                  <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <button @click="activeSection = 'connected-carriers'; resetCarrierForm()" class="text-sm text-gray-500 hover:text-gray-700">
                      Annuler
                    </button>
                    <button
                      @click="carrierWizardStep = 2"
                      :disabled="!selectedModalCarrier"
                      :class="[
                        'px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                        selectedModalCarrier
                          ? 'bg-[#4959b4] hover:bg-[#3a4791] text-white shadow-sm hover:shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      ]"
                    >
                      Continuer
                      <ArrowRight class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Step 2: API Configuration -->
                <div v-if="carrierWizardStep === 2 || editingCarrier" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Key class="w-5 h-5 mr-2 text-orange-500" />
                      Configuration API
                    </h4>
                    <p class="text-gray-500 text-sm mt-1">Connectez votre compte transporteur</p>
                  </div>
                  <div class="p-6 space-y-5">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom du transporteur
                      </label>
                      <input v-model="newCarrier.name" type="text" placeholder="Ex: Aramex, DHL, etc." class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" :readonly="!!selectedModalCarrier" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          API ID <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                          <input v-model="newCarrier.apiId" type="text" placeholder="CARRIER-API-001" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          API Key <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                          <input v-model="newCarrier.apiKey" :type="showApiKey ? 'text' : 'password'" placeholder="Votre clé API secrète" class="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                          <button type="button" @click="showApiKey = !showApiKey" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <Eye v-if="!showApiKey" class="w-5 h-5" />
                            <EyeOff v-else class="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step 2 Footer -->
                  <div v-if="!editingCarrier" class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <button @click="carrierWizardStep = 1" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <ArrowLeft class="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      @click="carrierWizardStep = 3"
                      :disabled="!newCarrier.apiId || !newCarrier.apiKey"
                      :class="[
                        'px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                        newCarrier.apiId && newCarrier.apiKey
                          ? 'bg-[#4959b4] hover:bg-[#3a4791] text-white shadow-sm hover:shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      ]"
                    >
                      Continuer
                      <ArrowRight class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Step 3: Tarification -->
                <div v-if="carrierWizardStep === 3 || editingCarrier" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Receipt class="w-5 h-5 mr-2 text-orange-500" />
                      Grille tarifaire
                    </h4>
                    <p class="text-gray-500 text-sm mt-1">Définissez vos tarifs de livraison</p>
                  </div>
                  <div class="p-6">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colis livrés</label>
                        <div class="flex items-baseline gap-1">
                          <input v-model.number="newCarrier.fraisColisLivres" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                          <span class="text-sm text-gray-400 font-medium">DT</span>
                        </div>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colis retour</label>
                        <div class="flex items-baseline gap-1">
                          <input v-model.number="newCarrier.fraisColisRetour" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                          <span class="text-sm text-gray-400 font-medium">DT</span>
                        </div>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colis échange</label>
                        <div class="flex items-baseline gap-1">
                          <input v-model.number="newCarrier.fraisColisEchange" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                          <span class="text-sm text-gray-400 font-medium">DT</span>
                        </div>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colis BIG</label>
                        <div class="flex items-baseline gap-1">
                          <input v-model.number="newCarrier.fraisColisBig" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                          <span class="text-sm text-gray-400 font-medium">DT</span>
                        </div>
                      </div>
                      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Pickup</label>
                        <div class="flex items-baseline gap-1">
                          <input v-model.number="newCarrier.fraisColisPickup" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                          <span class="text-sm text-gray-400 font-medium">DT</span>
                        </div>
                      </div>
                      <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800/30">
                        <label class="block text-xs font-medium text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">Total livraison</label>
                        <div class="flex items-baseline gap-1">
                          <input v-model.number="newCarrier.totalFraisLivraison" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-orange-300 dark:border-orange-600 bg-transparent text-xl font-bold text-orange-700 dark:text-orange-400 focus:ring-0 focus:border-orange-500" />
                          <span class="text-sm text-orange-500 font-medium">DT</span>
                        </div>
                      </div>
                    </div>

                    <!-- Frais additionnels -->
                    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                        <DollarSign class="w-4 h-4 mr-2 text-gray-400" />
                        Frais additionnels
                      </h5>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Frais paiement COD</label>
                          <div class="flex items-baseline gap-1">
                            <input v-model.number="newCarrier.fraisPaiement" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                            <span class="text-sm text-gray-400 font-medium">%</span>
                          </div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Retenu passage</label>
                          <div class="flex items-baseline gap-1">
                            <input v-model.number="newCarrier.retenuPassage" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                            <span class="text-sm text-gray-400 font-medium">DT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step 3 Footer -->
                  <div v-if="!editingCarrier" class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <button @click="carrierWizardStep = 2" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <ArrowLeft class="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      @click="carrierWizardStep = 4"
                      class="px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 bg-[#4959b4] hover:bg-[#3a4791] text-white shadow-sm hover:shadow-md"
                    >
                      Continuer
                      <ArrowRight class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Step 4: Zones de couverture -->
                <div v-if="carrierWizardStep === 4 || editingCarrier" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <MapPinned class="w-5 h-5 mr-2 text-orange-500" />
                      Zones de couverture
                    </h4>
                    <p class="text-gray-500 text-sm mt-1">Sélectionnez les régions desservies</p>
                  </div>
                  <div class="p-6">
                    <!-- All regions toggle -->
                    <label class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer mb-4 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-lg">
                          <Globe class="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p class="font-semibold text-gray-900 dark:text-white">Couverture nationale</p>
                          <p class="text-xs text-gray-500">Activer pour tout le territoire tunisien</p>
                        </div>
                      </div>
                      <div class="relative">
                        <input
                          type="checkbox"
                          v-model="newCarrier.allRegions"
                          @change="handleAllRegionsToggle"
                          class="sr-only peer"
                        />
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      </div>
                    </label>

                    <!-- Region selection grid -->
                    <div v-if="!newCarrier.allRegions" class="space-y-4">
                      <div class="flex items-center justify-between">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          <span class="font-semibold text-orange-600">{{ newCarrier.regions.length }}</span> / 24 gouvernorats
                        </p>
                        <div class="flex gap-2">
                          <button @click="selectAllRegions" type="button" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 transition-colors">
                            Tout sélectionner
                          </button>
                          <button @click="clearAllRegions" type="button" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors">
                            Effacer
                          </button>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
                        <label
                          v-for="gov in gouvernorats"
                          :key="gov"
                          :class="[
                            'flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all',
                            newCarrier.regions.includes(gov)
                              ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600'
                              : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                          ]"
                        >
                          <input
                            type="checkbox"
                            :value="gov"
                            v-model="newCarrier.regions"
                            class="hidden"
                          />
                          <MapPin :class="[
                            'w-4 h-4',
                            newCarrier.regions.includes(gov) ? 'text-orange-500' : 'text-gray-400'
                          ]" />
                          <span :class="[
                            'text-sm font-medium',
                            newCarrier.regions.includes(gov) ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400'
                          ]">{{ gov }}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Final Footer -->
                  <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <button v-if="!editingCarrier" @click="carrierWizardStep = 3" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <ArrowLeft class="w-4 h-4" />
                      Retour
                    </button>
                    <button v-else @click="activeSection = 'connected-carriers'; resetCarrierForm()" class="text-sm text-gray-500 hover:text-gray-700">
                      Annuler
                    </button>
                    <button
                      @click="saveCarrierFromPage"
                      class="px-8 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 bg-[#4959b4] hover:bg-[#3a4791] text-white shadow-sm hover:shadow-md"
                    >
                      <CheckCircle class="w-5 h-5" />
                      {{ editingCarrier ? 'Enregistrer' : 'Ajouter le transporteur' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Preview Column -->
              <div class="lg:col-span-1">
                <div class="sticky top-6 space-y-4">
                  <!-- Live Preview Card -->
                  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Eye class="w-4 h-4 mr-2 text-gray-400" />
                        Aperçu en direct
                      </h5>
                    </div>
                    <div class="p-4">
                      <!-- Mini Carrier Card Preview -->
                      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div class="h-1.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-xl -mt-4 -mx-4 mb-4"></div>
                        <div class="flex items-start gap-3 mb-4">
                          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm" :style="selectedModalCarrier ? { backgroundColor: selectedModalCarrier.color + '20', color: selectedModalCarrier.color } : { backgroundColor: '#f97316' + '20', color: '#f97316' }">
                            {{ newCarrier.name ? getCarrierInitials(newCarrier.name) : '??' }}
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-semibold text-gray-900 dark:text-white truncate">{{ newCarrier.name || 'Nom du transporteur' }}</p>
                            <div class="flex items-center gap-1.5 mt-0.5">
                              <span class="w-1.5 h-1.5 rounded-full" :class="newCarrier.apiId && newCarrier.apiKey ? 'bg-green-500' : 'bg-gray-300'"></span>
                              <span class="text-xs" :class="newCarrier.apiId && newCarrier.apiKey ? 'text-green-600' : 'text-gray-400'">
                                {{ newCarrier.apiId && newCarrier.apiKey ? 'Prêt' : 'API non configurée' }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="grid grid-cols-3 gap-2 mb-3">
                          <div class="text-center p-2 bg-white dark:bg-gray-900 rounded-lg">
                            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ newCarrier.fraisColisLivres.toFixed(1) }}</p>
                            <p class="text-[9px] text-gray-400 uppercase">Livré</p>
                          </div>
                          <div class="text-center p-2 bg-white dark:bg-gray-900 rounded-lg">
                            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ newCarrier.fraisColisRetour.toFixed(1) }}</p>
                            <p class="text-[9px] text-gray-400 uppercase">Retour</p>
                          </div>
                          <div class="text-center p-2 bg-white dark:bg-gray-900 rounded-lg">
                            <p class="text-sm font-bold text-orange-600">{{ newCarrier.totalFraisLivraison.toFixed(1) }}</p>
                            <p class="text-[9px] text-gray-400 uppercase">Total</p>
                          </div>
                        </div>

                        <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span class="text-xs text-gray-500">Couverture</span>
                          <span v-if="newCarrier.allRegions" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                            <Globe class="w-3 h-3" />
                            National
                          </span>
                          <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <MapPin class="w-3 h-3" />
                            {{ newCarrier.regions.length }} régions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Tips Card -->
                  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                    <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center mb-3">
                      <Lightbulb class="w-4 h-4 mr-2 text-orange-500" />
                      Conseils
                    </h5>
                    <ul class="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <li class="flex items-start gap-2">
                        <CheckCircle class="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-500" />
                        <span>Obtenez vos identifiants API depuis le portail de votre transporteur</span>
                      </li>
                      <li class="flex items-start gap-2">
                        <CheckCircle class="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-500" />
                        <span>Les tarifs peuvent être ajustés à tout moment</span>
                      </li>
                      <li class="flex items-start gap-2">
                        <CheckCircle class="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-500" />
                        <span>Activez la couverture nationale pour une configuration rapide</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Tracking Page Section -->
      <template v-if="activeSection === 'page-templates' || activeSection === 'my-tracking-page' || activeSection === 'page-branding' || activeSection === 'page-analytics' || activeSection === 'failed-searches'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {{ activeSection === 'page-templates' ? 'Modèles de page' : activeSection === 'my-tracking-page' ? 'Ma page de suivi' : activeSection === 'page-branding' ? 'Personnalisation' : activeSection === 'page-analytics' ? 'Analytiques page' : 'Recherches échouées' }}
                </h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                  {{ activeSection === 'page-templates' ? 'Choisissez un modèle pour votre page de suivi' : activeSection === 'my-tracking-page' ? 'Prévisualisez et gérez votre page de suivi' : activeSection === 'page-branding' ? 'Personnalisez votre page avec votre branding' : activeSection === 'page-analytics' ? 'Statistiques de votre page de suivi' : 'Clients qui n\'ont pas trouvé leur commande' }}
                </p>
              </div>
            </div>
            <button v-if="activeSection === 'page-templates'" class="flex items-center space-x-0 sm:space-x-2 px-3 sm:px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium transition-colors">
              <Plus class="w-4 h-4" />
              <span class="hidden sm:inline">Créer une page</span>
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
                  <div v-for="(day, index) in []" :key="index" class="flex-1 flex flex-col items-center">
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
                  <div v-for="(item, index) in []" :key="index"
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
              <div class="table-responsive">
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
                    <td class="px-4 py-3" data-label="Recherche">
                      <span class="font-mono text-sm text-gray-900 dark:text-white">{{ search.query }}</span>
                    </td>
                    <td class="px-4 py-3" data-label="Téléphone">
                      <span v-if="search.phone" class="text-sm text-gray-600 dark:text-gray-400">{{ search.phone }}</span>
                      <span v-else class="text-sm text-gray-400">Non fourni</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Date">{{ search.date }}</td>
                    <td class="px-4 py-3" data-label="Statut">
                      <span :class="[
                        'px-2 py-0.5 text-xs rounded font-medium',
                        search.contacted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      ]">
                        {{ search.contacted ? 'Contacté' : 'À contacter' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right" data-label="Actions">
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
          </div>
        </main>
      </template>

      <!-- Finance Section -->
      <!-- ==================== FINANCE - PAIEMENTS ATTENDUS ==================== -->
      <template v-if="activeSection === 'expected-payments'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Paiements attendus</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Montants que les transporteurs vous doivent (COD collecté - Frais)</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
              <select v-model="expectedPaymentsCarrierFilter" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="all">Tous les transporteurs</option>
                <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
              </select>
              <select v-model="expectedPaymentsStatusFilter" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="all">Tous les statuts</option>
                <option value="pending">Non payé</option>
                <option value="overdue">En retard</option>
              </select>
              <button @click="showReconciliationModal = true" class="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                <CheckCircle class="w-4 h-4" />
                <span>Vérifier</span>
              </button>
              <button class="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                <FileDown class="w-4 h-4" />
                <span>Exporter</span>
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
            <div class="table-responsive">
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
                    <td class="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white" data-label="N° Tracking">{{ shipment.tracking }}</td>
                    <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300" data-label="Client">{{ shipment.client }}</td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400" data-label="Destination">{{ shipment.destination }}</td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400" data-label="Date Livraison">{{ shipment.deliveryDate }}</td>
                    <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white" data-label="COD">{{ shipment.cod.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right text-red-600" data-label="Frais Livr.">-{{ shipment.deliveryFee.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right text-red-600" data-label="Autres Frais">{{ shipment.otherFees > 0 ? '-' + shipment.otherFees.toLocaleString() : '0' }} TND</td>
                    <td class="px-4 py-2.5 text-right font-semibold text-green-600" data-label="Net">{{ shipment.net.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-center" data-label="Statut">
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

        <!-- Payment Reconciliation Modal -->
        <Teleport to="body">
          <div v-if="showReconciliationModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/50" @click="closeReconciliationModal"></div>
            <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
              <!-- Header -->
              <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Vérification des paiements</h2>
                  <p class="text-sm text-gray-500">Réconciliez vos paiements avec vos relevés</p>
                </div>
                <button @click="closeReconciliationModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <X class="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <!-- Tabs -->
              <div class="flex border-b border-gray-200 dark:border-gray-800">
                <button @click="reconciliationActiveTab = 'bank'" :class="['flex-1 px-4 py-3 text-sm font-medium transition-colors', reconciliationActiveTab === 'bank' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700']">
                  Relevé bancaire
                </button>
                <button @click="reconciliationActiveTab = 'manual'" :class="['flex-1 px-4 py-3 text-sm font-medium transition-colors', reconciliationActiveTab === 'manual' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700']">
                  Saisie manuelle
                </button>
                <button @click="reconciliationActiveTab = 'results'" :class="['flex-1 px-4 py-3 text-sm font-medium transition-colors', reconciliationActiveTab === 'results' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700']">
                  Résultats
                  <span v-if="matchingResults.length > 0" class="ml-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">{{ matchingResults.length }}</span>
                </button>
              </div>

              <!-- Body -->
              <div class="flex-1 overflow-y-auto p-5">
                <!-- Bank Tab -->
                <div v-if="reconciliationActiveTab === 'bank'" class="space-y-5">
                  <div class="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Upload class="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Importer un relevé bancaire (CSV, Excel)</p>
                    <label class="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
                      <Upload class="w-4 h-4" />
                      <span>Choisir un fichier</span>
                      <input type="file" accept=".csv,.xlsx" class="hidden" @change="handleBankFileUpload" />
                    </label>
                    <p v-if="bankTransactionsFile" class="mt-2 text-sm text-green-600">{{ bankTransactionsFile.name }}</p>
                  </div>

                  <div v-if="bankTransactions.length > 0" class="space-y-3">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Transactions ({{ bankTransactions.length }})</p>
                      <button @click="runAutoMatching" class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Lancer le rapprochement
                      </button>
                    </div>
                    <div class="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                      <div v-for="tx in bankTransactions" :key="tx.id" class="p-3 flex items-center justify-between">
                        <div>
                          <p class="text-sm text-gray-900 dark:text-white">{{ tx.description }}</p>
                          <p class="text-xs text-gray-500">{{ tx.date }}</p>
                        </div>
                        <div class="text-right">
                          <p class="text-sm font-medium text-green-600">+{{ tx.amount.toLocaleString() }} TND</p>
                          <span v-if="tx.matched" class="text-xs text-green-600">Rapproché</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Manual Tab -->
                <div v-if="reconciliationActiveTab === 'manual'" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transporteur</label>
                      <select v-model="manualPaymentData.carrierId" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                        <option value="">Sélectionner...</option>
                        <option v-for="carrier in carriersList" :key="carrier.id" :value="carrier.id">{{ carrier.name }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant reçu (TND)</label>
                      <input type="number" v-model="manualPaymentData.amount" placeholder="0.00" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                      <input type="date" v-model="manualPaymentData.date" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Référence</label>
                      <input type="text" v-model="manualPaymentData.reference" placeholder="Ex: VIR-2026-001" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                    </div>
                  </div>

                  <div v-if="manualPaymentData.carrierId" class="space-y-2">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Paiements attendus</p>
                    <div class="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                      <div v-for="carrier in manifestByCarrier.filter(c => c.id === manualPaymentData.carrierId)" :key="carrier.id" class="p-3 flex items-center justify-between">
                        <div>
                          <p class="text-sm text-gray-900 dark:text-white">{{ carrier.name }}</p>
                          <p class="text-xs text-gray-500">{{ carrier.shipments.length }} colis</p>
                        </div>
                        <p :class="['text-sm font-medium', manualPaymentData.amount && Math.abs(carrier.netAmount - manualPaymentData.amount) < 10 ? 'text-green-600' : 'text-gray-900 dark:text-white']">{{ carrier.netAmount.toLocaleString() }} TND</p>
                      </div>
                    </div>
                  </div>

                  <button @click="submitManualPayment" :disabled="!manualPaymentData.carrierId || !manualPaymentData.amount" :class="['w-full py-2.5 rounded-lg text-sm font-medium transition-colors', manualPaymentData.carrierId && manualPaymentData.amount ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed']">
                    Enregistrer le paiement
                  </button>
                </div>

                <!-- Results Tab -->
                <div v-if="reconciliationActiveTab === 'results'" class="space-y-4">
                  <div class="grid grid-cols-3 gap-3">
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p class="text-xl font-bold text-green-600">{{ matchingStats.totalMatched }}</p>
                      <p class="text-xs text-gray-500">Rapprochés</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p class="text-xl font-bold text-orange-600">{{ matchingStats.totalUnmatched }}</p>
                      <p class="text-xs text-gray-500">Non rapprochés</p>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p class="text-xl font-bold text-gray-900 dark:text-white">{{ matchingStats.totalExpected }}</p>
                      <p class="text-xs text-gray-500">Total</p>
                    </div>
                  </div>

                  <div v-if="matchingResults.length > 0" class="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                    <div v-for="result in matchingResults" :key="result.carrier.id" class="p-3 flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div :class="['w-8 h-8 rounded-full flex items-center justify-center', result.status === 'matched' ? 'bg-green-100 dark:bg-green-900/30' : result.status === 'confirmed' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-orange-100 dark:bg-orange-900/30']">
                          <CheckCircle :class="['w-4 h-4', result.status === 'matched' ? 'text-green-600' : result.status === 'confirmed' ? 'text-gray-400' : 'text-orange-600']" />
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ result.carrier.name }}</p>
                          <p class="text-xs text-gray-500">{{ result.carrier.shipments.length }} colis</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ result.carrier.netAmount.toLocaleString() }} TND</p>
                        <button v-if="result.status === 'matched'" @click="confirmMatchedPayment(result)" class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors">
                          Confirmer
                        </button>
                        <span v-else-if="result.status === 'confirmed'" class="text-xs text-gray-400">Confirmé</span>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8">
                    <Search class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p class="text-sm text-gray-500">Importez un relevé pour commencer</p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end">
                <button @click="closeReconciliationModal" class="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      </template>

      <!-- ==================== FINANCE - PAIEMENTS REÇUS ==================== -->
      <template v-if="activeSection === 'received-payments'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Paiements reçus</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Historique des versements reçus avec détail par colis</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
            <div v-show="payment.expanded" class="table-responsive">
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
                    <td class="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white" data-label="N° Tracking">{{ shipment.tracking }}</td>
                    <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300" data-label="Client">{{ shipment.client }}</td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400" data-label="Destination">{{ shipment.destination }}</td>
                    <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400" data-label="Date Livraison">{{ shipment.deliveryDate }}</td>
                    <td class="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white" data-label="COD">{{ shipment.cod.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right text-red-600" data-label="Frais Livr.">-{{ shipment.deliveryFee.toLocaleString() }} TND</td>
                    <td class="px-4 py-2.5 text-right text-red-600" data-label="Autres Frais">{{ shipment.otherFees > 0 ? '-' + shipment.otherFees.toLocaleString() : '0' }} TND</td>
                    <td class="px-4 py-2.5 text-right font-semibold text-green-600" data-label="Net">{{ shipment.net.toLocaleString() }} TND</td>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Écarts de paiement</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Comparaison entre nos calculs et les paiements reçus des transporteurs</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
            <div class="table-responsive">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Revenus</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Vue d'ensemble de vos revenus et marges</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Pertes retours</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Impact financier des retours et colis perdus</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
            <div class="table-responsive">
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
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Référence">{{ loss.reference }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Client">{{ loss.customer }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Transporteur">{{ loss.carrier }}</td>
                    <td class="px-4 py-3" data-label="Motif">
                      <span :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        loss.reason === 'Refusé' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        loss.reason === 'Perdu' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      ]">{{ loss.reason }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Valeur colis">{{ loss.value.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Frais port">{{ loss.shippingFee.toLocaleString() }} TND</td>
                    <td class="px-4 py-3 text-sm font-semibold text-red-600" data-label="Perte totale">-{{ loss.totalLoss.toLocaleString() }} TND</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </template>

      <!-- ==================== FINANCE - FACTURES ==================== -->
      <template v-if="activeSection === 'invoices'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Factures</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez vos factures transporteurs et clients</p>
              </div>
            </div>
            <div class="hidden sm:flex items-center space-x-3">
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
            <div class="table-responsive">
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
                    <td class="px-4 py-3" data-label="N° Facture">
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ invoice.number }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Client">{{ invoice.party }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Date">{{ invoice.date }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Échéance">{{ invoice.dueDate }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white" data-label="Montant">{{ invoice.amount.toLocaleString() }} TND</td>
                    <td class="px-4 py-3" data-label="Statut">
                      <span :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      ]">
                        {{ invoice.status === 'paid' ? 'Payée' : invoice.status === 'overdue' ? 'En retard' : 'En attente' }}
                      </span>
                    </td>
                    <td class="px-4 py-3" data-label="Actions">
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Exports financiers</h1>
              <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Exportez vos données financières pour la comptabilité</p>
              </div>
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
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Utilisateurs & Rôles</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                  Gérez les membres de votre équipe et leurs permissions
                </p>
              </div>
            </div>
            <button @click="exportMembers" class="flex items-center space-x-0 sm:space-x-2 px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Download class="w-4 h-4" />
              <span class="hidden sm:inline">Exporter</span>
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
                      ? 'border-[#4959b4] text-[#4959b4]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  ]"
                >
                  Membres ({{ filteredMembers.length }})
                </button>
                <button
                  @click="membersTab = 'roles'"
                  :class="[
                    'py-4 text-sm font-medium border-b-2 -mb-px transition-colors',
                    membersTab === 'roles'
                      ? 'border-[#4959b4] text-[#4959b4]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  ]"
                >
                  Rôles ({{ availableRoles.length }})
                </button>
              </nav>
            </div>

            <!-- Members Tab Content -->
            <div v-if="membersTab === 'members'" class="p-6">
              <!-- Add Members Button -->
              <button @click="openAddMemberModal" class="mb-6 flex items-center space-x-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium transition-colors">
                <Plus class="w-4 h-4" />
                <span>Ajouter un membre</span>
              </button>

              <!-- Search and Filter -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4 mb-6">
                <div class="flex-1 relative">
                  <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="memberSearchQuery"
                    type="text"
                    placeholder="Rechercher par nom ou email"
                    class="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#4959b4] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div class="relative">
                  <button
                    @click="showRoleFilter = !showRoleFilter"
                    class="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span>Filtrer par rôle</span>
                    <ChevronDown class="w-4 h-4" />
                  </button>
                  <!-- Role Filter Dropdown -->
                  <div v-if="showRoleFilter" class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                    <label v-for="role in availableRoles" :key="role.id" class="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <input type="checkbox" :value="role.id" v-model="selectedRoleFilters" class="mr-3 rounded border-gray-300" />
                      <span class="text-sm text-gray-700 dark:text-gray-300">{{ role.name }}</span>
                    </label>
                    <div class="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-4 flex justify-between">
                      <button @click="selectedRoleFilters = []; showRoleFilter = false" class="text-sm text-gray-500 hover:text-gray-700">Effacer</button>
                      <button @click="showRoleFilter = false" class="text-sm text-[#4959b4] font-medium">Appliquer</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Members Table -->
              <div class="table-responsive">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-800">
                      <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Membre</th>
                      <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Email</th>
                      <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                      <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Statut</th>
                      <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Dernière connexion</th>
                      <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                    <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td class="py-3 px-4" data-label="Membre">
                        <div class="flex items-center space-x-3">
                          <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm', member.avatarColor]">
                            {{ member.initials }}
                          </div>
                          <span class="font-medium text-gray-900 dark:text-white">{{ member.name }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell" data-label="Email">{{ member.email }}</td>
                      <td class="py-3 px-4" data-label="Rôle">
                        <span :class="[
                          'px-2 py-1 rounded-full text-xs font-medium',
                          member.role === 'Owner' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                          member.role === 'Admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          member.role === 'Manager' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        ]">{{ member.role }}</span>
                      </td>
                      <td class="py-3 px-4 hidden md:table-cell" data-label="Statut">
                        <span :class="[
                          'px-2 py-1 rounded-full text-xs font-medium',
                          member.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          member.status === 'invited' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        ]">
                          {{ member.status === 'active' ? 'Actif' : member.status === 'invited' ? 'Invité' : 'Inactif' }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-sm text-gray-500 hidden lg:table-cell" data-label="Dernière connexion">{{ member.lastLogin }}</td>
                      <td class="py-3 px-4 text-right" data-label="Actions">
                        <div class="flex items-center justify-end space-x-2">
                          <button @click="editMember(member)" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Modifier">
                            <Settings class="w-4 h-4 text-gray-500" />
                          </button>
                          <button v-if="member.role !== 'Owner'" @click="confirmDeleteMember(member)" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Supprimer">
                            <Trash2 class="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty State -->
              <div v-if="filteredMembers.length === 0" class="text-center py-12">
                <Users class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">Aucun membre trouvé</p>
              </div>
            </div>

            <!-- Roles Tab Content -->
            <div v-if="membersTab === 'roles'" class="p-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Créez des rôles personnalisés avec des permissions spécifiques pour un meilleur contrôle d'accès.
                </p>
                <button @click="openAddRoleModal" class="flex items-center space-x-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium transition-colors">
                  <Plus class="w-4 h-4" />
                  <span>Créer un rôle</span>
                </button>
              </div>

              <!-- Roles Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="role in availableRoles" :key="role.id" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div :class="[
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        role.id === 'owner' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        role.id === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        role.id === 'manager' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-gray-100 dark:bg-gray-700'
                      ]">
                        <Shield :class="[
                          'w-5 h-5',
                          role.id === 'owner' ? 'text-purple-600' :
                          role.id === 'admin' ? 'text-blue-600' :
                          role.id === 'manager' ? 'text-green-600' :
                          'text-gray-500'
                        ]" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="font-semibold text-gray-900 dark:text-white">{{ role.name }}</h3>
                          <span v-if="role.isDefault" class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] rounded uppercase">Défaut</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-0.5">{{ role.memberCount }} membre{{ role.memberCount > 1 ? 's' : '' }}</p>
                      </div>
                    </div>
                    <div v-if="!role.isOwner" class="flex items-center gap-1">
                      <button @click="editRole(role)" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <Settings class="w-4 h-4 text-gray-500" />
                      </button>
                      <button v-if="!role.isDefault" @click="confirmDeleteRole(role)" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 class="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ role.description || 'Aucune description' }}</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="perm in (role.permissions || []).slice(0, 4)" :key="perm" class="px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400">
                      {{ perm }}
                    </span>
                    <span v-if="(role.permissions || []).length > 4" class="px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400">
                      +{{ role.permissions.length - 4 }} autres
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Add/Edit Member Modal -->
        <div v-if="showMemberModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md shadow-xl">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ editingMember ? 'Modifier le membre' : 'Ajouter un membre' }}
              </h2>
              <button @click="closeMemberModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X class="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet *</label>
                <input v-model="memberForm.name" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="Jean Dupont" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input v-model="memberForm.email" type="email" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="jean@exemple.tn" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle *</label>
                <select v-model="memberForm.role" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                  <option value="">Sélectionner un rôle</option>
                  <option v-for="role in availableRoles.filter(r => !r.isOwner)" :key="role.id" :value="role.name">{{ role.name }}</option>
                </select>
              </div>
              <div v-if="editingMember">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                <select v-model="memberForm.status" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
              <button @click="closeMemberModal" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Annuler
              </button>
              <button @click="saveMember" class="px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium">
                {{ editingMember ? 'Enregistrer' : 'Inviter' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Add/Edit Role Modal -->
        <div v-if="showRoleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ editingRole ? 'Modifier le rôle' : 'Créer un rôle' }}
              </h2>
              <button @click="closeRoleModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X class="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div class="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du rôle *</label>
                <input v-model="roleForm.name" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="Gestionnaire de stock" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea v-model="roleForm.description" rows="2" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white resize-none" placeholder="Décrivez les responsabilités de ce rôle"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Permissions</label>
                <div class="space-y-3">
                  <div v-for="category in permissionCategories" :key="category.name" class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">{{ category.name }}</h4>
                    <div class="grid grid-cols-2 gap-2">
                      <label v-for="perm in category.permissions" :key="perm.id" class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" :value="perm.id" v-model="roleForm.permissions" class="rounded border-gray-300" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ perm.label }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
              <button @click="closeRoleModal" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Annuler
              </button>
              <button @click="saveRole" class="px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium">
                {{ editingRole ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm shadow-xl">
            <div class="p-6 text-center">
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle class="w-6 h-6 text-red-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ deleteConfirmMessage }}
              </p>
            </div>
            <div class="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
              <button @click="showDeleteConfirm = false" class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Annuler
              </button>
              <button @click="executeDelete" class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Administration - Users List Section -->
      <template v-if="activeSection === 'admin-users'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
                        <button @click="openChargeModal(user)" class="px-3 py-1.5 bg-[#4959b4] hover:bg-[#3a4791] text-white text-xs font-medium rounded-lg flex items-center gap-1">
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
      </template>

      <!-- Administration - Billing Section -->
      <template v-if="activeSection === 'admin-billing'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Facturation comptes</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez les soldes et les paiements des utilisateurs</p>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-6">
          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <TrendingUp class="w-6 h-6 text-green-600" />
                </div>
                <span class="text-xs text-gray-500">Ce mois</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminTransactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0).toFixed(2) }} TND</p>
              <p class="text-sm text-gray-500">Total crédits</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <TrendingDown class="w-6 h-6 text-red-600" />
                </div>
                <span class="text-xs text-gray-500">Ce mois</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminTransactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0).toFixed(2) }} TND</p>
              <p class="text-sm text-gray-500">Total débits</p>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-[#4959b4]/10 rounded-xl">
                  <Receipt class="w-6 h-6 text-[#4959b4]" />
                </div>
                <span class="text-xs text-gray-500">Ce mois</span>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminTransactions.length }}</p>
              <p class="text-sm text-gray-500">Transactions</p>
            </div>
          </div>

          <!-- Users with Balances -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 class="font-semibold text-gray-900 dark:text-white">Soldes des comptes</h3>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div v-for="user in adminUsers" :key="user.id" class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm">
                    {{ user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                    <p class="text-sm text-gray-500">{{ user.company }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p :class="[
                      'text-lg font-semibold',
                      user.balance > 0 ? 'text-green-600' : user.balance < 0 ? 'text-red-600' : 'text-gray-500'
                    ]">
                      {{ user.balance >= 0 ? '+' : '' }}{{ user.balance.toFixed(2) }} TND
                    </p>
                    <p class="text-xs text-gray-400">{{ user.shipmentsCount }} colis</p>
                  </div>
                  <button @click="openChargeModal(user)" class="px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white text-sm font-medium rounded-lg flex items-center gap-2">
                    <Plus class="w-4 h-4" />
                    Charger
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Administration - Transactions Section -->
      <template v-if="activeSection === 'admin-transactions'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Historique des transactions</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Consultez toutes les transactions de facturation</p>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-6">
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Note</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="tx in adminTransactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="px-4 py-3">
                      <span class="font-mono text-sm text-gray-600 dark:text-gray-400">{{ tx.id }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <p class="font-medium text-gray-900 dark:text-white">{{ tx.userName }}</p>
                      <p class="text-xs text-gray-500">{{ tx.company }}</p>
                    </td>
                    <td class="px-4 py-3 hidden md:table-cell">
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ tx.note }}</p>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span :class="[
                        'px-2 py-1 text-xs rounded-full font-medium',
                        tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      ]">
                        {{ tx.type === 'credit' ? 'Crédit' : 'Débit' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <span :class="[
                        'font-semibold',
                        tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      ]">
                        {{ tx.type === 'credit' ? '+' : '-' }}{{ tx.amount.toFixed(2) }} TND
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right hidden sm:table-cell">
                      <span class="text-sm text-gray-500">{{ tx.date }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="adminTransactions.length === 0" class="p-8 text-center">
              <Receipt class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500">Aucune transaction</p>
            </div>
          </div>
        </main>
      </template>

      <!-- Company Profile Section -->
      <template v-if="activeSection === 'company-profile'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Profil entreprise</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez les informations de votre entreprise</p>
              </div>
            </div>
            <button @click="saveCompanyProfile" class="btn-cta">
              <Save class="w-4 h-4" />
              <span class="hidden sm:inline ml-2">Enregistrer</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-3xl space-y-6">
            <!-- Logo Section -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Logo de l'entreprise</h3>
              <div class="flex items-center gap-6">
                <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Building class="w-10 h-10 text-gray-400" />
                </div>
                <div>
                  <button class="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                    Changer le logo
                  </button>
                  <p class="text-xs text-gray-500 mt-2">PNG, JPG jusqu'à 2MB. Taille recommandée: 200x200px</p>
                </div>
              </div>
            </div>

            <!-- Company Information -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Informations générales</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'entreprise</label>
                  <input v-model="companyProfile.name" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="Ma Société SARL" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matricule fiscal</label>
                  <input v-model="companyProfile.taxId" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="1234567ABC" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input v-model="companyProfile.email" type="email" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="contact@entreprise.tn" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                  <input v-model="companyProfile.phone" type="tel" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="+216 XX XXX XXX" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
                  <input v-model="companyProfile.address" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="123 Rue de la Liberté" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville</label>
                  <input v-model="companyProfile.city" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="Tunis" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code postal</label>
                  <input v-model="companyProfile.postalCode" type="text" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" placeholder="1000" />
                </div>
              </div>
            </div>

            <!-- Business Settings -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Paramètres commerciaux</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Devise</label>
                  <select v-model="companyProfile.currency" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                    <option value="TND">Dinar Tunisien (TND)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar US (USD)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuseau horaire</label>
                  <select v-model="companyProfile.timezone" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white">
                    <option value="Africa/Tunis">Tunis (GMT+1)</option>
                    <option value="Europe/Paris">Paris (GMT+1)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Security Section -->
      <template v-if="activeSection === 'security'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Sécurité</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez la sécurité de votre compte</p>
              </div>
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-3xl space-y-6">
            <!-- Change Password -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Key class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Changer le mot de passe</h3>
                  <p class="text-xs text-gray-500">Dernière modification il y a 30 jours</p>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
                  <input v-model="securitySettings.currentPassword" type="password" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                  <input v-model="securitySettings.newPassword" type="password" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le nouveau mot de passe</label>
                  <input v-model="securitySettings.confirmPassword" type="password" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
                </div>
                <button @click="changePassword" class="btn-cta">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>

            <!-- Two-Factor Authentication -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Authentification à deux facteurs (2FA)</h3>
                    <p class="text-xs text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                  </div>
                </div>
                <button
                  @click="securitySettings.twoFactorEnabled = !securitySettings.twoFactorEnabled"
                  :class="[
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                    securitySettings.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      securitySettings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>
              </div>
              <div v-if="securitySettings.twoFactorEnabled" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div class="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle class="w-4 h-4" />
                  <span class="text-sm font-medium">2FA est activé</span>
                </div>
                <p class="text-xs text-green-600 dark:text-green-500 mt-1">Votre compte est protégé par l'authentification à deux facteurs.</p>
              </div>
              <div v-else class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div class="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <AlertTriangle class="w-4 h-4" />
                  <span class="text-sm font-medium">2FA n'est pas activé</span>
                </div>
                <p class="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Activez 2FA pour une meilleure sécurité de votre compte.</p>
              </div>
            </div>

            <!-- Active Sessions -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Monitor class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Sessions actives</h3>
                  <p class="text-xs text-gray-500">Appareils actuellement connectés à votre compte</p>
                </div>
              </div>
              <div class="space-y-3">
                <div v-for="session in activeSessions" :key="session.id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="flex items-center gap-3">
                    <Monitor class="w-5 h-5 text-gray-400" />
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.device }}</p>
                      <p class="text-xs text-gray-500">{{ session.location }} • {{ session.lastActive }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="session.current" class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">Actuelle</span>
                    <button v-else class="text-xs text-red-600 hover:text-red-700">Déconnecter</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>

      <!-- Payment History Section -->
      <template v-if="activeSection === 'payment-history'">
        <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button @click="subMenuOpen = !subMenuOpen" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Historique de paiement</h1>
                <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Consultez vos transactions et factures</p>
              </div>
            </div>
            <button class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Download class="w-4 h-4" />
              <span class="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <div class="max-w-5xl space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ paymentStats.totalPaid }} TND</p>
                    <p class="text-xs text-gray-500">Total payé</p>
                  </div>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Clock class="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ paymentStats.pending }} TND</p>
                    <p class="text-xs text-gray-500">En attente</p>
                  </div>
                </div>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ paymentStats.invoiceCount }}</p>
                    <p class="text-xs text-gray-500">Factures</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment History Table -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div class="p-4 border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Transactions récentes</h3>
                  <select v-model="paymentFilter" class="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                    <option value="all">Toutes</option>
                    <option value="paid">Payées</option>
                    <option value="pending">En attente</option>
                    <option value="failed">Échouées</option>
                  </select>
                </div>
              </div>
              <div class="table-responsive">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                      <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                      <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Facture</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in filteredPayments" :key="payment.id" class="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-white" data-label="Date">{{ payment.date }}</td>
                      <td class="px-4 py-3" data-label="Description">
                        <div>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ payment.description }}</p>
                          <p class="text-xs text-gray-500">{{ payment.reference }}</p>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Montant">{{ payment.amount }} TND</td>
                      <td class="px-4 py-3" data-label="Statut">
                        <span :class="[
                          'px-2 py-1 rounded-full text-xs font-medium',
                          payment.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          payment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        ]">
                          {{ payment.status === 'paid' ? 'Payé' : payment.status === 'pending' ? 'En attente' : 'Échoué' }}
                        </span>
                      </td>
                      <td class="px-4 py-3" data-label="Facture">
                        <button class="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1">
                          <Download class="w-4 h-4" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </template>
    </div>

    <!-- Shipment Detail Panel -->
    <div
      v-if="selectedShipment"
      class="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <!-- Panel Header -->
      <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex flex-wrap items-center gap-2 min-w-0">
            <span class="font-mono text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{{ selectedShipment.trackingNumber }}</span>
            <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium flex-shrink-0">Échantillon</span>
          </div>
          <button @click="selectedShipment = null" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex-shrink-0">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
          <button
            @click="openLabelPreview(selectedShipment)"
            class="flex items-center space-x-1 text-orange-500 hover:text-orange-600 font-medium"
          >
            <Printer class="w-4 h-4 flex-shrink-0" />
            <span class="whitespace-nowrap">Imprimer le bordereau</span>
          </button>
          <button class="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-orange-500">
            <Eye class="w-4 h-4 flex-shrink-0" />
            <span class="whitespace-nowrap">Page de suivi</span>
          </button>
        </div>
      </div>

      <!-- Panel Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Delivery Status Header -->
        <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-start justify-between gap-2 mb-4">
            <div class="min-w-0 flex-1">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {{ selectedShipment.status === 'Delivered' ? 'Livrée' : selectedShipment.status === 'Out for delivery' ? 'En livraison' : selectedShipment.status === 'Pending' ? 'En attente' : selectedShipment.status }}
                {{ selectedShipment.deliveryDate ? 'le ' + selectedShipment.deliveryDate : '' }}
              </h3>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button class="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ExternalLink class="w-4 h-4 text-gray-500" />
              </button>
              <button class="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Mail class="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <!-- Transit Time Progress -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Temps de transit : {{ selectedShipment.transitDays }} jour{{ selectedShipment.transitDays !== 1 ? 's' : '' }}</p>
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
        <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Route</h4>
          <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{{ selectedShipment.origin }} → {{ selectedShipment.destination }}</p>
        </div>

        <!-- Events Timeline -->
        <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="space-y-3 sm:space-y-4">
            <div v-for="(event, index) in selectedShipment.events" :key="index" class="flex space-x-2 sm:space-x-3">
              <div class="flex flex-col items-center flex-shrink-0">
                <div
                  :class="[
                    'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center',
                    event.status === 'Livrée' ? 'bg-green-500' : event.status === 'En livraison' || event.status === 'En transit' ? 'bg-blue-500' : 'bg-gray-400'
                  ]"
                >
                  <Check v-if="event.completed && event.status === 'Livrée'" class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  <Truck v-else-if="event.status === 'En livraison' || event.status === 'En transit'" class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  <FileText v-else class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
                <div v-if="index < selectedShipment.events.length - 1" class="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1"></div>
              </div>
              <div class="flex-1 min-w-0 pb-3 sm:pb-4">
                <p class="text-sm sm:font-medium text-gray-900 dark:text-white">{{ event.status }}</p>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{{ event.description }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ event.location }} • {{ selectedShipment.carrier }}</p>
                <p class="text-xs text-orange-500 mt-1 underline decoration-dotted cursor-help">{{ event.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipment Information -->
        <div class="p-3 sm:p-4">
          <div class="flex items-center justify-between gap-2 mb-4">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Informations sur le colis</h4>
            <button class="text-xs sm:text-sm text-orange-500 hover:underline flex-shrink-0">Modifier</button>
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
                  <option value="">Sélectionner un transporteur</option>
                  <option v-for="carrier in deliveryCarriers" :key="carrier.id" :value="carrier.name">
                    {{ carrier.name }}
                  </option>
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
            <!-- Section 0: Sélection du transporteur -->
            <div v-if="!editingCarrier" class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800/30">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <Truck class="w-4 h-4 mr-2 text-orange-500" />
                Choisir un transporteur
              </h4>

              <!-- Search input -->
              <div class="relative mb-4">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  v-model="modalCarrierSearchQuery"
                  type="text"
                  placeholder="Rechercher parmi 65+ transporteurs tunisiens..."
                  class="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <span v-if="modalCarrierSearchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {{ filteredModalCarriers.length }} résultats
                </span>
              </div>

              <!-- Carrier selection grid -->
              <div class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    v-for="carrier in filteredModalCarriers"
                    :key="carrier.id"
                    type="button"
                    @click="selectCarrierFromList(carrier)"
                    :class="[
                      'p-2 rounded-lg border-2 text-left transition-all hover:shadow-sm',
                      selectedModalCarrier?.id === carrier.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                        : 'border-gray-100 dark:border-gray-700 hover:border-orange-300'
                    ]"
                  >
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" :style="{ backgroundColor: carrier.color + '20', color: carrier.color }">
                        {{ getCarrierInitials(carrier.name) }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-medium text-gray-900 dark:text-white text-xs truncate">{{ carrier.name }}</p>
                        <p class="text-[10px] text-gray-500">{{ carrier.deliveryTime }}</p>
                      </div>
                    </div>
                  </button>
                </div>
                <p v-if="filteredModalCarriers.length === 0" class="text-center text-sm text-gray-500 py-4">Aucun transporteur trouvé</p>
              </div>

              <p v-if="selectedModalCarrier" class="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle class="w-4 h-4" />
                {{ selectedModalCarrier.name }} sélectionné
              </p>
            </div>

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
                  <input v-model="newCarrier.name" type="text" placeholder="Ex: Aramex, DHL, etc." class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" :class="selectedModalCarrier ? 'bg-gray-100 dark:bg-gray-700' : ''" :readonly="!!selectedModalCarrier" />
                  <p v-if="selectedModalCarrier" class="text-xs text-gray-500 mt-1">Nom auto-rempli depuis la sélection ci-dessus</p>
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
                  class="flex items-center space-x-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white text-sm font-medium rounded-lg transition-colors"
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
                    class="px-4 py-2 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                  class="flex items-center space-x-2 px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus class="w-4 h-4" />
                  <span>Ajouter un transporteur</span>
                </button>
              </div>

              <!-- Carrier Selection -->
              <div v-if="showAddCarrierForm" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sélectionner un transporteur</h5>

                <!-- Search input for carriers -->
                <div class="relative mb-4">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="orgCarrierSearchQuery"
                    type="text"
                    placeholder="Rechercher un transporteur..."
                    class="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <span v-if="orgCarrierSearchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {{ filteredAvailableCarriers.length }} résultats
                  </span>
                </div>

                <!-- Scrollable carrier grid -->
                <div class="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <button
                      v-for="carrier in filteredAvailableCarriers"
                      :key="carrier.id"
                      @click="selectCarrierToAdd(carrier)"
                      class="p-3 border-2 rounded-xl text-left transition-all hover:border-orange-300"
                      :class="selectedCarrierToAdd?.id === carrier.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'"
                    >
                      <div class="flex items-center space-x-2">
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" :style="{ backgroundColor: carrier.bgColor, color: carrier.color }">
                          {{ getCarrierInitials(carrier.name) }}
                        </div>
                        <div class="min-w-0">
                          <p class="font-medium text-gray-900 dark:text-white text-xs truncate">{{ carrier.name }}</p>
                          <p class="text-[10px] text-gray-500">{{ carrier.deliveryTime }}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                  <p v-if="filteredAvailableCarriers.length === 0" class="text-center text-sm text-gray-500 py-6">Aucun transporteur trouvé</p>
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
                    class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
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
              class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg transition-colors"
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
                ? 'bg-[#4959b4] hover:bg-[#3a4791]'
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

  <!-- Global Search Modal (Notion-style Command Palette) -->
  <Teleport to="body">
    <Transition name="search-modal">
      <div v-if="showGlobalSearch" class="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" @click.self="closeGlobalSearch">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeGlobalSearch"></div>

        <!-- Search Modal -->
        <div class="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <Search class="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref="globalSearchInput"
              v-model="globalSearchQuery"
              type="text"
              placeholder="Rechercher un colis, client, numéro de suivi..."
              class="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-base"
              @keydown.down.prevent="navigateSearchResults(1)"
              @keydown.up.prevent="navigateSearchResults(-1)"
              @keydown.enter.prevent="selectSearchResult"
              @keydown.escape="closeGlobalSearch"
            />
            <kbd class="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">ESC</kbd>
          </div>

          <!-- Search Results -->
          <div class="max-h-[400px] overflow-y-auto">
            <!-- Empty State / Suggestions -->
            <div v-if="!globalSearchQuery" class="p-2">
              <p class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recherche rapide</p>
              <div class="space-y-1">
                <button
                  v-for="(suggestion, idx) in searchSuggestions"
                  :key="suggestion.type"
                  @click="applySearchSuggestion(suggestion)"
                  :class="[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    selectedSearchIndex === idx ? 'bg-[#4959b4] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  ]"
                >
                  <component :is="suggestion.icon" :class="['w-4 h-4', selectedSearchIndex === idx ? 'text-white' : 'text-gray-400']" />
                  <div class="flex-1 min-w-0">
                    <p :class="['text-sm font-medium', selectedSearchIndex === idx ? 'text-white' : 'text-gray-900 dark:text-white']">{{ suggestion.label }}</p>
                    <p :class="['text-xs', selectedSearchIndex === idx ? 'text-white/70' : 'text-gray-500']">{{ suggestion.hint }}</p>
                  </div>
                </button>
              </div>

              <!-- Recent Searches -->
              <div v-if="recentSearches.length > 0" class="mt-4">
                <p class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recherches récentes</p>
                <div class="space-y-1">
                  <button
                    v-for="recent in recentSearches"
                    :key="recent"
                    @click="globalSearchQuery = recent"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <History class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ recent }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Search Results -->
            <div v-else class="p-2">
              <!-- Results -->
              <div v-if="globalSearchResults.length > 0">
                <p class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {{ globalSearchResults.length }} résultat{{ globalSearchResults.length > 1 ? 's' : '' }}
                </p>
                <div class="space-y-1">
                  <button
                    v-for="(result, idx) in globalSearchResults"
                    :key="result.id"
                    @click="openSearchResult(result)"
                    :class="[
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors',
                      selectedSearchIndex === idx ? 'bg-[#4959b4] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    ]"
                  >
                    <div :class="[
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      selectedSearchIndex === idx ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                    ]">
                      <Package :class="['w-5 h-5', selectedSearchIndex === idx ? 'text-white' : 'text-gray-500']" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p :class="['text-sm font-semibold font-mono', selectedSearchIndex === idx ? 'text-white' : 'text-gray-900 dark:text-white']">
                          {{ result.trackingNumber }}
                        </p>
                        <span :class="[
                          'px-1.5 py-0.5 text-xs rounded-full font-medium',
                          selectedSearchIndex === idx ? 'bg-white/20 text-white' :
                          result.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          result.status === 'Out for delivery' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          result.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600'
                        ]">
                          {{ result.status === 'Delivered' ? 'Livré' : result.status === 'Out for delivery' ? 'En livraison' : result.status === 'Pending' ? 'En attente' : result.status }}
                        </span>
                      </div>
                      <p :class="['text-xs mt-0.5 truncate', selectedSearchIndex === idx ? 'text-white/70' : 'text-gray-500']">
                        {{ result.recipient }} • {{ result.recipientAddress }}
                      </p>
                    </div>
                    <div :class="['text-right flex-shrink-0', selectedSearchIndex === idx ? 'text-white/70' : 'text-gray-400']">
                      <p class="text-xs">{{ result.carrier }}</p>
                      <p class="text-xs font-medium">{{ result.amount }} TND</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- No Results -->
              <div v-else class="py-12 text-center">
                <SearchX class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">Aucun résultat pour "{{ globalSearchQuery }}"</p>
                <p class="text-sm text-gray-400 mt-1">Essayez un numéro de suivi, nom de client ou téléphone</p>
              </div>

              <!-- View All Results Button -->
              <div v-if="globalSearchQuery && globalSearchResults.length > 0" class="px-3 pb-2">
                <button
                  @click="openSearchResultsPage"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4959b4] hover:bg-[#3d4a9e] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink class="w-4 h-4" />
                  Voir tous les résultats
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">↑</kbd>
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">↓</kbd>
                <span class="ml-1">Naviguer</span>
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">↵</kbd>
                <span class="ml-1">Ouvrir</span>
              </span>
            </div>
            <span class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">ESC</kbd>
              <span class="ml-1">Fermer</span>
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Bulk Import Modal -->
  <Teleport to="body">
    <div v-if="showBulkImportModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="showBulkImportModal = false"></div>
      <div class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Importer des colis</h2>
          <button @click="showBulkImportModal = false" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div class="p-6">
          <!-- Tabs -->
          <div class="flex gap-2 mb-6">
            <button
              @click="bulkImportTab = 'excel'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                bulkImportTab === 'excel' ? 'bg-[#4959b4] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
            >
              <FileSpreadsheet class="w-5 h-5" />
              Importer Excel
            </button>
            <button
              @click="bulkImportTab = 'manual'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                bulkImportTab === 'manual' ? 'bg-[#4959b4] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
            >
              <Plus class="w-5 h-5" />
              Création multiple
            </button>
          </div>

          <!-- Excel Import Tab -->
          <div v-if="bulkImportTab === 'excel'">
            <!-- Drop Zone -->
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              :class="[
                'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                isDragging ? 'border-[#4959b4] bg-[#4959b4]/5' : 'border-gray-300 dark:border-gray-700 hover:border-[#4959b4]'
              ]"
              @click="fileInput?.click()"
            >
              <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleFileSelect" />
              <Upload :class="['w-12 h-12 mx-auto mb-4', isDragging ? 'text-[#4959b4]' : 'text-gray-400']" />
              <p class="text-gray-900 dark:text-white font-medium mb-1">
                Glissez votre fichier ici ou <span class="text-[#4959b4]">parcourir</span>
              </p>
              <p class="text-sm text-gray-500">Formats acceptés: Excel (.xlsx, .xls) ou CSV</p>
            </div>

            <!-- Template Download -->
            <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-between">
              <div class="flex items-center gap-3">
                <FileSpreadsheet class="w-8 h-8 text-green-600" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">Télécharger le modèle</p>
                  <p class="text-xs text-gray-500">Utilisez notre modèle pour un import facile</p>
                </div>
              </div>
              <button @click="downloadImportTemplate" class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                <Download class="w-4 h-4" />
                Télécharger
              </button>
            </div>

            <!-- Imported File Preview -->
            <div v-if="importedFile" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                  <div>
                    <p class="text-sm font-medium text-green-800 dark:text-green-200">{{ importedFile.name }}</p>
                    <p class="text-xs text-green-600 dark:text-green-400">{{ importedFileRows }} colis détectés</p>
                  </div>
                </div>
                <button @click="importedFile = null" class="text-green-600 hover:text-green-700">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Manual Multi-Creation Tab -->
          <div v-if="bulkImportTab === 'manual'" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600 dark:text-gray-400">Ajoutez plusieurs colis rapidement</p>
              <button @click="addBulkShipmentRow" class="text-sm text-[#4959b4] hover:underline flex items-center gap-1">
                <Plus class="w-4 h-4" />
                Ajouter une ligne
              </button>
            </div>

            <!-- Shipment Rows -->
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div v-for="(row, index) in bulkShipmentRows" :key="index" class="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span class="text-xs font-medium text-gray-400 mt-2 w-4">{{ index + 1 }}</span>
                <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input v-model="row.recipient" type="text" placeholder="Destinataire" class="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm" />
                  <input v-model="row.phone" type="text" placeholder="Téléphone" class="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm" />
                  <input v-model="row.address" type="text" placeholder="Adresse" class="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm" />
                  <input v-model="row.amount" type="number" placeholder="Montant" class="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm" />
                </div>
                <button @click="removeBulkShipmentRow(index)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 mt-1">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <p class="text-xs text-gray-500 text-center">{{ bulkShipmentRows.filter(r => r.recipient && r.phone).length }} colis prêts à créer</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
          <button @click="showBulkImportModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            Annuler
          </button>
          <button
            @click="processBulkImport"
            :disabled="bulkImportTab === 'excel' ? !importedFile : bulkShipmentRows.filter(r => r.recipient && r.phone).length === 0"
            class="px-4 py-2 bg-[#4959b4] hover:bg-[#3a4791] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Upload class="w-4 h-4" />
            {{ bulkImportTab === 'excel' ? 'Importer' : 'Créer les colis' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Pickup Detail Modal -->
  <Teleport to="body">
    <div v-if="showPickupDetailModal && selectedPickupDetail" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="closePickupDetail"></div>
      <div class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Détails de l'enlèvement</h2>
            <p class="text-sm text-gray-500">{{ selectedPickupDetail.id }}</p>
          </div>
          <button @click="closePickupDetail" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto flex-1">
          <!-- Pickup Info -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">Date</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedPickupDetail.date }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">Créneau</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedPickupDetail.timeSlot }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">Transporteur</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedPickupDetail.carrier }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">Statut</p>
              <span :class="[
                'inline-flex px-2 py-0.5 text-xs rounded-full font-medium',
                selectedPickupDetail.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                selectedPickupDetail.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                selectedPickupDetail.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              ]">
                {{ selectedPickupDetail.status === 'confirmed' ? 'Confirmée' : selectedPickupDetail.status === 'pending' ? 'En attente' : selectedPickupDetail.status === 'completed' ? 'Terminé' : 'Annulée' }}
              </span>
            </div>
          </div>

          <!-- Delivery/Return Summary for completed pickups -->
          <div v-if="selectedPickupDetail.status === 'completed' && (selectedPickupDetail.deliveredCount !== undefined || selectedPickupDetail.returnedCount !== undefined)" class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-green-700 dark:text-green-400">{{ selectedPickupDetail.deliveredCount || 0 }}</p>
                  <p class="text-sm text-green-600 dark:text-green-500">Livrés</p>
                </div>
              </div>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <RotateCcw class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-red-700 dark:text-red-400">{{ selectedPickupDetail.returnedCount || 0 }}</p>
                  <p class="text-sm text-red-600 dark:text-red-500">Retournés</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div v-if="selectedPickupDetail.address" class="mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div class="flex items-center gap-2 text-gray-500 mb-1">
              <MapPin class="w-4 h-4" />
              <span class="text-xs">Adresse d'enlèvement</span>
            </div>
            <p class="font-medium text-gray-900 dark:text-white">{{ selectedPickupDetail.address }}</p>
          </div>

          <!-- Shipments List -->
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Package class="w-4 h-4" />
              Colis inclus ({{ selectedPickupDetail.shipments?.length || 0 }})
            </h3>

            <div v-if="selectedPickupDetail.shipments?.length > 0" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Suivi</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destinataire</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Statut</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="shipment in selectedPickupDetail.shipments" :key="shipment.trackingNumber" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td class="px-4 py-3">
                      <span class="font-mono text-sm text-gray-900 dark:text-white">{{ shipment.trackingNumber }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ shipment.recipient }}</p>
                      <p class="text-xs text-gray-500 truncate max-w-[150px]">{{ shipment.address }}</p>
                    </td>
                    <td class="px-4 py-3 hidden sm:table-cell">
                      <div v-if="shipment.status === 'Delivered'" class="flex flex-col">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium w-fit">
                          <CheckCircle class="w-3 h-3" />
                          Livré
                        </span>
                        <span v-if="shipment.deliveredAt" class="text-xs text-gray-400 mt-1">{{ shipment.deliveredAt }}</span>
                      </div>
                      <div v-else-if="shipment.status === 'Returned'" class="flex flex-col">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-medium w-fit">
                          <RotateCcw class="w-3 h-3" />
                          Retourné
                        </span>
                        <span v-if="shipment.returnReason" class="text-xs text-red-500 mt-1">{{ shipment.returnReason }}</span>
                      </div>
                      <span v-else class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium">
                        {{ shipment.status || 'En cours' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <span :class="[
                        'text-sm font-medium',
                        shipment.status === 'Returned' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'
                      ]">{{ shipment.amount }} TND</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <td colspan="2" class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total encaissé
                    </td>
                    <td class="px-4 py-3 hidden sm:table-cell text-xs text-gray-500">
                      ({{ selectedPickupDetail.shipments.filter((s: any) => s.status === 'Delivered').length }} livrés)
                    </td>
                    <td class="px-4 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                      {{ selectedPickupDetail.shipments.filter((s: any) => s.status === 'Delivered').reduce((sum: number, s: any) => sum + (s.amount || 0), 0) }} TND
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div v-else class="p-8 text-center border border-gray-200 dark:border-gray-700 rounded-lg">
              <Package class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500">Aucun colis dans cet enlèvement</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
          <button @click="closePickupDetail" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            Fermer
          </button>
          <button v-if="selectedPickupDetail.status === 'pending'" class="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium">
            Annuler l'enlèvement
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Charge Account Modal - Billing & Credit -->
  <Teleport to="body">
    <div v-if="showChargeAccountModal && selectedUserForCharge" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="closeChargeModal"></div>
      <div class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Gestion du compte</h2>
            <p class="text-sm text-gray-500">{{ selectedUserForCharge.name }} - {{ selectedUserForCharge.company }}</p>
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
              Créditer (Paiement)
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
              Facturer (Débit)
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
                  selectedUserForCharge.balance > 0 ? 'text-green-600' : selectedUserForCharge.balance < 0 ? 'text-red-600' : 'text-gray-500'
                ]">
                  {{ selectedUserForCharge.balance >= 0 ? '+' : '' }}{{ selectedUserForCharge.balance.toFixed(2) }} TND
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <Wallet class="w-6 h-6 text-[#4959b4]" />
              </div>
            </div>
          </div>

          <!-- CREDIT MODE: Purchase colis credits -->
          <template v-if="chargeMode === 'credit'">
            <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Banknote class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 class="text-sm font-medium text-green-800 dark:text-green-300">Achat de crédits colis</h3>
                  <p class="text-xs text-green-600 dark:text-green-400 mt-1">Entrez le nombre de colis livrés et retour achetés par le client</p>
                </div>
              </div>
            </div>

            <!-- Current Credits -->
            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Crédits actuels</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <p class="text-2xl font-bold text-green-600">{{ selectedUserForCharge.deliveredCount || 0 }}</p>
                  <p class="text-xs text-gray-500">Colis Livrés</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-orange-600">{{ selectedUserForCharge.returnedCount || 0 }}</p>
                  <p class="text-xs text-gray-500">Colis Retour</p>
                </div>
              </div>
            </div>

            <!-- Purchase Quantities -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quantité à acheter</h3>
              <div class="grid grid-cols-2 gap-4">
                <!-- Delivered Credits -->
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
                    class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg text-lg font-semibold text-center text-green-700 dark:text-green-400"
                  />
                  <p class="text-xs text-green-600 mt-2 text-center">{{ deliveryFees.delivered.toFixed(2) }} TND / colis</p>
                </div>
                <!-- Returned Credits -->
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
                    class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 rounded-lg text-lg font-semibold text-center text-orange-700 dark:text-orange-400"
                  />
                  <p class="text-xs text-orange-600 mt-2 text-center">{{ deliveryFees.returned.toFixed(2) }} TND / colis</p>
                </div>
              </div>
            </div>

            <!-- Total to Pay -->
            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Récapitulatif</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ purchaseDelivered || 0 }} colis livrés × {{ deliveryFees.delivered.toFixed(2) }} TND</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ ((purchaseDelivered || 0) * deliveryFees.delivered).toFixed(2) }} TND</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ purchaseReturned || 0 }} colis retour × {{ deliveryFees.returned.toFixed(2) }} TND</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ ((purchaseReturned || 0) * deliveryFees.returned).toFixed(2) }} TND</span>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-900 dark:text-white">Total à payer</span>
                    <span class="text-lg font-bold text-green-600">{{ calculateCreditTotal.toFixed(2) }} TND</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode de paiement</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="paymentMethod = 'cash'"
                  :class="[
                    'py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                    paymentMethod === 'cash'
                      ? 'bg-[#4959b4] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  <Banknote class="w-4 h-4" />
                  Espèces
                </button>
                <button
                  @click="paymentMethod = 'transfer'"
                  :class="[
                    'py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                    paymentMethod === 'transfer'
                      ? 'bg-[#4959b4] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  <Building2 class="w-4 h-4" />
                  Virement
                </button>
                <button
                  @click="paymentMethod = 'cheque'"
                  :class="[
                    'py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                    paymentMethod === 'cheque'
                      ? 'bg-[#4959b4] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  ]"
                >
                  <FileText class="w-4 h-4" />
                  Chèque
                </button>
              </div>
            </div>

            <!-- Note -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note (optionnel)</label>
              <textarea
                v-model="chargeNote"
                rows="2"
                placeholder="Référence du paiement, numéro de chèque..."
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
              ></textarea>
            </div>

            <!-- New Credits Preview -->
            <div v-if="calculateCreditTotal > 0" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-700 dark:text-green-300 mb-2">Nouveaux crédits après achat:</p>
              <div class="flex items-center justify-around">
                <div class="text-center">
                  <span class="text-lg font-bold text-green-600">{{ (selectedUserForCharge.deliveredCount || 0) + (purchaseDelivered || 0) }}</span>
                  <span class="text-xs text-gray-500 ml-1">Livrés</span>
                </div>
                <div class="text-center">
                  <span class="text-lg font-bold text-orange-600">{{ (selectedUserForCharge.returnedCount || 0) + (purchaseReturned || 0) }}</span>
                  <span class="text-xs text-gray-500 ml-1">Retour</span>
                </div>
              </div>
            </div>
          </template>

          <!-- DEBIT MODE: Shipment-based billing -->
          <template v-else>
            <!-- Unbilled Shipments Info -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Colis non facturés</h3>
              <div class="grid grid-cols-2 gap-4">
                <!-- Delivered -->
                <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <Package class="w-5 h-5 text-green-600" />
                    <span class="text-sm font-medium text-green-700 dark:text-green-400">Colis Livrés</span>
                  </div>
                  <p class="text-3xl font-bold text-green-700 dark:text-green-400">{{ selectedUserForCharge.unbilledDelivered }}</p>
                  <p class="text-xs text-green-600 mt-1">{{ deliveryFees.delivered.toFixed(2) }} TND / colis</p>
                </div>
                <!-- Returned -->
                <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <RotateCcw class="w-5 h-5 text-red-600" />
                    <span class="text-sm font-medium text-red-700 dark:text-red-400">Colis Retour</span>
                  </div>
                  <p class="text-3xl font-bold text-red-700 dark:text-red-400">{{ selectedUserForCharge.unbilledReturned }}</p>
                  <p class="text-xs text-red-600 mt-1">{{ deliveryFees.returned.toFixed(2) }} TND / colis</p>
                </div>
              </div>
            </div>

            <!-- Fee Breakdown -->
            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Détail des frais</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ selectedUserForCharge.unbilledDelivered }} colis livrés × {{ deliveryFees.delivered.toFixed(2) }} TND</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ (selectedUserForCharge.unbilledDelivered * deliveryFees.delivered).toFixed(2) }} TND</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ selectedUserForCharge.unbilledReturned }} colis retour × {{ deliveryFees.returned.toFixed(2) }} TND</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ (selectedUserForCharge.unbilledReturned * deliveryFees.returned).toFixed(2) }} TND</span>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-gray-900 dark:text-white">Total à débiter</span>
                    <span class="text-lg font-bold text-red-600">{{ calculateChargeTotal.toFixed(2) }} TND</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Note -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note (optionnel)</label>
              <textarea
                v-model="chargeNote"
                rows="2"
                placeholder="Raison de l'opération..."
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
              ></textarea>
            </div>

            <!-- New Balance Preview -->
            <div v-if="calculateChargeTotal > 0" class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                Nouveau solde après facturation:
                <span class="font-semibold">
                  {{ (selectedUserForCharge.balance - calculateChargeTotal).toFixed(2) }} TND
                </span>
              </p>
            </div>

            <!-- No Shipments Warning -->
            <div v-if="calculateChargeTotal === 0" class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p class="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4" />
                Aucun colis non facturé pour ce client
              </p>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
          <button @click="closeChargeModal" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            Annuler
          </button>
          <!-- Credit Button -->
          <button
            v-if="chargeMode === 'credit'"
            @click="processAccountCredit"
            :disabled="calculateCreditTotal <= 0"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white',
              calculateCreditTotal <= 0 && 'opacity-50 cursor-not-allowed'
            ]"
          >
            <Plus class="w-4 h-4" />
            Créditer {{ calculateCreditTotal.toFixed(2) }} TND
          </button>
          <!-- Debit Button -->
          <button
            v-else
            @click="processAccountCharge"
            :disabled="calculateChargeTotal === 0"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white',
              calculateChargeTotal === 0 && 'opacity-50 cursor-not-allowed'
            ]"
          >
            <Minus class="w-4 h-4" />
            Facturer {{ calculateChargeTotal.toFixed(2) }} TND
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, reactive, markRaw, watch, onMounted, onUnmounted, nextTick } from 'vue'
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
  Minus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowRight,
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
  ArrowLeft,
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
  LogOut,
  Menu,
  ListFilter,
  Trash2,
  Save,
  Monitor
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  shipmentsService,
  clientsService,
  boutiquesService,
  carriersService,
  pickupsService,
  transactionsService
} from '@/services'

const router = useRouter()
const authStore = useAuthStore()

// Loading state
const isLoadingData = ref(false)

function handleLogout() {
  authStore.signOut()
  router.push('/signin')
}

// Admin role check - uses auth store's isPlatformAdmin
const isAdmin = computed(() => authStore.isPlatformAdmin)

// Main section state with persistence
const savedMainSection = localStorage.getItem('deliveryTracker_mainSection')
const savedActiveSection = localStorage.getItem('deliveryTracker_activeSection')
const mainSection = ref(savedMainSection || 'dashboard')
const activeSection = ref(savedActiveSection || 'overview')

// Filtered navigation - hides admin section for non-admin users
const filteredMainNavigation = computed(() => {
  if (isAdmin.value) {
    return mainNavigation
  }
  return mainNavigation.filter(item => item.id !== 'administration')
})

// Mobile menu state
const sidebarOpen = ref(false)
const subMenuOpen = ref(false)

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

const boutiques = ref<Boutique[]>([])

// User balance for package credits - starts at 0 for new accounts
const userBalance = ref({
  delivered: 0,
  returned: 0
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

// Standard config fields for delivery carriers
const standardConfigFields: CarrierConfigField[] = [
  { key: 'apiKey', label: 'Clé API', type: 'password', placeholder: 'Votre clé API', required: true },
  { key: 'accountId', label: 'ID Compte', type: 'text', placeholder: 'Identifiant de compte', required: true },
  { key: 'secretKey', label: 'Clé secrète', type: 'password', placeholder: 'Clé secrète', required: false },
]

const deliveryCarriers: DeliveryCarrier[] = [
  // A
  { id: 'abm', name: 'ABM', description: 'Service de livraison ABM', type: 'standard', deliveryTime: '24-48h', color: '#1E40AF', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'afex', name: 'Afex', description: 'Livraison express Afex', type: 'express', deliveryTime: '24h', color: '#DC2626', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'aramex', name: 'Aramex', description: 'Livraison express internationale', type: 'express', deliveryTime: '24-48h', color: '#E31837', bgColor: '#FEE2E2', configFields: [
    { key: 'accountNumber', label: 'Numéro de compte', type: 'text', placeholder: 'Votre numéro de compte Aramex', required: true },
    { key: 'username', label: 'Nom d\'utilisateur API', type: 'text', placeholder: 'Username', required: true },
    { key: 'password', label: 'Mot de passe API', type: 'password', placeholder: '••••••••', required: true },
    { key: 'accountPin', label: 'Code PIN', type: 'password', placeholder: 'PIN à 4 chiffres', required: true },
  ]},
  { id: 'aurex', name: 'Aurex', description: 'Livraison Aurex Tunisie', type: 'express', deliveryTime: '24-48h', color: '#F59E0B', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'axess-logistique', name: 'Axess Logistique', description: 'Solutions logistiques Axess', type: 'standard', deliveryTime: '48-72h', color: '#0891B2', bgColor: '#CFFAFE', configFields: standardConfigFields },

  // B
  { id: 'b2c-delivery', name: 'B2C Delivery', description: 'Livraison B2C spécialisée', type: 'standard', deliveryTime: '24-48h', color: '#7C3AED', bgColor: '#EDE9FE', configFields: standardConfigFields },
  { id: 'best-delivery', name: 'Best Delivery', description: 'Service de livraison Best', type: 'express', deliveryTime: '24h', color: '#059669', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'bestway', name: 'Bestway', description: 'Livraison Bestway', type: 'standard', deliveryTime: '24-48h', color: '#2563EB', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'bigboss', name: 'Bigboss', description: 'Livraison rapide Bigboss', type: 'express', deliveryTime: '24h', color: '#DC2626', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'bonjour-express', name: 'Bonjour Express', description: 'Service express Bonjour', type: 'express', deliveryTime: '24h', color: '#F97316', bgColor: '#FFEDD5', configFields: standardConfigFields },
  { id: 'bouguerra-delivery', name: 'Bouguerra Delivery', description: 'Livraison Bouguerra', type: 'standard', deliveryTime: '24-48h', color: '#84CC16', bgColor: '#ECFCCB', configFields: standardConfigFields },

  // C
  { id: 'calirex-tunisie', name: 'Calirex Tunisie', description: 'Service Calirex Tunisie', type: 'standard', deliveryTime: '48-72h', color: '#0D9488', bgColor: '#CCFBF1', configFields: standardConfigFields },
  { id: 'ciblex-express', name: 'Ciblex Express', description: 'Livraison express Ciblex', type: 'express', deliveryTime: '24h', color: '#6366F1', bgColor: '#E0E7FF', configFields: standardConfigFields },
  { id: 'colis-express', name: 'Colis Express', description: 'Service Colis Express', type: 'express', deliveryTime: '24h', color: '#EC4899', bgColor: '#FCE7F3', configFields: standardConfigFields },
  { id: 'colissimo', name: 'Colissimo', description: 'Service postal Colissimo', type: 'standard', deliveryTime: '48-72h', color: '#FFB800', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'cosmos', name: 'Cosmos', description: 'Livraison Cosmos', type: 'standard', deliveryTime: '24-48h', color: '#8B5CF6', bgColor: '#EDE9FE', configFields: standardConfigFields },

  // D
  { id: 'delivery-x', name: 'Delivery X', description: 'Service Delivery X', type: 'express', deliveryTime: '24h', color: '#1F2937', bgColor: '#F3F4F6', configFields: standardConfigFields },
  { id: 'dropo', name: 'Dropo', description: 'Livraison Dropo', type: 'standard', deliveryTime: '24-48h', color: '#10B981', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'droppex', name: 'Droppex', description: 'Service Droppex', type: 'standard', deliveryTime: '24-48h', color: '#3B82F6', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'dsgo', name: 'DSGO', description: 'Livraison DSGO', type: 'standard', deliveryTime: '48-72h', color: '#14B8A6', bgColor: '#CCFBF1', configFields: standardConfigFields },

  // E
  { id: 'ecomness', name: 'Ecomness', description: 'Solutions e-commerce Ecomness', type: 'standard', deliveryTime: '24-48h', color: '#A855F7', bgColor: '#F3E8FF', configFields: standardConfigFields },
  { id: 'essedik-smart', name: 'Essedik Smart Delivery', description: 'Livraison intelligente Essedik', type: 'express', deliveryTime: '24h', color: '#0EA5E9', bgColor: '#E0F2FE', configFields: standardConfigFields },

  // F
  { id: 'fakroun-express', name: 'FakrounExpress', description: 'Express Fakroun', type: 'express', deliveryTime: '24h', color: '#EF4444', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'fasthault', name: 'FastHaul', description: 'Service rapide FastHaul', type: 'express', deliveryTime: '24h', color: '#F59E0B', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'fasty', name: 'Fasty', description: 'Livraison ultra-rapide Fasty', type: 'express', deliveryTime: '24h', color: '#22C55E', bgColor: '#DCFCE7', configFields: standardConfigFields },
  { id: 'fiabilo', name: 'Fiabilo', description: 'Service fiable Fiabilo', type: 'standard', deliveryTime: '24-48h', color: '#6366F1', bgColor: '#E0E7FF', configFields: standardConfigFields },
  { id: 'first', name: 'First', description: 'Livraison First', type: 'express', deliveryTime: '24h', color: '#1D4ED8', bgColor: '#DBEAFE', configFields: standardConfigFields },

  // G
  { id: 'goodex', name: 'Goodex', description: 'Service Goodex', type: 'standard', deliveryTime: '24-48h', color: '#16A34A', bgColor: '#DCFCE7', configFields: standardConfigFields },

  // H
  { id: 'high-delivery', name: 'High Delivery', description: 'Livraison premium High', type: 'express', deliveryTime: '24h', color: '#7C3AED', bgColor: '#EDE9FE', configFields: standardConfigFields },

  // I
  { id: 'instaia-delivery', name: 'Instaia Delivery', description: 'Livraison instantanée Instaia', type: 'express', deliveryTime: '24h', color: '#E11D48', bgColor: '#FFE4E6', configFields: standardConfigFields },
  { id: 'intigo', name: 'Intigo', description: 'Service Intigo', type: 'standard', deliveryTime: '24-48h', color: '#0891B2', bgColor: '#CFFAFE', configFields: standardConfigFields },

  // J
  { id: 'jax', name: 'JAx', description: 'Livraison JAx', type: 'express', deliveryTime: '24h', color: '#DC2626', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'jetpack', name: 'JetPack', description: 'Livraison rapide JetPack', type: 'express', deliveryTime: '24h', color: '#2563EB', bgColor: '#DBEAFE', configFields: standardConfigFields },

  // K
  { id: 'kadex-delivery', name: 'Kadex Delivery', description: 'Service Kadex', type: 'standard', deliveryTime: '24-48h', color: '#059669', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'kamatchou', name: 'Kamatchou Services', description: 'Services Kamatchou', type: 'standard', deliveryTime: '48-72h', color: '#F97316', bgColor: '#FFEDD5', configFields: standardConfigFields },

  // L
  { id: 'la-zajella', name: 'La Zajella', description: 'Livraison La Zajella', type: 'standard', deliveryTime: '24-48h', color: '#8B5CF6', bgColor: '#EDE9FE', configFields: standardConfigFields },
  { id: 'larim-delivery', name: 'Larim Delivery', description: 'Service Larim', type: 'standard', deliveryTime: '24-48h', color: '#10B981', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'light-speed', name: 'Light Speed Delivery', description: 'Livraison ultra-rapide', type: 'express', deliveryTime: '24h', color: '#FBBF24', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'livra-lynx', name: 'Livra Lynx', description: 'Livraison rapide Lynx', type: 'express', deliveryTime: '24h', color: '#F59E0B', bgColor: '#FEF3C7', configFields: standardConfigFields },
  { id: 'login', name: 'Login', description: 'Service Login', type: 'standard', deliveryTime: '24-48h', color: '#3B82F6', bgColor: '#DBEAFE', configFields: standardConfigFields },

  // M
  { id: 'macropost', name: 'Macropost', description: 'Service postal Macropost', type: 'standard', deliveryTime: '48-72h', color: '#0D9488', bgColor: '#CCFBF1', configFields: standardConfigFields },
  { id: 'massar', name: 'Massar', description: 'Livraison Massar', type: 'standard', deliveryTime: '24-48h', color: '#6366F1', bgColor: '#E0E7FF', configFields: standardConfigFields },
  { id: 'may-m', name: 'May M', description: 'Service May M', type: 'standard', deliveryTime: '24-48h', color: '#EC4899', bgColor: '#FCE7F3', configFields: standardConfigFields },
  { id: 'mescolis-express', name: 'MesColis Express', description: 'Service express MesColis', type: 'express', deliveryTime: '24h', color: '#1E40AF', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'my-colis', name: 'My Colis', description: 'Service My Colis', type: 'standard', deliveryTime: '24-48h', color: '#7C3AED', bgColor: '#EDE9FE', configFields: standardConfigFields },
  { id: 'mylerz', name: 'Mylerz', description: 'Livraison Mylerz', type: 'express', deliveryTime: '24h', color: '#2DD4BF', bgColor: '#CCFBF1', configFields: standardConfigFields },
  { id: 'mz-logistic', name: 'MZ Logistic', description: 'Solutions logistiques MZ', type: 'standard', deliveryTime: '48-72h', color: '#0EA5E9', bgColor: '#E0F2FE', configFields: standardConfigFields },

  // N
  { id: 'navex', name: 'Navex', description: 'Livraison Navex', type: 'express', deliveryTime: '24h', color: '#14B8A6', bgColor: '#CCFBF1', configFields: standardConfigFields },

  // O
  { id: 'oclock-delivery', name: 'Oclock Delivery', description: 'Livraison ponctuelle Oclock', type: 'express', deliveryTime: '24h', color: '#1D4ED8', bgColor: '#DBEAFE', configFields: standardConfigFields },
  { id: 'onesta', name: 'Onesta', description: 'Service Onesta', type: 'standard', deliveryTime: '24-48h', color: '#059669', bgColor: '#D1FAE5', configFields: standardConfigFields },
  { id: 'oppa', name: 'Oppa', description: 'Livraison Oppa', type: 'standard', deliveryTime: '24-48h', color: '#A855F7', bgColor: '#F3E8FF', configFields: standardConfigFields },

  // Q
  { id: 'qwikpak', name: 'Qwikpak', description: 'Livraison rapide Qwikpak', type: 'express', deliveryTime: '24h', color: '#22C55E', bgColor: '#DCFCE7', configFields: standardConfigFields },

  // R
  { id: 'rapi-colis', name: 'Rapi Colis', description: 'Service rapide Rapi Colis', type: 'express', deliveryTime: '24h', color: '#EF4444', bgColor: '#FEE2E2', configFields: standardConfigFields },

  // S
  { id: 'safexpress', name: 'SafExpress', description: 'Livraison sécurisée SafExpress', type: 'express', deliveryTime: '24h', color: '#0891B2', bgColor: '#CFFAFE', configFields: standardConfigFields },
  { id: 'sari', name: 'Sari', description: 'Service Sari', type: 'standard', deliveryTime: '24-48h', color: '#8B5CF6', bgColor: '#EDE9FE', configFields: standardConfigFields },
  { id: 'sellmax', name: 'Sellmax', description: 'Livraison Sellmax', type: 'standard', deliveryTime: '24-48h', color: '#F97316', bgColor: '#FFEDD5', configFields: standardConfigFields },
  { id: 'sendex-delivery', name: 'Sendex Delivery', description: 'Service Sendex', type: 'standard', deliveryTime: '24-48h', color: '#10B981', bgColor: '#D1FAE5', configFields: standardConfigFields },

  // T
  { id: 'tictac-delivery', name: 'Tictac Delivery', description: 'Livraison Tictac', type: 'express', deliveryTime: '24h', color: '#EC4899', bgColor: '#FCE7F3', configFields: standardConfigFields },
  { id: 'tiktak-delivery', name: 'Tiktak Delivery', description: 'Service Tiktak', type: 'express', deliveryTime: '24h', color: '#6366F1', bgColor: '#E0E7FF', configFields: standardConfigFields },
  { id: 'trd-express', name: 'TRD Express', description: 'Express TRD', type: 'express', deliveryTime: '24h', color: '#DC2626', bgColor: '#FEE2E2', configFields: standardConfigFields },
  { id: 'trust', name: 'Trust', description: 'Livraison Trust', type: 'standard', deliveryTime: '24-48h', color: '#2563EB', bgColor: '#DBEAFE', configFields: standardConfigFields },

  // W
  { id: 'wr-delivery', name: 'WR Delivery', description: 'Service WR Delivery', type: 'standard', deliveryTime: '24-48h', color: '#7C3AED', bgColor: '#EDE9FE', configFields: standardConfigFields },

  // X
  { id: 'x-delivery', name: 'X Delivery', description: 'Livraison X Delivery', type: 'express', deliveryTime: '24h', color: '#1F2937', bgColor: '#F3F4F6', configFields: standardConfigFields },

  // Y
  { id: 'youssel', name: 'Youssel', description: 'Service Youssel', type: 'standard', deliveryTime: '24-48h', color: '#16A34A', bgColor: '#DCFCE7', configFields: standardConfigFields },

  // Z
  { id: 'zed-delivery', name: 'Zed Delivery', description: 'Livraison Zed', type: 'standard', deliveryTime: '24-48h', color: '#0D9488', bgColor: '#CCFBF1', configFields: standardConfigFields },
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

// Organization - computed from auth store, with defaults for new users
const organization = computed(() => ({
  name: authStore.organization?.name || authStore.user?.name || 'Mon Organisation',
  email: authStore.organization?.email || authStore.user?.email || '',
  phone: authStore.organization?.phone || '',
  address: authStore.organization?.address || '',
  taxId: authStore.organization?.tax_id || '',
  rcNumber: authStore.organization?.rc_number || ''
}))

// Team members - empty by default, loaded from Supabase
const teamMembers = ref<any[]>([])

// Configured carriers - empty by default
const configuredCarriers = ref<ConfiguredCarrier[]>([])

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

// Organization carrier search
const orgCarrierSearchQuery = ref('')

const filteredAvailableCarriers = computed(() => {
  if (!orgCarrierSearchQuery.value) return availableCarriers.value
  const search = orgCarrierSearchQuery.value.toLowerCase()
  return availableCarriers.value.filter(carrier =>
    carrier.name.toLowerCase().includes(search) ||
    carrier.description.toLowerCase().includes(search)
  )
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
  { id: 'finance', label: 'Finance', icon: markRaw(Wallet) },
  { id: 'analytics', label: 'Analytiques', icon: markRaw(BarChart3) },
  { id: 'administration', label: 'Administration', icon: markRaw(Shield) },
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
  ],
  pickups: [
    { id: 'schedule-pickup', label: 'Planifier enlèvement', icon: markRaw(CalendarClock) },
    { id: 'pickup-requests', label: 'Demandes d\'enlèvement', icon: markRaw(PackageOpen) },
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
  // Close search results page when navigating to a section
  showSearchResultsPage.value = false
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

// Client stats - starts at 0 for new accounts
const clientStats = ref({
  totalClients: 0,
  activeClients: 0,
  newThisMonth: 0,
  deliveryRate: 0,
  totalRevenue: 0
})

// Clients list - empty by default
const clientsList = ref<any[]>([])

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

// Client Colis Data - empty by default
const clientColisData = ref<any[]>([])

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
  performanceScore: 0,
  todayDeliveries: 0,
  todayDelivered: 0,
  successRate: 0,
  lastWeekSuccessRate: 0,
  expectedCOD: 0,
  pendingConfirmations: 0,
  todayOrders: 0,
  yesterdayOrders: 0,
  ordersChange: 0,
  deliveredChange: 0,
  todayReturns: 0,
  returnsChange: 0,
  yesterdayDelivered: 0
})

// Urgent Actions
const urgentActions = ref<any[]>([])

// Weather Regions
const weatherRegions = ref<any[]>([])

// Today Stats
const todayStats = reactive({
  toConfirm: 0,
  inDelivery: 0,
  delivered: 0,
  toPrint: 0
})

// Orders to Confirm
const ordersToConfirm = ref<any[]>([])

// Delivery Timeline Data
const deliveryTimelineData = ref<any[]>([])

// Today's Shipments List
const todayShipmentsList = ref<any[]>([])

// ==================== DAILY TASKS ====================
const dailyTasksFilter = ref<'all' | 'pending' | 'completed'>('all')

const dailyTasksCategories = ref([
  {
    id: 'orders',
    name: 'Commandes à confirmer',
    icon: markRaw(FileCheck),
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600',
    tasks: [] as any[]
  },
  {
    id: 'labels',
    name: 'Bordereaux à imprimer',
    icon: markRaw(Printer),
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600',
    tasks: [] as any[]
  },
  {
    id: 'packages',
    name: 'Colis à préparer',
    icon: markRaw(Package),
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600',
    tasks: [] as any[]
  },
  {
    id: 'returns',
    name: 'Retours à traiter',
    icon: markRaw(RotateCcw),
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600',
    tasks: [] as any[]
  },
  {
    id: 'finance',
    name: 'Paiements',
    icon: markRaw(Banknote),
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600',
    tasks: [] as any[]
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

const delayedShipments = ref<any[]>([])

// Delayed Patterns
const delayedPatterns = ref<any[]>([])

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
const returnAlerts = ref<any[]>([])

// Financial Stats
const financialStats = reactive({
  pendingCOD: 0,
  pendingCODCount: 0,
  pendingPayments: 0,
  pendingCarriersCount: 0,
  deliveryFees: 0,
  netMargin: 0,
  marginPercent: 0,
  codByCarrier: [] as any[],
  overduePayments: [] as any[],
  cashFlowProjection: [] as any[]
})

// Activity Log
const activityFilters = reactive({
  type: 'all',
  period: 'today',
  search: ''
})

const activityLogs = ref<any[]>([])

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

// Members & Roles Management
const membersTab = ref('members')
const memberSearchQuery = ref('')
const showRoleFilter = ref(false)
const selectedRoleFilters = ref<string[]>([])
const showMemberModal = ref(false)
const showRoleModal = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')
const deleteTarget = ref<{ type: 'member' | 'role', id: number | string } | null>(null)
const editingMember = ref<any>(null)
const editingRole = ref<any>(null)

const memberForm = ref({
  name: '',
  email: '',
  role: '',
  status: 'active'
})

const roleForm = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

const availableRoles = ref([
  { id: 'owner', name: 'Owner', description: 'Propriétaire de l\'organisation. Toutes les permissions.', memberCount: 1, isDefault: true, isOwner: true, permissions: ['all'] },
  { id: 'admin', name: 'Admin', description: 'Peut gérer l\'organisation, les paramètres et la facturation.', memberCount: 2, isDefault: true, isOwner: false, permissions: ['users.manage', 'settings.manage', 'billing.view', 'shipments.all', 'reports.view'] },
  { id: 'manager', name: 'Manager', description: 'Peut gérer les colis et les clients.', memberCount: 3, isDefault: true, isOwner: false, permissions: ['shipments.all', 'clients.manage', 'reports.view'] },
  { id: 'support', name: 'Support Agent', description: 'Peut voir et mettre à jour les colis.', memberCount: 1, isDefault: true, isOwner: false, permissions: ['shipments.view', 'shipments.update', 'clients.view'] },
])

const permissionCategories = [
  {
    name: 'Colis',
    permissions: [
      { id: 'shipments.view', label: 'Voir les colis' },
      { id: 'shipments.create', label: 'Créer des colis' },
      { id: 'shipments.update', label: 'Modifier les colis' },
      { id: 'shipments.delete', label: 'Supprimer les colis' },
      { id: 'shipments.all', label: 'Toutes permissions colis' }
    ]
  },
  {
    name: 'Clients',
    permissions: [
      { id: 'clients.view', label: 'Voir les clients' },
      { id: 'clients.manage', label: 'Gérer les clients' }
    ]
  },
  {
    name: 'Utilisateurs',
    permissions: [
      { id: 'users.view', label: 'Voir les utilisateurs' },
      { id: 'users.manage', label: 'Gérer les utilisateurs' }
    ]
  },
  {
    name: 'Paramètres',
    permissions: [
      { id: 'settings.view', label: 'Voir les paramètres' },
      { id: 'settings.manage', label: 'Modifier les paramètres' },
      { id: 'billing.view', label: 'Voir la facturation' }
    ]
  },
  {
    name: 'Rapports',
    permissions: [
      { id: 'reports.view', label: 'Voir les rapports' },
      { id: 'reports.export', label: 'Exporter les rapports' }
    ]
  }
]

const filteredMembers = computed(() => {
  let members = teamMembers.value

  if (memberSearchQuery.value) {
    const query = memberSearchQuery.value.toLowerCase()
    members = members.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query)
    )
  }

  if (selectedRoleFilters.value.length > 0) {
    members = members.filter(m =>
      selectedRoleFilters.value.some(roleId => {
        const role = availableRoles.value.find(r => r.id === roleId)
        return role && m.role === role.name
      })
    )
  }

  return members
})

function openAddMemberModal() {
  editingMember.value = null
  memberForm.value = { name: '', email: '', role: '', status: 'active' }
  showMemberModal.value = true
}

function editMember(member: any) {
  editingMember.value = member
  memberForm.value = {
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status || 'active'
  }
  showMemberModal.value = true
}

function closeMemberModal() {
  showMemberModal.value = false
  editingMember.value = null
}

function saveMember() {
  if (!memberForm.value.name || !memberForm.value.email || !memberForm.value.role) {
    alert('Veuillez remplir tous les champs obligatoires')
    return
  }

  if (editingMember.value) {
    const index = teamMembers.value.findIndex(m => m.id === editingMember.value.id)
    if (index !== -1) {
      teamMembers.value[index] = {
        ...teamMembers.value[index],
        name: memberForm.value.name,
        email: memberForm.value.email,
        role: memberForm.value.role,
        status: memberForm.value.status,
        initials: memberForm.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      }
    }
  } else {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
    teamMembers.value.push({
      id: Date.now(),
      name: memberForm.value.name,
      email: memberForm.value.email,
      role: memberForm.value.role,
      status: 'invited',
      lastLogin: 'Jamais',
      initials: memberForm.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    })
    updateRoleCounts()
  }

  closeMemberModal()
}

function confirmDeleteMember(member: any) {
  deleteTarget.value = { type: 'member', id: member.id }
  deleteConfirmMessage.value = `Êtes-vous sûr de vouloir supprimer ${member.name} ? Cette action est irréversible.`
  showDeleteConfirm.value = true
}

function openAddRoleModal() {
  editingRole.value = null
  roleForm.value = { name: '', description: '', permissions: [] }
  showRoleModal.value = true
}

function editRole(role: any) {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description || '',
    permissions: [...(role.permissions || [])]
  }
  showRoleModal.value = true
}

function closeRoleModal() {
  showRoleModal.value = false
  editingRole.value = null
}

function saveRole() {
  if (!roleForm.value.name) {
    alert('Veuillez entrer un nom de rôle')
    return
  }

  if (editingRole.value) {
    const index = availableRoles.value.findIndex(r => r.id === editingRole.value.id)
    if (index !== -1) {
      availableRoles.value[index] = {
        ...availableRoles.value[index],
        name: roleForm.value.name,
        description: roleForm.value.description,
        permissions: roleForm.value.permissions
      }
    }
  } else {
    availableRoles.value.push({
      id: 'custom-' + Date.now(),
      name: roleForm.value.name,
      description: roleForm.value.description,
      memberCount: 0,
      isDefault: false,
      isOwner: false,
      permissions: roleForm.value.permissions
    })
  }

  closeRoleModal()
}

function confirmDeleteRole(role: any) {
  deleteTarget.value = { type: 'role', id: role.id }
  deleteConfirmMessage.value = `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ? Les membres avec ce rôle seront déplacés vers le rôle par défaut.`
  showDeleteConfirm.value = true
}

function executeDelete() {
  if (!deleteTarget.value) return

  if (deleteTarget.value.type === 'member') {
    const index = teamMembers.value.findIndex(m => m.id === deleteTarget.value!.id)
    if (index !== -1) {
      teamMembers.value.splice(index, 1)
      updateRoleCounts()
    }
  } else if (deleteTarget.value.type === 'role') {
    const index = availableRoles.value.findIndex(r => r.id === deleteTarget.value!.id)
    if (index !== -1) {
      availableRoles.value.splice(index, 1)
    }
  }

  showDeleteConfirm.value = false
  deleteTarget.value = null
}

function updateRoleCounts() {
  availableRoles.value.forEach(role => {
    role.memberCount = teamMembers.value.filter(m => m.role === role.name).length
  })
}

function exportMembers() {
  const data = teamMembers.value.map(m => ({
    Nom: m.name,
    Email: m.email,
    Rôle: m.role,
    Statut: m.status || 'active',
    'Dernière connexion': m.lastLogin
  }))
  console.log('Export members:', data)
  alert('Export des membres en cours...')
}

// Company Profile
const companyProfile = ref({
  name: 'Ma Société SARL',
  taxId: '1234567ABC',
  email: 'contact@masociete.tn',
  phone: '+216 71 234 567',
  address: '123 Rue de la Liberté',
  city: 'Tunis',
  postalCode: '1000',
  currency: 'TND',
  timezone: 'Africa/Tunis'
})

function saveCompanyProfile() {
  // Save company profile logic
  alert('Profil entreprise enregistré avec succès!')
}

// Security Settings
const securitySettings = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false
})

const activeSessions = ref<any[]>([])

function changePassword() {
  if (securitySettings.value.newPassword !== securitySettings.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }
  if (securitySettings.value.newPassword.length < 8) {
    alert('Le mot de passe doit contenir au moins 8 caractères')
    return
  }
  alert('Mot de passe modifié avec succès!')
  securitySettings.value.currentPassword = ''
  securitySettings.value.newPassword = ''
  securitySettings.value.confirmPassword = ''
}

// Payment History
const paymentFilter = ref('all')
const paymentStats = ref({
  totalPaid: 0,
  pending: 0,
  invoiceCount: 0
})

const payments = ref<any[]>([])

const filteredPayments = computed(() => {
  if (paymentFilter.value === 'all') return payments.value
  return payments.value.filter(p => p.status === paymentFilter.value)
})

// ==========================================
// Global Search (Notion-style Command Palette)
// ==========================================
const showGlobalSearch = ref(false)
const globalSearchQuery = ref('')
const globalSearchInput = ref<HTMLInputElement | null>(null)
const selectedSearchIndex = ref(0)
const recentSearches = ref<string[]>([])

// Full Search Results Page
const showSearchResultsPage = ref(false)
const searchResultsQuery = ref('')
const searchResultsFilter = ref<'all' | 'pending' | 'delivered' | 'in-transit' | 'returned'>('all')
const searchResultsSort = ref<'date' | 'tracking' | 'recipient' | 'amount'>('date')

const searchSuggestions = [
  { type: 'tracking', label: 'Rechercher par numéro de suivi', hint: 'Ex: TN-2026-0001', icon: markRaw(Package) },
  { type: 'phone', label: 'Rechercher par téléphone', hint: 'Ex: +216 22 333 444', icon: markRaw(PhoneIcon) },
  { type: 'name', label: 'Rechercher par nom', hint: 'Nom du destinataire ou client', icon: markRaw(User) },
  { type: 'barcode', label: 'Scanner un code-barres', hint: 'Utiliser le scanner', icon: markRaw(Search) },
]

const globalSearchResults = computed(() => {
  if (!globalSearchQuery.value || globalSearchQuery.value.length < 2) return []

  const query = globalSearchQuery.value.toLowerCase().trim()

  return shipments.value.filter(shipment => {
    return (
      shipment.trackingNumber.toLowerCase().includes(query) ||
      shipment.recipient.toLowerCase().includes(query) ||
      shipment.recipientPhone.toLowerCase().includes(query) ||
      shipment.recipientAddress.toLowerCase().includes(query) ||
      (shipment.orderId && shipment.orderId.toLowerCase().includes(query))
    )
  }).slice(0, 10)
})

// Full search results (no limit, with filters)
const fullSearchResults = computed(() => {
  if (!searchResultsQuery.value || searchResultsQuery.value.length < 2) return []

  const query = searchResultsQuery.value.toLowerCase().trim()

  let results = shipments.value.filter(shipment => {
    return (
      shipment.trackingNumber.toLowerCase().includes(query) ||
      shipment.recipient.toLowerCase().includes(query) ||
      shipment.recipientPhone.toLowerCase().includes(query) ||
      shipment.recipientAddress.toLowerCase().includes(query) ||
      (shipment.orderId && shipment.orderId.toLowerCase().includes(query))
    )
  })

  // Apply status filter
  if (searchResultsFilter.value !== 'all') {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'delivered': 'Delivered',
      'in-transit': 'Out for delivery',
      'returned': 'Returned'
    }
    results = results.filter(s => s.status === statusMap[searchResultsFilter.value])
  }

  // Apply sorting
  results = [...results].sort((a, b) => {
    switch (searchResultsSort.value) {
      case 'tracking':
        return a.trackingNumber.localeCompare(b.trackingNumber)
      case 'recipient':
        return a.recipient.localeCompare(b.recipient)
      case 'amount':
        return b.amount - a.amount
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return results
})

// Open full search results page
function openSearchResultsPage() {
  searchResultsQuery.value = globalSearchQuery.value
  searchResultsFilter.value = 'all'
  closeGlobalSearch()
  showSearchResultsPage.value = true
}

// Close search results page
function closeSearchResultsPage() {
  showSearchResultsPage.value = false
  searchResultsQuery.value = ''
}

function openGlobalSearch() {
  showGlobalSearch.value = true
  globalSearchQuery.value = ''
  selectedSearchIndex.value = 0
  nextTick(() => {
    globalSearchInput.value?.focus()
  })
}

function closeGlobalSearch() {
  showGlobalSearch.value = false
  globalSearchQuery.value = ''
  selectedSearchIndex.value = 0
}

function navigateSearchResults(direction: number) {
  const items = globalSearchQuery.value ? globalSearchResults.value : searchSuggestions
  const maxIndex = items.length - 1

  selectedSearchIndex.value += direction
  if (selectedSearchIndex.value < 0) selectedSearchIndex.value = maxIndex
  if (selectedSearchIndex.value > maxIndex) selectedSearchIndex.value = 0
}

function selectSearchResult() {
  if (!globalSearchQuery.value) {
    // Select a suggestion
    const suggestion = searchSuggestions[selectedSearchIndex.value]
    if (suggestion) {
      applySearchSuggestion(suggestion)
    }
  } else if (globalSearchResults.value.length > 0) {
    // Select a result
    const result = globalSearchResults.value[selectedSearchIndex.value]
    if (result) {
      openSearchResult(result)
    }
  }
}

function applySearchSuggestion(suggestion: any) {
  // Focus input and maybe add a prefix based on suggestion type
  globalSearchInput.value?.focus()
}

function openSearchResult(result: any) {
  // Add to recent searches
  if (!recentSearches.value.includes(result.trackingNumber)) {
    recentSearches.value.unshift(result.trackingNumber)
    if (recentSearches.value.length > 5) recentSearches.value.pop()
  }

  // Close search and navigate to shipment details
  closeGlobalSearch()

  // Open shipment detail (reuse existing viewShipmentDetail function if available)
  selectedShipment.value = result
  showShipmentDetail.value = true
}

// Keyboard shortcut for global search (Cmd+K / Ctrl+K)
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (showGlobalSearch.value) {
      closeGlobalSearch()
    } else {
      openGlobalSearch()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

// ==========================================
// Bulk Import
// ==========================================
const showBulkImportModal = ref(false)
const bulkImportTab = ref<'excel' | 'manual'>('excel')
const isDragging = ref(false)
const importedFile = ref<File | null>(null)
const importedFileRows = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)

const bulkShipmentRows = ref([
  { recipient: '', phone: '', address: '', amount: null },
  { recipient: '', phone: '', address: '', amount: null },
  { recipient: '', phone: '', address: '', amount: null },
])

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function processFile(file: File) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]

  if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    alert('Format de fichier non supporté. Veuillez utiliser un fichier Excel (.xlsx, .xls) ou CSV.')
    return
  }

  importedFile.value = file
  // Simulate detecting rows (in real app, you'd parse the file)
  importedFileRows.value = Math.floor(Math.random() * 50) + 10
}

function downloadImportTemplate() {
  // Create a simple CSV template
  const headers = ['Destinataire', 'Téléphone', 'Adresse', 'Ville', 'Montant', 'Notes']
  const exampleRow = ['Ahmed Ben Ali', '+216 22 333 444', '15 Rue de la Liberté', 'Tunis', '45.00', 'Livraison express']

  const csvContent = [
    headers.join(','),
    exampleRow.join(','),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'modele_import_colis.csv'
  link.click()
}

function addBulkShipmentRow() {
  bulkShipmentRows.value.push({ recipient: '', phone: '', address: '', amount: null })
}

function removeBulkShipmentRow(index: number) {
  if (bulkShipmentRows.value.length > 1) {
    bulkShipmentRows.value.splice(index, 1)
  }
}

function processBulkImport() {
  if (bulkImportTab.value === 'excel') {
    if (!importedFile.value) return

    // In a real app, you would parse the Excel file here
    alert(`Import de ${importedFileRows.value} colis depuis ${importedFile.value.name} réussi!`)
    importedFile.value = null
    importedFileRows.value = 0
    showBulkImportModal.value = false
  } else {
    // Manual multi-creation
    const validRows = bulkShipmentRows.value.filter(r => r.recipient && r.phone)
    if (validRows.length === 0) return

    // In a real app, you would create the shipments here
    alert(`${validRows.length} colis créés avec succès!`)

    // Reset the form
    bulkShipmentRows.value = [
      { recipient: '', phone: '', address: '', amount: null },
      { recipient: '', phone: '', address: '', amount: null },
      { recipient: '', phone: '', address: '', amount: null },
    ]
    showBulkImportModal.value = false
  }
}

function openBulkImport() {
  showBulkImportModal.value = true
  bulkImportTab.value = 'excel'
  importedFile.value = null
  importedFileRows.value = 0
}

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
const failedSearches = ref<any[]>([])

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

// Carrier Search
const carrierSearchQuery = ref('')

const filteredCarriers = computed(() => {
  if (!carrierSearchQuery.value) return deliveryCarriers
  const search = carrierSearchQuery.value.toLowerCase()
  return deliveryCarriers.filter(carrier =>
    carrier.name.toLowerCase().includes(search) ||
    carrier.description.toLowerCase().includes(search)
  )
})

function getCarrierInitials(name: string): string {
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

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

// Status tabs - counts computed from actual shipments
const statusTabs = computed(() => [
  { id: 'all', label: 'Tous', count: shipments.value.length },
  { id: 'exception', label: 'Exception', count: shipments.value.filter(s => s.status === 'exception').length },
  { id: 'failed', label: 'Tentative échouée', count: shipments.value.filter(s => s.status === 'failed').length },
  { id: 'expired', label: 'Expiré', count: shipments.value.filter(s => s.status === 'expired').length },
  { id: 'out-for-delivery', label: 'En livraison', count: shipments.value.filter(s => s.status === 'out_for_delivery').length },
  { id: 'delivered', label: 'Livré', count: shipments.value.filter(s => s.status === 'delivered').length },
  { id: 'pending', label: 'En attente', count: shipments.value.filter(s => s.status === 'pending').length },
])

// Shipments - empty by default, loaded from Supabase
const shipments = ref<any[]>([])

// Carriers - empty by default, loaded from Supabase
const carriers = ref<any[]>([])

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

// Carrier wizard state
const carrierWizardStep = ref(1)
const showApiKey = ref(false)

// Modal carrier selection
const modalCarrierSearchQuery = ref('')
const selectedModalCarrier = ref<typeof deliveryCarriers[0] | null>(null)

const filteredModalCarriers = computed(() => {
  if (!modalCarrierSearchQuery.value) return deliveryCarriers
  const search = modalCarrierSearchQuery.value.toLowerCase()
  return deliveryCarriers.filter(carrier =>
    carrier.name.toLowerCase().includes(search) ||
    carrier.description.toLowerCase().includes(search)
  )
})

function selectCarrierFromList(carrier: typeof deliveryCarriers[0]) {
  selectedModalCarrier.value = carrier
  newCarrier.name = carrier.name
  // Set default delivery fee based on carrier
  const fee = carrierDeliveryFees[carrier.name] || 7
  newCarrier.fraisColisLivres = fee
}

// Returns tracking data (synced from carriers)
const isSyncingReturns = ref(false)
const activeReturnsFilter = ref<'all' | 'on-time' | 'delayed'>('all')
// Returns data - starts at 0 for new accounts
const returnsData = reactive({
  active: 0,
  recovered: 0,
  lost: 0,
  total: 0,
  totalValue: 0,
  recoveredValue: 0,
  pendingValue: 0,
  lostValue: 0
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

// Statistics per carrier for return value page - empty by default
const carriersReturnStats = ref<any[]>([])

// Report analytics data - empty by default
const reportPeriod = ref('month')
const reportAnalytics = reactive({
  totalReturns: 0,
  avgAttempts: 0,
  multipleAttemptsCost: 0,
  reasonsBreakdown: [] as any[],
  attemptsBreakdown: [] as any[],
  carrierComparison: [] as any[],
  productIssues: [] as any[],
  problematicZones: [] as any[],
  carrierAdvice: '',
  carrierImpact: 0,
  productAdvice: '',
  productImpact: 0,
  processAdvice: '',
  processImpact: 0
})

// Returns list - empty by default
const returnsList = ref<any[]>([])

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

const chartData = ref<number[]>([])
const chartLabels = ref(['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'])

// ==================== ANALYTICS DATA ====================
const analyticsDateRange = ref('30')
const trendsPeriod = ref('monthly')
const riskZoneFilter = ref('all')

// Global KPIs
const analyticsKpis = reactive({
  totalShipments: 0,
  deliveryRate: 0,
  avgTransitTime: 0,
  totalRevenue: 0,
  returnRate: 0,
  exceptionRate: 0,
  customerSatisfaction: 0
})

const analyticsKpiComparison = ref<any[]>([])

// Delivery Performance
const deliveryPerformance = reactive({
  successfulDeliveries: 0,
  totalAttempts: 0,
  firstAttemptRate: 0,
  avgDeliveryTime: 0,
  onTimeRate: 0,
  regionalPerformance: [] as any[]
})

// Return Intelligence
const returnIntelligence = reactive({
  totalReturns: 0,
  lostRevenue: 0,
  recoveredReturns: 0,
  recoveryRate: 0,
  returnReasons: [] as any[],
  returnTrend: [] as number[],
  recommendations: [] as any[]
})

// Risk Zones
const riskZones = reactive({
  highRiskCount: 0,
  mediumRiskCount: 0,
  lowRiskCount: 0,
  zones: [] as any[]
})

const filteredRiskZones = computed(() => {
  if (riskZoneFilter.value === 'all') return riskZones.zones
  return riskZones.zones.filter(z => z.risk === riskZoneFilter.value)
})

// Anomaly Detection
const anomalyDetection = reactive({
  criticalAnomalies: 0,
  warningAnomalies: 0,
  infoAnomalies: 0,
  resolvedAnomalies: 0,
  activeAnomalies: [] as any[]
})

// Trends
const trends = reactive({
  labels: [] as string[],
  volumeTrend: [] as number[],
  deliveryRateTrend: [] as number[],
  volumeForecast: 0,
  deliveryForecast: 0,
  insights: [] as any[]
})

// Reports
const reports = reactive({
  templates: [
    { id: 1, name: 'Performance Globale', description: 'Vue d\'ensemble de tous les KPIs', icon: markRaw(BarChart2), bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { id: 2, name: 'Analyse Retours', description: 'Détail des motifs et tendances', icon: markRaw(RotateCcw), bgColor: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600' },
    { id: 3, name: 'Performance Transporteurs', description: 'Comparatif des transporteurs', icon: markRaw(Truck), bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600' },
    { id: 4, name: 'Analyse Régionale', description: 'Performance par zone', icon: markRaw(MapPinned), bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' }
  ],
  recentReports: [] as any[]
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

// Pickup Requests
const pickupRequestFilter = ref('all')
const showPickupDetailModal = ref(false)
const selectedPickupDetail = ref<any>(null)

const pickupRequests = ref<any[]>([])

const filteredPickupRequests = computed(() => {
  if (pickupRequestFilter.value === 'all') return pickupRequests.value
  return pickupRequests.value.filter(r => r.status === pickupRequestFilter.value)
})

function viewPickupDetail(pickup: any) {
  selectedPickupDetail.value = pickup
  showPickupDetailModal.value = true
}

function closePickupDetail() {
  showPickupDetailModal.value = false
  selectedPickupDetail.value = null
}

// Pickup History
const pickupHistory = ref<any[]>([])

// Failed Pickups
const failedPickupsData = ref<any[]>([])

// Carrier Performance
const carrierPerformance = ref<any[]>([])

// Administration - Users Management
// Fee configuration per shipment type (in TND)
const deliveryFees = ref({
  delivered: 3.00,  // Fee per delivered shipment
  returned: 2.00    // Fee per returned shipment
})

// Admin users - empty by default, loaded from Supabase (only visible to platform admins)
const adminUsers = ref<any[]>([])

const adminUserSearch = ref('')
const adminUserFilter = ref('all')
const showChargeAccountModal = ref(false)
const selectedUserForCharge = ref<any>(null)
const chargeNote = ref('')
const chargeMode = ref<'credit' | 'debit'>('credit')
const creditAmount = ref<number | null>(null)
const paymentMethod = ref<'cash' | 'transfer' | 'cheque'>('cash')
const purchaseDelivered = ref<number | null>(null)
const purchaseReturned = ref<number | null>(null)

// Computed property for calculating total charge based on unbilled shipments
const calculateChargeTotal = computed(() => {
  if (!selectedUserForCharge.value) return 0
  const deliveredTotal = selectedUserForCharge.value.unbilledDelivered * deliveryFees.value.delivered
  const returnedTotal = selectedUserForCharge.value.unbilledReturned * deliveryFees.value.returned
  return deliveredTotal + returnedTotal
})

// Computed property for calculating total credit based on purchased colis
const calculateCreditTotal = computed(() => {
  const deliveredTotal = (purchaseDelivered.value || 0) * deliveryFees.value.delivered
  const returnedTotal = (purchaseReturned.value || 0) * deliveryFees.value.returned
  return deliveredTotal + returnedTotal
})

// Admin transactions - empty by default, loaded from Supabase
const adminTransactions = ref<any[]>([])

const filteredAdminUsers = computed(() => {
  let result = adminUsers.value

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
  totalUsers: adminUsers.value.length,
  activeUsers: adminUsers.value.filter(u => u.status === 'active').length,
  totalBalance: adminUsers.value.reduce((sum, u) => sum + u.balance, 0),
  negativeBalances: adminUsers.value.filter(u => u.balance < 0).length,
}))

function openChargeModal(user: any) {
  selectedUserForCharge.value = user
  chargeNote.value = ''
  chargeMode.value = 'credit'
  creditAmount.value = null
  paymentMethod.value = 'cash'
  purchaseDelivered.value = null
  purchaseReturned.value = null
  showChargeAccountModal.value = true
}

function closeChargeModal() {
  showChargeAccountModal.value = false
  selectedUserForCharge.value = null
  chargeNote.value = ''
  chargeMode.value = 'credit'
  creditAmount.value = null
  paymentMethod.value = 'cash'
  purchaseDelivered.value = null
  purchaseReturned.value = null
}

function processAccountCharge() {
  if (!selectedUserForCharge.value || calculateChargeTotal.value === 0) return

  const user = adminUsers.value.find(u => u.id === selectedUserForCharge.value.id)
  if (user) {
    const totalAmount = calculateChargeTotal.value
    const deliveredCount = user.unbilledDelivered
    const returnedCount = user.unbilledReturned

    // Debit the account
    user.balance -= totalAmount

    // Reset unbilled counts
    user.unbilledDelivered = 0
    user.unbilledReturned = 0

    // Add transaction
    adminTransactions.value.unshift({
      id: `TRX-${String(adminTransactions.value.length + 1).padStart(3, '0')}`,
      userId: user.id,
      userName: user.name,
      company: user.company,
      type: 'debit',
      amount: totalAmount,
      note: chargeNote.value || `Facturation: ${deliveredCount} livrés (${deliveryFees.value.delivered} TND) + ${returnedCount} retours (${deliveryFees.value.returned} TND)`,
      date: new Date().toLocaleString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      createdBy: 'Admin',
      deliveredCount,
      returnedCount
    })
  }

  closeChargeModal()
}

function processAccountCredit() {
  if (!selectedUserForCharge.value || calculateCreditTotal.value <= 0) return

  const user = adminUsers.value.find(u => u.id === selectedUserForCharge.value.id)
  if (user) {
    const amount = calculateCreditTotal.value
    const deliveredPurchased = purchaseDelivered.value || 0
    const returnedPurchased = purchaseReturned.value || 0

    // Add credits to user account
    user.deliveredCount = (user.deliveredCount || 0) + deliveredPurchased
    user.returnedCount = (user.returnedCount || 0) + returnedPurchased

    // Get payment method label
    const paymentLabels = {
      cash: 'Espèces',
      transfer: 'Virement',
      cheque: 'Chèque'
    }

    // Add transaction
    adminTransactions.value.unshift({
      id: `TRX-${String(adminTransactions.value.length + 1).padStart(3, '0')}`,
      userId: user.id,
      userName: user.name,
      company: user.company,
      type: 'credit',
      amount: amount,
      note: chargeNote.value || `Achat: ${deliveredPurchased} livrés + ${returnedPurchased} retour (${paymentLabels[paymentMethod.value]})`,
      date: new Date().toLocaleString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      createdBy: 'Admin',
      paymentMethod: paymentMethod.value,
      purchasedDelivered: deliveredPurchased,
      purchasedReturned: returnedPurchased
    })
  }

  closeChargeModal()
}

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
// Express services: 8-12 DT, Standard services: 6-8 DT
const carrierDeliveryFees: Record<string, number> = {
  // Express carriers (8-12 DT)
  'Aramex': 12,
  'Afex': 9,
  'Aurex': 9,
  'Best Delivery': 8,
  'Bigboss': 9,
  'Bonjour Express': 8,
  'Ciblex Express': 9,
  'Colis Express': 8,
  'Essedik Smart Delivery': 9,
  'FakrounExpress': 8,
  'FastHaul': 9,
  'Fasty': 9,
  'First': 8,
  'High Delivery': 10,
  'Instaia Delivery': 9,
  'JAx': 8,
  'JetPack': 9,
  'Light Speed Delivery': 10,
  'Livra Lynx': 9,
  'MesColis Express': 8,
  'Mylerz': 9,
  'Navex': 8,
  'Oclock Delivery': 9,
  'Qwikpak': 8,
  'Rapi Colis': 8,
  'SafExpress': 9,
  'Tictac Delivery': 8,
  'Tiktak Delivery': 8,
  'TRD Express': 9,
  'X Delivery': 9,
  // Standard carriers (6-8 DT)
  'ABM': 7,
  'Axess Logistique': 7,
  'B2C Delivery': 7,
  'Bestway': 7,
  'Bouguerra Delivery': 6,
  'Calirex Tunisie': 7,
  'Colissimo': 8,
  'Cosmos': 7,
  'Delivery X': 7,
  'Dropo': 6,
  'Droppex': 7,
  'DSGO': 7,
  'Ecomness': 7,
  'Fiabilo': 7,
  'Goodex': 7,
  'Intigo': 7,
  'Kadex Delivery': 7,
  'Kamatchou Services': 6,
  'La Zajella': 7,
  'Larim Delivery': 6,
  'Login': 7,
  'Macropost': 7,
  'Massar': 7,
  'May M': 7,
  'My Colis': 7,
  'MZ Logistic': 7,
  'Onesta': 7,
  'Oppa': 6,
  'Sari': 6,
  'Sellmax': 7,
  'Sendex Delivery': 7,
  'Trust': 7,
  'WR Delivery': 7,
  'Youssel': 6,
  'Zed Delivery': 7,
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
  modalCarrierSearchQuery.value = ''
  selectedModalCarrier.value = null
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
  activeSection.value = 'add-carrier'
}

function closeCarrierModal() {
  showAddCarrierModal.value = false
  editingCarrier.value = null
  resetCarrierForm()
  modalCarrierSearchQuery.value = ''
  selectedModalCarrier.value = null
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
  carrierWizardStep.value = 1
  showApiKey.value = false
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

function saveCarrierFromPage() {
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
    const newId = carriers.value.length > 0 ? Math.max(...carriers.value.map(c => c.id)) + 1 : 1
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

  // Reset form and navigate back
  editingCarrier.value = null
  resetCarrierForm()
  modalCarrierSearchQuery.value = ''
  selectedModalCarrier.value = null
  activeSection.value = 'connected-carriers'
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
  totalCOD: 0,
  totalDeliveryFees: 0,
  totalOtherFees: 0,
  netToReceive: 0,
  overdueAmount: 0,
  overdueCount: 0
})

// Manifest by carrier with detailed shipments
const manifestByCarrier = ref<any[]>([])

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

// ==================== PAYMENT VERIFICATION / RECONCILIATION ====================
const showReconciliationModal = ref(false)
const reconciliationActiveTab = ref<'bank' | 'manual' | 'results'>('bank')

// Bank transactions data
const bankTransactionsFile = ref<File | null>(null)
const bankTransactions = ref([
  { id: 'bank-001', date: '28 Jan 2026', description: 'VIR YALIDINE REF YAL-BATCH-2026-078', amount: 1875, matched: false },
  { id: 'bank-002', date: '25 Jan 2026', description: 'VIREMENT ZR EXPRESS 2026-045', amount: 3690, matched: false },
  { id: 'bank-003', date: '22 Jan 2026', description: 'MAYSTRO DELIVERY PAIEMENT', amount: 2850, matched: false },
  { id: 'bank-004', date: '20 Jan 2026', description: 'VIR YALIDINE BATCH 2026', amount: 5000, matched: false }
])

// Manual entry
const manualPaymentData = ref({
  carrierId: '',
  amount: null as number | null,
  date: new Date().toISOString().split('T')[0],
  reference: ''
})

// Matching results
const matchingResults = ref<any[]>([])
const matchingStats = reactive({
  totalExpected: 0,
  totalMatched: 0,
  totalUnmatched: 0,
  matchedAmount: 0,
  unmatchedAmount: 0
})

// Run auto-matching
function runAutoMatching() {
  const results: any[] = []
  const carriers = manifestByCarrier.value

  carriers.forEach(carrier => {
    const matchedTx = bankTransactions.value.find(tx => {
      if (tx.matched) return false
      if (Math.abs(tx.amount - carrier.netAmount) < 10) {
        const descLower = tx.description.toLowerCase()
        if (descLower.includes(carrier.name.toLowerCase())) return true
      }
      return false
    })

    results.push({
      carrier,
      transaction: matchedTx,
      status: matchedTx ? 'matched' : 'unmatched'
    })

    if (matchedTx) matchedTx.matched = true
  })

  matchingStats.totalExpected = results.length
  matchingStats.totalMatched = results.filter(r => r.status === 'matched').length
  matchingStats.totalUnmatched = results.filter(r => r.status === 'unmatched').length
  matchingStats.matchedAmount = results.filter(r => r.status === 'matched').reduce((sum, r) => sum + r.carrier.netAmount, 0)
  matchingStats.unmatchedAmount = results.filter(r => r.status === 'unmatched').reduce((sum, r) => sum + r.carrier.netAmount, 0)

  matchingResults.value = results
  reconciliationActiveTab.value = 'results'
}

// Confirm matched payment
function confirmMatchedPayment(result: any) {
  const idx = matchingResults.value.findIndex(r => r.carrier.id === result.carrier.id)
  if (idx > -1) {
    matchingResults.value[idx].status = 'confirmed'
    matchingStats.totalMatched--
  }
}

// Submit manual payment
function submitManualPayment() {
  if (!manualPaymentData.value.carrierId || !manualPaymentData.value.amount) return
  alert(`Paiement de ${manualPaymentData.value.amount?.toLocaleString()} TND enregistré`)
  manualPaymentData.value = { carrierId: '', amount: null, date: new Date().toISOString().split('T')[0], reference: '' }
}

// Handle bank file upload
function handleBankFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    bankTransactionsFile.value = target.files[0]
  }
}

// Close modal
function closeReconciliationModal() {
  showReconciliationModal.value = false
  reconciliationActiveTab.value = 'bank'
}

// ==================== PAIEMENTS REÇUS (Received Payments) ====================
const receivedPaymentsMonth = ref('2026-01')
const receivedPaymentsCarrierFilter = ref('all')

const receivedPaymentsStats = reactive({
  totalReceived: 0,
  totalCOD: 0,
  totalFees: 0,
  paymentsCount: 0,
  shipmentsCount: 0
})

// Received payments with detailed shipments
const receivedPaymentsData = ref<any[]>([])

// Filtered received payments
const filteredReceivedPayments = computed(() => {
  if (receivedPaymentsCarrierFilter.value === 'all') return receivedPaymentsData.value
  return receivedPaymentsData.value.filter(p => p.carrier.toLowerCase().includes(receivedPaymentsCarrierFilter.value))
})

// ==================== ÉCARTS DE PAIEMENT (Payment Discrepancies) ====================
const discrepancyFilter = ref('all')
const discrepancyCarrierFilter = ref('all')

const discrepancyStats = reactive({
  ourTotal: 0,
  theirTotal: 0,
  totalDifference: 0,
  differencePercent: 0,
  totalPending: 0,
  pendingCount: 0,
  unexpectedFees: 0,
  unexpectedFeesCount: 0,
  recovered: 0
})

// Reconciliation by carrier with per-shipment comparison
const reconciliationByCarrier = ref<any[]>([])

// Revenue
const revenuePeriod = ref('month')

const revenueStats = reactive({
  grossRevenue: 0,
  netRevenue: 0,
  marginPercent: 0,
  shippingCosts: 0,
  avgOrderValue: 0,
  grossGrowth: 0
})

const revenueByCategory = ref<any[]>([])

const revenueByRegion = ref<any[]>([])

const revenueChartData = ref<any[]>([])

// Return Losses
const returnLossesMonth = ref('2026-01')

const returnLossesStats = reactive({
  totalLoss: 0,
  returnedCount: 0,
  lostCount: 0,
  shippingLoss: 0
})

const returnLossesByReason = ref<any[]>([])

const returnLossesByCarrier = ref<any[]>([])

const returnLossesDetails = ref<any[]>([])

// Invoices
const invoicesTab = ref<'received' | 'sent'>('received')
const invoiceSearch = ref('')
const invoiceStatusFilter = ref('all')

const invoicesStats = reactive({
  totalInvoices: 0,
  pendingAmount: 0,
  paidAmount: 0,
  overdueCount: 0
})

const invoices = ref<any[]>([])

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

const recentExports = ref<any[]>([])

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

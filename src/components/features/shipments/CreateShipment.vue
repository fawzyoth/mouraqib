<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Ajouter un colis</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Creer une nouvelle expedition</p>
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
                    <span class="font-semibold" :class="newShipment.type === 'exchange' ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'">Echange</span>
                  </div>
                </div>
                <p class="text-sm text-gray-500">Livrer un colis et recuperer un article</p>
              </button>
            </div>

            <!-- Exchange Details (only shown when exchange is selected) -->
            <div v-if="newShipment.type === 'exchange'" class="p-5 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800/30 space-y-4">
              <div class="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                <RefreshCw class="w-4 h-4" />
                <span class="text-sm font-semibold">Details de l'echange</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Reason for exchange -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raison de l'echange <span class="text-red-500">*</span></label>
                  <select v-model="newShipment.exchangeReason" class="w-full px-3 py-2 border border-orange-200 dark:border-orange-800 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="">Selectionner une raison</option>
                    <option value="wrong_size">Mauvaise taille</option>
                    <option value="wrong_color">Mauvaise couleur</option>
                    <option value="defective">Produit defectueux</option>
                    <option value="wrong_product">Mauvais produit</option>
                    <option value="customer_changed_mind">Client a change d'avis</option>
                    <option value="other">Autre raison</option>
                  </select>
                </div>

                <!-- Number of items to collect -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre d'articles a recuperer <span class="text-red-500">*</span></label>
                  <input v-model.number="newShipment.exchangeItemCount" type="number" min="1" placeholder="1" class="w-full px-3 py-2 border border-orange-200 dark:border-orange-800 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>

              <!-- Description of items to collect -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description des articles a recuperer</label>
                <textarea v-model="newShipment.exchangeDescription" rows="2" placeholder="Ex: T-shirt bleu taille L a retourner" class="w-full px-3 py-2 border border-orange-200 dark:border-orange-800 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"></textarea>
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
                    <p class="text-xs text-gray-500 truncate">{{ client.phone }} &bull; {{ client.region }}</p>
                  </div>
                  <div class="flex items-center space-x-2 flex-shrink-0">
                    <span v-if="client.status === 'vip'" class="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">VIP</span>
                    <span v-if="client.status === 'blocked'" class="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded flex items-center"><AlertTriangle class="w-3 h-3 mr-0.5" />Bloque</span>
                    <span class="text-xs" :class="client.deliveryRate >= 80 ? 'text-green-600' : client.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">{{ client.deliveryRate }}%</span>
                  </div>
                </button>
              </div>
              <!-- No results - option to create new -->
              <div v-if="showClientSuggestions && shipmentClientSearch.length >= 2 && filteredShipmentClients.length === 0" class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p class="text-sm text-gray-500 text-center mb-2">Aucun client trouve</p>
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
                    <p class="text-xs text-gray-500">{{ selectedShipmentClient.totalOrders }} commandes &bull; {{ selectedShipmentClient.deliveryRate }}% livraison</p>
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

            <!-- Telephones -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telephone <span class="text-red-500">*</span>
                </label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                    +216
                  </span>
                  <input v-model="newShipment.phone" type="tel" placeholder="XX XXX XXX" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-r-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telephone secondaire</label>
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
              <textarea v-model="newShipment.address" rows="2" placeholder="Entrez l'adresse complete" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"></textarea>
            </div>

            <!-- Gouvernorat, Delegation, Localite -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gouvernorat <span class="text-red-500">*</span>
                </label>
                <select v-model="newShipment.gouvernorat" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="">Selectionner</option>
                  <option v-for="gov in gouvernorats" :key="gov" :value="gov">{{ gov }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Delegation <span class="text-red-500">*</span>
                </label>
                <select v-model="newShipment.delegation" :disabled="!newShipment.gouvernorat" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">Selectionner</option>
                  <option v-for="del in availableDelegations" :key="del" :value="del">{{ del }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localite</label>
                <select v-model="newShipment.locality" :disabled="!newShipment.delegation" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">Selectionner</option>
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
                {{ filteredCarriersLocal.length }} resultats
              </span>
            </div>

            <!-- Carrier grid with scroll -->
            <div class="max-h-80 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 p-2">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="carrier in filteredCarriersLocal"
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
              <p v-if="filteredCarriersLocal.length === 0" class="text-center text-sm text-gray-500 py-8">Aucun transporteur trouve</p>
            </div>
            <p v-if="!newShipment.carrier" class="text-xs text-red-500 mt-2">Veuillez selectionner un transporteur</p>
          </div>
        </div>

        <!-- Section 4: Details du Produit -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span class="text-sm font-bold text-orange-600">4</span>
              </div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Details du Produit</h2>
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

            <!-- Reference -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference</label>
              <div class="flex space-x-2">
                <input v-model="newShipment.reference" type="text" readonly placeholder="Auto-generee" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed font-mono" />
                <button @click="newShipment.reference = generateReference()" type="button" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <RefreshCw class="w-4 h-4" />
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">La reference sera generee automatiquement a la creation</p>
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
          <button @click="resetForm" type="button" class="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Annuler
          </button>
          <button @click="handleSubmit" :disabled="!newShipment.carrier" :class="['px-6 py-2.5 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2', !newShipment.carrier && 'opacity-50 cursor-not-allowed']">
            <Plus class="w-4 h-4" />
            Creer le colis
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
  ListFilter,
  Package,
  RefreshCw,
  Camera,
  X,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle
} from 'lucide-vue-next'
import { carrierDeliveryFees } from '@/data/carriers-catalog'
import { tunisiaLocations } from '@/data/tunisia-locations'

interface Client {
  id: number
  name: string
  phone: string
  address: string
  region: string
  status: string
  deliveryRate: number
  totalOrders: number
  [key: string]: any
}

interface DeliveryCarrier {
  id: string
  name: string
  color: string
  deliveryTime: string
  description: string
  [key: string]: any
}

const props = defineProps<{
  clients: Client[]
  carriers: { id: number; name: string; [key: string]: any }[]
}>()

const emit = defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'submit', shipment: any): void
  (e: 'reset'): void
}>()

const newShipment = reactive({
  trackingNumber: '',
  carrier: '',
  type: 'normal' as 'normal' | 'exchange',
  exchangeReason: '',
  exchangeItemCount: 1,
  exchangeImage: null as string | null,
  exchangeDescription: '',
  customerName: '',
  phone: '',
  phoneSecondary: '',
  address: '',
  gouvernorat: '',
  delegation: '',
  locality: '',
  postalCode: '',
  productName: '',
  isFragile: false,
  description: '',
  productPrice: 0,
  deliveryFee: 7,
  reference: '',
  amount: 0,
  clientId: null as number | null
})

// Client autocomplete
const shipmentClientSearch = ref('')
const showClientSuggestions = ref(false)
const selectedShipmentClient = ref<Client | null>(null)

const filteredShipmentClients = computed(() => {
  if (shipmentClientSearch.value.length < 1) return []
  const search = shipmentClientSearch.value.toLowerCase()
  return props.clients.filter(client =>
    client.name.toLowerCase().includes(search) ||
    client.phone.includes(search) ||
    client.address.toLowerCase().includes(search)
  ).slice(0, 5)
})

// Carrier search
const carrierSearchQuery = ref('')

const filteredCarriersLocal = computed(() => {
  if (!carrierSearchQuery.value) return props.carriers
  const search = carrierSearchQuery.value.toLowerCase()
  return props.carriers.filter(carrier =>
    carrier.name.toLowerCase().includes(search)
  )
})

function getCarrierInitials(name: string): string {
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Location cascading
const gouvernorats = computed(() => Object.keys(tunisiaLocations))

const availableDelegations = computed(() => {
  if (!newShipment.gouvernorat || !tunisiaLocations[newShipment.gouvernorat]) return []
  return Object.keys(tunisiaLocations[newShipment.gouvernorat].delegations)
})

const availableLocalities = computed(() => {
  if (!newShipment.gouvernorat || !newShipment.delegation) return []
  const delegations = tunisiaLocations[newShipment.gouvernorat]?.delegations
  if (!delegations || !delegations[newShipment.delegation]) return []
  return delegations[newShipment.delegation].localities
})

watch(() => newShipment.gouvernorat, () => {
  newShipment.delegation = ''
  newShipment.locality = ''
  newShipment.postalCode = ''
})

watch(() => newShipment.delegation, () => {
  newShipment.locality = ''
  if (newShipment.gouvernorat && newShipment.delegation) {
    const delegations = tunisiaLocations[newShipment.gouvernorat]?.delegations
    if (delegations && delegations[newShipment.delegation]) {
      newShipment.postalCode = delegations[newShipment.delegation].postalCode
    }
  }
})

const totalPrice = computed(() => {
  return (newShipment.productPrice || 0) + (newShipment.deliveryFee || 0)
})

function generateReference() {
  const prefix = 'REF'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

function onShipmentClientSearch() {
  showClientSuggestions.value = true
  selectedShipmentClient.value = null
}

function selectClientForShipment(client: Client) {
  selectedShipmentClient.value = client
  shipmentClientSearch.value = client.name
  showClientSuggestions.value = false
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

function useNewClientName() {
  newShipment.customerName = shipmentClientSearch.value
  selectedShipmentClient.value = null
  showClientSuggestions.value = false
}

function selectShipmentCarrier(carrier: DeliveryCarrier) {
  newShipment.carrier = carrier.name
  newShipment.deliveryFee = carrierDeliveryFees[carrier.name] || 7
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

function resetForm() {
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
  newShipment.type = 'normal'
  newShipment.exchangeReason = ''
  newShipment.exchangeItemCount = 1
  newShipment.exchangeImage = null
  newShipment.exchangeDescription = ''
  clearSelectedClient()
  emit('reset')
}

function handleSubmit() {
  emit('submit', { ...newShipment, totalPrice: totalPrice.value })
}
</script>

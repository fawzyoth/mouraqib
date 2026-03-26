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

        <!-- Section 1: Informations de Destination -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span class="text-sm font-bold text-orange-600">1</span>
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
                  v-model="newShipment.customerName"
                  @input="onShipmentClientSearch"
                  @focus="showClientSuggestions = true"
                  @keydown.down.prevent="onClientSearchKey('down')"
                  @keydown.up.prevent="onClientSearchKey('up')"
                  @keydown.enter.prevent="onClientSearchKey('enter')"
                  type="text"
                  placeholder="Rechercher ou saisir un nouveau client..."
                  class="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <ClientSuggestionsDropdown
                v-if="showClientSuggestions"
                :clients="filteredShipmentClients"
                :selected-index="clientSuggestIndex"
                @select="selectClientForShipment"
              />
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
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telephone <span class="text-red-500">*</span>
                </label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                    +216
                  </span>
                  <input
                    v-model="newShipment.phone"
                    @input="onPhoneInput"
                    @focus="showPhoneSuggestions = true"
                    @keydown.down.prevent="onPhoneSearchKey('down')"
                    @keydown.up.prevent="onPhoneSearchKey('up')"
                    @keydown.enter.prevent="onPhoneSearchKey('enter')"
                    type="tel"
                    placeholder="XX XXX XXX"
                    class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-r-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <ClientSuggestionsDropdown
                  v-if="showPhoneSuggestions && !selectedShipmentClient"
                  :clients="filteredPhoneClients"
                  :wide="true"
                  :selected-index="phoneSuggestIndex"
                  @select="selectClientFromPhone"
                />
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

        <!-- Section 2: Transporteur -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span class="text-sm font-bold text-orange-600">2</span>
              </div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Transporteur</h2>
            </div>
          </div>
          <div class="p-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choisir le transporteur <span class="text-red-500">*</span></label>

            <!-- Carrier grid with scroll -->
            <div class="max-h-80 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 p-2">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="carrier in filteredCarriersLocal"
                  :key="carrier.id"
                  type="button"
                  :disabled="!carrierCoversGov(carrier)"
                  @click="carrierCoversGov(carrier) && selectShipmentCarrier(carrier)"
                  :class="[
                    'p-3 rounded-xl border-2 text-center transition-all',
                    !carrierCoversGov(carrier)
                      ? 'border-gray-100 dark:border-gray-800 opacity-40 cursor-not-allowed'
                      : newShipment.carrier === carrier.name
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
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

        <!-- Section 3: Type de colis -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span class="text-sm font-bold text-orange-600">3</span>
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

            </div>
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
            <!-- Produits -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Produits <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <!-- Header row -->
                <div class="grid grid-cols-12 gap-2 px-1">
                  <span class="col-span-7 text-xs text-gray-500">Nom du produit</span>
                  <span class="col-span-1 text-xs text-gray-500 text-center">Qté</span>
                  <span class="col-span-2 text-xs text-gray-500 text-right">Prix unit.</span>
                  <span class="col-span-1 text-xs text-gray-500 text-right">Total</span>
                  <span class="col-span-1"></span>
                </div>
                <!-- Product rows -->
                <div v-for="(product, idx) in shipmentProducts" :key="idx" class="grid grid-cols-12 gap-2 items-center">
                  <!-- Name with autocomplete -->
                  <div class="col-span-7 relative">
                    <input
                      v-model="product.name"
                      @input="onProductNameInput(idx)"
                      @focus="activeProductIndex = idx; showProductSuggestions = true"
                      @keydown.down.prevent="onProductSearchKey('down')"
                      @keydown.up.prevent="onProductSearchKey('up')"
                      @keydown.enter.prevent="onProductSearchKey('enter')"
                      type="text"
                      placeholder="Nom du produit"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <ProductSuggestionsDropdown
                      v-if="showProductSuggestions && activeProductIndex === idx && filteredProducts.length > 0"
                      :products="filteredProducts"
                      :selected-index="productSuggestIndex"
                      @select="selectProduct($event, idx)"
                    />
                  </div>
                  <!-- Quantity -->
                  <div class="col-span-1">
                    <input
                      v-model.number="product.quantity"
                      type="number"
                      min="1"
                      placeholder="1"
                      class="w-full px-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-center focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <!-- Unit price -->
                  <div class="col-span-2">
                    <input
                      v-model.number="product.unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-right focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <!-- Row total -->
                  <div class="col-span-1 text-right">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ ((Number(product.quantity) || 1) * (Number(product.unitPrice) || 0)).toFixed(2) }} DT
                    </span>
                  </div>
                  <!-- Remove button -->
                  <div class="col-span-1 flex justify-center">
                    <button
                      v-if="shipmentProducts.length > 1"
                      type="button"
                      @click="removeProduct(idx)"
                      class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Options du colis -->
            <div class="flex flex-wrap gap-2">
              <label class="flex items-center space-x-2 cursor-pointer px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input type="checkbox" v-model="newShipment.isFragile" class="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue" />
                <AlertTriangle class="w-4 h-4 text-yellow-500" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Produit Fragile</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input type="checkbox" v-model="newShipment.isBig" class="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue" />
                <Package class="w-4 h-4 text-blue-500" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Grand Colis</span>
              </label>
              <label v-if="newShipment.carrier === 'Navex'" class="flex items-center space-x-2 cursor-pointer px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input type="checkbox" v-model="newShipment.openPackage" class="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue" />
                <PackageOpen class="w-4 h-4 text-green-500" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Autoriser l'ouverture</span>
              </label>
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
                  <label class="text-sm text-gray-600 dark:text-gray-400">Sous-total produits</label>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ totalProductsPrice.toFixed(2) }} DT</span>
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
            <span class="text-sm text-gray-500">Produits</span>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ totalProductsPrice.toFixed(2) }} DT</p>
          </div>
          <div class="text-gray-300 dark:text-gray-600">+</div>
          <div>
            <span class="text-sm text-gray-500">Livraison</span>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ (Number(newShipment.deliveryFee) || 0).toFixed(2) }} DT</p>
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
          <button @click="handleSubmit" :disabled="!isFormValid || loading" :class="['px-6 py-2.5 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2', (!isFormValid || loading) && 'opacity-50 cursor-not-allowed']">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Plus v-else class="w-4 h-4" />
            {{ loading ? 'Création...' : 'Creer le colis' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  ListFilter,
  Package,
  RefreshCw,
  Camera,
  X,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Loader2,
  PackageOpen
} from 'lucide-vue-next'
import ClientSuggestionsDropdown from './ClientSuggestionsDropdown.vue'
import ProductSuggestionsDropdown from './ProductSuggestionsDropdown.vue'
import { carrierDeliveryFees } from '@/data/carriers-catalog'
import zonesData from '@/data/zones-first'

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

const props = withDefaults(defineProps<{
  clients: Client[]
  carriers: { id: number; name: string; [key: string]: any }[]
  products?: { id: string; name: string; price: number; [key: string]: any }[]
  initialCarrier?: string
  loading?: boolean
}>(), {
  loading: false,
  products: () => []
})

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
  isBig: false,
  openPackage: false,
  description: '',
  productPrice: 0,
  deliveryFee: 7,
  reference: '',
  amount: 0,
  clientId: null as number | null
})

// Client autocomplete
const showClientSuggestions = ref(false)
const selectedShipmentClient = ref<Client | null>(null)
const clientSuggestIndex = ref(-1)

// Snapshot of original client data to detect changes
const originalClientData = ref<Record<string, string> | null>(null)

const isFormValid = computed(() => {
  const base =
    !!newShipment.customerName.trim() &&
    !!newShipment.phone.trim() &&
    !!newShipment.address.trim() &&
    !!newShipment.gouvernorat &&
    !!newShipment.delegation &&
    !!newShipment.carrier &&
    shipmentProducts.value.some(p => p.name.trim() !== '')
  if (!base) return false
  if (newShipment.type === 'exchange') return !!newShipment.exchangeReason
  return true
})

// Phone-based client match (exact)
const phoneMatchedClient = computed(() => {
  const phone = newShipment.phone.replace(/\s/g, '')
  if (phone.length < 4) return null
  return props.clients.find(c => c.phone.replace(/\s/g, '') === phone) || null
})

// Phone typeahead (partial match)
const showPhoneSuggestions = ref(false)
const phoneSuggestIndex = ref(-1)
const filteredPhoneClients = computed(() => {
  const phone = newShipment.phone.replace(/\s/g, '')
  if (phone.length < 3 || selectedShipmentClient.value) return []
  return props.clients.filter(c =>
    c.phone.replace(/\s/g, '').includes(phone)
  ).slice(0, 5)
})

function onPhoneInput() {
  showPhoneSuggestions.value = true
  phoneSuggestIndex.value = -1
}

function selectClientFromPhone(client: Client) {
  showPhoneSuggestions.value = false
  selectClientForShipment(client)
}

const filteredShipmentClients = computed(() => {
  if (newShipment.customerName.length < 1) return []
  const search = newShipment.customerName.toLowerCase()
  return props.clients.filter(client =>
    client.name.toLowerCase().includes(search) ||
    client.phone.includes(search) ||
    client.address.toLowerCase().includes(search)
  ).slice(0, 5)
})

// Multi-product list
interface ShipmentProduct {
  name: string
  quantity: number
  unitPrice: number
}
const shipmentProducts = ref<ShipmentProduct[]>([{ name: '', quantity: 1, unitPrice: 0 }])
const activeProductIndex = ref(-1)

function addProduct() {
  shipmentProducts.value.push({ name: '', quantity: 1, unitPrice: 0 })
}

watch(shipmentProducts, (products) => {
  const last = products[products.length - 1]
  if (last && last.name.trim()) {
    products.push({ name: '', quantity: 1, unitPrice: 0 })
  }
}, { deep: true })
function removeProduct(idx: number) {
  shipmentProducts.value.splice(idx, 1)
}

// Product autocomplete
const showProductSuggestions = ref(false)
const productSuggestIndex = ref(-1)

const filteredProducts = computed(() => {
  if (!props.products) return []
  const idx = activeProductIndex.value
  if (idx < 0 || idx >= shipmentProducts.value.length) return []
  const search = shipmentProducts.value[idx].name.toLowerCase()
  if (!search) return props.products.slice(0, 5)
  return props.products.filter(p =>
    p.name.toLowerCase().includes(search)
  ).slice(0, 5)
})

function onProductNameInput(idx: number) {
  activeProductIndex.value = idx
  showProductSuggestions.value = true
  productSuggestIndex.value = -1
}

function selectProduct(product: any, idx?: number) {
  const targetIdx = idx ?? activeProductIndex.value
  if (targetIdx >= 0 && targetIdx < shipmentProducts.value.length) {
    shipmentProducts.value[targetIdx].name = product.name
    shipmentProducts.value[targetIdx].unitPrice = product.price
  }
  showProductSuggestions.value = false
}

// Carrier search
const carrierSearchQuery = ref('')

const filteredCarriersLocal = computed(() => {
  const connected = props.carriers.filter((c: any) => c.apiStatus === 'connected')
  if (!carrierSearchQuery.value) return connected
  const search = carrierSearchQuery.value.toLowerCase()
  return connected.filter(carrier =>
    carrier.name.toLowerCase().includes(search)
  )
})

function carrierCoversGov(carrier: any): boolean {
  if (!newShipment.gouvernorat) return true
  if (carrier.allRegions) return true
  return (carrier.regions || []).includes(newShipment.gouvernorat)
}

function getCarrierInitials(name: string): string {
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Location cascading (zones-first data)
const gouvernorats = computed(() => Object.keys(zonesData).sort())

const availableDelegations = computed(() => {
  if (!newShipment.gouvernorat || !zonesData[newShipment.gouvernorat]) return []
  return Object.keys(zonesData[newShipment.gouvernorat]).sort()
})

const availableLocalities = computed(() => {
  if (!newShipment.gouvernorat || !newShipment.delegation || !zonesData[newShipment.gouvernorat]?.[newShipment.delegation]) return []
  return Object.keys(zonesData[newShipment.gouvernorat][newShipment.delegation]).sort()
})

// Skip cascading resets during client prefill
let skipReset = false

watch(() => newShipment.gouvernorat, () => {
  if (skipReset) return
  newShipment.delegation = ''
  newShipment.locality = ''
  newShipment.postalCode = ''
  // Auto-select if only one carrier covers this governorate
  const validCarriers = filteredCarriersLocal.value.filter(carrierCoversGov)
  if (validCarriers.length === 1) {
    selectShipmentCarrier(validCarriers[0])
  }
})

watch(() => newShipment.delegation, () => {
  if (skipReset) return
  newShipment.locality = ''
  newShipment.postalCode = ''
})

watch(() => newShipment.locality, () => {
  if (skipReset) return
  if (newShipment.gouvernorat && newShipment.delegation && newShipment.locality) {
    const loc = zonesData[newShipment.gouvernorat]?.[newShipment.delegation]?.[newShipment.locality]
    newShipment.postalCode = loc?.codePostal || ''
  } else {
    newShipment.postalCode = ''
  }
})

const totalProductsPrice = computed(() =>
  shipmentProducts.value.reduce((sum, p) => sum + (Number(p.quantity) || 1) * (Number(p.unitPrice) || 0), 0)
)

const totalPrice = computed(() => totalProductsPrice.value + (Number(newShipment.deliveryFee) || 0))

function generateReference() {
  const prefix = 'REF'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

function onShipmentClientSearch() {
  showClientSuggestions.value = true
  selectedShipmentClient.value = null
  clientSuggestIndex.value = -1
}

function selectClientForShipment(client: Client) {
  selectedShipmentClient.value = client
  showClientSuggestions.value = false

  // Prevent watchers from cascading-resetting the prefilled values
  skipReset = true
  newShipment.customerName = client.name
  newShipment.phone = client.phone
  newShipment.phoneSecondary = client.phoneSecondary || ''
  newShipment.address = client.address
  newShipment.gouvernorat = client.region || ''
  newShipment.delegation = client.delegation || ''
  newShipment.locality = client.locality || ''
  newShipment.postalCode = client.postalCode || ''
  newShipment.clientId = client.id

  // Snapshot for change detection
  originalClientData.value = {
    phone: client.phone || '',
    phoneSecondary: client.phoneSecondary || '',
    address: client.address || '',
    gouvernorat: client.region || '',
    delegation: client.delegation || '',
    locality: client.locality || '',
    postalCode: client.postalCode || '',
  }

  // Re-enable cascade resets after all values have settled
  setTimeout(() => { skipReset = false }, 0)
}

function clearSelectedClient() {
  selectedShipmentClient.value = null
  newShipment.customerName = ''
  newShipment.phone = ''
  newShipment.address = ''
  newShipment.clientId = null
  originalClientData.value = null
}


function selectShipmentCarrier(carrier: DeliveryCarrier) {
  newShipment.carrier = carrier.name
  const baseFee = carrier.fraisColisLivresClient ?? carrier.fraisColisLivres ?? carrierDeliveryFees[carrier.name] ?? 7
  const bigFee = carrier.fraisColisBig ?? baseFee
  newShipment.deliveryFee = newShipment.isBig ? bigFee : baseFee
}

watch(() => newShipment.isBig, (isBig) => {
  const carrier = props.carriers.find((c: any) => c.name === newShipment.carrier)
  if (!carrier) return
  const baseFee = carrier.fraisColisLivresClient ?? carrier.fraisColisLivres ?? carrierDeliveryFees[carrier.name] ?? 7
  const bigFee = carrier.fraisColisBig ?? baseFee
  newShipment.deliveryFee = isBig ? bigFee : baseFee
})

// Pre-select carrier when coming back via "Create another"
onMounted(() => {
  if (props.initialCarrier) {
    const match = props.carriers.find(c => c.name === props.initialCarrier)
    if (match) {
      selectShipmentCarrier(match as unknown as DeliveryCarrier)
    }
  }
})

// Close dropdowns on outside click
function onDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    showClientSuggestions.value = false
    showPhoneSuggestions.value = false
    showProductSuggestions.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

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
  newShipment.isFragile = false
  newShipment.isBig = false
  newShipment.openPackage = false
  newShipment.description = ''
  newShipment.deliveryFee = 7
  shipmentProducts.value = [{ name: '', quantity: 1, unitPrice: 0 }]
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
  if (!isFormValid.value) return
  // Compute client data changes if an existing client was selected
  const clientChanges: { field: string; label: string; oldValue: string; newValue: string }[] = []
  if (selectedShipmentClient.value && originalClientData.value) {
    const fieldMap: { formKey: string; field: string; label: string }[] = [
      { formKey: 'phone', field: 'phone', label: 'Téléphone' },
      { formKey: 'phoneSecondary', field: 'phoneSecondary', label: 'Tél. secondaire' },
      { formKey: 'address', field: 'address', label: 'Adresse' },
      { formKey: 'gouvernorat', field: 'gouvernorat', label: 'Gouvernorat' },
      { formKey: 'delegation', field: 'delegation', label: 'Délégation' },
      { formKey: 'locality', field: 'locality', label: 'Localité' },
      { formKey: 'postalCode', field: 'postalCode', label: 'Code postal' },
    ]
    for (const { formKey, field, label } of fieldMap) {
      const oldVal = originalClientData.value[field] || ''
      const newVal = (newShipment as any)[formKey] || ''
      if (oldVal !== newVal) {
        clientChanges.push({ field, label, oldValue: oldVal, newValue: newVal })
      }
    }
  }
  const filledProducts = shipmentProducts.value.filter(p => p.name.trim())
  const productsLines = filledProducts
    .map(p => `- ${p.name} x${p.quantity}`)
    .join('\n')
  const fullDescription = [productsLines, newShipment.description].filter(Boolean).join('\n\n')

  emit('submit', {
    ...newShipment,
    productName: filledProducts.map(p => p.name).join(', '),
    productPrice: totalProductsPrice.value,
    description: fullDescription,
    totalPrice: totalPrice.value,
    products: filledProducts,
    clientChanges: clientChanges.length > 0 ? clientChanges : undefined,
  })
}

function onClientSearchKey(key: 'up' | 'down' | 'enter') {
  if (!showClientSuggestions.value || filteredShipmentClients.value.length === 0) {
    if (key === 'enter') showClientSuggestions.value = true
    return
  }
  const len = filteredShipmentClients.value.length
  if (key === 'down') {
    clientSuggestIndex.value = (clientSuggestIndex.value + 1) % len
  } else if (key === 'up') {
    clientSuggestIndex.value = clientSuggestIndex.value <= 0 ? len - 1 : clientSuggestIndex.value - 1
  } else if (key === 'enter') {
    if (clientSuggestIndex.value >= 0 && clientSuggestIndex.value < len) {
      selectClientForShipment(filteredShipmentClients.value[clientSuggestIndex.value])
    }
  }
}

function onPhoneSearchKey(key: 'up' | 'down' | 'enter') {
  if (!showPhoneSuggestions.value || filteredPhoneClients.value.length === 0) {
    if (key === 'enter') showPhoneSuggestions.value = true
    return
  }
  const len = filteredPhoneClients.value.length
  if (key === 'down') {
    phoneSuggestIndex.value = (phoneSuggestIndex.value + 1) % len
  } else if (key === 'up') {
    phoneSuggestIndex.value = phoneSuggestIndex.value <= 0 ? len - 1 : phoneSuggestIndex.value - 1
  } else if (key === 'enter') {
    if (phoneSuggestIndex.value >= 0 && phoneSuggestIndex.value < len) {
      selectClientFromPhone(filteredPhoneClients.value[phoneSuggestIndex.value])
    }
  }
}

function onProductSearchKey(key: 'up' | 'down' | 'enter') {
  if (!showProductSuggestions.value || filteredProducts.value.length === 0) {
    if (key === 'enter') showProductSuggestions.value = true
    return
  }
  const len = filteredProducts.value.length
  if (key === 'down') {
    productSuggestIndex.value = (productSuggestIndex.value + 1) % len
  } else if (key === 'up') {
    productSuggestIndex.value = productSuggestIndex.value <= 0 ? len - 1 : productSuggestIndex.value - 1
  } else if (key === 'enter') {
    if (productSuggestIndex.value >= 0 && productSuggestIndex.value < len) {
      selectProduct(filteredProducts.value[productSuggestIndex.value])
    }
  }
}
</script>

<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
      <button @click="$emit('close')" class="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition-all">
        <X class="w-4 h-4" />
        <span class="hidden sm:inline">Fermer</span>
      </button>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-950">
    <!-- Sync Progress Overlay -->
    <div v-if="syncSteps.length > 0" class="max-w-lg mx-auto mt-12">
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck class="w-5 h-5 text-orange-500" />
            Configuration en cours
          </h4>
          <p class="text-sm text-gray-500 mt-1">{{ newCarrier.name }}</p>
        </div>
        <div class="p-6 space-y-4">
          <div v-for="(step, i) in syncSteps" :key="i" class="flex items-start gap-3">
            <div class="mt-0.5">
              <div v-if="step.status === 'loading'" class="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
              <div v-else-if="step.status === 'done'" class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle class="w-4 h-4 text-white" />
              </div>
              <div v-else-if="step.status === 'error'" class="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <X class="w-4 h-4 text-white" />
              </div>
              <div v-else class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium" :class="{
                'text-gray-900 dark:text-white': step.status === 'loading' || step.status === 'done',
                'text-red-600': step.status === 'error',
                'text-gray-400 dark:text-gray-500': step.status === 'pending'
              }">{{ step.label }}</p>
              <p v-if="step.detail" class="text-xs mt-0.5" :class="step.status === 'error' ? 'text-red-500' : 'text-gray-500'">{{ step.detail }}</p>
            </div>
          </div>
        </div>
        <div v-if="syncSteps.every(s => s.status === 'done' || s.status === 'error')" class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button @click="$emit('close')" class="px-6 py-2.5 rounded-xl text-sm font-medium bg-[#4959b4] hover:bg-[#3a4791] text-white shadow-sm hover:shadow-md transition-all">
            Terminer
          </button>
        </div>
      </div>
    </div>

    <div v-else class="max-w-5xl mx-auto">
      <!-- Progress Stepper -->
      <div v-if="!editingCarrier" class="mb-8">
        <div class="flex items-center justify-between relative">
          <!-- Progress Line Background -->
          <div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 mx-16"></div>
          <!-- Progress Line Active -->
          <div class="absolute top-5 left-0 h-0.5 bg-orange-500 mx-16 transition-all duration-500" :style="{ width: `${((carrierWizardStep - 1) / 3) * 100}%` }"></div>

          <!-- Step 1 -->
          <div class="relative flex flex-col items-center z-10">
            <button @click="$emit('update:carrierWizardStep', 1)" :class="[
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
            <button @click="selectedModalCarrier && $emit('update:carrierWizardStep', 2)" :disabled="!selectedModalCarrier" :class="[
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
            <button @click="((carrierNeedsField('accountId') ? newCarrier.apiId : true) && newCarrier.apiKey) && $emit('update:carrierWizardStep', 3)" :disabled="(carrierNeedsField('accountId') && !newCarrier.apiId) || !newCarrier.apiKey" :class="[
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
              carrierWizardStep >= 3 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
              ((carrierNeedsField('accountId') && !newCarrier.apiId) || !newCarrier.apiKey) && 'cursor-not-allowed opacity-50'
            ]">
              <Receipt v-if="carrierWizardStep > 3" class="w-5 h-5" />
              <span v-else>3</span>
            </button>
            <span class="mt-2 text-xs font-medium" :class="carrierWizardStep >= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'">Tarification</span>
          </div>

          <!-- Step 4 -->
          <div class="relative flex flex-col items-center z-10">
            <button @click="carrierWizardStep >= 3 && $emit('update:carrierWizardStep', 4)" :disabled="carrierWizardStep < 3" :class="[
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

      <div>
        <!-- Main Form Column -->
        <div class="space-y-6">
          <!-- Step 1: Carrier Selection -->
          <div v-if="!editingCarrier && carrierWizardStep === 1" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Truck class="w-5 h-5 mr-2 text-orange-500" />
                Choisissez votre transporteur
              </h4>
              <p class="text-gray-500 text-sm mt-1">Plus de 65 transporteurs tunisiens disponibles</p>
            </div>
            <div class="p-6">
              <div class="relative mb-5">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  :value="modalCarrierSearchQuery"
                  @input="$emit('update:modalCarrierSearchQuery', ($event.target as HTMLInputElement).value)"
                  type="text"
                  placeholder="Rechercher un transporteur..."
                  class="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <span v-if="modalCarrierSearchQuery" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1 rounded-full font-medium">
                  {{ filteredModalCarriers.length }} trouv&eacute;s
                </span>
              </div>

              <div class="max-h-96 overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    v-for="carrier in filteredModalCarriers"
                    :key="carrier.id"
                    type="button"
                    @click="carrier.enabled ? $emit('select-carrier-from-list', carrier) : null"
                    :disabled="!carrier.enabled"
                    :class="[
                      'group relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                      !carrier.enabled
                        ? 'border-transparent bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                        : selectedModalCarrier?.id === carrier.id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10 scale-[1.02]'
                          : 'border-transparent bg-white dark:bg-gray-900 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md'
                    ]"
                  >
                    <div v-if="!carrier.enabled" class="absolute top-2 right-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-medium rounded-full">
                      Bient&ocirc;t
                    </div>
                    <div class="flex flex-col items-center text-center gap-3">
                      <div class="relative">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110" :style="{ backgroundColor: carrier.color + '15', color: carrier.enabled ? carrier.color : '#9ca3af' }">
                          {{ getCarrierInitials(carrier.name) }}
                        </div>
                        <div v-if="selectedModalCarrier?.id === carrier.id" class="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <CheckCircle class="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div class="min-w-0 w-full">
                        <p class="font-semibold text-sm truncate" :class="carrier.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'">{{ carrier.name }}</p>
                      </div>
                    </div>
                  </button>
                </div>
                <p v-if="filteredModalCarriers.length === 0" class="text-center text-sm text-gray-500 py-12">
                  <Search class="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  Aucun transporteur trouv&eacute;
                </p>
              </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <button @click="$emit('close')" class="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
              <button
                @click="$emit('update:carrierWizardStep', 2)"
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
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom du transporteur</label>
                <input :value="newCarrier.name" @input="$emit('update:newCarrierField', 'name', ($event.target as HTMLInputElement).value)" type="text" placeholder="Ex: Aramex, DHL, etc." class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" :readonly="!!selectedModalCarrier" />
              </div>
              <div :class="carrierNeedsField('accountId') ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''">
                <div v-if="carrierNeedsField('accountId')">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API ID <span class="text-red-500">*</span></label>
                  <input :value="newCarrier.apiId" @input="$emit('update:newCarrierField', 'apiId', ($event.target as HTMLInputElement).value)" type="text" placeholder="CARRIER-API-001" class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input :value="newCarrier.apiKey" @input="$emit('update:newCarrierField', 'apiKey', ($event.target as HTMLInputElement).value)" :type="showApiKey ? 'text' : 'password'" placeholder="Votre cl&eacute; API secr&egrave;te" class="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <button type="button" @click="$emit('update:showApiKey', !showApiKey)" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <Eye v-if="!showApiKey" class="w-5 h-5" />
                      <EyeOff v-else class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!editingCarrier" class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <button @click="$emit('update:carrierWizardStep', 1)" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft class="w-4 h-4" />
                Retour
              </button>
              <button
                @click="$emit('update:carrierWizardStep', 3)"
                :disabled="(carrierNeedsField('accountId') && !newCarrier.apiId) || !newCarrier.apiKey"
                :class="[
                  'px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                  (carrierNeedsField('accountId') ? newCarrier.apiId : true) && newCarrier.apiKey
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
              <p class="text-gray-500 text-sm mt-1">D&eacute;finissez vos tarifs de livraison</p>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colis livr&eacute;s</label>
                  <div class="flex items-baseline gap-1">
                    <input :value="newCarrier.fraisColisLivres" @input="$emit('update:newCarrierField', 'fraisColisLivres', Number(($event.target as HTMLInputElement).value))" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                    <span class="text-sm text-gray-400 font-medium">DT</span>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colis retour</label>
                  <div class="flex items-baseline gap-1">
                    <input :value="newCarrier.fraisColisRetour" @input="$emit('update:newCarrierField', 'fraisColisRetour', Number(($event.target as HTMLInputElement).value))" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                    <span class="text-sm text-gray-400 font-medium">DT</span>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colis &eacute;change</label>
                  <div class="flex items-baseline gap-1">
                    <input :value="newCarrier.fraisColisEchange" @input="$emit('update:newCarrierField', 'fraisColisEchange', Number(($event.target as HTMLInputElement).value))" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                    <span class="text-sm text-gray-400 font-medium">DT</span>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Colis BIG</label>
                  <div class="flex items-baseline gap-1">
                    <input :value="newCarrier.fraisColisBig" @input="$emit('update:newCarrierField', 'fraisColisBig', Number(($event.target as HTMLInputElement).value))" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                    <span class="text-sm text-gray-400 font-medium">DT</span>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Pickup</label>
                  <div class="flex items-baseline gap-1">
                    <input :value="newCarrier.fraisColisPickup" @input="$emit('update:newCarrierField', 'fraisColisPickup', Number(($event.target as HTMLInputElement).value))" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                    <span class="text-sm text-gray-400 font-medium">DT</span>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                  <DollarSign class="w-4 h-4 mr-2 text-gray-400" />
                  Frais additionnels
                </h5>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Frais paiement COD</label>
                    <div class="flex items-baseline gap-1">
                      <input :value="newCarrier.fraisPaiement" @input="$emit('update:newCarrierField', 'fraisPaiement', Number(($event.target as HTMLInputElement).value))" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                      <span class="text-sm text-gray-400 font-medium">%</span>
                    </div>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Retenu passage</label>
                    <div class="flex items-baseline gap-1">
                      <input :value="newCarrier.retenuPassage" @input="$emit('update:newCarrierField', 'retenuPassage', Number(($event.target as HTMLInputElement).value))" type="number" step="0.01" min="0" class="w-full px-0 py-1 border-0 border-b-2 border-gray-200 dark:border-gray-600 bg-transparent text-xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:border-orange-500" />
                      <span class="text-sm text-gray-400 font-medium">DT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!editingCarrier" class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <button @click="$emit('update:carrierWizardStep', 2)" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft class="w-4 h-4" />
                Retour
              </button>
              <button @click="$emit('update:carrierWizardStep', 4)" class="px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 bg-[#4959b4] hover:bg-[#3a4791] text-white shadow-sm hover:shadow-md">
                Continuer
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Step 4: Coverage -->
          <div v-if="carrierWizardStep === 4 || editingCarrier" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <MapPinned class="w-5 h-5 mr-2 text-orange-500" />
                Zones de couverture
              </h4>
              <p class="text-gray-500 text-sm mt-1">S&eacute;lectionnez les r&eacute;gions desservies</p>
            </div>
            <div class="p-6">
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
                    :checked="newCarrier.allRegions"
                    @change="$emit('toggle-all-regions')"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                </div>
              </label>

              <div v-if="!newCarrier.allRegions" class="space-y-4">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    <span class="font-semibold text-orange-600">{{ newCarrier.regions.length }}</span> / 24 gouvernorats
                  </p>
                  <div class="flex gap-2">
                    <button @click="$emit('select-all-regions')" type="button" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 transition-colors">
                      Tout s&eacute;lectionner
                    </button>
                    <button @click="$emit('clear-all-regions')" type="button" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors">
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
                    <input type="checkbox" :value="gov" :checked="newCarrier.regions.includes(gov)" @change="$emit('toggle-region', gov)" class="hidden" />
                    <MapPin :class="['w-4 h-4', newCarrier.regions.includes(gov) ? 'text-orange-500' : 'text-gray-400']" />
                    <span :class="['text-sm font-medium', newCarrier.regions.includes(gov) ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400']">{{ gov }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <button v-if="!editingCarrier" @click="$emit('update:carrierWizardStep', 3)" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft class="w-4 h-4" />
                Retour
              </button>
              <button v-else @click="$emit('close')" class="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
              <button @click="$emit('save')" class="px-8 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 bg-[#4959b4] hover:bg-[#3a4791] text-white shadow-sm hover:shadow-md">
                <CheckCircle class="w-5 h-5" />
                {{ editingCarrier ? 'Enregistrer' : 'Ajouter le transporteur' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ListFilter,
  X,
  Truck,
  Key,
  Receipt,
  MapPinned,
  Search,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  DollarSign,
  Globe,
  MapPin
} from 'lucide-vue-next'

interface NewCarrierForm {
  name: string
  apiId: string
  apiKey: string
  fraisColisLivres: number
  fraisColisRetour: number
  fraisColisEchange: number
  fraisColisBig: number
  fraisColisPickup: number
  fraisPaiement: number
  retenuPassage: number
  allRegions: boolean
  regions: string[]
}

interface ModalCarrier {
  id: string
  name: string
  color: string
  deliveryTime: string
  description: string
  enabled?: boolean
  configFields?: Array<{ key: string; label: string; type: string; placeholder?: string; required?: boolean }>
}

interface SyncStep {
  label: string
  status: 'pending' | 'loading' | 'done' | 'error'
  detail?: string
}

interface Props {
  editingCarrier: number | null
  newCarrier: NewCarrierForm
  carrierWizardStep: number
  showApiKey: boolean
  modalCarrierSearchQuery: string
  selectedModalCarrier: ModalCarrier | null
  filteredModalCarriers: ModalCarrier[]
  gouvernorats: string[]
  syncSteps: SyncStep[]
}

const props = defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'close': []
  'save': []
  'update:carrierWizardStep': [step: number]
  'update:modalCarrierSearchQuery': [query: string]
  'update:showApiKey': [show: boolean]
  'update:newCarrierField': [field: string, value: string | number]
  'select-carrier-from-list': [carrier: ModalCarrier]
  'toggle-all-regions': []
  'select-all-regions': []
  'clear-all-regions': []
  'toggle-region': [region: string]
}>()

function getCarrierInitials(name: string): string {
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function carrierNeedsField(fieldKey: string): boolean {
  if (!props.selectedModalCarrier?.configFields) return true
  return props.selectedModalCarrier.configFields.some(f => f.key === fieldKey)
}
</script>

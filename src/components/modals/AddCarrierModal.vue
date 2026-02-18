<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 z-10">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingCarrier ? 'Modifier le transporteur' : 'Ajouter un transporteur' }}
            </h3>
            <button @click="handleClose" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- Section 0: Carrier Selection -->
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

            <!-- Section 1: General Info -->
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

            <!-- Section 2: Tariff Grid -->
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

            <!-- Section 3: Additional Fees -->
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

            <!-- Section 4: Coverage Zones -->
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
                    v-for="gov in governorats"
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
            <button @click="handleClose" class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              Annuler
            </button>
            <button @click="handleSave" class="px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">
              {{ editingCarrier ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import {
  X,
  Search,
  Truck,
  CheckCircle,
  Building2,
  Receipt,
  DollarSign,
  MapPinned
} from 'lucide-vue-next'
import { DEFAULT_CARRIER_FEES } from '@/data/pricing'

const props = defineProps<{
  show: boolean
  editingCarrier: any
  availableCarriers: any[]
  governorats: string[]
}>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const modalCarrierSearchQuery = ref('')
const selectedModalCarrier = ref<any>(null)

const newCarrier = reactive({
  name: '',
  apiId: '',
  apiKey: '',
  ...DEFAULT_CARRIER_FEES,
  allRegions: true,
  regions: [] as string[]
})

const filteredModalCarriers = computed(() => {
  if (!modalCarrierSearchQuery.value) return props.availableCarriers
  const search = modalCarrierSearchQuery.value.toLowerCase()
  return props.availableCarriers.filter(carrier =>
    carrier.name.toLowerCase().includes(search) ||
    carrier.description?.toLowerCase().includes(search)
  )
})

function getCarrierInitials(name: string): string {
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function selectCarrierFromList(carrier: any) {
  selectedModalCarrier.value = carrier
  newCarrier.name = carrier.name
}

function handleAllRegionsToggle() {
  if (newCarrier.allRegions) {
    newCarrier.regions = []
  }
}

function selectAllRegions() {
  newCarrier.regions = [...props.governorats]
}

function clearAllRegions() {
  newCarrier.regions = []
}

function resetForm() {
  newCarrier.name = ''
  newCarrier.apiId = ''
  newCarrier.apiKey = ''
  Object.assign(newCarrier, DEFAULT_CARRIER_FEES)
  newCarrier.allRegions = true
  newCarrier.regions = []
  modalCarrierSearchQuery.value = ''
  selectedModalCarrier.value = null
}

function handleClose() {
  resetForm()
  emit('close')
}

function handleSave() {
  emit('save', {
    ...newCarrier,
    selectedModalCarrier: selectedModalCarrier.value
  })
}

// When editing, populate form with existing data
watch(() => props.editingCarrier, (carrier) => {
  if (carrier) {
    newCarrier.name = carrier.name || ''
    newCarrier.apiId = carrier.apiId || ''
    newCarrier.apiKey = carrier.apiKey || ''
    newCarrier.fraisColisLivres = carrier.fraisColisLivres ?? DEFAULT_CARRIER_FEES.fraisColisLivres
    newCarrier.fraisColisRetour = carrier.fraisColisRetour ?? DEFAULT_CARRIER_FEES.fraisColisRetour
    newCarrier.fraisColisEchange = carrier.fraisColisEchange ?? DEFAULT_CARRIER_FEES.fraisColisEchange
    newCarrier.fraisColisBig = carrier.fraisColisBig ?? DEFAULT_CARRIER_FEES.fraisColisBig
    newCarrier.fraisColisPickup = carrier.fraisColisPickup ?? DEFAULT_CARRIER_FEES.fraisColisPickup
    newCarrier.totalFraisLivraison = carrier.totalFraisLivraison ?? DEFAULT_CARRIER_FEES.totalFraisLivraison
    newCarrier.fraisPaiement = carrier.fraisPaiement ?? DEFAULT_CARRIER_FEES.fraisPaiement
    newCarrier.retenuPassage = carrier.retenuPassage ?? DEFAULT_CARRIER_FEES.retenuPassage
    newCarrier.allRegions = carrier.allRegions ?? true
    newCarrier.regions = carrier.regions ? [...carrier.regions] : []
  }
}, { immediate: true })
</script>

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
                    <input v-model="newCarrier.apiKey" type="text" autocomplete="off" placeholder="Clé API secrète" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div v-if="newCarrier.name.toLowerCase().includes('navex')">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sender ID
                  </label>
                  <input v-model="newCarrier.senderId" type="text" placeholder="Ex: 7924" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                  <p class="text-xs text-gray-500 mt-1">Identifiant expéditeur (utilisé pour les bordereaux Navex)</p>
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
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix livraison client</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.fraisColisLivresClient" type="number" step="0.01" :min="newCarrier.fraisColisLivres" placeholder="Optionnel" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                  <p class="text-xs text-gray-400 mt-1">Frais affichés au client (≥ frais transporteur)</p>
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
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">DT</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Montant prélevé sur le paiement COD (utilisé si aucune tranche définie)</p>
                  <!-- Brackets editor -->
                  <div class="mt-3 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Tranches variables</span>
                      <button type="button" @click="addBracket" class="text-xs text-orange-600 hover:text-orange-800 font-medium">+ Ajouter</button>
                    </div>
                    <div v-if="newCarrier.fraisPaiementTranches.length === 0" class="text-xs text-gray-400 italic">
                      Aucune tranche — frais fixe utilisé
                    </div>
                    <div v-if="newCarrier.fraisPaiementTranches.length > 0" class="grid grid-cols-[1fr_auto_1fr_auto] gap-x-2 gap-y-1 items-center text-xs text-gray-500 font-medium mb-1 px-1">
                      <span>Montant COD</span><span></span><span>Frais</span><span></span>
                    </div>
                    <div v-for="(bracket, i) in newCarrier.fraisPaiementTranches" :key="i" class="flex items-center gap-2">
                      <span class="text-xs text-gray-400 whitespace-nowrap">&lt;</span>
                      <input
                        :value="bracket.upTo ?? ''"
                        type="number" step="1" min="0"
                        placeholder="∞"
                        class="w-24 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs focus:ring-1 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        @change="onBracketUpToChange(bracket, $event)"
                      />
                      <span class="text-xs text-gray-400">DT →</span>
                      <input
                        v-model.number="bracket.fee"
                        type="number" step="0.001" min="0"
                        class="w-24 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs focus:ring-1 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <span class="text-xs text-gray-400">DT</span>
                      <button type="button" @click="removeBracket(i)" class="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                    </div>
                    <p v-if="newCarrier.fraisPaiementTranches.length > 0" class="text-xs text-gray-400">
                      Laisser "Montant" vide pour la dernière tranche (≥ tout)
                    </p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retenu de passage</label>
                  <div class="flex">
                    <input v-model.number="newCarrier.retenuPassage" type="number" step="0.01" min="0" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-l-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">%</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Pourcentage retenu par passage du livreur</p>
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
import type { PaymentFeeBracket } from '@/mappers/carriers'

const NAVEX_DEFAULT_BRACKETS: PaymentFeeBracket[] = [
  { upTo: 50,   fee: 0 },
  { upTo: 150,  fee: 2 },
  { upTo: 300,  fee: 2.5 },
  { upTo: 600,  fee: 4 },
  { upTo: 1000, fee: 5.5 },
  { upTo: null, fee: 8 },
]

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
  senderId: '',
  ...DEFAULT_CARRIER_FEES,
  fraisColisLivresClient: null as number | null,
  fraisPaiementTranches: [] as PaymentFeeBracket[],
  allRegions: true,
  regions: [] as string[]
})

function addBracket() {
  newCarrier.fraisPaiementTranches.push({ upTo: null, fee: 0 })
}

function removeBracket(index: number) {
  newCarrier.fraisPaiementTranches.splice(index, 1)
}

function onBracketUpToChange(bracket: PaymentFeeBracket, event: Event) {
  const val = (event.target as HTMLInputElement).value
  bracket.upTo = val === '' ? null : Number(val)
}

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
  newCarrier.senderId = ''
  Object.assign(newCarrier, DEFAULT_CARRIER_FEES)
  newCarrier.fraisPaiementTranches = []
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
    newCarrier.senderId = carrier.senderId || ''
    newCarrier.fraisColisLivres = carrier.fraisColisLivres ?? DEFAULT_CARRIER_FEES.fraisColisLivres
    newCarrier.fraisColisLivresClient = carrier.fraisColisLivresClient ?? null
    newCarrier.fraisColisRetour = carrier.fraisColisRetour ?? DEFAULT_CARRIER_FEES.fraisColisRetour
    newCarrier.fraisColisEchange = carrier.fraisColisEchange ?? DEFAULT_CARRIER_FEES.fraisColisEchange
    newCarrier.fraisColisBig = carrier.fraisColisBig ?? DEFAULT_CARRIER_FEES.fraisColisBig
    newCarrier.fraisColisPickup = carrier.fraisColisPickup ?? DEFAULT_CARRIER_FEES.fraisColisPickup
    newCarrier.fraisPaiement = carrier.fraisPaiement ?? DEFAULT_CARRIER_FEES.fraisPaiement
    const existingBrackets = carrier.fraisPaiementTranches ?? []
    newCarrier.fraisPaiementTranches = existingBrackets.length > 0
      ? existingBrackets.map((b: PaymentFeeBracket) => ({ ...b }))
      : (carrier.name || '').toLowerCase().includes('navex')
        ? NAVEX_DEFAULT_BRACKETS.map(b => ({ ...b }))
        : []
    newCarrier.retenuPassage = carrier.retenuPassage ?? DEFAULT_CARRIER_FEES.retenuPassage
    newCarrier.allRegions = carrier.allRegions ?? true
    newCarrier.regions = carrier.regions ? [...carrier.regions] : []
  }
}, { immediate: true })

// Auto-populate Navex brackets when name is set and no brackets are configured yet
watch(() => newCarrier.name, (name) => {
  if (name.toLowerCase().includes('navex') && newCarrier.fraisPaiementTranches.length === 0) {
    newCarrier.fraisPaiementTranches = NAVEX_DEFAULT_BRACKETS.map(b => ({ ...b }))
  }
})
</script>

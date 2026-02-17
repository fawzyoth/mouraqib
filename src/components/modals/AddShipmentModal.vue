<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Ajouter un colis</h3>
            <button @click="handleClose" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
                    <p class="text-xs text-gray-500 truncate">{{ client.phone }} &bull; {{ client.region }}</p>
                  </div>
                  <span v-if="client.status === 'vip'" class="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">VIP</span>
                  <span v-if="client.status === 'blocked'" class="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">Bloqué</span>
                </button>
              </div>
              <!-- No results -->
              <div v-if="showClientSuggestions && shipmentClientSearch.length >= 2 && filteredShipmentClients.length === 0" class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p class="text-sm text-gray-500 text-center">Aucun client trouvé</p>
                <button @click="handleOpenNewClient" class="w-full mt-2 px-3 py-2 text-sm font-medium text-primary-blue hover:bg-primary-blue/10 rounded-lg flex items-center justify-center space-x-1">
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
                  <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.name">
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
              @click="handleClose"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              @click="handleSubmit"
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
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import {
  X,
  Search,
  Plus,
  AlertTriangle,
  MapPin,
  Package,
  RefreshCw,
  Phone as PhoneIcon,
  Banknote
} from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  clients: any[]
  carriers: any[]
}>()

const emit = defineEmits<{
  close: []
  submit: [data: any]
  'open-new-client': [searchName: string]
}>()

const shipmentClientSearch = ref('')
const showClientSuggestions = ref(false)
const selectedShipmentClient = ref<any>(null)

const newShipment = reactive({
  address: '',
  type: 'normal' as 'normal' | 'exchange',
  exchangeReason: '',
  exchangeItemCount: 1,
  exchangeDescription: '',
  phone: '',
  amount: 0,
  carrier: '',
  description: '',
  customerName: '',
  clientId: null as number | null
})

const filteredShipmentClients = computed(() => {
  if (shipmentClientSearch.value.length < 1) return []
  const search = shipmentClientSearch.value.toLowerCase()
  return props.clients.filter(client =>
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
  newShipment.customerName = client.name
  newShipment.phone = client.phone
  newShipment.address = client.address
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

function handleOpenNewClient() {
  emit('open-new-client', shipmentClientSearch.value)
  showClientSuggestions.value = false
}

function handleClose() {
  clearSelectedClient()
  newShipment.carrier = ''
  newShipment.description = ''
  newShipment.amount = 0
  newShipment.type = 'normal'
  newShipment.exchangeReason = ''
  newShipment.exchangeItemCount = 1
  newShipment.exchangeDescription = ''
  emit('close')
}

function handleSubmit() {
  if (!canAddShipment.value) return
  emit('submit', {
    ...newShipment,
    selectedClient: selectedShipmentClient.value
  })
  handleClose()
}
</script>

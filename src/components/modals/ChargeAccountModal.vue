<template>
  <Teleport to="body">
    <div v-if="show && user" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
      <div class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Gestion du compte</h2>
            <p class="text-sm text-gray-500">{{ user.name }} - {{ user.company }}</p>
          </div>
          <button @click="emit('close')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
                  user.balance > 0 ? 'text-green-600' : user.balance < 0 ? 'text-red-600' : 'text-gray-500'
                ]">
                  {{ user.balance >= 0 ? '+' : '' }}{{ user.balance.toFixed(2) }} TND
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
                  <p class="text-2xl font-bold text-green-600">{{ user.deliveredCount || 0 }}</p>
                  <p class="text-xs text-gray-500">Colis Livrés</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-orange-600">{{ user.returnedCount || 0 }}</p>
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
                  <span class="text-lg font-bold text-green-600">{{ (user.deliveredCount || 0) + (purchaseDelivered || 0) }}</span>
                  <span class="text-xs text-gray-500 ml-1">Livrés</span>
                </div>
                <div class="text-center">
                  <span class="text-lg font-bold text-orange-600">{{ (user.returnedCount || 0) + (purchaseReturned || 0) }}</span>
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
                  <p class="text-3xl font-bold text-green-700 dark:text-green-400">{{ user.unbilledDelivered }}</p>
                  <p class="text-xs text-green-600 mt-1">{{ deliveryFees.delivered.toFixed(2) }} TND / colis</p>
                </div>
                <!-- Returned -->
                <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <RotateCcw class="w-5 h-5 text-red-600" />
                    <span class="text-sm font-medium text-red-700 dark:text-red-400">Colis Retour</span>
                  </div>
                  <p class="text-3xl font-bold text-red-700 dark:text-red-400">{{ user.unbilledReturned }}</p>
                  <p class="text-xs text-red-600 mt-1">{{ deliveryFees.returned.toFixed(2) }} TND / colis</p>
                </div>
              </div>
            </div>

            <!-- Fee Breakdown -->
            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Détail des frais</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ user.unbilledDelivered }} colis livrés × {{ deliveryFees.delivered.toFixed(2) }} TND</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ (user.unbilledDelivered * deliveryFees.delivered).toFixed(2) }} TND</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ user.unbilledReturned }} colis retour × {{ deliveryFees.returned.toFixed(2) }} TND</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ (user.unbilledReturned * deliveryFees.returned).toFixed(2) }} TND</span>
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
                  {{ (user.balance - calculateChargeTotal).toFixed(2) }} TND
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
          <button @click="emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
import { ref, computed, watch } from 'vue'
import {
  X,
  Plus,
  Minus,
  Wallet,
  Banknote,
  Building2,
  FileText,
  Package,
  RotateCcw,
  AlertTriangle
} from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  user: any
  deliveryFees: { delivered: number; returned: number }
}>()

const emit = defineEmits<{
  close: []
  credit: [payload: { purchaseDelivered: number; purchaseReturned: number; paymentMethod: 'cash' | 'transfer' | 'cheque'; note: string }]
  debit: [payload: { note: string }]
}>()

const chargeMode = ref<'credit' | 'debit'>('credit')
const purchaseDelivered = ref<number | null>(null)
const purchaseReturned = ref<number | null>(null)
const paymentMethod = ref<'cash' | 'transfer' | 'cheque'>('cash')
const chargeNote = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    chargeMode.value = 'credit'
    purchaseDelivered.value = null
    purchaseReturned.value = null
    paymentMethod.value = 'cash'
    chargeNote.value = ''
  }
})

const calculateChargeTotal = computed(() => {
  if (!props.user) return 0
  const deliveredTotal = props.user.unbilledDelivered * props.deliveryFees.delivered
  const returnedTotal = props.user.unbilledReturned * props.deliveryFees.returned
  return deliveredTotal + returnedTotal
})

const calculateCreditTotal = computed(() => {
  const deliveredTotal = (purchaseDelivered.value || 0) * props.deliveryFees.delivered
  const returnedTotal = (purchaseReturned.value || 0) * props.deliveryFees.returned
  return deliveredTotal + returnedTotal
})

function processAccountCredit() {
  if (calculateCreditTotal.value <= 0) return
  emit('credit', {
    purchaseDelivered: purchaseDelivered.value || 0,
    purchaseReturned: purchaseReturned.value || 0,
    paymentMethod: paymentMethod.value,
    note: chargeNote.value
  })
}

function processAccountCharge() {
  if (calculateChargeTotal.value === 0) return
  emit('debit', {
    note: chargeNote.value
  })
}
</script>

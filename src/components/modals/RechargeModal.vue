<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
      <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recharger mon solde</h3>
            <p class="text-sm text-gray-500 mt-0.5">Achetez des crédits pour vos colis</p>
          </div>
          <button @click="emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
                Colis Livré <span class="text-gray-400 font-normal">({{ CREDIT_PRICE_DELIVERED_MILLIMES }} millimes/colis)</span>
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
                Colis Retour <span class="text-gray-400 font-normal">({{ CREDIT_PRICE_RETURNED_MILLIMES }} millimes/colis)</span>
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
              <span class="text-gray-600 dark:text-gray-400">{{ rechargeForm.delivered }} colis livré × {{ CREDIT_PRICE_DELIVERED_MILLIMES }} mill</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ (rechargeForm.delivered * CREDIT_PRICE_DELIVERED).toFixed(3) }} TND</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ rechargeForm.returned }} colis retour × {{ CREDIT_PRICE_RETURNED_MILLIMES }} mill</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ (rechargeForm.returned * CREDIT_PRICE_RETURNED).toFixed(3) }} TND</span>
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
          <button @click="emit('close')" class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
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
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  X,
  Package,
  RefreshCw,
  CreditCard,
  Building,
  Smartphone,
  Wallet
} from 'lucide-vue-next'
import {
  CREDIT_PRICE_DELIVERED,
  CREDIT_PRICE_RETURNED,
  CREDIT_PRICE_DELIVERED_MILLIMES,
  CREDIT_PRICE_RETURNED_MILLIMES,
  RECHARGE_DEFAULT_DELIVERED,
  RECHARGE_DEFAULT_RETURNED,
} from '@/data/pricing'

const props = defineProps<{
  show: boolean
  userBalance: { delivered: number; returned: number }
}>()

const emit = defineEmits<{
  close: []
  recharge: [payload: { delivered: number; returned: number; paymentMethod: 'card' | 'bank' | 'd17' }]
}>()

const rechargeForm = ref({
  delivered: RECHARGE_DEFAULT_DELIVERED,
  returned: RECHARGE_DEFAULT_RETURNED,
  paymentMethod: 'card' as 'card' | 'bank' | 'd17'
})

const rechargeTotalPrice = computed(() => {
  return (rechargeForm.value.delivered * CREDIT_PRICE_DELIVERED) + (rechargeForm.value.returned * CREDIT_PRICE_RETURNED)
})

function processRecharge() {
  emit('recharge', {
    delivered: rechargeForm.value.delivered,
    returned: rechargeForm.value.returned,
    paymentMethod: rechargeForm.value.paymentMethod
  })
  rechargeForm.value = { delivered: RECHARGE_DEFAULT_DELIVERED, returned: RECHARGE_DEFAULT_RETURNED, paymentMethod: 'card' }
}
</script>

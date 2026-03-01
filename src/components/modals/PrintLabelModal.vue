<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show && shipment" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Aperçu du Bordereau</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="handlePrint"
                class="flex items-center space-x-2 px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium"
              >
                <Printer class="w-4 h-4" />
                <span>Imprimer</span>
              </button>
              <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
                  <p class="font-mono text-lg font-bold tracking-wider text-gray-900">{{ shipment.labelNumber }}</p>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ shipment.trackingNumber }}</p>
              </div>

              <!-- Carrier Badge -->
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 bg-gray-800 text-white text-sm rounded font-semibold">{{ shipment.carrier }}</span>
                <div class="flex items-center space-x-2">
                  <span v-if="shipment.fragile" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium border border-red-300">FRAGILE</span>
                  <span v-if="shipment.cod" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium border border-green-300">COD</span>
                </div>
              </div>

              <!-- Sender Info -->
              <div class="border border-gray-300 rounded p-3 mb-3 bg-gray-50">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Expéditeur</p>
                <p class="font-semibold text-gray-900">{{ shipment.senderName }}</p>
                <p class="text-sm text-gray-600">{{ shipment.senderAddress }}</p>
                <p class="text-sm text-gray-600">Tél: {{ shipment.senderPhone }}</p>
              </div>

              <!-- Recipient Info (Larger) -->
              <div class="border-2 border-gray-800 rounded p-4 mb-4 bg-white">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Destinataire</p>
                <p class="text-xl font-bold text-gray-900">{{ shipment.customerName }}</p>
                <p class="text-sm text-gray-700 mt-1">{{ shipment.recipientAddress }}</p>
                <p class="text-lg font-semibold text-gray-900 mt-2">{{ shipment.recipientPhone }}</p>
              </div>

              <!-- Package Details -->
              <div class="grid grid-cols-3 gap-2 mb-4">
                <div class="text-center p-2 bg-gray-100 rounded">
                  <p class="text-xs text-gray-500">Poids</p>
                  <p class="font-semibold text-gray-900">{{ shipment.weight }} kg</p>
                </div>
                <div class="text-center p-2 bg-gray-100 rounded">
                  <p class="text-xs text-gray-500">Dimensions</p>
                  <p class="font-semibold text-gray-900">{{ shipment.dimensions }}</p>
                </div>
                <div class="text-center p-2 bg-gray-100 rounded">
                  <p class="text-xs text-gray-500">Produit</p>
                  <p class="font-semibold text-gray-900 text-xs">{{ shipment.productDescription }}</p>
                </div>
              </div>

              <!-- COD Amount -->
              <div v-if="shipment.cod" class="border-2 border-green-500 rounded p-3 text-center bg-green-50">
                <p class="text-xs font-semibold text-green-600 uppercase">Montant à collecter (COD)</p>
                <p class="text-2xl font-bold text-green-700">{{ shipment.cod?.toLocaleString() }} TND</p>
              </div>

              <!-- Route -->
              <div class="mt-4 pt-4 border-t border-gray-300">
                <div class="flex items-center justify-between text-sm">
                  <div class="text-center">
                    <p class="font-semibold text-gray-900">{{ shipment.origin }}</p>
                    <p class="text-xs text-gray-500">Origine</p>
                  </div>
                  <div class="flex-1 border-t-2 border-dashed border-gray-400 mx-4"></div>
                  <div class="text-center">
                    <p class="font-semibold text-gray-900">{{ shipment.destination }}</p>
                    <p class="text-xs text-gray-500">Destination</p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-4 pt-3 border-t border-gray-300 text-center">
                <p class="text-xs text-gray-500">Commande: {{ shipment.orderNumber }}</p>
                <p class="text-xs text-gray-400 mt-1">Généré le {{ new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Printer, Truck } from 'lucide-vue-next'

defineProps<{
  show: boolean
  shipment: any
}>()

const emit = defineEmits<{
  close: []
  print: []
}>()

function handlePrint() {
  emit('print')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Transporteurs connect&eacute;s</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">G&eacute;rez vos partenaires de livraison</p>
        </div>
      </div>
      <button @click="$emit('navigate', 'add-carrier')" class="flex items-center space-x-2 px-4 py-2.5 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
        <Plus class="w-4 h-4" />
        <span class="hidden sm:inline">Ajouter</span>
      </button>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-4 sm:p-6">
    <!-- Empty State -->
    <div v-if="carriers.length === 0" class="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
      <div class="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
        <Truck class="w-8 h-8 text-orange-500" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun transporteur configur&eacute;</h3>
      <p class="text-gray-500 mb-6 max-w-md mx-auto">Ajoutez vos premiers transporteurs pour commencer &agrave; g&eacute;rer vos livraisons. Choisissez parmi plus de 65 transporteurs tunisiens.</p>
      <button @click="$emit('navigate', 'add-carrier')" class="inline-flex items-center space-x-2 px-6 py-3 bg-[#4959b4] hover:bg-[#3a4791] text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md">
        <Plus class="w-5 h-5" />
        <span>Ajouter mon premier transporteur</span>
      </button>
    </div>

    <!-- Carrier Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      <!-- Add New Card -->
      <button @click="$emit('navigate', 'add-carrier')" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group flex flex-col items-center justify-center min-h-[200px]">
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
        @click="$emit('select-carrier', carrier)"
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
                    {{ carrier.apiStatus === 'connected' ? 'Connect&eacute;' : 'D&eacute;connect&eacute;' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button @click.stop="$emit('sync-carrier', carrier)" :disabled="syncingCarrierId === carrier.id" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50" title="Synchroniser">
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': syncingCarrierId === carrier.id }" />
              </button>
              <button @click.stop="$emit('edit-carrier', carrier)" class="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="Modifier">
                <FileText class="w-4 h-4" />
              </button>
              <button @click.stop="$emit('delete-carrier', carrier.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer">
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
              {{ carrier.regions.length }} r&eacute;gion(s)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Carrier Details -->
    <CarrierDetailCard
      v-if="selectedCarrier"
      :carrier="selectedCarrier"
      @edit-carrier="$emit('edit-carrier', $event)"
      @import-colis="showImportModal = true"
    />

    <!-- Empty state when no carrier selected -->
    <div v-else class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
      <Building2 class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">S&eacute;lectionnez un transporteur</h3>
      <p class="text-sm text-gray-500">Cliquez sur une carte ci-dessus pour voir les d&eacute;tails et la grille tarifaire</p>
    </div>

    <NavexImportModal
      :show="showImportModal"
      :carrier="selectedCarrier"
      @close="showImportModal = false"
      @success="showImportModal = false"
    />
  </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ListFilter,
  Plus,
  Building2,
  FileText,
  Trash2,
  RefreshCw,
  MapPin,
  Truck,
} from 'lucide-vue-next'
import CarrierDetailCard from './CarrierDetailCard.vue'
import type { Carrier } from './CarrierDetailCard.vue'
import NavexImportModal from '@/components/modals/NavexImportModal.vue'

interface Props {
  carriers: Carrier[]
  selectedCarrier: Carrier | null
  deliveryCarriersCount: number
  syncingCarrierId: number | string | null
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'navigate': [section: string]
  'select-carrier': [carrier: Carrier]
  'edit-carrier': [carrier: Carrier]
  'delete-carrier': [carrierId: string]
  'sync-carrier': [carrier: Carrier]
}>()

const showImportModal = ref(false)
</script>

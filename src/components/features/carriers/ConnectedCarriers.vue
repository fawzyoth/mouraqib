<template>
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
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500 uppercase">Total</span>
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Building2 class="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ carriers.length }}</p>
        <p class="text-xs text-gray-500 mt-1">transporteurs</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500 uppercase">Connect&eacute;s</span>
          <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle class="w-4 h-4 text-green-600" />
          </div>
        </div>
        <p class="text-2xl font-bold text-green-600">{{ carriers.filter(c => c.apiStatus === 'connected').length }}</p>
        <p class="text-xs text-gray-500 mt-1">actifs</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500 uppercase">Colis total</span>
          <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Package class="w-4 h-4 text-orange-600" />
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ carriers.reduce((sum, c) => sum + c.shipments, 0).toLocaleString() }}</p>
        <p class="text-xs text-gray-500 mt-1">envoy&eacute;s</p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500 uppercase">Disponibles</span>
          <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Truck class="w-4 h-4 text-purple-600" />
          </div>
        </div>
        <p class="text-2xl font-bold text-purple-600">{{ deliveryCarriersCount }}</p>
        <p class="text-xs text-gray-500 mt-1">&agrave; ajouter</p>
      </div>
    </div>

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
    <div v-if="selectedCarrier" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Building2 class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ selectedCarrier.name }}</h3>
              <p class="text-sm text-gray-500">D&eacute;tails et tarification</p>
            </div>
          </div>
          <button @click="$emit('edit-carrier', selectedCarrier)" class="flex items-center space-x-2 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
            <FileText class="w-4 h-4" />
            <span>Modifier</span>
          </button>
        </div>
      </div>
      <div class="p-6">
        <!-- API Information -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Key class="w-4 h-4 mr-2" />
            Informations API
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">API ID</p>
              <p class="font-mono text-sm text-gray-900 dark:text-white">{{ selectedCarrier.apiId }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">API Key</p>
              <p class="font-mono text-sm text-gray-900 dark:text-white">{{ selectedCarrier.apiKey.substring(0, 15) }}...</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">Statut</p>
              <div class="flex items-center space-x-2">
                <span :class="selectedCarrier.apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></span>
                <span class="text-sm" :class="selectedCarrier.apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'">{{ selectedCarrier.apiStatus === 'connected' ? 'Connect&eacute;' : 'D&eacute;connect&eacute;' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fees Table -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Receipt class="w-4 h-4 mr-2" />
            Grille tarifaire
          </h4>
          <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-800/50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type de frais</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Montant</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis livr&eacute;s</td>
                  <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisLivres.toFixed(2) }} DT</td>
                </tr>
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis retour</td>
                  <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisRetour.toFixed(2) }} DT</td>
                </tr>
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis &eacute;change</td>
                  <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisEchange.toFixed(2) }} DT</td>
                </tr>
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis volumineux (BIG)</td>
                  <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisBig.toFixed(2) }} DT</td>
                </tr>
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis pickup</td>
                  <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisColisPickup.toFixed(2) }} DT</td>
                </tr>
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 bg-orange-50/50 dark:bg-orange-900/10">
                  <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Total frais de livraison</td>
                  <td class="px-4 py-3 text-sm text-right font-bold text-orange-600">{{ selectedCarrier.totalFraisLivraison.toFixed(2) }} DT</td>
                </tr>
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais de paiement</td>
                  <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.fraisPaiement.toFixed(2) }} %</td>
                </tr>
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Retenu de passage</td>
                  <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ selectedCarrier.retenuPassage.toFixed(2) }} DT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Performance Stats -->
        <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-blue-600">{{ selectedCarrier.shipments }}</p>
            <p class="text-xs text-blue-600/70">Total colis</p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-green-600">{{ selectedCarrier.delivered }}</p>
            <p class="text-xs text-green-600/70">Livr&eacute;s</p>
          </div>
          <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-orange-600">{{ selectedCarrier.deliveryRate }}%</p>
            <p class="text-xs text-orange-600/70">Taux livraison</p>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-purple-600">{{ selectedCarrier.avgTime }}j</p>
            <p class="text-xs text-purple-600/70">Temps moyen</p>
          </div>
        </div>

        <!-- Region Coverage -->
        <div class="mt-6">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <MapPinned class="w-4 h-4 mr-2" />
            Zones de couverture
          </h4>
          <div v-if="selectedCarrier.allRegions" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div class="flex items-center space-x-2">
              <CheckCircle class="w-5 h-5 text-green-600" />
              <span class="text-sm font-medium text-green-700 dark:text-green-400">Toutes les r&eacute;gions</span>
            </div>
            <p class="text-xs text-green-600/70 mt-1">Ce transporteur couvre l'ensemble du territoire tunisien (24 gouvernorats)</p>
          </div>
          <div v-else class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ selectedCarrier.regions.length }} gouvernorat(s) couverts
              </span>
              <span class="text-xs text-gray-500">sur 24 total</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="region in selectedCarrier.regions"
                :key="region"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
              >
                <MapPinned class="w-3 h-3 mr-1" />
                {{ region }}
              </span>
            </div>
            <div v-if="selectedCarrier.regions.length === 0" class="text-center py-4">
              <AlertTriangle class="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p class="text-sm text-gray-500">Aucune r&eacute;gion configur&eacute;e</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state when no carrier selected -->
    <div v-else class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
      <Building2 class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">S&eacute;lectionnez un transporteur</h3>
      <p class="text-sm text-gray-500">Cliquez sur une carte ci-dessus pour voir les d&eacute;tails et la grille tarifaire</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ListFilter,
  Plus,
  Building2,
  CheckCircle,
  Package,
  Truck,
  FileText,
  Trash2,
  MapPin,
  MapPinned,
  Key,
  Receipt,
  AlertTriangle
} from 'lucide-vue-next'

interface Carrier {
  id: number
  name: string
  apiId: string
  apiKey: string
  apiStatus: string
  shipments: number
  delivered: number
  deliveryRate: number
  avgTime: number
  fraisColisLivres: number
  fraisColisRetour: number
  fraisColisEchange: number
  fraisColisBig: number
  fraisColisPickup: number
  totalFraisLivraison: number
  fraisPaiement: number
  retenuPassage: number
  allRegions: boolean
  regions: string[]
}

interface Props {
  carriers: Carrier[]
  selectedCarrier: Carrier | null
  deliveryCarriersCount: number
}

defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
  'navigate': [section: string]
  'select-carrier': [carrier: Carrier]
  'edit-carrier': [carrier: Carrier]
  'delete-carrier': [carrierId: number]
}>()
</script>

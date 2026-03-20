<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
    <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Building2 class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h3>
            <p class="text-sm text-gray-500">Détails et tarification</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="carrier.name.toLowerCase() === 'navex'" @click="$emit('import-colis')" class="flex items-center space-x-2 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
            <Upload class="w-4 h-4" />
            <span>Importer colis</span>
          </button>
          <button @click="$emit('edit-carrier', carrier)" class="flex items-center space-x-2 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
            <FileText class="w-4 h-4" />
            <span>Modifier</span>
          </button>
        </div>
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
            <p class="font-mono text-sm text-gray-900 dark:text-white">{{ carrier.apiId }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">API Key</p>
            <p class="font-mono text-sm text-gray-900 dark:text-white">{{ carrier.apiKey.substring(0, 15) }}...</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">Statut</p>
            <div class="flex items-center space-x-2">
              <span :class="carrier.apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></span>
              <span class="text-sm" :class="carrier.apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'">{{ carrier.apiStatus === 'connected' ? 'Connecté' : 'Déconnecté' }}</span>
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
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis livrés</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ carrier.fraisColisLivres.toFixed(2) }} DT</td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis retour</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ carrier.fraisColisRetour.toFixed(2) }} DT</td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis échange</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ carrier.fraisColisEchange.toFixed(2) }} DT</td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis volumineux (BIG)</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ carrier.fraisColisBig.toFixed(2) }} DT</td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais colis pickup</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ carrier.fraisColisPickup.toFixed(2) }} DT</td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Frais de paiement</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ carrier.fraisPaiement.toFixed(2) }} %</td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">Retenu de passage</td>
                <td class="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{{ carrier.retenuPassage.toFixed(2) }} DT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Performance Stats -->
      <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ carrier.shipments }}</p>
          <p class="text-xs text-blue-600/70">Total colis</p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ carrier.delivered }}</p>
          <p class="text-xs text-green-600/70">Livrés</p>
        </div>
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
          <p class="text-2xl font-bold text-orange-600">{{ carrier.deliveryRate }}%</p>
          <p class="text-xs text-orange-600/70">Taux livraison</p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <p class="text-2xl font-bold text-purple-600">{{ carrier.avgTime }}j</p>
          <p class="text-xs text-purple-600/70">Temps moyen</p>
        </div>
      </div>

      <!-- Region Coverage -->
      <div class="mt-6">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <MapPinned class="w-4 h-4 mr-2" />
          Zones de couverture
        </h4>
        <div v-if="carrier.allRegions" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-2">
            <CheckCircle class="w-5 h-5 text-green-600" />
            <span class="text-sm font-medium text-green-700 dark:text-green-400">Toutes les régions</span>
          </div>
          <p class="text-xs text-green-600/70 mt-1">Ce transporteur couvre l'ensemble du territoire tunisien (24 gouvernorats)</p>
        </div>
        <div v-else class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ carrier.regions.length }} gouvernorat(s) couverts
            </span>
            <span class="text-xs text-gray-500">sur 24 total</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="region in carrier.regions"
              :key="region"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
            >
              <MapPinned class="w-3 h-3 mr-1" />
              {{ region }}
            </span>
          </div>
          <div v-if="carrier.regions.length === 0" class="text-center py-4">
            <AlertTriangle class="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Aucune région configurée</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Building2,
  CheckCircle,
  FileText,
  MapPinned,
  Key,
  Receipt,
  AlertTriangle,
  Upload,
} from 'lucide-vue-next'

export interface Carrier {
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
  fraisPaiement: number
  retenuPassage: number
  allRegions: boolean
  regions: string[]
  senderId: string | null
}

defineProps<{ carrier: Carrier }>()

defineEmits<{
  'edit-carrier': [carrier: Carrier]
  'import-colis': []
}>()
</script>

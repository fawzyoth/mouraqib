<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Rapports & Analyse des retours</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Comprenez les raisons des retours et prenez de meilleures decisions</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select :value="reportPeriod" @change="$emit('update:reportPeriod', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette annee</option>
        </select>
        <button class="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
          <Download class="w-4 h-4" />
          <span>Telecharger PDF</span>
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
    <!-- Key Insights Alert -->
    <div class="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
      <div class="flex items-start space-x-4">
        <div class="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
          <Lightbulb class="w-6 h-6 text-amber-600" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-amber-900 dark:text-amber-300">Insight Principal</h3>
          <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
            <strong>45% de vos retours</strong> sont dus a des clients absents. Considerez de contacter les clients via WhatsApp avant livraison ou proposer des creneaux de livraison flexibles pour reduire ce taux.
          </p>
        </div>
      </div>
    </div>

    <!-- Return Reasons Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Reasons Breakdown -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-semibold text-gray-900 dark:text-white">Raisons des retours</h3>
          <span class="text-sm text-gray-500">{{ reportAnalytics.totalReturns }} retours analyses</span>
        </div>
        <div class="space-y-4">
          <div v-for="reason in reportAnalytics.reasonsBreakdown" :key="reason.name" class="group">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  reason.name === 'Client absent' ? 'bg-orange-500' :
                  reason.name === 'Refus client' ? 'bg-yellow-500' :
                  reason.name === 'Adresse incorrecte' ? 'bg-purple-500' :
                  reason.name === 'Colis endommage' ? 'bg-red-500' :
                  reason.name === 'Hors zone' ? 'bg-blue-500' :
                  'bg-gray-400'
                ]"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ reason.name }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-500">{{ reason.count }} colis</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ reason.percentage }}%</span>
              </div>
            </div>
            <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div :class="[
                'h-full rounded-full transition-all',
                reason.name === 'Client absent' ? 'bg-orange-500' :
                reason.name === 'Refus client' ? 'bg-yellow-500' :
                reason.name === 'Adresse incorrecte' ? 'bg-purple-500' :
                reason.name === 'Colis endommage' ? 'bg-red-500' :
                reason.name === 'Hors zone' ? 'bg-blue-500' :
                'bg-gray-400'
              ]" :style="{ width: reason.percentage + '%' }"></div>
            </div>
            <!-- Action suggestion -->
            <p class="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {{ reason.suggestion }}
            </p>
          </div>
        </div>
      </div>

      <!-- Delivery Attempts Analysis -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-semibold text-gray-900 dark:text-white">Tentatives de livraison</h3>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">Moyenne:</span>
            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ reportAnalytics.avgAttempts }} tentatives</span>
          </div>
        </div>
        <div class="space-y-4">
          <div v-for="attempt in reportAnalytics.attemptsBreakdown" :key="attempt.attempts" class="flex items-center">
            <div class="w-24 flex-shrink-0">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ attempt.label }}</span>
            </div>
            <div class="flex-1 mx-4">
              <div class="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                <div :class="[
                  'h-full rounded-lg flex items-center justify-end pr-2',
                  attempt.attempts === 1 ? 'bg-green-500' :
                  attempt.attempts === 2 ? 'bg-yellow-500' :
                  attempt.attempts === 3 ? 'bg-orange-500' :
                  'bg-red-500'
                ]" :style="{ width: attempt.percentage + '%' }">
                  <span v-if="attempt.percentage > 15" class="text-xs font-medium text-white">{{ attempt.count }}</span>
                </div>
              </div>
            </div>
            <div class="w-16 text-right">
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ attempt.percentage }}%</span>
            </div>
          </div>
        </div>
        <div class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p class="text-xs text-red-700 dark:text-red-400">
            <AlertTriangle class="w-3 h-3 inline mr-1" />
            <strong>{{ reportAnalytics.multipleAttemptsCost }} DT</strong> de frais supplementaires dus aux tentatives multiples ce mois
          </p>
        </div>
      </div>
    </div>

    <!-- Carrier Comparison -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">Comparaison des transporteurs</h3>
          <p class="text-sm text-gray-500 mt-1">Analysez la performance de vos transporteurs pour les retours</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Transporteur</th>
              <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Taux retour</th>
              <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tentatives moy.</th>
              <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Taux recup.</th>
              <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Delai retour</th>
              <th class="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Score</th>
              <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Recommandation</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="carrier in reportAnalytics.carrierComparison" :key="carrier.name" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="py-4 px-4" data-label="Transporteur">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Building2 class="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ carrier.name }}</p>
                    <p class="text-xs text-gray-500">{{ carrier.totalShipments }} expeditions</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4 text-center" data-label="Taux retour">
                <span :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  carrier.returnRate <= 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  carrier.returnRate <= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                ]">
                  {{ carrier.returnRate }}%
                </span>
              </td>
              <td class="py-4 px-4 text-center" data-label="Tentatives moy.">
                <span :class="carrier.avgAttempts <= 1.5 ? 'text-green-600' : carrier.avgAttempts <= 2 ? 'text-yellow-600' : 'text-red-600'" class="font-semibold">
                  {{ carrier.avgAttempts }}
                </span>
              </td>
              <td class="py-4 px-4 text-center" data-label="Taux recup.">
                <span :class="carrier.recoveryRate >= 90 ? 'text-green-600' : carrier.recoveryRate >= 80 ? 'text-yellow-600' : 'text-red-600'" class="font-semibold">
                  {{ carrier.recoveryRate }}%
                </span>
              </td>
              <td class="py-4 px-4 text-center" data-label="Delai retour">
                <span class="text-gray-700 dark:text-gray-300">{{ carrier.avgReturnDays }} jours</span>
              </td>
              <td class="py-4 px-4 text-center" data-label="Score">
                <div class="flex items-center justify-center space-x-1">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    carrier.score >= 8 ? 'bg-green-100 text-green-700' :
                    carrier.score >= 6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  ]">
                    {{ carrier.score }}
                  </div>
                  <span class="text-xs text-gray-400">/10</span>
                </div>
              </td>
              <td class="py-4 px-4 text-right" data-label="Recommandation">
                <span :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg',
                  carrier.recommendation === 'Excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  carrier.recommendation === 'Bon' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  carrier.recommendation === 'A surveiller' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                ]">
                  {{ carrier.recommendation }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Actionable Recommendations -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Product Issues -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Package class="w-5 h-5 text-purple-600" />
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white">Problemes lies aux produits</h3>
        </div>
        <div class="space-y-3">
          <div v-for="issue in reportAnalytics.productIssues" :key="issue.product" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900 dark:text-white text-sm">{{ issue.product }}</p>
              <p class="text-xs text-gray-500">{{ issue.returns }} retours ({{ issue.returnRate }}% taux retour)</p>
            </div>
            <span :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              issue.reason === 'Qualite' ? 'bg-red-100 text-red-700' :
              issue.reason === 'Taille' ? 'bg-purple-100 text-purple-700' :
              issue.reason === 'Couleur' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            ]">
              {{ issue.reason }}
            </span>
          </div>
        </div>
        <div class="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p class="text-xs text-purple-700 dark:text-purple-400">
            <strong>Suggestion:</strong> Ameliorez les photos et descriptions de vos produits les plus retournes
          </p>
        </div>
      </div>

      <!-- Geographic Issues -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <MapPin class="w-5 h-5 text-blue-600" />
          </div>
          <h3 class="font-semibold text-gray-900 dark:text-white">Zones problematiques</h3>
        </div>
        <div class="space-y-3">
          <div v-for="zone in reportAnalytics.problematicZones" :key="zone.region" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900 dark:text-white text-sm">{{ zone.region }}</p>
              <p class="text-xs text-gray-500">{{ zone.returns }} retours sur {{ zone.total }} envois</p>
            </div>
            <span :class="[
              'px-2 py-1 text-xs font-semibold rounded-full',
              zone.returnRate > 15 ? 'bg-red-100 text-red-700' :
              zone.returnRate > 10 ? 'bg-orange-100 text-orange-700' :
              'bg-yellow-100 text-yellow-700'
            ]">
              {{ zone.returnRate }}%
            </span>
          </div>
        </div>
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-xs text-blue-700 dark:text-blue-400">
            <strong>Suggestion:</strong> Envisagez un autre transporteur pour ces zones ou confirmez les adresses par telephone
          </p>
        </div>
      </div>
    </div>

    <!-- Decision Helper -->
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white">
      <div class="flex items-center space-x-3 mb-6">
        <div class="p-2 bg-white/10 rounded-lg">
          <Target class="w-6 h-6" />
        </div>
        <div>
          <h3 class="font-semibold text-lg">Aide a la decision</h3>
          <p class="text-sm text-gray-400">Recommandations basees sur vos donnees</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Change Carrier -->
        <div class="bg-white/10 rounded-xl p-4">
          <div class="flex items-center space-x-2 mb-3">
            <Building2 class="w-5 h-5 text-orange-400" />
            <h4 class="font-medium">Transporteurs</h4>
          </div>
          <p class="text-sm text-gray-300 mb-3">
            {{ reportAnalytics.carrierAdvice }}
          </p>
          <span class="text-xs text-orange-400 font-medium">Impact estime: -{{ reportAnalytics.carrierImpact }}% retours</span>
        </div>
        <!-- Improve Products -->
        <div class="bg-white/10 rounded-xl p-4">
          <div class="flex items-center space-x-2 mb-3">
            <Package class="w-5 h-5 text-purple-400" />
            <h4 class="font-medium">Produits</h4>
          </div>
          <p class="text-sm text-gray-300 mb-3">
            {{ reportAnalytics.productAdvice }}
          </p>
          <span class="text-xs text-purple-400 font-medium">Impact estime: -{{ reportAnalytics.productImpact }}% retours</span>
        </div>
        <!-- Process Improvement -->
        <div class="bg-white/10 rounded-xl p-4">
          <div class="flex items-center space-x-2 mb-3">
            <Phone class="w-5 h-5 text-green-400" />
            <h4 class="font-medium">Processus</h4>
          </div>
          <p class="text-sm text-gray-300 mb-3">
            {{ reportAnalytics.processAdvice }}
          </p>
          <span class="text-xs text-green-400 font-medium">Impact estime: -{{ reportAnalytics.processImpact }}% retours</span>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ListFilter, Download, Lightbulb, AlertTriangle, Building2,
  Package, MapPin, Target, Phone
} from 'lucide-vue-next'

interface ReasonBreakdown {
  name: string
  count: number
  percentage: number
  suggestion: string
}

interface AttemptBreakdown {
  attempts: number
  label: string
  count: number
  percentage: number
}

interface CarrierComparison {
  name: string
  totalShipments: number
  returnRate: number
  avgAttempts: number
  recoveryRate: number
  avgReturnDays: number
  score: number
  recommendation: string
}

interface ProductIssue {
  product: string
  returns: number
  returnRate: number
  reason: string
}

interface ProblematicZone {
  region: string
  returns: number
  total: number
  returnRate: number
}

interface ReportAnalyticsData {
  totalReturns: number
  avgAttempts: number
  multipleAttemptsCost: number
  reasonsBreakdown: ReasonBreakdown[]
  attemptsBreakdown: AttemptBreakdown[]
  carrierComparison: CarrierComparison[]
  productIssues: ProductIssue[]
  problematicZones: ProblematicZone[]
  carrierAdvice: string
  carrierImpact: number
  productAdvice: string
  productImpact: number
  processAdvice: string
  processImpact: number
}

defineProps<{
  reportPeriod: string
  reportAnalytics: ReportAnalyticsData
}>()

defineEmits<{
  'toggle-submenu': []
  'update:reportPeriod': [value: string]
}>()
</script>

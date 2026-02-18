<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {{ sectionTitle }}
          </h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
            {{ sectionSubtitle }}
          </p>
        </div>
      </div>
      <button v-if="activeSection === 'page-templates'" class="flex items-center space-x-0 sm:space-x-2 px-3 sm:px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium transition-colors">
        <Plus class="w-4 h-4" />
        <span class="hidden sm:inline">Cr&eacute;er une page</span>
      </button>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Page Templates -->
    <div v-if="activeSection === 'page-templates'">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="template in trackingPageTemplates" :key="template.id" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
          <div class="aspect-video bg-gradient-to-br" :class="template.gradientClass">
            <div class="w-full h-full flex items-center justify-center">
              <div class="bg-white/90 dark:bg-gray-900/90 rounded-lg p-4 w-4/5">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
                <div class="flex space-x-2">
                  <div class="h-8 w-8 rounded-full" :class="template.accentClass"></div>
                  <div class="flex-1">
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ template.name }}</h3>
              <span v-if="template.isPopular" class="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded font-medium">Populaire</span>
            </div>
            <p class="text-sm text-gray-500 mb-4">{{ template.description }}</p>
            <div class="flex items-center space-x-2">
              <button class="flex-1 px-3 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium transition-colors">Utiliser</button>
              <button class="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Aper&ccedil;u</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- My Tracking Page -->
    <div v-if="activeSection === 'my-tracking-page'">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <Globe class="w-5 h-5 text-orange-500" />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">track.maboutique.tn</p>
              <p class="text-sm text-gray-500">Page active</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button class="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Modifier</button>
            <button class="px-3 py-1.5 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">Voir la page</button>
          </div>
        </div>
        <div class="p-6">
          <div class="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <Globe class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500">Pr&eacute;visualisation de votre page de suivi</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Branding -->
    <div v-if="activeSection === 'page-branding'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Logo & Couleurs</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo de l'entreprise</label>
              <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                <Upload class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p class="text-sm text-gray-500">Glissez votre logo ici</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Couleur principale</label>
              <div class="flex items-center space-x-3">
                <input type="color" value="#f97316" class="w-10 h-10 rounded border-0 cursor-pointer" />
                <input type="text" value="#f97316" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Couleur secondaire</label>
              <div class="flex items-center space-x-3">
                <input type="color" value="#1f2937" class="w-10 h-10 rounded border-0 cursor-pointer" />
                <input type="text" value="#1f2937" class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
            </div>
          </div>
          <button class="mt-6 w-full px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-lg text-sm font-medium">Enregistrer les modifications</button>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Aper&ccedil;u</h3>
          <div class="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p class="text-gray-500">Pr&eacute;visualisation en temps r&eacute;el</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Analytics -->
    <div v-if="activeSection === 'page-analytics'">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Eye class="w-5 h-5 text-blue-600" /></div>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pageMetrics.visits.toLocaleString('fr-FR') }}</p>
          <p class="text-sm text-gray-500">Visites ce mois</p>
          <div class="mt-3 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div class="h-full bg-blue-500 rounded-full" :style="{ width: (pageMetrics.visits > 0 ? Math.min(100, Math.round(pageMetrics.successfulSearches / pageMetrics.visits * 100)) : 0) + '%' }"></div></div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><Search class="w-5 h-5 text-green-600" /></div>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pageMetrics.successfulSearches.toLocaleString('fr-FR') }}</p>
          <p class="text-sm text-gray-500">Recherches r&eacute;ussies</p>
          <p class="text-xs text-gray-400 mt-2">{{ pageMetrics.successRate }}% taux de r&eacute;ussite</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><SearchX class="w-5 h-5 text-red-600" /></div>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pageMetrics.failedSearchCount }}</p>
          <p class="text-sm text-gray-500">Recherches &eacute;chou&eacute;es</p>
          <p v-if="pageMetrics.failedSearchCount > 0" class="text-xs text-red-500 mt-2">&Agrave; traiter rapidement</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Clock class="w-5 h-5 text-purple-600" /></div>
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pageMetrics.avgTime }}</p>
          <p class="text-sm text-gray-500">Temps moyen sur page</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Traffic Sources -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Sources de trafic</h3>
          <div class="space-y-4">
            <div v-for="source in trafficSources" :key="source.label">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ source.label }}</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ source.percent }}%</span>
              </div>
              <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :class="source.color" :style="{ width: source.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Breakdown -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Appareils utilis&eacute;s</h3>
          <div class="flex items-center justify-center mb-4">
            <div class="relative w-32 h-32">
              <svg class="w-full h-full" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" stroke-width="3" stroke-dasharray="78, 100" stroke-linecap="round"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-bold text-gray-900 dark:text-white">78%</span>
                <span class="text-xs text-gray-500">Mobile</span>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-blue-500 rounded-full"></div><span class="text-sm text-gray-600 dark:text-gray-400">Mobile</span></div>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">962</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-gray-300 rounded-full"></div><span class="text-sm text-gray-600 dark:text-gray-400">Desktop</span></div>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">272</span>
            </div>
          </div>
        </div>

        <!-- Geographic Distribution -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">R&eacute;gions les plus actives</h3>
          <div class="space-y-3">
            <div v-for="region in activeRegions" :key="region.name" class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
              <div class="flex items-center space-x-3">
                <span class="text-lg">&#127481;&#127475;</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ region.name }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" :class="region.barColor" :style="{ width: region.percent + '%' }"></div>
                </div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ region.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Visits Over Time -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">Visites (7 derniers jours)</h3>
            <select class="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <option>7 jours</option><option>30 jours</option><option>3 mois</option>
            </select>
          </div>
          <div class="h-48 flex items-end space-x-2">
            <div v-for="(day, index) in []" :key="index" class="flex-1 flex flex-col items-center">
              <div class="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all hover:from-orange-600 hover:to-orange-500" :style="{ height: (day.value / 210 * 100) + '%' }"></div>
              <span class="text-xs text-gray-500 mt-2">{{ day.name }}</span>
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ day.value }}</span>
            </div>
          </div>
        </div>

        <!-- Peak Hours -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Heures de pointe</h3>
          <div class="grid grid-cols-6 gap-1">
            <div v-for="hour in 24" :key="hour" class="text-center">
              <div :class="[
                'w-full h-8 rounded transition-colors',
                hour >= 9 && hour <= 12 ? 'bg-orange-500' :
                hour >= 14 && hour <= 18 ? 'bg-orange-400' :
                hour >= 19 && hour <= 21 ? 'bg-orange-300' :
                'bg-gray-100 dark:bg-gray-800'
              ]"></div>
              <span class="text-[10px] text-gray-400">{{ hour }}h</span>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-center space-x-4 text-xs">
            <div class="flex items-center space-x-1"><div class="w-3 h-3 bg-orange-500 rounded"></div><span class="text-gray-500">Pic (9h-12h)</span></div>
            <div class="flex items-center space-x-1"><div class="w-3 h-3 bg-orange-400 rounded"></div><span class="text-gray-500">&Eacute;lev&eacute; (14h-18h)</span></div>
            <div class="flex items-center space-x-1"><div class="w-3 h-3 bg-orange-300 rounded"></div><span class="text-gray-500">Moyen (19h-21h)</span></div>
          </div>
        </div>
      </div>

      <!-- Recent Searches & User Behavior -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Recherches les plus fr&eacute;quentes</h3>
          <div class="space-y-3">
            <div v-for="(item, index) in []" :key="index" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div class="flex items-center space-x-3">
                <span class="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full bg-orange-100 text-orange-600">{{ index + 1 }}</span>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white text-sm">{{ item.tracking }}</p>
                  <p class="text-xs text-gray-500">{{ item.searches }} recherches</p>
                </div>
              </div>
              <span :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                item.status === 'Livr\u00e9' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                item.status === 'En transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                item.status === 'En livraison' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              ]">{{ item.status }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Comportement utilisateur</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="flex items-center space-x-3"><MousePointerClick class="w-5 h-5 text-blue-600" /><span class="text-sm text-gray-700 dark:text-gray-300">Taux de clics</span></div>
              <span class="text-lg font-bold text-blue-600">72%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="flex items-center space-x-3"><CheckCircle class="w-5 h-5 text-green-600" /><span class="text-sm text-gray-700 dark:text-gray-300">Recherches r&eacute;ussies</span></div>
              <span class="text-lg font-bold text-green-600">95.2%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="flex items-center space-x-3"><RotateCcw class="w-5 h-5 text-purple-600" /><span class="text-sm text-gray-700 dark:text-gray-300">Visiteurs r&eacute;currents</span></div>
              <span class="text-lg font-bold text-purple-600">34%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div class="flex items-center space-x-3"><Activity class="w-5 h-5 text-orange-600" /><span class="text-sm text-gray-700 dark:text-gray-300">Rebonds</span></div>
              <span class="text-lg font-bold text-orange-600">12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Failed Searches -->
    <div v-if="activeSection === 'failed-searches'">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p class="text-sm text-gray-500">{{ failedSearches.length }} recherches sans r&eacute;sultat</p>
          <button class="text-sm text-orange-500 hover:text-orange-600 font-medium">Exporter CSV</button>
        </div>
        <div class="table-responsive">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Recherche</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">T&eacute;l&eacute;phone</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="search in failedSearches" :key="search.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td class="px-4 py-3" data-label="Recherche"><span class="font-mono text-sm text-gray-900 dark:text-white">{{ search.query }}</span></td>
                <td class="px-4 py-3" data-label="T&eacute;l&eacute;phone">
                  <span v-if="search.phone" class="text-sm text-gray-600 dark:text-gray-400">{{ search.phone }}</span>
                  <span v-else class="text-sm text-gray-400">Non fourni</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Date">{{ search.date }}</td>
                <td class="px-4 py-3" data-label="Statut">
                  <span :class="['px-2 py-0.5 text-xs rounded font-medium', search.contacted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
                    {{ search.contacted ? 'Contact&eacute;' : '&Agrave; contacter' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right" data-label="Actions">
                  <div class="flex items-center justify-end space-x-2">
                    <button v-if="search.phone" class="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="WhatsApp"><MessageCircle class="w-4 h-4" /></button>
                    <button class="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><MoreHorizontal class="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ListFilter,
  Plus,
  Globe,
  Upload,
  Eye,
  Search,
  SearchX,
  TrendingUp,
  Clock,
  CheckCircle,
  MousePointerClick,
  RotateCcw,
  Activity,
  MessageCircle,
  MoreHorizontal
} from 'lucide-vue-next'

interface TrackingPageTemplate {
  id: number
  name: string
  description: string
  gradientClass: string
  accentClass: string
  isPopular: boolean
}

interface FailedSearch {
  id: string | number
  query: string
  phone?: string
  date: string
  contacted: boolean
}

interface Props {
  activeSection: string
  trackingPageTemplates: TrackingPageTemplate[]
  failedSearches: FailedSearch[]
}

const props = defineProps<Props>()

defineEmits<{
  'toggle-sub-menu': []
}>()

const sectionTitle = computed(() => {
  const titles: Record<string, string> = {
    'page-templates': 'Mod\u00e8les de page',
    'my-tracking-page': 'Ma page de suivi',
    'page-branding': 'Personnalisation',
    'page-analytics': 'Analytiques page',
    'failed-searches': 'Recherches \u00e9chou\u00e9es'
  }
  return titles[props.activeSection] || ''
})

const sectionSubtitle = computed(() => {
  const subtitles: Record<string, string> = {
    'page-templates': 'Choisissez un mod\u00e8le pour votre page de suivi',
    'my-tracking-page': 'Pr\u00e9visualisez et g\u00e9rez votre page de suivi',
    'page-branding': 'Personnalisez votre page avec votre branding',
    'page-analytics': 'Statistiques de votre page de suivi',
    'failed-searches': 'Clients qui n\'ont pas trouv\u00e9 leur commande'
  }
  return subtitles[props.activeSection] || ''
})

// Analytics metrics derived from available data
const pageMetrics = computed(() => {
  const failedCount = props.failedSearches.length
  // Without a real analytics backend, we can only show what we know
  const totalSearches = failedCount // Only failed searches are tracked for now
  return {
    visits: 0,
    successfulSearches: 0,
    failedSearchCount: failedCount,
    successRate: 0,
    avgTime: '--',
  }
})

const trafficSources: { label: string; percent: number; color: string }[] = []

const activeRegions: { name: string; count: number; percent: number; barColor: string }[] = []
</script>

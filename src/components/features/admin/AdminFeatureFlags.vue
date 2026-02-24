<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Feature Flags</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez les fonctionnalités disponibles par organisation et rôle</p>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6">
      <!-- Organization Selector -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organisation</label>
        <select
          v-model="selectedOrgId"
          class="w-full sm:w-96 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          @change="onOrgChange"
        >
          <option value="">-- Sélectionner une organisation --</option>
          <option v-for="org in organizations" :key="org.id" :value="org.id">
            {{ org.name }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <Loader2 class="w-6 h-6 animate-spin text-[#4959b4]" />
        <span class="ml-2 text-sm text-gray-500">Chargement des flags...</span>
      </div>

      <!-- Feature Flags Table -->
      <div v-else-if="selectedOrgId" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <!-- Bulk actions -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Actions par rôle :</span>
          <div v-for="role in ROLES" :key="role" class="flex items-center gap-1">
            <span class="text-xs text-gray-500 capitalize">{{ role }}</span>
            <button
              @click="bulkSetRole(role, true)"
              class="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
            >
              Tout activer
            </button>
            <button
              @click="bulkSetRole(role, false)"
              class="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              Tout désactiver
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800/50">
                <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 min-w-[250px]">Fonctionnalité</th>
                <th v-for="role in ROLES" :key="role" class="text-center px-3 py-3 font-medium text-gray-600 dark:text-gray-400 capitalize w-24">
                  {{ role }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="section in FEATURE_TREE" :key="section.id">
                <!-- Section header row -->
                <tr class="bg-gray-100/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700">
                  <td class="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">
                    {{ section.label }}
                  </td>
                  <td v-for="role in ROLES" :key="role" class="text-center px-3 py-2">
                    <button
                      @click="toggleFlag(section.id, role)"
                      class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                      :class="getFlagValue(section.id, role) ? 'bg-[#4959b4]' : 'bg-gray-300 dark:bg-gray-600'"
                    >
                      <span
                        class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
                        :class="getFlagValue(section.id, role) ? 'translate-x-4' : 'translate-x-0.5'"
                      />
                    </button>
                  </td>
                </tr>
                <!-- Children rows -->
                <tr v-for="child in section.children" :key="child.id" class="border-t border-gray-100 dark:border-gray-800">
                  <td class="px-4 py-2 pl-8 text-gray-600 dark:text-gray-400">
                    {{ child.label }}
                  </td>
                  <td v-for="role in ROLES" :key="role" class="text-center px-3 py-2">
                    <button
                      @click="toggleFlag(child.id, role)"
                      :disabled="!getFlagValue(section.id, role)"
                      class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                      :class="[
                        !getFlagValue(section.id, role)
                          ? 'bg-gray-200 dark:bg-gray-700 opacity-40 cursor-not-allowed'
                          : getFlagValue(child.id, role)
                            ? 'bg-[#4959b4]'
                            : 'bg-gray-300 dark:bg-gray-600'
                      ]"
                    >
                      <span
                        class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
                        :class="getFlagValue(child.id, role) ? 'translate-x-4' : 'translate-x-0.5'"
                      />
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16 text-gray-500">
        <ToggleLeft class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p>Sélectionnez une organisation pour gérer ses feature flags</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ListFilter, Loader2, ToggleLeft } from 'lucide-vue-next'
import { organizationsService } from '@/services/organizations'
import { featureFlagsService } from '@/services/featureFlags'

defineEmits<{
  'toggle-submenu': []
}>()

const ROLES = ['owner', 'admin', 'manager', 'support', 'user'] as const

interface FeatureNode {
  id: string
  label: string
  children: { id: string; label: string }[]
}

const FEATURE_TREE: FeatureNode[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    children: [
      { id: 'dashboard.overview', label: 'Vue d\'ensemble' },
      { id: 'dashboard.today-shipments', label: 'Tâches du jour' },
      { id: 'dashboard.delayed-shipments', label: 'Colis en retard' },
      { id: 'dashboard.returns-alerts', label: 'Alertes retours' },
      { id: 'dashboard.financial-snapshot', label: 'Aperçu financier' },
      { id: 'dashboard.activity-log', label: 'Journal d\'activité' },
    ],
  },
  {
    id: 'clients',
    label: 'Clients',
    children: [
      { id: 'clients.all-clients', label: 'Tous les clients' },
      { id: 'clients.add-client', label: 'Ajouter client' },
      { id: 'clients.vip-clients', label: 'Clients VIP' },
      { id: 'clients.blocked-clients', label: 'Clients bloqués' },
      { id: 'clients.client-stats', label: 'Statistiques' },
    ],
  },
  {
    id: 'shipments',
    label: 'Colis',
    children: [
      { id: 'shipments.all-shipments', label: 'Tous les colis' },
      { id: 'shipments.create-shipment', label: 'Créer un colis' },
      { id: 'shipments.labels', label: 'Bordereaux' },
    ],
  },
  {
    id: 'pickups',
    label: 'Enlèvements',
    children: [
      { id: 'pickups.schedule-pickup', label: 'Scan pickup' },
      { id: 'pickups.pickup-history', label: 'Historique' },
    ],
  },
  {
    id: 'returns',
    label: 'Retours',
    children: [
      { id: 'returns.active-returns', label: 'Retours actifs' },
      { id: 'returns.recovered-returns', label: 'Retours récupérés' },
      { id: 'returns.lost-returns', label: 'Retours perdus' },
      { id: 'returns.return-value', label: 'Valeur des retours' },
      { id: 'returns.return-reports', label: 'Rapports' },
    ],
  },
  {
    id: 'carriers',
    label: 'Transporteurs',
    children: [
      { id: 'carriers.connected-carriers', label: 'Transporteurs connectés' },
      { id: 'carriers.add-carrier', label: 'Ajouter transporteur' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    children: [
      { id: 'finance.expected-payments', label: 'Paiements attendus' },
      { id: 'finance.received-payments', label: 'Paiements reçus' },
      { id: 'finance.payment-discrepancies', label: 'Écarts de paiement' },
      { id: 'finance.revenue', label: 'Revenus' },
      { id: 'finance.return-losses', label: 'Pertes retours' },
      { id: 'finance.invoices', label: 'Factures' },
      { id: 'finance.exports', label: 'Exports' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytiques',
    children: [
      { id: 'analytics.global-kpis', label: 'KPIs globaux' },
      { id: 'analytics.delivery-performance', label: 'Performance livraison' },
      { id: 'analytics.return-intelligence', label: 'Intelligence retours' },
      { id: 'analytics.risk-zones', label: 'Zones à risque' },
      { id: 'analytics.anomaly-detection', label: 'Détection d\'anomalies' },
      { id: 'analytics.trends', label: 'Tendances' },
      { id: 'analytics.reports', label: 'Rapports' },
    ],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    children: [
      { id: 'settings.company-profile', label: 'Profil entreprise' },
      { id: 'settings.users-roles', label: 'Utilisateurs & Rôles' },
      { id: 'settings.notifications', label: 'Notifications' },
      { id: 'settings.security', label: 'Sécurité' },
      { id: 'settings.payment-history', label: 'Historique de paiement' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    children: [
      { id: 'administration.admin-users', label: 'Liste des utilisateurs' },
      { id: 'administration.admin-billing', label: 'Facturation comptes' },
      { id: 'administration.admin-transactions', label: 'Transactions' },
    ],
  },
]

const organizations = ref<{ id: string; name: string }[]>([])
const selectedOrgId = ref('')
const isLoading = ref(false)

// "role.feature" → enabled
const flagsMap = reactive(new Map<string, boolean>())

// Load organizations on mount
loadOrganizations()

async function loadOrganizations() {
  try {
    const data = await organizationsService.getAllOrganizations()
    organizations.value = (data || []).map((o: any) => ({ id: o.id, name: o.name }))
  } catch (err) {
    console.error('Failed to load organizations:', err)
  }
}

async function onOrgChange() {
  if (!selectedOrgId.value) return
  isLoading.value = true
  flagsMap.clear()

  try {
    const flags = await featureFlagsService.getForOrgAdmin(selectedOrgId.value)
    for (const f of flags) {
      flagsMap.set(`${f.role}.${f.feature}`, f.enabled)
    }
  } catch (err) {
    console.error('Failed to load flags:', err)
  } finally {
    isLoading.value = false
  }
}

function getFlagValue(feature: string, role: string): boolean {
  const key = `${role}.${feature}`
  if (flagsMap.has(key)) return flagsMap.get(key)!
  // Opt-out model: enabled by default
  return true
}

async function toggleFlag(feature: string, role: string) {
  const current = getFlagValue(feature, role)
  const newValue = !current
  const key = `${role}.${feature}`
  flagsMap.set(key, newValue)

  try {
    await featureFlagsService.upsert(selectedOrgId.value, role, feature, newValue)
  } catch (err) {
    console.error('Failed to update flag:', err)
    // Revert on error
    flagsMap.set(key, current)
  }
}

async function bulkSetRole(role: string, enabled: boolean) {
  // Collect all features from the tree
  const allFeatures: string[] = []
  for (const section of FEATURE_TREE) {
    allFeatures.push(section.id)
    for (const child of section.children) {
      allFeatures.push(child.id)
    }
  }

  // Optimistically update UI
  const previousValues = new Map<string, boolean>()
  for (const feature of allFeatures) {
    const key = `${role}.${feature}`
    previousValues.set(key, getFlagValue(feature, role))
    flagsMap.set(key, enabled)
  }

  try {
    await featureFlagsService.bulkUpsert(
      selectedOrgId.value,
      allFeatures.map(feature => ({ role, feature, enabled }))
    )
  } catch (err) {
    console.error('Bulk update failed:', err)
    // Revert on error
    for (const [key, value] of previousValues) {
      flagsMap.set(key, value)
    }
  }
}
</script>

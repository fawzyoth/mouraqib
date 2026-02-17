<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-sub-menu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Alertes retours</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Intervenez avant qu'il ne soit trop tard</p>
        </div>
      </div>
      <button class="flex px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors items-center space-x-0 sm:space-x-2">
        <MessageCircle class="w-4 h-4" />
        <span class="hidden sm:inline">WhatsApp groupé</span>
      </button>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Alert Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <XCircle class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-red-600">{{ failedAttempts.length }}</p>
            <p class="text-xs text-gray-500">Tentatives échouées</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
            <UserX class="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-yellow-600">{{ unreachableAlerts.length }}</p>
            <p class="text-xs text-gray-500">Clients injoignables</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-orange-600">{{ riskAlerts.length }}</p>
            <p class="text-xs text-gray-500">Risque de retour</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <User class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-purple-600">{{ recidivists.length }}</p>
            <p class="text-xs text-gray-500">Clients récidivistes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Failed Attempts Section -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <XCircle class="w-5 h-5 text-red-500" />
          <h3 class="font-semibold text-gray-900 dark:text-white">Tentatives de livraison échouées</h3>
          <span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">Urgent</span>
        </div>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div v-for="alert in failedAttempts" :key="alert.id" class="px-5 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span class="text-sm font-bold text-red-600">{{ alert.attempts }}</span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ alert.client }}</p>
                  <span v-if="alert.isRecidivist" class="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">Récidiviste</span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">{{ alert.tracking }} &middot; {{ alert.destination }}</p>
                <p class="text-xs text-red-500 mt-0.5">{{ alert.attempts }} tentative{{ alert.attempts > 1 ? 's' : '' }} &middot; Dernière: {{ alert.lastAttempt }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ alert.amount }} TND</span>
              <button class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1">
                <MessageCircle class="w-3 h-3" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unreachable Clients -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-2">
          <UserX class="w-5 h-5 text-yellow-500" />
          <h3 class="font-semibold text-gray-900 dark:text-white">Clients injoignables</h3>
        </div>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div v-for="alert in unreachableAlerts" :key="alert.id" class="px-5 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <UserX class="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ alert.client }}</p>
                <p class="text-xs text-gray-500">{{ alert.phone }} &middot; {{ alert.destination }}</p>
                <p class="text-xs text-yellow-600 mt-0.5">Dernier contact: {{ alert.lastContact }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1">
                <MessageCircle class="w-3 h-3" />
                <span>WhatsApp</span>
              </button>
              <button class="btn-primary btn-primary-sm">
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Return Risk Prediction -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-2">
          <Brain class="w-5 h-5 text-purple-500" />
          <h3 class="font-semibold text-gray-900 dark:text-white">Prédiction de retours</h3>
          <span class="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">IA</span>
        </div>
      </div>
      <div class="p-5">
        <div class="space-y-3">
          <div v-for="alert in riskAlerts" :key="alert.id" class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <span class="text-lg font-bold text-orange-600">{{ alert.riskScore }}%</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ alert.client }}</p>
                <p class="text-xs text-gray-500">{{ alert.tracking }}</p>
                <p class="text-xs text-orange-600 mt-0.5">{{ alert.riskReason }}</p>
              </div>
            </div>
            <button class="btn-primary btn-primary-sm">
              Intervenir
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ListFilter,
  MessageCircle,
  XCircle,
  UserX,
  AlertTriangle,
  User,
  Brain
} from 'lucide-vue-next'

interface ReturnAlert {
  id: string | number
  type: 'failed-attempt' | 'unreachable' | 'risk'
  client: string
  tracking?: string
  destination?: string
  attempts?: number
  lastAttempt?: string
  isRecidivist?: boolean
  amount?: number
  phone?: string
  lastContact?: string
  riskScore?: number
  riskReason?: string
}

interface Props {
  returnAlerts: ReturnAlert[]
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'toggle-sub-menu'): void
}>()

const failedAttempts = computed(() =>
  props.returnAlerts.filter(a => a.type === 'failed-attempt')
)

const unreachableAlerts = computed(() =>
  props.returnAlerts.filter(a => a.type === 'unreachable')
)

const riskAlerts = computed(() =>
  props.returnAlerts.filter(a => a.type === 'risk')
)

const recidivists = computed(() =>
  props.returnAlerts.filter(a => a.isRecidivist)
)
</script>

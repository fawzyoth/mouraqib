<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Detection d'Anomalies</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Surveillance automatique des patterns inhabituels</p>
        </div>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Anomaly Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ anomalyDetection.criticalAnomalies }}</p>
            <p class="text-sm text-gray-500">Critiques</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <AlertTriangle class="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ anomalyDetection.warningAnomalies }}</p>
            <p class="text-sm text-gray-500">Avertissements</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Activity class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ anomalyDetection.infoAnomalies }}</p>
            <p class="text-sm text-gray-500">Informations</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ anomalyDetection.resolvedAnomalies }}</p>
            <p class="text-sm text-gray-500">Resolues</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Anomalies -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Anomalies Actives</h3>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-800">
        <div v-for="anomaly in anomalyDetection.activeAnomalies" :key="anomaly.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3">
              <div :class="anomaly.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : anomaly.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'" class="p-2 rounded-lg">
                <AlertCircle :class="anomaly.severity === 'critical' ? 'text-red-600' : anomaly.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">{{ anomaly.title }}</h4>
                <p class="text-sm text-gray-500 mt-1">{{ anomaly.description }}</p>
                <div class="flex items-center space-x-4 mt-2">
                  <span class="text-xs text-gray-400">{{ anomaly.detectedAt }}</span>
                  <span class="text-xs text-gray-400">{{ anomaly.affectedItems }} elements affectes</span>
                </div>
              </div>
            </div>
            <button class="px-3 py-1.5 text-sm font-medium text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              Investiguer
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, AlertCircle, AlertTriangle, Activity, CheckCircle } from 'lucide-vue-next'

interface ActiveAnomaly {
  id: string | number
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  detectedAt: string
  affectedItems: number
}

interface AnomalyDetectionData {
  criticalAnomalies: number
  warningAnomalies: number
  infoAnomalies: number
  resolvedAnomalies: number
  activeAnomalies: ActiveAnomaly[]
}

defineProps<{
  anomalyDetection: AnomalyDetectionData
}>()

defineEmits<{
  'toggle-submenu': []
}>()
</script>

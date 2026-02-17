<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Intelligence Retours</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Analysez les motifs de retour et identifiez les patterns</p>
        </div>
      </div>
      <div class="hidden sm:flex items-center space-x-3">
        <select :value="analyticsDateRange" @change="$emit('update:analyticsDateRange', ($event.target as HTMLSelectElement).value)" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
        </select>
      </div>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Return Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <RotateCcw class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ returnIntelligence.totalReturns }}</p>
            <p class="text-sm text-gray-500">Total Retours</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <DollarSign class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ returnIntelligence.lostRevenue }} DT</p>
            <p class="text-sm text-gray-500">Pertes Estimees</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ returnIntelligence.recoveredReturns }}</p>
            <p class="text-sm text-gray-500">Recuperes</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Target class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ returnIntelligence.recoveryRate }}%</p>
            <p class="text-sm text-gray-500">Taux Recuperation</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Return Reasons -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-white">Motifs de Retour</h3>
        </div>
        <div class="p-4 space-y-3">
          <div v-for="reason in returnIntelligence.returnReasons" :key="reason.name" class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: reason.color }"></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ reason.name }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :style="{ width: reason.percentage + '%', backgroundColor: reason.color }"></div>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{{ reason.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-white">Evolution des Retours</h3>
        </div>
        <div class="p-4">
          <div class="h-48 flex items-end space-x-2">
            <div v-for="(value, index) in returnIntelligence.returnTrend" :key="index" class="flex-1 flex flex-col items-center">
              <div class="w-full bg-red-400 rounded-t transition-all duration-300" :style="{ height: (value / Math.max(...returnIntelligence.returnTrend) * 100) + '%' }"></div>
              <span class="text-xs text-gray-500 mt-2">S{{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Recommandations IA</h3>
      </div>
      <div class="p-4 space-y-3">
        <div v-for="rec in returnIntelligence.recommendations" :key="rec.title" class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div class="flex items-start space-x-3">
            <div :class="rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' : rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'" class="p-2 rounded-lg">
              <Brain :class="rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'" class="w-5 h-5" />
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 dark:text-white">{{ rec.title }}</h4>
              <p class="text-sm text-gray-500 mt-1">{{ rec.description }}</p>
              <span class="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full" :class="rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                Impact: {{ rec.impact }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ListFilter, RotateCcw, DollarSign, CheckCircle, Target, Brain } from 'lucide-vue-next'

interface ReturnReason {
  name: string
  percentage: number
  color: string
}

interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  impact: string
}

interface ReturnIntelligenceData {
  totalReturns: number
  lostRevenue: number
  recoveredReturns: number
  recoveryRate: number
  returnReasons: ReturnReason[]
  returnTrend: number[]
  recommendations: Recommendation[]
}

defineProps<{
  analyticsDateRange: string
  returnIntelligence: ReturnIntelligenceData
}>()

defineEmits<{
  'toggle-submenu': []
  'update:analyticsDateRange': [value: string]
}>()
</script>

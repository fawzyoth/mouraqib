<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Rapports</h1>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Generez et telechargez des rapports detailles</p>
        </div>
      </div>
      <button class="flex btn-primary btn-primary-sm px-3 sm:px-4">
        <Plus class="w-4 h-4 sm:mr-2" />
        <span class="hidden sm:inline">Nouveau Rapport</span>
      </button>
    </div>
  </header>
  <main class="flex-1 overflow-y-auto p-6">
    <!-- Report Templates -->
    <div class="mb-6">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Modeles de Rapports</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="template in reports.templates" :key="template.id" class="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-600 transition-colors cursor-pointer">
          <div class="p-2 rounded-lg inline-block mb-3" :class="template.bgColor">
            <component :is="template.icon" class="w-5 h-5" :class="template.iconColor" />
          </div>
          <h4 class="font-medium text-gray-900 dark:text-white">{{ template.name }}</h4>
          <p class="text-sm text-gray-500 mt-1">{{ template.description }}</p>
          <button class="mt-3 text-sm font-medium text-primary-blue hover:text-primary-blue-hover transition-colors">
            Generer ->
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 class="font-semibold text-gray-900 dark:text-white">Rapports Recents</h3>
      </div>
      <div class="table-responsive">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nom</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Genere le</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Taille</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="report in reports.recentReports" :key="report.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white" data-label="Nom">{{ report.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Type">{{ report.type }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Periode">{{ report.period }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Genere le">{{ report.generatedAt }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" data-label="Taille">{{ report.size }}</td>
              <td class="px-4 py-3" data-label="Actions">
                <div class="flex items-center space-x-2">
                  <button class="p-1.5 text-gray-500 hover:text-primary-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                    <Eye class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                    <Download class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ListFilter, Plus, Eye, Download } from 'lucide-vue-next'

interface ReportTemplate {
  id: number
  name: string
  description: string
  icon: Component
  bgColor: string
  iconColor: string
}

interface RecentReport {
  id: number | string
  name: string
  type: string
  period: string
  generatedAt: string
  size: string
}

interface ReportsData {
  templates: ReportTemplate[]
  recentReports: RecentReport[]
}

defineProps<{
  reports: ReportsData
}>()

defineEmits<{
  'toggle-submenu': []
}>()
</script>

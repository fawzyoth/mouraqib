<template>
  <aside class="hidden lg:flex w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col">
    <!-- Global Search Button -->
    <div class="p-3 border-b border-gray-200 dark:border-gray-800">
      <button
        @click="$emit('open-search')"
        class="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:border-[#4959b4] hover:text-[#4959b4] transition-colors"
      >
        <Search class="w-4 h-4" />
        <span>Rechercher un colis...</span>
        <kbd class="ml-auto hidden sm:inline-flex px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">⌘K</kbd>
      </button>
    </div>
    <!-- Section Title -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-800">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ sectionLabel }}</h2>
    </div>

    <!-- Sub Navigation -->
    <nav class="flex-1 py-3 overflow-y-auto">
      <ul class="space-y-0.5">
        <li v-for="item in items" :key="item.id">
          <button
            @click="$emit('select', item.id)"
            :class="[
              'w-full flex items-center space-x-3 py-2.5 pl-4 pr-4 text-sm font-medium transition-colors border-l-4',
              activeId === item.id
                ? 'bg-gray-100 text-orange-500 border-orange-500 rounded-r-lg dark:bg-gray-800 dark:text-orange-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="ml-auto px-2 py-0.5 text-xs rounded-full" :class="item.badgeClass">{{ item.badge }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Quick Stats (contextual) -->
    <div v-if="mainSection === 'dashboard'" class="border-t border-gray-200 dark:border-gray-800 p-4">
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ shipmentsCount }}</p>
          <p class="text-xs text-gray-500">Colis</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-green-600">{{ deliveredCount }}</p>
          <p class="text-xs text-gray-500">Livrés</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import type { Component } from 'vue'

defineProps<{
  sectionLabel: string
  items: Array<{ id: string; label: string; icon: Component; badge?: string; badgeClass?: string }>
  activeId: string
  mainSection: string
  shipmentsCount: number
  deliveredCount: number
}>()

defineEmits<{
  (e: 'select', id: string): void
  (e: 'open-search'): void
}>()
</script>

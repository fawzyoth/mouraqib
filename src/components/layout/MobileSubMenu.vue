<template>
  <div
    :class="[
      'fixed left-0 right-0 z-30 lg:hidden bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden',
      isOpen ? 'translate-y-0' : '-translate-y-full'
    ]"
    style="top: 56px;"
  >
    <nav class="py-2 max-h-64 overflow-y-auto">
      <ul class="space-y-0.5">
        <li v-for="item in items" :key="item.id">
          <button
            @click="$emit('select', item.id)"
            :class="[
              'w-full flex items-center space-x-3 py-2.5 px-4 text-sm font-medium transition-colors',
              activeId === item.id
                ? 'bg-gray-100 text-orange-500 dark:bg-gray-800 dark:text-orange-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="ml-auto px-2 py-0.5 text-xs rounded-full" :class="item.badgeClass">{{ item.badge }}</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  isOpen: boolean
  items: Array<{ id: string; label: string; icon: Component; badge?: string; badgeClass?: string }>
  activeId: string
}>()

defineEmits<{
  (e: 'select', id: string): void
}>()
</script>

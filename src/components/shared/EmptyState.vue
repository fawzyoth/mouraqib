<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
    <component
      :is="icon"
      class="w-16 h-16 mx-auto mb-4"
      :class="variant === 'success' ? 'text-green-300' : 'text-gray-300'"
    />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ title }}</h3>
    <p class="text-gray-500 mb-4">{{ description }}</p>
    <p v-if="hint" class="text-sm text-gray-400">{{ hint }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  icon: Component
  title: string
  description: string
  hint?: string
  variant?: 'neutral' | 'success'
}>(), {
  variant: 'neutral'
})
</script>

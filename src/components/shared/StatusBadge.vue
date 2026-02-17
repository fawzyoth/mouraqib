<template>
  <span
    class="px-2 py-1 text-xs rounded-full font-medium"
    :class="variantClass"
  >
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'
  text?: string
}>(), {
  variant: 'neutral'
})

const variantClass = computed(() => {
  const classes: Record<string, string> = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return classes[props.variant] || classes.neutral
})
</script>

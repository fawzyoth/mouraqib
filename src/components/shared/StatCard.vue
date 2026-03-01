<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
      </div>
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center"
        :class="iconBgClass"
      >
        <component :is="icon" class="w-6 h-6" :class="iconClass" />
      </div>
    </div>
    <p v-if="subtitle" class="text-xs text-gray-500 mt-2">{{ subtitle }}</p>
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string | number
  icon: Component
  iconBgClass?: string
  iconClass?: string
  subtitle?: string
}>()
</script>

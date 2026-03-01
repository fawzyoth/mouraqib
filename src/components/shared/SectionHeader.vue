<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          v-if="showMenuToggle"
          @click="$emit('toggle-menu')"
          class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{{ title }}</h1>
          <p v-if="subtitle" class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{{ subtitle }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-2 sm:space-x-3">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ListFilter } from 'lucide-vue-next'

withDefaults(defineProps<{
  title: string
  subtitle?: string
  showMenuToggle?: boolean
}>(), {
  showMenuToggle: true
})

defineEmits<{
  (e: 'toggle-menu'): void
}>()
</script>

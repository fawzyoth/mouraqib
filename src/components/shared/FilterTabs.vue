<template>
  <div class="border-b border-gray-200 dark:border-gray-800 px-4">
    <div class="flex items-center space-x-1 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('update:modelValue', tab.id)"
        :class="[
          'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
          modelValue === tab.id
            ? 'border-orange-500 text-orange-600 dark:text-orange-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="ml-1 text-gray-400">({{ tab.count }})</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: Array<{ id: string; label: string; count?: number }>
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

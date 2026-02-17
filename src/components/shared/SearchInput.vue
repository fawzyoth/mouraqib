<template>
  <div class="flex-1 relative">
    <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      :placeholder="placeholder"
      :class="[
        'w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors',
        bgClass
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  bg?: 'white' | 'gray'
}>(), {
  placeholder: 'Rechercher...',
  bg: 'white'
})

const bgClass = computed(() =>
  props.bg === 'gray'
    ? 'bg-gray-50 dark:bg-gray-800'
    : 'bg-white dark:bg-gray-900'
)

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

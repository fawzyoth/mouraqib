<template>
  <div class="fixed top-0 left-0 right-0 z-40 lg:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
    <button @click="$emit('toggle-menu')" class="p-2 hover:bg-gray-800 rounded-lg">
      <Menu class="w-6 h-6" />
    </button>
    <span class="text-base font-semibold">{{ sectionLabel }}</span>
    <div class="flex items-center gap-2">
      <button @click="$emit('open-search')" class="p-2 hover:bg-gray-800 rounded-lg">
        <Search class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, Search } from 'lucide-vue-next'

defineProps<{
  sectionLabel: string
}>()

defineEmits<{
  (e: 'toggle-menu'): void
  (e: 'open-search'): void
}>()
</script>

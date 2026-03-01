<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex" :class="side === 'right' ? 'justify-end' : 'justify-start'">
        <div class="absolute inset-0 bg-black/30" @click="$emit('close')"></div>
        <Transition
          enter-active-class="transition-transform duration-300"
          :enter-from-class="side === 'right' ? 'translate-x-full' : '-translate-x-full'"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-300"
          leave-from-class="translate-x-0"
          :leave-to-class="side === 'right' ? 'translate-x-full' : '-translate-x-full'"
          appear
        >
          <div
            class="relative w-full bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-xl"
            :class="width"
          >
            <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
              <div class="flex items-center justify-between">
                <slot name="header">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
                </slot>
                <button @click="$emit('close')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X class="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div class="p-4">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(defineProps<{
  show: boolean
  title?: string
  side?: 'left' | 'right'
  width?: string
}>(), {
  side: 'right',
  width: 'max-w-sm'
})

defineEmits<{
  (e: 'close'): void
}>()
</script>

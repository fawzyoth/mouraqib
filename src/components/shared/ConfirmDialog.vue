<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm shadow-xl">
          <div class="p-6 text-center">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              :class="iconBgClass"
            >
              <component :is="iconComponent" class="w-6 h-6" :class="iconColorClass" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ message }}</p>
          </div>
          <div class="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              @click="$emit('cancel')"
              class="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {{ cancelLabel }}
            </button>
            <button
              @click="$emit('confirm')"
              class="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white"
              :class="confirmBtnClass"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  show: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: Component
}>(), {
  confirmLabel: 'Confirmer',
  cancelLabel: 'Annuler',
  variant: 'danger'
})

const iconComponent = computed(() => props.icon || AlertTriangle)

const iconBgClass = computed(() => {
  const classes: Record<string, string> = {
    danger: 'bg-red-100 dark:bg-red-900/30',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
  }
  return classes[props.variant]
})

const iconColorClass = computed(() => {
  const classes: Record<string, string> = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }
  return classes[props.variant]
})

const confirmBtnClass = computed(() => {
  const classes: Record<string, string> = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  }
  return classes[props.variant]
})

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

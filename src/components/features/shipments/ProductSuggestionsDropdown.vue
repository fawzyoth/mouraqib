<template>
  <div
    v-if="products.length > 0"
    class="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto"
  >
    <button
      v-for="(product, index) in products"
      :key="product.id"
      :ref="(el) => { if (el) itemRefs[index] = el as HTMLElement }"
      @click="$emit('select', product)"
      class="w-full px-3 py-2.5 text-left flex items-center justify-between transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
      :class="index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'"
    >
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ product.name }}</p>
      </div>
      <div class="flex items-center flex-shrink-0 ml-2">
        <span class="text-sm font-semibold text-orange-600 dark:text-orange-400">{{ Number(product.price).toFixed(3) }} DT</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  products: { id: string; name: string; price: number; [key: string]: any }[]
  selectedIndex?: number
}>()

defineEmits<{
  (e: 'select', product: any): void
}>()

const itemRefs = ref<HTMLElement[]>([])

watch(() => props.selectedIndex, async (newIndex) => {
  if (newIndex !== undefined && newIndex >= 0) {
    await nextTick()
    const el = itemRefs.value[newIndex]
    if (el) {
      el.scrollIntoView({ block: 'nearest' })
    }
  }
})
</script>

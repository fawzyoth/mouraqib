<template>
  <div class="relative" ref="containerRef">
    <!-- Input with search icon -->
    <div class="relative">
      <Search class="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        ref="inputRef"
        v-model="searchText"
        type="text"
        :placeholder="modelValue ? displayValue : placeholder"
        class="w-full pl-7 pr-7 py-1.5 text-xs border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
        :class="[
          isOpen
            ? 'border-orange-400 dark:border-orange-500 ring-1 ring-orange-400/30'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        ]"
        @focus="open"
        @keydown.escape.prevent="close"
        @keydown.down.prevent="navigate(1)"
        @keydown.up.prevent="navigate(-1)"
        @keydown.enter.prevent="selectHighlighted"
      />
      <!-- Clear / Chevron -->
      <button
        v-if="modelValue"
        @click.stop="clear"
        class="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X class="w-3 h-3" />
      </button>
      <ChevronDown
        v-else
        class="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 left-0 mt-1 min-w-[200px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg shadow-black/8 dark:shadow-black/30 overflow-hidden"
      >
        <!-- Options count -->
        <div v-if="filteredOptions.length > 0" class="px-2.5 py-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
          {{ filteredOptions.length }} option{{ filteredOptions.length > 1 ? 's' : '' }}
        </div>

        <!-- Options list -->
        <div class="max-h-52 overflow-y-auto overscroll-contain" ref="listRef">
          <div
            v-for="(option, idx) in filteredOptions"
            :key="option"
            @mousedown.prevent="select(option)"
            @mouseenter="highlightIdx = idx"
            class="flex items-center gap-2 px-2.5 py-2 text-xs cursor-pointer transition-colors"
            :class="[
              idx === highlightIdx
                ? 'bg-orange-50 dark:bg-orange-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
            ]"
            :ref="el => { if (idx === highlightIdx) scrollIntoView(el as HTMLElement) }"
          >
            <!-- Check icon for selected -->
            <div class="w-4 h-4 shrink-0 flex items-center justify-center">
              <Check
                v-if="modelValue === option"
                class="w-3.5 h-3.5 text-orange-500"
              />
            </div>
            <span
              class="truncate"
              :class="[
                modelValue === option
                  ? 'font-semibold text-orange-600 dark:text-orange-400'
                  : idx === highlightIdx
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
              ]"
            >
              {{ getDisplayLabel(option) }}
            </span>
          </div>

          <!-- Empty state -->
          <div
            v-if="filteredOptions.length === 0"
            class="px-3 py-4 text-center"
          >
            <SearchX class="w-4 h-4 mx-auto mb-1 text-gray-300 dark:text-gray-600" />
            <p class="text-xs text-gray-400 dark:text-gray-500">Aucun résultat</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Search, X, ChevronDown, Check, SearchX } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: string
  options: string[]
  placeholder?: string
  displayFn?: (value: string) => string
}>(), {
  placeholder: 'Rechercher...',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const searchText = ref('')
const isOpen = ref(false)
const highlightIdx = ref(-1)

// Display value for current selection
const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return props.displayFn ? props.displayFn(props.modelValue) : props.modelValue
})

function getDisplayLabel(option: string): string {
  return props.displayFn ? props.displayFn(option) : option
}

// Filter options based on search text
const filteredOptions = computed(() => {
  const q = searchText.value.toLowerCase()
  if (!q) return props.options
  return props.options.filter(v => {
    const label = getDisplayLabel(v).toLowerCase()
    return label.includes(q)
  })
})

function open() {
  isOpen.value = true
  highlightIdx.value = -1
}

function close() {
  isOpen.value = false
  highlightIdx.value = -1
  if (!props.modelValue) {
    searchText.value = ''
  }
}

function select(value: string) {
  emit('update:modelValue', value)
  searchText.value = getDisplayLabel(value)
  isOpen.value = false
  highlightIdx.value = -1
}

function clear() {
  emit('update:modelValue', '')
  searchText.value = ''
  highlightIdx.value = -1
  nextTick(() => inputRef.value?.focus())
}

function navigate(direction: number) {
  if (!isOpen.value) { open(); return }
  const opts = filteredOptions.value
  if (!opts.length) return
  let idx = highlightIdx.value + direction
  if (idx < 0) idx = opts.length - 1
  if (idx >= opts.length) idx = 0
  highlightIdx.value = idx
}

function selectHighlighted() {
  const opts = filteredOptions.value
  if (highlightIdx.value >= 0 && highlightIdx.value < opts.length) {
    select(opts[highlightIdx.value])
  }
}

function scrollIntoView(el: HTMLElement | null) {
  if (el) {
    nextTick(() => el.scrollIntoView({ block: 'nearest' }))
  }
}

// Click outside to close
function handleClickOutside(event: MouseEvent) {
  if (isOpen.value && containerRef.value && !containerRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

// Sync searchText when modelValue changes externally
watch(() => props.modelValue, (val) => {
  if (val) {
    searchText.value = getDisplayLabel(val)
  } else {
    searchText.value = ''
  }
}, { immediate: true })

// Focus the input when component mounts
onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})

defineExpose({ focus: () => inputRef.value?.focus() })
</script>

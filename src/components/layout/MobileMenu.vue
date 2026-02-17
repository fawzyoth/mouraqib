<template>
  <div
    :class="[
      'fixed inset-0 z-50 lg:hidden text-white flex flex-col transform transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
    style="background-color: #222628;"
  >
    <div class="flex items-center justify-between p-4 border-b border-gray-800">
      <img src="@/logo/Group 14.svg" alt="Logo" class="h-8 w-auto" />
      <button @click="$emit('close')" class="p-2 hover:bg-gray-700 rounded-lg">
        <X class="w-6 h-6" />
      </button>
    </div>

    <nav class="flex-1 py-4 overflow-y-auto">
      <ul class="space-y-1 px-3">
        <li v-for="item in navItems" :key="item.id">
          <button
            @click="$emit('select', item.id)"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
              activeId === item.id
                ? 'text-orange-500'
                : 'text-gray-300 hover:text-white'
            ]"
            :style="activeId === item.id ? { backgroundColor: '#111314' } : {}"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="border-t border-gray-800 p-4">
      <div class="flex items-center space-x-3 px-3 py-2">
        <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
          <span class="text-base font-semibold text-white">{{ userInitial }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-base font-medium text-white truncate">{{ userName }}</p>
          <p class="text-sm text-gray-400 truncate">{{ userEmail }}</p>
        </div>
        <button
          @click="$emit('logout')"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, LogOut } from 'lucide-vue-next'
import type { Component } from 'vue'

defineProps<{
  isOpen: boolean
  navItems: Array<{ id: string; label: string; icon: Component }>
  activeId: string
  userName: string
  userEmail: string
  userInitial: string
}>()

defineEmits<{
  (e: 'select', id: string): void
  (e: 'close'): void
  (e: 'logout'): void
}>()
</script>

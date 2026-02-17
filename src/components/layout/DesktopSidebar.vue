<template>
  <aside class="hidden lg:flex w-56 text-white flex-col" style="background-color: #222628;">
    <!-- Logo -->
    <div class="p-4">
      <img src="@/logo/Group 14.svg" alt="Logo" class="h-8 w-auto" />
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 py-2 overflow-y-auto">
      <ul class="space-y-1 px-3">
        <li v-for="item in navItems" :key="item.id">
          <button
            @click="$emit('select', item.id)"
            :class="[
              'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
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

    <!-- Usage Balance -->
    <div class="px-3 pb-2">
      <div class="bg-gray-800/50 rounded-xl p-3 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">Mon solde</span>
          <button @click="$emit('recharge')" class="text-xs text-orange-500 hover:text-orange-400 font-medium">Recharger</button>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-gray-900/50 rounded-lg p-2">
            <div class="flex items-center gap-1.5 mb-1">
              <Package class="w-3.5 h-3.5 text-orange-500" />
              <span class="text-xs text-gray-400">Livré</span>
            </div>
            <p class="text-lg font-bold text-white">{{ balance.delivered }}</p>
            <div class="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-orange-500 rounded-full" :style="{ width: Math.min((balance.delivered / 1000) * 100, 100) + '%' }"></div>
            </div>
          </div>
          <div class="bg-gray-900/50 rounded-lg p-2">
            <div class="flex items-center gap-1.5 mb-1">
              <RefreshCw class="w-3.5 h-3.5 text-gray-400" />
              <span class="text-xs text-gray-400">Retour</span>
            </div>
            <p class="text-lg font-bold text-white">{{ balance.returned }}</p>
            <div class="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gray-500 rounded-full" :style="{ width: Math.min((balance.returned / 500) * 100, 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User/Organization Section -->
    <div class="border-t border-gray-800 p-3">
      <div class="flex items-center space-x-3 px-3 py-2">
        <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <span class="text-sm font-semibold text-white">{{ userInitial }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate">{{ userName }}</p>
          <p class="text-xs text-gray-400 truncate">{{ userEmail }}</p>
        </div>
        <button
          @click="$emit('logout')"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Déconnexion"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Package, RefreshCw, LogOut } from 'lucide-vue-next'
import type { Component } from 'vue'

defineProps<{
  navItems: Array<{ id: string; label: string; icon: Component }>
  activeId: string
  userName: string
  userEmail: string
  userInitial: string
  balance: { delivered: number; returned: number }
}>()

defineEmits<{
  (e: 'select', id: string): void
  (e: 'logout'): void
  (e: 'recharge'): void
}>()
</script>

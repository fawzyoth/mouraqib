<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-950">
    <MobileHeader
      :section-label="sectionLabel"
      @toggle-menu="$emit('toggle-menu')"
      @open-search="$emit('open-search')"
    />

    <MobileMenu
      :is-open="sidebarOpen"
      :nav-items="navItems"
      :active-id="mainSection"
      :user-name="userName"
      :user-email="userEmail"
      :user-initial="userInitial"
      @select="(id: string) => { $emit('select-main', id); $emit('close-menu') }"
      @close="$emit('close-menu')"
      @logout="$emit('logout')"
    />

    <MobileSubMenu
      :is-open="subMenuOpen"
      :items="subNavItems"
      :active-id="activeSection"
      @select="(id: string) => { $emit('select-sub', id); $emit('close-submenu') }"
    />

    <DesktopSidebar
      :nav-items="navItems"
      :active-id="mainSection"
      :user-name="userName"
      :user-email="userEmail"
      :user-initial="userInitial"
      :balance="balance"
      @select="$emit('select-main', $event)"
      @logout="$emit('logout')"
      @recharge="$emit('recharge')"
    />

    <DesktopSubSidebar
      :section-label="sectionLabel"
      :items="subNavItems"
      :active-id="activeSection"
      :main-section="mainSection"
      :shipments-count="shipmentsCount"
      :delivered-count="deliveredCount"
      @select="$emit('select-sub', $event)"
      @open-search="$emit('open-search')"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import MobileHeader from './MobileHeader.vue'
import MobileMenu from './MobileMenu.vue'
import MobileSubMenu from './MobileSubMenu.vue'
import DesktopSidebar from './DesktopSidebar.vue'
import DesktopSubSidebar from './DesktopSubSidebar.vue'

defineProps<{
  mainSection: string
  activeSection: string
  sectionLabel: string
  navItems: Array<{ id: string; label: string; icon: Component }>
  subNavItems: Array<{ id: string; label: string; icon: Component; badge?: string; badgeClass?: string }>
  userName: string
  userEmail: string
  userInitial: string
  balance: { delivered: number; returned: number }
  sidebarOpen: boolean
  subMenuOpen: boolean
  shipmentsCount: number
  deliveredCount: number
}>()

defineEmits<{
  (e: 'select-main', id: string): void
  (e: 'select-sub', id: string): void
  (e: 'toggle-menu'): void
  (e: 'close-menu'): void
  (e: 'close-submenu'): void
  (e: 'open-search'): void
  (e: 'logout'): void
  (e: 'recharge'): void
}>()
</script>

<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Flows de notifications</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Automatisez les notifications pour chaque statut de colis</p>
          </div>
        </div>
        <button class="flex btn-primary px-3 sm:px-4">
          <Plus class="w-4 h-4" />
          <span class="hidden sm:inline ml-2">Créer un flow</span>
        </button>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <!-- Flow Count -->
      <div class="mb-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ notificationFlows.length }} sur {{ notificationFlows.length }} flows sont affichés</p>
      </div>

      <!-- Flows Table -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div class="col-span-5">Name</div>
          <div class="col-span-1 text-center">Channel</div>
          <div class="col-span-2 text-center">Recipients</div>
          <div class="col-span-2 text-center">Emails sent</div>
          <div class="col-span-2 text-center">Actions</div>
        </div>

        <!-- Flow Rows -->
        <div v-for="(flow, index) in notificationFlows" :key="index" class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors items-center">
          <!-- Name -->
          <div class="col-span-5">
            <div class="flex items-start space-x-3">
              <div class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded">
                <FileText class="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ flow.name }}</p>
                <p class="text-sm text-gray-500">
                  <span v-if="flow.enabled" class="text-gray-400">Disabled on {{ flow.disabledAt }}</span>
                  <span v-else class="text-gray-400">This flow has not been enabled</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Channel -->
          <div class="col-span-1 flex justify-center space-x-1">
            <Mail class="w-5 h-5 text-gray-400" />
            <MessageSquare class="w-5 h-5 text-gray-400" />
          </div>

          <!-- Recipients -->
          <div class="col-span-2 flex justify-center space-x-2">
            <User class="w-5 h-5 text-gray-400" />
            <FileText class="w-5 h-5 text-gray-400" />
          </div>

          <!-- Emails Sent -->
          <div class="col-span-2 text-center">
            <span class="text-gray-600 dark:text-gray-400 underline decoration-dotted cursor-help">{{ flow.emailsSent }}</span>
          </div>

          <!-- Actions -->
          <div class="col-span-2 flex items-center justify-center space-x-3">
            <!-- Toggle -->
            <button
              @click="toggleFlow(index)"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                flow.enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  flow.enabled ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </button>

            <!-- More Options -->
            <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <MoreHorizontal class="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ListFilter,
  Plus,
  FileText,
  Mail,
  MessageSquare,
  User,
  MoreHorizontal
} from 'lucide-vue-next'

interface NotificationFlow {
  name: string
  enabled: boolean
  disabledAt: string | null
  emailsSent: number | string
  smsSent: number | string
}

const emit = defineEmits<{
  'toggle-submenu': []
  'toggle-flow': [index: number]
}>()

const notificationFlows = ref<NotificationFlow[]>([
  { name: 'When shipment updates to info received', enabled: false, disabledAt: 'Jan 26, 2026 at 11:37 PM', emailsSent: 0, smsSent: 0 },
  { name: 'When shipment updates to in transit', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to out for delivery', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to available for pickup', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to delivered', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to exception', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
  { name: 'When shipment updates to failed attempt', enabled: false, disabledAt: null, emailsSent: '-', smsSent: '-' },
])

function toggleFlow(index: number) {
  notificationFlows.value[index].enabled = !notificationFlows.value[index].enabled
  if (!notificationFlows.value[index].enabled) {
    notificationFlows.value[index].disabledAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } else {
    notificationFlows.value[index].disabledAt = null
  }
  emit('toggle-flow', index)
}
</script>

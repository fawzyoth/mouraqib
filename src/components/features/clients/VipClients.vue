<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Star class="w-6 h-6 mr-2 text-purple-600 fill-purple-600" />
              Clients VIP
            </h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Vos meilleurs clients avec privileges speciaux</p>
          </div>
        </div>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <!-- VIP Clients List -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-gray-900 dark:text-white">Liste des Clients VIP</h3>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-800">
          <div v-for="client in vipClients" :key="client.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span class="text-lg font-bold text-purple-600">{{ client.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white flex items-center">
                    {{ client.name }}
                    <Star class="w-4 h-4 ml-2 text-purple-600 fill-purple-600" />
                  </p>
                  <p class="text-sm text-gray-500">{{ client.phone }} &bull; {{ client.region }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900 dark:text-white">{{ client.totalSpent.toLocaleString() }} TND</p>
                <p class="text-sm text-gray-500">{{ client.totalOrders }} commandes &bull; {{ client.deliveryRate }}% livraison</p>
              </div>
              <div class="flex items-center space-x-2 ml-4">
                <button @click="$emit('view-client', client)" class="p-2 text-gray-500 hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg">
                  <Eye class="w-4 h-4" />
                </button>
                <button @click="$emit('remove-vip', client)" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg" title="Retirer du statut VIP">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div v-if="vipClients.length === 0" class="p-8 text-center">
            <Star class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p class="text-gray-500">Aucun client VIP pour le moment</p>
            <p class="text-sm text-gray-400 mt-1">Les clients VIP beneficient de privileges speciaux</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ListFilter,
  Star,
  Eye,
  X
} from 'lucide-vue-next'

interface Client {
  id: number
  name: string
  phone: string
  region: string
  totalOrders: number
  deliveryRate: number
  totalSpent: number
  status: string
  [key: string]: any
}

const props = defineProps<{
  clients: Client[]
}>()

defineEmits<{
  (e: 'toggle-submenu'): void
  (e: 'view-client', client: Client): void
  (e: 'remove-vip', client: Client): void
}>()

const vipClients = computed(() => {
  return props.clients.filter(client => client.status === 'vip')
})
</script>

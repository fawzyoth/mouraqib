<template>
  <div
    v-if="clients.length > 0"
    class="absolute z-20 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto"
    :class="wide ? 'min-w-full w-max max-w-[28rem]' : 'w-full'"
  >
    <button
      v-for="client in clients"
      :key="client.id"
      @click="$emit('select', client)"
      class="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
    >
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
        :class="client.status === 'vip' ? 'bg-purple-100 text-purple-600' : client.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-primary-blue/10 text-primary-blue'"
      >
        {{ client.name.charAt(0) }}
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ client.name }}</p>
        <p class="text-xs text-gray-500 truncate">{{ client.phone }} &bull; {{ [client.address, client.delegation, client.region].filter(Boolean).join(', ') }}</p>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0">
        <span v-if="client.status === 'vip'" class="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded">VIP</span>
        <span v-if="client.status === 'blocked'" class="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded flex items-center">
          <AlertTriangle class="w-3 h-3 mr-0.5" />Bloque
        </span>
        <span class="text-xs" :class="client.deliveryRate >= 80 ? 'text-green-600' : client.deliveryRate >= 50 ? 'text-yellow-600' : 'text-red-600'">{{ client.deliveryRate }}%</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  clients: { id: number; name: string; phone: string; address: string; delegation?: string; region: string; status: string; deliveryRate: number; [key: string]: any }[]
  wide?: boolean
}>()

defineEmits<{
  (e: 'select', client: any): void
}>()
</script>

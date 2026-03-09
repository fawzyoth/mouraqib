<template>
  <ModalShell :show="show" title="Mettre à jour les données du client ?" size="md" @close="$emit('dismiss')">
    <div class="space-y-4">
      <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <UserCog class="w-5 h-5 text-blue-500 shrink-0" />
        <p class="text-sm text-blue-800 dark:text-blue-300">
          Vous avez modifié certaines informations du client. Souhaitez-vous mettre à jour sa fiche ?
        </p>
      </div>

      <!-- Diff table -->
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-800/60">
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Champ</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ancien</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nouveau</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="change in changes" :key="change.field" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
              <td class="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ change.label }}</td>
              <td class="px-4 py-2.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 line-through text-xs">
                  {{ change.oldValue || '—' }}
                </span>
              </td>
              <td class="px-4 py-2.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                  {{ change.newValue || '—' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          @click="$emit('dismiss')"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Non, merci
        </button>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 text-sm font-medium text-white bg-[#4959b4] hover:bg-[#3a4791] rounded-lg transition-colors"
        >
          Mettre à jour le client
        </button>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { UserCog } from 'lucide-vue-next'
import ModalShell from '@/components/shared/ModalShell.vue'

export interface ClientChange {
  field: string
  label: string
  oldValue: string
  newValue: string
}

defineProps<{
  show: boolean
  changes: ClientChange[]
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'dismiss'): void
}>()
</script>

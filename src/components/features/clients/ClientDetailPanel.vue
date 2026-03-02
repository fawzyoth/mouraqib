<template>
  <!-- Overlay -->
  <div
    v-if="show && client"
    @click="$emit('close')"
    class="fixed inset-0 bg-black/30 z-40"
  ></div>

  <!-- Panel -->
  <div
    v-if="show && client"
    class="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto"
  >
    <!-- Sticky header -->
    <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ isEditing ? 'Modifier le client' : 'Détails du client' }}</h3>
        <div class="flex items-center gap-1">
          <template v-if="!isEditing">
            <button @click="$emit('enter-edit')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Modifier">
              <Pencil class="w-4 h-4 text-gray-500" />
            </button>
          </template>
          <template v-else>
            <button @click="$emit('cancel-edit')" class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              Annuler
            </button>
            <button @click="$emit('save')" :disabled="isSaving" class="px-3 py-1.5 text-sm text-white bg-primary-blue hover:bg-blue-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50">
              <Loader2 v-if="isSaving" class="w-3.5 h-3.5 animate-spin" />
              Enregistrer
            </button>
          </template>
          <button @click="$emit('close')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X class="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-5">
      <!-- ===== VIEW MODE ===== -->
      <template v-if="!isEditing">
        <!-- Header: Avatar, Name, Status -->
        <div class="text-center py-4">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3" :class="client.status === 'vip' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : client.status === 'blocked' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'">
            {{ client.name.charAt(0) }}
          </div>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ client.name }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ client.phone }}</p>
          <span class="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full"
            :class="{
              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': client.status === 'vip',
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': client.status === 'active',
              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400': client.status === 'inactive',
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': client.status === 'blocked'
            }"
          >
            {{ client.status === 'vip' ? 'VIP' : client.status === 'active' ? 'Actif' : client.status === 'blocked' ? 'Bloqué' : 'Inactif' }}
          </span>
        </div>

        <!-- Contact Info -->
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Contact</p>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <PhoneIcon class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.phone }}</p>
              </div>
            </div>
            <div v-if="client.phoneSecondary" class="flex items-start gap-3">
              <PhoneIcon class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">Téléphone secondaire</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.phoneSecondary }}</p>
              </div>
            </div>
            <div v-if="client.email" class="flex items-start gap-3">
              <Mail class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ client.email }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-800"></div>

        <!-- Address -->
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Adresse</p>
          <div class="space-y-3">
            <div v-if="client.address" class="flex items-start gap-3">
              <MapPin class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">Adresse</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.address }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div v-if="client.region">
                <p class="text-xs text-gray-500 dark:text-gray-400">Gouvernorat</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.region }}</p>
              </div>
              <div v-if="client.delegation">
                <p class="text-xs text-gray-500 dark:text-gray-400">Délégation</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.delegation }}</p>
              </div>
              <div v-if="client.locality">
                <p class="text-xs text-gray-500 dark:text-gray-400">Localité</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.locality }}</p>
              </div>
              <div v-if="client.postalCode">
                <p class="text-xs text-gray-500 dark:text-gray-400">Code postal</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ client.postalCode }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-800"></div>

        <!-- Statistics -->
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Statistiques</p>
          <div class="space-y-2.5">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Total commandes</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ client.totalOrders }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Livrées</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ client.deliveredOrders }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Taux de livraison</span>
              <span class="font-semibold" :class="client.deliveryRate >= 80 ? 'text-green-600 dark:text-green-400' : client.deliveryRate >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'">
                {{ client.deliveryRate }}%
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Total dépensé</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ client.totalSpent.toLocaleString('fr-FR') }} TND</span>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-800"></div>

        <!-- Other Info -->
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Autres</p>
          <div class="space-y-2.5">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Membre depuis</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ client.memberSince }}</span>
            </div>
            <div v-if="client.notes" class="mt-2">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
              <p class="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{{ client.notes }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== EDIT MODE ===== -->
      <template v-else>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nom</label>
            <input v-model="editForm.name" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Téléphone</label>
            <input v-model="editForm.phone" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Téléphone secondaire</label>
            <input v-model="editForm.phoneSecondary" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Optionnel" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <input v-model="editForm.email" type="email" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Optionnel" />
          </div>

          <div class="border-t border-gray-200 dark:border-gray-800"></div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Adresse</label>
            <input v-model="editForm.address" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Optionnel" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Gouvernorat</label>
              <input v-model="editForm.region" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Optionnel" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Délégation</label>
              <input v-model="editForm.delegation" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Optionnel" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Localité</label>
              <input v-model="editForm.locality" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Optionnel" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Code postal</label>
              <input v-model="editForm.postalCode" type="text" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Optionnel" />
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-800"></div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Statut</label>
            <select v-model="editForm.status" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent">
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="vip">VIP</option>
              <option value="blocked">Bloqué</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Notes</label>
            <textarea v-model="editForm.notes" rows="3" class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none" placeholder="Notes sur le client..."></textarea>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Loader2, X, Phone as PhoneIcon, Mail, MapPin } from 'lucide-vue-next'

defineProps<{
  show: boolean
  client: Record<string, any> | null
  isEditing: boolean
  editForm: Record<string, any>
  isSaving: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'enter-edit'): void
  (e: 'cancel-edit'): void
  (e: 'save'): void
}>()
</script>

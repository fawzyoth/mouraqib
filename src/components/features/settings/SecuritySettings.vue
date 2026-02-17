<template>
  <div class="flex flex-col h-full">
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$emit('toggle-submenu')" class="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ListFilter class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Sécurité</h1>
            <p class="text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gérez la sécurité de votre compte</p>
          </div>
        </div>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      <div class="max-w-3xl space-y-6">
        <!-- Change Password -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Key class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Changer le mot de passe</h3>
              <p class="text-xs text-gray-500">Dernière modification il y a 30 jours</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
              <input v-model="securitySettings.currentPassword" type="password" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
              <input v-model="securitySettings.newPassword" type="password" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le nouveau mot de passe</label>
              <input v-model="securitySettings.confirmPassword" type="password" class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white" />
            </div>
            <button @click="changePassword" class="btn-cta">
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>

        <!-- Two-Factor Authentication -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Shield class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Authentification à deux facteurs (2FA)</h3>
                <p class="text-xs text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
              </div>
            </div>
            <button
              @click="securitySettings.twoFactorEnabled = !securitySettings.twoFactorEnabled"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                securitySettings.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  securitySettings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
          <div v-if="securitySettings.twoFactorEnabled" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div class="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle class="w-4 h-4" />
              <span class="text-sm font-medium">2FA est activé</span>
            </div>
            <p class="text-xs text-green-600 dark:text-green-500 mt-1">Votre compte est protégé par l'authentification à deux facteurs.</p>
          </div>
          <div v-else class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div class="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle class="w-4 h-4" />
              <span class="text-sm font-medium">2FA n'est pas activé</span>
            </div>
            <p class="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Activez 2FA pour une meilleure sécurité de votre compte.</p>
          </div>
        </div>

        <!-- Active Sessions -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Monitor class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Sessions actives</h3>
              <p class="text-xs text-gray-500">Appareils actuellement connectés à votre compte</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-for="session in activeSessions" :key="session.id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center gap-3">
                <Monitor class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.device }}</p>
                  <p class="text-xs text-gray-500">{{ session.location }} • {{ session.lastActive }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="session.current" class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">Actuelle</span>
                <button v-else @click="$emit('disconnect-session', session.id)" class="text-xs text-red-600 hover:text-red-700">Déconnecter</button>
              </div>
            </div>
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
  Key,
  Shield,
  CheckCircle,
  AlertTriangle,
  Monitor
} from 'lucide-vue-next'

interface Session {
  id: string | number
  device: string
  location: string
  lastActive: string
  current?: boolean
}

interface Props {
  activeSessions: Session[]
}

defineProps<Props>()

const emit = defineEmits<{
  'toggle-submenu': []
  'change-password': [data: { currentPassword: string; newPassword: string }]
  'toggle-2fa': [enabled: boolean]
  'disconnect-session': [sessionId: string | number]
}>()

const securitySettings = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false
})

function changePassword() {
  if (securitySettings.value.newPassword !== securitySettings.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }
  if (securitySettings.value.newPassword.length < 8) {
    alert('Le mot de passe doit contenir au moins 8 caractères')
    return
  }
  emit('change-password', {
    currentPassword: securitySettings.value.currentPassword,
    newPassword: securitySettings.value.newPassword
  })
  alert('Mot de passe modifié avec succès!')
  securitySettings.value.currentPassword = ''
  securitySettings.value.newPassword = ''
  securitySettings.value.confirmPassword = ''
}
</script>

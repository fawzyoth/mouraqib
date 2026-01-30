<template>
  <div class="min-h-screen flex" :class="themeStore.isDark ? 'dark' : ''">
    <!-- Left Side - Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="mb-8">
          <img src="@/logo/Group 16.svg" alt="Logo" class="h-10 w-auto" />
        </div>

        <!-- Success State -->
        <template v-if="resetSuccess">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mot de passe modifié !</h1>
            <p class="text-gray-500 mb-8">Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <router-link
              to="/signin"
              class="inline-flex items-center justify-center space-x-2 w-full py-3 px-4 bg-[#4959b4] hover:bg-[#3a4791] text-white font-medium rounded-lg transition-colors"
            >
              <span>Se connecter</span>
              <ArrowRight class="w-5 h-5" />
            </router-link>
          </div>
        </template>

        <!-- Invalid Token State -->
        <template v-else-if="invalidToken">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle class="w-8 h-8 text-red-600" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lien invalide ou expiré</h1>
            <p class="text-gray-500 mb-8">Ce lien de réinitialisation n'est plus valide. Veuillez demander un nouveau lien.</p>
            <router-link
              to="/forgot-password"
              class="inline-flex items-center justify-center space-x-2 w-full py-3 px-4 bg-[#4959b4] hover:bg-[#3a4791] text-white font-medium rounded-lg transition-colors"
            >
              <span>Demander un nouveau lien</span>
            </router-link>
          </div>
        </template>

        <!-- Reset Form -->
        <template v-else>
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Créer un nouveau mot de passe</h1>
            <p class="text-gray-500 mt-2">Entrez votre nouveau mot de passe ci-dessous.</p>
          </div>

          <!-- Email Display -->
          <div class="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-500">Réinitialisation pour</p>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ userEmail }}</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <div class="relative">
                <Lock class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Minimum 6 caractères"
                  class="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <!-- Password Strength -->
              <div class="mt-2">
                <div class="flex items-center space-x-2">
                  <div class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full transition-all duration-300 rounded-full"
                      :class="passwordStrengthColor"
                      :style="{ width: passwordStrengthWidth }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ passwordStrengthLabel }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div class="relative">
                <Lock class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Répétez le mot de passe"
                  class="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
              <!-- Match indicator -->
              <div v-if="confirmPassword" class="mt-2 flex items-center space-x-2">
                <CheckCircle v-if="passwordsMatch" class="w-4 h-4 text-green-500" />
                <AlertCircle v-else class="w-4 h-4 text-red-500" />
                <span class="text-xs" :class="passwordsMatch ? 'text-green-600' : 'text-red-600'">
                  {{ passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas' }}
                </span>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isLoading || !passwordsMatch || password.length < 6"
              class="w-full py-3 px-4 bg-[#4959b4] hover:bg-[#3a4791] text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}</span>
            </button>
          </form>
        </template>

        <!-- Theme Toggle -->
        <div class="mt-8 flex justify-center">
          <button
            @click="themeStore.toggleTheme"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Moon v-if="!themeStore.isDark" class="w-5 h-5" />
            <Sun v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Right Side - Illustration -->
    <div class="hidden lg:flex flex-1 items-center justify-center p-8" style="background-color: #222628;">
      <div class="text-center max-w-lg">
        <div class="mb-8">
          <ShieldCheck class="w-24 h-24 text-orange-500 mx-auto" />
        </div>
        <h2 class="text-3xl font-bold text-white mb-4">
          Sécurisez votre compte
        </h2>
        <p class="text-gray-400 text-lg">
          Choisissez un mot de passe fort pour protéger votre compte et vos données.
        </p>
        <div class="mt-8 space-y-4 text-left max-w-sm mx-auto">
          <div class="flex items-center space-x-3 text-gray-300">
            <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Minimum 6 caractères</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-300">
            <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Mélangez lettres et chiffres</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-300">
            <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Évitez les mots de passe courants</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-300">
            <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Utilisez un mot de passe unique</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const resetSuccess = ref(false)
const invalidToken = ref(false)
const userEmail = ref('')
const token = ref('')

onMounted(() => {
  // Get email and token from query params
  userEmail.value = (route.query.email as string) || ''
  token.value = (route.query.token as string) || ''

  // Check if token is valid (in demo, we just check if it exists)
  if (!token.value || !userEmail.value) {
    invalidToken.value = true
  }
})

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value && confirmPassword.value.length > 0
})

const passwordStrength = computed(() => {
  const pwd = password.value
  if (pwd.length === 0) return 0
  if (pwd.length < 6) return 1
  if (pwd.length < 8) return 2
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 4
  if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) return 3
  return 2
})

const passwordStrengthWidth = computed(() => {
  return `${passwordStrength.value * 25}%`
})

const passwordStrengthColor = computed(() => {
  const colors = ['bg-gray-300', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  return colors[passwordStrength.value]
})

const passwordStrengthLabel = computed(() => {
  const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort']
  return labels[passwordStrength.value]
})

async function handleSubmit() {
  error.value = ''

  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  isLoading.value = true

  const result = await authStore.resetPassword(token.value, password.value)

  isLoading.value = false

  if (result.success) {
    resetSuccess.value = true
  } else {
    error.value = result.error || 'Une erreur est survenue'
  }
}
</script>

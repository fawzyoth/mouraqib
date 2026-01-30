<template>
  <div class="min-h-screen flex" :class="themeStore.isDark ? 'dark' : ''">
    <!-- Left Side - Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="mb-8">
          <img src="@/logo/Group 16.svg" alt="Logo" class="h-10 w-auto" />
        </div>

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Créer un compte</h1>
          <p class="text-gray-500 mt-2">Remplissez le formulaire pour commencer.</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom complet
            </label>
            <input
              v-model="name"
              type="text"
              placeholder="Votre nom"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              :disabled="authStore.isLoading"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="vous@exemple.com"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              :disabled="authStore.isLoading"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimum 6 caractères"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                :disabled="authStore.isLoading"
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
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmer le mot de passe
            </label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Répétez le mot de passe"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                :disabled="authStore.isLoading"
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
          </div>

          <div class="flex items-start space-x-2">
            <input type="checkbox" v-model="acceptTerms" class="w-4 h-4 rounded mt-0.5" />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              J'accepte les <a href="#" class="text-blue-600 hover:underline">conditions d'utilisation</a>
              et la <a href="#" class="text-blue-600 hover:underline">politique de confidentialité</a>
            </span>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading || !acceptTerms"
            class="w-full py-3 px-4 bg-[#4959b4] hover:bg-[#3a4791] text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="authStore.isLoading" class="w-5 h-5 animate-spin" />
            <span>{{ authStore.isLoading ? 'Création...' : 'Créer mon compte' }}</span>
          </button>
        </form>

        <!-- Sign In Link -->
        <p class="mt-8 text-center text-gray-600 dark:text-gray-400">
          Déjà un compte ?
          <router-link to="/signin" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            Se connecter
          </router-link>
        </p>

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
          <Truck class="w-24 h-24 text-orange-500 mx-auto" />
        </div>
        <h2 class="text-3xl font-bold text-white mb-4">
          Rejoignez Mouraqib
        </h2>
        <p class="text-gray-400 text-lg">
          Créez votre compte gratuitement et commencez à suivre
          vos colis en quelques minutes.
        </p>
        <div class="mt-8 space-y-4 text-left max-w-sm mx-auto">
          <div class="flex items-center space-x-3 text-gray-300">
            <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Suivi en temps réel de vos colis</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-300">
            <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Notifications automatiques par SMS/WhatsApp</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-300">
            <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Statistiques et rapports détaillés</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-300">
            <CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Gestion de votre base clients</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { Eye, EyeOff, Loader2, Moon, Sun, Truck, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptTerms = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''

  if (!acceptTerms.value) {
    error.value = 'Veuillez accepter les conditions d\'utilisation'
    return
  }

  const result = await authStore.signUp(name.value, email.value, password.value, confirmPassword.value)

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error || 'Une erreur est survenue'
  }
}
</script>

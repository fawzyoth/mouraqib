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
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h1>
          <p class="text-gray-500 mt-2">Bienvenue ! Connectez-vous pour continuer.</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
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
                placeholder="Entrez votre mot de passe"
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

          <div class="flex items-center justify-between">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" v-model="rememberMe" class="w-4 h-4 rounded" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
            </label>
            <router-link to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Mot de passe oublié ?
            </router-link>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-3 px-4 bg-[#4959b4] hover:bg-[#3a4791] text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="authStore.isLoading" class="w-5 h-5 animate-spin" />
            <span>{{ authStore.isLoading ? 'Connexion...' : 'Se connecter' }}</span>
          </button>
        </form>

        <!-- Sign Up Link -->
        <p class="mt-8 text-center text-gray-600 dark:text-gray-400">
          Pas encore de compte ?
          <router-link to="/signup" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            Créer un compte
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

    <!-- Right Side - Animated Illustration -->
    <div class="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden" style="background-color: #222628;">
      <!-- Header Text -->
      <div class="absolute top-8 left-0 right-0 text-center z-20 px-8">
        <h2 class="text-2xl font-bold text-white mb-2">
          Suivez vos colis en temps réel
        </h2>
        <p class="text-gray-400 text-sm max-w-md mx-auto">
          Visualisez en direct comment fonctionne votre futur tableau de bord
        </p>
      </div>

      <!-- Animation Component -->
      <DeliveryAnimation class="w-full h-full" />

      <!-- Bottom Stats -->
      <div class="absolute bottom-8 left-0 right-0 z-20">
        <div class="flex items-center justify-center space-x-8 text-gray-400">
          <div class="text-center">
            <p class="text-xl font-bold text-white">1000+</p>
            <p class="text-xs">Colis suivis</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold text-white">98%</p>
            <p class="text-xs">Taux de livraison</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold text-white">24/7</p>
            <p class="text-xs">Support</p>
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
import { Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-vue-next'
import DeliveryAnimation from '@/components/DeliveryAnimation.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''

  const result = await authStore.signIn(email.value, password.value)

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error || 'Une erreur est survenue'
  }
}
</script>

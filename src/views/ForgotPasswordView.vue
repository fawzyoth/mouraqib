<template>
  <div class="min-h-screen flex" :class="themeStore.isDark ? 'dark' : ''">
    <!-- Left Side - Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="mb-8">
          <img src="@/logo/Group 16.svg" alt="Logo" class="h-10 w-auto" />
        </div>

        <!-- Back Link -->
        <router-link to="/signin" class="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
          <ArrowLeft class="w-4 h-4" />
          <span>Retour à la connexion</span>
        </router-link>

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mot de passe oublié ?</h1>
          <p class="text-gray-500 mt-2">Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
        </div>

        <!-- Success Message -->
        <div v-if="emailSent" class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div class="flex items-start space-x-3">
            <CheckCircle class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-green-800 dark:text-green-400">Email envoyé !</p>
              <p class="text-sm text-green-700 dark:text-green-500 mt-1">
                Si un compte existe avec l'adresse <strong>{{ email }}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Form -->
        <form v-if="!emailSent" @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <div class="relative">
              <Mail class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="email"
                type="email"
                placeholder="vous@exemple.com"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                :disabled="isLoading"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 bg-[#4959b4] hover:bg-[#3a4791] text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
            <span>{{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien' }}</span>
          </button>
        </form>

        <!-- Resend Link -->
        <div v-if="emailSent" class="mt-6">
          <button
            @click="resetForm"
            class="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Utiliser une autre adresse email
          </button>
        </div>

        <!-- Help Text -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">
            Vous n'avez pas reçu l'email ?
            <button
              v-if="emailSent"
              @click="handleSubmit"
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              :disabled="isLoading"
            >
              Renvoyer
            </button>
          </p>
        </div>

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
          <KeyRound class="w-24 h-24 text-orange-500 mx-auto" />
        </div>
        <h2 class="text-3xl font-bold text-white mb-4">
          Pas de panique !
        </h2>
        <p class="text-gray-400 text-lg">
          Nous allons vous aider à récupérer l'accès à votre compte en quelques étapes simples.
        </p>
        <div class="mt-8 space-y-4 text-left max-w-sm mx-auto">
          <div class="flex items-center space-x-3 text-gray-300">
            <div class="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-bold text-orange-500">1</span>
            </div>
            <span>Entrez votre adresse email</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-300">
            <div class="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-bold text-orange-500">2</span>
            </div>
            <span>Recevez un lien par email</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-300">
            <div class="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-bold text-orange-500">3</span>
            </div>
            <span>Créez un nouveau mot de passe</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { ArrowLeft, Mail, Loader2, Moon, Sun, KeyRound, CheckCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const email = ref('')
const isLoading = ref(false)
const emailSent = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''

  if (!email.value) {
    error.value = 'Veuillez entrer votre adresse email'
    return
  }

  if (!email.value.includes('@')) {
    error.value = 'Veuillez entrer une adresse email valide'
    return
  }

  isLoading.value = true

  const result = await authStore.requestPasswordReset(email.value)

  isLoading.value = false

  if (result.success) {
    emailSent.value = true
  } else {
    error.value = result.error || 'Une erreur est survenue'
  }
}

function resetForm() {
  email.value = ''
  emailSent.value = false
  error.value = ''
}
</script>

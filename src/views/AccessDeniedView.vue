<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <div class="text-center max-w-md">
      <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <ShieldOff class="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Accès refusé</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page. Contactez votre administrateur pour obtenir l'accès.
      </p>
      <router-link
        to="/dashboard"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4959b4] hover:bg-[#3d4a99] text-white text-sm font-medium rounded-lg transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        Retour au tableau de bord
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldOff, ArrowLeft } from 'lucide-vue-next'
</script>

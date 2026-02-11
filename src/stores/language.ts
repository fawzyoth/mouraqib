import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  const currentLocale = ref('fr')

  return {
    currentLocale
  }
})

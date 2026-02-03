import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setLocale } from '@/i18n'

export const useLanguageStore = defineStore('language', () => {
  const currentLocale = ref<'ar' | 'fr'>(
    (localStorage.getItem('locale') as 'ar' | 'fr') || 'ar'
  )

  const isRTL = computed(() => currentLocale.value === 'ar')

  const languageLabel = computed(() => {
    return currentLocale.value === 'ar' ? 'العربية' : 'Français'
  })

  function setLanguage(locale: 'ar' | 'fr') {
    currentLocale.value = locale
    setLocale(locale)
  }

  function toggleLanguage() {
    const newLocale = currentLocale.value === 'ar' ? 'fr' : 'ar'
    setLanguage(newLocale)
  }

  return {
    currentLocale,
    isRTL,
    languageLabel,
    setLanguage,
    toggleLanguage
  }
})

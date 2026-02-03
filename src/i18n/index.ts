import { createI18n } from 'vue-i18n'
import ar from './locales/ar'
import fr from './locales/fr'

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'ar',
  fallbackLocale: 'fr',
  messages: {
    ar,
    fr
  }
})

export function setLocale(locale: 'ar' | 'fr') {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = locale
}

// Initialize direction on load
export function initLocale() {
  const locale = localStorage.getItem('locale') || 'ar'
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = locale
}

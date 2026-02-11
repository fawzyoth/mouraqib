import { createI18n } from 'vue-i18n'
import fr from './locales/fr'

export const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: {
    fr
  }
})

export function setLocale(locale: 'fr') {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.dir = 'ltr'
  document.documentElement.lang = locale
}

// Initialize direction on load
export function initLocale() {
  document.documentElement.dir = 'ltr'
  document.documentElement.lang = 'fr'
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n, initLocale } from './i18n'
import { useAuthStore } from './stores/auth'
import './assets/main.css'

// Initialize locale direction
initLocale()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Initialize auth store
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')

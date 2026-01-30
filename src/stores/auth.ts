import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  organization: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  function initialize() {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        user.value = JSON.parse(stored)
      } catch {
        localStorage.removeItem('user')
      }
    }
  }

  async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Fake validation
    if (!email || !password) {
      isLoading.value = false
      return { success: false, error: 'Veuillez remplir tous les champs' }
    }

    if (password.length < 6) {
      isLoading.value = false
      return { success: false, error: 'Mot de passe incorrect' }
    }

    // Create fake user
    const fakeUser: User = {
      id: 'user-' + Date.now(),
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email: email,
      organization: 'Mon Entreprise'
    }

    user.value = fakeUser
    localStorage.setItem('user', JSON.stringify(fakeUser))
    isLoading.value = false

    return { success: true }
  }

  async function signUp(name: string, email: string, password: string, confirmPassword: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      isLoading.value = false
      return { success: false, error: 'Veuillez remplir tous les champs' }
    }

    if (!email.includes('@')) {
      isLoading.value = false
      return { success: false, error: 'Adresse email invalide' }
    }

    if (password.length < 6) {
      isLoading.value = false
      return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' }
    }

    if (password !== confirmPassword) {
      isLoading.value = false
      return { success: false, error: 'Les mots de passe ne correspondent pas' }
    }

    // Create fake user
    const fakeUser: User = {
      id: 'user-' + Date.now(),
      name: name,
      email: email,
      organization: 'Mon Entreprise'
    }

    user.value = fakeUser
    localStorage.setItem('user', JSON.stringify(fakeUser))
    isLoading.value = false

    return { success: true }
  }

  function signOut() {
    user.value = null
    localStorage.removeItem('user')
  }

  async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Validation
    if (!email) {
      return { success: false, error: 'Veuillez entrer votre adresse email' }
    }

    if (!email.includes('@')) {
      return { success: false, error: 'Adresse email invalide' }
    }

    // In a real app, this would send an email
    // For demo purposes, we always return success
    return { success: true }
  }

  async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Validation
    if (!token) {
      return { success: false, error: 'Token invalide' }
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' }
    }

    // In a real app, this would verify the token and update the password
    // For demo purposes, we always return success
    return { success: true }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    initialize,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    resetPassword
  }
})

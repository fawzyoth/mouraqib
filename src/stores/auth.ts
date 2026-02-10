import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { Profile, Organization } from '@/types/database'

export interface User {
  id: string
  name: string
  email: string
  organization: string
  organizationId: string | null
  role: string
  isAdmin: boolean
  avatarUrl: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const organization = ref<Organization | null>(null)
  const session = ref<Session | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const isDemoMode = ref(false)

  const isAuthenticated = computed(() => isDemoMode.value || (!!session.value && !!user.value))
  const isPlatformAdmin = computed(() => user.value?.isAdmin ?? false)

  async function initialize() {
    if (isInitialized.value) return

    // Check for demo mode first
    checkDemoMode()
    if (isDemoMode.value) {
      isInitialized.value = true
      return
    }

    // Skip initialization if Supabase is not configured
    if (!isSupabaseConfigured) {
      console.warn('Skipping auth initialization - Supabase not configured')
      isInitialized.value = true
      return
    }

    try {
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (currentSession) {
        session.value = currentSession
        await loadUserProfile(currentSession.user)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession

        if (event === 'SIGNED_IN' && newSession) {
          await loadUserProfile(newSession.user)
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          profile.value = null
          organization.value = null
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          session.value = newSession
        }
      })

      isInitialized.value = true
    } catch (error) {
      console.error('Error initializing auth:', error)
      isInitialized.value = true
    }
  }

  async function loadUserProfile(supabaseUser: SupabaseUser) {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
        return
      }

      profile.value = profileData

      // Load organization if exists
      if (profileData.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single()

        if (!orgError && orgData) {
          organization.value = orgData
        }
      }

      // Set user object
      user.value = {
        id: supabaseUser.id,
        name: profileData.name,
        email: profileData.email,
        organization: organization.value?.name ?? '',
        organizationId: profileData.organization_id,
        role: profileData.role,
        isAdmin: profileData.is_admin,
        avatarUrl: profileData.avatar_url
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true

    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase n\'est pas configuré. Veuillez configurer les variables d\'environnement.' }
      }

      // Validation
      if (!email || !password) {
        return { success: false, error: 'Veuillez remplir tous les champs' }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Map Supabase errors to French messages
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou mot de passe incorrect' }
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Veuillez confirmer votre email avant de vous connecter' }
        }
        return { success: false, error: error.message }
      }

      if (data.session) {
        session.value = data.session
        await loadUserProfile(data.user)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { success: false, error: 'Une erreur est survenue' }
    } finally {
      isLoading.value = false
    }
  }

  // Demo mode sign-in (bypasses Supabase)
  function signInDemo(): { success: boolean } {
    isDemoMode.value = true
    user.value = {
      id: 'demo-user-001',
      name: 'Utilisateur Demo',
      email: 'demo@mouraqib.com',
      organization: 'Ma Boutique Demo',
      organizationId: 'demo-org-001',
      role: 'owner',
      isAdmin: false,
      avatarUrl: null
    }
    localStorage.setItem('demoMode', 'true')
    return { success: true }
  }

  // Check for demo mode on init
  function checkDemoMode() {
    if (localStorage.getItem('demoMode') === 'true') {
      signInDemo()
    }
  }

  async function signUp(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true

    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase n\'est pas configuré. Veuillez configurer les variables d\'environnement.' }
      }

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        return { success: false, error: 'Veuillez remplir tous les champs' }
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Adresse email invalide' }
      }

      if (password.length < 6) {
        return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' }
      }

      if (password !== confirmPassword) {
        return { success: false, error: 'Les mots de passe ne correspondent pas' }
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Cet email est déjà utilisé' }
        }
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Erreur lors de la création du compte' }
      }

      // Create organization for new user
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: `${name}'s Organization`,
          email: email
        })
        .select()
        .single()

      if (orgError) {
        console.error('Error creating organization:', orgError)
        // Continue without org - admin can assign later
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: name,
          email: email,
          organization_id: orgData?.id ?? null,
          role: 'owner',
          is_admin: false
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return { success: false, error: 'Erreur lors de la création du profil' }
      }

      // If email confirmation is required, session will be null
      if (data.session) {
        session.value = data.session
        await loadUserProfile(data.user)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { success: false, error: 'Une erreur est survenue' }
    } finally {
      isLoading.value = false
    }
  }

  async function signOut() {
    try {
      // Clear demo mode
      isDemoMode.value = false
      localStorage.removeItem('demoMode')

      await supabase.auth.signOut()
      user.value = null
      profile.value = null
      organization.value = null
      session.value = null
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!email) {
        return { success: false, error: 'Veuillez entrer votre adresse email' }
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Adresse email invalide' }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Password reset request error:', error)
      return { success: false, error: 'Une erreur est survenue' }
    }
  }

  async function resetPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Une erreur est survenue' }
    }
  }

  async function updateProfile(updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
    if (!user.value) {
      return { success: false, error: 'Non authentifié' }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Refresh profile
      if (session.value?.user) {
        await loadUserProfile(session.value.user)
      }

      return { success: true }
    } catch (error: any) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Une erreur est survenue' }
    }
  }

  return {
    user,
    profile,
    organization,
    session,
    isLoading,
    isInitialized,
    isAuthenticated,
    isPlatformAdmin,
    isDemoMode,
    initialize,
    signIn,
    signInDemo,
    signUp,
    signOut,
    requestPasswordReset,
    resetPassword,
    updateProfile
  }
})

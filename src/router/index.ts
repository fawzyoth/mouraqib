import { createRouter, createWebHashHistory } from 'vue-router'
import { isSupabaseConfigured } from '@/lib/supabase'
import { subSectionRoutes } from '@/composables/useNavigation'
import { useAuthStore } from '@/stores/auth'
import { featureFlagsService } from '@/services/featureFlags'

// Section-specific view components (lazy-loaded)
const sectionComponents: Record<string, () => Promise<any>> = {
  dashboard:      () => import('@/views/DashboardView.vue'),
  clients:        () => import('@/views/ClientsView.vue'),
  shipments:      () => import('@/views/ShipmentsView.vue'),
  pickups:        () => import('@/views/PickupsView.vue'),
  returns:        () => import('@/views/ReturnsView.vue'),
  carriers:       () => import('@/views/CarriersView.vue'),
  finance:        () => import('@/views/FinanceView.vue'),
  analytics:      () => import('@/views/AnalyticsView.vue'),
  settings:       () => import('@/views/SettingsView.vue'),
  administration: () => import('@/views/AdminView.vue'),
}

// Generate app routes — each section maps to its own view component
const appRoutes = Object.entries(subSectionRoutes).map(([subSection, { path, mainSection }]) => ({
  path,
  component: sectionComponents[mainSection] || sectionComponents.dashboard,
  meta: {
    requiresAuth: true,
    mainSection,
    subSection,
    feature: `${mainSection}.${subSection}`,
    ...(mainSection === 'administration' ? { requiresAdmin: true } : {}),
  },
}))

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'waiting-list',
      component: () => import('@/views/WaitingListView.vue'),
      meta: { public: true }
    },
    {
      path: '/waitinglist',
      name: 'waiting-list-v2',
      component: () => import('@/views/WaitingListV2View.vue'),
      meta: { public: true }
    },
    {
      path: '/landing',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { public: true }
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('@/views/SignInView.vue'),
      meta: { public: true, authRedirect: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUpView.vue'),
      meta: { public: true, authRedirect: true }
    },
    {
      path: '/forgot-password',
      redirect: '/signin'
    },
    {
      path: '/reset-password',
      redirect: '/signin'
    },
    // All app feature routes nested under the authenticated layout
    {
      path: '',
      component: () => import('@/views/AppLayoutView.vue'),
      children: appRoutes,
    },
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('@/views/AccessDeniedView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

// Navigation guard — waits for auth init, then uses in-memory state (no per-nav getSession calls)
router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const authRedirect = to.meta.authRedirect

  // Check for demo mode first
  const isDemoMode = localStorage.getItem('demoMode') === 'true'
  if (isDemoMode) {
    if (authRedirect) {
      return next({ path: '/dashboard' })
    }
    return next()
  }

  // Skip auth checks if Supabase is not configured
  if (!isSupabaseConfigured) {
    if (requiresAuth) {
      return next({ name: 'signin' })
    }
    return next()
  }

  // Wait for the auth store to finish its one-time init (restores session from
  // localStorage).  After that, we rely on in-memory state kept in sync by
  // onAuthStateChange — no per-navigation getSession() calls.
  const authStore = useAuthStore()
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }
  const isAuthenticated = authStore.isAuthenticated

  // If route requires auth and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    return next({
      name: 'signin',
      query: { redirect: to.fullPath }
    })
  }

  // If user is authenticated and trying to access auth pages
  if (authRedirect && isAuthenticated) {
    return next({ path: '/dashboard' })
  }

  // If route requires admin and user is not a platform admin
  if (to.meta.requiresAdmin && isAuthenticated) {
    if (!authStore.isPlatformAdmin) {
      return next({ path: '/access-denied' })
    }
  }

  // Feature flag check — opt-in model: block unless explicitly enabled
  if (isAuthenticated && to.meta.feature && to.meta.mainSection && to.meta.mainSection !== 'dashboard') {
    const orgId = authStore.user?.organizationId
    const role = authStore.user?.role || 'agent_confirmation'

    // Superadmin bypasses all feature flag checks
    if (role === 'superadmin') return next()

    if (orgId) {
      // Ensure flags are loaded before checking (handles direct URL navigation)
      let flags = featureFlagsService.getCached()
      if (!flags) {
        try {
          flags = await featureFlagsService.getForOrg(orgId)
        } catch {
          return next({ path: '/access-denied' })
        }
      }

      const flagMap = new Map<string, boolean>()
      for (const f of flags) {
        flagMap.set(`${f.role}.${f.feature}`, f.enabled)
      }

      const feature = to.meta.feature as string
      const mainSection = to.meta.mainSection as string

      // Check parent section — must be explicitly enabled
      const parentKey = `${role}.${mainSection}`
      if (!flagMap.get(parentKey)) {
        return next({ path: '/access-denied' })
      }

      // Check specific feature — must be explicitly enabled
      const featureKey = `${role}.${feature}`
      if (!flagMap.get(featureKey)) {
        return next({ path: '/access-denied' })
      }
    }
  }

  next()
})

export default router

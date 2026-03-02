import { createRouter, createWebHashHistory } from 'vue-router'
import { isSupabaseConfigured } from '@/lib/supabase'
import { subSectionRoutes } from '@/composables/useNavigation'
import { useAuthStore } from '@/stores/auth'
import { featureFlagsService } from '@/services/featureFlags'

// Single lazy-import reference so Vue Router reuses the same component instance
const DeliveryTrackerView = () => import('@/views/DeliveryTrackerView.vue')

// Generate app routes from the subSectionRoutes map
const appRoutes = Object.entries(subSectionRoutes).map(([subSection, { path, mainSection }]) => ({
  path,
  component: DeliveryTrackerView,
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
    // All app feature routes (each renders DeliveryTrackerView)
    ...appRoutes,
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

// Navigation guard — uses cached auth state from the Pinia store to avoid
// async getSession() calls that can hang after browser-tab switches.
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const authRedirect = to.meta.authRedirect

  // Check for demo mode first
  const isDemoMode = localStorage.getItem('demoMode') === 'true'
  if (isDemoMode) {
    if (authRedirect) return next({ path: '/dashboard' })
    return next()
  }

  // Skip auth checks if Supabase is not configured
  if (!isSupabaseConfigured) {
    if (requiresAuth) return next({ name: 'signin' })
    return next()
  }

  // Ensure auth store is initialized (awaits the same promise if already in progress)
  const authStore = useAuthStore()
  if (!authStore.isInitialized) {
    await Promise.race([
      authStore.initialize(),
      new Promise<void>(resolve => setTimeout(resolve, 3000)),
    ])
  }

  // Use cached auth state — no async Supabase call on every navigation
  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'signin', query: { redirect: to.fullPath } })
  }

  if (authRedirect && isAuthenticated) {
    return next({ path: '/dashboard' })
  }

  if (to.meta.requiresAdmin && isAuthenticated) {
    if (!authStore.isPlatformAdmin) {
      return next({ path: '/dashboard' })
    }
  }

  // Role-based section guard (defense in depth alongside feature flags)
  if (isAuthenticated && to.meta.mainSection) {
    const role = authStore.user?.role || 'agent_warehouse'
    const section = to.meta.mainSection as string
    const SECTION_ACCESS: Record<string, string[]> = {
      clients:        ['owner', 'manager', 'agent_confirmation'],
      carriers:       ['owner', 'manager'],
      finance:        ['owner', 'manager'],
      analytics:      ['owner', 'manager'],
      settings:       ['owner', 'manager'],
      administration: ['owner'],
    }
    const allowedRoles = SECTION_ACCESS[section]
    if (allowedRoles && !allowedRoles.includes(role)) {
      return next({ path: '/dashboard' })
    }
  }

  // Feature flag check — uses service cache (sync if cache is fresh)
  if (isAuthenticated && to.meta.feature && to.meta.mainSection) {
    const orgId = authStore.user?.organizationId
    const role = authStore.user?.role || 'agent_warehouse'

    if (orgId) {
      try {
        const flags = await Promise.race([
          featureFlagsService.getForOrg(orgId),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
        ])
        const flagMap = new Map<string, boolean>()
        for (const f of flags) {
          flagMap.set(`${f.role}.${f.feature}`, f.enabled)
        }

        const feature = to.meta.feature as string
        const mainSection = to.meta.mainSection as string

        const parentKey = `${role}.${mainSection}`
        if (flagMap.has(parentKey) && !flagMap.get(parentKey)) {
          return next({ path: '/dashboard' })
        }

        const featureKey = `${role}.${feature}`
        if (flagMap.has(featureKey) && !flagMap.get(featureKey)) {
          return next({ path: '/dashboard' })
        }
      } catch {
        // On error or timeout, allow navigation (fail-open)
      }
    }
  }

  next()
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
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

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
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

  // Get current session
  let isAuthenticated = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated = !!session
  } catch (error) {
    console.error('Error checking auth session:', error)
  }

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
    const authStore = useAuthStore()
    if (!authStore.isPlatformAdmin) {
      return next({ path: '/dashboard' })
    }
  }

  // Feature flag check — skip for demo mode (already handled above)
  if (isAuthenticated && to.meta.feature && to.meta.mainSection) {
    const authStore = useAuthStore()
    const orgId = authStore.user?.organizationId
    const role = authStore.user?.role || 'user'

    // Superadmin bypasses all feature flag checks
    if (role === 'superadmin') return next()

    if (orgId) {
      try {
        const flags = await featureFlagsService.getForOrg(orgId)
        const flagMap = new Map<string, boolean>()
        for (const f of flags) {
          flagMap.set(`${f.role}.${f.feature}`, f.enabled)
        }

        const feature = to.meta.feature as string
        const mainSection = to.meta.mainSection as string

        // Check parent section
        const parentKey = `${role}.${mainSection}`
        if (flagMap.has(parentKey) && !flagMap.get(parentKey)) {
          return next({ path: '/dashboard' })
        }

        // Check specific feature
        const featureKey = `${role}.${feature}`
        if (flagMap.has(featureKey) && !flagMap.get(featureKey)) {
          return next({ path: '/dashboard' })
        }
      } catch (err) {
        // On error, allow navigation (fail-open)
        console.error('Feature flag check failed:', err)
      }
    }
  }

  next()
})

export default router

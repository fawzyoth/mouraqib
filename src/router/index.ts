import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { subSectionRoutes } from '@/composables/useNavigation'

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
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { public: true }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { public: true }
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

  next()
})

export default router

import { ref, computed, type Ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { featureFlagsService } from '@/services/featureFlags'

export function useFeatureFlags(orgId: Ref<string>) {
  const authStore = useAuthStore()

  // Cache: "role.feature" → enabled
  const flagsMap = ref<Map<string, boolean>>(new Map())
  const isLoaded = ref(false)

  const userRole = computed(() => authStore.user?.role || 'user')

  async function loadFlags() {
    // In demo mode, everything is enabled — no DB call
    if (authStore.isDemoMode) {
      isLoaded.value = true
      return
    }

    if (!orgId.value) return

    try {
      const flags = await featureFlagsService.getForOrg(orgId.value)
      const map = new Map<string, boolean>()
      for (const f of flags) {
        map.set(`${f.role}.${f.feature}`, f.enabled)
      }
      flagsMap.value = map
    } catch (err) {
      console.error('Failed to load feature flags:', err)
    } finally {
      isLoaded.value = true
    }
  }

  /**
   * Check if a feature is enabled for the current user's role.
   * Opt-out model: returns true if no flag row exists.
   * If a parent section is disabled, its children are also disabled.
   */
  function isFeatureEnabled(feature: string): boolean {
    // Demo mode: everything enabled
    if (authStore.isDemoMode) return true

    // Superadmin bypass: all features enabled
    if (authStore.user?.role === 'superadmin') return true

    const role = userRole.value

    // Check parent section first (e.g. "shipments" for "shipments.create-shipment")
    const dotIndex = feature.indexOf('.')
    if (dotIndex !== -1) {
      const parentSection = feature.substring(0, dotIndex)
      const parentKey = `${role}.${parentSection}`
      if (flagsMap.value.has(parentKey) && !flagsMap.value.get(parentKey)) {
        return false
      }
    }

    // Check the feature itself
    const key = `${role}.${feature}`
    if (flagsMap.value.has(key)) {
      return flagsMap.value.get(key)!
    }

    // Opt-out: enabled by default
    return true
  }

  return {
    flagsMap,
    isLoaded,
    loadFlags,
    isFeatureEnabled,
  }
}

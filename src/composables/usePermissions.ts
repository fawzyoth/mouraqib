import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/database'

const SECTION_ACCESS: Record<string, UserRole[]> = {
  dashboard:      ['owner', 'manager', 'agent_confirmation', 'agent_warehouse'],
  clients:        ['owner', 'manager', 'agent_confirmation'],
  shipments:      ['owner', 'manager', 'agent_confirmation', 'agent_warehouse'],
  pickups:        ['owner', 'manager', 'agent_confirmation', 'agent_warehouse'],
  returns:        ['owner', 'manager', 'agent_confirmation', 'agent_warehouse'],
  carriers:       ['owner', 'manager'],
  finance:        ['owner', 'manager'],
  analytics:      ['owner', 'manager'],
  settings:       ['owner', 'manager'],
  administration: ['owner'],
}

export function usePermissions() {
  const authStore = useAuthStore()

  const userRole = computed<UserRole>(() =>
    (authStore.user?.role as UserRole) || 'agent_warehouse'
  )

  const canDelete = computed(() => userRole.value === 'owner')

  const canManageUsers = computed(() =>
    ['owner', 'manager'].includes(userRole.value)
  )

  const canManageSettings = computed(() =>
    ['owner', 'manager'].includes(userRole.value)
  )

  function canAccessSection(section: string): boolean {
    const allowedRoles = SECTION_ACCESS[section]
    if (!allowedRoles) return true
    return allowedRoles.includes(userRole.value)
  }

  return {
    userRole,
    canDelete,
    canManageUsers,
    canManageSettings,
    canAccessSection,
  }
}

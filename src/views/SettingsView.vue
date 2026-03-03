<template>
  <!-- Settings: Company Profile -->
  <CompanyProfile
    v-if="activeSection === 'company-profile'"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @save="saveCompanyProfile"
  />

  <!-- Settings: Users & Roles -->
  <UsersRoles
    v-else-if="activeSection === 'users-roles'"
    :team-members="appStore.teamMembers"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @update-members="updateTeamMembers"
  />

  <!-- Settings: Notifications -->
  <NotificationSettings
    v-else-if="activeSection === 'notifications'"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Settings: Security -->
  <SecuritySettings
    v-else-if="activeSection === 'security'"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Settings: Payment History -->
  <PaymentHistory
    v-else-if="activeSection === 'payment-history'"
    :payments="paymentHistoryData"
    :payment-stats="paymentHistoryStats"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Organization Modal -->
  <OrganizationModal
    :show="showOrganizationModal"
    @close="showOrganizationModal = false"
    @save="saveOrganization"
  />

  <!-- Add Boutique Modal -->
  <AddBoutiqueModal
    :show="showAddBoutiqueModal"
    :carriers="availableCarriers"
    :governorats="gouvernorats"
    @close="showAddBoutiqueModal = false"
    @save="createBoutique"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { deliveryCarriers } from '@/data/carriers-catalog'
import zonesFirst from '@/data/zones-first'

// Feature components
import CompanyProfile from '@/components/features/settings/CompanyProfile.vue'
import UsersRoles from '@/components/features/settings/UsersRoles.vue'
import NotificationSettings from '@/components/features/settings/NotificationSettings.vue'
import SecuritySettings from '@/components/features/settings/SecuritySettings.vue'
import PaymentHistory from '@/components/features/settings/PaymentHistory.vue'

// Modal components
import OrganizationModal from '@/components/modals/OrganizationModal.vue'
import AddBoutiqueModal from '@/components/modals/AddBoutiqueModal.vue'

const route = useRoute()
const appStore = useAppStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

// Payment History — sourced from appStore.payments (loaded by useFinanceData)
const paymentHistoryData = computed(() => appStore.payments)
const paymentHistoryStats = computed(() => {
  const payments = appStore.payments as Array<{ amount: number; status: string }>
  const paid = payments.filter(p => p.status === 'paid')
  const pending = payments.filter(p => p.status === 'pending')
  return {
    totalPaid: paid.reduce((sum, p) => sum + Number(p.amount), 0),
    pending: pending.reduce((sum, p) => sum + Number(p.amount), 0),
    invoiceCount: payments.length,
  }
})

// Organization Modal
const showOrganizationModal = ref(false)

// Add Boutique Modal
const showAddBoutiqueModal = ref(false)

// Available carriers — static catalog of all delivery carriers
const availableCarriers = computed(() => deliveryCarriers)

// Gouvernorats — top-level keys from zones-first geographical data
const gouvernorats = computed(() => Object.keys(zonesFirst).sort())

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function saveCompanyProfile(_data: any) {
  await appStore.orgData.saveProfile(_data)
}

async function updateTeamMembers(members: any[]) {
  const current = appStore.teamMembers
  const currentIds = new Set(current.map((m: any) => m.id))
  const incomingIds = new Set(members.map((m: any) => m.id))

  // Detect added members (id exists in incoming but not in current)
  const added = members.filter((m: any) => !currentIds.has(m.id))
  // Detect removed members (id exists in current but not in incoming)
  const removed = current.filter((m: any) => !incomingIds.has(m.id))
  // Detect edited members (id exists in both, but role/name/email changed)
  const edited = members.filter((m: any) => {
    if (!currentIds.has(m.id)) return false
    const existing = current.find((c: any) => c.id === m.id)
    return existing && (existing.role !== m.role || existing.name !== m.name || existing.email !== m.email)
  })

  for (const member of added) {
    await appStore.orgData.addMember({
      name: member.name,
      email: member.email,
      role: member.role,
    })
  }

  for (const member of removed) {
    await appStore.orgData.removeMember(member.id)
  }

  // For role/name/email changes, re-invite is not applicable — update locally
  // (no dedicated updateMember method exists in the composable)
  for (const member of edited) {
    const idx = appStore.teamMembers.findIndex((m: any) => m.id === member.id)
    if (idx !== -1) {
      Object.assign(appStore.teamMembers[idx], {
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status,
        initials: member.initials,
      })
    }
  }
}

async function saveOrganization(_data: any) {
  const ok = await appStore.orgData.saveProfile(_data)
  if (ok) {
    showOrganizationModal.value = false
  }
}

async function createBoutique(_data: any) {
  const result = await appStore.boutiquesData.create(_data)
  if (result) {
    showAddBoutiqueModal.value = false
  }
}
</script>

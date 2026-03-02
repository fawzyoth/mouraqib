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

// Payment History
const paymentHistoryData = ref<any[]>([])
const paymentHistoryStats = ref({ total: 0, amount: 0, pending: 0 })

// Organization Modal
const showOrganizationModal = ref(false)

// Add Boutique Modal
const showAddBoutiqueModal = ref(false)
const availableCarriers = ref<any[]>([])
const gouvernorats = ref<any[]>([])

// Stubs (will be migrated from DTV)
function saveCompanyProfile(_data: any) { /* stub */ }
function updateTeamMembers(members: any) { /* stub — appStore.teamMembers update */ }
function saveOrganization(_data: any) { /* stub */ }
function createBoutique(_data: any) { /* stub */ }
</script>

<template>
  <!-- Admin: Users -->
  <AdminUsers
    v-if="activeSection === 'admin-users'"
    :admin-users="adminUsers"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @open-charge-modal="openChargeModal"
  />

  <!-- Admin: Billing -->
  <AdminBilling
    v-else-if="activeSection === 'admin-billing'"
    :admin-users="adminUsers"
    :admin-transactions="adminTransactions"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @open-charge-modal="openChargeModal"
  />

  <!-- Admin: Transactions -->
  <AdminTransactions
    v-else-if="activeSection === 'admin-transactions'"
    :admin-transactions="adminTransactions"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Admin: Feature Flags (superadmin only) -->
  <AdminFeatureFlags
    v-else-if="activeSection === 'admin-features'"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Charge Account Modal -->
  <ChargeAccountModal
    :show="showChargeAccountModal"
    :user="selectedUserForCharge"
    :delivery-fees="deliveryFees"
    @close="closeChargeModal"
    @credit="processAccountCredit"
    @debit="processAccountCharge"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

// Feature components
import AdminUsers from '@/components/features/admin/AdminUsers.vue'
import AdminBilling from '@/components/features/admin/AdminBilling.vue'
import AdminTransactions from '@/components/features/admin/AdminTransactions.vue'
import AdminFeatureFlags from '@/components/features/admin/AdminFeatureFlags.vue'

// Modal components
import ChargeAccountModal from '@/components/modals/ChargeAccountModal.vue'

const route = useRoute()
const appStore = useAppStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

const adminUsers = ref<any[]>([])
const adminTransactions = ref<any[]>([])

// Charge Account Modal
const showChargeAccountModal = ref(false)
const selectedUserForCharge = ref<any>(null)
const deliveryFees = ref({ delivered: 0, returned: 0 })

function openChargeModal(user: any) {
  selectedUserForCharge.value = user
  showChargeAccountModal.value = true
}

function closeChargeModal() {
  showChargeAccountModal.value = false
  selectedUserForCharge.value = null
}

// Stubs (will be migrated from DTV)
function processAccountCredit(_data: any) { /* stub */ }
function processAccountCharge(_data: any) { /* stub */ }
</script>

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
import { computed, ref, inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { organizationsService } from '@/services/organizations'
import { transactionsService } from '@/services/transactions'
import { demoAdminUsers, demoAdminTransactions } from '@/data/demo/admin'

// Feature components
import AdminUsers from '@/components/features/admin/AdminUsers.vue'
import AdminBilling from '@/components/features/admin/AdminBilling.vue'
import AdminTransactions from '@/components/features/admin/AdminTransactions.vue'
import AdminFeatureFlags from '@/components/features/admin/AdminFeatureFlags.vue'

// Modal components
import ChargeAccountModal from '@/components/modals/ChargeAccountModal.vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

const adminUsers = ref<any[]>([])
const adminTransactions = ref<any[]>([])

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

async function loadAdminData() {
  if (authStore.isDemoMode) {
    adminUsers.value = demoAdminUsers
    adminTransactions.value = demoAdminTransactions
    deliveryFees.value = { delivered: 400, returned: 250 }
    return
  }

  try {
    // Fetch all organizations with credits and member counts
    const orgs = await organizationsService.getAllOrganizations()

    adminUsers.value = (orgs ?? []).map((org: any) => {
      const credits = Array.isArray(org.credits) ? org.credits[0] : org.credits
      const memberCount = Array.isArray(org.member_count)
        ? (org.member_count[0]?.count ?? 0)
        : 0

      return {
        id: org.id,
        organization_id: org.id,
        name: org.name,
        email: org.email ?? '',
        company: org.name,
        phone: org.phone ?? '',
        shipmentsCount: memberCount,
        balance: credits?.balance ?? 0,
        status: 'active' as const,
        unbilledDelivered: credits?.unbilled_delivered ?? 0,
        unbilledReturned: credits?.unbilled_returned ?? 0,
        deliveredCount: credits?.delivered_credits ?? 0,
        returnedCount: credits?.returned_credits ?? 0,
      }
    })
  } catch (error) {
    console.error('Failed to load admin users:', error)
  }

  try {
    // Fetch recent transactions across all organizations
    const txRows = await transactionsService.getRecentTransactions(100)

    // Build org name lookup from loaded admin users
    const orgNameMap: Record<string, string> = {}
    adminUsers.value.forEach((u: any) => {
      orgNameMap[u.organization_id] = u.company
    })

    adminTransactions.value = (txRows ?? []).map((tx: any) => {
      const orgName = tx.organization?.name ?? orgNameMap[tx.organization_id] ?? 'Inconnu'
      return {
        id: tx.id,
        userId: tx.organization_id,
        userName: orgName,
        company: orgName,
        type: tx.type,
        amount: tx.amount,
        note: tx.note ?? '',
        date: new Date(tx.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        createdBy: tx.created_by ?? 'Système',
      }
    })
  } catch (error) {
    console.error('Failed to load admin transactions:', error)
  }
}

onMounted(loadAdminData)

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

async function processAccountCredit(_data: any) {
  if (!selectedUserForCharge.value || !currentUser.value) return

  const amount =
    _data.purchaseDelivered * deliveryFees.value.delivered +
    _data.purchaseReturned * deliveryFees.value.returned

  try {
    const transaction = await transactionsService.addCredit(
      selectedUserForCharge.value.organization_id,
      currentUser.value.id,
      amount,
      _data.purchaseDelivered,
      _data.purchaseReturned,
      _data.paymentMethod,
      _data.note
    )

    // Update the user's balance in adminUsers
    const userIndex = adminUsers.value.findIndex(
      (u: any) => u.organization_id === selectedUserForCharge.value.organization_id
    )
    if (userIndex !== -1) {
      adminUsers.value[userIndex].balance = (adminUsers.value[userIndex].balance ?? 0) + amount
      adminUsers.value[userIndex].deliveredCount =
        (adminUsers.value[userIndex].deliveredCount ?? 0) + _data.purchaseDelivered
      adminUsers.value[userIndex].returnedCount =
        (adminUsers.value[userIndex].returnedCount ?? 0) + _data.purchaseReturned
    }

    // Append the new transaction
    adminTransactions.value.unshift(transaction)

    closeChargeModal()
  } catch (error) {
    console.error('Failed to process credit:', error)
  }
}

async function processAccountCharge(_data: any) {
  if (!selectedUserForCharge.value || !currentUser.value) return

  const billedDelivered = selectedUserForCharge.value.unbilledDelivered ?? 0
  const billedReturned = selectedUserForCharge.value.unbilledReturned ?? 0
  const amount =
    billedDelivered * deliveryFees.value.delivered +
    billedReturned * deliveryFees.value.returned

  if (amount <= 0) return

  try {
    const transaction = await transactionsService.addDebit(
      selectedUserForCharge.value.organization_id,
      currentUser.value.id,
      amount,
      billedDelivered,
      billedReturned,
      _data.note
    )

    // Update the user's balance in adminUsers (decrease)
    const userIndex = adminUsers.value.findIndex(
      (u: any) => u.organization_id === selectedUserForCharge.value.organization_id
    )
    if (userIndex !== -1) {
      adminUsers.value[userIndex].balance = (adminUsers.value[userIndex].balance ?? 0) - amount
      adminUsers.value[userIndex].unbilledDelivered = 0
      adminUsers.value[userIndex].unbilledReturned = 0
    }

    // Append the new transaction
    adminTransactions.value.unshift(transaction)

    closeChargeModal()
  } catch (error) {
    console.error('Failed to process charge:', error)
  }
}
</script>

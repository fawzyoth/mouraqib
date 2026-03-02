<template>
  <!-- Returns: Active / Recovered / Lost -->
  <ReturnsList
    v-if="activeSection === 'active-returns' || activeSection === 'recovered-returns' || activeSection === 'lost-returns'"
    :mode="activeSection === 'active-returns' ? 'active' : activeSection === 'recovered-returns' ? 'recovered' : 'lost'"
    :section-title="activeSection === 'active-returns' ? 'Retours actifs' : activeSection === 'recovered-returns' ? 'Retours récupérés' : 'Retours perdus'"
    :filtered-returns="filteredReturns"
    :active-returns-stats="activeReturnsStats"
    :is-syncing-returns="isSyncingReturns"
    :carriers="returnCarriers"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @sync-returns="syncReturns"
  />

  <!-- Returns: Value -->
  <ReturnValue
    v-else-if="activeSection === 'return-value'"
    :returns-data="returnsData"
    :carriers-return-stats="carriersReturnStats"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
  />

  <!-- Returns: Reports -->
  <ReturnReports
    v-else-if="activeSection === 'return-reports'"
    :report-period="reportPeriod"
    :report-analytics="reportAnalytics"
    @toggle-submenu="subMenuOpen = !subMenuOpen"
    @update:report-period="reportPeriod = $event"
  />
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

// Feature components
import ReturnsList from '@/components/features/returns/ReturnsList.vue'
import ReturnValue from '@/components/features/returns/ReturnValue.vue'
import ReturnReports from '@/components/features/returns/ReturnReports.vue'

const route = useRoute()
const appStore = useAppStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')
const subMenuOpen = inject<import('vue').Ref<boolean>>('subMenuOpen', ref(false))

// ---------------------------------------------------------------------------
// Section-local state
// ---------------------------------------------------------------------------

// ReturnsList props
const filteredReturns = ref<any[]>([])
const activeReturnsStats = ref({ total: 0, active: 0, recovered: 0, lost: 0 })
const isSyncingReturns = ref(false)
const returnCarriers = ref<any[]>([])

// ReturnValue props
const returnsData = ref<any>({})
const carriersReturnStats = ref<any[]>([])

// ReturnReports props
const reportPeriod = ref('month')
const reportAnalytics = ref<any>({})

// Stubs (will be migrated from DTV)
function syncReturns() { /* stub */ }
</script>

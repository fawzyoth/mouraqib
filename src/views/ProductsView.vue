<template>
  <!-- Products: All Products -->
  <ProductsList
    v-if="activeSection === 'all-products'"
    :products="appStore.products"
    :products-data="appStore.productsData"
    @open-add-product="navigateTo('add-product')"
  />

  <!-- Products: Add Product -->
  <AddProductForm
    v-else-if="activeSection === 'add-product'"
    :products-data="appStore.productsData"
    @submit="navigateTo('all-products')"
    @cancel="navigateTo('all-products')"
  />
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { subSectionRoutes } from '@/composables/useNavigation'

import ProductsList from '@/components/features/products/ProductsList.vue'
import AddProductForm from '@/components/features/products/AddProductForm.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const activeSection = computed(() => (route.meta.subSection as string) || '')

function navigateTo(subSection: string) {
  const routeInfo = subSectionRoutes[subSection]
  if (routeInfo) router.push(routeInfo.path)
}
</script>

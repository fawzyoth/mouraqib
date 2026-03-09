import { ref, type Ref } from 'vue'
import { productsService } from '@/services'
import { useToast } from './useToast'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

export function useProductsData(orgId: Ref<string>) {
    const products = ref<Product[]>([])
    const isLoading = ref(false)
    const toast = useToast()

    async function load() {
        if (!orgId.value) return
        isLoading.value = true
        try {
            products.value = await productsService.getAll(orgId.value)
        } catch (e: any) {
            toast.error('Erreur chargement produits: ' + (e.message || e))
        } finally {
            isLoading.value = false
        }
    }

    async function create(name: string, price: number) {
        if (!orgId.value) return null
        try {
            const newProduct = await productsService.create({
                organization_id: orgId.value,
                name,
                price
            })
            products.value.push(newProduct)
            // Sort again by name to keep the list ordered
            products.value.sort((a, b) => a.name.localeCompare(b.name))
            return newProduct
        } catch (e: any) {
            toast.error('Erreur création produit: ' + (e.message || e))
            return null
        }
    }

    return { products, isLoading, load, create }
}
